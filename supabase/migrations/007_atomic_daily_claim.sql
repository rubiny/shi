-- Atomic daily claim RPC to prevent race conditions
CREATE OR REPLACE FUNCTION claim_daily_bonus(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_streak INTEGER;
  v_last_claim TIMESTAMPTZ;
  v_reward INTEGER;
  v_new_streak INTEGER;
  v_hours_since NUMERIC;
  v_rewards INTEGER[] := ARRAY[50, 75, 100, 125, 150, 200, 500];
  v_reward_index INTEGER;
BEGIN
  -- Lock user row to prevent concurrent claims
  SELECT daily_streak, last_daily_claim
  INTO v_streak, v_last_claim
  FROM user_balances
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_streak IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'user_not_found');
  END IF;

  -- Check if already claimed today
  IF v_last_claim IS NOT NULL AND v_last_claim::date = CURRENT_DATE THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_claimed');
  END IF;

  -- Check if streak is broken (>48h since last claim)
  IF v_last_claim IS NOT NULL THEN
    v_hours_since := EXTRACT(EPOCH FROM (now() - v_last_claim)) / 3600;
    IF v_hours_since > 48 THEN
      v_streak := 0;
    END IF;
  END IF;

  v_new_streak := COALESCE(v_streak, 0) + 1;
  v_reward_index := LEAST(v_new_streak, array_length(v_rewards, 1));
  v_reward := v_rewards[v_reward_index];

  -- Update streak, last claim, and credit balance atomically
  UPDATE user_balances SET
    daily_streak = v_new_streak,
    last_daily_claim = now(),
    shit_balance = shit_balance + v_reward,
    total_earned = total_earned + v_reward
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'reward', v_reward,
    'streak', v_new_streak,
    'next_reward', v_rewards[LEAST(v_new_streak + 1, array_length(v_rewards, 1))]
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
