import { getAuthUser, getServerSupabase, jsonError, jsonSuccess, notConfigured, unauthorized } from '@/lib/api-helpers';
import { parseBody, formatZodErrors, offerStartSchema, offerClaimSchema } from '@/lib/validations/schemas';

// GET /api/offers — list active offers
export async function GET(request: Request) {
  const supabase = getServerSupabase();
  if (!supabase) return notConfigured();

  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { data: offers, error } = await supabase
    .from('offers')
    .select('*, offer_boosts(*)')
    .eq('is_active', true)
    .order('reward', { ascending: false });

  if (error) return jsonError('Failed to fetch offers', 500);

  // Get user's active/completed offers
  const { data: userOffers } = await supabase
    .from('user_offers')
    .select('offer_id, status')
    .eq('user_id', user.id)
    .in('status', ['started', 'in_progress', 'completed', 'claimed']);

  const userOfferMap = new Map((userOffers || []).map(uo => [uo.offer_id, uo.status]));

  return jsonSuccess({
    offers: (offers || []).map(o => ({
      ...o,
      user_status: userOfferMap.get(o.id) || null,
    })),
  });
}

// POST /api/offers — start an offer
export async function POST(request: Request) {
  const supabase = getServerSupabase();
  if (!supabase) return notConfigured();

  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  if (action === 'claim') {
    const parsed = await parseBody(request, offerClaimSchema);
    if ('error' in parsed) return jsonError('Validation failed', 400, formatZodErrors(parsed.error));

    const { user_offer_id } = parsed.data;

    const { data: userOffer } = await supabase
      .from('user_offers')
      .select('*, offers(*)')
      .eq('id', user_offer_id)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .single();

    if (!userOffer) return jsonError('Offer not found or not completed', 404);

    // Mark claimed
    await supabase.from('user_offers').update({ status: 'claimed', claimed_at: new Date().toISOString() }).eq('id', user_offer_id);

    // Credit balance
    const reward = Number(userOffer.reward);
    await supabase.rpc('credit_balance', { p_user_id: user.id, p_amount: reward });

    await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'offer',
      amount: reward,
      description: `Completed: ${(userOffer.offers as Record<string, unknown>)?.title || 'Offer'}`,
      status: 'completed',
    });

    return jsonSuccess({ success: true, reward });
  }

  // Default: start offer
  const parsed = await parseBody(request, offerStartSchema);
  if ('error' in parsed) return jsonError('Validation failed', 400, formatZodErrors(parsed.error));

  const { offer_id } = parsed.data;

  // Check offer exists and is active
  const { data: offer } = await supabase.from('offers').select('*').eq('id', offer_id).eq('is_active', true).single();
  if (!offer) return jsonError('Offer not found or inactive', 404);

  // Check not already started
  const { data: existing } = await supabase
    .from('user_offers')
    .select('id')
    .eq('user_id', user.id)
    .eq('offer_id', offer_id)
    .in('status', ['started', 'in_progress'])
    .single();

  if (existing) return jsonError('Offer already in progress', 409);

  const { data: userOffer, error } = await supabase
    .from('user_offers')
    .insert({
      user_id: user.id,
      offer_id,
      status: 'started',
      reward: offer.reward,
      progress: 0,
    })
    .select()
    .single();

  if (error) return jsonError('Failed to start offer', 500);

  return jsonSuccess({ success: true, user_offer: userOffer }, 201);
}
