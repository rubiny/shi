// Notify user about withdrawal status changes
// Triggered by database webhook on withdrawal_requests UPDATE

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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { record, old_record } = await req.json();

    // Only notify on status changes
    if (record.status === old_record.status) {
      return new Response('No status change', { status: 200, headers: corsHeaders });
    }

    const userId = record.user_id;
    const status = record.status;
    const amount = record.amount;
    const network = record.network;

    // Get user profile for notification preferences
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email, push_token, notification_preferences')
      .eq('id', userId)
      .single();

    if (!profile) {
      return new Response('User not found', { status: 404, headers: corsHeaders });
    }

    const statusMessages: Record<string, { title: string; body: string }> = {
      approved: {
        title: '💰 WITHDRAWAL APPROVED',
        body: `Your withdrawal of ${amount} $SHIT via ${network} has been approved and is being processed.`,
      },
      rejected: {
        title: '❌ WITHDRAWAL REJECTED',
        body: `Your withdrawal of ${amount} $SHIT has been rejected. Check your account for details.`,
      },
      completed: {
        title: '🚀 WITHDRAWAL SENT',
        body: `${amount} $SHIT has been sent to your ${network} wallet. Check your wallet ser!`,
      },
    };

    const message = statusMessages[status];
    if (!message) {
      return new Response('Unknown status', { status: 200, headers: corsHeaders });
    }

    // Send push notification via OneSignal if configured
    const onesignalAppId = Deno.env.get('ONESIGNAL_APP_ID');
    const onesignalApiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');

    if (onesignalAppId && onesignalApiKey && profile.push_token) {
      await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${onesignalApiKey}`,
        },
        body: JSON.stringify({
          app_id: onesignalAppId,
          include_external_user_ids: [userId],
          headings: { en: message.title },
          contents: { en: message.body },
          data: { type: 'withdrawal_status', withdrawal_id: record.id, status },
        }),
      }).catch(() => {
        // Silently fail push notification
      });
    }

    // Store in-app notification
    await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      title: message.title,
      body: message.body,
      type: 'withdrawal',
      metadata: { withdrawal_id: record.id, status, amount, network },
    });

    // Broadcast via realtime
    await supabaseAdmin.channel(`user:${userId}`).send({
      type: 'broadcast',
      event: 'update',
      payload: {
        type: 'withdrawal_status',
        data: { withdrawal_id: record.id, status, amount, network },
      },
    });

    return new Response(JSON.stringify({ sent: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Notify withdrawal error:', error);
    return new Response('Error', { status: 500, headers: corsHeaders });
  }
});
