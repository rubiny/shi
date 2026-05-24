-- ==========================================
-- RPC Functions for Edge Functions
-- ==========================================

-- Claim offer reward - atomic transaction
CREATE OR REPLACE FUNCTION public.claim_offer_reward(
  p_user_offer_id UUID,
  p_user_id UUID,
  p_points INTEGER,
  p_shit DECIMAL,
  p_offer_title TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark user offer as claimed
  UPDATE public.user_offers
  SET status = 'claimed', claimed_at = NOW()
  WHERE id = p_user_offer_id AND user_id = p_user_id;

  -- Add points to balance
  UPDATE public.user_balances
  SET 
    points = points + p_points,
    total_earned = total_earned + p_shit,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Create transaction record
  INSERT INTO public.transactions (
    user_id, type, amount, description, status
  ) VALUES (
    p_user_id, 'offer', p_shit, p_offer_title, 'completed'
  );

  -- Add battle pass XP
  UPDATE public.user_battle_pass
  SET xp = xp + 50, updated_at = NOW() -- 50 XP per offer
  WHERE user_id = p_user_id;

  -- Check quest progress
  UPDATE public.user_quests
  SET progress = progress + 1
  WHERE user_id = p_user_id
    AND quest_id IN (
      SELECT id FROM public.quests 
      WHERE category = 'daily' AND title ILIKE '%offer%'
    )
    AND is_completed = FALSE;
END;
$$;

-- Start offer with boost check
CREATE OR REPLACE FUNCTION public.start_offer(
  p_offer_id UUID,
  p_user_id UUID
)
RETURNS TABLE(
  user_offer_id UUID,
  reward INTEGER,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offer_reward INTEGER;
  v_boost_multiplier INTEGER := 1;
  v_is_general BOOLEAN;
  v_final_reward INTEGER;
  v_existing_id UUID;
BEGIN
  -- Check if already started
  SELECT id INTO v_existing_id
  FROM public.user_offers
  WHERE user_id = p_user_id AND offer_id = p_offer_id
    AND status IN ('started', 'in_progress', 'completed');
  
  IF v_existing_id IS NOT NULL THEN
    RETURN QUERY SELECT v_existing_id, 0::INTEGER, 'already_started'::TEXT;
    RETURN;
  END IF;

  -- Get offer reward
  SELECT reward INTO v_offer_reward
  FROM public.offers
  WHERE id = p_offer_id AND is_active = TRUE;
  
  IF v_offer_reward IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, 0::INTEGER, 'offer_not_found'::TEXT;
    RETURN;
  END IF;

  -- Check for active boost
  SELECT multiplier INTO v_boost_multiplier
  FROM public.offer_boosts
  WHERE offer_id = p_offer_id 
    AND is_active = TRUE 
    AND expires_at > NOW()
  ORDER BY multiplier DESC
  LIMIT 1;

  IF v_boost_multiplier IS NULL THEN
    v_boost_multiplier := 1;
  END IF;

  -- Check General status
  SELECT is_general INTO v_is_general
  FROM public.profiles
  WHERE id = p_user_id
    AND (general_expires_at IS NULL OR general_expires_at > NOW());

  IF v_is_general IS NULL THEN
    v_is_general := FALSE;
  END IF;

  -- Calculate final reward
  v_final_reward := v_offer_reward * v_boost_multiplier;
  IF v_is_general THEN
    v_final_reward := FLOOR(v_final_reward * 1.25)::INTEGER; -- 25% General boost
  END IF;

  -- Create user offer
  RETURN QUERY
  INSERT INTO public.user_offers (user_id, offer_id, status, reward)
  VALUES (p_user_id, p_offer_id, 'started', v_final_reward)
  RETURNING id, reward, 'started'::TEXT;
END;
$$;

-- Claim daily bonus
CREATE OR REPLACE FUNCTION public.claim_daily_bonus(
  p_user_id UUID
)
RETURNS TABLE(
  shit_earned DECIMAL,
  new_streak INTEGER,
  success BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_claim TIMESTAMPTZ;
  v_streak INTEGER;
  v_base INTEGER := 150;
  v_bonus INTEGER;
  v_hours_since_last INTEGER;
BEGIN
  -- Get current balance info
  SELECT last_daily_claim, daily_streak 
  INTO v_last_claim, v_streak
  FROM public.user_balances
  WHERE user_id = p_user_id;

  -- Check if already claimed today
  IF v_last_claim IS NOT NULL AND v_last_claim > CURRENT_DATE THEN
    RETURN QUERY SELECT 0::DECIMAL, v_streak, FALSE;
    RETURN;
  END IF;

  -- Calculate hours since last claim for streak
  IF v_last_claim IS NOT NULL THEN
    v_hours_since_last := EXTRACT(EPOCH FROM (NOW() - v_last_claim)) / 3600;
    IF v_hours_since_last > 48 THEN
      -- Reset streak if > 48 hours
      v_streak := 0;
    END IF;
  ELSE
    v_streak := 0;
  END IF;

  -- Calculate bonus
  v_streak := v_streak + 1;
  v_bonus := v_base + (v_streak * 20); -- +20 per streak day
  IF v_streak > 7 THEN
    v_bonus := v_bonus + 50; -- Weekly bonus
  END IF;

  -- Update balance
  UPDATE public.user_balances
  SET 
    shit_balance = shit_balance + v_bonus,
    total_earned = total_earned + v_bonus,
    daily_streak = v_streak,
    last_daily_claim = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Create transaction
  INSERT INTO public.transactions (
    user_id, type, amount, description, status
  ) VALUES (
    p_user_id, 'daily_bonus', v_bonus, 
    format('Daily bonus (Streak: %s days)', v_streak), 'completed'
  );

  -- Add BP XP
  UPDATE public.user_battle_pass
  SET xp = xp + 25
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT v_bonus::DECIMAL, v_streak, TRUE;
END;
$$;

-- Process staking rewards
CREATE OR REPLACE FUNCTION public.calculate_staking_rewards(
  p_position_id UUID
)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_amount DECIMAL;
  v_apy INTEGER;
  v_started_at TIMESTAMPTZ;
  v_days INTEGER;
  v_rewards DECIMAL;
BEGIN
  SELECT amount, apy, started_at 
  INTO v_amount, v_apy, v_started_at
  FROM public.staking_positions
  WHERE id = p_position_id AND is_unstaked = FALSE;

  IF v_amount IS NULL THEN
    RETURN 0;
  END IF;

  -- Calculate days staked
  v_days := EXTRACT(DAY FROM (NOW() - v_started_at));
  IF v_days < 1 THEN
    RETURN 0;
  END IF;

  -- Calculate rewards: (amount * apy * days) / (365 * 100)
  v_rewards := (v_amount * v_apy * v_days) / (365 * 100);
  
  -- Update position
  UPDATE public.staking_positions
  SET rewards = v_rewards
  WHERE id = p_position_id;

  RETURN v_rewards;
END;
$$;

-- Get leaderboard
CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_period TEXT DEFAULT 'all_time',
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE(
  rank BIGINT,
  user_id UUID,
  wallet_address TEXT,
  username TEXT,
  earned DECIMAL,
  referrals INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_period = 'weekly' THEN
    RETURN QUERY
    SELECT 
      ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(t.amount), 0) DESC) as rank,
      p.id as user_id,
      p.wallet_address,
      pr.username,
      COALESCE(SUM(t.amount), 0)::DECIMAL as earned,
      (SELECT COUNT(*) FROM public.referrals r WHERE r.referrer_id = p.id)::INTEGER as referrals
    FROM public.profiles p
    LEFT JOIN public.transactions t ON t.user_id = p.id 
      AND t.created_at > NOW() - INTERVAL '7 days'
      AND t.type = 'offer'
    LEFT JOIN public.profiles pr ON pr.id = p.id
    GROUP BY p.id, p.wallet_address, pr.username
    ORDER BY earned DESC
    LIMIT p_limit;
  ELSE
    RETURN QUERY
    SELECT 
      ROW_NUMBER() OVER (ORDER BY b.total_earned DESC) as rank,
      p.id as user_id,
      p.wallet_address,
      pr.username,
      b.total_earned::DECIMAL as earned,
      (SELECT COUNT(*) FROM public.referrals r WHERE r.referrer_id = p.id)::INTEGER as referrals
    FROM public.user_balances b
    JOIN public.profiles p ON p.id = b.user_id
    LEFT JOIN public.profiles pr ON pr.id = p.id
    ORDER BY b.total_earned DESC
    LIMIT p_limit;
  END IF;
END;
$$;

-- Check KYC requirement for withdrawal
CREATE OR REPLACE FUNCTION public.check_kyc_requirement(
  p_user_id UUID,
  p_amount DECIMAL
)
RETURNS TABLE(
  allowed BOOLEAN,
  required BOOLEAN,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_kyc_status TEXT;
  v_balance DECIMAL;
  v_threshold DECIMAL := 100; -- $100 USD equivalent
BEGIN
  -- Get KYC status
  SELECT status::TEXT INTO v_kyc_status
  FROM public.kyc_verifications
  WHERE user_id = p_user_id;

  IF v_kyc_status IS NULL THEN
    v_kyc_status := 'none';
  END IF;

  -- Get current balance (for threshold check)
  SELECT shit_balance INTO v_balance
  FROM public.user_balances
  WHERE user_id = p_user_id;

  -- Assume $SHIT = $0.01 for threshold calculation
  IF v_balance * 0.01 > v_threshold AND v_kyc_status != 'verified' THEN
    RETURN QUERY SELECT FALSE, TRUE, v_kyc_status;
    RETURN;
  END IF;

  -- If KYC required but not verified
  IF v_kyc_status != 'verified' AND p_amount * 0.01 > v_threshold THEN
    RETURN QUERY SELECT FALSE, TRUE, v_kyc_status;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, FALSE, v_kyc_status;
END;
$$;

-- Claim quest reward
CREATE OR REPLACE FUNCTION public.claim_quest_reward(
  p_user_id UUID,
  p_quest_id UUID,
  p_reward DECIMAL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update balance
  UPDATE public.user_balances
  SET 
    shit_balance = shit_balance + p_reward,
    total_earned = total_earned + p_reward,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Create transaction record
  INSERT INTO public.transactions (
    user_id, type, amount, description, status
  ) VALUES (
    p_user_id, 'quest', p_reward, 'Quest reward', 'completed'
  );

  -- Add Battle Pass XP
  UPDATE public.user_battle_pass
  SET xp = xp + 100 -- 100 XP per quest
  WHERE user_id = p_user_id;
END;
$$;
