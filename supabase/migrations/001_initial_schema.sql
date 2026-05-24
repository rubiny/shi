-- ==========================================
-- SHIT.ARMY - Supabase Initial Schema
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- PROFILES (extends auth.users)
-- ==========================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  wallet_address TEXT UNIQUE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  country TEXT,
  timezone TEXT DEFAULT 'UTC',
  is_general BOOLEAN DEFAULT FALSE,
  general_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_username CHECK (username ~ '^[a-zA-Z0-9_-]{3,30}$')
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- USER BALANCES
-- ==========================================
CREATE TABLE public.user_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  shit_balance DECIMAL(18, 8) DEFAULT 0,
  points INTEGER DEFAULT 0,
  total_earned DECIMAL(18, 8) DEFAULT 0,
  daily_streak INTEGER DEFAULT 0,
  last_daily_claim TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own balance" ON public.user_balances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Only system can modify balances" ON public.user_balances
  FOR ALL USING (FALSE) WITH CHECK (FALSE); -- Modified by edge functions

-- ==========================================
-- KYC VERIFICATION
-- ==========================================
CREATE TYPE kyc_status AS ENUM ('none', 'pending', 'verified', 'rejected');
CREATE TYPE id_type AS ENUM ('passport', 'id_card', 'drivers_license');

CREATE TABLE public.kyc_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  status kyc_status DEFAULT 'none',
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  country TEXT,
  id_type id_type,
  id_number TEXT,
  id_front_url TEXT,
  id_back_url TEXT,
  selfie_url TEXT,
  submitted_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  provider_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own KYC" ON public.kyc_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own KYC submission" ON public.kyc_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- ==========================================
-- OFFERS
-- ==========================================
CREATE TYPE offer_category AS ENUM ('survey', 'app', 'game', 'video', 'shopping', 'other');
CREATE TYPE offer_provider AS ENUM ('offertoro', 'adgem', 'adscend', 'custom');

CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '⚡',
  reward INTEGER NOT NULL, -- points
  category offer_category,
  time_estimate TEXT, -- "3 min", "5 min"
  is_exclusive BOOLEAN DEFAULT FALSE,
  provider offer_provider NOT NULL,
  provider_data JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active offers are viewable by everyone" ON public.offers
  FOR SELECT USING (is_active = TRUE);

-- ==========================================
-- USER OFFERS (tracking progress)
-- ==========================================
CREATE TYPE user_offer_status AS ENUM ('started', 'in_progress', 'completed', 'claimed', 'expired');

CREATE TABLE public.user_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  offer_id UUID REFERENCES public.offers(id) NOT NULL,
  status user_offer_status DEFAULT 'started',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  reward INTEGER NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  provider_transaction_id TEXT,
  UNIQUE(user_id, offer_id, status)
);

ALTER TABLE public.user_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own offers" ON public.user_offers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can start offers" ON public.user_offers
  FOR INSERT WITH CHECK (auth.uid() = user_id AND status = 'started');

-- ==========================================
-- OFFER BOOSTS (2x, 3x events)
-- ==========================================
CREATE TABLE public.offer_boosts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID REFERENCES public.offers(id) NOT NULL,
  multiplier INTEGER NOT NULL CHECK (multiplier IN (2, 3)),
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

ALTER TABLE public.offer_boosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active boosts are viewable by everyone" ON public.offer_boosts
  FOR SELECT USING (is_active = TRUE AND expires_at > NOW());

-- ==========================================
-- QUESTS
-- ==========================================
CREATE TYPE quest_category AS ENUM ('daily', 'weekly', 'milestone');
CREATE TYPE reset_period AS ENUM ('never', 'daily', 'weekly', 'monthly');

CREATE TABLE public.quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category quest_category NOT NULL,
  max_progress INTEGER NOT NULL,
  reward INTEGER NOT NULL, -- $SHIT
  icon TEXT DEFAULT '🎯',
  is_active BOOLEAN DEFAULT TRUE,
  reset_period reset_period DEFAULT 'never',
  requirements JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active quests are viewable by everyone" ON public.quests
  FOR SELECT USING (is_active = TRUE);

-- ==========================================
-- USER QUESTS
-- ==========================================
CREATE TABLE public.user_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  quest_id UUID REFERENCES public.quests(id) NOT NULL,
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMPTZ,
  last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quest_id)
);

ALTER TABLE public.user_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quests" ON public.user_quests
  FOR SELECT USING (auth.uid() = user_id);

-- ==========================================
-- BATTLE PASS SEASONS
-- ==========================================
CREATE TABLE public.battle_pass_seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  xp_per_tier INTEGER DEFAULT 500,
  max_tier INTEGER DEFAULT 20
);

ALTER TABLE public.battle_pass_seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active seasons are viewable by everyone" ON public.battle_pass_seasons
  FOR SELECT USING (is_active = TRUE);

-- ==========================================
-- BATTLE PASS TIERS
-- ==========================================
CREATE TABLE public.battle_pass_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_id UUID REFERENCES public.battle_pass_seasons(id) NOT NULL,
  tier INTEGER NOT NULL,
  free_reward INTEGER NOT NULL,
  premium_reward INTEGER NOT NULL,
  free_extra TEXT,
  premium_extra TEXT,
  UNIQUE(season_id, tier)
);

ALTER TABLE public.battle_pass_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tiers are viewable by everyone" ON public.battle_pass_tiers
  FOR SELECT USING (TRUE);

-- ==========================================
-- USER BATTLE PASS
-- ==========================================
CREATE TABLE public.user_battle_pass (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  season_id UUID REFERENCES public.battle_pass_seasons(id) NOT NULL,
  xp INTEGER DEFAULT 0,
  claimed_tiers INTEGER[] DEFAULT '{}',
  is_premium BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_battle_pass ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own battle pass" ON public.user_battle_pass
  FOR SELECT USING (auth.uid() = user_id);

-- ==========================================
-- TRANSACTIONS
-- ==========================================
CREATE TYPE transaction_type AS ENUM (
  'offer', 'withdrawal', 'stake', 'unstake', 'stake_reward',
  'quest', 'airdrop', 'referral', 'referral_bonus',
  'nft_purchase', 'nft_sale', 'merch', 'daily_bonus', 'battle_pass'
);

CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type transaction_type NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  description TEXT,
  status transaction_status DEFAULT 'completed',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_transactions_user_created ON public.transactions(user_id, created_at DESC);

-- ==========================================
-- REFERRALS
-- ==========================================
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES auth.users(id) NOT NULL,
  referred_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  code TEXT UNIQUE NOT NULL,
  commission DECIMAL(18, 8) DEFAULT 0,
  total_earned DECIMAL(18, 8) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- ==========================================
-- WITHDRAWAL REQUESTS
-- ==========================================
CREATE TYPE withdrawal_status AS ENUM (
  'pending', 'kyc_required', 'processing', 'completed', 'failed', 'rejected'
);

CREATE TABLE public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  fee DECIMAL(18, 8) NOT NULL,
  net_amount DECIMAL(18, 8) NOT NULL,
  network TEXT NOT NULL, -- 'base', 'eth', 'polygon'
  address TEXT NOT NULL,
  status withdrawal_status DEFAULT 'pending',
  tx_hash TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  rejection_reason TEXT
);

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own withdrawals" ON public.withdrawal_requests
  FOR SELECT USING (auth.uid() = user_id);

-- ==========================================
-- STAKING POSITIONS
-- ==========================================
CREATE TABLE public.staking_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  lock_days INTEGER NOT NULL,
  apy INTEGER NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  unlocks_at TIMESTAMPTZ NOT NULL,
  is_unstaked BOOLEAN DEFAULT FALSE,
  unstaked_at TIMESTAMPTZ,
  rewards DECIMAL(18, 8) DEFAULT 0,
  claimed_rewards DECIMAL(18, 8) DEFAULT 0
);

ALTER TABLE public.staking_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own staking" ON public.staking_positions
  FOR SELECT USING (auth.uid() = user_id);

-- ==========================================
-- AUDIT LOG
-- ==========================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only admin/service role can access
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No public access" ON public.audit_logs FOR ALL USING (FALSE);

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, wallet_address)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'wallet_address');
  
  INSERT INTO public.user_balances (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.kyc_verifications (user_id)
  VALUES (NEW.id);
  
  -- Get active season
  INSERT INTO public.user_battle_pass (user_id, season_id)
  SELECT NEW.id, id FROM public.battle_pass_seasons WHERE is_active = TRUE LIMIT 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER user_battle_pass_updated_at
  BEFORE UPDATE ON public.user_battle_pass
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
