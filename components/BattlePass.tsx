'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface BattlePassTier {
  level: number;
  xpRequired: number;
  reward: {
    type: 'shit' | 'nft' | 'boost' | 'title' | 'emoji';
    amount?: number;
    name?: string;
    description: string;
  };
  claimed: boolean;
  premium: boolean;
}

const BATTLE_PASS_SEASON = {
  name: "Season 1: The Great Flush",
  endDate: "2026-07-01",
  totalTiers: 50,
};

const TIERS: BattlePassTier[] = [
  { level: 1, xpRequired: 0, reward: { type: 'title', name: 'Shit Recruit', description: 'Exclusive title' }, claimed: false, premium: false },
  { level: 5, xpRequired: 500, reward: { type: 'shit', amount: 500, description: '500 $SHIT' }, claimed: false, premium: false },
  { level: 10, xpRequired: 1500, reward: { type: 'nft', name: 'Bronze Poop', description: 'NFT: Bronze Poop Soldier' }, claimed: false, premium: true },
  { level: 15, xpRequired: 3000, reward: { type: 'boost', amount: 2, description: '2x Offer Boost (24h)' }, claimed: false, premium: false },
  { level: 20, xpRequired: 5000, reward: { type: 'shit', amount: 2000, description: '2,000 $SHIT' }, claimed: false, premium: true },
  { level: 25, xpRequired: 7500, reward: { type: 'nft', name: 'Silver Poop', description: 'NFT: Silver Poop General' }, claimed: false, premium: true },
  { level: 30, xpRequired: 10500, reward: { type: 'emoji', name: '💎', description: 'Diamond hands emoji' }, claimed: false, premium: false },
  { level: 40, xpRequired: 15000, reward: { type: 'shit', amount: 5000, description: '5,000 $SHIT' }, claimed: false, premium: true },
  { level: 50, xpRequired: 25000, reward: { type: 'nft', name: 'Golden Throne', description: 'Legendary NFT: Golden Throne' }, claimed: false, premium: true },
];

export default function BattlePass({ userId }: { userId: string }) {
  const [currentXP, setCurrentXP] = useState(1850);
  const [premium, setPremium] = useState(false);
  const [claimedTiers, setClaimedTiers] = useState<number[]>([1]);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const end = new Date(BATTLE_PASS_SEASON.endDate);
      const now = new Date();
      const diff = end.getTime() - now.getTime();
      
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      });
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const currentLevel = TIERS.filter(t => currentXP >= t.xpRequired).length;
  const nextTierXP = TIERS.find(t => t.xpRequired > currentXP)?.xpRequired || 25000;
  const progress = ((currentXP - (TIERS[currentLevel - 1]?.xpRequired || 0)) / (nextTierXP - (TIERS[currentLevel - 1]?.xpRequired || 0))) * 100;

  const claimReward = (level: number) => {
    if (!claimedTiers.includes(level)) {
      setClaimedTiers([...claimedTiers, level]);
      // Trigger confetti or animation here
    }
  };

  const upgradeToPremium = () => {
    setPremium(true);
    setShowUpgrade(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8 relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-purple-500/20 blur-2xl rounded-full"></div>
        <div className="relative text-center">
          <div className="text-6xl mb-2">🏆</div>
          <h1 className="text-4xl sm:text-5xl font-black mb-2 bg-gradient-to-r from-amber-400 via-orange-500 to-purple-500 bg-clip-text text-transparent">
            {BATTLE_PASS_SEASON.name}
          </h1>
          <p className="text-zinc-400">grind XP. claim loot. flex on normies. or stay a normie forever.</p>
          
          {/* Countdown */}
          <div className="mt-4 inline-flex items-center gap-4 px-6 py-3 bg-zinc-900/50 rounded-2xl border border-white/10">
            <span className="text-amber-400 font-bold">Season ends in:</span>
            <div className="flex gap-2">
              {[
                { val: countdown.days, label: 'D' },
                { val: countdown.hours, label: 'H' },
                { val: countdown.minutes, label: 'M' },
              ].map((t, i) => (
                <div key={i} className="bg-zinc-800 rounded-lg px-3 py-1 min-w-[50px]">
                  <div className="text-xl font-bold">{t.val}</div>
                  <div className="text-[10px] text-zinc-500">{t.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-zinc-900/50 rounded-3xl p-6 border border-white/10 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-5xl">💩</div>
            <div>
              <div className="text-2xl font-black text-amber-400">Level {currentLevel}</div>
              <div className="text-sm text-zinc-500">{currentXP.toLocaleString()} / {nextTierXP.toLocaleString()} XP</div>
            </div>
          </div>
          
          {!premium ? (
            <button 
              onClick={() => setShowUpgrade(true)}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg shadow-amber-500/20"
            >
              {"\u{1F680}"} GO PREMIUM SER
            </button>
          ) : (
            <div className="px-6 py-3 bg-purple-500/20 border border-purple-500/50 rounded-2xl font-bold text-purple-400">
              {"\u{2B50}"} PREMIUM CHAD
            </div>
          )}
        </div>
        
        {/* XP Bar */}
        <div className="relative h-4 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9zdmc+')] opacity-30" />
        </div>
      </div>

      {/* Rewards Track */}
      <div className="space-y-4">
        {TIERS.map((tier) => {
          const isUnlocked = currentXP >= tier.xpRequired;
          const isClaimed = claimedTiers.includes(tier.level);
          const canClaim = isUnlocked && !isClaimed && (!tier.premium || premium);
          
          return (
            <div 
              key={tier.level}
              className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                isUnlocked 
                  ? 'bg-zinc-900/50 border-amber-500/30' 
                  : 'bg-zinc-900/20 border-white/5 opacity-60'
              }`}
            >
              {/* Level Badge */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${
                isUnlocked 
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white' 
                  : 'bg-zinc-800 text-zinc-500'
              }`}>
                {tier.level}
              </div>
              
              {/* Reward Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">
                    {tier.reward.type === 'shit' && '💰'}
                    {tier.reward.type === 'nft' && '🎨'}
                    {tier.reward.type === 'boost' && '⚡'}
                    {tier.reward.type === 'title' && '🏅'}
                    {tier.reward.type === 'emoji' && '💎'}
                  </span>
                  <span className="font-bold">{tier.reward.description}</span>
                  {tier.premium && (
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-bold">
                      ⭐ PREMIUM
                    </span>
                  )}
                </div>
                <div className="text-sm text-zinc-500">
                  {tier.xpRequired.toLocaleString()} XP required
                </div>
              </div>
              
              {/* Claim Button */}
              {canClaim ? (
                <button 
                  onClick={() => claimReward(tier.level)}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-xl font-black hover:scale-105 transition-transform animate-pulse shadow-lg shadow-amber-500/20"
                >
                  CLAIM 🎁
                </button>
              ) : isClaimed ? (
                <div className="px-6 py-3 bg-zinc-800 rounded-xl text-amber-400 font-bold">
                  ✓ CLAIMED
                </div>
              ) : tier.premium && !premium ? (
                <button 
                  onClick={() => setShowUpgrade(true)}
                  className="px-6 py-3 bg-zinc-800 rounded-xl text-zinc-400 font-bold hover:bg-zinc-700"
                >
                  🔒 LOCKED
                </button>
              ) : (
                <div className="px-6 py-3 bg-zinc-800 rounded-xl text-zinc-500 font-bold">
                  🔒 LOCKED
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl max-w-md w-full border border-amber-500/30 p-6">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🚀</div>
              <h2 className="text-2xl font-black mb-2">Upgrade to Premium</h2>
              <p className="text-zinc-400">Unlock exclusive rewards worth 50,000+ $SHIT</p>
            </div>
            
            <div className="space-y-3 mb-6">
              {[
                '✓ All Premium rewards unlocked',
                '✓ Exclusive NFTs at levels 10, 25, 50',
                '✓ 2x XP boost for all activities',
                '✓ Golden profile badge',
                '✓ Early access to new features',
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl">
                  <span className="text-amber-400">{benefit}</span>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowUpgrade(false)}
                className="flex-1 py-3 bg-zinc-800 rounded-xl font-bold"
              >
                Maybe Later
              </button>
              <button 
                onClick={upgradeToPremium}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold hover:scale-105 transition-transform"
              >
                Upgrade - 2,500 $SHIT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How to Earn XP */}
      <div className="mt-8 bg-zinc-900/30 rounded-2xl p-6 border border-white/5">
        <h3 className="font-bold mb-4 text-lg">💪 How to Earn XP</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { action: 'Complete an Offer', xp: '+100 XP', icon: '🎯' },
            { action: 'Daily Check-in', xp: '+50 XP', icon: '📅' },
            { action: 'Refer a Friend', xp: '+200 XP', icon: '👥' },
            { action: 'Buy General Pass', xp: '+500 XP', icon: '⭐' },
            { action: 'Stake $SHIT', xp: '+75 XP/day', icon: '🔒' },
            { action: 'Win Leaderboard', xp: '+1000 XP', icon: '🏆' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl">
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <div className="font-medium">{item.action}</div>
              </div>
              <div className="text-amber-400 font-bold">{item.xp}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
