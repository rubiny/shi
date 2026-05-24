import { getAuthUser, getServerSupabase, jsonError, jsonSuccess, notConfigured, unauthorized } from '@/lib/api-helpers';

export async function GET(request: Request) {
  const supabase = getServerSupabase();
  if (!supabase) return notConfigured();

  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { data: balance, error } = await supabase
    .from('user_balances')
    .select('shit_balance, points, total_earned, daily_streak, last_daily_claim')
    .eq('user_id', user.id)
    .single();

  if (error || !balance) return jsonError('Balance not found', 404);

  return jsonSuccess({
    shit_balance: Number(balance.shit_balance),
    points: balance.points,
    total_earned: Number(balance.total_earned),
    daily_streak: balance.daily_streak,
    last_daily_claim: balance.last_daily_claim,
  });
}
