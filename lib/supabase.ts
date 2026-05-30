import { createClient } from '@supabase/supabase-js';

// Environment variables with fallback for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTkwMDAwMDAwMH0.placeholder';

// Check if using placeholder (development mode)
const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL;

if (isMockMode && typeof window !== 'undefined') {
  console.warn('⚠️ Supabase: Running in MOCK mode. Create .env.local with real credentials for production.');
}

// Browser client (for client-side)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: !isMockMode, // Don't persist in mock mode
    autoRefreshToken: !isMockMode,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Export mock mode flag
export const isSupabaseMockMode = isMockMode;

// Admin client (for server-side only!) - lazy init to prevent crash on missing env
let _adminClient: ReturnType<typeof createClient> | null = null;
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    if (!_adminClient) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role';
      _adminClient = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (_adminClient as any)[prop];
  },
});

// Types for database tables
export type Tables = {
  profiles: {
    id: string;
    wallet_address: string | null;
    username: string | null;
    avatar_url: string | null;
    is_general: boolean;
    general_expires_at: string | null;
    created_at: string;
  };
  
  user_balances: {
    id: string;
    user_id: string;
    shit_balance: number;
    points: number;
    total_earned: number;
    daily_streak: number;
    last_daily_claim: string | null;
    updated_at: string;
  };
  
  offers: {
    id: string;
    external_id: string | null;
    title: string;
    description: string;
    icon: string;
    reward: number;
    category: 'survey' | 'app' | 'game' | 'video' | 'shopping' | 'other';
    time_estimate: string;
    is_exclusive: boolean;
    provider: 'offertoro' | 'adgem' | 'adscend' | 'custom';
    is_active: boolean;
  };
  
  user_offers: {
    id: string;
    user_id: string;
    offer_id: string;
    status: 'started' | 'in_progress' | 'completed' | 'claimed';
    progress: number;
    reward: number;
    started_at: string;
    completed_at: string | null;
    claimed_at: string | null;
  };
  
  transactions: {
    id: string;
    user_id: string;
    type: string;
    amount: number;
    description: string;
    status: 'pending' | 'completed' | 'failed';
    created_at: string;
  };
  
  kyc_verifications: {
    id: string;
    user_id: string;
    status: 'none' | 'pending' | 'verified' | 'rejected';
    submitted_at: string | null;
    verified_at: string | null;
  };
  
  user_battle_pass: {
    id: string;
    user_id: string;
    xp: number;
    claimed_tiers: number[];
    is_premium: boolean;
  };
};

// Helper: Get current user with profile
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  return { ...user, profile };
}

// Helper: Get user balance
export async function getUserBalance(userId: string) {
  const { data, error } = await supabase
    .from('user_balances')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error) throw error;
  return data;
}

// Helper: Subscribe to realtime offer updates
export function subscribeToOffers(userId: string, callback: (payload: Record<string, unknown>) => void) {
  if (isMockMode) {
    // Return mock subscription that does nothing
    return { unsubscribe: () => {} };
  }
  
  return supabase
    .channel('offer-updates')
    .on('broadcast', { event: 'offer_completed' }, (payload) => {
      if (payload.payload.user_id === userId) {
        callback(payload.payload);
      }
    })
    .subscribe();
}

// Helper: Subscribe to balance changes
export function subscribeToBalance(userId: string, callback: (balance: Tables['user_balances']) => void) {
  if (isMockMode) {
    return { unsubscribe: () => {} };
  }
  
  return supabase
    .channel(`balance-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_balances',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => callback(payload.new as Tables['user_balances'])
    )
    .subscribe();
}

// Helper: Call edge function
export async function callEdgeFunction(functionName: string, body: Record<string, unknown>) {
  if (isMockMode) {
    // Mock responses for development
    console.warn(`Mock mode: Edge function ${functionName} called with`, body);
    if (functionName === 'claim-offer-reward') {
      return { success: true, points_earned: 1000, shit_earned: 83 };
    }
    return { success: true, mock: true };
  }
  
  const { data, error } = await supabase.functions.invoke(functionName, {
    body,
  });
  
  if (error) throw error;
  return data;
}

// Wallet authentication helpers
export async function signInWithWallet(walletAddress: string, signature: string, _nonce: string) {
  // 1. Get nonce from database (verify it exists and matches)
  const { data: _profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('wallet_address', walletAddress.toLowerCase())
    .single();
  
  // 2. Verify signature (using viem in frontend, here just check)
  // This is simplified - real implementation needs proper signature verification
  
  // 3. Create or get user and sign them in
  // Using Supabase's custom auth flow
  const { data, error } = await supabase.auth.signInWithPassword({
    email: `${walletAddress.toLowerCase()}@wallet.local`, // Synthetic email
    password: signature.slice(0, 32), // Use signature hash as password
  });
  
  if (error) {
    // Try to sign up if user doesn't exist
    return await supabase.auth.signUp({
      email: `${walletAddress.toLowerCase()}@wallet.local`,
      password: signature.slice(0, 32),
      options: {
        data: {
          wallet_address: walletAddress.toLowerCase(),
        },
      },
    });
  }
  
  return { data, error };
}

export default supabase;
