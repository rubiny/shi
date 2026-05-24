// Claim offer reward - converts points to $SHIT
// POST /functions/v1/claim-offer-reward

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { verify } from 'https://esm.sh/jsonwebtoken@9.0.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClaimRequest {
  user_offer_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get JWT from header
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'No token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.substring(7);
    
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Verify token and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;
    const { user_offer_id } = await req.json() as ClaimRequest;

    // Get user offer with offer details
    const { data: userOffer, error: offerError } = await supabaseAdmin
      .from('user_offers')
      .select('*, offers(*)')
      .eq('id', user_offer_id)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .is('claimed_at', null)
      .single();

    if (offerError || !userOffer) {
      return new Response(JSON.stringify({ error: 'No claimable offer found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate $SHIT reward (1 SHIT = 12 points)
    const POINTS_TO_SHIT = 12;
    const shitEarned = Math.floor(userOffer.reward / POINTS_TO_SHIT);

    // Get user profile for General boost
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_general, general_expires_at')
      .eq('id', userId)
      .single();

    const isGeneral = profile?.is_general && 
      (!profile?.general_expires_at || new Date(profile.general_expires_at) > new Date());

    // Apply General boost if active (25% extra)
    const finalShitEarned = isGeneral 
      ? Math.floor(shitEarned * 1.25) 
      : shitEarned;

    // Transaction: claim offer + add points + add transaction + add BP XP
    const { error: rpcError } = await supabaseAdmin.rpc('claim_offer_reward', {
      p_user_offer_id: user_offer_id,
      p_user_id: userId,
      p_points: userOffer.reward,
      p_shit: finalShitEarned,
      p_offer_title: userOffer.offers.title,
    });

    if (rpcError) {
      console.error('RPC error:', rpcError);
      return new Response(JSON.stringify({ error: 'Failed to claim reward' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      points_earned: userOffer.reward,
      shit_earned: finalShitEarned,
      is_general_boosted: isGeneral,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
