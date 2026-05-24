// Offertoro postback handler
// GET/POST /functions/v1/postback-offertoro

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get query parameters
    const url = new URL(req.url);
    const params = url.searchParams;
    
    const userId = params.get('user_id');
    const offerId = params.get('offer_id');
    const amount = params.get('amount');
    const payout = params.get('payout');
    const signature = params.get('signature');
    const oid = params.get('oid');

    // Verify required params
    if (!userId || !offerId || !amount || !signature) {
      return new Response('Missing parameters', { 
        status: 400,
        headers: corsHeaders,
      });
    }

    // Verify signature
    const postbackKey = Deno.env.get('OFFERTORO_POSTBACK_KEY');
    if (!postbackKey) {
      console.error('OFFERTORO_POSTBACK_KEY not set');
      return new Response('Server error', { status: 500, headers: corsHeaders });
    }

    const expectedSig = await generateSignature(userId, offerId, payout || amount, postbackKey);
    
    if (signature !== expectedSig) {
      console.warn('Invalid signature:', { userId, offerId, signature, expected: expectedSig });
      return new Response('Invalid signature', { status: 403, headers: corsHeaders });
    }

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Find offer by external_id
    const { data: offer, error: offerError } = await supabaseAdmin
      .from('offers')
      .select('id')
      .eq('external_id', offerId)
      .eq('provider', 'offertoro')
      .single();

    if (offerError || !offer) {
      console.error('Offer not found:', offerId);
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
      // Mark as completed
      const { error: updateError } = await supabaseAdmin
        .from('user_offers')
        .update({
          status: 'completed',
          progress: 100,
          completed_at: new Date().toISOString(),
          reward: parseInt(amount, 10),
        })
        .eq('id', existingUserOffer.id);

      if (updateError) {
        console.error('Update error:', updateError);
        return new Response('Database error', { status: 500, headers: corsHeaders });
      }
    } else {
      // Auto-create completed offer
      const { error: insertError } = await supabaseAdmin
        .from('user_offers')
        .insert({
          user_id: userId,
          offer_id: offer.id,
          status: 'completed',
          progress: 100,
          reward: parseInt(amount, 10),
          completed_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        return new Response('Database error', { status: 500, headers: corsHeaders });
      }
    }

    // Broadcast realtime update
    await supabaseAdmin
      .channel('offer-updates')
      .send({
        type: 'broadcast',
        event: 'offer_completed',
        payload: {
          user_id: userId,
          offer_id: offer.id,
          reward: parseInt(amount, 10),
        },
      });

    console.log('Offertoro offer completed:', { userId, offerId, amount });
    return new Response('OK', { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Postback error:', error);
    return new Response('Error', { status: 500, headers: corsHeaders });
  }
});

async function generateSignature(userId: string, offerId: string, payout: string, key: string): Promise<string> {
  const message = `${userId}${offerId}${payout}${key}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
