// AdScend postback handler
// GET /functions/v1/postback-adscend

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';

const corsHeaders = { 'Access-Control-Allow-Origin': '*' };

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const params = url.searchParams;

    const userId = params.get('user_id');
    const offerId = params.get('offer_id');
    const amount = params.get('amount');
    const transactionId = params.get('transaction_id');
    const signature = params.get('signature');

    if (!userId || !offerId || !amount || !signature) {
      return new Response('Missing parameters', { status: 400, headers: corsHeaders });
    }

    // Verify signature
    const secretKey = Deno.env.get('ADSCEND_SECRET_KEY');
    if (!secretKey) {
      console.error('ADSCEND_SECRET_KEY not set');
      return new Response('Server error', { status: 500, headers: corsHeaders });
    }

    const message = `${userId}${offerId}${amount}${secretKey}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hash = await crypto.subtle.digest('MD5', data);
    const expectedSig = Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (signature !== expectedSig) {
      console.warn('Invalid AdScend signature');
      return new Response('Invalid signature', { status: 403, headers: corsHeaders });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Check for duplicate
    if (transactionId) {
      const { data: existing } = await supabaseAdmin
        .from('user_offers')
        .select('id')
        .eq('provider_transaction_id', transactionId)
        .maybeSingle();

      if (existing) {
        return new Response('Duplicate', { status: 200, headers: corsHeaders });
      }
    }

    // Find offer
    const { data: offer } = await supabaseAdmin
      .from('offers')
      .select('id')
      .eq('external_id', offerId)
      .eq('provider', 'adscend')
      .single();

    if (!offer) {
      console.error('AdScend offer not found:', offerId);
      return new Response('Offer not found', { status: 404, headers: corsHeaders });
    }

    // Find or create user offer
    const { data: existingUserOffer } = await supabaseAdmin
      .from('user_offers')
      .select('id')
      .eq('user_id', userId)
      .eq('offer_id', offer.id)
      .in('status', ['started', 'in_progress'])
      .maybeSingle();

    if (existingUserOffer) {
      await supabaseAdmin.from('user_offers').update({
        status: 'completed',
        progress: 100,
        completed_at: new Date().toISOString(),
        reward: parseInt(amount, 10),
        provider_transaction_id: transactionId,
      }).eq('id', existingUserOffer.id);
    } else {
      await supabaseAdmin.from('user_offers').insert({
        user_id: userId,
        offer_id: offer.id,
        status: 'completed',
        progress: 100,
        reward: parseInt(amount, 10),
        completed_at: new Date().toISOString(),
        provider_transaction_id: transactionId,
      });
    }

    // Log audit
    await supabaseAdmin.from('audit_logs').insert({
      user_id: userId,
      action: 'offer_completed',
      entity_type: 'offer',
      entity_id: offer.id,
      new_value: { provider: 'adscend', amount, transactionId },
    });

    // Broadcast
    await supabaseAdmin.channel('offer-updates').send({
      type: 'broadcast',
      event: 'offer_completed',
      payload: { user_id: userId, offer_id: offer.id, reward: parseInt(amount, 10) },
    });

    console.log('AdScend offer completed:', { userId, offerId, amount });
    return new Response('OK', { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('AdScend postback error:', error);
    return new Response('Error', { status: 500, headers: corsHeaders });
  }
});
