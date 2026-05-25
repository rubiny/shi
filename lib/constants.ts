import type { Offer, Network, LeaderboardEntry, MarketplaceListing, MerchProduct } from './types';

export const NETWORKS: Network[] = [
  { id: 'base', name: 'Base', chain: '8453', fee: 0.5, minWithdraw: 50, icon: '🔵' },
  { id: 'eth', name: 'Ethereum', chain: '1', fee: 2.5, minWithdraw: 100, icon: '⬡' },
  { id: 'polygon', name: 'Polygon', chain: '137', fee: 0.2, minWithdraw: 25, icon: '💜' },
];

export const OFFERS: Offer[] = [
  { id: 1, title: "Crypto Habits Survey 2026", description: "5-minute survey about your shitcoin addiction", reward: 850, time: "5 min", category: "Surveys", icon: "📋" },
  { id: 2, title: "Install Base Wallet", description: "Download & register in the official Base wallet", reward: 2100, time: "3 min", category: "Installs", icon: "📱" },
  { id: 3, title: "Meme Runner Challenge", description: "Reach level 5 in the viral meme game", reward: 1200, time: "8 min", category: "Games", icon: "🎮" },
  { id: 4, title: "Shitcoin Documentary", description: "Watch 4-min video about the rise of $SHIT", reward: 650, time: "4 min", category: "Videos", icon: "🎥" },
  { id: 5, title: "New DEX on Base", description: "Create account on the hottest new Base DEX", reward: 1800, time: "2 min", category: "Crypto", icon: "🔗", exclusive: true },
  { id: 6, title: "Favorite Poop NFT Poll", description: "Quick 3-question survey", reward: 420, time: "2 min", category: "Surveys", icon: "📋" },
  { id: 7, title: "Tank Shit Shooter", description: "Destroy 20 enemy tanks in our mini-game", reward: 950, time: "6 min", category: "Games", icon: "🎮" },
  { id: 8, title: "Meme Coin Tracker App", description: "Install the #1 shitcoin tracking app", reward: 1650, time: "4 min", category: "Installs", icon: "📱", exclusive: true },
];

export const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "0xG00N...9F3A", earned: 124890, referrals: 47, level: "General" },
  { rank: 2, name: "0xSH1T...420B", earned: 98750, referrals: 39, level: "Captain" },
  { rank: 3, name: "0xPOOP...777", earned: 87620, referrals: 31, level: "Sergeant" },
  { rank: 4, name: "You (0xYOUR...69)", earned: 1240, referrals: 3, level: "Private" },
  { rank: 5, name: "0xTANK...C4FE", earned: 65430, referrals: 22, level: "Sergeant" },
];

export const MARKETPLACE_LISTINGS: MarketplaceListing[] = [
  { id: 1, name: "Poop Soldier #1247", rank: "Epic", price: 420, power: 94, seller: "0xG00N...9F3A" },
  { id: 2, name: "Poop Soldier #892", rank: "Rare", price: 185, power: 67, seller: "0xSH1T...420B" },
  { id: 3, name: "Poop Soldier #3105", rank: "Legendary", price: 890, power: 112, seller: "0xPOOP...777" },
  { id: 4, name: "Poop Soldier #567", rank: "Epic", price: 310, power: 81, seller: "0xTANK...C4FE" },
];

export const MERCH_PRODUCTS: MerchProduct[] = [
  { id: 1, name: "Shit Army T-Shirt", price: 280, emoji: "👕", description: "Premium black cotton with army logo", color: "Black" },
  { id: 2, name: "Poop Soldier Hoodie", price: 620, emoji: "🧥", description: "Heavyweight hoodie with embroidered soldier", color: "Military Green" },
  { id: 3, name: "Tank Shit Shooter Mug", price: 95, emoji: "☕", description: "Ceramic mug with tank design", color: "Black" },
  { id: 4, name: "Sticker Pack (10 pcs)", price: 65, emoji: "📦", description: "Waterproof vinyl stickers", color: "Assorted" },
  { id: 5, name: "General Pass Cap", price: 420, emoji: "🧢", description: "Limited edition dad cap", color: "Olive" },
];

export const BATTLE_PASS_REWARDS = [
  { tier: 1, free: { amount: 50, type: '$SHIT' }, premium: { amount: 150, type: '$SHIT', extra: '2x Offer Boost 24h' } },
  { tier: 2, free: { amount: 75, type: '$SHIT' }, premium: { amount: 200, type: '$SHIT', extra: 'Exclusive Badge' } },
  { tier: 3, free: { amount: 100, type: '$SHIT' }, premium: { amount: 250, type: '$SHIT', extra: '5% Staking Bonus' } },
  { tier: 4, free: { amount: 100, type: '$SHIT' }, premium: { amount: 300, type: '$SHIT', extra: 'General Pass +7d' } },
  { tier: 5, free: { amount: 150, type: '$SHIT', extra: 'Rare NFT Fragment' }, premium: { amount: 400, type: '$SHIT', extra: 'Legendary NFT' } },
  { tier: 6, free: { amount: 150, type: '$SHIT' }, premium: { amount: 450, type: '$SHIT', extra: '3x Offer Boost' } },
  { tier: 7, free: { amount: 200, type: '$SHIT' }, premium: { amount: 500, type: '$SHIT', extra: 'Custom Avatar' } },
  { tier: 8, free: { amount: 200, type: '$SHIT' }, premium: { amount: 550, type: '$SHIT', extra: '10% Staking Bonus' } },
  { tier: 9, free: { amount: 250, type: '$SHIT' }, premium: { amount: 600, type: '$SHIT', extra: 'Mystery Box' } },
  { tier: 10, free: { amount: 300, type: '$SHIT', extra: 'Epic Badge' }, premium: { amount: 800, type: '$SHIT', extra: 'Season Champion Title' } },
  { tier: 11, free: { amount: 250, type: '$SHIT' }, premium: { amount: 600, type: '$SHIT', extra: '5x Offer Boost' } },
  { tier: 12, free: { amount: 300, type: '$SHIT' }, premium: { amount: 700, type: '$SHIT', extra: 'Exclusive Skin' } },
  { tier: 13, free: { amount: 300, type: '$SHIT' }, premium: { amount: 750, type: '$SHIT', extra: '15% Staking Bonus' } },
  { tier: 14, free: { amount: 350, type: '$SHIT' }, premium: { amount: 800, type: '$SHIT', extra: '2x Mystery Boxes' } },
  { tier: 15, free: { amount: 400, type: '$SHIT', extra: 'Legendary Fragment' }, premium: { amount: 1000, type: '$SHIT', extra: 'Mythic NFT' } },
  { tier: 16, free: { amount: 350, type: '$SHIT' }, premium: { amount: 900, type: '$SHIT', extra: 'Week Boost' } },
  { tier: 17, free: { amount: 400, type: '$SHIT' }, premium: { amount: 950, type: '$SHIT', extra: 'Diamond Badge' } },
  { tier: 18, free: { amount: 450, type: '$SHIT' }, premium: { amount: 1000, type: '$SHIT', extra: '20% Staking Bonus' } },
  { tier: 19, free: { amount: 500, type: '$SHIT' }, premium: { amount: 1200, type: '$SHIT', extra: '5x Mystery Boxes' } },
  { tier: 20, free: { amount: 750, type: '$SHIT', extra: 'Season Finale Badge' }, premium: { amount: 2500, type: '$SHIT', extra: 'Shit General NFT' } },
];
