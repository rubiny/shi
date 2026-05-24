import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const MAX_RETRIES = 3;
const RETRY_DELAYS = [60_000, 300_000, 900_000]; // 1min, 5min, 15min

interface FailedPostback {
  id: string;
  provider: string;
  payload: Record<string, unknown>;
  error_message: string;
  retry_count: number;
  created_at: string;
  next_retry_at: string | null;
  resolved: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
  }

  try {
    // Fetch unresolved postbacks ready for retry
    const now = new Date().toISOString();
    const { data: pendingRetries, error: fetchError } = await supabase
      .from('failed_postbacks')
      .select('*')
      .eq('resolved', false)
      .lt('next_retry_at', now)
      .lt('retry_count', MAX_RETRIES)
      .order('created_at', { ascending: true })
      .limit(50);

    if (fetchError) {
      console.error('Failed to fetch pending retries:', fetchError);
      return new Response(JSON.stringify({ error: 'Failed to fetch retries' }), { status: 500 });
    }

    const results = { processed: 0, succeeded: 0, failed: 0, dead_lettered: 0 };

    for (const postback of (pendingRetries as FailedPostback[]) || []) {
      results.processed++;

      const providerFnMap: Record<string, string> = {
        offertoro: 'postback-offertoro',
        adgem: 'postback-adgem',
        adscend: 'postback-adscend',
      };

      const fnName = providerFnMap[postback.provider];
      if (!fnName) {
        await supabase.from('failed_postbacks').update({ resolved: true, error_message: `Unknown provider: ${postback.provider}` }).eq('id', postback.id);
        results.dead_lettered++;
        continue;
      }

      try {
        const { error: invokeError } = await supabase.functions.invoke(fnName, {
          body: postback.payload,
        });

        if (invokeError) throw invokeError;

        await supabase.from('failed_postbacks').update({ resolved: true, retry_count: postback.retry_count + 1 }).eq('id', postback.id);
        results.succeeded++;
      } catch (retryError) {
        const newRetryCount = postback.retry_count + 1;

        if (newRetryCount >= MAX_RETRIES) {
          // Dead letter — alert admin
          await supabase.from('failed_postbacks').update({
            resolved: false,
            retry_count: newRetryCount,
            error_message: `Max retries exceeded: ${(retryError as Error).message}`,
            next_retry_at: null,
          }).eq('id', postback.id);

          // Insert admin alert
          await supabase.from('admin_alerts').insert({
            type: 'postback_failure',
            severity: 'critical',
            title: `Postback dead-lettered: ${postback.provider}`,
            details: JSON.stringify({ postback_id: postback.id, provider: postback.provider, payload: postback.payload, last_error: (retryError as Error).message }),
          });

          results.dead_lettered++;
        } else {
          const nextRetryMs = RETRY_DELAYS[Math.min(newRetryCount, RETRY_DELAYS.length - 1)];
          const nextRetryAt = new Date(Date.now() + nextRetryMs).toISOString();

          await supabase.from('failed_postbacks').update({
            retry_count: newRetryCount,
            error_message: (retryError as Error).message,
            next_retry_at: nextRetryAt,
          }).eq('id', postback.id);

          results.failed++;
        }
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Retry worker error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
});
