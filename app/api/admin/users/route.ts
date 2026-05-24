import { getAuthUser, getServerSupabase, jsonError, jsonSuccess, notConfigured, unauthorized } from '@/lib/api-helpers';
import { parseBody, formatZodErrors, adminUpdateUserSchema } from '@/lib/validations/schemas';

// GET /api/admin/users — list users
export async function GET(request: Request) {
  const supabase = getServerSupabase();
  if (!supabase) return notConfigured();

  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { data: profile } = await supabase.from('profiles').select('is_general').eq('id', user.id).single();
  if (!profile?.is_general) return jsonError('Admin access required', 403);

  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const offset = (page - 1) * limit;

  let query = supabase
    .from('profiles')
    .select('*, user_balances(shit_balance, points, total_earned), kyc_verifications(status)', { count: 'exact' });

  if (search) {
    query = query.or(`username.ilike.%${search}%,wallet_address.ilike.%${search}%`);
  }

  const { data: users, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return jsonError('Failed to fetch users', 500);

  return jsonSuccess({
    users: users || [],
    pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
  });
}

// POST /api/admin/users — admin action on user
export async function POST(request: Request) {
  const supabase = getServerSupabase();
  if (!supabase) return notConfigured();

  const admin = await getAuthUser(request);
  if (!admin) return unauthorized();

  const { data: profile } = await supabase.from('profiles').select('is_general').eq('id', admin.id).single();
  if (!profile?.is_general) return jsonError('Admin access required', 403);

  const parsed = await parseBody(request, adminUpdateUserSchema);
  if ('error' in parsed) return jsonError('Validation failed', 400, formatZodErrors(parsed.error));

  const { user_id, action, amount, reason } = parsed.data;

  switch (action) {
    case 'ban':
      await supabase.from('profiles').update({ is_banned: true, banned_at: new Date().toISOString(), ban_reason: reason }).eq('id', user_id);
      break;
    case 'unban':
      await supabase.from('profiles').update({ is_banned: false, banned_at: null, ban_reason: null }).eq('id', user_id);
      break;
    case 'adjust_balance':
      if (!amount) return jsonError('Amount required for balance adjustment', 400);
      if (amount > 0) {
        await supabase.rpc('credit_balance', { p_user_id: user_id, p_amount: amount });
      } else {
        await supabase.rpc('debit_balance', { p_user_id: user_id, p_amount: Math.abs(amount) });
      }
      break;
    case 'set_general':
      await supabase.from('profiles').update({ is_general: true }).eq('id', user_id);
      break;
    case 'remove_general':
      await supabase.from('profiles').update({ is_general: false }).eq('id', user_id);
      break;
    case 'reset_kyc':
      await supabase.from('kyc_verifications').update({ status: 'none' }).eq('user_id', user_id);
      break;
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    admin_id: admin.id,
    action: `admin_${action}`,
    target_user_id: user_id,
    details: JSON.stringify({ amount, reason }),
  });

  return jsonSuccess({ success: true, action, user_id });
}
