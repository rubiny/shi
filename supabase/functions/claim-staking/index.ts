// Claim staking rewards
// POST /functions/v1/claim-staking

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

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response('Invalid token', { status: 401, headers: corsHeaders });
    }

    const { position_id } = await req.json();
    if (!position_id) {
      return new Response('Missing position_id', { status: 400, headers: corsHeaders });
    }

    // Get staking position
    const { data: position, error: posError } = await supabaseAdmin
      .from('staking_positions')
      .select('*')
      .eq('id', position_id)
      .eq('user_id', user.id)
      .eq('is_unstaked', false)
      .single();

    if (posError || !position) {
      return new Response('Position not found', { status: 404, headers: corsHeaders });
    }

    // Calculate accrued rewards
    const startedAt = new Date(position.started_at).getTime();
    const now = Date.now();
    const elapsedDays = (now - startedAt) / 86400000;
    const dailyRate = position.apy / 365 / 100;
    const totalRewards = position.amount * dailyRate * elapsedDays;
    const claimable = totalRewards - (position.claimed_rewards || 0);

    if (claimable <= 0) {
      return new Response(JSON.stringify({ error: 'No rewards to claim' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Credit rewards
    await supabaseAdmin.rpc('credit_user_balance', {
      p_user_id: user.id,
      p_amount: Math.floor(claimable),
    });

    // Update claimed_rewards
    await supabaseAdmin.from('staking_positions').update({
      claimed_rewards: (position.claimed_rewards || 0) + Math.floor(claimable),
      rewards: totalRewards,
    }).eq('id', position_id);

    // Record transaction
    await supabaseAdmin.from('transactions').insert({
      user_id: user.id,
      type: 'stake_reward',
      amount: Math.floor(claimable),
      description: `Staking reward claim (${position.apy}% APY, ${position.lock_days}d lock)`,
      status: 'completed',
      metadata: { position_id, apy: position.apy, days_staked: Math.floor(elapsedDays) },
    });

    return new Response(JSON.stringify({
      claimed: Math.floor(claimable),
      total_rewards: totalRewards,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Claim staking error:', error);
    return new Response('Error', { status: 500, headers: corsHeaders });
  }
});
