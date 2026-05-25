import { getAuthUser, getServerSupabase, jsonError, jsonSuccess, notConfigured, unauthorized } from '@/lib/api-helpers';
import { parseBody, formatZodErrors, convertSchema } from '@/lib/validations/schemas';
import { CONFIG } from '@/lib/config';

export async function POST(request: Request) {
  const supabase = getServerSupabase();
  if (!supabase) return notConfigured();

  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const parsed = await parseBody(request, convertSchema);
  if ('error' in parsed) return jsonError('Validation failed', 400, formatZodErrors(parsed.error));

  const { points } = parsed.data;
  const exchangeRate = CONFIG.BUSINESS.OFFERWALL.EXCHANGE_RATE;
  const shitAmount = points / exchangeRate;

  // Check cooldown (last conversion within 30s)
  const { data: lastTx } = await supabase
    .from('transactions')
    .select('created_at')
    .eq('user_id', user.id)
    .eq('type', 'offer')
    .like('description', '%Converted%')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (lastTx) {
    const elapsed = Date.now() - new Date(lastTx.created_at).getTime();
    if (elapsed < 30_000) {
      const remaining = Math.ceil((30_000 - elapsed) / 1000);
      return jsonError(`Cooldown active. Wait ${remaining}s`, 429);
    }
  }

  // Check user has enough points
  const { data: balance } = await supabase
    .from('user_balances')
    .select('points, shit_balance, total_earned')
    .eq('user_id', user.id)
    .single();

  if (!balance || balance.points < points) {
    return jsonError(`Insufficient points: ${balance?.points || 0}`, 400);
  }

  // Deduct points, add $SHIT
  const { error: updateError } = await supabase
    .from('user_balances')
    .update({
      points: balance.points - points,
      shit_balance: Number(balance.shit_balance) + shitAmount,
      total_earned: Number(balance.total_earned) + shitAmount,
    })
    .eq('user_id', user.id);

  if (updateError) return jsonError('Conversion failed', 500);

  // Log
  await supabase.from('transactions').insert({
    user_id: user.id,
    type: 'offer',
    amount: shitAmount,
    description: `Converted ${points} PTS → ${shitAmount.toFixed(2)} $SHIT`,
    status: 'completed',
  });

  return jsonSuccess({
    success: true,
    converted: { points, shit: shitAmount },
    new_balance: { points: balance.points - points, shit: Number(balance.shit_balance) + shitAmount },
  });
}
