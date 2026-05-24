/**
 * Database seed script for SHIT.ARMY development environment
 *
 * Usage:
 *   npx ts-node scripts/seed.ts
 *
 * Requires:
 *   NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('Copy .env.example to .env.local and fill in your Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

const OFFERS = [
  { title: 'Crypto Habits Survey 2026', description: 'Complete a 5-minute survey about your crypto habits', reward: 175, category: 'survey', icon: '📊', time_estimate: '5 min', provider: 'offertoro', is_active: true },
  { title: 'Install Phantom Wallet', description: 'Download and set up Phantom Wallet', reward: 2100, category: 'app', icon: '👻', time_estimate: '3 min', provider: 'adgem', is_active: true },
  { title: 'Play Axie Origins', description: 'Reach level 5 in Axie Origins', reward: 3500, category: 'game', icon: '🎮', time_estimate: '2 hours', provider: 'adscend', is_active: true },
  { title: 'DeFi Knowledge Quiz', description: 'Test your DeFi knowledge', reward: 120, category: 'survey', icon: '📝', time_estimate: '3 min', provider: 'offertoro', is_active: true },
  { title: 'Sign up for Binance', description: 'Create and verify a Binance account', reward: 5000, category: 'app', icon: '🔶', time_estimate: '10 min', provider: 'adgem', is_active: true },
  { title: 'Watch Trading Tutorial', description: 'Watch a 10-minute trading tutorial', reward: 80, category: 'video', icon: '🎥', time_estimate: '10 min', provider: 'offertoro', is_active: true },
  { title: 'Install MetaMask', description: 'Download MetaMask browser extension', reward: 1500, category: 'app', icon: '🦊', time_estimate: '2 min', provider: 'adscend', is_active: true },
  { title: 'NFT Market Survey', description: 'Share your thoughts on NFT markets', reward: 200, category: 'survey', icon: '🖼️', time_estimate: '8 min', provider: 'offertoro', is_active: true },
];

const QUESTS = [
  { title: 'Complete 2 Offers', description: 'Finish any 2 offers from the offerwall', category: 'daily', max_progress: 2, reward: 300, icon: '⚡' },
  { title: 'Stake 100 $SHIT', description: 'Lock 100 $SHIT in any staking pool', category: 'daily', max_progress: 1, reward: 200, icon: '🏆' },
  { title: 'Visit Marketplace', description: 'Browse the NFT marketplace', category: 'daily', max_progress: 1, reward: 50, icon: '🛒' },
  { title: 'Complete 10 Offers', description: 'Finish 10 offers this week', category: 'weekly', max_progress: 10, reward: 1500, icon: '🔥' },
  { title: 'Earn 5,000 $SHIT', description: 'Reach 5,000 total earned this week', category: 'weekly', max_progress: 5000, reward: 2000, icon: '💰' },
  { title: 'Refer 5 Friends', description: 'Get 5 friends to join Shit Army', category: 'weekly', max_progress: 5, reward: 2500, icon: '👥' },
  { title: 'First Shit', description: 'Complete your first offer ever', category: 'milestone', max_progress: 1, reward: 500, icon: '💩' },
  { title: 'Offerwall Legend', description: 'Complete 50 offers total', category: 'milestone', max_progress: 50, reward: 5000, icon: '🏆' },
  { title: 'Diamond Hands', description: 'Stake $SHIT for 90 days total', category: 'milestone', max_progress: 90, reward: 10000, icon: '💎' },
  { title: 'Shit General', description: 'Reach 100,000 $SHIT earned', category: 'milestone', max_progress: 100000, reward: 25000, icon: '⭐' },
];

async function seed() {
  console.log('Seeding SHIT.ARMY database...\n');

  // 1. Insert offers
  console.log('📊 Inserting offers...');
  const { error: offersError } = await supabase.from('offers').upsert(
    OFFERS.map((o, i) => ({ ...o, external_id: `seed-${i}`, is_exclusive: i % 3 === 0 })),
    { onConflict: 'external_id' }
  );
  if (offersError) console.error('  Offers error:', offersError.message);
  else console.log(`  ✓ ${OFFERS.length} offers inserted`);

  // 2. Insert quests
  console.log('🎯 Inserting quests...');
  const { error: questsError } = await supabase.from('quests').upsert(
    QUESTS.map((q, i) => ({ ...q, id: i + 1 })),
    { onConflict: 'id' }
  );
  if (questsError) console.error('  Quests error:', questsError.message);
  else console.log(`  ✓ ${QUESTS.length} quests inserted`);

  // 3. Insert army soldiers
  console.log('⚔️ Inserting army soldiers...');
  const soldiers = [
    { name: 'Poop Private', rank: 'Common', base_power: 15, recruit_cost: 100 },
    { name: 'Shit Sergeant', rank: 'Rare', base_power: 35, recruit_cost: 500 },
    { name: 'Dung Commander', rank: 'Epic', base_power: 60, recruit_cost: 2000 },
    { name: 'Turd General', rank: 'Legendary', base_power: 100, recruit_cost: 10000 },
  ];
  const { error: soldiersError } = await supabase.from('army_soldiers').upsert(
    soldiers.map((s, i) => ({ ...s, id: `soldier-${i}` })),
    { onConflict: 'id' }
  );
  if (soldiersError) console.error('  Soldiers error:', soldiersError.message);
  else console.log(`  ✓ ${soldiers.length} soldiers inserted`);

  // 4. Insert army missions
  console.log('🏴 Inserting missions...');
  const missions = [
    { name: 'Sewer Patrol', description: 'Scout the sewers for loot', min_power: 20, reward_min: 50, reward_max: 150, duration_hours: 1, jackpot_chance: 5, jackpot_multiplier: 3 },
    { name: 'Trash Heist', description: 'Raid the local dump', min_power: 50, reward_min: 100, reward_max: 400, duration_hours: 2, jackpot_chance: 8, jackpot_multiplier: 5 },
    { name: 'Poop Factory', description: 'Take over the poop factory', min_power: 80, reward_min: 300, reward_max: 1000, duration_hours: 4, jackpot_chance: 12, jackpot_multiplier: 7 },
    { name: 'Sewage Wars', description: 'Wage war in the sewers', min_power: 120, reward_min: 500, reward_max: 2500, duration_hours: 8, jackpot_chance: 15, jackpot_multiplier: 10 },
  ];
  const { error: missionsError } = await supabase.from('army_missions').upsert(
    missions.map((m, i) => ({ ...m, id: `mission-${i}` })),
    { onConflict: 'id' }
  );
  if (missionsError) console.error('  Missions error:', missionsError.message);
  else console.log(`  ✓ ${missions.length} missions inserted`);

  // 5. Insert seasonal event
  console.log('🎄 Inserting seasonal event...');
  const { error: eventError } = await supabase.from('seasonal_events').upsert([{
    id: 'event-season1',
    name: 'SHIT RISING',
    description: 'Season 1 launch event — earn double rewards!',
    type: 'season',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 90 * 86400000).toISOString(),
    is_active: true,
    rewards: JSON.stringify({ bonus_multiplier: 2, exclusive_soldier: 'Poop Private' }),
  }], { onConflict: 'id' });
  if (eventError) console.error('  Event error:', eventError.message);
  else console.log('  ✓ 1 seasonal event inserted');

  console.log('\n✅ Seed complete!');
  console.log('\nNote: User data (profiles, balances, etc.) is created automatically');
  console.log('when users sign up via the app.\n');
}

seed().catch(console.error);
