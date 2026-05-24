"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

import DashboardNav from './DashboardNav';
import SpinWheel from './SpinWheel';
import MiniGames from './MiniGames';
import VIPTiers from './VIPTiers';
import FiatRamp from './FiatRamp';
import AntiFraud from './AntiFraud';
import MemeFeed from './MemeFeed';
import Guilds from './Guilds';
import AmbassadorPanel from './AmbassadorPanel';
import SeasonalEvents from './SeasonalEvents';
import Tooltip from './ui/Tooltip';
import EmptyState from './ui/EmptyState';
import { SkeletonDashboard, SkeletonOfferwall } from './SkeletonLoader';

import { useDashboard } from '@/hooks/useDashboard';
import { getRank } from '@/lib/types';
import type { Network, MerchProduct, MarketplaceListing } from '@/lib/types';
import { OFFERS, NETWORKS, MERCH_PRODUCTS, BATTLE_PASS_REWARDS } from '@/lib/constants';
import { CONFIG } from '@/lib/config';
import { sfx } from '@/lib/sounds';
import { fireWinConfetti, firePurchaseConfetti } from '@/lib/confetti';

interface DashboardProps {
  onDisconnect: () => void;
  walletAddress: string;
  isGeneral: boolean;
  generalDaysLeft: number;
  showOnboarding?: boolean;
  onCompleteOnboarding?: () => void;
}

const tabVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

function isValidEthAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

export default function Dashboard({ onDisconnect, walletAddress, isGeneral: _initialIsGeneral, generalDaysLeft, showOnboarding = false, onCompleteOnboarding }: DashboardProps) {
  const [currentTab, setCurrentTab] = useState<"dashboard" | "offerwall" | "stake" | "market" | "quests" | "merch" | "army" | "referral" | "achievements" | "history" | "settings" | "admin" | "battlepass" | "leaderboard" | "spin" | "games" | "vip" | "fiat" | "antifraud" | "memes" | "guilds" | "ambassador" | "events">("dashboard");

  const db = useDashboard();

  // Local modal states
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<typeof OFFERS[0] | null>(null);
  const [showBattlePass, setShowBattlePass] = useState(false);
  const [showAirdrop, setShowAirdrop] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(NETWORKS[0]);
  const [withdrawStep, setWithdrawStep] = useState<1 | 2 | 3>(1);
  const [showMerchModal, setShowMerchModal] = useState(false);
  const [selectedMerch, setSelectedMerch] = useState<MerchProduct | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyingNFT, setBuyingNFT] = useState<MarketplaceListing | null>(null);
  const [txFilter, setTxFilter] = useState<string>('all');



  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === 'Escape') {
        setShowKYCModal(false);
        setShowBattlePass(false);
        setShowAirdrop(false);
        setShowWithdrawModal(false);
        setShowMerchModal(false);
        setShowBuyModal(false);
      }
      if (!e.ctrlKey && !e.metaKey) return;
      const shortcuts: Record<string, typeof currentTab> = { '1': 'dashboard', '2': 'offerwall', '3': 'army', '4': 'market', '5': 'quests', '6': 'games' };
      if (shortcuts[e.key]) { e.preventDefault(); setCurrentTab(shortcuts[e.key]); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTab]);

  // Computed
  const rank = getRank(db.totalEarned);

  const formatTimeLeft = useCallback((expiresAt: Date) => {
    const diff = expiresAt.getTime() - Date.now();
    if (diff <= 0) return 'EXPIRED';
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}m ${secs}s`;
  }, []);

  const submitWithdrawal = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0 || amount > db.shitBalance || amount < selectedNetwork.minWithdraw) {
      db.triggerSuccess("Invalid withdrawal amount");
      return;
    }
    if (!isValidEthAddress(withdrawAddress)) {
      db.triggerSuccess("Invalid wallet address — must be 0x followed by 40 hex characters");
      return;
    }
    const fee = selectedNetwork.fee;
    const netAmount = amount - fee;
    db.setShitBalance(prev => prev - amount);
    setWithdrawStep(3);
    db.addTransaction({ type: 'withdrawal', amount: -amount, description: `Withdraw ${netAmount.toFixed(2)} $SHIT to ${selectedNetwork.name} (${withdrawAddress.slice(0, 8)}...)`, status: 'pending' });
    sfx.purchase();
    db.triggerSuccess(`Withdrawal initiated! ${netAmount.toFixed(2)} $SHIT → ${selectedNetwork.name}`);
  };

  const buyMerch = (product: MerchProduct) => {
    if (db.shitBalance < product.price) {
      db.triggerSuccess("Not enough $SHIT!");
      sfx.error();
      return;
    }
    db.setShitBalance(prev => prev - product.price);
    setShowMerchModal(false);
    setSelectedMerch(null);
    sfx.purchase();
    firePurchaseConfetti();
    db.triggerSuccess(`Order placed! ${product.name} via Printful 📦`);
    db.addTransaction({ type: 'merch', amount: -product.price, description: `Ordered ${product.name}`, status: 'completed' });
  };

  const claimTierReward = (tier: number) => {
    if (tier > db.currentTier || db.claimedTiers.includes(tier)) return;
    const reward = BATTLE_PASS_REWARDS.find(r => r.tier === tier);
    if (!reward) return;
    const shitReward = db.isGeneral ? reward.premium.amount : reward.free.amount;
    db.setShitBalance(prev => prev + shitReward);
    db.setClaimedTiers(prev => [...prev, tier]);
    sfx.win();
    db.triggerSuccess(`Tier ${tier} reward claimed! +${shitReward} $SHIT 🎁`);
    db.addTransaction({ type: 'quest', amount: shitReward, description: `Battle Pass Tier ${tier} reward`, status: 'completed' });
  };

  const getDayOfWeek = () => new Date().getDay();
  const dayQuests = [
    [
      { title: "Complete 2 offers", progress: 1, max: 2, reward: 300, emoji: '\u{1F3AF}' },
      { title: "Send a soldier on a raid", progress: 0, max: 1, reward: 200, emoji: '\u2694\uFE0F' },
      { title: "Stake 100 $SHIT", progress: 0, max: 1, reward: 200, emoji: '\u{1F512}' },
    ],
    [
      { title: "Win a coin flip", progress: 0, max: 1, reward: 250, emoji: '\u{1FA99}' },
      { title: "Complete 3 offers", progress: 1, max: 3, reward: 450, emoji: '\u{1F3AF}' },
      { title: "Check the Bazaar", progress: 0, max: 1, reward: 100, emoji: '\u{1F6D2}' },
    ],
    [
      { title: "Spin the wheel", progress: 0, max: 1, reward: 150, emoji: '\u{1F3B0}' },
      { title: "Level up a soldier", progress: 0, max: 1, reward: 300, emoji: '\u2B06\uFE0F' },
      { title: "Complete 2 offers", progress: 0, max: 2, reward: 300, emoji: '\u{1F3AF}' },
    ],
    [
      { title: "Play Pump or Dump", progress: 0, max: 1, reward: 200, emoji: '\u{1F4C8}' },
      { title: "Recruit a soldier", progress: 0, max: 1, reward: 250, emoji: '\u{1F4A9}' },
      { title: "Complete 3 offers", progress: 1, max: 3, reward: 450, emoji: '\u{1F3AF}' },
    ],
    [
      { title: "Roll dice 3 times", progress: 0, max: 3, reward: 350, emoji: '\u{1F3B2}' },
      { title: "Stake 500 $SHIT", progress: 0, max: 1, reward: 400, emoji: '\u{1F512}' },
      { title: "Complete 2 offers", progress: 1, max: 2, reward: 300, emoji: '\u{1F3AF}' },
    ],
    [
      { title: "Complete 5 offers", progress: 2, max: 5, reward: 750, emoji: '\u{1F3AF}' },
      { title: "Win 3 games", progress: 0, max: 3, reward: 500, emoji: '\u{1F3AE}' },
      { title: "Send 2 soldiers on raids", progress: 0, max: 2, reward: 400, emoji: '\u2694\uFE0F' },
    ],
    [
      { title: "Complete 4 offers", progress: 1, max: 4, reward: 600, emoji: '\u{1F3AF}' },
      { title: "Buy something on Bazaar", progress: 0, max: 1, reward: 200, emoji: '\u{1F6D2}' },
      { title: "Claim all mission rewards", progress: 0, max: 1, reward: 300, emoji: '\u{1F4B0}' },
    ],
  ];
  const dailyQuests = dayQuests[getDayOfWeek()];

  const nextBPReward = BATTLE_PASS_REWARDS.find(r => r.tier > db.currentTier);

  const getStreakTimeLeft = () => {
    if (!db.lastDailyClaim) return null;
    const lastClaim = new Date(db.lastDailyClaim).getTime();
    const deadline = lastClaim + 48 * 60 * 60 * 1000;
    const diff = deadline - Date.now();
    if (diff <= 0) return 'EXPIRED';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  const filteredTransactions = txFilter === 'all'
    ? db.transactions
    : db.transactions.filter(t => t.type === txFilter);

  return (
    <>
      <ToastContainer />
      {showOnboarding && onCompleteOnboarding && (
        <OnboardingModal onComplete={onCompleteOnboarding} />
      )}

    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <DashboardNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        walletAddress={walletAddress}
        isGeneral={db.isGeneral}
        kycStatus={db.kycStatus}
        setShowKYCModal={setShowKYCModal}
        onDisconnect={onDisconnect}
        notifications={db.notifications}
        onMarkNotificationRead={db.markNotificationRead}
        onClearNotifications={db.clearAllNotifications}
      />

      <div className="pt-20 pb-24 max-w-7xl mx-auto px-4 sm:px-6">
        <AnimatePresence mode="wait">

        {/* DASHBOARD */}
        {currentTab === "dashboard" && (
          <motion.div key="dashboard" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="text-amber-500 text-sm font-bold tracking-[3px] uppercase">GM DEGEN {db.isGeneral && "👑"}</div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">HQ</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-zinc-950 border border-white/10 px-6 py-3 rounded-2xl text-sm flex items-center gap-3">
                  🔥 {db.dailyStreak} day streak
                  {getStreakTimeLeft() && <span className="text-red-400 text-xs font-mono">{'\u23F1\uFE0F'} {getStreakTimeLeft()}</span>}
                </div>
                <button onClick={() => { sfx.click(); db.claimDailyBonus(); }} className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-8 py-3 rounded-2xl text-sm font-black active:scale-[0.985] shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-shadow">CLAIM DAILY BONUS</button>
              </div>
            </div>

            {db.isGeneral && (
              <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 rounded-3xl p-6 flex items-center justify-between animate-glow-pulse">
                <div>
                  <div className="font-black text-xl">👑 GENERAL PASS ACTIVE</div>
                  <div className="text-amber-100 text-sm">+25% offer rewards • {generalDaysLeft > 0 ? `${generalDaysLeft} days remaining` : 'Active'}</div>
                </div>
                <div className="text-4xl animate-subtle-float">🔥</div>
              </div>
            )}

            {db.totalEarned >= 5000 && !db.hasClaimedAirdrop && (
              <div onClick={() => setShowAirdrop(true)} className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-6 flex items-center justify-between cursor-pointer hover:brightness-110 transition-all active:scale-[0.985]">
                <div>
                  <div className="font-bold text-xl flex items-center gap-2">🪂 AIRDROP READY</div>
                  <div className="text-purple-100 text-sm">You&apos;ve earned {db.totalEarned.toLocaleString()} $SHIT • Claim your reward!</div>
                </div>
                <div className="text-4xl">🎁</div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="glass-card rounded-2xl md:rounded-3xl p-5 md:p-8 glass-card-hover transition-all">
                <div className="text-[10px] md:text-sm text-zinc-500 mb-1 tracking-wider">$SHIT BALANCE</div>
                <div className="text-2xl md:text-4xl lg:text-5xl font-black tabular-nums tracking-tighter text-amber-400">{db.shitBalance.toLocaleString()}</div>
              </div>
              <div className="glass-card rounded-2xl md:rounded-3xl p-5 md:p-8 glass-card-hover transition-all">
                <div className="text-[10px] md:text-sm text-zinc-500 mb-1 tracking-wider">POINTS</div>
                <div className="text-2xl md:text-4xl lg:text-5xl font-black tabular-nums tracking-tighter">{db.points.toLocaleString()}</div>
              </div>
              <Tooltip content={`${rank.toNext.toLocaleString()} $SHIT to ${rank.next?.name || 'MAX'}`}>
                <div className="glass-card rounded-2xl md:rounded-3xl p-5 md:p-8 glass-card-hover transition-all w-full">
                  <div className="text-[10px] md:text-sm text-zinc-500 mb-1 tracking-wider">CURRENT RANK</div>
                  <div className="text-xl md:text-3xl lg:text-4xl font-black">{rank.current.emoji} {rank.current.name}</div>
                  {rank.next && (
                    <div className="text-amber-500 text-xs md:text-sm mt-1 md:mt-2">{rank.toNext.toLocaleString()} to {rank.next.name}</div>
                  )}
                </div>
              </Tooltip>
              <div className="glass-card rounded-2xl md:rounded-3xl p-5 md:p-8 glass-card-hover transition-all">
                <div className="text-[10px] md:text-sm text-zinc-500 mb-1 tracking-wider">TOTAL EARNED</div>
                <div className="text-2xl md:text-3xl lg:text-4xl font-black tabular-nums">{db.totalEarned.toLocaleString()}</div>
                <div className="text-xs text-amber-500">$SHIT all-time {db.streakMultiplier > 0 && `(+${db.streakMultiplier}% streak)`}</div>
              </div>
            </div>

            {/* KYC Warning Banner */}
            {(() => {
              const KYC_THRESHOLD = 100;
              const shitPrice = 0.01;
              const userBalanceUSD = db.shitBalance * shitPrice;
              if (userBalanceUSD > KYC_THRESHOLD && db.kycStatus !== 'verified') {
                return (
                  <div onClick={() => setShowKYCModal(true)} className="cursor-pointer bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-center gap-4 hover:bg-red-500/20 transition-all">
                    <div className="text-3xl">⚠️</div>
                    <div className="flex-1">
                      <div className="font-bold text-red-400 mb-1">Identity Verification Required</div>
                      <div className="text-sm text-zinc-400">Your balance exceeds $100 equivalent. Complete KYC to enable withdrawals.</div>
                      <div className="mt-3 text-xs text-red-400 font-semibold">CLICK TO VERIFY →</div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div className="flex gap-4">
              <button onClick={() => setCurrentTab("fiat")} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 py-4 rounded-2xl font-black text-lg active:scale-[0.985] shadow-lg shadow-amber-500/20">BUY $SHIT</button>
              <button onClick={() => {
                const KYC_THRESHOLD = 100;
                const shitPrice = 0.01;
                const userBalanceUSD = db.shitBalance * shitPrice;
                if (userBalanceUSD > KYC_THRESHOLD && db.kycStatus !== 'verified') {
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
                  <div className="text-3xl font-bold text-amber-400">{db.currentTier}</div>
                  <div className="text-xs text-zinc-500">/ {db.MAX_TIER} Tiers</div>
                </div>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all" style={{ width: `${db.tierProgress}%` }} />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">{db.battlePassXP} XP earned</span>
                <span className="text-amber-400 font-semibold">{db.claimedTiers.length} claimed</span>
              </div>
            </div>

            {/* NEXT BP REWARD + MISSIONS WIDGET */}
            <div className="grid md:grid-cols-2 gap-4">
              {nextBPReward && (
                <div onClick={() => setShowBattlePass(true)} className="glass-card rounded-2xl p-6 cursor-pointer hover:border-amber-500/40 transition-all active:scale-[0.985] border border-amber-500/20">
                  <div className="text-xs text-zinc-500 mb-2">NEXT BATTLE PASS REWARD</div>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{nextBPReward.free.icon}</div>
                    <div>
                      <div className="font-bold text-amber-400">Tier {nextBPReward.tier}</div>
                      <div className="text-sm text-zinc-400">{db.isGeneral ? nextBPReward.premium.description : nextBPReward.free.description}</div>
                      <div className="text-xs text-amber-400 mt-1 font-bold">+{db.isGeneral ? nextBPReward.premium.amount : nextBPReward.free.amount} $SHIT</div>
                    </div>
                  </div>
                </div>
              )}
              <div onClick={() => setCurrentTab("army")} className="glass-card rounded-2xl p-6 cursor-pointer hover:border-amber-500/40 transition-all active:scale-[0.985] border border-amber-500/20">
                <div className="text-xs text-zinc-500 mb-2">{'\u2694\uFE0F'} ACTIVE MISSIONS</div>
                <div className="text-2xl font-black text-amber-400 mb-1">
                  {db.activeMissions ?? 0} raids in progress
                </div>
                <div className="text-sm text-zinc-400">
                  {(db.activeMissions ?? 0) > 0 ? 'tap to check rewards' : 'deploy your soldiers ser'}
                </div>
              </div>
            </div>

            {/* WEEKLY REWARDS CALENDAR */}
            <div className="glass-card rounded-3xl p-6">
              <div className="font-black text-lg mb-4">{'\u{1F4C5}'} WEEKLY REWARD CALENDAR</div>
              <div className="grid grid-cols-7 gap-2">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, i) => {
                  const rewards = [100, 150, 200, 250, 300, 500, 1000];
                  const today = (new Date().getDay() + 6) % 7;
                  const claimed = i < today || (i === today && db.dailyStreak > 0);
                  return (
                    <div key={day} className={`text-center p-3 rounded-xl border ${i === today ? 'border-amber-500/50 bg-amber-500/10' : claimed ? 'border-white/10 bg-white/5' : 'border-white/5'}`}>
                      <div className="text-[10px] text-zinc-500 mb-1">{day}</div>
                      <div className={`text-sm font-bold ${claimed ? 'text-amber-400' : 'text-zinc-500'}`}>{claimed ? '\u2713' : rewards[i]}</div>
                      <div className="text-[10px] text-zinc-600">{claimed ? 'claimed' : '$SHIT'}</div>
                    </div>
                  );
                })}
              </div>
              <div className="text-center mt-3 text-xs text-zinc-500">
                {'\ud83d\udd25'} 7-day streak bonus: <span className="text-amber-400 font-bold">1,000 $SHIT</span>
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
                    {db.totalEarned >= 25000 ? "LEGENDARY" : db.totalEarned >= 10000 ? "EPIC" : db.totalEarned >= 5000 ? "RARE" : "COMMON"}
                  </div>
                </div>
              </div>
              <div className="bg-black/60 rounded-2xl p-6 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <div>Progress to next tier</div>
                  <div className="font-mono text-amber-400">
                    {db.totalEarned >= 25000 ? "MAX" : db.totalEarned >= 10000 ? `${db.totalEarned}/25000` : db.totalEarned >= 5000 ? `${db.totalEarned}/10000` : `${db.totalEarned}/5000`}
                  </div>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" style={{ width: db.totalEarned >= 25000 ? '100%' : db.totalEarned >= 10000 ? `${Math.min(((db.totalEarned - 10000) / 15000) * 100, 100)}%` : db.totalEarned >= 5000 ? `${Math.min(((db.totalEarned - 5000) / 5000) * 100, 100)}%` : `${Math.min((db.totalEarned / 5000) * 100, 100)}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-zinc-500">ESTIMATED AIRDROP</div>
                  <div className="text-3xl font-black text-purple-400">
                    {db.totalEarned >= 25000 ? "1,500" : db.totalEarned >= 10000 ? "600" : db.totalEarned >= 5000 ? "250" : "???"} $SHIT
                  </div>
                </div>
                {db.totalEarned >= 5000 && !db.hasClaimedAirdrop && (
                  <button onClick={() => setShowAirdrop(true)} className="px-6 py-3 bg-purple-600 rounded-xl font-bold active:scale-[0.985]">CLAIM NOW</button>
                )}
              </div>
            </div>

            {/* DAILY QUESTS MINI */}
            <div className="glass-card rounded-3xl p-7">
              <div className="flex items-center justify-between mb-5">
                <div className="font-black text-xl">💩 TODAY&apos;S GRIND</div>
                <button onClick={() => setCurrentTab("quests")} className="text-amber-400 text-sm font-bold">VIEW ALL →</button>
              </div>
              <div className="space-y-3">
                {dailyQuests.map((q, i) => (
                  <div key={i} className="flex items-center justify-between bg-black/60 rounded-2xl px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{q.emoji}</div>
                      <div>
                        <div>{q.title}</div>
                        <div className="text-xs text-zinc-500">{q.progress}/{q.max} completed</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400 font-mono font-bold">+{q.reward} $SHIT</div>
                      <div className="w-28 h-1.5 bg-white/10 rounded-full mt-2"><div className="h-1.5 bg-gradient-to-r from-amber-500 to-orange-400 rounded-full" style={{width: `${(q.progress/q.max)*100}%`}}></div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div onClick={() => setCurrentTab("offerwall")} className="cursor-pointer glass-card glass-card-hover rounded-3xl p-8 active:scale-[0.985] transition-all group">
                <div className="text-5xl mb-6 group-hover:animate-subtle-float">{'\u26A1'}</div>
                <div className="text-2xl md:text-3xl font-black group-hover:text-amber-400 transition-colors">GRIND OFFERS</div>
                <div className="text-zinc-400 mt-2 text-sm">8 offers {'\u2022'} up to 2,100 PTS {db.streakMultiplier > 0 && `(+${db.streakMultiplier}% streak)`}</div>
              </div>
              <div onClick={() => setCurrentTab("spin")} className="cursor-pointer glass-card glass-card-hover rounded-3xl p-8 active:scale-[0.985] transition-all group">
                <div className="text-5xl mb-6 group-hover:animate-subtle-float">{'\u{1F3B0}'}</div>
                <div className="text-2xl md:text-3xl font-black group-hover:text-amber-400 transition-colors">SPIN TO WIN</div>
                <div className="text-zinc-400 mt-2 text-sm">daily spins {'\u2022'} up to 10K PTS jackpot</div>
              </div>
              <div onClick={() => setCurrentTab("games")} className="cursor-pointer glass-card glass-card-hover rounded-3xl p-8 active:scale-[0.985] transition-all group">
                <div className="text-5xl mb-6 group-hover:animate-subtle-float">{'\u{1F3B2}'}</div>
                <div className="text-2xl md:text-3xl font-black group-hover:text-amber-400 transition-colors">DEGEN GAMES</div>
                <div className="text-zinc-400 mt-2 text-sm">coin flip {'\u2022'} dice {'\u2022'} pump or dump</div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div onClick={() => setCurrentTab("army")} className="cursor-pointer glass-card glass-card-hover rounded-3xl p-8 active:scale-[0.985] transition-all group border border-amber-500/20 hover:border-amber-500/40">
                <div className="text-5xl mb-6 group-hover:animate-subtle-float">{'\u{1F4A9}'}</div>
                <div className="text-2xl md:text-3xl font-black group-hover:text-amber-400 transition-colors">SHIT ARMY</div>
                <div className="text-zinc-400 mt-2 text-sm">mint degens {'\u2022'} raid sewers {'\u2022'} stack $SHIT passively</div>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="text-amber-400 font-bold">{'\u2694\uFE0F'} Squad Power: {db.squadPower ?? 450}</span>
                  <span className="text-zinc-500">|</span>
                  <span className="text-green-400">+{Math.floor((db.squadPower ?? 450) / 100)}% offerwall bonus</span>
                </div>
              </div>
              <div onClick={() => setCurrentTab("market")} className="cursor-pointer glass-card glass-card-hover rounded-3xl p-8 active:scale-[0.985] transition-all group border border-amber-500/20 hover:border-amber-500/40">
                <div className="text-5xl mb-6 group-hover:animate-subtle-float">{'\u{1F3EA}'}</div>
                <div className="text-2xl md:text-3xl font-black group-hover:text-amber-400 transition-colors">SHIT BAZAAR</div>
                <div className="text-zinc-400 mt-2 text-sm">buy juice {'\u2022'} trade degens {'\u2022'} flex drip</div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div onClick={() => setCurrentTab("stake")} className="cursor-pointer glass-card glass-card-hover rounded-3xl p-8 active:scale-[0.985] transition-all group">
                <div className="text-5xl mb-6 group-hover:animate-subtle-float">{'\u{1F3C6}'}</div>
                <div className="text-2xl md:text-3xl font-black group-hover:text-amber-400 transition-colors">LOCK YOUR BAGS</div>
                <div className="text-zinc-400 mt-2 text-sm">32-67% APY {'\u2022'} diamond hands only</div>
              </div>
              <div onClick={() => setCurrentTab("vip")} className="cursor-pointer glass-card glass-card-hover rounded-3xl p-8 active:scale-[0.985] transition-all group">
                <div className="text-5xl mb-6 group-hover:animate-subtle-float">{'\u{1F48E}'}</div>
                <div className="text-2xl md:text-3xl font-black group-hover:text-amber-400 transition-colors">VIP PASS</div>
                <div className="text-zinc-400 mt-2 text-sm">up to +50% bonus {'\u2022'} 0% fees {'\u2022'} whale perks</div>
              </div>
              <div onClick={() => setCurrentTab("quests")} className="cursor-pointer glass-card glass-card-hover rounded-3xl p-8 active:scale-[0.985] transition-all group">
                <div className="text-5xl mb-6 group-hover:animate-subtle-float">{'\u{1F4DC}'}</div>
                <div className="text-2xl md:text-3xl font-black group-hover:text-amber-400 transition-colors">MISSIONS</div>
                <div className="text-zinc-400 mt-2 text-sm">daily & weekly grinds {'\u2022'} stack rewards</div>
              </div>
            </div>
            <div className="grid md:grid-cols-4 gap-4 mt-4">
              <div onClick={() => setCurrentTab("memes")} className="cursor-pointer glass-card glass-card-hover rounded-2xl p-6 active:scale-[0.985] transition-all group">
                <div className="text-3xl mb-3">{'\u{1F92A}'}</div>
                <div className="text-lg font-black group-hover:text-amber-400 transition-colors">MEME FEED</div>
                <div className="text-zinc-500 mt-1 text-xs">post {'\u2022'} vote {'\u2022'} earn</div>
              </div>
              <div onClick={() => setCurrentTab("guilds")} className="cursor-pointer glass-card glass-card-hover rounded-2xl p-6 active:scale-[0.985] transition-all group">
                <div className="text-3xl mb-3">{'\u{1F3F0}'}</div>
                <div className="text-lg font-black group-hover:text-amber-400 transition-colors">GUILDS</div>
                <div className="text-zinc-500 mt-1 text-xs">clans {'\u2022'} raids {'\u2022'} chat</div>
              </div>
              <div onClick={() => setCurrentTab("ambassador")} className="cursor-pointer glass-card glass-card-hover rounded-2xl p-6 active:scale-[0.985] transition-all group">
                <div className="text-3xl mb-3">{'\u{1F4E3}'}</div>
                <div className="text-lg font-black group-hover:text-amber-400 transition-colors">AMBASSADOR</div>
                <div className="text-zinc-500 mt-1 text-xs">share {'\u2022'} grow {'\u2022'} earn</div>
              </div>
              <div onClick={() => setCurrentTab("events")} className="cursor-pointer glass-card glass-card-hover rounded-2xl p-6 active:scale-[0.985] transition-all group border border-amber-500/20">
                <div className="text-3xl mb-3">{'\u{1F3D6}\uFE0F'}</div>
                <div className="text-lg font-black group-hover:text-amber-400 transition-colors">EVENTS</div>
                <div className="text-zinc-500 mt-1 text-xs">seasonal {'\u2022'} limited {'\u2022'} exclusive</div>
                <div className="text-xs text-green-400 mt-1 font-semibold">LIVE NOW</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* OFFERWALL */}
        {currentTab === "offerwall" && (
          <motion.div key="offerwall" variants={tabVariants} initial="initial" animate="animate" exit="exit">
            <div className="mb-10">
              <div className="text-amber-500 text-sm font-bold tracking-[3px]">
                EARN REAL $SHIT {db.streakMultiplier > 0 && `(+${db.streakMultiplier}% STREAK)`}
                {(db.squadPower ?? 0) > 0 && ` (+${Math.floor((db.squadPower ?? 0) / 100)}% ARMY)`}
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">Offerwall</h2>
            </div>

            {/* ACTIVE OFFERS */}
            {db.activeOffers.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-bold tracking-tight">🔥 Active Offers</div>
                  <div className="text-xs text-zinc-500">{db.activeOffers.length} in progress</div>
                </div>
                <div className="space-y-3">
                  {db.activeOffers.map(ao => {
                    const offer = OFFERS.find(o => o.id === ao.offerId);
                    if (!offer) return null;
                    return (
                      <div key={ao.id} className="glass-card border-amber-500/30 rounded-2xl p-5 flex items-center gap-4">
                        <div className="text-3xl">{offer.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold">{offer.title}</div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${ao.progress}%` }} />
                          </div>
                        </div>
                        <div className="text-amber-400 font-bold">{ao.progress}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="glass-card border-amber-500/20 rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
              <div>
                <div className="text-sm text-zinc-400">YOUR POINTS</div>
                <div className="text-5xl md:text-6xl lg:text-7xl font-black tabular-nums tracking-tighter text-amber-400">{db.points}</div>
              </div>
              <Tooltip content={`${CONFIG.BUSINESS.OFFERWALL.EXCHANGE_RATE} PTS = 1 $SHIT • Min ${CONFIG.BUSINESS.OFFERWALL.MIN_CONVERT} PTS`}>
                <div className="flex-1 text-center md:text-left">
                  <div className="text-xs text-zinc-500">EXCHANGE RATE</div>
                  <div className="font-mono text-3xl">1 $SHIT = {CONFIG.BUSINESS.OFFERWALL.EXCHANGE_RATE} PTS</div>
                </div>
              </Tooltip>
              <button onClick={() => { sfx.click(); db.convertPoints(); }} disabled={db.points < CONFIG.BUSINESS.OFFERWALL.MIN_CONVERT} className="bg-gradient-to-r from-amber-500 to-orange-500 disabled:bg-zinc-800 disabled:from-zinc-800 disabled:to-zinc-800 px-12 py-4 rounded-2xl font-black text-lg active:scale-[0.985] shadow-lg shadow-amber-500/20">CONVERT TO $SHIT</button>
            </div>

            {/* BOOST BANNER */}
            {db.offerBoosts.filter(b => b.expiresAt > new Date()).length > 0 && (
              <div className="mb-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/40 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">⚡</span>
                  <div className="font-bold text-lg">Active Boosts</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {db.offerBoosts.filter(b => b.expiresAt > new Date()).map(boost => {
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
                const active = db.activeOffers.find(a => a.offerId === offer.id);
                const boost = db.offerBoosts.find(b => b.offerId === offer.id && b.expiresAt > new Date());
                const boostedReward = boost ? offer.reward * boost.multiplier : offer.reward;
                return (
                  <div key={idx} onClick={() => { sfx.click(); if (!active) setSelectedOffer(offer); }} className={`glass-card ${offer.exclusive && db.isGeneral ? 'border-amber-500/50' : active ? 'border-amber-500/60' : ''} hover:border-amber-500/40 rounded-3xl p-8 cursor-pointer active:scale-[0.985] transition-all group relative overflow-hidden`}>
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
          </motion.div>
        )}

        {/* STAKING */}
        {currentTab === "stake" && (
          <motion.div key="stake" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="text-6xl md:text-8xl mb-6">🏆</div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">Staking</h2>
              <p className="text-lg md:text-2xl text-zinc-400 mt-3">Earn passive income while you sleep</p>
            </div>
            <div className="bg-zinc-950 border border-white/10 rounded-3xl p-10 mb-8">
              <div className="flex justify-between mb-10">
                <div>
                  <div className="text-sm text-zinc-500">CURRENT APY</div>
                  <Tooltip content="Annual Percentage Yield — your estimated yearly return on staked tokens">
                    <div className="text-5xl md:text-7xl lg:text-[92px] font-black text-amber-400 tabular-nums leading-none">{db.stakeLock === 7 ? 32 : db.stakeLock === 30 ? 48 : 67}<span className="text-3xl md:text-5xl align-super">%</span></div>
                  </Tooltip>
                </div>
                <Tooltip content="Total Value Locked — all $SHIT currently staked by all users">
                  <div className="text-right text-sm text-zinc-400">TVL: $1.24M<br />Stakers: 8,472</div>
                </Tooltip>
              </div>
              <div className="bg-black/60 rounded-2xl p-8">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-zinc-400">AMOUNT TO STAKE</span>
                  <span className="text-zinc-500">Balance: {db.shitBalance.toLocaleString()} $SHIT</span>
                </div>
                <div className="flex items-center gap-4 mb-8">
                  <input type="number" value={db.stakeAmount} onChange={(e) => db.setStakeAmount(e.target.value)} placeholder="0" min="1" max={db.shitBalance} className="bg-transparent text-5xl md:text-6xl lg:text-7xl font-semibold w-full outline-none placeholder:text-zinc-700" />
                  <div className="text-4xl text-amber-500">$SHIT</div>
                </div>
                <div className="flex gap-3 mb-8">
                  {[7,30,90].map(days => (
                    <button key={days} onClick={() => db.setStakeLock(days)} className={`flex-1 py-4 rounded-2xl text-sm font-bold transition ${db.stakeLock === days ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black" : "bg-white/5 hover:bg-white/10"}`}>
                      {days} DAYS<br /><span className="text-xs opacity-60">{days === 7 ? "32%" : days === 30 ? "48%" : "67%"} APY</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => { sfx.click(); db.stakeTokens(); }} disabled={!db.stakeAmount || parseInt(db.stakeAmount) <= 0 || parseInt(db.stakeAmount) > db.shitBalance} className="w-full py-5 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-black text-lg active:scale-[0.985] disabled:bg-zinc-800 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 shadow-lg shadow-amber-500/20">STAKE NOW</button>
              </div>
            </div>

            {/* Staked Positions */}
            {db.stakedPositions.length > 0 && (
              <div className="space-y-3">
                <div className="text-lg font-bold mb-3">Your Staked Positions</div>
                {db.stakedPositions.map(pos => (
                  <div key={pos.id} className="glass-card rounded-2xl p-5 flex items-center justify-between">
                    <div>
                      <div className="font-bold">{pos.amount.toLocaleString()} $SHIT</div>
                      <div className="text-xs text-zinc-500">{pos.lockDays} days • {pos.apy}% APY</div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400 font-bold">+{pos.rewards} $SHIT</div>
                      <div className="text-xs text-zinc-500">Unlocks {pos.unlockDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {db.stakedPositions.length === 0 && (
              <EmptyState icon="🔒" title="No staked positions" description="Stake your $SHIT to earn passive income with up to 67% APY." />
            )}
          </motion.div>
        )}

        {/* MARKETPLACE */}
        {currentTab === "market" && (
          <motion.div key="market" variants={tabVariants} initial="initial" animate="animate" exit="exit">
            <div className="text-center mb-12">
              <div className="text-6xl md:text-8xl mb-6">🛒</div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">NFT Marketplace</h2>
              <p className="text-lg md:text-xl text-zinc-400 mt-3">Buy & sell Poop Army Soldiers • 7.5% platform fee</p>
            </div>
            {db.marketListings.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {db.marketListings.map((listing) => (
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
            ) : (
              <EmptyState icon="🛒" title="Marketplace is empty" description="All NFTs have been sold! Check back later for new listings." action={{ label: "Browse Army", onClick: () => setCurrentTab("army") }} />
            )}
            <div className="text-center text-xs text-zinc-500 mt-8">List your own NFTs soon • 7.5% fee on sales</div>
          </motion.div>
        )}

        {/* QUESTS */}
        {currentTab === "quests" && (
          <motion.div key="quests" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="text-6xl md:text-8xl mb-6">📜</div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">Missions</h2>
              <p className="text-lg md:text-xl text-zinc-400 mt-3">Complete quests. Earn $SHIT. Climb the ranks.</p>
            </div>

            {['daily', 'weekly', 'milestone'].map(category => {
              const filtered = db.quests.filter(q => q.category === category);
              if (filtered.length === 0) return null;
              const labels: Record<string, { title: string; subtitle: string; color: string; gradientFrom: string; gradientTo: string }> = {
                daily: { title: 'Daily Quests', subtitle: 'RESET IN 6H 42M', color: 'text-amber-500', gradientFrom: 'from-amber-500', gradientTo: 'to-orange-400' },
                weekly: { title: 'Weekly Quests', subtitle: 'RESET EVERY MONDAY', color: 'text-purple-400', gradientFrom: 'from-purple-500', gradientTo: 'to-pink-500' },
                milestone: { title: 'Milestones', subtitle: 'PERMANENT PROGRESS', color: 'text-amber-400', gradientFrom: 'from-amber-500', gradientTo: 'to-orange-500' },
              };
              const l = labels[category];
              return (
                <div key={category} className="mb-10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className={`${l.color} text-sm font-bold tracking-[3px]`}>{l.subtitle}</div>
                      <div className="text-3xl font-black tracking-tight">{l.title}</div>
                    </div>
                    <div className="text-sm text-zinc-500">{filtered.filter(q => q.claimed).length}/{filtered.length} completed</div>
                  </div>
                  <div className="space-y-4">
                    {filtered.map(q => (
                      <div key={q.id} className={`glass-card ${q.claimed ? 'border-amber-500/30' : ''} rounded-3xl p-6 flex items-center gap-5`}>
                        <div className="text-4xl">{q.icon}</div>
                        <div className="flex-1">
                          <div className="font-bold text-lg">{q.title}</div>
                          <div className="text-sm text-zinc-400">{q.description}</div>
                          <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${l.gradientFrom} ${l.gradientTo} rounded-full transition-all`} style={{width: `${(q.progress / q.max) * 100}%`}} />
                          </div>
                          <div className="text-xs text-zinc-500 mt-1">{q.progress} / {q.max}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className={`${l.color} font-mono font-bold text-xl`}>+{q.reward}</div>
                          <div className="text-xs text-zinc-500">$SHIT</div>
                          {q.progress >= q.max && !q.claimed && (
                            <button onClick={() => db.claimQuest(q.id)} className={`mt-2 px-5 py-2 bg-gradient-to-r ${l.gradientFrom} ${l.gradientTo} text-black rounded-xl text-xs font-black active:scale-[0.985]`}>CLAIM</button>
                          )}
                          {q.claimed && <div className={`mt-2 ${l.color} text-xs font-bold`}>✓ CLAIMED</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* BATTLE PASS */}
        {currentTab === "battlepass" && (
          <motion.div key="battlepass" variants={tabVariants} initial="initial" animate="animate" exit="exit">
            <BattlePass userId={db.userId || 'mock-user'} />
          </motion.div>
        )}

        {/* ACHIEVEMENTS */}
        {currentTab === "achievements" && (
          <motion.div key="achievements" variants={tabVariants} initial="initial" animate="animate" exit="exit">
            <Achievements userId={db.userId || 'mock-user'} />
          </motion.div>
        )}

        {/* ARMY (NFT) */}
        {currentTab === "army" && (
          <motion.div key="army" variants={tabVariants} initial="initial" animate="animate" exit="exit">
            <Army userId={db.userId || 'mock-user'} />
          </motion.div>
        )}

        {/* MARKET */}
        {currentTab === "market" && (
          <motion.div key="market2" variants={tabVariants} initial="initial" animate="animate" exit="exit">
            <Market userId={db.userId || 'mock-user'} />
          </motion.div>
        )}

        {/* MERCH */}
        {currentTab === "merch" && (
          <motion.div key="merch" variants={tabVariants} initial="initial" animate="animate" exit="exit">
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
          </motion.div>
        )}

        {/* REFERRALS */}
        {currentTab === "referral" && (
          <motion.div key="referral" variants={tabVariants} initial="initial" animate="animate" exit="exit">
            <ReferralPage userId={db.userId || 'mock-user'} />
          </motion.div>
        )}

        {/* SETTINGS */}
        {currentTab === "settings" && (
          <motion.div key="settings" variants={tabVariants} initial="initial" animate="animate" exit="exit">
            <SettingsPage userId={db.userId || 'mock-user'} onKycClick={() => setShowKYCModal(true)} />
          </motion.div>
        )}

        {/* ADMIN PANEL */}
        {currentTab === "admin" && db.isGeneral && (
          <motion.div key="admin" variants={tabVariants} initial="initial" animate="animate" exit="exit">
            <AdminPanel adminUserId={db.userId || 'mock-user'} />
          </motion.div>
        )}

        {/* ANTI-FRAUD */}
        {currentTab === "antifraud" && db.isGeneral && (
          <motion.div key="antifraud" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="max-w-7xl mx-auto p-4 sm:p-6">
            <div className="mb-8">
              <div className="text-amber-500 text-sm font-bold tracking-[3px]">SECURITY</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">Anti-Fraud</h2>
            </div>
            <AntiFraud />
          </motion.div>
        )}

        {/* SPIN WHEEL */}
        {currentTab === "spin" && (
          <motion.div key="spin" variants={tabVariants} initial="initial" animate="animate" exit="exit">
            <SpinWheel
              isVip={db.vipTier >= 2}
              onReward={(amount, label) => {
                if (amount > 0) {
                  db.setPoints(prev => prev + amount);
                  sfx.win();
                  fireWinConfetti();
                  db.triggerSuccess(`${label} — +${amount} PTS!`);
                  db.addTransaction({ type: 'daily', amount, description: `Daily reward: ${label}`, status: 'completed' });
                } else {
                  db.triggerSuccess(`${label} activated!`);
                }
              }}
            />
          </motion.div>
        )}

        {/* MINI GAMES */}
        {currentTab === "games" && (
          <motion.div key="games" variants={tabVariants} initial="initial" animate="animate" exit="exit">
            <MiniGames
              balance={db.shitBalance}
              onWin={(amount, game) => {
                db.setShitBalance(prev => prev + amount);
                db.setTotalEarned(prev => prev + amount);
                sfx.win();
                fireWinConfetti();
                db.triggerSuccess(`${game}: +${amount} $SHIT!`);
                db.addTransaction({ type: 'offer', amount, description: `${game} win`, status: 'completed' });
              }}
              onLose={(amount, game) => {
                db.setShitBalance(prev => Math.max(0, prev - amount));
                sfx.lose();
                db.triggerSuccess(`${game}: -${amount} $SHIT`);
                db.addTransaction({ type: 'withdrawal', amount: -amount, description: `${game} loss`, status: 'completed' });
              }}
            />
          </motion.div>
        )}

        {/* VIP TIERS */}
        {currentTab === "vip" && (
          <motion.div key="vip" variants={tabVariants} initial="initial" animate="animate" exit="exit">
            <VIPTiers
              currentTier={db.vipTier}
              balance={db.shitBalance}
              onPurchase={(tier, cost) => {
                if (cost > 0) db.setShitBalance(prev => prev - cost);
                db.setVipTier(tier);
                sfx.levelUp();
                fireWinConfetti();
                db.triggerSuccess(`Upgraded to VIP Tier ${tier}!`);
                db.addTransaction({ type: 'withdrawal', amount: -cost, description: `VIP Tier ${tier} upgrade`, status: 'completed' });
              }}
            />
          </motion.div>
        )}

        {/* FIAT RAMP */}
        {currentTab === "fiat" && (
          <motion.div key="fiat" variants={tabVariants} initial="initial" animate="animate" exit="exit">
            <FiatRamp
              balance={db.shitBalance}
              walletAddress={walletAddress}
              onBuy={(amount, method) => {
                db.setShitBalance(prev => prev + amount);
                sfx.purchase();
                firePurchaseConfetti();
                db.triggerSuccess(`Purchased ${amount.toLocaleString()} $SHIT via ${method}!`);
                db.addTransaction({ type: 'offer', amount, description: `Purchased via ${method}`, status: 'completed' });
              }}
              onSell={(amount, method) => {
                db.setShitBalance(prev => Math.max(0, prev - amount));
                sfx.purchase();
                db.triggerSuccess(`Sold ${amount.toLocaleString()} $SHIT via ${method}!`);
                db.addTransaction({ type: 'withdrawal', amount: -amount, description: `Sold via ${method}`, status: 'completed' });
              }}
            />
          </motion.div>
        )}

        {/* MEME FEED */}
        {currentTab === "memes" && (
          <motion.div key="memes" variants={tabVariants} initial="initial" animate="animate" exit="exit">
            <MemeFeed
              balance={db.shitBalance}
              onSpend={(amount, reason) => {
                db.setShitBalance(prev => Math.max(0, prev - amount));
                db.addTransaction({ type: 'withdrawal', amount: -amount, description: reason, status: 'completed' });
              }}
            />
          </motion.div>
        )}

        {/* GUILDS */}
        {currentTab === "guilds" && (
          <motion.div key="guilds" variants={tabVariants} initial="initial" animate="animate" exit="exit">
            <Guilds
              balance={db.shitBalance}
              onSpend={(amount, reason) => {
                db.setShitBalance(prev => Math.max(0, prev - amount));
                db.addTransaction({ type: 'withdrawal', amount: -amount, description: reason, status: 'completed' });
              }}
            />
          </motion.div>
        )}

        {/* AMBASSADOR */}
        {currentTab === "ambassador" && (
          <motion.div key="ambassador" variants={tabVariants} initial="initial" animate="animate" exit="exit">
            <AmbassadorPanel />
          </motion.div>
        )}

        {/* SEASONAL EVENTS */}
        {currentTab === "events" && (
          <motion.div key="events" variants={tabVariants} initial="initial" animate="animate" exit="exit">
            <SeasonalEvents
              balance={db.shitBalance}
              onEarn={(amount, reason) => {
                db.setShitBalance(prev => prev + amount);
                sfx.win();
                fireWinConfetti();
                db.triggerSuccess(`+${amount} $SHIT from ${reason}!`);
                db.addTransaction({ type: 'offer', amount, description: reason, status: 'completed' });
              }}
            />
          </motion.div>
        )}

        {/* LEADERBOARD */}
        {currentTab === "leaderboard" && (
          <motion.div key="leaderboard" variants={tabVariants} initial="initial" animate="animate" exit="exit">
            <Leaderboard userId={db.userId || 'mock-user'} />
          </motion.div>
        )}

        {/* HISTORY */}
        {currentTab === "history" && (
          <motion.div key="history" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="text-6xl md:text-8xl mb-6">📜</div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">Transaction History</h2>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {(['all', 'offer', 'withdrawal', 'stake', 'quest', 'daily'] as const).map(filter => (
                <button key={filter} onClick={() => setTxFilter(filter)} className={`px-5 py-2 rounded-full text-sm whitespace-nowrap transition-all ${txFilter === filter ? 'bg-amber-500 text-black font-bold' : 'bg-zinc-950 border border-white/10 hover:bg-white/5'}`}>
                  {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            <div className="bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden">
              {filteredTransactions.length === 0 ? (
                <EmptyState icon="📜" title="No transactions yet" description={txFilter === 'all' ? "Complete offers, stake tokens, or play games to see your history here." : `No ${txFilter} transactions found.`} action={txFilter !== 'all' ? { label: "Show All", onClick: () => setTxFilter('all') } : undefined} />
              ) : (
                filteredTransactions.map((tx) => (
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
          </motion.div>
        )}

        </AnimatePresence>
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

            {(() => {
              const boost = db.offerBoosts.find(b => b.offerId === selectedOffer.id && b.expiresAt > new Date());
              const boostedReward = boost ? selectedOffer.reward * boost.multiplier : selectedOffer.reward;
              return (
                <>
                  <div className="flex justify-between text-sm mb-6 px-4">
                    <div>
                      <div className="text-zinc-500">REWARD</div>
                      <div className={`text-4xl font-black ${boost ? 'text-purple-400' : 'text-amber-400'}`}>+{boostedReward}</div>
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

                  {(() => {
                    const active = db.activeOffers.find(a => a.offerId === selectedOffer.id);
                    if (active) return (
                      <div className="bg-amber-600/20 border border-amber-500/40 rounded-xl p-4 mb-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-amber-400 font-semibold">⏱️ IN PROGRESS</span>
                          <span className="text-amber-400">{active.progress}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${active.progress}%` }} />
                        </div>
                      </div>
                    );
                    return null;
                  })()}

                  <button
                    onClick={() => {
                      const alreadyActive = db.userOffers.find((a: Record<string, unknown>) => a.offer_id === selectedOffer.id || (a.offers as Record<string, unknown>)?.id === selectedOffer.id);
                      if (alreadyActive) {
                        if (alreadyActive.status === 'completed') {
                          db.completeOffer(selectedOffer, alreadyActive.id as string);
                        } else {
                          setSelectedOffer(null);
                          db.triggerSuccess("Offer already in progress!");
                        }
                      } else {
                        db.startOffer(selectedOffer);
                        setSelectedOffer(null);
                      }
                    }}
                    disabled={isCompleting}
                    className="w-full py-5 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-black text-lg active:scale-[0.985] disabled:bg-zinc-800 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 shadow-lg shadow-amber-500/20"
                  >
                    {(() => {
                      const active = db.activeOffers.find(a => a.offerId === selectedOffer.id);
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
            <div className="text-xl text-purple-400 mb-8">You&apos;ve earned {db.totalEarned.toLocaleString()} $SHIT</div>
            <div className="bg-black/60 rounded-2xl p-6 mb-8">
              <div className="text-sm text-zinc-400 mb-1">YOUR AIRDROP REWARD</div>
              <div className="text-5xl font-bold text-purple-400">
                {db.totalEarned >= 25000 ? "1,500" : db.totalEarned >= 10000 ? "600" : "250"} $SHIT
              </div>
            </div>
            <button onClick={() => { db.claimAirdrop(); setShowAirdrop(false); }} disabled={db.hasClaimedAirdrop} className="w-full py-5 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 rounded-2xl font-bold text-lg active:scale-[0.985]">
              CLAIM AIRDROP
            </button>
          </div>
        </div>
      )}

      {showWithdrawModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6" onClick={() => setShowWithdrawModal(false)}>
          <div className="bg-zinc-950 border border-white/20 rounded-3xl max-w-md w-full p-9" onClick={e => e.stopPropagation()}>
            {withdrawStep === 1 && (
              <>
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">🏦</div>
                  <div className="text-3xl font-bold tracking-tight">Withdraw $SHIT</div>
                  <div className="text-zinc-400 mt-2">Available: {db.shitBalance.toLocaleString()} $SHIT</div>
                </div>

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

                <div className="mb-6">
                  <div className="flex justify-between text-xs text-zinc-500 mb-2">
                    <span>AMOUNT</span>
                    <span>Min: {selectedNetwork.minWithdraw} $SHIT</span>
                  </div>
                  <div className="flex items-center gap-3 bg-black/60 border border-white/10 rounded-2xl px-5 py-4">
                    <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="0.00" min={selectedNetwork.minWithdraw} max={db.shitBalance} className="bg-transparent text-3xl font-semibold w-full outline-none placeholder:text-zinc-700" />
                    <span className="text-amber-500 font-bold text-sm">$SHIT</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[25, 50, 100].map(pct => (
                      <button key={pct} onClick={() => setWithdrawAmount(Math.floor(db.shitBalance * pct / 100).toString())} className="flex-1 py-1.5 rounded-lg bg-white/5 text-xs hover:bg-white/10 transition-all">{pct}%</button>
                    ))}
                    <button onClick={() => setWithdrawAmount(db.shitBalance.toString())} className="flex-1 py-1.5 rounded-lg bg-white/5 text-xs hover:bg-white/10 transition-all">MAX</button>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="text-xs text-zinc-500 mb-2">RECEIVING ADDRESS</div>
                  <input type="text" value={withdrawAddress} onChange={(e) => setWithdrawAddress(e.target.value)} placeholder="0x..." className={`w-full bg-black/60 border rounded-2xl px-5 py-4 text-sm outline-none placeholder:text-zinc-700 transition-colors ${withdrawAddress && !isValidEthAddress(withdrawAddress) ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-amber-500'}`} />
                  {withdrawAddress && !isValidEthAddress(withdrawAddress) && (
                    <div className="text-xs text-red-400 mt-1">Invalid address — must be 0x followed by 40 hex characters</div>
                  )}
                </div>

                <button
                  onClick={() => {
                    const amt = parseFloat(withdrawAmount);
                    if (!amt || amt <= 0 || amt > db.shitBalance || amt < selectedNetwork.minWithdraw) {
                      db.triggerSuccess("Invalid amount");
                      return;
                    }
                    if (!isValidEthAddress(withdrawAddress)) {
                      db.triggerSuccess("Invalid wallet address");
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
            <button onClick={() => { db.buyNFT(buyingNFT); setShowBuyModal(false); setBuyingNFT(null); }} className="w-full py-5 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-black text-lg active:scale-[0.985] shadow-lg shadow-amber-500/20">
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
              <p className="text-zinc-400">Earn XP by completing offers, quests & staking. {db.isGeneral ? 'Premium rewards active!' : 'General Pass unlocks 3x rewards.'}</p>
            </div>
            <div className="bg-zinc-950 border border-white/10 rounded-3xl p-8 mb-8">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <div className="text-5xl font-black text-amber-400">Tier {db.currentTier}</div>
                  <div className="text-sm text-zinc-500 mt-1">{db.battlePassXP} / {db.currentTier * db.XP_PER_TIER} XP to next tier</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-500">MAX TIER</div>
                  <div className="text-2xl font-bold">{db.MAX_TIER}</div>
                </div>
              </div>
              <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all" style={{ width: `${db.tierProgress}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 text-center text-sm">
              <div className="glass-card rounded-2xl p-4"><div className="text-amber-400 font-bold">+50 XP</div><div className="text-zinc-500 text-xs">Per Offer</div></div>
              <div className="glass-card rounded-2xl p-4"><div className="text-amber-400 font-bold">+100 XP</div><div className="text-zinc-500 text-xs">Per Quest</div></div>
              <div className="glass-card rounded-2xl p-4"><div className="text-amber-400 font-bold">+30 XP</div><div className="text-zinc-500 text-xs">Per Stake</div></div>
              <div className="glass-card rounded-2xl p-4"><div className="text-amber-400 font-bold">+25 XP</div><div className="text-zinc-500 text-xs">Daily Login</div></div>
            </div>
            <div className="space-y-3">
              {BATTLE_PASS_REWARDS.map((tier) => {
                const unlocked = tier.tier <= db.currentTier;
                const claimed = db.claimedTiers.includes(tier.tier);
                return (
                  <div key={tier.tier} className={`glass-card ${claimed ? 'border-amber-500/30' : unlocked ? 'border-amber-500/20' : ''} rounded-2xl p-5 flex items-center gap-5`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${claimed ? 'bg-amber-500 text-black' : unlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-zinc-600'}`}>
                      {claimed ? '✓' : tier.tier}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-zinc-500 mb-1">{db.isGeneral ? 'PREMIUM REWARD' : 'FREE REWARD'}</div>
                      <div className="font-semibold">
                        {db.isGeneral ? `+${tier.premium.amount} $SHIT` : `+${tier.free.amount} $SHIT`}
                        {db.isGeneral && tier.premium.extra && ` • ${tier.premium.extra}`}
                        {!db.isGeneral && tier.free.extra && ` • ${tier.free.extra}`}
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

      {db.showSuccess && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[300] bg-gradient-to-r from-amber-500 to-orange-500 text-black px-9 py-4 rounded-2xl flex items-center gap-3 font-black shadow-2xl shadow-amber-500/30 animate-in slide-in-from-bottom duration-300">
          💩 {db.successMessage}
        </div>
      )}

      {showKYCModal && (
        <KYCModal
          isOpen={showKYCModal}
          onClose={() => setShowKYCModal(false)}
          onSubmit={(data) => {
            console.log('KYC submitted:', data);
            db.setKycStatus('pending');
            db.triggerSuccess('KYC submitted! Under review...');
          }}
          status={db.kycStatus}
        />
      )}
    </div>
    </>
  );
}
