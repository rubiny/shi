import { getAuthUser, getServerSupabase, jsonError, jsonSuccess, notConfigured, unauthorized } from '@/lib/api-helpers';

export async function GET(request: Request) {
  const supabase = getServerSupabase();
  if (!supabase) return notConfigured();

  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  // Verify admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_general')
    .eq('id', user.id)
    .single();

  if (!profile?.is_general) return jsonError('Admin access required', 403);

  // Fetch aggregate stats
  const [
    { count: totalUsers },
    { data: balanceAgg },
    { count: pendingWithdrawals },
    { count: pendingKyc },
    { count: totalOfferCompletions },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('user_balances').select('shit_balance, total_earned'),
    supabase.from('withdrawal_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('kyc_verifications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('user_offers').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
  ]);

  const totalBalance = (balanceAgg || []).reduce((sum, b) => sum + Number(b.shit_balance), 0);
  const totalEarned = (balanceAgg || []).reduce((sum, b) => sum + Number(b.total_earned), 0);

  // Recent activity
  const { data: recentTx } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  // Admin alerts
  const { data: alerts } = await supabase
    .from('admin_alerts')
    .select('*')
    .eq('acknowledged', false)
    .order('created_at', { ascending: false })
    .limit(10);

  return jsonSuccess({
    stats: {
      total_users: totalUsers || 0,
      total_balance: totalBalance,
      total_earned: totalEarned,
      pending_withdrawals: pendingWithdrawals || 0,
      pending_kyc: pendingKyc || 0,
      total_offer_completions: totalOfferCompletions || 0,
    },
    recent_transactions: recentTx || [],
    alerts: alerts || [],
  });
}
