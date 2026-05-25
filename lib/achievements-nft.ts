'use client';

const ACHIEVEMENTS_CONTRACT = process.env.NEXT_PUBLIC_ACHIEVEMENTS_CONTRACT || '';
const BASE_RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org';

export interface AchievementNFT {
  id: string;
  name: string;
  description: string;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: string;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementNFT[] = [
  {
    id: 'first_offer',
    name: 'First Flush',
    description: 'Completed your first offer on SHIT.ARMY',
    image: '/achievements/first-flush.png',
    rarity: 'common',
    requirement: 'Complete 1 offer',
  },
  {
    id: 'offer_grinder_100',
    name: 'Offer Grinder',
    description: 'Completed 100 offers — absolute degen',
    image: '/achievements/offer-grinder.png',
    rarity: 'rare',
    requirement: 'Complete 100 offers',
  },
  {
    id: 'staking_whale',
    name: 'Diamond Hands',
    description: 'Staked 100,000+ $SHIT for 90 days',
    image: '/achievements/diamond-hands.png',
    rarity: 'epic',
    requirement: 'Stake 100K+ $SHIT for 90 days',
  },
  {
    id: 'referral_king',
    name: 'Referral King',
    description: 'Recruited 50+ degens to the army',
    image: '/achievements/referral-king.png',
    rarity: 'epic',
    requirement: 'Refer 50 users who complete an offer',
  },
  {
    id: 'season_champion',
    name: 'Season Champion',
    description: 'Finished #1 on seasonal leaderboard',
    image: '/achievements/season-champion.png',
    rarity: 'legendary',
    requirement: 'Rank #1 in any season',
  },
  {
    id: 'army_general',
    name: 'Army General',
    description: 'Built an army with 1000+ total power',
    image: '/achievements/army-general.png',
    rarity: 'legendary',
    requirement: 'Reach 1000 squad power',
  },
  {
    id: 'jackpot_winner',
    name: 'Lucky Shit',
    description: 'Won a jackpot on an army mission',
    image: '/achievements/lucky-shit.png',
    rarity: 'rare',
    requirement: 'Hit a jackpot reward',
  },
  {
    id: 'guild_founder',
    name: 'Guild Founder',
    description: 'Created a guild with 10+ members',
    image: '/achievements/guild-founder.png',
    rarity: 'rare',
    requirement: 'Found a guild with 10 members',
  },
];

export async function checkAchievementMinted(walletAddress: string, achievementId: string): Promise<boolean> {
  if (!ACHIEVEMENTS_CONTRACT || !walletAddress) return false;

  try {
    // Call hasMinted(address, string) on contract
    // This is a simplified check — in production use ethers.js or viem
    return false; // Placeholder until contract is deployed
  } catch {
    return false;
  }
}

export function getAchievementsByRarity(rarity: AchievementNFT['rarity']): AchievementNFT[] {
  return ACHIEVEMENT_DEFINITIONS.filter(a => a.rarity === rarity);
}

export function getRarityColor(rarity: AchievementNFT['rarity']): string {
  const colors = {
    common: 'text-zinc-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-amber-400',
  };
  return colors[rarity];
}

export function getRarityBorder(rarity: AchievementNFT['rarity']): string {
  const borders = {
    common: 'border-zinc-500/30',
    rare: 'border-blue-500/30',
    epic: 'border-purple-500/30',
    legendary: 'border-amber-500/30',
  };
  return borders[rarity];
}
