-- Failed postback retry queue
CREATE TABLE IF NOT EXISTS failed_postbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  payload JSONB NOT NULL,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_failed_postbacks_pending ON failed_postbacks (resolved, next_retry_at) WHERE resolved = false;

-- Admin alerts for critical issues
CREATE TABLE IF NOT EXISTS admin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  details TEXT,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_admin_alerts_unacked ON admin_alerts (acknowledged, created_at) WHERE acknowledged = false;

-- Account recovery codes
CREATE TABLE IF NOT EXISTS recovery_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  code_hash TEXT NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + interval '30 days'
);

CREATE INDEX idx_recovery_codes_user ON recovery_codes (user_id, used) WHERE used = false;

-- Withdrawal idempotency
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  idempotency_key TEXT UNIQUE NOT NULL,
  amount NUMERIC NOT NULL,
  network TEXT NOT NULL,
  address TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_withdrawal_idempotency ON withdrawal_requests (idempotency_key);
CREATE INDEX idx_withdrawal_user ON withdrawal_requests (user_id, status);

-- RPC: Safe withdrawal with balance check
CREATE OR REPLACE FUNCTION submit_withdrawal(
  p_user_id UUID,
  p_amount NUMERIC,
  p_network TEXT,
  p_address TEXT,
  p_idempotency_key TEXT
) RETURNS JSONB AS $$
DECLARE
  v_balance NUMERIC;
  v_existing UUID;
BEGIN
  -- Check idempotency
  SELECT id INTO v_existing FROM withdrawal_requests WHERE idempotency_key = p_idempotency_key;
  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'duplicate_request');
  END IF;

  -- Lock user row and check balance
  SELECT shit_balance INTO v_balance FROM profiles WHERE id = p_user_id FOR UPDATE;

  IF v_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'user_not_found');
  END IF;

  IF v_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_balance', 'balance', v_balance);
  END IF;

  -- Deduct balance
  UPDATE profiles SET shit_balance = shit_balance - p_amount WHERE id = p_user_id;

  -- Create withdrawal record
  INSERT INTO withdrawal_requests (user_id, idempotency_key, amount, network, address, status)
  VALUES (p_user_id, p_idempotency_key, p_amount, p_network, p_address, 'pending');

  RETURN jsonb_build_object('success', true, 'new_balance', v_balance - p_amount);
END;
$$ LANGUAGE plpgsql;
