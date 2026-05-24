-- ==========================================
-- SHIT.ARMY - Development Seed Data
-- Run after migrations: psql -f supabase/seed.sql
-- ==========================================

-- ==========================================
-- BATTLE PASS SEASON
-- ==========================================
INSERT INTO public.battle_pass_seasons (id, name, starts_at, ends_at, is_active, xp_per_tier, max_tier) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Season 1: The Great Flush', NOW() - INTERVAL '7 days', NOW() + INTERVAL '83 days', TRUE, 500, 20);

-- ==========================================
-- BATTLE PASS TIERS
-- ==========================================
INSERT INTO public.battle_pass_tiers (season_id, tier, free_reward, premium_reward, free_extra, premium_extra) VALUES
  ('00000000-0000-0000-0000-000000000001', 1, 50, 150, NULL, '2x Offer Boost 24h'),
  ('00000000-0000-0000-0000-000000000001', 2, 75, 200, NULL, 'Exclusive Badge'),
  ('00000000-0000-0000-0000-000000000001', 3, 100, 250, NULL, '5% Staking Bonus'),
  ('00000000-0000-0000-0000-000000000001', 4, 100, 300, NULL, 'General Pass +7d'),
  ('00000000-0000-0000-0000-000000000001', 5, 150, 400, 'Rare NFT Fragment', 'Legendary NFT'),
  ('00000000-0000-0000-0000-000000000001', 6, 150, 450, NULL, '3x Offer Boost'),
  ('00000000-0000-0000-0000-000000000001', 7, 200, 500, NULL, 'Custom Avatar'),
  ('00000000-0000-0000-0000-000000000001', 8, 200, 550, NULL, '10% Staking Bonus'),
  ('00000000-0000-0000-0000-000000000001', 9, 250, 600, NULL, 'Mystery Box'),
  ('00000000-0000-0000-0000-000000000001', 10, 300, 800, 'Epic Badge', 'Season Champion Title'),
  ('00000000-0000-0000-0000-000000000001', 11, 250, 600, NULL, '5x Offer Boost'),
  ('00000000-0000-0000-0000-000000000001', 12, 300, 700, NULL, 'Exclusive Skin'),
  ('00000000-0000-0000-0000-000000000001', 13, 300, 750, NULL, '15% Staking Bonus'),
  ('00000000-0000-0000-0000-000000000001', 14, 350, 800, NULL, '2x Mystery Boxes'),
  ('00000000-0000-0000-0000-000000000001', 15, 400, 1000, 'Legendary Fragment', 'Mythic NFT'),
  ('00000000-0000-0000-0000-000000000001', 16, 350, 900, NULL, 'Week Boost'),
  ('00000000-0000-0000-0000-000000000001', 17, 400, 950, NULL, 'Diamond Badge'),
  ('00000000-0000-0000-0000-000000000001', 18, 450, 1000, NULL, '20% Staking Bonus'),
  ('00000000-0000-0000-0000-000000000001', 19, 500, 1200, NULL, '5x Mystery Boxes'),
  ('00000000-0000-0000-0000-000000000001', 20, 750, 2500, 'Season Finale Badge', 'Shit General NFT');

-- ==========================================
-- SAMPLE OFFERS
-- ==========================================
INSERT INTO public.offers (external_id, title, description, icon, reward, category, time_estimate, is_exclusive, provider) VALUES
  ('ot-001', 'Download Clash of Clans', 'Download and reach Town Hall 5', '⚔️', 500, 'game', '45 min', FALSE, 'offertoro'),
  ('ot-002', 'Complete Survey: Shopping Habits', 'Answer 15 questions about your shopping', '📊', 150, 'survey', '3 min', FALSE, 'offertoro'),
  ('ot-003', 'Sign up for Coinbase', 'Create and verify a Coinbase account', '🪙', 1200, 'app', '10 min', TRUE, 'offertoro'),
  ('ag-001', 'Install & Play Raid Legends', 'Reach level 10 in Raid Legends', '🗡️', 800, 'game', '30 min', FALSE, 'adgem'),
  ('ag-002', 'Watch 5 Video Ads', 'Complete 5 short video ads', '📺', 50, 'video', '5 min', FALSE, 'adgem'),
  ('as-001', 'Try Amazon Prime Free Trial', 'Sign up for 30-day free trial', '📦', 600, 'shopping', '5 min', TRUE, 'adscend'),
  ('as-002', 'Download TikTok', 'Install TikTok and create an account', '🎵', 200, 'app', '3 min', FALSE, 'adscend'),
  ('ot-004', 'Complete Health Survey', 'Quick survey about wellness habits', '🏥', 100, 'survey', '2 min', FALSE, 'offertoro'),
  ('ag-003', 'Play Tank Stars', 'Win 3 matches in Tank Stars', '🎯', 350, 'game', '20 min', FALSE, 'adgem'),
  ('ot-005', 'Sign up for Crypto.com', 'Create and verify account', '💎', 1500, 'app', '15 min', TRUE, 'offertoro');

-- ==========================================
-- SAMPLE QUESTS
-- ==========================================
INSERT INTO public.quests (title, description, category, max_progress, reward, icon, reset_period) VALUES
  ('Morning Grind', 'Complete 2 offers today', 'daily', 2, 100, '☀️', 'daily'),
  ('Check Your Bags', 'View your staking positions', 'daily', 1, 25, '💰', 'daily'),
  ('Scout the Bazaar', 'Browse the marketplace', 'daily', 1, 25, '🏪', 'daily'),
  ('Weekly Warrior', 'Complete 10 offers this week', 'weekly', 10, 500, '⚔️', 'weekly'),
  ('Staking Chad', 'Stake any amount for 30+ days', 'milestone', 1, 1000, '🔒', 'never'),
  ('Referral King', 'Refer 5 friends who complete an offer', 'milestone', 5, 2500, '👑', 'never'),
  ('Spin Master', 'Use the daily spin wheel 7 days in a row', 'weekly', 7, 300, '🎰', 'weekly'),
  ('Army Builder', 'Recruit 3 soldiers', 'milestone', 3, 750, '🪖', 'never');

-- ==========================================
-- SAMPLE SEASONAL EVENT
-- ==========================================
INSERT INTO public.seasonal_events (title, description, theme, starts_at, ends_at, is_active, rewards) VALUES
  ('The Great Flush', 'Season 1 launch event — bonus rewards on all activities', 'flush', NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days', TRUE,
   '[{"milestone": 100, "reward": 500, "description": "Complete 5 offers"}, {"milestone": 250, "reward": 1000, "description": "Stake 1000 $SHIT"}, {"milestone": 500, "reward": 2500, "description": "Recruit 3 soldiers"}, {"milestone": 1000, "reward": 5000, "description": "Season Champion"}]');

-- ==========================================
-- SAMPLE GUILD
-- ==========================================
INSERT INTO public.guilds (id, name, description, leader_id, member_count, total_power) VALUES
  ('00000000-0000-0000-0000-000000000002', 'Toilet Titans', 'The OG degen guild. We flush together.', '00000000-0000-0000-0000-000000000000', 1, 0);
