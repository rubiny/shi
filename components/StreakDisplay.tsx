'use client';

import React, { useState, useEffect } from 'react';

export default function StreakDisplay() {
  const [loginStreak, setLoginStreak] = useState(5);
  const [offerStreak, setOfferStreak] = useState(3);
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 42 });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      });

      // Show warning if less than 2 hours left
      if (diff < 2 * 60 * 60 * 1000 && !showWarning) {
        setShowWarning(true);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getStreakReward = (days: number) => {
    if (days >= 30) return { multiplier: 3, bonus: 1000 };
    if (days >= 14) return { multiplier: 2.5, bonus: 500 };
    if (days >= 7) return { multiplier: 2, bonus: 250 };
    if (days >= 3) return { multiplier: 1.5, bonus: 100 };
    return { multiplier: 1, bonus: 0 };
  };

  const loginReward = getStreakReward(loginStreak);
  const offerReward = getStreakReward(offerStreak);

  return (
    <div className="mb-6 space-y-4">
      {/* Login Streak */}
      <div className="bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-orange-500/20 rounded-2xl p-4 border border-orange-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <div>
              <div className="font-bold text-lg">Login Streak</div>
              <div className="text-sm text-orange-400">
                Day {loginStreak} • {loginReward.multiplier}x XP boost active
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-orange-400">{loginStreak}</div>
            <div className="text-xs text-zinc-500">days</div>
          </div>
        </div>
        
        {/* Flame animation for streak days */}
        <div className="flex gap-1 mb-3">
          {[...Array(7)].map((_, i) => (
            <div 
              key={i}
              className={`flex-1 h-2 rounded-full ${
                i < loginStreak % 7 || (loginStreak >= 7 && i === 6)
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 animate-pulse'
                  : 'bg-zinc-700'
              }`}
            />
          ))}
        </div>

        {/* Milestones */}
        <div className="flex justify-between text-xs">
          <span className={loginStreak >= 3 ? 'text-orange-400' : 'text-zinc-600'}>3d: +50%</span>
          <span className={loginStreak >= 7 ? 'text-orange-400' : 'text-zinc-600'}>7d: 2x +250 $SHIT</span>
          <span className={loginStreak >= 14 ? 'text-orange-400' : 'text-zinc-600'}>14d: 2.5x</span>
          <span className={loginStreak >= 30 ? 'text-orange-400' : 'text-zinc-600'}>30d: 3x +1000</span>
        </div>
      </div>

      {/* Offer Streak */}
      <div className="bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 rounded-2xl p-4 border border-emerald-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            <div>
              <div className="font-bold text-lg">Offer Streak</div>
              <div className="text-sm text-emerald-400">
                {offerStreak} days in a row • {offerReward.multiplier}x rewards
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-emerald-400">{offerStreak}</div>
            <div className="text-xs text-zinc-500">offers</div>
          </div>
        </div>

        {/* Progress to next milestone */}
        <div className="mb-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-500">Progress to next bonus</span>
            <span className="text-emerald-400">{offerStreak % 7}/7</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
              style={{ width: `${((offerStreak % 7) / 7) * 100}%` }}
            />
          </div>
        </div>

        <div className="text-xs text-zinc-500">
          Complete at least 1 offer today to keep your streak!
        </div>
      </div>

      {/* Urgency Warning */}
      {showWarning && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⏰</span>
            <div className="flex-1">
              <div className="font-bold text-red-400">Don't Break Your Streak!</div>
              <div className="text-sm text-zinc-400">
                Only {timeLeft.hours}h {timeLeft.minutes}m left to log in and complete an offer
              </div>
            </div>
            <button className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-bold">
              Do Offer Now
            </button>
          </div>
        </div>
      )}

      {/* Streak Rewards Preview */}
      <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/10">
        <div className="text-sm font-bold mb-3 text-zinc-400">Next Rewards</div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { days: 7, reward: '+250 $SHIT', icon: '💰', current: loginStreak >= 7 },
            { days: 14, reward: '2.5x Boost', icon: '⚡', current: loginStreak >= 14 },
            { days: 30, reward: '+1000 $SHIT', icon: '🏆', current: loginStreak >= 30 },
          ].map((item) => (
            <div 
              key={item.days}
              className={`p-3 rounded-xl text-center ${
                item.current 
                  ? 'bg-emerald-500/20 border border-emerald-500/30' 
                  : 'bg-zinc-800/50'
              }`}
            >
              <div className="text-xl mb-1">{item.icon}</div>
              <div className={`text-xs font-bold ${item.current ? 'text-emerald-400' : 'text-zinc-500'}`}>
                {item.days}d
              </div>
              <div className="text-[10px] text-zinc-400">{item.reward}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
