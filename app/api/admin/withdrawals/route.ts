import { getAuthUser, getServerSupabase, jsonError, jsonSuccess, notConfigured, unauthorized } from '@/lib/api-helpers';
import { parseBody, formatZodErrors, adminProcessWithdrawalSchema } from '@/lib/validations/schemas';

// GET /api/admin/withdrawals
export async function GET(request: Request) {
  const supabase = getServerSupabase();
  if (!supabase) return notConfigured();

  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { data: profile } = await supabase.from('profiles').select('is_general').eq('id', user.id).single();
  if (!profile?.is_general) return jsonError('Admin access required', 403);

  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'pending';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const offset = (page - 1) * limit;

  let query = supabase
    .from('withdrawal_requests')
    .select('*, profiles(username, wallet_address)', { count: 'exact' });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data: withdrawals, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return jsonError('Failed to fetch withdrawals', 500);

  return jsonSuccess({
    withdrawals: withdrawals || [],
    pagination: { page, limit, total: count || 0 },
  });
}

// POST /api/admin/withdrawals — approve/reject
export async function POST(request: Request) {
  const supabase = getServerSupabase();
  if (!supabase) return notConfigured();

  const admin = await getAuthUser(request);
  if (!admin) return unauthorized();

  const { data: profile } = await supabase.from('profiles').select('is_general').eq('id', admin.id).single();
  if (!profile?.is_general) return jsonError('Admin access required', 403);

  const parsed = await parseBody(request, adminProcessWithdrawalSchema);
  if ('error' in parsed) return jsonError('Validation failed', 400, formatZodErrors(parsed.error));

  const { withdrawal_ids, action, reason } = parsed.data;

  const results = { processed: 0, failed: 0 };

  for (const id of withdrawal_ids) {
    const { data: withdrawal } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('id', id)
      .eq('status', 'pending')
      .single();

    if (!withdrawal) {
      results.failed++;
      continue;
    }

    if (action === 'approve') {
      await supabase.from('withdrawal_requests').update({
        status: 'approved',
        processed_by: admin.id,
        processed_at: new Date().toISOString(),
      }).eq('id', id);
    } else {
      // Reject — refund balance
      await supabase.from('withdrawal_requests').update({
        status: 'rejected',
        reject_reason: reason || 'Rejected by admin',
        processed_by: admin.id,
        processed_at: new Date().toISOString(),
      }).eq('id', id);

      await supabase.rpc('credit_balance', {
        p_user_id: withdrawal.user_id,
        p_amount: Number(withdrawal.amount),
      });
    }

    results.processed++;
  }

  // Audit
  await supabase.from('audit_logs').insert({
    admin_id: admin.id,
    action: `withdrawal_${action}`,
    details: JSON.stringify({ withdrawal_ids, reason, results }),
  });

  return jsonSuccess({ success: true, action, results });
}
