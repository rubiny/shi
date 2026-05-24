-- ==========================================
-- SHIT.ARMY - Army, Market, Guilds, Memes, Games, Events
-- ==========================================

-- ==========================================
-- ARMY SOLDIERS
-- ==========================================
CREATE TYPE soldier_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic');

CREATE TABLE public.army_soldiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  rarity soldier_rarity NOT NULL DEFAULT 'common',
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  power INTEGER DEFAULT 10,
  skill TEXT,
  is_equipped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.army_soldiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own soldiers" ON public.army_soldiers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own soldiers" ON public.army_soldiers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_army_soldiers_user ON public.army_soldiers(user_id);

-- ==========================================
-- ARMY MISSIONS (active raids)
-- ==========================================
CREATE TYPE mission_status AS ENUM ('in_progress', 'completed', 'claimed', 'failed');

CREATE TABLE public.army_missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  soldier_id UUID REFERENCES public.army_soldiers(id) NOT NULL,
  mission_type TEXT NOT NULL,
  status mission_status DEFAULT 'in_progress',
  base_reward INTEGER NOT NULL,
  actual_reward INTEGER,
  is_jackpot BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  claimed_at TIMESTAMPTZ
);

ALTER TABLE public.army_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own missions" ON public.army_missions
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_army_missions_user ON public.army_missions(user_id, status);

-- ==========================================
-- MARKET LISTINGS
-- ==========================================
CREATE TYPE listing_category AS ENUM ('soldier', 'boost', 'title', 'cosmetic');
CREATE TYPE listing_status AS ENUM ('active', 'sold', 'cancelled');

CREATE TABLE public.market_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES auth.users(id) NOT NULL,
  buyer_id UUID REFERENCES auth.users(id),
  category listing_category NOT NULL,
  item_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  fee INTEGER NOT NULL DEFAULT 0,
  status listing_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sold_at TIMESTAMPTZ
);

ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active listings visible to all" ON public.market_listings
  FOR SELECT USING (status = 'active' OR seller_id = auth.uid() OR buyer_id = auth.uid());

CREATE INDEX idx_market_listings_status ON public.market_listings(status, category);

-- ==========================================
-- USER INVENTORY (purchased boosts, titles, cosmetics)
-- ==========================================
CREATE TABLE public.user_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  item_type listing_category NOT NULL,
  item_name TEXT NOT NULL,
  item_data JSONB,
  is_active BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own inventory" ON public.user_inventory
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_user_inventory_user ON public.user_inventory(user_id, item_type);

-- ==========================================
-- GUILDS
-- ==========================================
CREATE TABLE public.guilds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  leader_id UUID REFERENCES auth.users(id) NOT NULL,
  member_count INTEGER DEFAULT 1,
  total_power INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guilds visible to all" ON public.guilds
  FOR SELECT USING (is_active = TRUE);

-- ==========================================
-- GUILD MEMBERS
-- ==========================================
CREATE TYPE guild_role AS ENUM ('leader', 'officer', 'member');

CREATE TABLE public.guild_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guild_id UUID REFERENCES public.guilds(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role guild_role DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guild_id, user_id)
);

ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members visible to guild members" ON public.guild_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.guild_members gm WHERE gm.guild_id = guild_members.guild_id AND gm.user_id = auth.uid())
  );

-- ==========================================
-- GUILD CHAT
-- ==========================================
CREATE TABLE public.guild_chat (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guild_id UUID REFERENCES public.guilds(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.guild_chat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chat visible to guild members" ON public.guild_chat
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.guild_members gm WHERE gm.guild_id = guild_chat.guild_id AND gm.user_id = auth.uid())
  );

CREATE INDEX idx_guild_chat_guild ON public.guild_chat(guild_id, created_at DESC);

-- ==========================================
-- MEME POSTS
-- ==========================================
CREATE TABLE public.meme_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.meme_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Memes visible to all" ON public.meme_posts
  FOR SELECT USING (TRUE);
CREATE POLICY "Users can create memes" ON public.meme_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_meme_posts_created ON public.meme_posts(created_at DESC);

-- ==========================================
-- MEME VOTES
-- ==========================================
CREATE TABLE public.meme_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.meme_posts(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 1)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.meme_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view votes" ON public.meme_votes
  FOR SELECT USING (TRUE);
CREATE POLICY "Users can vote" ON public.meme_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- GAME HISTORY
-- ==========================================
CREATE TYPE game_type AS ENUM ('spin_wheel', 'scratch_card', 'coin_flip', 'dice', 'pump_or_dump');

CREATE TABLE public.game_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  game game_type NOT NULL,
  bet_amount INTEGER NOT NULL DEFAULT 0,
  result_amount INTEGER NOT NULL,
  is_win BOOLEAN NOT NULL,
  metadata JSONB,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.game_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own history" ON public.game_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_game_history_user ON public.game_history(user_id, played_at DESC);

-- ==========================================
-- SEASONAL EVENTS
-- ==========================================
CREATE TABLE public.seasonal_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  theme TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  rewards JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.seasonal_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events visible to all" ON public.seasonal_events
  FOR SELECT USING (is_active = TRUE);

-- ==========================================
-- USER EVENT PROGRESS
-- ==========================================
CREATE TABLE public.user_event_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  event_id UUID REFERENCES public.seasonal_events(id) NOT NULL,
  progress INTEGER DEFAULT 0,
  rewards_claimed JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

ALTER TABLE public.user_event_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress" ON public.user_event_progress
  FOR SELECT USING (auth.uid() = user_id);

-- ==========================================
-- ADMIN NOTES (per user)
-- ==========================================
CREATE TABLE public.admin_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  admin_id UUID REFERENCES auth.users(id) NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No public access" ON public.admin_notes FOR ALL USING (FALSE);

-- ==========================================
-- USER SESSIONS (IP/device tracking)
-- ==========================================
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No public access" ON public.user_sessions FOR ALL USING (FALSE);

CREATE INDEX idx_user_sessions_user ON public.user_sessions(user_id, created_at DESC);

-- ==========================================
-- UPDATE transaction_type ENUM
-- ==========================================
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'army_mission';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'army_recruit';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'market_buy';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'market_sell';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'market_fee';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'guild_create';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'meme_post';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'meme_vote';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'game_spin';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'game_scratch';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'game_coinflip';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'game_dice';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'game_pod';
