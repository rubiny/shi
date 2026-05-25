export interface PublicOffer {
  id: string;
  name: string;
  provider: string;
  category: OfferCategory;
  payout: number;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeEstimate: string;
  requirements: string[];
  tips: string;
  popular: boolean;
  emoji: string;
}

export type OfferCategory = 'games' | 'surveys' | 'signups' | 'finance' | 'shopping' | 'videos';

export const OFFER_CATEGORY_META: Record<OfferCategory, { label: string; emoji: string; color: string }> = {
  games: { label: 'Mobile Games', emoji: '🎮', color: 'text-purple-400' },
  surveys: { label: 'Surveys', emoji: '📝', color: 'text-blue-400' },
  signups: { label: 'Sign Ups', emoji: '✍️', color: 'text-green-400' },
  finance: { label: 'Finance', emoji: '💳', color: 'text-amber-400' },
  shopping: { label: 'Shopping', emoji: '🛒', color: 'text-pink-400' },
  videos: { label: 'Videos', emoji: '📺', color: 'text-cyan-400' },
};

export const PUBLIC_OFFERS: PublicOffer[] = [
  {
    id: 'rok-1',
    name: 'Rise of Kingdoms',
    provider: 'AdGem',
    category: 'games',
    payout: 45.00,
    description: 'Reach City Hall Level 17 in Rise of Kingdoms. Strategy game where you build a city and command armies.',
    difficulty: 'medium',
    timeEstimate: '5-7 days',
    requirements: ['Install the game', 'Create an account', 'Reach City Hall Level 17'],
    tips: 'Join an active alliance ASAP. Use all speed-ups on builder queue. Focus on one builder upgrade at a time.',
    popular: true,
    emoji: '⚔️',
  },
  {
    id: 'coinbase-1',
    name: 'Coinbase',
    provider: 'OfferToro',
    category: 'finance',
    payout: 25.00,
    description: 'Create a Coinbase account and complete identity verification. Deposit $10 to qualify.',
    difficulty: 'easy',
    timeEstimate: '15 min',
    requirements: ['Sign up', 'Complete ID verification', 'Deposit $10'],
    tips: 'You can withdraw the $10 deposit after the offer credits. Keep your ID ready for quick verification.',
    popular: true,
    emoji: '🪙',
  },
  {
    id: 'rsl-1',
    name: 'Raid: Shadow Legends',
    provider: 'AdScend',
    category: 'games',
    payout: 22.00,
    description: 'Get 2 Champions to Level 40 in Raid: Shadow Legends. RPG with team-based battles.',
    difficulty: 'medium',
    timeEstimate: '4-5 days',
    requirements: ['Install the game', 'Level 2 champions to Lvl 40'],
    tips: 'Focus on 2 champions only. Use XP brews from daily rewards. Campaign stages give the most XP.',
    popular: true,
    emoji: '🗡️',
  },
  {
    id: 'cashapp-1',
    name: 'Cash App',
    provider: 'OfferToro',
    category: 'finance',
    payout: 15.00,
    description: 'Download Cash App and complete your first transaction. Send $1 to any contact.',
    difficulty: 'easy',
    timeEstimate: '10 min',
    requirements: ['Download Cash App', 'Link bank or card', 'Send $1'],
    tips: 'Send $1 to a friend and ask them to send it back. Quickest $15 you will make.',
    popular: true,
    emoji: '💸',
  },
  {
    id: 'mistplay-1',
    name: 'Mistplay',
    provider: 'AdGem',
    category: 'games',
    payout: 12.00,
    description: 'Earn 1500 Mistplay units by playing featured games. Casual gaming platform.',
    difficulty: 'easy',
    timeEstimate: '3-4 days',
    requirements: ['Install Mistplay', 'Play featured games', 'Earn 1500 units'],
    tips: 'Play high-unit games listed at the top. Leave games running while watching TV.',
    popular: false,
    emoji: '🎲',
  },
  {
    id: 'expressvpn-1',
    name: 'ExpressVPN',
    provider: 'OfferToro',
    category: 'signups',
    payout: 10.00,
    description: 'Sign up for ExpressVPN 7-day free trial. Premium VPN service.',
    difficulty: 'easy',
    timeEstimate: '5 min',
    requirements: ['Create account', 'Start free trial'],
    tips: 'Set a calendar reminder to cancel before the trial ends to avoid charges.',
    popular: false,
    emoji: '🔐',
  },
  {
    id: 'fetch-1',
    name: 'Fetch Rewards',
    provider: 'AdScend',
    category: 'shopping',
    payout: 8.00,
    description: 'Download Fetch Rewards and scan 3 grocery receipts. Receipt scanning rewards app.',
    difficulty: 'easy',
    timeEstimate: '10 min',
    requirements: ['Install Fetch Rewards', 'Create account', 'Scan 3 receipts'],
    tips: 'Any grocery receipt works, even old ones. Take photos of receipts you already have.',
    popular: false,
    emoji: '🧾',
  },
  {
    id: 'draftkings-1',
    name: 'DraftKings',
    provider: 'AdGem',
    category: 'finance',
    payout: 7.50,
    description: 'Create a DraftKings account and make a $5 deposit. Sports betting platform.',
    difficulty: 'easy',
    timeEstimate: '10 min',
    requirements: ['Sign up', 'Verify identity', 'Deposit $5'],
    tips: 'Place a minimum bet after deposit. Withdraw everything once offer credits.',
    popular: false,
    emoji: '🏈',
  },
  {
    id: 'survey-junkie-1',
    name: 'Survey Junkie',
    provider: 'OfferToro',
    category: 'surveys',
    payout: 5.00,
    description: 'Complete your profile and finish 3 surveys on Survey Junkie.',
    difficulty: 'easy',
    timeEstimate: '30 min',
    requirements: ['Create account', 'Complete profile', 'Finish 3 surveys'],
    tips: 'Fill out your profile completely for better survey matching. Be honest — inconsistent answers get you disqualified.',
    popular: false,
    emoji: '📋',
  },
  {
    id: 'nordvpn-1',
    name: 'NordVPN',
    provider: 'AdScend',
    category: 'signups',
    payout: 5.50,
    description: 'Sign up for NordVPN free trial. Another top VPN service.',
    difficulty: 'easy',
    timeEstimate: '5 min',
    requirements: ['Create account', 'Start free trial'],
    tips: 'Same as ExpressVPN — cancel before trial ends. Do both for $15.50 in 10 minutes.',
    popular: false,
    emoji: '🛡️',
  },
  {
    id: 'idle-heroes-1',
    name: 'Idle Heroes',
    provider: 'OfferToro',
    category: 'games',
    payout: 6.00,
    description: 'Complete Campaign Chapter 5 in Idle Heroes. Casual idle RPG.',
    difficulty: 'easy',
    timeEstimate: '2 days',
    requirements: ['Install game', 'Complete Chapter 5'],
    tips: 'Very casual — check in 3-4 times per day to collect resources and progress.',
    popular: false,
    emoji: '🦸',
  },
  {
    id: 'swagbucks-video-1',
    name: 'Video Rewards Bundle',
    provider: 'OfferToro',
    category: 'videos',
    payout: 2.00,
    description: 'Watch 10 sponsored videos (30-60 seconds each). Quick and easy passive earning.',
    difficulty: 'easy',
    timeEstimate: '15 min',
    requirements: ['Watch 10 videos to completion'],
    tips: 'Run videos while doing other tasks. Don\'t skip — let them play to the end.',
    popular: false,
    emoji: '▶️',
  },
];

export function getAllOffers(): PublicOffer[] {
  return PUBLIC_OFFERS.sort((a, b) => b.payout - a.payout);
}

export function getOffersByCategory(category: OfferCategory): PublicOffer[] {
  return PUBLIC_OFFERS.filter(o => o.category === category).sort((a, b) => b.payout - a.payout);
}

export function getPopularOffers(): PublicOffer[] {
  return PUBLIC_OFFERS.filter(o => o.popular).sort((a, b) => b.payout - a.payout);
}

export function getTotalPotential(): number {
  return PUBLIC_OFFERS.reduce((sum, o) => sum + o.payout, 0);
}
