-- ==========================================
-- REFERRAL SYSTEM ENHANCEMENTS
-- Multi-level referral with multiple income streams
-- ==========================================

-- Type of referral earning
CREATE TYPE referral_earning_type AS ENUM (
  'offer',           -- % from offers completed by referred
  'merch',           -- % from merch purchases
  'nft_sale',        -- % from NFT sales on marketplace
  'staking',         -- % from staking rewards
  'general_bonus'    -- bonus when referred buys General
);

-- Referral earnings tracking table
CREATE TABLE public.referral_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES auth.users(id) NOT NULL,
  referred_id UUID REFERENCES auth.users(id) NOT NULL,
  earning_type referral_earning_type NOT NULL,
  source_amount DECIMAL(18, 8) NOT NULL,      -- Original transaction amount
  commission_amount DECIMAL(18, 8) NOT NULL,  -- Commission earned
  commission_percent DECIMAL(5, 2) NOT NULL,  -- % rate used (e.g., 5.00)
  source_transaction_id UUID REFERENCES public.transactions(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.referral_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral earnings" ON public.referral_earnings
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "System can insert referral earnings" ON public.referral_earnings
  FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_referral_earnings_referrer ON public.referral_earnings(referrer_id);
CREATE INDEX idx_referral_earnings_referred ON public.referral_earnings(referred_id);
CREATE INDEX idx_referral_earnings_type ON public.referral_earnings(earning_type);
CREATE INDEX idx_referral_earnings_created ON public.referral_earnings(created_at DESC);

-- ==========================================
-- REFERRAL COMMISSION TIERS
-- ==========================================
CREATE TABLE public.referral_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  min_referrals INTEGER NOT NULL DEFAULT 0,
  min_earnings DECIMAL(18, 8) NOT NULL DEFAULT 0,
  offer_commission DECIMAL(5, 2) DEFAULT 5.00,      -- 5% from offers
  merch_commission DECIMAL(5, 2) DEFAULT 3.00,      -- 3% from merch
  nft_commission DECIMAL(5, 2) DEFAULT 2.00,        -- 2% from NFT
  staking_commission DECIMAL(5, 2) DEFAULT 1.00,  -- 1% from staking
  general_bonus DECIMAL(18, 8) DEFAULT 500,         -- 500 SHIT bonus
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default tiers
INSERT INTO public.referral_tiers (name, min_referrals, min_earnings, offer_commission, merch_commission, nft_commission, staking_commission, general_bonus) VALUES
  ('Recruit', 0, 0, 5.00, 3.00, 2.00, 1.00, 500),
  ('Sergeant', 5, 1000, 7.00, 4.00, 3.00, 1.50, 750),
  ('Lieutenant', 15, 5000, 10.00, 5.00, 4.00, 2.00, 1000),
  ('Commander', 50, 25000, 15.00, 7.00, 5.00, 3.00, 1500),
  ('General', 100, 100000, 20.00, 10.00, 7.00, 5.00, 2500);

-- ==========================================
-- REFERRAL STATS (Materialized view for performance)
-- ==========================================
CREATE TABLE public.referral_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  total_referrals INTEGER DEFAULT 0,
  active_referrals INTEGER DEFAULT 0,  -- Referrals who made at least 1 offer
  total_earnings DECIMAL(18, 8) DEFAULT 0,
  offer_earnings DECIMAL(18, 8) DEFAULT 0,
  merch_earnings DECIMAL(18, 8) DEFAULT 0,
  nft_earnings DECIMAL(18, 8) DEFAULT 0,
  staking_earnings DECIMAL(18, 8) DEFAULT 0,
  general_bonuses DECIMAL(18, 8) DEFAULT 0,
  current_tier TEXT DEFAULT 'Recruit',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.referral_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral stats" ON public.referral_stats
  FOR SELECT USING (auth.uid() = user_id);

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Calculate referral commission for a transaction
CREATE OR REPLACE FUNCTION public.calculate_referral_commission(
  p_referred_id UUID,
  p_amount DECIMAL,
  p_type referral_earning_type,
  p_transaction_id UUID,
  p_description TEXT DEFAULT NULL
)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referrer_id UUID;
  v_tier RECORD;
  v_commission_percent DECIMAL(5, 2);
  v_commission_amount DECIMAL(18, 8);
BEGIN
  -- Find referrer
  SELECT referrer_id INTO v_referrer_id
  FROM public.referrals
  WHERE referred_id = p_referred_id AND is_active = TRUE;
  
  IF v_referrer_id IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Get referrer's tier
  SELECT rt.* INTO v_tier
  FROM public.referral_stats rs
  JOIN public.referral_tiers rt ON rt.name = rs.current_tier
  WHERE rs.user_id = v_referrer_id;
  
  IF v_tier IS NULL THEN
    -- Default to Recruit tier
    SELECT * INTO v_tier FROM public.referral_tiers WHERE name = 'Recruit';
  END IF;
  
  -- Determine commission % based on type
  v_commission_percent := CASE p_type
    WHEN 'offer' THEN v_tier.offer_commission
    WHEN 'merch' THEN v_tier.merch_commission
    WHEN 'nft_sale' THEN v_tier.nft_commission
    WHEN 'staking' THEN v_tier.staking_commission
    ELSE 0
  END;
  
  v_commission_amount := (p_amount * v_commission_percent) / 100;
  
  -- Record the earning
  IF v_commission_amount > 0 THEN
    INSERT INTO public.referral_earnings (
      referrer_id, referred_id, earning_type, source_amount,
      commission_amount, commission_percent, source_transaction_id, description
    ) VALUES (
      v_referrer_id, p_referred_id, p_type, p_amount,
      v_commission_amount, v_commission_percent, p_transaction_id, p_description
    );
    
    -- Update referrer's balance
    UPDATE public.user_balances
    SET 
      shit_balance = shit_balance + v_commission_amount,
      total_earned = total_earned + v_commission_amount,
      updated_at = NOW()
    WHERE user_id = v_referrer_id;
    
    -- Update referral stats
    UPDATE public.referral_stats
    SET 
      total_earnings = total_earnings + v_commission_amount,
      offer_earnings = CASE WHEN p_type = 'offer' THEN offer_earnings + v_commission_amount ELSE offer_earnings END,
      merch_earnings = CASE WHEN p_type = 'merch' THEN merch_earnings + v_commission_amount ELSE merch_earnings END,
      nft_earnings = CASE WHEN p_type = 'nft_sale' THEN nft_earnings + v_commission_amount ELSE nft_earnings END,
      staking_earnings = CASE WHEN p_type = 'staking' THEN staking_earnings + v_commission_amount ELSE staking_earnings END,
      updated_at = NOW()
    WHERE user_id = v_referrer_id;
    
    -- Create transaction record for referrer
    INSERT INTO public.transactions (
      user_id, type, amount, description, status
    ) VALUES (
      v_referrer_id, 'referral_bonus', v_commission_amount,
      COALESCE(p_description, 'Referral commission: ' || p_type::TEXT),
      'completed'
    );
  END IF;
  
  RETURN v_commission_amount;
END;
$$;

-- Update user's referral tier
CREATE OR REPLACE FUNCTION public.update_referral_tier(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats RECORD;
  v_new_tier TEXT;
BEGIN
  -- Get current stats
  SELECT * INTO v_stats
  FROM public.referral_stats
  WHERE user_id = p_user_id;
  
  IF v_stats IS NULL THEN
    RETURN 'Recruit';
  END IF;
  
  -- Determine appropriate tier
  SELECT name INTO v_new_tier
  FROM public.referral_tiers
  WHERE is_active = TRUE
    AND min_referrals <= v_stats.total_referrals
    AND min_earnings <= v_stats.total_earnings
  ORDER BY min_referrals DESC, min_earnings DESC
  LIMIT 1;
  
  IF v_new_tier IS NULL THEN
    v_new_tier := 'Recruit';
  END IF;
  
  -- Update if tier changed
  IF v_new_tier != v_stats.current_tier THEN
    UPDATE public.referral_stats
    SET current_tier = v_new_tier, updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
  
  RETURN v_new_tier;
END;
$$;

-- Get referral leaderboard
CREATE OR REPLACE FUNCTION public.get_referral_leaderboard(p_limit INTEGER DEFAULT 100)
RETURNS TABLE (
  rank INTEGER,
  user_id UUID,
  username TEXT,
  wallet_address TEXT,
  tier TEXT,
  total_referrals INTEGER,
  total_earnings DECIMAL,
  referral_code TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH ranked AS (
    SELECT 
      rs.user_id,
      COALESCE(p.username, 'Anonymous') as username,
      p.wallet_address,
      rs.current_tier as tier,
      rs.total_referrals,
      rs.total_earnings,
      r.code as referral_code,
      RANK() OVER (ORDER BY rs.total_earnings DESC) as rank_num
    FROM public.referral_stats rs
    LEFT JOIN public.profiles p ON p.id = rs.user_id
    LEFT JOIN public.referrals r ON r.referrer_id = rs.user_id
    WHERE rs.total_referrals > 0
  )
  SELECT 
    ranked.rank_num::INTEGER,
    ranked.user_id,
    ranked.username,
    ranked.wallet_address,
    ranked.tier,
    ranked.total_referrals,
    ranked.total_earnings,
    ranked.referral_code
  FROM ranked
  WHERE ranked.rank_num <= p_limit
  ORDER BY ranked.rank_num;
END;
$$;

-- Initialize referral stats for new user
CREATE OR REPLACE FUNCTION public.handle_new_user_referral()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.referral_stats (user_id, current_tier)
  VALUES (NEW.id, 'Recruit')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to create referral stats
CREATE TRIGGER on_auth_user_created_referral
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_referral();
