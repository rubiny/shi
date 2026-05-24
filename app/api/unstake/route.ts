import { getAuthUser, getServerSupabase, jsonError, jsonSuccess, notConfigured, unauthorized } from '@/lib/api-helpers';
import { parseBody, formatZodErrors, unstakeSchema } from '@/lib/validations/schemas';

export async function POST(request: Request) {
  const supabase = getServerSupabase();
  if (!supabase) return notConfigured();

  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const parsed = await parseBody(request, unstakeSchema);
  if ('error' in parsed) return jsonError('Validation failed', 400, formatZodErrors(parsed.error));

  const { position_id } = parsed.data;

  // Fetch position
  const { data: position } = await supabase
    .from('staking_positions')
    .select('*')
    .eq('id', position_id)
    .eq('user_id', user.id)
    .eq('is_unstaked', false)
    .single();

  if (!position) return jsonError('Staking position not found or already unstaked', 404);

  // Check if lock period expired
  if (new Date(position.unlock_at) > new Date()) {
    const remaining = Math.ceil((new Date(position.unlock_at).getTime() - Date.now()) / 86400000);
    return jsonError(`Position locked for ${remaining} more day(s)`, 400);
  }

  // Calculate rewards
  const reward = Number(position.estimated_reward) || 0;
  const totalReturn = Number(position.amount) + reward;

  // Mark as unstaked
  await supabase
    .from('staking_positions')
    .update({ is_unstaked: true, unstaked_at: new Date().toISOString() })
    .eq('id', position_id);

  // Credit balance
  await supabase.rpc('credit_balance', {
    p_user_id: user.id,
    p_amount: totalReturn,
  });

  // Log
  await supabase.from('transactions').insert({
    user_id: user.id,
    type: 'unstake',
    amount: totalReturn,
    description: `Unstaked ${position.amount} $SHIT + ${reward.toFixed(2)} rewards`,
    status: 'completed',
  });

  return jsonSuccess({
    success: true,
    returned: { principal: Number(position.amount), reward, total: totalReturn },
  });
}
