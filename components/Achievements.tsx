'use client';

import React, { useState } from 'react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'offers' | 'social' | 'staking' | 'referrals' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  progress: number;
  max: number;
  reward: number;
  unlocked: boolean;
  unlockedAt?: string;
}

const ACHIEVEMENTS: Achievement[] = [
  // Common - Offers
  { id: 'offer-1', title: 'First Shit', description: 'Complete your first offer', category: 'offers', rarity: 'common', icon: '💩', progress: 1, max: 1, reward: 100, unlocked: true, unlockedAt: '2026-05-20' },
  { id: 'offer-5', title: 'Shit Starter', description: 'Complete 5 offers', category: 'offers', rarity: 'common', icon: '🚽', progress: 5, max: 5, reward: 250, unlocked: true, unlockedAt: '2026-05-21' },
  { id: 'offer-25', title: 'Offer Grinder', description: 'Complete 25 offers', category: 'offers', rarity: 'common', icon: '🎯', progress: 12, max: 25, reward: 500, unlocked: false },
  { id: 'offer-100', title: 'Shit Machine', description: 'Complete 100 offers', category: 'offers', rarity: 'rare', icon: '🤖', progress: 12, max: 100, reward: 2000, unlocked: false },
  { id: 'offer-500', title: 'Legendary Pooper', description: 'Complete 500 offers', category: 'offers', rarity: 'legendary', icon: '👑', progress: 12, max: 500, reward: 10000, unlocked: false },
  
  // Social
  { id: 'social-discord', title: 'Discord Pooper', description: 'Connect Discord account', category: 'social', rarity: 'common', icon: '💬', progress: 1, max: 1, reward: 100, unlocked: true },
  { id: 'social-twitter', title: 'Tweet Shit', description: 'Connect Twitter account', category: 'social', rarity: 'common', icon: '🐦', progress: 1, max: 1, reward: 100, unlocked: true },
  { id: 'social-all', title: 'Social Shitter', description: 'Connect all 3 social accounts', category: 'social', rarity: 'rare', icon: '🌐', progress: 2, max: 3, reward: 500, unlocked: false },
  
  // Staking
  { id: 'stake-1k', title: 'First Stake', description: 'Stake 1,000 $SHIT', category: 'staking', rarity: 'common', icon: '🔒', progress: 1000, max: 1000, reward: 200, unlocked: true },
  { id: 'stake-10k', title: 'Diamond Hands', description: 'Stake 10,000 $SHIT', category: 'staking', rarity: 'rare', icon: '💎', progress: 4500, max: 10000, reward: 1000, unlocked: false },
  { id: 'stake-90d', title: 'Long Term Holder', description: 'Stake for 90 days total', category: 'staking', rarity: 'epic', icon: '📅', progress: 30, max: 90, reward: 2500, unlocked: false },
  
  // Referrals
  { id: 'ref-1', title: 'First Recruit', description: 'Refer your first friend', category: 'referrals', rarity: 'common', icon: '👤', progress: 1, max: 1, reward: 250, unlocked: true },
  { id: 'ref-10', title: 'Squad Leader', description: 'Refer 10 friends', category: 'referrals', rarity: 'rare', icon: '👥', progress: 3, max: 10, reward: 1000, unlocked: false },
  { id: 'ref-50', title: 'Army General', description: 'Refer 50 friends', category: 'referrals', rarity: 'legendary', icon: '🎖️', progress: 3, max: 50, reward: 5000, unlocked: false },
  
  // Special
  { id: 'special-night', title: 'Night Owl', description: 'Complete offer at 3AM', category: 'special', rarity: 'epic', icon: '🦉', progress: 0, max: 1, reward: 500, unlocked: false },
  { id: 'special-lucky', title: 'Lucky Shit', description: 'Get 3x boost on offer', category: 'special', rarity: 'rare', icon: '🍀', progress: 0, max: 1, reward: 300, unlocked: false },
  { id: 'special-og', title: 'OG Pooper', description: 'Join in first 1000 users', category: 'special', rarity: 'legendary', icon: '🔥', progress: 1, max: 1, reward: 2500, unlocked: true },
];

const RARITY_COLORS = {
  common: 'from-zinc-600 to-zinc-500',
  rare: 'from-blue-600 to-cyan-500',
  epic: 'from-purple-600 to-pink-500',
  legendary: 'from-amber-500 via-orange-500 to-red-500',
};

const RARITY_TEXT = {
  common: 'text-zinc-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-amber-400',
};

export default function Achievements({ userId }: { userId: string }) {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [category, setCategory] = useState<string>('all');
  const [claiming, setClaiming] = useState<string | null>(null);

  const filtered = ACHIEVEMENTS.filter(a => {
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'locked') return !a.unlocked;
    return true;
  }).filter(a => {
    if (category === 'all') return true;
    return a.category === category;
  });

  const unlocked = ACHIEVEMENTS.filter(a => a.unlocked).length;
  const total = ACHIEVEMENTS.length;
  const totalRewards = ACHIEVEMENTS.filter(a => a.unlocked).reduce((sum, a) => sum + a.reward, 0);

  const claimReward = (id: string) => {
    setClaiming(id);
    setTimeout(() => setClaiming(null), 1000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="text-5xl mb-2">🏆</div>
        <h1 className="text-4xl sm:text-5xl font-black mb-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
          Achievements
        </h1>
        <p className="text-zinc-400">Prove your worth in the Shit Army</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/10 text-center">
          <div className="text-3xl font-black text-amber-400">{unlocked}/{total}</div>
          <div className="text-xs text-zinc-500 uppercase">Unlocked</div>
        </div>
        <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/10 text-center">
          <div className="text-3xl font-black text-emerald-400">{totalRewards.toLocaleString()}</div>
          <div className="text-xs text-zinc-500 uppercase">$SHIT Earned</div>
        </div>
        <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/10 text-center">
          <div className="text-3xl font-black text-purple-400">{ACHIEVEMENTS.filter(a => a.rarity === 'legendary' && a.unlocked).length}</div>
          <div className="text-xs text-zinc-500 uppercase">Legendary</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/10 mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-zinc-400">Collection Progress</span>
          <span className="text-amber-400 font-bold">{Math.round((unlocked/total)*100)}%</span>
        </div>
        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-1000"
            style={{ width: `${(unlocked/total)*100}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { id: 'all', label: 'All', count: total },
          { id: 'unlocked', label: 'Unlocked', count: unlocked },
          { id: 'locked', label: 'Locked', count: total - unlocked },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              filter === f.id
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                : 'bg-zinc-800/50 text-zinc-400 hover:text-white'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
        
        <div className="w-px h-10 bg-white/10 mx-2" />
        
        {['all', 'offers', 'social', 'staking', 'referrals', 'special'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              category === cat
                ? 'bg-zinc-700 text-white'
                : 'bg-zinc-800/30 text-zinc-500 hover:text-white'
            }`}
          >
            {cat === 'all' ? '🌟 All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ach) => {
          const progress = (ach.progress / ach.max) * 100;
          const isClaiming = claiming === ach.id;
          
          return (
            <div 
              key={ach.id}
              className={`group relative p-5 rounded-2xl border transition-all duration-300 ${
                ach.unlocked
                  ? 'bg-zinc-900/50 border-amber-500/30 hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/10'
                  : 'bg-zinc-900/20 border-white/5 opacity-70'
              }`}
            >
              {/* Rarity Glow */}
              <div className={`absolute -inset-px bg-gradient-to-r ${RARITY_COLORS[ach.rarity]} opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity blur-xl`} />
              
              <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
                    ach.unlocked 
                      ? 'bg-gradient-to-br from-amber-500 to-orange-600' 
                      : 'bg-zinc-800'
                  }`}>
                    <span className={ach.unlocked ? '' : 'grayscale'}>{ach.icon}</span>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-xs font-bold uppercase ${RARITY_TEXT[ach.rarity]}`}>
                      {ach.rarity}
                    </div>
                    <div className="text-amber-400 font-bold">+{ach.reward} $SHIT</div>
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="font-bold text-lg mb-1">{ach.title}</h3>
                <p className="text-sm text-zinc-400 mb-3">{ach.description}</p>
                
                {/* Progress */}
                {!ach.unlocked && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-500">Progress</span>
                      <span className="text-amber-400">{ach.progress}/{ach.max}</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Footer */}
                <div className="flex items-center justify-between">
                  {ach.unlocked ? (
                    <div className="flex items-center gap-2 text-emerald-400 text-sm">
                      <span>✓</span>
                      <span>Unlocked {ach.unlockedAt && `• ${new Date(ach.unlockedAt).toLocaleDateString()}`}</span>
                    </div>
                  ) : (
                    <span className="text-zinc-500 text-sm">🔒 Locked</span>
                  )}
                  
                  {ach.unlocked && (
                    <button 
                      onClick={() => claimReward(ach.id)}
                      className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                        isClaiming
                          ? 'bg-emerald-500 scale-95'
                          : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white'
                      }`}
                    >
                      {isClaiming ? '💰 CLAIMED!' : 'CLAIM'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
        {Object.entries(RARITY_COLORS).map(([rarity, gradient]) => (
          <div key={rarity} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${gradient}`} />
            <span className={`${RARITY_TEXT[rarity as keyof typeof RARITY_TEXT]} uppercase font-bold`}>
              {rarity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
