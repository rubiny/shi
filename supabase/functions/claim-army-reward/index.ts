// Claim army mission reward
// POST /functions/v1/claim-army-reward

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Verify user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response('Invalid token', { status: 401, headers: corsHeaders });
    }

    const { mission_id } = await req.json();
    if (!mission_id) {
      return new Response('Missing mission_id', { status: 400, headers: corsHeaders });
    }

    // Get mission
    const { data: mission, error: missionError } = await supabaseAdmin
      .from('army_missions')
      .select('*')
      .eq('id', mission_id)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .single();

    if (missionError || !mission) {
      // Check if mission is still in progress
      const { data: activeMission } = await supabaseAdmin
        .from('army_missions')
        .select('ends_at')
        .eq('id', mission_id)
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .single();

      if (activeMission) {
        const endsAt = new Date(activeMission.ends_at);
        if (endsAt > new Date()) {
          return new Response(JSON.stringify({ error: 'Mission not completed yet' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        // Auto-complete if time has passed
        await supabaseAdmin
          .from('army_missions')
          .update({ status: 'completed' })
          .eq('id', mission_id);
      } else {
        return new Response('Mission not found', { status: 404, headers: corsHeaders });
      }
    }

    const reward = mission?.actual_reward || mission?.base_reward || 0;

    // Credit user balance
    const { error: rpcError } = await supabaseAdmin.rpc('credit_user_balance', {
      p_user_id: user.id,
      p_amount: reward,
    });

    if (rpcError) {
      console.error('Credit error:', rpcError);
      return new Response('Credit failed', { status: 500, headers: corsHeaders });
    }

    // Mark mission as claimed
    await supabaseAdmin.from('army_missions').update({
      status: 'claimed',
      claimed_at: new Date().toISOString(),
    }).eq('id', mission_id);

    // Record transaction
    await supabaseAdmin.from('transactions').insert({
      user_id: user.id,
      type: 'army_mission',
      amount: reward,
      description: `Army mission reward${mission?.is_jackpot ? ' (JACKPOT!)' : ''}`,
      status: 'completed',
      metadata: { mission_id, is_jackpot: mission?.is_jackpot },
    });

    // Award XP to soldier
    if (mission?.soldier_id) {
      const xpGain = Math.floor(reward * 0.1);
      await supabaseAdmin.rpc('add_soldier_xp', {
        p_soldier_id: mission.soldier_id,
        p_xp: xpGain,
      });
    }

    return new Response(JSON.stringify({ reward, is_jackpot: mission?.is_jackpot }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Claim army reward error:', error);
    return new Response('Error', { status: 500, headers: corsHeaders });
  }
});
