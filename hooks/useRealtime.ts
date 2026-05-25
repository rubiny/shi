'use client';

import { useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseMockMode } from '@/lib/supabase';

type RealtimeEvent = 'balance_update' | 'offer_completed' | 'withdrawal_status' | 'leaderboard_update' | 'army_mission_complete' | 'notification';

interface RealtimePayload {
  type: RealtimeEvent;
  data: Record<string, unknown>;
}

type RealtimeHandler = (payload: RealtimePayload) => void;

export function useRealtime(userId: string | null, handlers: Partial<Record<RealtimeEvent, RealtimeHandler>>) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const subscribe = useCallback(() => {
    if (!userId || isSupabaseMockMode) return;

    const channel = supabase.channel(`user:${userId}`);

    // Listen for broadcast events
    channel.on('broadcast', { event: 'update' }, ({ payload }) => {
      const p = payload as RealtimePayload;
      const handler = handlers[p.type];
      if (handler) {
        handler(p);
      }
    });

    // Listen for database changes on user's balance
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_balances',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const handler = handlers.balance_update;
        if (handler) {
          handler({
            type: 'balance_update',
            data: payload.new as Record<string, unknown>,
          });
        }
      }
    );

    // Listen for completed offers
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_offers',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const newRecord = payload.new as Record<string, unknown>;
        if (newRecord.status === 'completed') {
          const handler = handlers.offer_completed;
          if (handler) {
            handler({
              type: 'offer_completed',
              data: newRecord,
            });
          }
        }
      }
    );

    // Listen for withdrawal status changes
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'withdrawal_requests',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const handler = handlers.withdrawal_status;
        if (handler) {
          handler({
            type: 'withdrawal_status',
            data: payload.new as Record<string, unknown>,
          });
        }
      }
    );

    // Listen for army mission completions
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'army_missions',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const newRecord = payload.new as Record<string, unknown>;
        if (newRecord.status === 'completed') {
          const handler = handlers.army_mission_complete;
          if (handler) {
            handler({
              type: 'army_mission_complete',
              data: newRecord,
            });
          }
        }
      }
    );

    channel.subscribe();
    channelRef.current = channel;
  }, [userId, handlers]);

  useEffect(() => {
    subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [subscribe]);

  return {
    isConnected: !!channelRef.current,
  };
}
