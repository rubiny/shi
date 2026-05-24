'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface SeasonalEvent {
  id: string;
  name: string;
  emoji: string;
  description: string;
  theme: { bg: string; accent: string; border: string };
  startDate: Date;
  endDate: Date;
  rewards: Array<{ name: string; emoji: string; amount: number; requirement: string; claimed: boolean }>;
  missions: Array<{ title: string; progress: number; max: number; reward: number; emoji: string }>;
  leaderboard: Array<{ username: string; score: number; avatar: string }>;
  isActive: boolean;
}

const MOCK_EVENTS: SeasonalEvent[] = [
  {
    id: 'summer-flush', name: 'THE GREAT SUMMER FLUSH', emoji: '\u{1F3D6}\uFE0F',
    description: 'summer is here and so is the biggest flush of the year. complete missions, earn exclusive loot.',
    theme: { bg: 'from-amber-900/20 to-orange-900/20', accent: 'text-amber-400', border: 'border-amber-500/30' },
    startDate: new Date('2026-06-01'), endDate: new Date('2026-08-31'),
    rewards: [
      { name: 'Summer Soldier NFT', emoji: '\u{1F3D6}\uFE0F', amount: 1, requirement: 'Complete 10 missions', claimed: false },
      { name: 'Golden Sunscreen', emoji: '\u{1F31E}', amount: 5000, requirement: 'Reach 5000 event XP', claimed: false },
      { name: 'Beach Throne Title', emoji: '\u{1FA91}', amount: 1, requirement: 'Top 100 leaderboard', claimed: false },
      { name: 'Bonus $SHIT', emoji: '\u{1F4B0}', amount: 10000, requirement: 'Complete all missions', claimed: false },
    ],
    missions: [
      { title: 'Summer Grind: Complete 5 offers', progress: 3, max: 5, reward: 500, emoji: '\u{26A1}' },
      { title: 'Beach Raid: Deploy 3 soldiers', progress: 1, max: 3, reward: 750, emoji: '\u{1F3D6}\uFE0F' },
      { title: 'Sunburn Stake: Lock 1000 $SHIT', progress: 0, max: 1, reward: 1000, emoji: '\u{1F525}' },
      { title: 'Recruit 2 summer degens', progress: 1, max: 2, reward: 800, emoji: '\u{1F465}' },
      { title: 'Win 3 games in a row', progress: 0, max: 3, reward: 1200, emoji: '\u{1F3B2}' },
    ],
    leaderboard: [
      { username: 'BeachChad', score: 24500, avatar: '\u{1F3D6}\uFE0F' },
      { username: 'SummerApe', score: 19200, avatar: '\u{1F31E}' },
      { username: 'SandDegen', score: 15800, avatar: '\u{1FA91}' },
      { username: 'WaveRider', score: 12100, avatar: '\u{1F30A}' },
      { username: 'You', score: 3240, avatar: '\u{1F4A9}' },
    ],
    isActive: true,
  },
  {
    id: 'meme-madness', name: 'MEME MADNESS', emoji: '\u{1F92A}',
    description: 'the most unhinged event of the year. post memes, vote, earn. chaos is the only rule.',
    theme: { bg: 'from-purple-900/20 to-pink-900/20', accent: 'text-purple-400', border: 'border-purple-500/30' },
    startDate: new Date('2026-09-01'), endDate: new Date('2026-09-30'),
    rewards: [
      { name: 'Meme Lord Title', emoji: '\u{1F451}', amount: 1, requirement: 'Post 20 memes', claimed: false },
      { name: 'Chaos Orb', emoji: '\u{1F52E}', amount: 1, requirement: 'Get 1000 upvotes', claimed: false },
    ],
    missions: [
      { title: 'Post 5 memes', progress: 0, max: 5, reward: 500, emoji: '\u{1F92A}' },
      { title: 'Get 100 upvotes', progress: 0, max: 100, reward: 1000, emoji: '\u{2B06}\uFE0F' },
    ],
    leaderboard: [],
    isActive: false,
  },
];

interface SeasonalEventsProps {
  balance: number;
  onEarn: (amount: number, reason: string) => void;
}

export default function SeasonalEvents({ balance, onEarn }: SeasonalEventsProps) {
  const [events] = useState(MOCK_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<SeasonalEvent>(MOCK_EVENTS[0]);
  const [eventTab, setEventTab] = useState<'missions' | 'rewards' | 'leaderboard'>('missions');
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const end = selectedEvent.endDate.getTime();
      const diff = end - now;
      if (diff <= 0) { setTimeLeft('EVENT ENDED'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${d}d ${h}h ${m}m`);
    }, 60000);
    const now = Date.now();
    const end = selectedEvent.endDate.getTime();
    const diff = end - now;
    if (diff > 0) {
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${d}d ${h}h ${m}m`);
    }
    return () => clearInterval(interval);
  }, [selectedEvent]);

  const claimMission = useCallback((missionIdx: number) => {
    const mission = selectedEvent.missions[missionIdx];
    if (mission.progress < mission.max) return;
    onEarn(mission.reward, `Event mission: ${mission.title}`);
  }, [selectedEvent, onEarn]);

  const tabs = [
    { key: 'missions' as const, label: 'MISSIONS', icon: '\u{2694}\uFE0F' },
    { key: 'rewards' as const, label: 'REWARDS', icon: '\u{1F381}' },
    { key: 'leaderboard' as const, label: 'LEADERBOARD', icon: '\u{1F3C6}' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-8">
        <div className="text-amber-500 text-sm font-bold tracking-[3px]">LIMITED TIME</div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight">Seasonal Events</h2>
        <p className="text-zinc-400 text-sm mt-1">exclusive missions, limited rewards, time-gated chaos</p>
      </div>

      <div className="flex gap-3 mb-6 overflow-x-auto">
        {events.map(ev => (
          <button key={ev.id} onClick={() => setSelectedEvent(ev)} className={`flex-shrink-0 px-4 py-3 rounded-2xl text-sm font-semibold transition-all border ${selectedEvent.id === ev.id ? `bg-gradient-to-r ${ev.theme.bg} ${ev.theme.border}` : 'bg-zinc-900 border-white/5 hover:border-white/10'}`}>
            <span className="text-xl mr-2">{ev.emoji}</span>
            <span>{ev.name}</span>
            {ev.isActive && <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">LIVE</span>}
          </button>
        ))}
      </div>

      <div className={`bg-gradient-to-r ${selectedEvent.theme.bg} rounded-2xl p-6 border ${selectedEvent.theme.border} mb-6`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{selectedEvent.emoji}</span>
              <div className="text-2xl font-black">{selectedEvent.name}</div>
            </div>
            <p className="text-sm text-zinc-400 mt-1 max-w-lg">{selectedEvent.description}</p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-black ${selectedEvent.theme.accent}`}>{timeLeft}</div>
            <div className="text-xs text-zinc-500">remaining</div>
          </div>
        </div>
        <div className="mt-4 flex gap-4 text-xs text-zinc-500">
          <span>{selectedEvent.missions.length} missions</span>
          <span>{selectedEvent.rewards.length} rewards</span>
          <span>{selectedEvent.leaderboard.length} participants</span>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setEventTab(t.key)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${eventTab === t.key ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {eventTab === 'missions' && (
        <div className="space-y-3">
          {selectedEvent.missions.map((m, i) => {
            const pct = Math.min((m.progress / m.max) * 100, 100);
            const done = m.progress >= m.max;
            return (
              <div key={i} className={`bg-zinc-900/60 rounded-2xl p-4 border ${done ? 'border-green-500/20' : 'border-white/5'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{m.emoji}</span>
                    <span className="font-semibold text-sm">{m.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-sm font-bold">+{m.reward} $SHIT</span>
                    {done && (
                      <button onClick={() => claimMission(i)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-bold">CLAIM</button>
                    )}
                  </div>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all ${done ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="text-xs text-zinc-500 mt-1">{m.progress}/{m.max}</div>
              </div>
            );
          })}
        </div>
      )}

      {eventTab === 'rewards' && (
        <div className="grid md:grid-cols-2 gap-3">
          {selectedEvent.rewards.map((r, i) => (
            <div key={i} className={`bg-zinc-900/60 rounded-2xl p-5 border ${r.claimed ? 'border-green-500/20' : 'border-white/5'}`}>
              <div className="text-3xl mb-2">{r.emoji}</div>
              <div className="font-bold">{r.name}</div>
              {r.amount > 1 && <div className="text-amber-400 text-sm font-bold">+{r.amount.toLocaleString()} $SHIT</div>}
              <div className="text-xs text-zinc-500 mt-2">{r.requirement}</div>
              {r.claimed && <div className="text-xs text-green-400 mt-1">{'\u2713'} CLAIMED</div>}
            </div>
          ))}
        </div>
      )}

      {eventTab === 'leaderboard' && (
        <div className="space-y-2">
          {selectedEvent.leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">{'\u{1F3C6}'}</div>
              <div className="text-zinc-500 text-sm">event hasn&apos;t started yet. check back soon.</div>
            </div>
          ) : selectedEvent.leaderboard.map((entry, i) => (
            <div key={i} className={`bg-zinc-900/60 rounded-xl p-4 border ${entry.username === 'You' ? 'border-amber-500/30' : 'border-white/5'} flex items-center gap-4`}>
              <div className={`text-lg font-black w-8 ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-zinc-300' : i === 2 ? 'text-orange-500' : 'text-zinc-600'}`}>
                #{i + 1}
              </div>
              <span className="text-xl">{entry.avatar}</span>
              <div className="flex-1">
                <span className={`font-semibold text-sm ${entry.username === 'You' ? 'text-amber-400' : ''}`}>{entry.username}</span>
              </div>
              <span className="text-amber-400 font-bold text-sm">{entry.score.toLocaleString()} XP</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
