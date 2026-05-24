'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ReferralStats {
  total_referrals: number;
  active_referrals: number;
  total_earnings: number;
  offer_earnings: number;
  merch_earnings: number;
  nft_earnings: number;
  staking_earnings: number;
  general_bonuses: number;
  current_tier: string;
}

interface Referral {
  id: string;
  referred_wallet: string;
  joined_at: string;
  total_earned_by_referred: number;
  commission_earned: number;
  is_active: boolean;
}

interface Tier {
  name: string;
  min_referrals: number;
  min_earnings: number;
  offer_commission: number;
  merch_commission: number;
  nft_commission: number;
  staking_commission: number;
  general_bonus: number;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  tier: string;
  total_referrals: number;
  total_earnings: number;
}

const SHIT_TIERS = [
  { name: 'Recruit', emoji: '🪖', color: 'from-zinc-600 to-zinc-500' },
  { name: 'Sergeant', emoji: '⭐', color: 'from-blue-600 to-blue-500' },
  { name: 'Lieutenant', emoji: '🎖️', color: 'from-amber-600 to-amber-500' },
  { name: 'Commander', emoji: '👑', color: 'from-purple-600 to-purple-500' },
  { name: 'General', emoji: '⭐', color: 'from-amber-500 to-orange-500' },
];

const FUNNY_REFERRAL_MESSAGES = [
  "Your army grows stronger! 💪",
  "More shit soldiers recruited! 🪖",
  "The poop platoon expands! 💩",
  "Reinforcements have arrived! 🚁",
];

export default function ReferralPage({ userId }: { userId: string }) {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [referralCode, setReferralCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'leaderboard'>('overview');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [funnyMessage, setFunnyMessage] = useState(FUNNY_REFERRAL_MESSAGES[0]);

  useEffect(() => {
    fetchReferralData();
  }, [userId]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);

      // Parallel data fetching
      const [statsRes, referralsRes, tiersRes, leaderboardRes, codeRes] = await Promise.all([
        supabase.from('referral_stats').select('*').eq('user_id', userId).single(),
        supabase.from('referrals').select('*, profiles!referred_id(wallet_address, total_earned)').eq('referrer_id', userId).eq('is_active', true),
        supabase.from('referral_tiers').select('*').eq('is_active', true).order('min_referrals'),
        supabase.rpc('get_referral_leaderboard', { p_limit: 10 }),
        supabase.from('referrals').select('code').eq('referrer_id', userId).limit(1),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      
      if (referralsRes.data) {
        setReferrals(referralsRes.data.map((r: any) => ({
          id: r.id,
          referred_wallet: r.profiles?.wallet_address || 'Anonymous',
          joined_at: r.created_at,
          total_earned_by_referred: Number(r.profiles?.total_earned) || 0,
          commission_earned: Number(r.commission) || 0,
          is_active: r.is_active,
        })));
      }

      if (tiersRes.data) setTiers(tiersRes.data);
      if (leaderboardRes.data) setLeaderboard(leaderboardRes.data);
      
      // Generate referral code if doesn't exist
      if (!codeRes.data?.[0]?.code) {
        const newCode = generateReferralCode();
        setReferralCode(newCode);
        // In production, save this code to database
      } else {
        setReferralCode(codeRes.data[0].code);
      }
    } catch (error) {
      console.error('Fetch referral data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = () => {
    return 'SHIT' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const copyReferralLink = () => {
    const link = `https://shit.army/r/${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    const text = `Join the Shit Army and earn $SHIT tokens! Use my referral code: ${referralCode}\n\nhttps://shit.army/r/${referralCode}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnTelegram = () => {
    const text = `Join the Shit Army and earn $SHIT tokens! Use my referral code: ${referralCode}`;
    window.open(`https://t.me/share/url?url=https://shit.army/r/${referralCode}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const currentTier = tiers.find(t => t.name === stats?.current_tier) || tiers[0];
  const nextTier = tiers.find(t => t.min_referrals > (stats?.total_referrals || 0));

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Animated Header */}
      <div className="text-center mb-8 relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 blur-2xl rounded-full"></div>
        <div className="relative">
          <div className="text-6xl mb-2 animate-bounce">💩🚽🧻</div>
          <h1 className="text-4xl sm:text-5xl font-black mb-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            SHIT ARMY
          </h1>
          <p className="text-zinc-400 text-lg">Build your poop platoon. Earn while they shit. 🎯</p>
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-sm text-amber-400">
            <span className="animate-pulse">🔥</span>
            <span>{funnyMessage}</span>
          </div>
        </div>
      </div>

      {/* Referral Code Card */}
      <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-3xl p-6 mb-6">
        <div className="text-center mb-4">
          <div className="text-sm text-amber-400 uppercase tracking-wider mb-1">Your Referral Code</div>
          <div className="text-3xl sm:text-4xl font-mono font-bold tracking-wider">{referralCode}</div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={copyReferralLink}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-semibold transition-all active:scale-95 flex items-center gap-2"
          >
            {copied ? '✓ Copied!' : '📋 Copy Link'}
          </button>
          <button
            onClick={shareOnTwitter}
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold transition-all active:scale-95 flex items-center gap-2"
          >
            🐦 Twitter
          </button>
          <button
            onClick={shareOnTelegram}
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold transition-all active:scale-95 flex items-center gap-2"
          >
            ✈️ Telegram
          </button>
        </div>
      </div>

      {/* Stats Grid with 3D cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { value: stats?.total_referrals || 0, label: 'Shit Soldiers', emoji: '🪖', color: 'emerald', sub: 'recruited' },
          { value: stats?.active_referrals || 0, label: 'Active Poopers', emoji: '💩', color: 'amber', sub: 'earning' },
          { value: (stats?.total_earnings || 0).toFixed(0), label: '$SHIT Harvest', emoji: '🚜', color: 'purple', sub: 'from army' },
          { value: stats?.current_tier || 'Recruit', label: 'Your Rank', emoji: SHIT_TIERS.find(t => t.name === (stats?.current_tier || 'Recruit'))?.emoji || '🪖', color: 'blue', sub: 'tier' },
        ].map((stat, i) => (
          <div 
            key={i} 
            className="group relative bg-zinc-900/50 rounded-2xl p-4 border border-white/10 hover:border-amber-500/50 transition-all hover:transform hover:scale-105 hover:shadow-lg hover:shadow-amber-500/10"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl group-hover:animate-bounce">{stat.emoji}</span>
              <div className={`text-2xl font-black text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                {stat.value}
              </div>
            </div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</div>
            <div className="text-[10px] text-zinc-600">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Meme Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'overview', label: 'War Room', icon: '🎯', color: 'from-amber-500 to-orange-500' },
          { id: 'referrals', label: 'My Soldiers', icon: '🪖', color: 'from-emerald-500 to-teal-500' },
          { id: 'leaderboard', label: 'Top Poopers', icon: '🏆', color: 'from-purple-500 to-pink-500' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`group relative px-6 py-3 rounded-2xl font-bold transition-all transform hover:scale-105 active:scale-95 ${
              activeTab === tab.id
                ? `bg-gradient-to-r ${tab.color} text-white shadow-lg shadow-${tab.color.split('-')[1]}-500/30`
                : 'bg-zinc-800/50 text-zinc-400 hover:text-white border border-white/10 hover:border-white/30'
            }`}
          >
            <span className={`mr-2 inline-block transition-transform group-hover:rotate-12 ${activeTab === tab.id ? 'animate-bounce' : ''}`}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Earnings Breakdown */}
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <h3 className="font-bold mb-4">💰 Earnings Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <div className="text-lg font-bold text-emerald-400">{(stats?.offer_earnings || 0).toFixed(0)}</div>
                <div className="text-xs text-zinc-500">From Offers ({currentTier?.offer_commission}%)</div>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <div className="text-lg font-bold text-blue-400">{(stats?.merch_earnings || 0).toFixed(0)}</div>
                <div className="text-xs text-zinc-500">From Merch ({currentTier?.merch_commission}%)</div>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <div className="text-lg font-bold text-purple-400">{(stats?.nft_earnings || 0).toFixed(0)}</div>
                <div className="text-xs text-zinc-500">From NFT ({currentTier?.nft_commission}%)</div>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <div className="text-lg font-bold text-amber-400">{(stats?.staking_earnings || 0).toFixed(0)}</div>
                <div className="text-xs text-zinc-500">From Staking ({currentTier?.staking_commission}%)</div>
              </div>
              <div className="p-3 bg-pink-500/10 rounded-xl border border-pink-500/20">
                <div className="text-lg font-bold text-pink-400">{(stats?.general_bonuses || 0).toFixed(0)}</div>
                <div className="text-xs text-zinc-500">General Bonuses</div>
              </div>
            </div>
          </div>

          {/* Tier Progress */}
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">🎖️ Tier Progress</h3>
              <span className="text-sm text-amber-400">{stats?.current_tier}</span>
            </div>
            
            {nextTier && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-400">Referrals</span>
                    <span>{stats?.total_referrals} / {nextTier.min_referrals}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, ((stats?.total_referrals || 0) / nextTier.min_referrals) * 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-400">Earnings</span>
                    <span>{(stats?.total_earnings || 0).toFixed(0)} / {nextTier.min_earnings} $SHIT</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, ((stats?.total_earnings || 0) / nextTier.min_earnings) * 100)}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-zinc-500 mt-3">
                  Next tier: <span className="text-amber-400 font-semibold">{nextTier.name}</span> 
                  {' '}(+{nextTier.offer_commission - (currentTier?.offer_commission || 0)}% commission!)
                </p>
              </div>
            ) || (
              <p className="text-emerald-400 font-semibold">🎉 You've reached the maximum tier!</p>
            )}
          </div>

          {/* Commission Rates */}
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <h3 className="font-bold mb-4">📊 Your Commission Rates</h3>
            <div className="space-y-2">
              {tiers.map((tier) => (
                <div 
                  key={tier.name}
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    tier.name === stats?.current_tier 
                      ? 'bg-amber-500/20 border border-amber-500/40' 
                      : 'bg-zinc-800/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${
                      tier.name === stats?.current_tier ? 'bg-amber-500' : 'bg-zinc-600'
                    }`} />
                    <span className="font-medium">{tier.name}</span>
                    {tier.name === stats?.current_tier && (
                      <span className="text-xs bg-amber-500/30 text-amber-400 px-2 py-0.5 rounded">YOU</span>
                    )}
                  </div>
                  <div className="text-sm text-zinc-400">
                    {tier.min_referrals}+ refs • {tier.offer_commission}% offers
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Referrals Tab */}
      {activeTab === 'referrals' && (
        <div className="bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden">
          {referrals.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">🪖</div>
              <h3 className="font-bold text-lg mb-2">No recruits yet</h3>
              <p className="text-zinc-400 text-sm mb-4">Share your code to start earning!</p>
              <button
                onClick={copyReferralLink}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-semibold transition-all"
              >
                Copy Referral Link
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">Recruit</th>
                    <th className="text-right p-4 text-sm font-medium text-zinc-400">Joined</th>
                    <th className="text-right p-4 text-sm font-medium text-zinc-400">Their Earnings</th>
                    <th className="text-right p-4 text-sm font-medium text-zinc-400">Your Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {referrals.map((ref) => (
                    <tr key={ref.id} className="hover:bg-white/5">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm">
                            💩
                          </div>
                          <span className="font-mono text-sm">
                            {ref.referred_wallet.slice(0, 6)}...{ref.referred_wallet.slice(-4)}
                          </span>
                          {ref.is_active && (
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">Active</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right text-sm text-zinc-400">
                        {new Date(ref.joined_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right font-medium">
                        {ref.total_earned_by_referred.toFixed(0)} $SHIT
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-emerald-400 font-bold">+{ref.commission_earned.toFixed(0)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h3 className="font-bold">🏆 Top Referrers</h3>
          </div>
          <div className="divide-y divide-white/5">
            {leaderboard.map((entry, index) => (
              <div 
                key={entry.rank}
                className={`flex items-center justify-between p-4 hover:bg-white/5 ${
                  entry.rank <= 3 ? 'bg-gradient-to-r from-amber-500/10 to-transparent' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${entry.rank === 1 ? 'bg-yellow-500 text-black' : ''}
                    ${entry.rank === 2 ? 'bg-zinc-400 text-black' : ''}
                    ${entry.rank === 3 ? 'bg-amber-700 text-white' : ''}
                    ${entry.rank > 3 ? 'bg-zinc-800 text-zinc-400' : ''}
                  `}>
                    {entry.rank}
                  </div>
                  <div>
                    <div className="font-medium">{entry.username}</div>
                    <div className="text-xs text-zinc-500">
                      {entry.tier} • {entry.total_referrals} recruits
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-amber-400">{entry.total_earnings.toFixed(0)} $SHIT</div>
                  <div className="text-xs text-zinc-500">earned</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="mt-8 bg-zinc-900/30 rounded-2xl p-6 border border-white/5">
        <h3 className="font-bold mb-4">❓ How it works</h3>
        <div className="space-y-3 text-sm text-zinc-400">
          <p><span className="text-white font-medium">1.</span> Share your unique referral code with friends</p>
          <p><span className="text-white font-medium">2.</span> They join and complete offers / buy merch / trade NFTs</p>
          <p><span className="text-white font-medium">3.</span> You earn {currentTier?.offer_commission || 5}% of their offer earnings, {currentTier?.merch_commission || 3}% of merch, {currentTier?.nft_commission || 2}% of NFT sales!</p>
          <p><span className="text-white font-medium">4.</span> Level up your tier to earn higher commissions</p>
          <p><span className="text-white font-medium">5.</span> Bonus: Earn {currentTier?.general_bonus || 500} $SHIT when your referral buys General Pass!</p>
        </div>
      </div>
    </div>
  );
}
