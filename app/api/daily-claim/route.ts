import { getAuthUser, getServerSupabase, jsonError, jsonSuccess, notConfigured, unauthorized } from '@/lib/api-helpers';

const STREAK_REWARDS = [50, 75, 100, 125, 150, 200, 500];

export async function POST(request: Request) {
  const supabase = getServerSupabase();
  if (!supabase) return notConfigured();

  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { data: balance } = await supabase
    .from('user_balances')
    .select('daily_streak, last_daily_claim')
    .eq('user_id', user.id)
    .single();

  if (!balance) return jsonError('User not found', 404);

  // Check if already claimed today
  if (balance.last_daily_claim) {
    const lastClaim = new Date(balance.last_daily_claim);
    const now = new Date();
    if (lastClaim.toDateString() === now.toDateString()) {
      return jsonError('Already claimed today', 400);
    }

    // Check if streak is broken (more than 48h since last claim)
    const hoursSince = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
    if (hoursSince > 48) {
      // Reset streak
      await supabase.from('user_balances').update({ daily_streak: 0 }).eq('user_id', user.id);
      balance.daily_streak = 0;
    }
  }

  const newStreak = (balance.daily_streak || 0) + 1;
  const rewardIndex = Math.min(newStreak - 1, STREAK_REWARDS.length - 1);
  const reward = STREAK_REWARDS[rewardIndex];

  // Update streak and credit balance
  await supabase.from('user_balances').update({
    daily_streak: newStreak,
    last_daily_claim: new Date().toISOString(),
  }).eq('user_id', user.id);

  await supabase.rpc('credit_balance', { p_user_id: user.id, p_amount: reward });

  await supabase.from('transactions').insert({
    user_id: user.id,
    type: 'daily',
    amount: reward,
    description: `Daily bonus (Streak: ${newStreak})`,
    status: 'completed',
  });

  return jsonSuccess({
    success: true,
    reward,
    streak: newStreak,
    next_reward: STREAK_REWARDS[Math.min(newStreak, STREAK_REWARDS.length - 1)],
  });
}
