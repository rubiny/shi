import { getAuthUser, getServerSupabase, jsonError, jsonSuccess, notConfigured, unauthorized } from '@/lib/api-helpers';
import { parseBody, formatZodErrors, stakeSchema } from '@/lib/validations/schemas';

const APY_MAP: Record<number, number> = { 7: 32, 14: 40, 30: 48, 90: 67 };

export async function POST(request: Request) {
  const supabase = getServerSupabase();
  if (!supabase) return notConfigured();

  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const parsed = await parseBody(request, stakeSchema);
  if ('error' in parsed) return jsonError('Validation failed', 400, formatZodErrors(parsed.error));

  const { amount, lock_days } = parsed.data;
  const apy = APY_MAP[lock_days];
  if (!apy) return jsonError('Invalid lock period', 400);

  // Check balance
  const { data: balance } = await supabase
    .from('user_balances')
    .select('shit_balance')
    .eq('user_id', user.id)
    .single();

  if (!balance || Number(balance.shit_balance) < amount) {
    return jsonError(`Insufficient balance: ${balance?.shit_balance || 0} $SHIT`, 400);
  }

  // Deduct balance
  const { error: deductError } = await supabase.rpc('debit_balance', {
    p_user_id: user.id,
    p_amount: amount,
  });
  if (deductError) return jsonError('Failed to deduct balance', 500);

  // Create staking position
  const unlockDate = new Date(Date.now() + lock_days * 86400000).toISOString();
  const estimatedReward = (amount * apy * lock_days) / (365 * 100);

  const { data: position, error: stakeError } = await supabase
    .from('staking_positions')
    .insert({
      user_id: user.id,
      amount,
      lock_days,
      apy,
      unlock_at: unlockDate,
      estimated_reward: estimatedReward,
      is_unstaked: false,
    })
    .select()
    .single();

  if (stakeError) return jsonError('Failed to create stake position', 500);

  // Log
  await supabase.from('transactions').insert({
    user_id: user.id,
    type: 'stake',
    amount: -amount,
    description: `Staked ${amount} $SHIT for ${lock_days} days at ${apy}% APY`,
    status: 'completed',
  });

  return jsonSuccess({
    success: true,
    position: {
      id: position.id,
      amount,
      lock_days,
      apy,
      unlock_at: unlockDate,
      estimated_reward: Math.round(estimatedReward * 100) / 100,
    },
    new_balance: Number(balance.shit_balance) - amount,
  });
}
