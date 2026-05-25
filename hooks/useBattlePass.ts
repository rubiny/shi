'use client';

import { useState, useCallback } from 'react';
import { CONFIG } from '@/lib/config';
import { sfx } from '@/lib/sounds';
import { fireWinConfetti } from '@/lib/confetti';

export function useBattlePass(triggerSuccess: (msg: string) => void) {
  const [battlePassXP, setBattlePassXP] = useState(0);
  const [claimedTiers, setClaimedTiers] = useState<number[]>([]);

  const XP_PER_TIER = CONFIG.BUSINESS.BATTLE_PASS.XP_PER_TIER || 500;
  const MAX_TIER = CONFIG.BUSINESS.BATTLE_PASS.MAX_TIER || 20;
  const currentTier = Math.min(Math.floor(battlePassXP / XP_PER_TIER) + 1, MAX_TIER);
  const tierProgress = ((battlePassXP % XP_PER_TIER) / XP_PER_TIER) * 100;

  const gainBattlePassXP = useCallback((amount: number) => {
    setBattlePassXP(prev => {
      const newXP = prev + amount;
      const newTier = Math.min(Math.floor(newXP / XP_PER_TIER) + 1, MAX_TIER);
      const oldTier = Math.min(Math.floor(prev / XP_PER_TIER) + 1, MAX_TIER);
      if (newTier > oldTier) {
        sfx.levelUp();
        fireWinConfetti();
        setTimeout(() => triggerSuccess(`Battle Pass Tier ${newTier} unlocked!`), 200);
      }
      return newXP;
    });
  }, [XP_PER_TIER, MAX_TIER, triggerSuccess]);

  return {
    battlePassXP, setBattlePassXP,
    claimedTiers, setClaimedTiers,
    currentTier, tierProgress,
    XP_PER_TIER, MAX_TIER,
    gainBattlePassXP,
  };
}
