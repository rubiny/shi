import { getAuthUser, getServerSupabase, jsonError, jsonSuccess, notConfigured, unauthorized } from '@/lib/api-helpers';
import { parseBody, formatZodErrors, profileUpdateSchema } from '@/lib/validations/schemas';

// GET /api/user/profile
export async function GET(request: Request) {
  const supabase = getServerSupabase();
  if (!supabase) return notConfigured();

  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return jsonError('Profile not found', 404);

  const { data: balance } = await supabase
    .from('user_balances')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const { data: kyc } = await supabase
    .from('kyc_verifications')
    .select('status')
    .eq('user_id', user.id)
    .single();

  return jsonSuccess({
    profile,
    balance: balance ? {
      shit_balance: Number(balance.shit_balance),
      points: balance.points,
      total_earned: Number(balance.total_earned),
      daily_streak: balance.daily_streak,
    } : null,
    kyc_status: kyc?.status || 'none',
  });
}

// PATCH /api/user/profile
export async function PATCH(request: Request) {
  const supabase = getServerSupabase();
  if (!supabase) return notConfigured();

  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const parsed = await parseBody(request, profileUpdateSchema);
  if ('error' in parsed) return jsonError('Validation failed', 400, formatZodErrors(parsed.error));

  const updates = parsed.data;

  // Check username uniqueness
  if (updates.username) {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', updates.username)
      .neq('id', user.id)
      .single();

    if (existing) return jsonError('Username already taken', 409);
  }

  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) return jsonError('Update failed', 500);

  return jsonSuccess({ success: true, updated: Object.keys(updates) });
}
