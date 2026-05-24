'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseMockMode } from '@/lib/supabase';

interface AuthUser {
  id: string;
  wallet_address?: string;
  email?: string;
  is_general: boolean;
}

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithWallet: (walletAddress: string, signature: string, nonce: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Generate nonce for wallet signature
function generateNonce() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check current session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        if (isSupabaseMockMode) {
          // Mock user for development
          setUser({
            id: 'mock-user-id',
            wallet_address: '0x1234...5678',
            is_general: false,
          });
          setIsLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          setUser({
            id: session.user.id,
            wallet_address: profile?.wallet_address || undefined,
            email: session.user.email || undefined,
            is_general: profile?.is_general || false,
          });
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setUser({
          id: session.user.id,
          wallet_address: profile?.wallet_address || undefined,
          email: session.user.email || undefined,
          is_general: profile?.is_general || false,
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with wallet
  const signInWithWallet = useCallback(async (walletAddress: string, signature: string, nonce: string) => {
    if (isSupabaseMockMode) {
      // Mock sign in
      setUser({
        id: 'mock-user-id',
        wallet_address: walletAddress,
        is_general: false,
      });
      return;
    }

    try {
      // Call custom wallet auth endpoint
      const { data, error } = await supabase.functions.invoke('auth-wallet', {
        body: {
          wallet_address: walletAddress,
          signature,
          nonce,
        },
      });

      if (error) throw error;

      // Set session from custom token
      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
    } catch (error) {
      console.error('Wallet auth error:', error);
      throw error;
    }
  }, []);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    if (isSupabaseMockMode) {
      setUser({
        id: 'mock-google-user',
        email: 'user@gmail.com',
        is_general: false,
      });
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google auth error:', error);
      throw error;
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    if (isSupabaseMockMode) {
      setUser(null);
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signInWithWallet,
    signInWithGoogle,
    signOut,
  };
}

export default useAuth;
