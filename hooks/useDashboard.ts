'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, subscribeToBalance, subscribeToOffers, callEdgeFunction } from '@/lib/supabase';
import { CONFIG } from '@/lib/config';
import type { StakedPosition, Transaction, Quest, OfferBoost, ActiveOffer, Offer, OwnedNFT, MarketplaceListing } from '@/lib/types';
import { MARKETPLACE_LISTINGS, LEADERBOARD } from '@/lib/constants';
import { sfx } from '@/lib/sounds';
import { fireWinConfetti, firePurchaseConfetti } from '@/lib/confetti';

// Composed hooks
import { useBalance } from './useBalance';
import { useNotifications } from './useNotifications';
import { useTransactions } from './useTransactions';
import { useBattlePass } from './useBattlePass';
import { useStaking } from './useStaking';

export function useDashboard() {
  // Composed hooks
  const balance = useBalance();
  const notif = useNotifications();
  const txs = useTransactions();
  const bp = useBattlePass(notif.triggerSuccess);

  // User & Auth
  const [userId, setUserId] = useState<string | null>(null);
  const [isGeneral, setIsGeneral] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingOffers] = useState(false);
  const [kycStatus, setKycStatus] = useState<'none' | 'pending' | 'verified' | 'rejected'>('none');

  // Offers
  const [offers, setOffers] = useState<Offer[]>([]);
  const [userOffers, setUserOffers] = useState<Array<Record<string, unknown>>>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [offerBoosts, setOfferBoosts] = useState<OfferBoost[]>([]);
  const [activeOffers, setActiveOffers] = useState<ActiveOffer[]>([]);

  // Army & Market
  const [activeMissions, setActiveMissions] = useState(2);
  const [squadPower, setSquadPower] = useState(450);
  const [activeBoosts, setActiveBoosts] = useState<Array<{ name: string; effect: string; expiresAt: Date }>>([]);
  const [marketListings, setMarketListings] = useState(MARKETPLACE_LISTINGS);
  const [ownedNFTs, setOwnedNFTs] = useState<OwnedNFT[]>([]);
  const [leaderboard] = useState(LEADERBOARD);

  // Quest progress
  const updateQuestProgress = useCallback((type: 'offer' | 'stake' | 'market' | 'referral', increment: number = 1) => {
    setQuests(prev => prev.map(q => {
      if (q.claimed) return q;
      let shouldIncrement = false;
      if (type === 'offer' && q.title.toLowerCase().includes('offer')) shouldIncrement = true;
      if (type === 'stake' && q.title.toLowerCase().includes('stake')) shouldIncrement = true;
      if (type === 'market' && q.title.toLowerCase().includes('marketplace')) shouldIncrement = true;
      if (type === 'referral' && q.title.toLowerCase().includes('refer')) shouldIncrement = true;
      if (q.category === 'milestone' && q.title.toLowerCase().includes('shit general') && type === 'offer') shouldIncrement = true;
      if (!shouldIncrement) return q;
      return { ...q, progress: Math.min(q.max, q.progress + increment) };
    }));
  }, []);

  // Staking (composed)
  const staking = useStaking({
    shitBalance: balance.shitBalance,
    setShitBalance: balance.setShitBalance,
    triggerSuccess: notif.triggerSuccess,
    addTransaction: txs.addTransaction,
    gainBattlePassXP: bp.gainBattlePassXP,
    updateQuestProgress,
  });

  // Fetch user data from Supabase
  const fetchUserData = useCallback(async (uid: string) => {
    try {
      setLoading(true);
      const [profileRes, balanceRes, kycRes, offersRes, userOffersRes, questsRes, transactionsRes, bpRes, stakingRes, boostsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', uid).single(),
        supabase.from('user_balances').select('*').eq('user_id', uid).single(),
        supabase.from('kyc_verifications').select('*').eq('user_id', uid).single(),
        supabase.from('offers').select('*, offer_boosts(*)').eq('is_active', true),
        supabase.from('user_offers').select('*, offers(*)').eq('user_id', uid).in('status', ['started', 'in_progress', 'completed']),
        supabase.from('user_quests').select('*, quests(*)').eq('user_id', uid),
        supabase.from('transactions').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(50),
        supabase.from('user_battle_pass').select('*').eq('user_id', uid).single(),
        supabase.from('staking_positions').select('*').eq('user_id', uid).eq('is_unstaked', false),
        supabase.from('offer_boosts').select('*, offers(id)').eq('is_active', true).gt('expires_at', new Date().toISOString()),
      ]);

      if (profileRes.data) {
        setIsGeneral(profileRes.data.is_general && (!profileRes.data.general_expires_at || new Date(profileRes.data.general_expires_at) > new Date()));
      }
      if (balanceRes.data) {
        balance.loadBalanceData(balanceRes.data);
      }
      if (kycRes.data) setKycStatus(kycRes.data.status || 'none');
      if (offersRes.data) setOffers(offersRes.data);
      if (userOffersRes.data) {
        setUserOffers(userOffersRes.data);
        setActiveOffers(userOffersRes.data.map((uo: Record<string, unknown>) => ({
          id: uo.id as string,
          offerId: uo.offer_id as number,
          progress: uo.progress as number,
          status: uo.status as ActiveOffer['status'],
          startedAt: new Date(uo.started_at as string),
          estimatedReward: uo.reward as number,
          userOfferId: uo.id as string,
        })));
      }
      if (questsRes.data) {
        setQuests(questsRes.data.map((uq: Record<string, unknown>) => {
          const q = uq.quests as Record<string, unknown>;
          return {
            id: q.id as number,
            title: q.title as string,
            description: q.description as string,
            category: q.category as Quest['category'],
            progress: uq.progress as number,
            max: q.max_progress as number,
            reward: q.reward as number,
            icon: q.icon as string,
            claimed: uq.is_claimed as boolean,
            completed: (uq.progress as number) >= (q.max_progress as number),
          };
        }));
      }
      if (transactionsRes.data) {
        txs.loadTransactions(transactionsRes.data.map((t: Record<string, unknown>) => ({
          id: t.id as string,
          type: t.type as Transaction['type'],
          amount: t.amount as number,
          description: t.description as string,
          timestamp: new Date(t.created_at as string),
          status: t.status as Transaction['status'],
        })));
      }
      if (bpRes.data) {
        bp.setBattlePassXP(bpRes.data.xp || 0);
        bp.setClaimedTiers(bpRes.data.claimed_tiers || []);
      }
      if (stakingRes.data) {
        staking.loadStakedPositions(stakingRes.data.map((s: Record<string, unknown>) => ({
          id: s.id as number,
          amount: Number(s.amount),
          lockDays: s.lock_days as number,
          apy: s.apy as number,
          unlockDate: new Date(s.unlock_at as string).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          rewards: Number(s.estimated_reward) || 0,
        })));
      }
      if (boostsRes.data) {
        setOfferBoosts(boostsRes.data.map((b: Record<string, unknown>) => ({
          id: b.id as string,
          offerId: (b.offers as Record<string, unknown>)?.id as number,
          multiplier: b.multiplier as 2 | 3,
          expiresAt: new Date(b.expires_at as string),
        })));
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [balance, txs, bp, staking]);

  // Mock data for development
  const loadMockData = useCallback(() => {
    balance.loadBalanceData({ shit_balance: 1247, points: 8740, total_earned: 3240, daily_streak: 7, last_daily_claim: new Date(Date.now() - 86400000).toISOString() });
    bp.setBattlePassXP(1850);
    bp.setClaimedTiers([1, 2]);
    setKycStatus('none');

    setQuests([
      { id: 1, title: 'Complete 2 Offers', description: 'Finish any 2 offers from the offerwall', category: 'daily', progress: 1, max: 2, reward: 300, icon: '\u26A1', claimed: false },
      { id: 2, title: 'Stake 100 $SHIT', description: 'Lock 100 $SHIT in any staking pool', category: 'daily', progress: 0, max: 1, reward: 200, icon: '\u{1F3C6}', claimed: false },
      { id: 3, title: 'Visit Marketplace', description: 'Browse the NFT marketplace', category: 'daily', progress: 1, max: 1, reward: 50, icon: '\u{1F6D2}', claimed: true, completed: true },
      { id: 4, title: 'Complete 10 Offers', description: 'Finish 10 offers this week', category: 'weekly', progress: 4, max: 10, reward: 1500, icon: '\u{1F525}', claimed: false },
      { id: 5, title: 'Earn 5,000 $SHIT', description: 'Reach 5,000 total earned this week', category: 'weekly', progress: 3240, max: 5000, reward: 2000, icon: '\u{1F4B0}', claimed: false },
      { id: 6, title: 'Refer 5 Friends', description: 'Get 5 friends to join Shit Army', category: 'weekly', progress: 3, max: 5, reward: 2500, icon: '\u{1F465}', claimed: false },
      { id: 7, title: 'First Shit', description: 'Complete your first offer ever', category: 'milestone', progress: 1, max: 1, reward: 500, icon: '\u{1F4A9}', claimed: true, completed: true },
      { id: 8, title: 'Offerwall Legend', description: 'Complete 50 offers total', category: 'milestone', progress: 12, max: 50, reward: 5000, icon: '\u{1F3C6}', claimed: false },
      { id: 9, title: 'Diamond Hands', description: 'Stake $SHIT for 90 days total', category: 'milestone', progress: 30, max: 90, reward: 10000, icon: '\u{1F48E}', claimed: false },
      { id: 10, title: 'Shit General', description: 'Reach 100,000 $SHIT earned', category: 'milestone', progress: 3240, max: 100000, reward: 25000, icon: '\u2B50', claimed: false },
    ]);

    txs.loadTransactions([
      { id: 'tx-1', type: 'offer', amount: 175, description: 'Crypto Habits Survey 2026', timestamp: new Date(Date.now() - 1000 * 60 * 30), status: 'completed' },
      { id: 'tx-2', type: 'daily', amount: 290, description: 'Daily bonus (Streak: 7)', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), status: 'completed' },
      { id: 'tx-3', type: 'stake', amount: -450, description: 'Staked 450 $SHIT (30 days)', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), status: 'completed' },
      { id: 'tx-4', type: 'quest', amount: 120, description: 'Complete 2 Offers quest', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26), status: 'completed' },
    ]);

    setOfferBoosts([
      { id: 'boost-1', offerId: 1, multiplier: 2, expiresAt: new Date(Date.now() + 1000 * 60 * 45) },
      { id: 'boost-2', offerId: 3, multiplier: 3, expiresAt: new Date(Date.now() + 1000 * 60 * 120) },
    ]);

    setActiveOffers([
      { id: 'ao-1', offerId: 2, progress: 35, status: 'in_progress', startedAt: new Date(Date.now() - 1000 * 60 * 5), estimatedReward: 2100 },
    ]);

    staking.loadStakedPositions([
      { id: 1, amount: 450, lockDays: 30, apy: 48, unlockDate: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }), rewards: 18.4 },
    ]);

    setOwnedNFTs([
      { id: 1, name: 'Poop Soldier #1001', rank: 'Rare', power: 52 },
      { id: 2, name: 'Poop Soldier #1002', rank: 'Epic', power: 78 },
    ]);

    notif.addNotification('Welcome back!', 'Your 7-day streak continues', 'info');
    notif.addNotification('Offer completed', 'Crypto Habits Survey 2026 — +175 $SHIT', 'success');
  }, [balance, bp, txs, staking, notif]);

  // Init
  useEffect(() => {
    const initUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          await fetchUserData(user.id);
        } else {
          if (process.env.NODE_ENV === 'development') {
            loadMockData();
          }
          setLoading(false);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Auth error:', error);
        setLoading(false);
      }
    };
    initUser();
  }, [fetchUserData, loadMockData]);

  // Realtime subscriptions
  useEffect(() => {
    if (!userId) return;
    const balanceSubscription = subscribeToBalance(userId, (newBalance) => {
      balance.loadBalanceData(newBalance);
    });
    const offerSubscription = subscribeToOffers(userId, () => {
      notif.triggerSuccess('Offer completed! Points credited.');
      fetchUserData(userId);
    });
    return () => {
      balanceSubscription?.unsubscribe();
      offerSubscription?.unsubscribe();
    };
  }, [userId, fetchUserData, notif, balance]);

  // Rate limit for convert
  const [lastConvertTime, setLastConvertTime] = useState(0);

  // Actions
  const convertPoints = useCallback(() => {
    const now = Date.now();
    if (now - lastConvertTime < 30000) {
      notif.triggerSuccess('Slow down ser! Wait 30s between converts');
      return;
    }
    const exchangeRate = CONFIG.BUSINESS.OFFERWALL.EXCHANGE_RATE;
    const minConvert = CONFIG.BUSINESS.OFFERWALL.MIN_CONVERT;
    if (balance.points < minConvert) {
      notif.triggerSuccess(`Need at least ${minConvert} PTS to convert!`);
      return;
    }
    const shitEarned = Math.floor(balance.points / exchangeRate);
    balance.setShitBalance(prev => prev + shitEarned);
    balance.setTotalEarned(prev => prev + shitEarned);
    balance.setPoints(0);
    setLastConvertTime(now);
    sfx.purchase();
    notif.triggerSuccess(`Converted ${balance.points} PTS \u2192 ${shitEarned} $SHIT!`);
    txs.addTransaction({ type: 'offer', amount: shitEarned, description: `Converted ${balance.points} PTS to $SHIT`, status: 'completed' });
  }, [balance, lastConvertTime, notif, txs]);

  const claimDailyBonus = useCallback(async () => {
    if (!userId) {
      if (balance.lastDailyClaim && new Date(balance.lastDailyClaim).toDateString() === new Date().toDateString()) {
        notif.triggerSuccess('Daily bonus already claimed today!');
        return;
      }
      const baseAmount = CONFIG.BUSINESS.DAILY_BONUS.BASE_AMOUNT;
      const streakBonus = Math.floor(baseAmount * balance.streakMultiplier / 100);
      const total = baseAmount + streakBonus;
      balance.setShitBalance(prev => prev + total);
      balance.setTotalEarned(prev => prev + total);
      sfx.win();
      fireWinConfetti();
      notif.triggerSuccess(`Daily bonus! +${total} $SHIT (Streak: ${balance.dailyStreak + 1} days)`);
      txs.addTransaction({ type: 'daily', amount: total, description: `Daily bonus (Streak: ${balance.dailyStreak + 1})`, status: 'completed' });
      bp.gainBattlePassXP(20);
      return;
    }
    try {
      if (balance.lastDailyClaim && new Date(balance.lastDailyClaim).toDateString() === new Date().toDateString()) {
        notif.triggerSuccess('Daily bonus already claimed today!');
        return;
      }
      const { data, error } = await supabase.rpc('claim_daily_bonus', { p_user_id: userId });
      if (error) throw error;
      if (data.success) {
        sfx.win();
        fireWinConfetti();
        notif.triggerSuccess(`Daily bonus claimed! +${data.shit_earned} $SHIT (Streak: ${data.new_streak} days)`);
        await fetchUserData(userId);
      } else {
        notif.triggerSuccess('Failed to claim daily bonus');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Daily bonus error:', error);
      notif.triggerSuccess('Failed to claim daily bonus');
    }
  }, [userId, balance, notif, txs, bp, fetchUserData]);

  const claimAirdrop = useCallback(() => {
    if (balance.totalEarned < 5000 || balance.hasClaimedAirdrop) return;
    const airdropAmount = balance.totalEarned >= 25000 ? 1500 : balance.totalEarned >= 10000 ? 600 : 250;
    balance.setShitBalance(prev => prev + airdropAmount);
    balance.setTotalEarned(prev => prev + airdropAmount);
    balance.setHasClaimedAirdrop(true);
    sfx.levelUp();
    fireWinConfetti();
    notif.triggerSuccess(`Airdrop claimed! +${airdropAmount} $SHIT`);
    txs.addTransaction({ type: 'airdrop', amount: airdropAmount, description: `Airdrop claim (${balance.totalEarned >= 25000 ? 'Legendary' : balance.totalEarned >= 10000 ? 'Epic' : 'Rare'} tier)`, status: 'completed' });
  }, [balance, notif, txs]);

  const startOffer = useCallback(async (offer: Offer) => {
    if (!userId) return;
    const existing = userOffers.find((a: Record<string, unknown>) => a.offer_id === offer.id);
    if (existing) { notif.triggerSuccess('Offer already in progress!'); return; }
    try {
      const { data, error } = await supabase.rpc('start_offer', { p_offer_id: offer.id, p_user_id: userId });
      if (error) throw error;
      if (data.status === 'already_started') { notif.triggerSuccess('Offer already in progress!'); return; }
      await fetchUserData(userId);
      notif.triggerSuccess(`Started: ${offer.title}`);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Start offer error:', error);
      notif.triggerSuccess('Failed to start offer');
    }
  }, [userId, userOffers, fetchUserData, notif]);

  const completeOffer = useCallback(async (offer: Offer, userOfferId: string) => {
    if (!userId) return;
    try {
      const result = await callEdgeFunction('claim-offer-reward', { user_offer_id: userOfferId });
      if (result.success) {
        sfx.win();
        fireWinConfetti();
        notif.triggerSuccess(`+${result.points_earned} PTS | +${result.shit_earned} $SHIT earned!`);
        await fetchUserData(userId);
      } else {
        notif.triggerSuccess('Failed to claim reward');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Claim error:', error);
      notif.triggerSuccess('Failed to claim reward');
    }
  }, [userId, fetchUserData, notif]);

  const claimQuest = useCallback(async (questId: number) => {
    if (!userId) return;
    const quest = quests.find(q => q.id === questId);
    if (!quest || quest.progress < quest.max || quest.claimed) return;
    try {
      const { error } = await supabase.from('user_quests').update({ is_claimed: true, claimed_at: new Date().toISOString() }).eq('user_id', userId).eq('quest_id', questId);
      if (error) throw error;
      const { error: balanceError } = await supabase.rpc('claim_quest_reward', { p_user_id: userId, p_quest_id: questId, p_reward: quest.reward });
      if (balanceError) throw balanceError;
      sfx.win();
      notif.triggerSuccess(`Quest completed! +${quest.reward} $SHIT`);
      await fetchUserData(userId);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Claim quest error:', error);
      notif.triggerSuccess('Failed to claim quest');
    }
  }, [userId, quests, fetchUserData, notif]);

  const buyNFT = useCallback((listing: MarketplaceListing) => {
    if (balance.shitBalance < listing.price) { notif.triggerSuccess('Not enough $SHIT!'); sfx.error(); return; }
    const newNFT: OwnedNFT = { id: Date.now(), name: listing.name, rank: listing.rank, power: listing.power };
    setOwnedNFTs(prev => [...prev, newNFT]);
    balance.setShitBalance(prev => prev - listing.price);
    setMarketListings(prev => prev.filter(l => l.id !== listing.id));
    sfx.purchase();
    firePurchaseConfetti();
    notif.triggerSuccess(`Bought ${listing.name} for ${listing.price} $SHIT!`);
    txs.addTransaction({ type: 'nft', amount: -listing.price, description: `Bought ${listing.name}`, status: 'completed' });
    updateQuestProgress('market');
  }, [balance, notif, txs, updateQuestProgress]);

  // Return flat API (backward compatible)
  return {
    // State
    userId, isGeneral, loading, loadingOffers, kycStatus, activeMissions, squadPower, activeBoosts,
    offers, userOffers, quests, offerBoosts, activeOffers,
    marketListings, ownedNFTs, leaderboard,

    // From useBalance
    shitBalance: balance.shitBalance, setShitBalance: balance.setShitBalance,
    points: balance.points, setPoints: balance.setPoints,
    totalEarned: balance.totalEarned, setTotalEarned: balance.setTotalEarned,
    dailyStreak: balance.dailyStreak,
    lastDailyClaim: balance.lastDailyClaim,
    hasClaimedAirdrop: balance.hasClaimedAirdrop,
    vipTier: balance.vipTier, setVipTier: balance.setVipTier,
    streakMultiplier: balance.streakMultiplier,
    setIsGeneral, setKycStatus,

    // From useBattlePass
    battlePassXP: bp.battlePassXP, setBattlePassXP: bp.setBattlePassXP,
    claimedTiers: bp.claimedTiers, setClaimedTiers: bp.setClaimedTiers,
    currentTier: bp.currentTier, tierProgress: bp.tierProgress,
    XP_PER_TIER: bp.XP_PER_TIER, MAX_TIER: bp.MAX_TIER,
    gainBattlePassXP: bp.gainBattlePassXP,

    // From useStaking
    stakedPositions: staking.stakedPositions, setStakedPositions: staking.setStakedPositions,
    stakeAmount: staking.stakeAmount, setStakeAmount: staking.setStakeAmount,
    stakeLock: staking.stakeLock, setStakeLock: staking.setStakeLock,
    stakeTokens: staking.stakeTokens,

    // From useNotifications
    showSuccess: notif.showSuccess, successMessage: notif.successMessage,
    notifications: notif.notifications, toasts: notif.toasts,
    triggerSuccess: notif.triggerSuccess,
    addNotification: notif.addNotification,
    markNotificationRead: notif.markNotificationRead,
    clearAllNotifications: notif.clearAllNotifications,

    // From useTransactions
    transactions: txs.transactions, addTransaction: txs.addTransaction,

    // Army
    setActiveMissions, setSquadPower, setActiveBoosts,

    // Actions
    convertPoints, claimDailyBonus, claimAirdrop,
    startOffer, completeOffer, claimQuest, buyNFT,
    updateQuestProgress, fetchUserData,
  };
}
