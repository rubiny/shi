"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import KYCModal from './KYCModal';
import ReferralPage from './ReferralPage';
import SettingsPage from './SettingsPage';
import AdminPanel from './AdminPanel';
import BattlePass from './BattlePass';
import Achievements from './Achievements';
import Army from './Army';
import Market from './Market';
import OnboardingModal from './OnboardingModal';
import Leaderboard from './Leaderboard';
import ToastContainer from './ToastContainer';
import StreakDisplay from './StreakDisplay';
import QuestsPage from './QuestsPage';
import DashboardNav from './DashboardNav';
import { supabase, subscribeToBalance, subscribeToOffers, callEdgeFunction } from '@/lib/supabase';
import { SkeletonDashboard, SkeletonOfferwall } from './SkeletonLoader';

interface DashboardProps {
  onDisconnect: () => void;
  walletAddress: string;
  isGeneral: boolean;
  generalDaysLeft: number;
  showOnboarding?: boolean;
  onCompleteOnboarding?: () => void;
}

interface Offer {
  id: number;
  title: string;
  description: string;
  reward: number;
  time: string;
  category: string;
  icon: string;
  exclusive?: boolean;
}

interface StakedPosition {
  id: number;
  amount: number;
  lockDays: number;
  apy: number;
  unlockDate: string;
  rewards: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  earned: number;
  referrals: number;
  level: string;
}

interface MarketplaceListing {
  id: number;
  name: string;
  rank: string;
  price: number;
  power: number;
  seller: string;
}

interface MerchProduct {
  id: number;
  name: string;
  price: number;
  emoji: string;
  description: string;
  color: string;
}

interface OwnedNFT {
  id: number;
  name: string;
  rank: string;
  power: number;
}

interface Quest {
  id: number;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'milestone';
  progress: number;
  max: number;
  reward: number;
  icon: string;
  claimed: boolean;
}

interface OfferBoost {
  id: string;
  offerId: number;
  multiplier: 2 | 3;
  expiresAt: Date;
}

interface ActiveOffer {
  id: string;
  offerId: number;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed';
  startedAt: Date;
  estimatedReward: number;
  userOfferId?: string;
}

interface Transaction {
  id: string;
  type: 'offer' | 'withdrawal' | 'stake' | 'unstake' | 'quest' | 'airdrop' | 'referral' | 'nft' | 'merch' | 'daily' | 'purchase';
  amount: number;
  description: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
}

interface Network {
  id: string;
  name: string;
  chain: string;
  fee: number;
  minWithdraw: number;
  icon: string;
}

const NETWORKS: Network[] = [
  { id: 'base', name: 'Base', chain: '8453', fee: 0.5, minWithdraw: 50, icon: '🔵' },
  { id: 'eth', name: 'Ethereum', chain: '1', fee: 2.5, minWithdraw: 100, icon: '⬡' },
  { id: 'polygon', name: 'Polygon', chain: '137', fee: 0.2, minWithdraw: 25, icon: '💜' },
];

const OFFERS: Offer[] = [
  { id: 1, title: "Crypto Habits Survey 2026", description: "5-minute survey about your shitcoin addiction", reward: 850, time: "5 min", category: "Surveys", icon: "📋" },
  { id: 2, title: "Install Base Wallet", description: "Download & register in the official Base wallet", reward: 2100, time: "3 min", category: "Installs", icon: "📱" },
  { id: 3, title: "Meme Runner Challenge", description: "Reach level 5 in the viral meme game", reward: 1200, time: "8 min", category: "Games", icon: "🎮" },
  { id: 4, title: "Shitcoin Documentary", description: "Watch 4-min video about the rise of $SHIT", reward: 650, time: "4 min", category: "Videos", icon: "🎥" },
  { id: 5, title: "New DEX on Base", description: "Create account on the hottest new Base DEX", reward: 1800, time: "2 min", category: "Crypto", icon: "🔗", exclusive: true },
  { id: 6, title: "Favorite Poop NFT Poll", description: "Quick 3-question survey", reward: 420, time: "2 min", category: "Surveys", icon: "📋" },
  { id: 7, title: "Tank Shit Shooter", description: "Destroy 20 enemy tanks in our mini-game", reward: 950, time: "6 min", category: "Games", icon: "🎮" },
  { id: 8, title: "Meme Coin Tracker App", description: "Install the #1 shitcoin tracking app", reward: 1650, time: "4 min", category: "Installs", icon: "📱", exclusive: true },
];

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "0xG00N...9F3A", earned: 124890, referrals: 47, level: "General" },
  { rank: 2, name: "0xSH1T...420B", earned: 98750, referrals: 39, level: "Captain" },
  { rank: 3, name: "0xPOOP...777", earned: 87620, referrals: 31, level: "Sergeant" },
  { rank: 4, name: "You (0xYOUR...69)", earned: 1240, referrals: 3, level: "Private" },
  { rank: 5, name: "0xTANK...C4FE", earned: 65430, referrals: 22, level: "Sergeant" },
];

const MARKETPLACE_LISTINGS: MarketplaceListing[] = [
  { id: 1, name: "Poop Soldier #1247", rank: "Epic", price: 420, power: 94, seller: "0xG00N...9F3A" },
  { id: 2, name: "Poop Soldier #892", rank: "Rare", price: 185, power: 67, seller: "0xSH1T...420B" },
  { id: 3, name: "Poop Soldier #3105", rank: "Legendary", price: 890, power: 112, seller: "0xPOOP...777" },
  { id: 4, name: "Poop Soldier #567", rank: "Epic", price: 310, power: 81, seller: "0xTANK...C4FE" },
];

const MERCH_PRODUCTS: MerchProduct[] = [
  { id: 1, name: "Shit Army T-Shirt", price: 280, emoji: "👕", description: "Premium black cotton with army logo", color: "Black" },
  { id: 2, name: "Poop Soldier Hoodie", price: 620, emoji: "🧥", description: "Heavyweight hoodie with embroidered soldier", color: "Military Green" },
  { id: 3, name: "Tank Shit Shooter Mug", price: 95, emoji: "☕", description: "Ceramic mug with tank design", color: "Black" },
  { id: 4, name: "Sticker Pack (10 pcs)", price: 65, emoji: "📦", description: "Waterproof vinyl stickers", color: "Assorted" },
  { id: 5, name: "General Pass Cap", price: 420, emoji: "🧢", description: "Limited edition dad cap", color: "Olive" },
];

export default function Dashboard({ onDisconnect, walletAddress, isGeneral: initialIsGeneral, generalDaysLeft, showOnboarding = false, onCompleteOnboarding }: DashboardProps) {
  const [currentTab, setCurrentTab] = useState<"dashboard" | "offerwall" | "stake" | "market" | "quests" | "merch" | "army" | "referral" | "achievements" | "history" | "settings" | "admin" | "battlepass" | "leaderboard">("dashboard");
  
  // Refs
  const moreMenuRef = useRef<HTMLDivElement>(null);
  
  // User & Auth State
  const [userId, setUserId] = useState<string | null>(null);
  const [isGeneral, setIsGeneral] = useState(true); // Always admin for dev

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Toast System
  const [toasts, setToasts] = useState<any[]>([]);
  
  // Loading States
  const [loading, setLoading] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(false);
  
  // Data States (from Supabase)
  const [shitBalance, setShitBalance] = useState(0);
  const [points, setPoints] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [lastDailyClaim, setLastDailyClaim] = useState<string | null>(null);
  const [hasClaimedAirdrop, setHasClaimedAirdrop] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [battlePassXP, setBattlePassXP] = useState(0);
  const [claimedTiers, setClaimedTiers] = useState<number[]>([]);
  const [showBattlePass, setShowBattlePass] = useState(false);
  const [kycStatus, setKycStatus] = useState<'none' | 'pending' | 'verified' | 'rejected'>('none');
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showAirdrop, setShowAirdrop] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Data from Supabase
  const [offers, setOffers] = useState<any[]>([]);
  const [userOffers, setUserOffers] = useState<any[]>([]);
  const [quests, setQuests] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stakedPositions, setStakedPositions] = useState<StakedPosition[]>([]);
  
  // Local UI States
  const [stakeAmount, setStakeAmount] = useState("");
  const [stakeLock, setStakeLock] = useState(30);
  const [marketListings, setMarketListings] = useState(MARKETPLACE_LISTINGS);
  const [ownedNFTs, setOwnedNFTs] = useState<OwnedNFT[]>([]);
  const [showMerchModal, setShowMerchModal] = useState(false);
  const [selectedMerch, setSelectedMerch] = useState<MerchProduct | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyingNFT, setBuyingNFT] = useState<MarketplaceListing | null>(null);
  const [leaderboardTab, setLeaderboardTab] = useState<"week" | "all">("week");
  const [leaderboard, setLeaderboard] = useState<any[]>(LEADERBOARD);
  
  // Offer Boosts (from Supabase)
  const [offerBoosts, setOfferBoosts] = useState<OfferBoost[]>([]);
  const [activeOffers, setActiveOffers] = useState<ActiveOffer[]>([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // ==========================================
  // SUPABASE DATA FETCHING
  // ==========================================
  
  // 1. Initialize user and fetch initial data
  useEffect(() => {
    const initUser = async () => {
      try {
        // Get current user from Supabase auth
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUserId(user.id);
          await fetchUserData(user.id);
        } else {
          // DEVELOPMENT MODE: Load mock data
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
  }, []);

  // 2. Fetch all user data
  const fetchUserData = async (uid: string) => {
    try {
      setLoading(true);
      
      // Parallel data fetching
      const [
        profileRes,
        balanceRes,
        kycRes,
        offersRes,
        userOffersRes,
        questsRes,
        transactionsRes,
        bpRes,
        stakingRes,
        boostsRes,
      ] = await Promise.all([
        // Profile
        supabase.from('profiles').select('*').eq('id', uid).single(),
        // Balance
        supabase.from('user_balances').select('*').eq('user_id', uid).single(),
        // KYC
        supabase.from('kyc_verifications').select('*').eq('user_id', uid).single(),
        // Offers
        supabase.from('offers').select('*, offer_boosts(*)').eq('is_active', true),
        // User offers
        supabase.from('user_offers').select('*, offers(*)').eq('user_id', uid).in('status', ['started', 'in_progress', 'completed']),
        // Quests
        supabase.from('user_quests').select('*, quests(*)').eq('user_id', uid),
        // Transactions
        supabase.from('transactions').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(50),
        // Battle Pass
        supabase.from('user_battle_pass').select('*').eq('user_id', uid).single(),
        // Staking
        supabase.from('staking_positions').select('*').eq('user_id', uid).eq('is_unstaked', false),
        // Boosts
        supabase.from('offer_boosts').select('*, offers(id)').eq('is_active', true).gt('expires_at', new Date().toISOString()),
      ]);

      // Update states
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
      
      if (kycRes.data) {
        setKycStatus(kycRes.data.status || 'none');
      }
      
      if (offersRes.data) {
        setOffers(offersRes.data);
      }
      
      if (userOffersRes.data) {
        setUserOffers(userOffersRes.data);
        // Convert to activeOffers format
        setActiveOffers(userOffersRes.data.map((uo: any) => ({
          id: uo.id,
          offerId: uo.offer_id,
          progress: uo.progress,
          status: uo.status,
          startedAt: new Date(uo.started_at),
          estimatedReward: uo.reward,
          userOfferId: uo.id,
        })));
      }
      
      if (questsRes.data) {
        setQuests(questsRes.data.map((uq: any) => ({
          id: uq.quests.id,
          title: uq.quests.title,
          description: uq.quests.description,
          category: uq.quests.category,
          progress: uq.progress,
          max: uq.quests.max_progress,
          reward: uq.quests.reward,
          icon: uq.quests.icon,
          claimed: uq.is_claimed,
          completed: uq.is_completed,
        })));
      }
      
      if (transactionsRes.data) {
        setTransactions(transactionsRes.data.map((t: any) => ({
          id: t.id,
          type: t.type,
          amount: Number(t.amount),
          description: t.description,
          timestamp: new Date(t.created_at),
          status: t.status,
        })));
      }
      
      if (bpRes.data) {
        setBattlePassXP(bpRes.data.xp || 0);
        setClaimedTiers(bpRes.data.claimed_tiers || []);
      }
      
      if (stakingRes.data) {
        setStakedPositions(stakingRes.data.map((s: any) => ({
          id: s.id,
          amount: Number(s.amount),
          lockDays: s.lock_days,
          apy: s.apy,
          unlockDate: new Date(s.unlocks_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          rewards: Number(s.rewards),
        })));
      }
      
      if (boostsRes.data) {
        setOfferBoosts(boostsRes.data.map((b: any) => ({
          id: b.id,
          offerId: b.offers?.id || b.offer_id,
          multiplier: b.multiplier,
          expiresAt: new Date(b.expires_at),
        })));
      }
      
    } catch (error) {
      console.error('Fetch user data error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data loader for development
  const loadMockData = () => {
    setShitBalance(1240);
    setPoints(8740);
    setTotalEarned(3240);
    setDailyStreak(7);
    setLastDailyClaim(new Date(Date.now() - 86400000).toISOString());
    setBattlePassXP(1850);
    setClaimedTiers([1, 2]);
    setKycStatus('none');
    
    setQuests([
      { id: 1, title: "Complete 2 Offers", description: "Finish any 2 offers from the offerwall", category: "daily", progress: 1, max: 2, reward: 300, icon: "⚡", claimed: false, completed: false },
      { id: 2, title: "Stake 100 $SHIT", description: "Lock 100 $SHIT in any staking pool", category: "daily", progress: 0, max: 1, reward: 200, icon: "🏆", claimed: false, completed: false },
      { id: 3, title: "Visit Marketplace", description: "Browse the NFT marketplace", category: "daily", progress: 1, max: 1, reward: 50, icon: "🛒", claimed: true, completed: true },
      { id: 4, title: "Complete 10 Offers", description: "Finish 10 offers this week", category: "weekly", progress: 4, max: 10, reward: 1500, icon: "🔥", claimed: false, completed: false },
      { id: 5, title: "Earn 5,000 $SHIT", description: "Reach 5,000 total earned this week", category: "weekly", progress: 3240, max: 5000, reward: 2000, icon: "💰", claimed: false, completed: false },
      { id: 6, title: "Refer 5 Friends", description: "Get 5 friends to join Shit Army", category: "weekly", progress: 3, max: 5, reward: 2500, icon: "👥", claimed: false, completed: false },
      { id: 7, title: "First Shit", description: "Complete your first offer ever", category: "milestone", progress: 1, max: 1, reward: 500, icon: "💩", claimed: true, completed: true },
      { id: 8, title: "Offerwall Legend", description: "Complete 50 offers total", category: "milestone", progress: 12, max: 50, reward: 5000, icon: "🏆", claimed: false, completed: false },
      { id: 9, title: "Diamond Hands", description: "Stake $SHIT for 90 days total", category: "milestone", progress: 30, max: 90, reward: 10000, icon: "💎", claimed: false, completed: false },
      { id: 10, title: "Shit General", description: "Reach 100,000 $SHIT earned", category: "milestone", progress: 3240, max: 100000, reward: 25000, icon: "⭐", claimed: false, completed: false },
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
  };

  // 3. Real-time subscriptions
  useEffect(() => {
    if (!userId) return;

    // Subscribe to balance changes
    const balanceSubscription = subscribeToBalance(userId, (newBalance) => {
      setShitBalance(Number(newBalance.shit_balance) || 0);
      setPoints(newBalance.points || 0);
      setTotalEarned(Number(newBalance.total_earned) || 0);
      setDailyStreak(newBalance.daily_streak || 0);
    });

    // Subscribe to offer completions
    const offerSubscription = subscribeToOffers(userId, (payload) => {
      triggerSuccess(`Offer completed! +${payload.reward} points`);
      // Refresh offers
      fetchUserData(userId);
    });

    return () => {
      balanceSubscription?.unsubscribe();
      offerSubscription?.unsubscribe();
    };
  }, [userId]);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(NETWORKS[0]);
  const [withdrawStep, setWithdrawStep] = useState<1 | 2 | 3>(1);
  const addTransaction = (tx: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      timestamp: new Date(),
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const submitWithdrawal = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0 || amount > shitBalance || amount < selectedNetwork.minWithdraw) return;
    const fee = selectedNetwork.fee;
    const netAmount = amount - fee;

    setShitBalance(prev => prev - amount);
    setWithdrawStep(3);
    addTransaction({
      type: 'withdrawal',
      amount: -amount,
      description: `Withdraw ${netAmount.toFixed(2)} $SHIT to ${selectedNetwork.name} (${withdrawAddress.slice(0, 8)}...)`,
      status: 'pending',
    });
    triggerSuccess(`Withdrawal initiated! ${netAmount.toFixed(2)} $SHIT → ${selectedNetwork.name}`);
    setTimeout(() => {
      setTransactions(prev => prev.map(t =>
        t.description.includes(withdrawAddress.slice(0, 8)) && t.status === 'pending'
          ? { ...t, status: 'completed' }
          : t
      ));
    }, 4000);
  };

  const triggerSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2600);
  };

  // Note: Live progress now comes from Supabase realtime subscriptions
  // See useEffect with subscribeToOffers above

  const formatTimeLeft = (expiresAt: Date) => {
    const diff = expiresAt.getTime() - Date.now();
    if (diff <= 0) return 'EXPIRED';
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };

  const getBoostedReward = (offer: Offer) => {
    const boost = offerBoosts.find(b => b.offerId === offer.id);
    if (!boost || boost.expiresAt < new Date()) return offer.reward;
    return offer.reward * boost.multiplier;
  };

  const startOffer = async (offer: Offer) => {
    if (!userId) return;
    
    const existing = userOffers.find((a: any) => a.offer_id === offer.id);
    if (existing) {
      triggerSuccess("Offer already in progress!");
      return;
    }
    
    try {
      // Call Supabase RPC to start offer
      const { data, error } = await supabase.rpc('start_offer', {
        p_offer_id: offer.id,
        p_user_id: userId,
      });
      
      if (error) throw error;
      
      if (data.status === 'already_started') {
        triggerSuccess("Offer already in progress!");
        return;
      }
      
      // Refresh data to show new active offer
      await fetchUserData(userId);
      triggerSuccess(`Started: ${offer.title} — track progress live! 🚀`);
    } catch (error) {
      console.error('Start offer error:', error);
      triggerSuccess("Failed to start offer");
    }
  };

  const completeOffer = async (offer: Offer, userOfferId: string) => {
    if (!userId) return;
    setIsCompleting(true);
    
    try {
      // Call Edge Function to claim reward
      const result = await callEdgeFunction('claim-offer-reward', {
        user_offer_id: userOfferId,
      });
      
      setIsCompleting(false);
      setSelectedOffer(null);
      
      if (result.success) {
        triggerSuccess(`+${result.points_earned} PTS | +${result.shit_earned} $SHIT earned! 🪖`);
        // Data will auto-refresh via subscription, but fetch now for instant update
        await fetchUserData(userId);
      } else {
        triggerSuccess("Failed to claim reward");
      }
    } catch (error) {
      console.error('Claim error:', error);
      setIsCompleting(false);
      triggerSuccess("Failed to claim reward");
    }
  };

  const stakeTokens = () => {
    const amount = parseInt(stakeAmount);
    if (!amount || amount <= 0 || amount > shitBalance) return;
    const apy = stakeLock === 7 ? 32 : stakeLock === 30 ? 48 : 67;
    const newPosition: StakedPosition = {
      id: Date.now(),
      amount,
      lockDays: stakeLock,
      apy,
      unlockDate: new Date(Date.now() + stakeLock * 86400000).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      rewards: Math.floor(amount * apy / 1200),
    };
    setStakedPositions(prev => [...prev, newPosition]);
    setShitBalance(prev => prev - amount);
    setStakeAmount("");
    triggerSuccess(`Staked ${amount} $SHIT for ${stakeLock} days! ${apy}% APY 🔥`);
    addTransaction({ type: 'stake', amount: -amount, description: `Staked ${amount} $SHIT (${stakeLock} days, ${apy}% APY)`, status: 'completed' });
    gainBattlePassXP(30);
    updateQuestProgress('stake');
  };

  const buyMerch = (product: MerchProduct) => {
    if (shitBalance < product.price) {
      triggerSuccess("Not enough $SHIT!");
      return;
    }
    setShitBalance(prev => prev - product.price);
    setShowMerchModal(false);
    setSelectedMerch(null);
    triggerSuccess(`Order placed! ${product.name} via Printful 📦`);
    addTransaction({ type: 'merch', amount: -product.price, description: `Ordered ${product.name}`, status: 'completed' });
  };

  const buyNFT = (listing: MarketplaceListing) => {
    if (shitBalance < listing.price) {
      triggerSuccess("Not enough $SHIT!");
      return;
    }
    const newNFT: OwnedNFT = {
      id: Date.now(),
      name: listing.name,
      rank: listing.rank,
      power: listing.power,
    };
    setOwnedNFTs(prev => [...prev, newNFT]);
    setShitBalance(prev => prev - listing.price);
    setMarketListings(prev => prev.filter(l => l.id !== listing.id));
    setShowBuyModal(false);
    setBuyingNFT(null);
    triggerSuccess(`Bought ${listing.name} for ${listing.price} $SHIT!`);
    addTransaction({ type: 'nft', amount: -listing.price, description: `Bought ${listing.name}`, status: 'completed' });
    updateQuestProgress('market');
  };

  const claimQuest = async (questId: number) => {
    if (!userId) return;
    
    const quest = quests.find(q => q.id === questId);
    if (!quest || quest.progress < quest.max || quest.claimed) return;
    
    try {
      // Update quest as claimed
      const { error } = await supabase
        .from('user_quests')
        .update({ is_claimed: true, claimed_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('quest_id', questId);
      
      if (error) throw error;
      
      // Add $SHIT reward
      const { error: balanceError } = await supabase.rpc('claim_quest_reward', {
        p_user_id: userId,
        p_quest_id: questId,
        p_reward: quest.reward,
      });
      
      if (balanceError) throw balanceError;
      
      triggerSuccess(`Quest completed! +${quest.reward} $SHIT 🎯`);
      
      // Refresh data
      await fetchUserData(userId);
    } catch (error) {
      console.error('Claim quest error:', error);
      triggerSuccess("Failed to claim quest");
    }
  };

  const updateQuestProgress = (type: 'offer' | 'stake' | 'market' | 'referral', increment: number = 1) => {
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
  };

  const claimDailyBonus = async () => {
    if (!userId) return;
    
    try {
      // Check if already claimed today
      if (lastDailyClaim && new Date(lastDailyClaim).toDateString() === new Date().toDateString()) {
        triggerSuccess("Daily bonus already claimed today!");
        return;
      }
      
      // Call RPC function
      const { data, error } = await supabase.rpc('claim_daily_bonus', {
        p_user_id: userId,
      });
      
      if (error) throw error;
      
      if (data.success) {
        triggerSuccess(`Daily bonus claimed! +${data.shit_earned} $SHIT (Streak: ${data.new_streak} days) 🔥`);
        await fetchUserData(userId);
      } else {
        triggerSuccess("Failed to claim daily bonus");
      }
    } catch (error) {
      console.error('Daily bonus error:', error);
      triggerSuccess("Failed to claim daily bonus");
    }
  };

  const claimAirdrop = () => {
    if (totalEarned < 5000 || hasClaimedAirdrop) return;
    const airdropAmount = totalEarned >= 25000 ? 1500 : totalEarned >= 10000 ? 600 : 250;
    setShitBalance(prev => prev + airdropAmount);
    setTotalEarned(prev => prev + airdropAmount);
    setHasClaimedAirdrop(true);
    setShowAirdrop(false);
    triggerSuccess(`Airdrop claimed! +${airdropAmount} $SHIT 🪂`);
    addTransaction({ type: 'airdrop', amount: airdropAmount, description: `Airdrop claim (${totalEarned >= 25000 ? 'Legendary' : totalEarned >= 10000 ? 'Epic' : 'Rare'} tier)`, status: 'completed' });
  };

  const mainTabs = [
    { id: "dashboard", label: "Home", icon: "🏠" },
    { id: "offerwall", label: "Earn", icon: "💰" },
    { id: "market", label: "Market", icon: "🛒" },
    { id: "quests", label: "Quests", icon: "📜" },
  ];

  const XP_PER_TIER = 500;
  const MAX_TIER = 20;
  const currentTier = Math.min(Math.floor(battlePassXP / XP_PER_TIER) + 1, MAX_TIER);
  const tierProgress = ((battlePassXP % XP_PER_TIER) / XP_PER_TIER) * 100;

  const BATTLE_PASS_REWARDS = [
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

  const gainBattlePassXP = (amount: number) => {
    setBattlePassXP(prev => {
      const newXP = prev + amount;
      const newTier = Math.min(Math.floor(newXP / XP_PER_TIER) + 1, MAX_TIER);
      const oldTier = Math.min(Math.floor(prev / XP_PER_TIER) + 1, MAX_TIER);
      if (newTier > oldTier) {
        triggerSuccess(`Battle Pass Tier ${newTier} unlocked! 🎉`);
      }
      return newXP;
    });
  };

  const claimTierReward = (tier: number) => {
    if (tier > currentTier || claimedTiers.includes(tier)) return;
    const reward = BATTLE_PASS_REWARDS.find(r => r.tier === tier);
    if (!reward) return;
    const shitReward = isGeneral ? reward.premium.amount : reward.free.amount;
    setShitBalance(prev => prev + shitReward);
    setClaimedTiers(prev => [...prev, tier]);
    triggerSuccess(`Tier ${tier} reward claimed! +${shitReward} $SHIT 🎁`);
    addTransaction({ type: 'quest', amount: shitReward, description: `Battle Pass Tier ${tier} reward`, status: 'completed' });
  };

  const dailyQuests = [
    { title: "Complete 2 offers", progress: 1, max: 2, reward: 300 },
    { title: "Play Tank Shooter", progress: 0, max: 1, reward: 150 },
    { title: "Stake 100 $SHIT", progress: 0, max: 1, reward: 200 },
  ];

  const streakMultiplier = Math.min(Math.floor(dailyStreak / 2) * 5, 35);

  return (
    <>
      {/* Toast Notifications */}
      <ToastContainer />
      
      {/* Onboarding for New Users */}
      {showOnboarding && onCompleteOnboarding && (
        <OnboardingModal onComplete={onCompleteOnboarding} />
      )}

    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <DashboardNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        walletAddress={walletAddress}
        isGeneral={isGeneral}
        kycStatus={kycStatus}
        setShowKYCModal={setShowKYCModal}
        onDisconnect={onDisconnect}
      />

      <div className="pt-20 pb-24 max-w-7xl mx-auto px-4 sm:px-6">
        {/* DASHBOARD */}
        {currentTab === "dashboard" && (
          <div key="dashboard" className="tab-content-enter space-y-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="text-amber-500 text-sm font-bold tracking-[3px] uppercase">WELCOME BACK, SOLDIER {isGeneral && "👑"}</div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">Dashboard</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-zinc-950 border border-white/10 px-6 py-3 rounded-2xl text-sm flex items-center gap-3">🔥 {dailyStreak} day streak</div>
                <button onClick={claimDailyBonus} className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-8 py-3 rounded-2xl text-sm font-black active:scale-[0.985] shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-shadow">CLAIM DAILY BONUS</button>
              </div>
            </div>

            {isGeneral && (
              <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 rounded-3xl p-6 flex items-center justify-between animate-glow-pulse">
                <div>
                  <div className="font-black text-xl">👑 GENERAL PASS ACTIVE</div>
                  <div className="text-amber-100 text-sm">+25% offer rewards • {generalDaysLeft > 0 ? `${generalDaysLeft} days remaining` : 'Active'}</div>
                </div>
                <div className="text-4xl animate-subtle-float">🔥</div>
              </div>
            )}

            {totalEarned >= 5000 && !hasClaimedAirdrop && (
              <div onClick={() => setShowAirdrop(true)} className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-6 flex items-center justify-between cursor-pointer hover:brightness-110 transition-all active:scale-[0.985]">
                <div>
                  <div className="font-bold text-xl flex items-center gap-2">🪂 AIRDROP READY</div>
                  <div className="text-purple-100 text-sm">You've earned {totalEarned.toLocaleString()} $SHIT • Claim your reward!</div>
                </div>
                <div className="text-4xl">🎁</div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="glass-card rounded-2xl md:rounded-3xl p-5 md:p-8 glass-card-hover transition-all">
                <div className="text-[10px] md:text-sm text-zinc-500 mb-1 tracking-wider">$SHIT BALANCE</div>
                <div className="text-2xl md:text-4xl lg:text-5xl font-black tabular-nums tracking-tighter text-amber-400">{shitBalance.toLocaleString()}</div>
              </div>
              <div className="glass-card rounded-2xl md:rounded-3xl p-5 md:p-8 glass-card-hover transition-all">
                <div className="text-[10px] md:text-sm text-zinc-500 mb-1 tracking-wider">POINTS</div>
                <div className="text-2xl md:text-4xl lg:text-5xl font-black tabular-nums tracking-tighter">{points.toLocaleString()}</div>
              </div>
              <div className="glass-card rounded-2xl md:rounded-3xl p-5 md:p-8 glass-card-hover transition-all">
                <div className="text-[10px] md:text-sm text-zinc-500 mb-1 tracking-wider">CURRENT RANK</div>
                <div className="text-xl md:text-3xl lg:text-4xl font-black">Private {isGeneral && "👑"}</div>
                <div className="text-amber-500 text-xs md:text-sm mt-1 md:mt-2">2,160 to Sergeant</div>
              </div>
              <div className="glass-card rounded-2xl md:rounded-3xl p-5 md:p-8 glass-card-hover transition-all">
                <div className="text-[10px] md:text-sm text-zinc-500 mb-1 tracking-wider">TOTAL EARNED</div>
                <div className="text-2xl md:text-3xl lg:text-4xl font-black tabular-nums">{totalEarned.toLocaleString()}</div>
                <div className="text-xs text-amber-500">$SHIT all-time {streakMultiplier > 0 && `(+${streakMultiplier}% streak)`}</div>
              </div>
            </div>

            {/* KYC Warning Banner */}
            {(() => {
              const KYC_THRESHOLD = 100; // USD
              const shitPrice = 0.01;
              const userBalanceUSD = shitBalance * shitPrice;
              const needsKYC = userBalanceUSD > KYC_THRESHOLD && kycStatus !== 'verified';
              
              if (needsKYC) {
                return (
                  <div onClick={() => setShowKYCModal(true)} className="bg-red-500/10 border border-red-500/40 rounded-2xl p-5 cursor-pointer hover:bg-red-500/15 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">⚠️</div>
                      <div className="flex-1">
                        <div className="font-bold text-red-400 mb-1">Identity Verification Required</div>
                        <div className="text-sm text-zinc-400">Your balance exceeds $100 equivalent. Complete KYC to enable withdrawals.</div>
                        <div className="mt-3 text-xs text-red-400 font-semibold">CLICK TO VERIFY →</div>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div className="flex gap-4">
              <button className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 py-4 rounded-2xl font-black text-lg active:scale-[0.985] shadow-lg shadow-amber-500/20">BUY $SHIT</button>
              <button onClick={() => {
                // Check KYC requirement (example: >$100 equivalent needs KYC)
                const KYC_THRESHOLD = 100; // USD
                const shitPrice = 0.01; // Mock $SHIT price in USD
                const userBalanceUSD = shitBalance * shitPrice;
                
                if (userBalanceUSD > KYC_THRESHOLD && kycStatus !== 'verified') {
                  setShowKYCModal(true);
                  return;
                }
                setShowWithdrawModal(true); setWithdrawStep(1); setWithdrawAmount(""); setWithdrawAddress("");
              }} className="flex-1 border border-white/30 hover:bg-white/5 py-4 rounded-2xl font-semibold text-lg active:scale-[0.985]">WITHDRAW</button>
            </div>

            {/* BATTLE PASS */}
            <div onClick={() => setShowBattlePass(true)} className="glass-card rounded-3xl p-7 cursor-pointer hover:border-amber-500/40 transition-all active:scale-[0.985] border border-amber-500/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-amber-500 text-xs tracking-[2px] font-bold">SEASON 1: SHIT RISING</div>
                  <div className="text-xl font-bold tracking-tight">Battle Pass</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-amber-400">{currentTier}</div>
                  <div className="text-xs text-zinc-500">/ {MAX_TIER} Tiers</div>
                </div>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all" style={{ width: `${tierProgress}%` }} />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">{battlePassXP} XP earned</span>
                <span className="text-amber-400 font-semibold">{claimedTiers.length} claimed</span>
              </div>
            </div>

            {/* AIRDROP PROGRESS */}
            <div className="glass-card rounded-3xl p-9">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="font-black text-xl flex items-center gap-3">🪂 YOUR AIRDROP</div>
                  <div className="text-sm text-zinc-400 mt-1">The more you earn, the bigger your reward</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-500">CURRENT TIER</div>
                  <div className="text-amber-400 font-semibold">
                    {totalEarned >= 25000 ? "LEGENDARY" : totalEarned >= 10000 ? "EPIC" : totalEarned >= 5000 ? "RARE" : "COMMON"}
                  </div>
                </div>
              </div>

              <div className="bg-black/60 rounded-2xl p-6 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <div>Progress to next tier</div>
                  <div className="font-mono text-amber-400">
                    {totalEarned >= 25000 ? "MAX" : totalEarned >= 10000 ? `${totalEarned}/25000` : totalEarned >= 5000 ? `${totalEarned}/10000` : `${totalEarned}/5000`}
                  </div>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" style={{ width: totalEarned >= 25000 ? '100%' : totalEarned >= 10000 ? `${Math.min(((totalEarned - 10000) / 15000) * 100, 100)}%` : totalEarned >= 5000 ? `${Math.min(((totalEarned - 5000) / 5000) * 100, 100)}%` : `${Math.min((totalEarned / 5000) * 100, 100)}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-zinc-500">ESTIMATED AIRDROP</div>
                  <div className="text-3xl font-bold text-purple-400">
                    {totalEarned >= 25000 ? "1,500" : totalEarned >= 10000 ? "600" : totalEarned >= 5000 ? "250" : "50"} $SHIT
                  </div>
                </div>
                
                {totalEarned >= 5000 && !hasClaimedAirdrop ? (
                  <button onClick={() => setShowAirdrop(true)} className="bg-purple-600 hover:bg-purple-500 px-8 py-3 rounded-2xl font-semibold active:scale-[0.985]">CLAIM NOW</button>
                ) : (
                  <div className="text-xs text-zinc-500 px-4 py-2 bg-white/5 rounded-full">Claim available at 5,000 $SHIT</div>
                )}
              </div>
            </div>

            <div className="glass-card rounded-3xl p-9">
              <div className="flex justify-between items-center mb-6">
                <div className="font-black text-xl flex items-center gap-3">📅 DAILY QUESTS <span className="text-xs bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full font-bold">RESET IN 18H</span></div>
                <div className="text-xs text-zinc-500">Complete all for +650 PTS bonus</div>
              </div>
              <div className="space-y-4">
                {dailyQuests.map((q, i) => (
                  <div key={i} className="flex items-center justify-between bg-black/60 rounded-2xl px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">🎯</div>
                      <div>
                        <div>{q.title}</div>
                        <div className="text-xs text-zinc-500">{q.progress}/{q.max} completed</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400 font-mono font-bold">+{q.reward} PTS</div>
                      <div className="w-28 h-1.5 bg-white/10 rounded-full mt-2"><div className="h-1.5 bg-gradient-to-r from-amber-500 to-orange-400 rounded-full" style={{width: `${(q.progress/q.max)*100}%`}}></div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div onClick={() => setCurrentTab("offerwall")} className="cursor-pointer glass-card glass-card-hover rounded-3xl p-8 active:scale-[0.985] transition-all group">
                <div className="text-5xl mb-6 group-hover:animate-subtle-float">⚡</div>
                <div className="text-2xl md:text-3xl font-black group-hover:text-amber-400 transition-colors">Go to Offerwall</div>
                <div className="text-zinc-400 mt-2 text-sm">8 offers • Highest: 2,100 PTS {streakMultiplier > 0 && `(+${streakMultiplier}%)`}</div>
              </div>
              <div onClick={() => setCurrentTab("stake")} className="cursor-pointer glass-card glass-card-hover rounded-3xl p-8 active:scale-[0.985] transition-all group">
                <div className="text-5xl mb-6 group-hover:animate-subtle-float">🏆</div>
                <div className="text-2xl md:text-3xl font-black group-hover:text-amber-400 transition-colors">Stake $SHIT</div>
                <div className="text-zinc-400 mt-2 text-sm">48% APY • TVL $1.24M</div>
              </div>
              <div onClick={() => setCurrentTab("quests")} className="cursor-pointer glass-card glass-card-hover rounded-3xl p-8 active:scale-[0.985] transition-all group">
                <div className="text-5xl mb-6 group-hover:animate-subtle-float">📜</div>
                <div className="text-2xl md:text-3xl font-black group-hover:text-amber-400 transition-colors">Quests</div>
                <div className="text-zinc-400 mt-2 text-sm">Daily &amp; Weekly Missions</div>
              </div>
            </div>
          </div>
        )}

        {/* OFFERWALL */}
        {currentTab === "offerwall" && (
          <div>
            <div className="mb-10">
              <div className="text-amber-500 text-sm font-bold tracking-[3px]">EARN REAL $SHIT {streakMultiplier > 0 && `(+${streakMultiplier}% STREAK)`}</div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">Offerwall</h2>
            </div>

            {/* ACTIVE OFFERS */}
            {activeOffers.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-bold tracking-tight">🔥 Active Offers</div>
                  <div className="text-xs text-zinc-500">{activeOffers.filter(a => a.status === 'in_progress').length} in progress</div>
                </div>
                <div className="space-y-3">
                  {activeOffers.map(active => {
                    const offer = OFFERS.find(o => o.id === active.offerId);
                    if (!offer) return null;
                    return (
                      <div key={active.offerId} className="bg-zinc-950 border border-amber-500/40 rounded-2xl p-5">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">{offer.icon}</div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{offer.title}</div>
                            <div className="text-xs text-zinc-500 mt-1">{active.status === 'completed' ? '✅ Ready to claim!' : `⏱️ ${offer.time} estimated`}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-amber-400 font-mono font-bold">+{active.estimatedReward}</div>
                            <div className="text-[10px] text-zinc-500">PTS</div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span className={active.progress >= 100 ? 'text-green-400' : 'text-amber-400'}>
                              {active.progress >= 100 ? 'Completed!' : `${active.progress}% done`}
                            </span>
                            <span className="text-zinc-500">{active.progress}%</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${active.progress >= 100 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${active.progress}%` }} />
                          </div>
                        </div>
                        {active.status === 'completed' && (
                          <button onClick={() => completeOffer(offer, active.userOfferId || active.id)} className="w-full mt-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-xl text-sm font-black active:scale-[0.985] shadow-lg shadow-amber-500/20">
                            CLAIM REWARD
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="glass-card border-amber-500/20 rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
              <div>
                <div className="text-sm text-zinc-400">YOUR POINTS</div>
                <div className="text-5xl md:text-6xl lg:text-7xl font-black tabular-nums tracking-tighter text-amber-400">{points}</div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="text-xs text-zinc-500">EXCHANGE RATE</div>
                <div className="font-mono text-3xl">1 $SHIT = 12 PTS</div>
              </div>
              <button onClick={() => triggerSuccess("Points converted!")} disabled={points < 100} className="bg-gradient-to-r from-amber-500 to-orange-500 disabled:bg-zinc-800 disabled:from-zinc-800 disabled:to-zinc-800 px-12 py-4 rounded-2xl font-black text-lg active:scale-[0.985] shadow-lg shadow-amber-500/20">CONVERT TO $SHIT</button>
            </div>

            {/* BOOST BANNER */}
            {offerBoosts.filter(b => b.expiresAt > new Date()).length > 0 && (
              <div className="mb-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/40 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">⚡</span>
                  <div className="font-bold text-lg">Active Boosts</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {offerBoosts.filter(b => b.expiresAt > new Date()).map(boost => {
                    const offer = OFFERS.find(o => o.id === boost.offerId);
                    return (
                      <div key={boost.id} className="bg-black/40 rounded-xl px-4 py-2 text-sm">
                        <span className="font-bold text-purple-400">{boost.multiplier}x</span>
                        <span className="text-zinc-400 mx-2">on</span>
                        <span className="font-semibold">{offer?.title}</span>
                        <span className="text-zinc-500 ml-2">({formatTimeLeft(boost.expiresAt)})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {OFFERS.map((offer, idx) => {
                const active = activeOffers.find(a => a.offerId === offer.id);
                const boost = offerBoosts.find(b => b.offerId === offer.id && b.expiresAt > new Date());
                const boostedReward = boost ? offer.reward * boost.multiplier : offer.reward;
                return (
                  <div key={idx} onClick={() => !active && setSelectedOffer(offer)} className={`glass-card ${offer.exclusive && isGeneral ? 'border-amber-500/50' : active ? 'border-amber-500/60' : ''} hover:border-amber-500/40 rounded-3xl p-8 cursor-pointer active:scale-[0.985] transition-all group relative overflow-hidden`}>
                    {boost && (
                      <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs px-3 py-1 rounded-bl-xl font-bold">
                        {boost.multiplier}x BOOST
                      </div>
                    )}
                    {active && (
                      <div className="absolute top-0 right-0 bg-amber-600 text-white text-xs px-3 py-1 rounded-bl-xl font-bold">
                        {active.progress}%
                      </div>
                    )}
                    <div className="flex justify-between mb-8">
                      <div className="text-4xl md:text-5xl lg:text-6xl">{offer.icon}</div>
                      <div className="text-right">
                        <div className={`text-3xl md:text-4xl lg:text-5xl font-black tabular-nums ${boost ? 'text-purple-400' : 'text-amber-400'}`}>
                          +{boostedReward}
                        </div>
                        <div className="text-xs text-zinc-500">POINTS</div>
                      </div>
                    </div>
                    <div className="font-bold text-2xl mb-3 group-hover:text-amber-400 transition">{offer.title}</div>
                    <div className="text-zinc-400 text-[15px] mb-6 line-clamp-2">{offer.description}</div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="px-4 py-1 bg-white/5 rounded-full text-xs">{offer.category}</div>
                        {offer.exclusive && <div className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full font-bold">GENERAL ONLY</div>}
                      </div>
                      <div className={active ? 'text-amber-400' : ''}>{active ? '⏱️ In Progress' : offer.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STAKING */}
        {currentTab === "stake" && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="text-6xl md:text-8xl mb-6">🏆</div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">Staking</h2>
              <p className="text-lg md:text-2xl text-zinc-400 mt-3">Earn passive income while you sleep</p>
            </div>
            <div className="bg-zinc-950 border border-white/10 rounded-3xl p-10 mb-8">
              <div className="flex justify-between mb-10">
                <div>
                  <div className="text-sm text-zinc-500">CURRENT APY</div>
                  <div className="text-5xl md:text-7xl lg:text-[92px] font-black text-amber-400 tabular-nums leading-none">48<span className="text-3xl md:text-5xl align-super">%</span></div>
                </div>
                <div className="text-right text-sm text-zinc-400">TVL: $1.24M<br />Stakers: 8,472</div>
              </div>
              <div className="bg-black/60 rounded-2xl p-8">
                <div className="text-sm mb-3 text-zinc-400">AMOUNT TO STAKE</div>
                <div className="flex items-center gap-4 mb-8">
                  <input type="number" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} placeholder="0" className="bg-transparent text-5xl md:text-6xl lg:text-7xl font-semibold w-full outline-none placeholder:text-zinc-700" />
                  <div className="text-4xl text-amber-500">$SHIT</div>
                </div>
                <div className="flex gap-3 mb-8">
                  {[7,30,90].map(days => (
                    <button key={days} onClick={() => setStakeLock(days)} className={`flex-1 py-4 rounded-2xl text-sm font-bold transition ${stakeLock === days ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black" : "bg-white/5 hover:bg-white/10"}`}>
                      {days} DAYS<br /><span className="text-xs opacity-60">{days === 7 ? "32%" : days === 30 ? "48%" : "67%"} APY</span>
                    </button>
                  ))}
                </div>
                <button onClick={stakeTokens} disabled={!stakeAmount} className="w-full py-5 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-black text-lg active:scale-[0.985] disabled:bg-zinc-800 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 shadow-lg shadow-amber-500/20">STAKE NOW</button>
              </div>
            </div>
          </div>
        )}

        {/* MARKETPLACE */}
        {currentTab === "market" && (
          <div>
            <div className="text-center mb-12">
              <div className="text-6xl md:text-8xl mb-6">🛒</div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">NFT Marketplace</h2>
              <p className="text-lg md:text-xl text-zinc-400 mt-3">Buy & sell Poop Army Soldiers • 7.5% platform fee</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {marketListings.map((listing) => (
                <div key={listing.id} className="glass-card glass-card-hover rounded-3xl p-8 transition-all">
                  <div className="flex justify-between mb-6">
                    <div>
                      <div className="font-bold text-xl">{listing.name}</div>
                      <div className="text-amber-400 text-sm">{listing.rank} • Power {listing.power}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-amber-400">{listing.price}</div>
                      <div className="text-xs text-zinc-500">$SHIT</div>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500 mb-6">Seller: {listing.seller}</div>
                  <button onClick={() => { setBuyingNFT(listing); setShowBuyModal(true); }} className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-black active:scale-[0.985] shadow-lg shadow-amber-500/20">
                    BUY NOW
                  </button>
                </div>
              ))}
            </div>
            <div className="text-center text-xs text-zinc-500 mt-8">List your own NFTs soon • 7.5% fee on sales</div>
          </div>
        )}

        {/* GAME */}
        {currentTab === "quests" && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="text-6xl md:text-8xl mb-6">📜</div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">Missions</h2>
              <p className="text-lg md:text-xl text-zinc-400 mt-3">Complete quests. Earn $SHIT. Climb the ranks.</p>
            </div>

            {/* Daily Quests */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-amber-500 text-sm font-bold tracking-[3px]">RESET IN 6H 42M</div>
                  <div className="text-3xl font-black tracking-tight">Daily Quests</div>
                </div>
                <div className="text-sm text-zinc-500">{quests.filter(q => q.category === 'daily' && q.claimed).length}/{quests.filter(q => q.category === 'daily').length} completed</div>
              </div>
              <div className="space-y-4">
                {quests.filter(q => q.category === 'daily').map(q => (
                  <div key={q.id} className={`glass-card ${q.claimed ? 'border-amber-500/30' : ''} rounded-3xl p-6 flex items-center gap-5`}>
                    <div className="text-4xl">{q.icon}</div>
                    <div className="flex-1">
                      <div className="font-bold text-lg">{q.title}</div>
                      <div className="text-sm text-zinc-400">{q.description}</div>
                      <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all" style={{width: `${(q.progress / q.max) * 100}%`}} />
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">{q.progress} / {q.max}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-amber-400 font-mono font-bold text-xl">+{q.reward}</div>
                      <div className="text-xs text-zinc-500">$SHIT</div>
                      {q.progress >= q.max && !q.claimed && (
                        <button onClick={() => claimQuest(q.id)} className="mt-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-xl text-xs font-black active:scale-[0.985]">CLAIM</button>
                      )}
                      {q.claimed && <div className="mt-2 text-amber-400 text-xs font-bold">✓ CLAIMED</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Quests */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-purple-400 text-sm tracking-[2px]">RESET EVERY MONDAY</div>
                  <div className="text-3xl font-bold tracking-tight">Weekly Quests</div>
                </div>
                <div className="text-sm text-zinc-500">{quests.filter(q => q.category === 'weekly' && q.claimed).length}/{quests.filter(q => q.category === 'weekly').length} completed</div>
              </div>
              <div className="space-y-4">
                {quests.filter(q => q.category === 'weekly').map(q => (
                  <div key={q.id} className={`bg-zinc-950 border ${q.claimed ? 'border-purple-500/40' : 'border-white/10'} rounded-3xl p-6 flex items-center gap-5`}>
                    <div className="text-4xl">{q.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{q.title}</div>
                      <div className="text-sm text-zinc-400">{q.description}</div>
                      <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all" style={{width: `${(q.progress / q.max) * 100}%`}} />
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">{q.progress} / {q.max}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-purple-400 font-mono font-bold text-xl">+{q.reward}</div>
                      <div className="text-xs text-zinc-500">$SHIT</div>
                      {q.progress >= q.max && !q.claimed && (
                        <button onClick={() => claimQuest(q.id)} className="mt-2 px-5 py-2 bg-purple-600 rounded-xl text-xs font-bold active:scale-[0.985]">CLAIM</button>
                      )}
                      {q.claimed && <div className="mt-2 text-purple-400 text-xs">✓ CLAIMED</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestone Quests */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-amber-400 text-sm tracking-[2px]">PERMANENT PROGRESS</div>
                  <div className="text-3xl font-bold tracking-tight">Milestones</div>
                </div>
                <div className="text-sm text-zinc-500">{quests.filter(q => q.category === 'milestone' && q.claimed).length}/{quests.filter(q => q.category === 'milestone').length} completed</div>
              </div>
              <div className="space-y-4">
                {quests.filter(q => q.category === 'milestone').map(q => (
                  <div key={q.id} className={`bg-zinc-950 border ${q.claimed ? 'border-amber-500/40' : 'border-white/10'} rounded-3xl p-6 flex items-center gap-5`}>
                    <div className="text-4xl">{q.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{q.title}</div>
                      <div className="text-sm text-zinc-400">{q.description}</div>
                      <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all" style={{width: `${(q.progress / q.max) * 100}%`}} />
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">{q.progress} / {q.max}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-amber-400 font-mono font-bold text-xl">+{q.reward}</div>
                      <div className="text-xs text-zinc-500">$SHIT</div>
                      {q.progress >= q.max && !q.claimed && (
                        <button onClick={() => claimQuest(q.id)} className="mt-2 px-5 py-2 bg-amber-600 rounded-xl text-xs font-bold active:scale-[0.985]">CLAIM</button>
                      )}
                      {q.claimed && <div className="mt-2 text-amber-400 text-xs">✓ CLAIMED</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BATTLE PASS */}
        {currentTab === "battlepass" && (
          <BattlePass userId={userId || 'mock-user'} />
        )}

        {/* ACHIEVEMENTS */}
        {currentTab === "achievements" && (
          <Achievements userId={userId || 'mock-user'} />
        )}

        {/* ARMY (NFT) */}
        {currentTab === "army" && (
          <Army userId={userId || 'mock-user'} />
        )}

        {/* MARKETPLACE */}
        {currentTab === "market" && (
          <Market userId={userId || 'mock-user'} />
        )}

        {/* MERCH */}
        {currentTab === "merch" && (
          <div>
            <div className="text-center mb-12">
              <div className="text-6xl md:text-8xl mb-6">👕</div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">Shit Army Merch</h2>
              <p className="text-lg md:text-xl text-zinc-400 mt-3">Wear the army • Printed & shipped by Printful</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MERCH_PRODUCTS.map((product) => (
                <div key={product.id} className="glass-card glass-card-hover rounded-3xl p-8 transition-all group">
                  <div className="text-6xl md:text-8xl mb-8 text-center group-hover:scale-110 transition-transform">{product.emoji}</div>
                  
                  <div className="font-bold text-2xl mb-2">{product.name}</div>
                  <div className="text-amber-400 text-sm mb-4">{product.color}</div>
                  <div className="text-zinc-400 text-sm mb-8">{product.description}</div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xs text-zinc-500">PRICE</div>
                      <div className="text-4xl font-black text-amber-400 tabular-nums">{product.price}</div>
                    </div>
                    <button onClick={() => { setSelectedMerch(product); setShowMerchModal(true); }} className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-8 py-3 rounded-2xl font-black text-sm active:scale-[0.985] shadow-lg shadow-amber-500/20">
                      BUY NOW
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center text-xs text-zinc-500 mt-12 max-w-md mx-auto">
              All items printed on-demand via Printful • Ships worldwide • 100% satisfaction guaranteed
            </div>
          </div>
        )}

        

        {/* REFERRALS */}
        {currentTab === "referral" && (
          <ReferralPage userId={userId || 'mock-user'} />
        )}

        {/* SETTINGS */}
        {currentTab === "settings" && (
          <SettingsPage userId={userId || 'mock-user'} onKycClick={() => setShowKYCModal(true)} />
        )}

        {/* ADMIN PANEL - Only for General */}
        {currentTab === "admin" && isGeneral && (
          <AdminPanel adminUserId={userId || 'mock-user'} />
        )}

        {/* LEADERBOARD */}
        {currentTab === "leaderboard" && (
          <Leaderboard userId={userId || 'mock-user'} />
        )}

        

        {/* HISTORY */}
        {currentTab === "history" && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="text-6xl md:text-8xl mb-6">📜</div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">Transaction History</h2>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {(['all', 'offer', 'withdrawal', 'stake', 'quest', 'daily'] as const).map(filter => (
                <button key={filter} className="px-5 py-2 rounded-full text-sm bg-zinc-950 border border-white/10 whitespace-nowrap hover:bg-white/5 transition-all">
                  {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            <div className="bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden">
              {transactions.length === 0 ? (
                <div className="p-12 text-center text-zinc-500">No transactions yet</div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-4 px-6 py-5 border-b border-white/10 last:border-0 hover:bg-white/5 transition-all">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg flex-shrink-0">
                      {tx.type === 'offer' && '⚡'}
                      {tx.type === 'withdrawal' && '🏦'}
                      {tx.type === 'stake' && '🏆'}
                      {tx.type === 'quest' && '📜'}
                      {tx.type === 'airdrop' && '🪂'}
                      {tx.type === 'referral' && '👥'}
                      {tx.type === 'nft' && '🪖'}
                      {tx.type === 'merch' && '👕'}
                      {tx.type === 'daily' && '🔥'}
                      {tx.type === 'purchase' && '🛒'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{tx.description}</div>
                      <div className="text-xs text-zinc-500">{tx.timestamp.toLocaleString()}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`font-mono font-bold tabular-nums ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.amount >= 0 ? '+' : ''}{tx.amount} $SHIT
                      </div>
                      <div className={`text-[10px] uppercase tracking-wider ${tx.status === 'completed' ? 'text-green-500' : tx.status === 'pending' ? 'text-amber-500' : 'text-red-500'}`}>
                        {tx.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {selectedOffer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6" onClick={() => setSelectedOffer(null)}>
          <div className="bg-zinc-950 border border-white/20 rounded-3xl max-w-md w-full p-9" onClick={e => e.stopPropagation()}>
            <div className="text-8xl text-center mb-8">{selectedOffer.icon}</div>
            <div className="text-center mb-8">
              <div className="text-3xl font-semibold mb-4">{selectedOffer.title}</div>
              <div className="text-zinc-400">{selectedOffer.description}</div>
            </div>

            {/* Show boost if active */}
            {(() => {
              const boost = offerBoosts.find(b => b.offerId === selectedOffer.id && b.expiresAt > new Date());
              const boostedReward = boost ? selectedOffer.reward * boost.multiplier : selectedOffer.reward;
              return (
                <>
                  <div className="flex justify-between text-sm mb-6 px-4">
                    <div>
                      <div className="text-zinc-500">REWARD</div>
                      <div className={`text-4xl font-black ${boost ? 'text-purple-400' : 'text-amber-400'}`}>
                        +{boostedReward}
                      </div>
                      {boost && <div className="text-xs text-purple-400 mt-1">🔥 {boost.multiplier}x BOOST ACTIVE!</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-zinc-500">TIME</div>
                      <div className="text-4xl font-semibold">{selectedOffer.time}</div>
                    </div>
                  </div>

                  {boost && (
                    <div className="bg-purple-600/20 border border-purple-500/40 rounded-xl p-4 mb-6 text-center">
                      <div className="text-sm text-purple-400 font-semibold">⚡ BOOST EXPIRES IN</div>
                      <div className="text-2xl font-mono font-bold text-purple-300">{formatTimeLeft(boost.expiresAt)}</div>
                    </div>
                  )}

                  {/* Progress preview if already active */}
                  {(() => {
                    const active = activeOffers.find(a => a.offerId === selectedOffer.id);
                    if (active) return (
                      <div className="bg-amber-600/20 border border-amber-500/40 rounded-xl p-4 mb-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-amber-400 font-semibold">⏱️ IN PROGRESS</span>
                          <span className="text-amber-400">{active.progress}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${active.progress}%` }} />
                        </div>
                        <div className="text-xs text-zinc-400 mt-2 text-center">
                          {active.status === 'completed' ? '✅ Ready to claim reward!' : 'Offer is processing in background...'}
                        </div>
                      </div>
                    );
                    return null;
                  })()}

                  <button
                    onClick={() => {
                      const alreadyActive = userOffers.find((a: any) => a.offer_id === selectedOffer.id || a.offers?.id === selectedOffer.id);
                      if (alreadyActive) {
                        if (alreadyActive.status === 'completed') {
                          completeOffer(selectedOffer, alreadyActive.id);
                        } else {
                          setSelectedOffer(null);
                          triggerSuccess("Offer already in progress!");
                        }
                      } else {
                        startOffer(selectedOffer);
                        setSelectedOffer(null);
                      }
                    }}
                    disabled={isCompleting}
                    className="w-full py-5 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-black text-lg active:scale-[0.985] disabled:bg-zinc-800 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 shadow-lg shadow-amber-500/20"
                  >
                    {(() => {
                      const active = activeOffers.find(a => a.offerId === selectedOffer.id);
                      if (active?.status === 'completed') return 'CLAIM REWARD';
                      if (active) return 'TRACKING...';
                      return 'START TRACKING';
                    })()}
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {showAirdrop && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6" onClick={() => setShowAirdrop(false)}>
          <div className="bg-zinc-950 border border-white/20 rounded-3xl max-w-md w-full p-9 text-center" onClick={e => e.stopPropagation()}>
            <div className="text-6xl mb-6">🪂</div>
            <div className="text-4xl font-bold mb-2">Airdrop Claim</div>
            <div className="text-xl text-purple-400 mb-8">You've earned {totalEarned.toLocaleString()} $SHIT</div>
            
            <div className="bg-black/60 rounded-2xl p-6 mb-8">
              <div className="text-sm text-zinc-400 mb-1">YOUR AIRDROP REWARD</div>
              <div className="text-5xl font-bold text-purple-400">
                {totalEarned >= 25000 ? "1,500" : totalEarned >= 10000 ? "600" : "250"} $SHIT
              </div>
            </div>

            <button onClick={claimAirdrop} disabled={hasClaimedAirdrop} className="w-full py-5 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 rounded-2xl font-bold text-lg active:scale-[0.985]">
              CLAIM AIRDROP
            </button>
          </div>
        </div>
      )}

      {showWithdrawModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6" onClick={() => setShowWithdrawModal(false)}>
          <div className="bg-zinc-950 border border-white/20 rounded-3xl max-w-md w-full p-9" onClick={e => e.stopPropagation()}>
            {/* Step 1: Form */}
            {withdrawStep === 1 && (
              <>
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">🏦</div>
                  <div className="text-3xl font-bold tracking-tight">Withdraw $SHIT</div>
                  <div className="text-zinc-400 mt-2">Available: {shitBalance.toLocaleString()} $SHIT</div>
                </div>

                {/* Network Selector */}
                <div className="mb-6">
                  <div className="text-xs text-zinc-500 mb-2">SELECT NETWORK</div>
                  <div className="grid grid-cols-3 gap-3">
                    {NETWORKS.map(net => (
                      <button key={net.id} onClick={() => setSelectedNetwork(net)} className={`p-3 rounded-2xl border text-center transition-all ${selectedNetwork.id === net.id ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 hover:bg-white/5'}`}>
                        <div className="text-2xl mb-1">{net.icon}</div>
                        <div className="text-xs font-semibold">{net.name}</div>
                        <div className="text-[10px] text-zinc-500">Fee: {net.fee}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-zinc-500 mb-2">
                    <span>AMOUNT</span>
                    <span>Min: {selectedNetwork.minWithdraw} $SHIT</span>
                  </div>
                  <div className="flex items-center gap-3 bg-black/60 border border-white/10 rounded-2xl px-5 py-4">
                    <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="0.00" className="bg-transparent text-3xl font-semibold w-full outline-none placeholder:text-zinc-700" />
                    <span className="text-amber-500 font-bold text-sm">$SHIT</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[25, 50, 100].map(pct => (
                      <button key={pct} onClick={() => setWithdrawAmount(Math.floor(shitBalance * pct / 100).toString())} className="flex-1 py-1.5 rounded-lg bg-white/5 text-xs hover:bg-white/10 transition-all">{pct}%</button>
                    ))}
                    <button onClick={() => setWithdrawAmount(shitBalance.toString())} className="flex-1 py-1.5 rounded-lg bg-white/5 text-xs hover:bg-white/10 transition-all">MAX</button>
                  </div>
                </div>

                {/* Address */}
                <div className="mb-8">
                  <div className="text-xs text-zinc-500 mb-2">RECEIVING ADDRESS</div>
                  <input type="text" value={withdrawAddress} onChange={(e) => setWithdrawAddress(e.target.value)} placeholder="0x..." className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-amber-500 placeholder:text-zinc-700" />
                </div>

                <button
                  onClick={() => {
                    const amt = parseFloat(withdrawAmount);
                    if (!amt || amt <= 0 || amt > shitBalance || amt < selectedNetwork.minWithdraw || !withdrawAddress.trim()) {
                      triggerSuccess("Invalid amount or address");
                      return;
                    }
                    setWithdrawStep(2);
                  }}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-black text-lg active:scale-[0.985] shadow-lg shadow-amber-500/20"
                >
                  REVIEW WITHDRAWAL
                </button>
              </>
            )}

            {/* Step 2: Review */}
            {withdrawStep === 2 && (
              <>
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">🔍</div>
                  <div className="text-3xl font-bold tracking-tight">Review</div>
                </div>

                <div className="bg-black/60 rounded-2xl p-6 space-y-4 mb-8 text-sm">
                  <div className="flex justify-between"><span className="text-zinc-500">Network</span><span className="font-semibold">{selectedNetwork.icon} {selectedNetwork.name}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Amount</span><span className="font-semibold">{parseFloat(withdrawAmount).toFixed(2)} $SHIT</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Network Fee</span><span className="font-semibold text-amber-400">-{selectedNetwork.fee} $SHIT</span></div>
                  <div className="border-t border-white/10 pt-4 flex justify-between"><span className="text-zinc-500">You Receive</span><span className="font-black text-amber-400 text-lg">{(parseFloat(withdrawAmount) - selectedNetwork.fee).toFixed(2)} $SHIT</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">To Address</span><span className="font-mono text-xs">{withdrawAddress.slice(0, 10)}...{withdrawAddress.slice(-6)}</span></div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setWithdrawStep(1)} className="flex-1 py-4 rounded-2xl border border-white/30">BACK</button>
                  <button onClick={submitWithdrawal} className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-black active:scale-[0.985]">CONFIRM</button>
                </div>
              </>
            )}

            {/* Step 3: Success */}
            {withdrawStep === 3 && (
              <div className="text-center py-8">
                <div className="text-8xl mb-6">✅</div>
                <div className="text-3xl font-bold tracking-tight mb-2">Withdrawal Sent!</div>
                <div className="text-zinc-400 mb-8">{(parseFloat(withdrawAmount) - selectedNetwork.fee).toFixed(2)} $SHIT → {selectedNetwork.name}</div>
                <button onClick={() => setShowWithdrawModal(false)} className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-black active:scale-[0.985]">DONE</button>
              </div>
            )}
          </div>
        </div>
      )}

      {showMerchModal && selectedMerch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6" onClick={() => setShowMerchModal(false)}>
          <div className="bg-zinc-950 border border-white/20 rounded-3xl max-w-md w-full p-9" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-8">
              <div className="text-8xl mb-6">{selectedMerch.emoji}</div>
              <div className="text-3xl font-bold mb-2">{selectedMerch.name}</div>
              <div className="text-amber-400">{selectedMerch.color}</div>
            </div>
            
            <div className="text-center mb-8">
              <div className="text-5xl font-black text-amber-400 tabular-nums">{selectedMerch.price}</div>
              <div className="text-xs text-zinc-500 mt-1">$SHIT</div>
            </div>

            <div className="bg-black/60 rounded-2xl p-5 mb-8 text-sm text-zinc-400">
              {selectedMerch.description}<br />
              Printed & shipped by Printful • 7-14 business days
            </div>

            <button onClick={() => buyMerch(selectedMerch)} className="w-full py-5 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-black text-lg active:scale-[0.985] shadow-lg shadow-amber-500/20">
              CONFIRM ORDER
            </button>
          </div>
        </div>
      )}

      {showBuyModal && buyingNFT && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6" onClick={() => setShowBuyModal(false)}>
          <div className="bg-zinc-950 border border-white/20 rounded-3xl max-w-md w-full p-9" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🪖</div>
              <div className="text-2xl font-bold">{buyingNFT.name}</div>
              <div className="text-amber-400">{buyingNFT.rank} • Power {buyingNFT.power}</div>
            </div>
            <div className="flex justify-between text-sm mb-8">
              <div>Price</div>
              <div className="font-black text-amber-400">{buyingNFT.price} $SHIT</div>
            </div>
            <button onClick={() => buyNFT(buyingNFT)} className="w-full py-5 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-black text-lg active:scale-[0.985] shadow-lg shadow-amber-500/20">
              CONFIRM PURCHASE
            </button>
          </div>
        </div>
      )}


      {showBattlePass && (
        <div className="fixed inset-0 z-[100] bg-black/95 p-6 overflow-y-auto" onClick={() => setShowBattlePass(false)}>
          <div className="max-w-2xl mx-auto py-8" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-10">
              <div className="text-amber-500 text-xs tracking-[3px] font-bold mb-2">SEASON 1: SHIT RISING</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Battle Pass</h2>
              <p className="text-zinc-400">Earn XP by completing offers, quests & staking. {isGeneral ? 'Premium rewards active!' : 'General Pass unlocks 3x rewards.'}</p>
            </div>

            {/* Current Tier Progress */}
            <div className="bg-zinc-950 border border-white/10 rounded-3xl p-8 mb-8">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <div className="text-5xl font-black text-amber-400">Tier {currentTier}</div>
                  <div className="text-sm text-zinc-500 mt-1">{battlePassXP} / {currentTier * XP_PER_TIER} XP to next tier</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-500">MAX TIER</div>
                  <div className="text-2xl font-bold">{MAX_TIER}</div>
                </div>
              </div>
              <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all" style={{ width: `${tierProgress}%` }} />
              </div>
            </div>

            {/* XP Sources */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 text-center text-sm">
              <div className="glass-card rounded-2xl p-4"><div className="text-amber-400 font-bold">+50 XP</div><div className="text-zinc-500 text-xs">Per Offer</div></div>
              <div className="glass-card rounded-2xl p-4"><div className="text-amber-400 font-bold">+100 XP</div><div className="text-zinc-500 text-xs">Per Quest</div></div>
              <div className="glass-card rounded-2xl p-4"><div className="text-amber-400 font-bold">+30 XP</div><div className="text-zinc-500 text-xs">Per Stake</div></div>
              <div className="glass-card rounded-2xl p-4"><div className="text-amber-400 font-bold">+25 XP</div><div className="text-zinc-500 text-xs">Daily Login</div></div>
            </div>

            {/* Tiers Grid */}
            <div className="space-y-3">
              {BATTLE_PASS_REWARDS.map((tier) => {
                const unlocked = tier.tier <= currentTier;
                const claimed = claimedTiers.includes(tier.tier);
                return (
                  <div key={tier.tier} className={`glass-card ${claimed ? 'border-amber-500/30' : unlocked ? 'border-amber-500/20' : ''} rounded-2xl p-5 flex items-center gap-5`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${claimed ? 'bg-amber-500 text-black' : unlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-zinc-600'}`}>
                      {claimed ? '✓' : tier.tier}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-zinc-500 mb-1">{isGeneral ? 'PREMIUM REWARD' : 'FREE REWARD'}</div>
                      <div className="font-semibold">
                        {isGeneral ? `+${tier.premium.amount} $SHIT` : `+${tier.free.amount} $SHIT`}
                        {isGeneral && tier.premium.extra && ` • ${tier.premium.extra}`}
                        {!isGeneral && tier.free.extra && ` • ${tier.free.extra}`}
                      </div>
                    </div>
                    {unlocked && !claimed && (
                      <button onClick={() => claimTierReward(tier.tier)} className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-xl text-sm font-black active:scale-[0.985]">CLAIM</button>
                    )}
                    {claimed && <div className="text-amber-400 text-sm font-bold">CLAIMED</div>}
                  </div>
                );
              })}
            </div>

            <button onClick={() => setShowBattlePass(false)} className="w-full mt-8 py-4 border border-white/20 rounded-2xl text-sm font-semibold">CLOSE</button>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[300] bg-gradient-to-r from-amber-500 to-orange-500 text-black px-9 py-4 rounded-2xl flex items-center gap-3 font-black shadow-2xl shadow-amber-500/30">
          💩 {successMessage}
        </div>
      )}

      {showKYCModal && (
        <KYCModal
          isOpen={showKYCModal}
          onClose={() => setShowKYCModal(false)}
          onSubmit={(data) => {
            console.log('KYC submitted:', data);
            setKycStatus('pending');
            triggerSuccess('KYC submitted! Under review...');
          }}
          status={kycStatus}
        />
      )}
    </div>
    </>
  );
}

