'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, subscribeToBalance, subscribeToOffers, callEdgeFunction } from '@/lib/supabase';
import { CONFIG } from '@/lib/config';
import type { StakedPosition, Transaction, Quest, OfferBoost, ActiveOffer, Offer, OwnedNFT, MarketplaceListing, Notification } from '@/lib/types';
import { MARKETPLACE_LISTINGS, LEADERBOARD } from '@/lib/constants';
import { sfx } from '@/lib/sounds';
import { fireWinConfetti, firePurchaseConfetti } from '@/lib/confetti';

export function useDashboard() {
  // User & Auth State
  const [userId, setUserId] = useState<string | null>(null);
  const [isGeneral, setIsGeneral] = useState(true);

  // Toast System
  const [toasts] = useState<Array<{ id: string; message: string }>>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Loading States
  const [loading, setLoading] = useState(true);
  const [loadingOffers] = useState(false);

  // Data States
  const [shitBalance, setShitBalance] = useState(0);
  const [points, setPoints] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [lastDailyClaim, setLastDailyClaim] = useState<string | null>(null);
  const [hasClaimedAirdrop, setHasClaimedAirdrop] = useState(false);
  const [battlePassXP, setBattlePassXP] = useState(0);
  const [claimedTiers, setClaimedTiers] = useState<number[]>([]);
  const [kycStatus, setKycStatus] = useState<'none' | 'pending' | 'verified' | 'rejected'>('none');
  const [vipTier, setVipTier] = useState(0);

  // Data from Supabase
  const [offers, setOffers] = useState<Offer[]>([]);
  const [userOffers, setUserOffers] = useState<Array<Record<string, unknown>>>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stakedPositions, setStakedPositions] = useState<StakedPosition[]>([]);

  // Local UI States
  const [stakeAmount, setStakeAmount] = useState("");
  const [stakeLock, setStakeLock] = useState(30);
  const [marketListings, setMarketListings] = useState(MARKETPLACE_LISTINGS);
  const [ownedNFTs, setOwnedNFTs] = useState<OwnedNFT[]>([]);
  const [leaderboard] = useState(LEADERBOARD);

  // Offer Boosts
  const [offerBoosts, setOfferBoosts] = useState<OfferBoost[]>([]);
  const [activeOffers, setActiveOffers] = useState<ActiveOffer[]>([]);

  // Notification center
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((title: string, message: string, type: Notification['type'] = 'success') => {
    setNotifications(prev => [{
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title, message, type,
      timestamp: new Date(),
      read: false,
    }, ...prev].slice(0, 50));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Toast helper
  const triggerSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    sfx.notification();
    addNotification(
      message.length > 40 ? message.slice(0, 40) + '…' : message,
      message,
      message.toLowerCase().includes('fail') || message.toLowerCase().includes('not enough') ? 'error' : 'success'
    );
    setTimeout(() => setShowSuccess(false), 2600);
  }, [addNotification]);

  // Transaction helper
  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      timestamp: new Date(),
    };
    setTransactions(prev => [newTx, ...prev]);
  }, []);

  // Fetch user data
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
        setShitBalance(Number(balanceRes.data.shit_balance) || 0);
        setPoints(balanceRes.data.points || 0);
        setTotalEarned(Number(balanceRes.data.total_earned) || 0);
        setDailyStreak(balanceRes.data.daily_streak || 0);
        setLastDailyClaim(balanceRes.data.last_daily_claim);
      }
      if (kycRes.data) setKycStatus(kycRes.data.status || 'none');
      if (offersRes.data) setOffers(offersRes.data);
      if (userOffersRes.data) {
        setUserOffers(userOffersRes.data);
        setActiveOffers(userOffersRes.data.map((uo: Record<string, unknown>) => ({
          id: uo.id as string,
          offerId: uo.offer_id as number,
          progress: uo.progress as number,
          status: uo.status as string,
          startedAt: new Date(uo.started_at as string),
          estimatedReward: uo.reward as number,
          userOfferId: uo.id as string,
        })));
      }
      if (questsRes.data) {
        setQuests(questsRes.data.map((uq: Record<string, unknown>) => {
          const q = uq.quests as Record<string, unknown>;
          return {
            id: q.id as number, title: q.title as string, description: q.description as string,
            category: q.category as Quest['category'], progress: uq.progress as number,
            max: q.max_progress as number, reward: q.reward as number, icon: q.icon as string,
            claimed: uq.is_claimed as boolean, completed: uq.is_completed as boolean,
          };
        }));
      }
      if (transactionsRes.data) {
        setTransactions(transactionsRes.data.map((t: Record<string, unknown>) => ({
          id: t.id as string, type: t.type as Transaction['type'], amount: Number(t.amount),
          description: t.description as string, timestamp: new Date(t.created_at as string), status: t.status as Transaction['status'],
        })));
      }
      if (bpRes.data) {
        setBattlePassXP(bpRes.data.xp || 0);
        setClaimedTiers(bpRes.data.claimed_tiers || []);
      }
      if (stakingRes.data) {
        setStakedPositions(stakingRes.data.map((s: Record<string, unknown>) => ({
          id: s.id as number, amount: Number(s.amount), lockDays: s.lock_days as number,
          apy: s.apy as number, unlockDate: new Date(s.unlocks_at as string).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          rewards: Number(s.rewards),
        })));
      }
      if (boostsRes.data) {
        setOfferBoosts(boostsRes.data.map((b: Record<string, unknown>) => ({
          id: b.id as string, offerId: (b.offers as Record<string, unknown>)?.id as number || b.offer_id as number,
          multiplier: b.multiplier as 2 | 3, expiresAt: new Date(b.expires_at as string),
        })));
      }
    } catch (error) {
      console.error('Fetch user data error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mock data loader
  const loadMockData = useCallback(() => {
    setShitBalance(1240);
    setPoints(8740);
    setTotalEarned(3240);
    setDailyStreak(7);
    setLastDailyClaim(new Date(Date.now() - 86400000).toISOString());
    setBattlePassXP(1850);
    setClaimedTiers([1, 2]);
    setKycStatus('none');

    setQuests([
      { id: 1, title: "Complete 2 Offers", description: "Finish any 2 offers from the offerwall", category: "daily", progress: 1, max: 2, reward: 300, icon: "⚡", claimed: false },
      { id: 2, title: "Stake 100 $SHIT", description: "Lock 100 $SHIT in any staking pool", category: "daily", progress: 0, max: 1, reward: 200, icon: "🏆", claimed: false },
      { id: 3, title: "Visit Marketplace", description: "Browse the NFT marketplace", category: "daily", progress: 1, max: 1, reward: 50, icon: "🛒", claimed: true, completed: true },
      { id: 4, title: "Complete 10 Offers", description: "Finish 10 offers this week", category: "weekly", progress: 4, max: 10, reward: 1500, icon: "🔥", claimed: false },
      { id: 5, title: "Earn 5,000 $SHIT", description: "Reach 5,000 total earned this week", category: "weekly", progress: 3240, max: 5000, reward: 2000, icon: "💰", claimed: false },
      { id: 6, title: "Refer 5 Friends", description: "Get 5 friends to join Shit Army", category: "weekly", progress: 3, max: 5, reward: 2500, icon: "👥", claimed: false },
      { id: 7, title: "First Shit", description: "Complete your first offer ever", category: "milestone", progress: 1, max: 1, reward: 500, icon: "💩", claimed: true, completed: true },
      { id: 8, title: "Offerwall Legend", description: "Complete 50 offers total", category: "milestone", progress: 12, max: 50, reward: 5000, icon: "🏆", claimed: false },
      { id: 9, title: "Diamond Hands", description: "Stake $SHIT for 90 days total", category: "milestone", progress: 30, max: 90, reward: 10000, icon: "💎", claimed: false },
      { id: 10, title: "Shit General", description: "Reach 100,000 $SHIT earned", category: "milestone", progress: 3240, max: 100000, reward: 25000, icon: "⭐", claimed: false },
    ]);

    setTransactions([
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

    setStakedPositions([
      { id: 1, amount: 450, lockDays: 30, apy: 48, unlockDate: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }), rewards: 18.4 },
    ]);

    setOwnedNFTs([
      { id: 1, name: "Poop Soldier #1001", rank: "Rare", power: 52 },
      { id: 2, name: "Poop Soldier #1002", rank: "Epic", power: 78 },
    ]);

    // Seed some initial notifications
    setNotifications([
      { id: 'n-1', title: 'Welcome back!', message: 'Your 7-day streak continues 🔥', type: 'info', timestamp: new Date(Date.now() - 60000), read: false },
      { id: 'n-2', title: 'Offer completed', message: 'Crypto Habits Survey 2026 — +175 $SHIT', type: 'success', timestamp: new Date(Date.now() - 1800000), read: true },
    ]);
  }, []);

  // Initialize user
  useEffect(() => {
    const initUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          await fetchUserData(user.id);
        } else {
          console.log('Development mode: Loading mock data');
          loadMockData();
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth error:', error);
        setLoading(false);
      }
    };
    initUser();
  }, [fetchUserData, loadMockData]);

  // Real-time subscriptions
  useEffect(() => {
    if (!userId) return;
    const balanceSubscription = subscribeToBalance(userId, (newBalance) => {
      setShitBalance(Number(newBalance.shit_balance) || 0);
      setPoints(newBalance.points || 0);
      setTotalEarned(Number(newBalance.total_earned) || 0);
      setDailyStreak(newBalance.daily_streak || 0);
    });
    const offerSubscription = subscribeToOffers(userId, (payload) => {
      triggerSuccess(`Offer completed! +${payload.reward} points`);
      fetchUserData(userId);
    });
    return () => {
      balanceSubscription?.unsubscribe();
      offerSubscription?.unsubscribe();
    };
  }, [userId, fetchUserData, triggerSuccess]);

  // Battle Pass
  const XP_PER_TIER = CONFIG.BUSINESS.BATTLE_PASS.XP_PER_TIER || 500;
  const MAX_TIER = CONFIG.BUSINESS.BATTLE_PASS.MAX_TIER || 20;
  const currentTier = Math.min(Math.floor(battlePassXP / XP_PER_TIER) + 1, MAX_TIER);
  const tierProgress = ((battlePassXP % XP_PER_TIER) / XP_PER_TIER) * 100;
  const streakMultiplier = Math.min(Math.floor(dailyStreak / 2) * 5, 35);

  const gainBattlePassXP = useCallback((amount: number) => {
    setBattlePassXP(prev => {
      const newXP = prev + amount;
      const newTier = Math.min(Math.floor(newXP / XP_PER_TIER) + 1, MAX_TIER);
      const oldTier = Math.min(Math.floor(prev / XP_PER_TIER) + 1, MAX_TIER);
      if (newTier > oldTier) {
        sfx.levelUp();
        fireWinConfetti();
        setTimeout(() => triggerSuccess(`Battle Pass Tier ${newTier} unlocked! 🎉`), 200);
      }
      return newXP;
    });
  }, [XP_PER_TIER, MAX_TIER, triggerSuccess]);

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

  // Actions
  const convertPoints = useCallback(() => {
    const exchangeRate = CONFIG.BUSINESS.OFFERWALL.EXCHANGE_RATE;
    const minConvert = CONFIG.BUSINESS.OFFERWALL.MIN_CONVERT;
    if (points < minConvert) {
      triggerSuccess(`Need at least ${minConvert} PTS to convert!`);
      return;
    }
    const shitEarned = Math.floor(points / exchangeRate);
    setShitBalance(prev => prev + shitEarned);
    setTotalEarned(prev => prev + shitEarned);
    setPoints(0);
    sfx.purchase();
    triggerSuccess(`Converted ${points} PTS → ${shitEarned} $SHIT!`);
    addTransaction({ type: 'offer', amount: shitEarned, description: `Converted ${points} PTS to $SHIT`, status: 'completed' });
  }, [points, triggerSuccess, addTransaction]);

  const stakeTokens = useCallback(() => {
    const amount = parseInt(stakeAmount);
    if (!amount || amount <= 0) {
      triggerSuccess("Enter a valid amount to stake");
      return;
    }
    if (amount > shitBalance) {
      triggerSuccess("Not enough $SHIT to stake!");
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
    setStakeAmount("");
    sfx.purchase();
    triggerSuccess(`Staked ${amount} $SHIT for ${stakeLock} days! ${apy}% APY 🔥`);
    addTransaction({ type: 'stake', amount: -amount, description: `Staked ${amount} $SHIT (${stakeLock} days, ${apy}% APY)`, status: 'completed' });
    gainBattlePassXP(30);
    updateQuestProgress('stake');
  }, [stakeAmount, shitBalance, stakeLock, triggerSuccess, addTransaction, gainBattlePassXP, updateQuestProgress]);

  const claimDailyBonus = useCallback(async () => {
    if (!userId) {
      // Mock mode
      if (lastDailyClaim && new Date(lastDailyClaim).toDateString() === new Date().toDateString()) {
        triggerSuccess("Daily bonus already claimed today!");
        return;
      }
      const baseAmount = CONFIG.BUSINESS.DAILY_BONUS.BASE_AMOUNT;
      const streakBonus = Math.floor(baseAmount * streakMultiplier / 100);
      const total = baseAmount + streakBonus;
      setShitBalance(prev => prev + total);
      setTotalEarned(prev => prev + total);
      setDailyStreak(prev => prev + 1);
      setLastDailyClaim(new Date().toISOString());
      sfx.win();
      fireWinConfetti();
      triggerSuccess(`Daily bonus! +${total} $SHIT (Streak: ${dailyStreak + 1} days) 🔥`);
      addTransaction({ type: 'daily', amount: total, description: `Daily bonus (Streak: ${dailyStreak + 1})`, status: 'completed' });
      gainBattlePassXP(20);
      return;
    }
    try {
      if (lastDailyClaim && new Date(lastDailyClaim).toDateString() === new Date().toDateString()) {
        triggerSuccess("Daily bonus already claimed today!");
        return;
      }
      const { data, error } = await supabase.rpc('claim_daily_bonus', { p_user_id: userId });
      if (error) throw error;
      if (data.success) {
        sfx.win();
        fireWinConfetti();
        triggerSuccess(`Daily bonus claimed! +${data.shit_earned} $SHIT (Streak: ${data.new_streak} days) 🔥`);
        await fetchUserData(userId);
      } else {
        triggerSuccess("Failed to claim daily bonus");
      }
    } catch (error) {
      console.error('Daily bonus error:', error);
      triggerSuccess("Failed to claim daily bonus");
    }
  }, [userId, lastDailyClaim, streakMultiplier, dailyStreak, triggerSuccess, addTransaction, gainBattlePassXP, fetchUserData]);

  const claimAirdrop = useCallback(() => {
    if (totalEarned < 5000 || hasClaimedAirdrop) return;
    const airdropAmount = totalEarned >= 25000 ? 1500 : totalEarned >= 10000 ? 600 : 250;
    setShitBalance(prev => prev + airdropAmount);
    setTotalEarned(prev => prev + airdropAmount);
    setHasClaimedAirdrop(true);
    sfx.levelUp();
    fireWinConfetti();
    triggerSuccess(`Airdrop claimed! +${airdropAmount} $SHIT 🪂`);
    addTransaction({ type: 'airdrop', amount: airdropAmount, description: `Airdrop claim (${totalEarned >= 25000 ? 'Legendary' : totalEarned >= 10000 ? 'Epic' : 'Rare'} tier)`, status: 'completed' });
  }, [totalEarned, hasClaimedAirdrop, triggerSuccess, addTransaction]);

  const startOffer = useCallback(async (offer: Offer) => {
    if (!userId) return;
    const existing = userOffers.find((a: Record<string, unknown>) => a.offer_id === offer.id);
    if (existing) { triggerSuccess("Offer already in progress!"); return; }
    try {
      const { data, error } = await supabase.rpc('start_offer', { p_offer_id: offer.id, p_user_id: userId });
      if (error) throw error;
      if (data.status === 'already_started') { triggerSuccess("Offer already in progress!"); return; }
      await fetchUserData(userId);
      triggerSuccess(`Started: ${offer.title} — track progress live! 🚀`);
    } catch (error) {
      console.error('Start offer error:', error);
      triggerSuccess("Failed to start offer");
    }
  }, [userId, userOffers, fetchUserData, triggerSuccess]);

  const completeOffer = useCallback(async (offer: Offer, userOfferId: string) => {
    if (!userId) return;
    try {
      const result = await callEdgeFunction('claim-offer-reward', { user_offer_id: userOfferId });
      if (result.success) {
        sfx.win();
        fireWinConfetti();
        triggerSuccess(`+${result.points_earned} PTS | +${result.shit_earned} $SHIT earned! 🪖`);
        await fetchUserData(userId);
      } else {
        triggerSuccess("Failed to claim reward");
      }
    } catch (error) {
      console.error('Claim error:', error);
      triggerSuccess("Failed to claim reward");
    }
  }, [userId, fetchUserData, triggerSuccess]);

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
      triggerSuccess(`Quest completed! +${quest.reward} $SHIT 🎯`);
      await fetchUserData(userId);
    } catch (error) {
      console.error('Claim quest error:', error);
      triggerSuccess("Failed to claim quest");
    }
  }, [userId, quests, fetchUserData, triggerSuccess]);

  const buyNFT = useCallback((listing: MarketplaceListing) => {
    if (shitBalance < listing.price) { triggerSuccess("Not enough $SHIT!"); sfx.error(); return; }
    const newNFT: OwnedNFT = { id: Date.now(), name: listing.name, rank: listing.rank, power: listing.power };
    setOwnedNFTs(prev => [...prev, newNFT]);
    setShitBalance(prev => prev - listing.price);
    setMarketListings(prev => prev.filter(l => l.id !== listing.id));
    sfx.purchase();
    firePurchaseConfetti();
    triggerSuccess(`Bought ${listing.name} for ${listing.price} $SHIT!`);
    addTransaction({ type: 'nft', amount: -listing.price, description: `Bought ${listing.name}`, status: 'completed' });
    updateQuestProgress('market');
  }, [shitBalance, triggerSuccess, addTransaction, updateQuestProgress]);

  return {
    // State
    userId, isGeneral, loading, loadingOffers, shitBalance, points, totalEarned, dailyStreak,
    lastDailyClaim, hasClaimedAirdrop, battlePassXP, claimedTiers, kycStatus, vipTier,
    offers, userOffers, quests, transactions, stakedPositions, stakeAmount, stakeLock,
    marketListings, ownedNFTs, leaderboard, offerBoosts, activeOffers, showSuccess, successMessage,
    notifications, toasts,

    // Computed
    currentTier, tierProgress, streakMultiplier, XP_PER_TIER, MAX_TIER,

    // Setters
    setShitBalance, setPoints, setTotalEarned, setIsGeneral, setKycStatus, setVipTier,
    setStakeAmount, setStakeLock, setClaimedTiers, setBattlePassXP,

    // Actions
    triggerSuccess, addTransaction, convertPoints, stakeTokens, claimDailyBonus,
    claimAirdrop, startOffer, completeOffer, claimQuest, buyNFT,
    gainBattlePassXP, updateQuestProgress, fetchUserData,
    addNotification, markNotificationRead, clearAllNotifications,
  };
}
