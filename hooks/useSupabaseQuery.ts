'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseMockMode } from '@/lib/supabase';

interface QueryOptions {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
  retry?: number;
}

interface QueryResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isRefetching: boolean;
  refetch: () => Promise<void>;
}

const cache = new Map<string, { data: unknown; timestamp: number }>();

export function useSupabaseQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options: QueryOptions = {}
): QueryResult<T> {
  const { enabled = true, refetchInterval, staleTime = 30000, retry = 2 } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);

  const fetchData = useCallback(async (isRefetch = false) => {
    if (!enabled || isSupabaseMockMode) {
      setIsLoading(false);
      return;
    }

    // Check cache
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < staleTime && !isRefetch) {
      setData(cached.data as T);
      setIsLoading(false);
      return;
    }

    if (isRefetch) {
      setIsRefetching(true);
    } else {
      setIsLoading(true);
    }

    try {
      const result = await queryFn();
      if (mountedRef.current) {
        setData(result);
        setError(null);
        cache.set(key, { data: result, timestamp: Date.now() });
        retryCountRef.current = 0;
      }
    } catch (err) {
      if (mountedRef.current) {
        if (retryCountRef.current < retry) {
          retryCountRef.current++;
          const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
          setTimeout(() => fetchData(isRefetch), delay);
          return;
        }
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsRefetching(false);
      }
    }
  }, [key, queryFn, enabled, staleTime, retry]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  useEffect(() => {
    if (!refetchInterval || !enabled) return;
    const interval = setInterval(() => fetchData(true), refetchInterval);
    return () => clearInterval(interval);
  }, [refetchInterval, enabled, fetchData]);

  const refetch = useCallback(async () => {
    cache.delete(key);
    await fetchData(true);
  }, [key, fetchData]);

  return { data, error, isLoading, isRefetching, refetch };
}

// Mutation hook for Supabase operations
interface MutationOptions<T, V> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  invalidateKeys?: string[];
}

interface MutationResult<T, V> {
  mutate: (variables: V) => Promise<void>;
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export function useSupabaseMutation<T, V = void>(
  mutationFn: (variables: V) => Promise<T>,
  options: MutationOptions<T, V> = {}
): MutationResult<T, V> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(async (variables: V) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await mutationFn(variables);
      setData(result);
      // Invalidate cache
      if (options.invalidateKeys) {
        for (const key of options.invalidateKeys) {
          cache.delete(key);
        }
      }
      options.onSuccess?.(result);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      options.onError?.(e);
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, options]);

  return { mutate, data, error, isLoading };
}

// Helper to fetch from Supabase with types
export async function fetchFromSupabase<T>(
  table: string,
  query: {
    select?: string;
    filter?: Record<string, unknown>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
  } = {}
): Promise<T[]> {
  let q = supabase.from(table).select(query.select || '*');

  if (query.filter) {
    for (const [key, value] of Object.entries(query.filter)) {
      q = q.eq(key, value);
    }
  }

  if (query.order) {
    q = q.order(query.order.column, { ascending: query.order.ascending ?? false });
  }

  if (query.limit) {
    q = q.limit(query.limit);
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data as T[]) || [];
}
