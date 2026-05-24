'use client';

import { useState, useCallback } from 'react';
import type { StakedPosition, Transaction } from '@/lib/types';
import { sfx } from '@/lib/sounds';

interface UseStakingOptions {
  shitBalance: number;
  setShitBalance: React.Dispatch<React.SetStateAction<number>>;
  triggerSuccess: (msg: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
  gainBattlePassXP: (amount: number) => void;
  updateQuestProgress: (type: 'offer' | 'stake' | 'market' | 'referral', increment?: number) => void;
}

export function useStaking({ shitBalance, setShitBalance, triggerSuccess, addTransaction, gainBattlePassXP, updateQuestProgress }: UseStakingOptions) {
  const [stakedPositions, setStakedPositions] = useState<StakedPosition[]>([]);
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakeLock, setStakeLock] = useState(30);

  const stakeTokens = useCallback(() => {
    const amount = parseInt(stakeAmount);
    if (!amount || amount <= 0) {
      triggerSuccess('Enter a valid amount to stake');
      return;
    }
    if (amount > shitBalance) {
      triggerSuccess('Not enough $SHIT to stake!');
      return;
    }
    const apy = stakeLock === 7 ? 32 : stakeLock === 30 ? 48 : 67;
    const newPosition: StakedPosition = {
      id: Date.now(), amount, lockDays: stakeLock, apy,
      unlockDate: new Date(Date.now() + stakeLock * 86400000).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      rewards: Math.floor(amount * apy / 1200),
    };
    setStakedPositions(prev => [...prev, newPosition]);
    setShitBalance(prev => prev - amount);
    setStakeAmount('');
    sfx.purchase();
    triggerSuccess(`Staked ${amount} $SHIT for ${stakeLock} days! ${apy}% APY`);
    addTransaction({ type: 'stake', amount: -amount, description: `Staked ${amount} $SHIT (${stakeLock} days, ${apy}% APY)`, status: 'completed' });
    gainBattlePassXP(30);
    updateQuestProgress('stake');
  }, [stakeAmount, shitBalance, stakeLock, setShitBalance, triggerSuccess, addTransaction, gainBattlePassXP, updateQuestProgress]);

  const loadStakedPositions = useCallback((positions: StakedPosition[]) => {
    setStakedPositions(positions);
  }, []);

  return {
    stakedPositions, setStakedPositions,
    stakeAmount, setStakeAmount,
    stakeLock, setStakeLock,
    stakeTokens, loadStakedPositions,
  };
}
