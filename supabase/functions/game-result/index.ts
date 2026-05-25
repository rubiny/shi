// Process game result (spin wheel, scratch, coin flip, dice, pump or dump)
// POST /functions/v1/game-result

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RATE_LIMIT_WINDOW = 3600000; // 1 hour
const MAX_GAMES_PER_HOUR = 30;
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  entry.count++;
  return entry.count <= MAX_GAMES_PER_HOUR;
}

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

    // Rate limit
    if (!checkRateLimit(user.id)) {
      return new Response(JSON.stringify({ error: 'Rate limited. Max 30 games/hour.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { game, bet_amount, result } = await req.json();

    const validGames = ['spin_wheel', 'scratch_card', 'coin_flip', 'dice', 'pump_or_dump'];
    if (!validGames.includes(game)) {
      return new Response('Invalid game', { status: 400, headers: corsHeaders });
    }

    // Check user balance for bet games
    if (bet_amount > 0) {
      const { data: balance } = await supabaseAdmin
        .from('user_balances')
        .select('shit_balance')
        .eq('user_id', user.id)
        .single();

      if (!balance || balance.shit_balance < bet_amount) {
        return new Response(JSON.stringify({ error: 'Insufficient balance' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const isWin = result.is_win;
    const resultAmount = result.amount;

    // Debit bet and credit winnings
    if (bet_amount > 0) {
      await supabaseAdmin.rpc('debit_user_balance', {
        p_user_id: user.id,
        p_amount: bet_amount,
      });
    }

    if (isWin && resultAmount > 0) {
      await supabaseAdmin.rpc('credit_user_balance', {
        p_user_id: user.id,
        p_amount: resultAmount,
      });
    }

    // Record game history
    const gameTypeMap: Record<string, string> = {
      spin_wheel: 'game_spin',
      scratch_card: 'game_scratch',
      coin_flip: 'game_coinflip',
      dice: 'game_dice',
      pump_or_dump: 'game_pod',
    };

    await supabaseAdmin.from('game_history').insert({
      user_id: user.id,
      game,
      bet_amount: bet_amount || 0,
      result_amount: resultAmount,
      is_win: isWin,
      metadata: result,
    });

    // Record transaction
    await supabaseAdmin.from('transactions').insert({
      user_id: user.id,
      type: gameTypeMap[game] || 'game_spin',
      amount: isWin ? resultAmount : -bet_amount,
      description: `${game.replace('_', ' ')} — ${isWin ? 'WIN' : 'LOSS'}`,
      status: 'completed',
      metadata: { game, bet_amount, result_amount: resultAmount, is_win: isWin },
    });

    return new Response(JSON.stringify({ success: true, is_win: isWin, amount: resultAmount }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Game result error:', error);
    return new Response('Error', { status: 500, headers: corsHeaders });
  }
});
