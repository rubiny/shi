-- ==========================================
-- RPC Functions for Army, Games, Staking
-- ==========================================

-- Credit user balance
CREATE OR REPLACE FUNCTION public.credit_user_balance(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_balances
  SET shit_balance = shit_balance + p_amount,
      total_earned = total_earned + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Debit user balance
CREATE OR REPLACE FUNCTION public.debit_user_balance(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_balances
  SET shit_balance = shit_balance - p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id AND shit_balance >= p_amount;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add XP to soldier and handle level ups
CREATE OR REPLACE FUNCTION public.add_soldier_xp(p_soldier_id UUID, p_xp INTEGER)
RETURNS VOID AS $$
DECLARE
  v_current_xp INTEGER;
  v_current_level INTEGER;
  v_xp_per_level INTEGER := 100;
  v_new_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  SELECT xp, level INTO v_current_xp, v_current_level
  FROM public.army_soldiers WHERE id = p_soldier_id;

  v_new_xp := v_current_xp + p_xp;
  v_new_level := v_current_level;

  -- Level up loop
  WHILE v_new_xp >= v_xp_per_level * v_new_level LOOP
    v_new_xp := v_new_xp - (v_xp_per_level * v_new_level);
    v_new_level := v_new_level + 1;
  END LOOP;

  UPDATE public.army_soldiers
  SET xp = v_new_xp,
      level = v_new_level,
      power = 10 + (v_new_level - 1) * 5
  WHERE id = p_soldier_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user squad power
CREATE OR REPLACE FUNCTION public.get_squad_power(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_power INTEGER;
BEGIN
  SELECT COALESCE(SUM(power), 0) INTO v_power
  FROM public.army_soldiers
  WHERE user_id = p_user_id AND is_equipped = TRUE;

  RETURN v_power;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
