'use client';

import { useState, useCallback } from 'react';

export function useBalance() {
  const [shitBalance, setShitBalance] = useState(0);
  const [points, setPoints] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [lastDailyClaim, setLastDailyClaim] = useState<string | null>(null);
  const [hasClaimedAirdrop, setHasClaimedAirdrop] = useState(false);
  const [vipTier, setVipTier] = useState(0);

  const streakMultiplier = Math.min(Math.floor(dailyStreak / 2) * 5, 35);

  const loadBalanceData = useCallback((data: {
    shit_balance?: number;
    points?: number;
    total_earned?: number;
    daily_streak?: number;
    last_daily_claim?: string | null;
  }) => {
    if (data.shit_balance !== undefined) setShitBalance(Number(data.shit_balance) || 0);
    if (data.points !== undefined) setPoints(data.points || 0);
    if (data.total_earned !== undefined) setTotalEarned(Number(data.total_earned) || 0);
    if (data.daily_streak !== undefined) setDailyStreak(data.daily_streak || 0);
    if (data.last_daily_claim !== undefined) setLastDailyClaim(data.last_daily_claim);
  }, []);

  return {
    shitBalance, setShitBalance,
    points, setPoints,
    totalEarned, setTotalEarned,
    dailyStreak,
    lastDailyClaim,
    hasClaimedAirdrop, setHasClaimedAirdrop,
    vipTier, setVipTier,
    streakMultiplier,
    loadBalanceData,
  };
}
