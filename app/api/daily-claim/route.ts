import { getAuthUser, getServerSupabase, jsonError, jsonSuccess, notConfigured, unauthorized } from '@/lib/api-helpers';

export async function POST(request: Request) {
  const supabase = getServerSupabase();
  if (!supabase) return notConfigured();

  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  // Atomic daily claim — prevents race conditions via row-level locking
  const { data: result, error } = await supabase.rpc('claim_daily_bonus', {
    p_user_id: user.id,
  });

  if (error) return jsonError('Daily claim failed', 500);

  const parsed = result as { success: boolean; error?: string; reward?: number; streak?: number; next_reward?: number };

  if (!parsed.success) {
    if (parsed.error === 'already_claimed') return jsonError('Already claimed today', 400);
    if (parsed.error === 'user_not_found') return jsonError('User not found', 404);
    return jsonError('Daily claim failed', 500);
  }

  // Log transaction
  await supabase.from('transactions').insert({
    user_id: user.id,
    type: 'daily',
    amount: parsed.reward,
    description: `Daily bonus (Streak: ${parsed.streak})`,
    status: 'completed',
  });

  return jsonSuccess({
    success: true,
    reward: parsed.reward,
    streak: parsed.streak,
    next_reward: parsed.next_reward,
  });
}
