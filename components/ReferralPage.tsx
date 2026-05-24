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
  { name: 'Normie', emoji: '\u{1F4A9}', minRefs: 0, commission: 5, color: 'text-zinc-400' },
  { name: 'Degen', emoji: '\u{1F9F4}', minRefs: 10, commission: 8, color: 'text-green-400' },
  { name: 'Ape', emoji: '\u{1F6BD}', minRefs: 50, commission: 12, color: 'text-blue-400' },
  { name: 'Chad', emoji: '\u{1F977}', minRefs: 100, commission: 15, color: 'text-purple-400' },
  { name: 'GigaChad', emoji: '\u{1F3C6}', minRefs: 200, commission: 18, color: 'text-amber-400' },
];

const WEEKLY_DATA = [
  { day: 'Mon', clicks: 1840, signups: 48, earned: 12400 },
  { day: 'Tue', clicks: 2100, signups: 55, earned: 14200 },
  { day: 'Wed', clicks: 1650, signups: 42, earned: 10800 },
  { day: 'Thu', clicks: 2300, signups: 61, earned: 15700 },
  { day: 'Fri', clicks: 1900, signups: 50, earned: 12900 },
  { day: 'Sat', clicks: 1500, signups: 38, earned: 9800 },
  { day: 'Sun', clicks: 1557, signups: 48, earned: 13700 },
];

const PAYOUT_HISTORY = [
  { date: '2026-05-20', amount: 15000, status: 'paid' as const },
  { date: '2026-05-13', amount: 12500, status: 'paid' as const },
  { date: '2026-05-06', amount: 18000, status: 'paid' as const },
  { date: '2026-05-27', amount: 8500, status: 'pending' as const },
];

export default function ReferralPage({ userId }: { userId: string }) {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [customCode, setCustomCode] = useState('SHITKING');
  const [activeTab, setActiveTab] = useState<'overview' | 'soldiers' | 'analytics' | 'resources' | 'leaderboard'>('overview');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, [userId]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const [statsRes, referralsRes, tiersRes, leaderboardRes, codeRes] = await Promise.all([
        supabase.from('referral_stats').select('*').eq('user_id', userId).single(),
        supabase.from('referrals').select('*, profiles!referred_id(wallet_address, total_earned)').eq('referrer_id', userId).eq('is_active', true),
        supabase.from('referral_tiers').select('*').eq('is_active', true).order('min_referrals'),
        supabase.rpc('get_referral_leaderboard', { p_limit: 10 }),
        supabase.from('referrals').select('code').eq('referrer_id', userId).limit(1),
      ]);
      if (statsRes.data) setStats(statsRes.data);
      if (referralsRes.data) {
        setReferrals(referralsRes.data.map((r: Record<string, unknown>) => ({
          id: r.id as string,
          referred_wallet: (r.profiles as Record<string, unknown>)?.wallet_address as string || 'Anonymous',
          joined_at: r.created_at as string,
          total_earned_by_referred: Number((r.profiles as Record<string, unknown>)?.total_earned) || 0,
          commission_earned: Number(r.commission) || 0,
          is_active: r.is_active as boolean,
        })));
      }
      if (tiersRes.data) setTiers(tiersRes.data);
      if (leaderboardRes.data) setLeaderboard(leaderboardRes.data);
      if (!codeRes.data?.[0]?.code) {
        const newCode = 'SHIT' + Math.random().toString(36).substring(2, 8).toUpperCase();
        setReferralCode(newCode);
        setCustomCode(newCode);
      } else {
        setReferralCode(codeRes.data[0].code);
        setCustomCode(codeRes.data[0].code);
      }
    } catch {
      // Supabase not connected — use mock data
    } finally {
      setLoading(false);
    }
  };

  const effectiveCode = customCode || referralCode || 'SHITKING';
  const referralLink = `https://shit.army/?ref=${effectiveCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTierData = SHIT_TIERS.find(t => t.name === stats?.current_tier) || SHIT_TIERS[0];
  const nextTierData = SHIT_TIERS[SHIT_TIERS.indexOf(currentTierData) + 1];
  const currentTier = tiers.find(t => t.name === stats?.current_tier) || tiers[0];

  const totalClicks = 12847;
  const totalSignups = stats?.total_referrals || 342;
  const totalEarnings = stats?.total_earnings || 89500;
  const conversionRate = totalClicks > 0 ? ((totalSignups / totalClicks) * 100).toFixed(2) : '0';

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full" />
      </div>
    );
  }

  const tabs = [
    { key: 'overview' as const, label: 'OVERVIEW', icon: '\u{1F3AF}' },
    { key: 'soldiers' as const, label: 'MY DEGENS', icon: '\u{1FA96}' },
    { key: 'analytics' as const, label: 'ANALYTICS', icon: '\u{1F4CA}' },
    { key: 'resources' as const, label: 'PROMO KIT', icon: '\u{1F4E6}' },
    { key: 'leaderboard' as const, label: 'TOP RECRUITERS', icon: '\u{1F3C6}' },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="text-amber-500 text-sm font-bold tracking-[3px]">RECRUIT & EARN</div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight">Referral HQ</h2>
        <p className="text-zinc-400 text-sm mt-1">share your link, grow your army, earn commissions on everything they do</p>
      </div>

      {/* Tier + Code Card */}
      <div className="bg-gradient-to-br from-amber-600/10 to-orange-600/10 border border-amber-500/30 rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{currentTierData.emoji}</span>
            <div>
              <div className={`text-lg font-bold ${currentTierData.color}`}>{currentTierData.name} Recruiter</div>
              <div className="text-xs text-zinc-500">{currentTierData.commission}% commission on all referral earnings</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 border border-white/10 font-mono">
              {referralLink}
            </div>
            <button onClick={copyLink} className={`px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap ${copied ? 'bg-green-600 text-white' : 'bg-amber-600 text-black'}`}>
              {copied ? '\u2713 COPIED' : 'COPY LINK'}
            </button>
          </div>
        </div>
        {nextTierData && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-400">Progress to {nextTierData.emoji} {nextTierData.name} ({nextTierData.commission}%)</span>
              <span className="text-amber-400">{totalSignups}/{nextTierData.minRefs} referrals</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${Math.min((totalSignups / nextTierData.minRefs) * 100, 100)}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'TOTAL CLICKS', value: totalClicks.toLocaleString(), icon: '\u{1F441}' },
          { label: 'DEGENS RECRUITED', value: totalSignups.toLocaleString(), icon: '\u{1F465}' },
          { label: 'TOTAL EARNINGS', value: `${totalEarnings.toLocaleString()} $SHIT`, icon: '\u{1F4B0}' },
          { label: 'CONV. RATE', value: `${conversionRate}%`, icon: '\u{1F4C8}' },
        ].map(stat => (
          <div key={stat.label} className="bg-zinc-900/60 rounded-xl p-4 border border-white/5">
            <div className="text-lg mb-1">{stat.icon}</div>
            <div className="text-amber-400 font-bold text-lg">{stat.value}</div>
            <div className="text-xs text-zinc-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === t.key ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Earnings Breakdown */}
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <h3 className="font-bold mb-4">{'\u{1F4B0}'} Earnings Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'From Offers', value: stats?.offer_earnings || 0, pct: currentTier?.offer_commission || 5, color: 'amber' },
                { label: 'From Merch', value: stats?.merch_earnings || 0, pct: currentTier?.merch_commission || 3, color: 'blue' },
                { label: 'From NFT', value: stats?.nft_earnings || 0, pct: currentTier?.nft_commission || 2, color: 'purple' },
                { label: 'From Staking', value: stats?.staking_earnings || 0, pct: currentTier?.staking_commission || 1, color: 'green' },
                { label: 'Bonuses', value: stats?.general_bonuses || 0, pct: null, color: 'pink' },
              ].map(cat => (
                <div key={cat.label} className={`p-3 bg-${cat.color}-500/10 rounded-xl border border-${cat.color}-500/20`}>
                  <div className={`text-lg font-bold text-${cat.color}-400`}>{Number(cat.value).toFixed(0)}</div>
                  <div className="text-xs text-zinc-500">{cat.label}{cat.pct !== null ? ` (${cat.pct}%)` : ''}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Code */}
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <h3 className="font-bold mb-3">{'\u{1F517}'} Custom Referral Code</h3>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                maxLength={12}
                className="px-4 py-2 bg-zinc-800 rounded-xl border border-white/10 text-sm font-mono focus:border-amber-500 focus:outline-none flex-1"
                placeholder="Custom code..."
              />
              <span className="text-xs text-zinc-500">shit.army/?ref={customCode}</span>
            </div>
          </div>

          {/* Social Share */}
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <h3 className="font-bold mb-3">{'\u{1F4F1}'} Share Everywhere</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { name: 'Twitter/X', icon: '\u{1D54F}', url: `https://x.com/intent/tweet?text=earn%20free%20crypto%20on%20shit.army%20%F0%9F%92%A9&url=${encodeURIComponent(referralLink)}` },
                { name: 'Telegram', icon: '\u2708\uFE0F', url: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=earn free crypto` },
                { name: 'Discord', icon: '\u{1F4AC}', url: '#' },
                { name: 'Reddit', icon: '\u{1F916}', url: `https://reddit.com/submit?url=${encodeURIComponent(referralLink)}&title=earn free crypto on shit.army` },
              ].map(s => (
                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="bg-zinc-800 hover:bg-zinc-700 rounded-xl p-3 text-center text-sm transition-all">
                  <div className="text-lg mb-1">{s.icon}</div>
                  <div className="text-xs">{s.name}</div>
                </a>
              ))}
            </div>
          </div>

          {/* Tier Progression */}
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <h3 className="font-bold mb-4">{'\u{1F396}\uFE0F'} Referral Tiers</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {SHIT_TIERS.map(tier => (
                <div key={tier.name} className={`bg-zinc-800 rounded-xl p-3 text-center border ${tier.name === currentTierData.name ? 'border-amber-500/40' : 'border-white/5'}`}>
                  <div className="text-2xl mb-1">{tier.emoji}</div>
                  <div className={`font-bold text-sm ${tier.color}`}>{tier.name}</div>
                  <div className="text-xs text-zinc-500">{tier.commission}% comm</div>
                  <div className="text-xs text-zinc-600">{tier.minRefs}+ refs</div>
                  {tier.name === currentTierData.name && <div className="text-xs text-amber-400 mt-1 font-semibold">YOU</div>}
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="bg-zinc-900/30 rounded-2xl p-6 border border-white/5">
            <h3 className="font-bold mb-4">{'\u2753'} How it works</h3>
            <div className="space-y-2 text-sm text-zinc-400">
              <p><span className="text-white font-medium">1.</span> Share your unique referral link with frens</p>
              <p><span className="text-white font-medium">2.</span> They join and start grinding offers, buying merch, trading</p>
              <p><span className="text-white font-medium">3.</span> You earn {currentTierData.commission}% of everything they earn</p>
              <p><span className="text-white font-medium">4.</span> Level up your tier for higher commissions (up to 18%)</p>
              <p><span className="text-white font-medium">5.</span> Weekly payouts in $SHIT. all sales final. this is the way.</p>
            </div>
          </div>
        </div>
      )}

      {/* MY DEGENS TAB */}
      {activeTab === 'soldiers' && (
        <div className="bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden">
          {referrals.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-3">{'\u{1FA96}'}</div>
              <h3 className="font-bold text-lg mb-2">no degens recruited yet</h3>
              <p className="text-zinc-400 text-sm mb-4">share your link and start building your army</p>
              <button onClick={copyLink} className="px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-semibold transition-all">
                COPY REFERRAL LINK
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">Degen</th>
                    <th className="text-right p-4 text-sm font-medium text-zinc-400">Joined</th>
                    <th className="text-right p-4 text-sm font-medium text-zinc-400">Their Loot</th>
                    <th className="text-right p-4 text-sm font-medium text-zinc-400">Your Cut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {referrals.map((ref) => (
                    <tr key={ref.id} className="hover:bg-white/5">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm">{'\u{1F4A9}'}</div>
                          <span className="font-mono text-sm">{ref.referred_wallet.slice(0, 6)}...{ref.referred_wallet.slice(-4)}</span>
                          {ref.is_active && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">ACTIVE</span>}
                        </div>
                      </td>
                      <td className="p-4 text-right text-sm text-zinc-400">{new Date(ref.joined_at).toLocaleDateString()}</td>
                      <td className="p-4 text-right font-medium">{ref.total_earned_by_referred.toFixed(0)} $SHIT</td>
                      <td className="p-4 text-right"><span className="text-amber-400 font-bold">+{ref.commission_earned.toFixed(0)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="bg-zinc-900/60 rounded-2xl p-5 border border-white/5">
            <div className="text-sm font-bold mb-4">{'\u{1F4C8}'} WEEKLY PERFORMANCE</div>
            <div className="flex items-end gap-1 h-36">
              {WEEKLY_DATA.map(d => {
                const maxE = Math.max(...WEEKLY_DATA.map(x => x.earned));
                const h = (d.earned / maxE) * 100;
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-xs text-amber-400 font-semibold">{d.signups}</div>
                    <div className="w-full bg-amber-500/60 rounded-t transition-all hover:bg-amber-500/80" style={{ height: `${h}%` }} />
                    <div className="text-xs text-zinc-600">{d.day}</div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
              <span>bar height = earnings</span>
              <span>numbers = signups</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900/60 rounded-xl p-4 border border-white/5">
              <div className="text-xs text-zinc-500">PENDING PAYOUT</div>
              <div className="text-amber-400 font-bold text-xl">{PAYOUT_HISTORY.filter(p => p.status === 'pending').reduce((a, b) => a + b.amount, 0).toLocaleString()} $SHIT</div>
            </div>
            <div className="bg-zinc-900/60 rounded-xl p-4 border border-white/5">
              <div className="text-xs text-zinc-500">TOTAL PAID OUT</div>
              <div className="text-green-400 font-bold text-xl">{PAYOUT_HISTORY.filter(p => p.status === 'paid').reduce((a, b) => a + b.amount, 0).toLocaleString()} $SHIT</div>
            </div>
          </div>

          <div className="bg-zinc-900/60 rounded-2xl p-5 border border-white/5">
            <div className="text-sm font-bold mb-3">{'\u{1F4B8}'} PAYOUT HISTORY</div>
            <div className="space-y-2">
              {PAYOUT_HISTORY.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-sm text-zinc-400">{p.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold text-sm">{p.amount.toLocaleString()} $SHIT</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${p.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {p.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PROMO KIT TAB */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="bg-zinc-900/80 border border-amber-500/20 rounded-2xl p-6">
            <div className="text-sm font-bold mb-4">{'\u{1F3A8}'} MARKETING ASSETS</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: 'Banner 728x90', type: 'Leaderboard' },
                { name: 'Banner 300x250', type: 'Rectangle' },
                { name: 'Banner 160x600', type: 'Skyscraper' },
                { name: 'Social Post 1080', type: 'Square' },
                { name: 'Story 1080x1920', type: 'Vertical' },
                { name: 'Logo Pack', type: 'ZIP' },
              ].map(asset => (
                <div key={asset.name} className="bg-zinc-800 rounded-xl p-3 text-center hover:bg-zinc-700 cursor-pointer transition-all">
                  <div className="text-2xl mb-2">{'\u{1F5BC}\uFE0F'}</div>
                  <div className="text-xs font-semibold">{asset.name}</div>
                  <div className="text-xs text-zinc-600">{asset.type}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900/60 rounded-2xl p-6 border border-white/5">
            <div className="text-sm font-bold mb-3">{'\u{1F4DD}'} COPY TEMPLATES</div>
            <p className="text-xs text-zinc-500 mb-3">click to copy — paste anywhere</p>
            <div className="space-y-3">
              {[
                `earn free crypto by completing simple tasks on shit.army. no investment needed. join the army. ${referralLink}`,
                `i made $500 this month on shit.army just doing offers and staking. if you're not on here you're ngmi. ${referralLink}`,
                `shit.army is where degens earn. offerwall + staking + games + referrals. all in one degen platform. ${referralLink}`,
              ].map((template, i) => (
                <div key={i} className="bg-zinc-800 rounded-xl p-3 text-sm text-zinc-300 cursor-pointer hover:bg-zinc-700" onClick={() => navigator.clipboard.writeText(template)}>
                  {template}
                  <div className="text-xs text-zinc-600 mt-1">click to copy</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LEADERBOARD TAB */}
      {activeTab === 'leaderboard' && (
        <div className="bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h3 className="font-bold">{'\u{1F3C6}'} Top Recruiters</h3>
          </div>
          {leaderboard.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">{'\u{1F3C6}'}</div>
              <div className="text-zinc-500 text-sm">leaderboard loading... keep grinding ser</div>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {leaderboard.map((entry) => (
                <div key={entry.rank} className={`flex items-center justify-between p-4 hover:bg-white/5 ${entry.rank <= 3 ? 'bg-gradient-to-r from-amber-500/10 to-transparent' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${entry.rank === 1 ? 'bg-yellow-500 text-black' : entry.rank === 2 ? 'bg-zinc-400 text-black' : entry.rank === 3 ? 'bg-amber-700 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                      {entry.rank}
                    </div>
                    <div>
                      <div className="font-medium">{entry.username}</div>
                      <div className="text-xs text-zinc-500">{entry.tier} {'\u2022'} {entry.total_referrals} degens</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-amber-400">{entry.total_earnings.toFixed(0)} $SHIT</div>
                    <div className="text-xs text-zinc-500">earned</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
