// Shared types used across the application

export interface StakedPosition {
  id: number;
  amount: number;
  lockDays: number;
  apy: number;
  unlockDate: string;
  rewards: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  earned: number;
  referrals: number;
  level: string;
}

export interface MarketplaceListing {
  id: number;
  name: string;
  rank: string;
  price: number;
  power: number;
  seller: string;
}

export interface MerchProduct {
  id: number;
  name: string;
  price: number;
  emoji: string;
  description: string;
  color: string;
}

export interface OwnedNFT {
  id: number;
  name: string;
  rank: string;
  power: number;
}

export interface Quest {
  id: number;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'milestone';
  progress: number;
  max: number;
  reward: number;
  icon: string;
  claimed: boolean;
  completed?: boolean;
}

export interface OfferBoost {
  id: string;
  offerId: number;
  multiplier: 2 | 3;
  expiresAt: Date;
}

export interface ActiveOffer {
  id: string;
  offerId: number;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed';
  startedAt: Date;
  estimatedReward: number;
  userOfferId?: string;
}

export interface Transaction {
  id: string;
  type: 'offer' | 'withdrawal' | 'stake' | 'unstake' | 'quest' | 'airdrop' | 'referral' | 'nft' | 'merch' | 'daily' | 'purchase';
  amount: number;
  description: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
}

export interface Offer {
  id: number;
  title: string;
  description: string;
  reward: number;
  time: string;
  category: string;
  icon: string;
  exclusive?: boolean;
}

export interface Network {
  id: string;
  name: string;
  chain: string;
  fee: number;
  minWithdraw: number;
  icon: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  timestamp: Date;
  read: boolean;
}

// Rank system
export const RANKS = [
  { name: 'Recruit', emoji: '🪖', minEarned: 0 },
  { name: 'Private', emoji: '🎖️', minEarned: 1000 },
  { name: 'Corporal', emoji: '⭐', minEarned: 5000 },
  { name: 'Sergeant', emoji: '🎯', minEarned: 10000 },
  { name: 'Lieutenant', emoji: '⚔️', minEarned: 25000 },
  { name: 'Captain', emoji: '🛡️', minEarned: 50000 },
  { name: 'Major', emoji: '🏅', minEarned: 100000 },
  { name: 'Colonel', emoji: '💎', minEarned: 250000 },
  { name: 'General', emoji: '👑', minEarned: 500000 },
  { name: 'ShitLord', emoji: '🚽👑', minEarned: 1000000 },
] as const;

export function getRank(totalEarned: number) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (totalEarned >= RANKS[i].minEarned) {
      const nextRank = RANKS[i + 1];
      return {
        current: RANKS[i],
        next: nextRank || null,
        toNext: nextRank ? nextRank.minEarned - totalEarned : 0,
        index: i,
      };
    }
  }
  return { current: RANKS[0], next: RANKS[1], toNext: RANKS[1].minEarned, index: 0 };
}
