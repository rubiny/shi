'use client';

import React, { useState } from 'react';

interface AmbassadorStats {
  totalClicks: number;
  totalSignups: number;
  totalEarnings: number;
  conversionRate: number;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  commission: number;
  customCode: string;
  payoutHistory: Array<{ date: string; amount: number; status: 'paid' | 'pending' }>;
  topReferrals: Array<{ username: string; earned: number; date: string }>;
  weeklyData: Array<{ day: string; clicks: number; signups: number; earned: number }>;
}

const TIERS = [
  { name: 'Bronze', emoji: '\u{1F949}', minRefs: 0, commission: 5, color: 'text-orange-600' },
  { name: 'Silver', emoji: '\u{1F948}', minRefs: 10, commission: 8, color: 'text-zinc-300' },
  { name: 'Gold', emoji: '\u{1F947}', minRefs: 50, commission: 12, color: 'text-amber-400' },
  { name: 'Diamond', emoji: '\u{1F48E}', minRefs: 200, commission: 18, color: 'text-cyan-400' },
];

const MOCK_STATS: AmbassadorStats = {
  totalClicks: 12847,
  totalSignups: 342,
  totalEarnings: 89500,
  conversionRate: 2.66,
  tier: 'silver',
  commission: 8,
  customCode: 'SHITKING',
  payoutHistory: [
    { date: '2026-05-20', amount: 15000, status: 'paid' },
    { date: '2026-05-13', amount: 12500, status: 'paid' },
    { date: '2026-05-06', amount: 18000, status: 'paid' },
    { date: '2026-05-27', amount: 8500, status: 'pending' },
  ],
  topReferrals: [
    { username: 'MoonBoi99', earned: 12500, date: '3d ago' },
    { username: 'DegenApe', earned: 8900, date: '5d ago' },
    { username: 'CryptoNoob', earned: 6700, date: '1w ago' },
    { username: 'FlushGod', earned: 5400, date: '2w ago' },
  ],
  weeklyData: [
    { day: 'Mon', clicks: 1840, signups: 48, earned: 12400 },
    { day: 'Tue', clicks: 2100, signups: 55, earned: 14200 },
    { day: 'Wed', clicks: 1650, signups: 42, earned: 10800 },
    { day: 'Thu', clicks: 2300, signups: 61, earned: 15700 },
    { day: 'Fri', clicks: 1900, signups: 50, earned: 12900 },
    { day: 'Sat', clicks: 1500, signups: 38, earned: 9800 },
    { day: 'Sun', clicks: 1557, signups: 48, earned: 13700 },
  ],
};

export default function AmbassadorPanel() {
  const [stats] = useState(MOCK_STATS);
  const [tab, setTab] = useState<'overview' | 'links' | 'payouts' | 'resources'>('overview');
  const [customCode, setCustomCode] = useState(stats.customCode);
  const [copied, setCopied] = useState(false);

  const currentTier = TIERS.find(t => t.name.toLowerCase() === stats.tier) || TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];

  const copyLink = () => {
    navigator.clipboard.writeText(`https://shit.army/?ref=${customCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { key: 'overview' as const, label: 'OVERVIEW', icon: '\u{1F4CA}' },
    { key: 'links' as const, label: 'LINKS & CODES', icon: '\u{1F517}' },
    { key: 'payouts' as const, label: 'PAYOUTS', icon: '\u{1F4B0}' },
    { key: 'resources' as const, label: 'RESOURCES', icon: '\u{1F4E6}' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-8">
        <div className="text-amber-500 text-sm font-bold tracking-[3px]">CREATOR PROGRAM</div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight">Ambassador Panel</h2>
        <p className="text-zinc-400 text-sm mt-1">share your link, grow your army, earn commissions on everything</p>
      </div>

      <div className="bg-zinc-900/80 border border-amber-500/20 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{currentTier.emoji}</span>
            <div>
              <div className={`text-lg font-bold ${currentTier.color}`}>{currentTier.name} Ambassador</div>
              <div className="text-xs text-zinc-500">{stats.commission}% commission on all referral earnings</div>
            </div>
          </div>
          {nextTier && (
            <div className="text-right">
              <div className="text-xs text-zinc-500">Next tier: {nextTier.emoji} {nextTier.name} ({nextTier.commission}%)</div>
              <div className="text-xs text-zinc-600">{nextTier.minRefs - stats.totalSignups} more referrals needed</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${tab === t.key ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'TOTAL CLICKS', value: stats.totalClicks.toLocaleString(), icon: '\u{1F441}' },
              { label: 'SIGNUPS', value: stats.totalSignups.toLocaleString(), icon: '\u{1F465}' },
              { label: 'EARNINGS', value: `${stats.totalEarnings.toLocaleString()} $SHIT`, icon: '\u{1F4B0}' },
              { label: 'CONV. RATE', value: `${stats.conversionRate}%`, icon: '\u{1F4C8}' },
            ].map(stat => (
              <div key={stat.label} className="bg-zinc-900/60 rounded-xl p-4 border border-white/5">
                <div className="text-lg mb-1">{stat.icon}</div>
                <div className="text-amber-400 font-bold text-lg">{stat.value}</div>
                <div className="text-xs text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-zinc-900/60 rounded-2xl p-5 border border-white/5 mb-4">
            <div className="text-sm font-bold mb-4">{'\u{1F4C8}'} WEEKLY PERFORMANCE</div>
            <div className="flex items-end gap-1 h-32">
              {stats.weeklyData.map(d => {
                const maxE = Math.max(...stats.weeklyData.map(x => x.earned));
                const h = (d.earned / maxE) * 100;
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-xs text-zinc-500">{d.signups}</div>
                    <div className="w-full bg-amber-500/60 rounded-t" style={{ height: `${h}%` }} />
                    <div className="text-xs text-zinc-600">{d.day}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-zinc-900/60 rounded-2xl p-5 border border-white/5">
            <div className="text-sm font-bold mb-3">{'\u{1F3C6}'} TOP REFERRALS</div>
            <div className="space-y-2">
              {stats.topReferrals.map((ref, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 text-sm w-5">#{i + 1}</span>
                    <span className="font-semibold text-sm">{ref.username}</span>
                    <span className="text-xs text-zinc-600">{ref.date}</span>
                  </div>
                  <span className="text-amber-400 text-sm font-bold">{ref.earned.toLocaleString()} $SHIT</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'links' && (
        <div className="space-y-4">
          <div className="bg-zinc-900/80 border border-amber-500/20 rounded-2xl p-6">
            <div className="text-sm font-bold mb-4">{'\u{1F517}'} YOUR REFERRAL LINK</div>
            <div className="flex gap-2">
              <div className="flex-1 bg-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 border border-white/10">
                https://shit.army/?ref={customCode}
              </div>
              <button onClick={copyLink} className={`px-4 py-2 rounded-xl text-sm font-bold ${copied ? 'bg-green-600 text-white' : 'bg-amber-600 text-black'}`}>
                {copied ? '\u2713 COPIED' : 'COPY'}
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <input type="text" value={customCode} onChange={(e) => setCustomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} maxLength={12} className="px-3 py-2 bg-zinc-800 rounded-xl border border-white/10 text-sm focus:border-amber-500 focus:outline-none" placeholder="Custom code..." />
              <span className="text-xs text-zinc-500 self-center">custom referral code</span>
            </div>
          </div>

          <div className="bg-zinc-900/60 rounded-2xl p-6 border border-white/5">
            <div className="text-sm font-bold mb-3">{'\u{1F4F1}'} SOCIAL SHARE LINKS</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { name: 'Twitter/X', icon: '\u{1D54F}', url: `https://x.com/intent/tweet?text=earn%20free%20crypto%20on%20shit.army%20%F0%9F%92%A9&url=https://shit.army/?ref=${customCode}` },
                { name: 'Telegram', icon: '\u{2708}\uFE0F', url: `https://t.me/share/url?url=https://shit.army/?ref=${customCode}&text=earn free crypto` },
                { name: 'Discord', icon: '\u{1F4AC}', url: '#' },
                { name: 'Reddit', icon: '\u{1F916}', url: `https://reddit.com/submit?url=https://shit.army/?ref=${customCode}&title=earn free crypto` },
              ].map(s => (
                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="bg-zinc-800 hover:bg-zinc-700 rounded-xl p-3 text-center text-sm transition-all">
                  <div className="text-lg mb-1">{s.icon}</div>
                  <div className="text-xs">{s.name}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'payouts' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900/60 rounded-xl p-4 border border-white/5">
              <div className="text-xs text-zinc-500">PENDING PAYOUT</div>
              <div className="text-amber-400 font-bold text-xl">{stats.payoutHistory.filter(p => p.status === 'pending').reduce((a, b) => a + b.amount, 0).toLocaleString()} $SHIT</div>
            </div>
            <div className="bg-zinc-900/60 rounded-xl p-4 border border-white/5">
              <div className="text-xs text-zinc-500">TOTAL PAID</div>
              <div className="text-green-400 font-bold text-xl">{stats.payoutHistory.filter(p => p.status === 'paid').reduce((a, b) => a + b.amount, 0).toLocaleString()} $SHIT</div>
            </div>
          </div>
          <div className="bg-zinc-900/60 rounded-2xl p-5 border border-white/5">
            <div className="text-sm font-bold mb-3">{'\u{1F4B8}'} PAYOUT HISTORY</div>
            <div className="space-y-2">
              {stats.payoutHistory.map((p, i) => (
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

      {tab === 'resources' && (
        <div className="space-y-4">
          <div className="bg-zinc-900/80 border border-amber-500/20 rounded-2xl p-6">
            <div className="text-sm font-bold mb-4">{'\u{1F3A8}'} MARKETING KIT</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: 'Banner 728x90', type: 'Leaderboard' },
                { name: 'Banner 300x250', type: 'Rectangle' },
                { name: 'Banner 160x600', type: 'Skyscraper' },
                { name: 'Social Post 1080x1080', type: 'Square' },
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
            <div className="space-y-3">
              {[
                'earn free crypto by completing simple tasks on shit.army. no investment needed. join the army.',
                'i made $500 this month on shit.army just doing offers and staking. if you\'re not on here you\'re ngmi.',
                'shit.army is where degens earn. offerwall + staking + games + referrals. all in one degen platform.',
              ].map((template, i) => (
                <div key={i} className="bg-zinc-800 rounded-xl p-3 text-sm text-zinc-300 cursor-pointer hover:bg-zinc-700" onClick={() => navigator.clipboard.writeText(template)}>
                  {template}
                  <div className="text-xs text-zinc-600 mt-1">click to copy</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900/60 rounded-2xl p-6 border border-white/5">
            <div className="text-sm font-bold mb-3">{'\u{1F4DA}'} AMBASSADOR TIERS</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TIERS.map(tier => (
                <div key={tier.name} className={`bg-zinc-800 rounded-xl p-3 text-center border ${tier.name.toLowerCase() === stats.tier ? 'border-amber-500/40' : 'border-white/5'}`}>
                  <div className="text-2xl mb-1">{tier.emoji}</div>
                  <div className={`font-bold text-sm ${tier.color}`}>{tier.name}</div>
                  <div className="text-xs text-zinc-500">{tier.commission}% commission</div>
                  <div className="text-xs text-zinc-600">{tier.minRefs}+ referrals</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
