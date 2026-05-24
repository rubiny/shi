'use client';

import React, { useState } from 'react';

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  earnings: number;
  referrals: number;
  staked: number;
  country: string;
  isCurrentUser?: boolean;
}

const TOP_EARNERS: LeaderboardEntry[] = [
  { rank: 1, username: "ShitKing420", avatar: "👑", earnings: 2500000, referrals: 342, staked: 500000, country: "🇺🇸", isCurrentUser: false },
  { rank: 2, username: "CryptoPoop", avatar: "💎", earnings: 1890000, referrals: 256, staked: 420000, country: "🇬🇧", isCurrentUser: false },
  { rank: 3, username: "ToiletMaster", avatar: "🚽", earnings: 1450000, referrals: 198, staked: 380000, country: "🇩🇪", isCurrentUser: false },
  { rank: 4, username: "ShitSoldier", avatar: "🪖", earnings: 980000, referrals: 145, staked: 250000, country: "🇵🇱", isCurrentUser: false },
  { rank: 5, username: "PoopNinja", avatar: "🥷", earnings: 875000, referrals: 132, staked: 210000, country: "🇯🇵", isCurrentUser: false },
  { rank: 6, username: "GoldenThrone", avatar: "🏆", earnings: 720000, referrals: 98, staked: 180000, country: "🇨🇦", isCurrentUser: false },
  { rank: 7, username: "SepticTank", avatar: "🏭", earnings: 650000, referrals: 87, staked: 150000, country: "🇦🇺", isCurrentUser: false },
  { rank: 8, username: "PaperHands", avatar: "🧻", earnings: 520000, referrals: 76, staked: 120000, country: "🇫🇷", isCurrentUser: false },
  { rank: 9, username: "FlushForce", avatar: "🌊", earnings: 480000, referrals: 65, staked: 100000, country: "🇧🇷", isCurrentUser: false },
  { rank: 10, username: "You", avatar: "💩", earnings: 3240, referrals: 3, staked: 4500, country: "🇵🇱", isCurrentUser: true },
];

const TOP_REFERRERS: LeaderboardEntry[] = [
  { rank: 1, username: "ReferralGod", avatar: "🎯", earnings: 890000, referrals: 892, staked: 200000, country: "🇺🇸", isCurrentUser: false },
  { rank: 2, username: "ArmyBuilder", avatar: "🪖", earnings: 650000, referrals: 654, staked: 150000, country: "🇬🇧", isCurrentUser: false },
  { rank: 3, username: "ShitRecruiter", avatar: "📢", earnings: 520000, referrals: 521, staked: 120000, country: "🇩🇪", isCurrentUser: false },
  { rank: 4, username: "You", avatar: "💩", earnings: 3240, referrals: 3, staked: 4500, country: "🇵🇱", isCurrentUser: true },
];

const TOP_STAKERS: LeaderboardEntry[] = [
  { rank: 1, username: "DiamondHands", avatar: "💎", earnings: 1200000, referrals: 45, staked: 2000000, country: "🇨🇭", isCurrentUser: false },
  { rank: 2, username: "HODLer", avatar: "🔒", earnings: 980000, referrals: 32, staked: 1500000, country: "🇸🇬", isCurrentUser: false },
  { rank: 3, username: "LongTerm", avatar: "📅", earnings: 750000, referrals: 28, staked: 1200000, country: "🇯🇵", isCurrentUser: false },
  { rank: 4, username: "You", avatar: "💩", earnings: 3240, referrals: 3, staked: 4500, country: "🇵🇱", isCurrentUser: true },
];

const CATEGORIES = [
  { id: 'earners', label: 'TOP LOOTERS', icon: '💰', data: TOP_EARNERS },
  { id: 'referrals', label: 'ARMY BUILDERS', icon: '👥', data: TOP_REFERRERS },
  { id: 'stakers', label: 'DIAMOND HANDS', icon: '🔒', data: TOP_STAKERS },
];

export default function Leaderboard({ userId }: { userId: string }) {
  const [activeCategory, setActiveCategory] = useState('earners');
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'all'>('week');
  const [showShareModal, setShowShareModal] = useState(false);

  const currentData = CATEGORIES.find(c => c.id === activeCategory)?.data || TOP_EARNERS;
  const userRank = currentData.find(u => u.isCurrentUser);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="text-6xl mb-2">🏆</div>
        <h1 className="text-4xl sm:text-5xl font-black mb-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
          HALL OF DEGENS
        </h1>
        <p className="text-zinc-400">flex on normies. climb the ranks. or stay poor.</p>
      </div>

      {/* Your Rank Card */}
      {userRank && (
        <div className="mb-8 p-6 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 rounded-3xl border border-amber-500/30">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-3xl">
              {userRank.avatar}
            </div>
            <div className="flex-1">
              <div className="text-amber-400 text-sm font-bold mb-1">YOUR RANK</div>
              <div className="text-2xl font-black">#{userRank.rank} in {CATEGORIES.find(c => c.id === activeCategory)?.label}</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-amber-400">{userRank.earnings.toLocaleString()}</div>
              <div className="text-xs text-zinc-500">$SHIT earned</div>
            </div>
          </div>
          
          {/* Progress to next rank */}
          {userRank.rank > 1 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400">Progress to rank #{userRank.rank - 1}</span>
                <span className="text-amber-400">
                  {((userRank.earnings / currentData[userRank.rank - 2].earnings) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                  style={{ width: `${Math.min((userRank.earnings / currentData[userRank.rank - 2].earnings) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              activeCategory === cat.id
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                : 'bg-zinc-800/50 text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            <span className="mr-2">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Time Frame */}
      <div className="flex justify-center gap-2 mb-6">
        {[
          { id: 'week', label: 'This Week' },
          { id: 'month', label: 'This Month' },
          { id: 'all', label: 'All Time' },
        ].map((tf) => (
          <button
            key={tf.id}
            onClick={() => setTimeFrame(tf.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              timeFrame === tf.id
                ? 'bg-zinc-700 text-white'
                : 'bg-zinc-800/50 text-zinc-500 hover:text-white'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {currentData.map((entry, index) => {
          const isTop3 = entry.rank <= 3;
          const isCurrentUser = entry.isCurrentUser;
          
          return (
            <div 
              key={entry.username}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                isCurrentUser
                  ? 'bg-amber-500/10 border border-amber-500/50'
                  : isTop3
                    ? 'bg-zinc-900/50 border border-zinc-700'
                    : 'bg-zinc-900/30 border border-white/5 hover:bg-zinc-900/50'
              }`}
            >
              {/* Rank */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black ${
                entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-black' :
                entry.rank === 2 ? 'bg-gradient-to-br from-zinc-300 to-zinc-400 text-black' :
                entry.rank === 3 ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white' :
                'bg-zinc-800 text-zinc-500'
              }`}>
                {entry.rank <= 3 ? '🏆' : entry.rank}
              </div>
              
              {/* Avatar & Name */}
              <div className="flex items-center gap-3 flex-1">
                <div className="text-3xl">{entry.avatar}</div>
                <div>
                  <div className={`font-bold ${isCurrentUser ? 'text-amber-400' : ''}`}>
                    {entry.username} {isCurrentUser && '(You)'}
                  </div>
                  <div className="text-xs text-zinc-500">{entry.country}</div>
                </div>
              </div>
              
              {/* Stats */}
              <div className="text-right">
                <div className="text-xl font-black text-amber-400">
                  {activeCategory === 'earners' && `${entry.earnings.toLocaleString()} LOOTED`}
                  {activeCategory === 'referrals' && `${entry.referrals} DEGENS`}
                  {activeCategory === 'stakers' && `${entry.staked.toLocaleString()} LOCKED`}
                </div>
                <div className="text-xs text-zinc-500">
                  {activeCategory === 'earners' && `${entry.referrals} army • ${entry.staked.toLocaleString()} bags locked`}
                  {activeCategory === 'referrals' && `${entry.earnings.toLocaleString()} looted`}
                  {activeCategory === 'stakers' && `${entry.earnings.toLocaleString()} looted`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Share Button */}
      <div className="mt-8 text-center">
        <button 
          onClick={() => setShowShareModal(true)}
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl font-bold hover:scale-105 transition-transform"
        >
          📤 Share Your Rank
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl max-w-md w-full border border-white/10 p-6">
            <h2 className="text-2xl font-black mb-4 text-center">Share Your Achievement</h2>
            <div className="p-4 bg-zinc-800/50 rounded-2xl mb-4 text-center">
              <div className="text-4xl mb-2">🏆</div>
              <div className="text-lg font-bold">I'm ranked #{userRank?.rank} on Shit Army!</div>
              <div className="text-amber-400">{userRank?.earnings.toLocaleString()} $SHIT earned</div>
            </div>
            <div className="flex gap-3">
              {['Twitter', 'Discord', 'Copy'].map((platform) => (
                <button 
                  key={platform}
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold"
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
