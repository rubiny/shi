import { getAuthUser, getServerSupabase, jsonError, jsonSuccess, notConfigured, unauthorized } from '@/lib/api-helpers';
import { parseBody, formatZodErrors, withdrawSchema } from '@/lib/validations/schemas';

export async function POST(request: Request) {
  const supabase = getServerSupabase();
  if (!supabase) return notConfigured();

  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const parsed = await parseBody(request, withdrawSchema);
  if ('error' in parsed) return jsonError('Validation failed', 400, formatZodErrors(parsed.error));

  const { amount, network, address, idempotency_key } = parsed.data;

  // Check KYC for large withdrawals
  if (amount > 100) {
    const { data: kyc } = await supabase
      .from('kyc_verifications')
      .select('status')
      .eq('user_id', user.id)
      .single();

    if (!kyc || kyc.status !== 'verified') {
      return jsonError('KYC verification required for withdrawals over $100', 403);
    }
  }

  // Use RPC for atomic withdrawal (locks row, checks balance, deducts, creates record)
  const { data, error } = await supabase.rpc('submit_withdrawal', {
    p_user_id: user.id,
    p_amount: amount,
    p_network: network,
    p_address: address,
    p_idempotency_key: idempotency_key,
  });

  if (error) return jsonError('Withdrawal failed', 500);

  const result = data as { success: boolean; error?: string; new_balance?: number; balance?: number };

  if (!result.success) {
    if (result.error === 'duplicate_request') return jsonError('Duplicate withdrawal request', 409);
    if (result.error === 'insufficient_balance') return jsonError(`Insufficient balance: ${result.balance} $SHIT`, 400);
    return jsonError(result.error || 'Unknown error', 400);
  }

  // Log transaction
  await supabase.from('transactions').insert({
    user_id: user.id,
    type: 'withdrawal',
    amount: -amount,
    description: `Withdrew ${amount} $SHIT to ${address.slice(0, 8)}...${address.slice(-4)} on ${network}`,
    status: 'pending',
  });

  return jsonSuccess({ success: true, new_balance: result.new_balance, message: 'Withdrawal submitted. Processing within 1-24 hours.' });
}
