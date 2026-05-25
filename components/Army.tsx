'use client';

import React, { useState, useEffect, useCallback } from 'react';
import EmptyState from './ui/EmptyState';

type SoldierRank = 'Normie' | 'Degen' | 'Ape' | 'Chad' | 'Whale' | 'GigaChad';
type MissionStatus = 'chilling' | 'grinding' | 'done';
type Difficulty = 'EZ' | 'Sweaty' | 'Brutal' | 'Suicidal';

interface Soldier {
  id: string;
  name: string;
  rank: SoldierRank;
  power: number;
  emoji: string;
  skills: string[];
  acquiredAt: string;
  xp: number;
  level: number;
  equipped: boolean;
  missionStatus: MissionStatus;
  missionEndTime: number | null;
  missionReward: number | null;
  totalLooted: number;
  raidsCompleted: number;
}

interface Mission {
  id: string;
  name: string;
  difficulty: Difficulty;
  baseReward: number;
  duration: number;
  durationLabel: string;
  requirements: { minPower: number; minLevel: number };
  emoji: string;
  xpReward: number;
  flavorText: string;
  jackpotChance: number;
  jackpotMultiplier: number;
}

const INITIAL_SOLDIERS: Soldier[] = [
  { id: '1', name: 'Turd Burglar #001', rank: 'Ape', power: 52, emoji: '💩', skills: ['Stink Nuke', 'Rug Detector'], acquiredAt: '2026-05-20', xp: 1200, level: 3, equipped: true, missionStatus: 'chilling', missionEndTime: null, missionReward: null, totalLooted: 2400, raidsCompleted: 8 },
  { id: '2', name: 'Porcelain Punisher #042', rank: 'Chad', power: 78, emoji: '🚽', skills: ['Flush of Death', 'Liquidity Drain', 'Plunge Attack'], acquiredAt: '2026-05-22', xp: 2800, level: 5, equipped: true, missionStatus: 'chilling', missionEndTime: null, missionReward: null, totalLooted: 6800, raidsCompleted: 15 },
  { id: '3', name: 'Wipe Wizard #069', rank: 'Degen', power: 35, emoji: '🧻', skills: ['Paper Hands', 'Roll Away'], acquiredAt: '2026-05-23', xp: 450, level: 2, equipped: false, missionStatus: 'chilling', missionEndTime: null, missionReward: null, totalLooted: 600, raidsCompleted: 3 },
  { id: '4', name: 'Golden Shitter #001', rank: 'Whale', power: 150, emoji: '👑', skills: ['Royal Dump', 'Golden Shower', 'Whale Alert'], acquiredAt: '2026-05-24', xp: 500, level: 1, equipped: true, missionStatus: 'chilling', missionEndTime: null, missionReward: null, totalLooted: 0, raidsCompleted: 0 },
];

const MISSIONS: Mission[] = [
  { id: 'sewer', name: 'Sewer Rug Pull', difficulty: 'EZ', baseReward: 50, duration: 60, durationLabel: '1 min', requirements: { minPower: 10, minLevel: 1 }, emoji: '🕳️', xpReward: 100, flavorText: 'snipe some normie liquidity from the sewers', jackpotChance: 5, jackpotMultiplier: 3 },
  { id: 'restroom', name: 'Public Toilet Raid', difficulty: 'Sweaty', baseReward: 200, duration: 300, durationLabel: '5 min', requirements: { minPower: 40, minLevel: 2 }, emoji: '🚻', xpReward: 250, flavorText: 'hostile takeover of a public restroom. ape in.', jackpotChance: 8, jackpotMultiplier: 5 },
  { id: 'septic', name: 'Septic Tank MEV', difficulty: 'Brutal', baseReward: 800, duration: 900, durationLabel: '15 min', requirements: { minPower: 80, minLevel: 4 }, emoji: '🏭', xpReward: 600, flavorText: 'front-run the septic tank. massive loot potential.', jackpotChance: 10, jackpotMultiplier: 7 },
  { id: 'flush', name: 'THE GREAT FLUSH', difficulty: 'Suicidal', baseReward: 3000, duration: 3600, durationLabel: '1 hour', requirements: { minPower: 150, minLevel: 6 }, emoji: '🌊', xpReward: 1500, flavorText: 'all-in kamikaze flush. either you moon or you get rekt.', jackpotChance: 15, jackpotMultiplier: 10 },
];

const RANK_COLORS: Record<SoldierRank, string> = {
  Normie: 'from-zinc-600 to-zinc-500',
  Degen: 'from-green-600 to-green-500',
  Ape: 'from-blue-600 to-cyan-500',
  Chad: 'from-purple-600 to-pink-500',
  Whale: 'from-amber-500 via-orange-500 to-red-500',
  GigaChad: 'from-pink-600 via-purple-500 to-blue-500',
};

const RANK_BORDER: Record<SoldierRank, string> = {
  Normie: 'border-zinc-600',
  Degen: 'border-green-500',
  Ape: 'border-blue-500',
  Chad: 'border-purple-500',
  Whale: 'border-amber-500',
  GigaChad: 'border-pink-500',
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  EZ: 'text-green-400 bg-green-500/10',
  Sweaty: 'text-amber-400 bg-amber-500/10',
  Brutal: 'text-orange-400 bg-orange-500/10',
  Suicidal: 'text-red-400 bg-red-500/10',
};

const LEVEL_UP_COST = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 15000, 30000];
const XP_PER_LEVEL = 5000;
const RECRUIT_COOLDOWN_MS = 5000;

interface RaidLogEntry {
  id: string;
  soldierName: string;
  soldierEmoji: string;
  missionName: string;
  missionEmoji: string;
  reward: number;
  xp: number;
  timestamp: number;
  isJackpot?: boolean;
}

const RECRUIT_COST = 500;
const RECRUIT_CHANCES: { rank: SoldierRank; chance: number; power: [number, number] }[] = [
  { rank: 'Normie', chance: 50, power: [10, 25] },
  { rank: 'Degen', chance: 30, power: [25, 45] },
  { rank: 'Ape', chance: 15, power: [45, 70] },
  { rank: 'Chad', chance: 4, power: [70, 100] },
  { rank: 'Whale', chance: 0.9, power: [100, 200] },
  { rank: 'GigaChad', chance: 0.1, power: [200, 500] },
];

const SOLDIER_NAMES = ['Turd Burglar', 'Dookie Demon', 'Flush Fiend', 'Sewer Sniper', 'Drain Degen', 'Manhole Menace', 'Plunger Chad', 'Bidet Berserker', 'Septic Sigma', 'Porcelain Punisher'];
const SOLDIER_EMOJIS: Record<SoldierRank, string[]> = {
  Normie: ['💩', '🪣'],
  Degen: ['🧻', '🦧'],
  Ape: ['🚽', '🐵'],
  Chad: ['🥷', '🤖'],
  Whale: ['👑', '🐋'],
  GigaChad: ['🏆', '⚡'],
};
const SKILLS_POOL: Record<SoldierRank, string[]> = {
  Normie: ['Weak Fart', 'Paper Hands'],
  Degen: ['YOLO Splash', 'Rug Sniff', 'Diamond Grip'],
  Ape: ['Flush Attack', 'Ape In', 'Liquidity Drain'],
  Chad: ['MEV Sandwich', 'Silent Dump', 'Pump & Dump'],
  Whale: ['Market Crash', 'Diamond Rain', 'Whale Alert'],
  GigaChad: ['God Flush', 'Infinite Liquidity', 'Toilet Singularity'],
};

export default function Army({ userId: _userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<'army' | 'missions' | 'recruit' | 'log'>('army');
  const [soldiers, setSoldiers] = useState<Soldier[]>(INITIAL_SOLDIERS);
  const [selectedSoldier, setSelectedSoldier] = useState<Soldier | null>(null);
  const [deployModal, setDeployModal] = useState<{ soldier: Soldier; mission: Mission } | null>(null);
  const [minting, setMinting] = useState(false);
  const [mintResult, setMintResult] = useState<Soldier | null>(null);
  const [recruitCount, setRecruitCount] = useState(1);
  const [, setTick] = useState(0);
  const [totalClaimed, setTotalClaimed] = useState(0);
  const [raidLog, setRaidLog] = useState<RaidLogEntry[]>([]);
  const [lastRecruitTime, setLastRecruitTime] = useState(0);
  const [raidStreak, setRaidStreak] = useState(0);
  const streakMultiplier = raidStreak >= 10 ? 2.0 : raidStreak >= 7 ? 1.7 : raidStreak >= 5 ? 1.5 : raidStreak >= 3 ? 1.2 : 1.0;
  const nextStreakAt = raidStreak < 3 ? 3 : raidStreak < 5 ? 5 : raidStreak < 7 ? 7 : raidStreak < 10 ? 10 : null;
  const nextStreakMult = raidStreak < 3 ? 1.2 : raidStreak < 5 ? 1.5 : raidStreak < 7 ? 1.7 : raidStreak < 10 ? 2.0 : null;

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
      setSoldiers(prev => {
        const now = Date.now();
        const hasCompleted = prev.some(s => s.missionStatus === 'grinding' && s.missionEndTime && s.missionEndTime <= now);
        if (!hasCompleted) return prev;
        return prev.map(s =>
          s.missionStatus === 'grinding' && s.missionEndTime && s.missionEndTime <= now
            ? { ...s, missionStatus: 'done' as MissionStatus }
            : s
        );
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const squadPower = soldiers.filter(s => s.equipped).reduce((sum, s) => sum + s.power * s.level, 0);
  const equippedCount = soldiers.filter(s => s.equipped).length;
  const offerwallBonus = Math.floor(squadPower / 100);
  const deployedCount = soldiers.filter(s => s.missionStatus === 'grinding').length;
  const completedCount = soldiers.filter(s => s.missionStatus === 'done').length;

  const formatCountdown = useCallback((endTime: number) => {
    const diff = Math.max(0, endTime - Date.now());
    if (diff <= 0) return 'LFG';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }, []);

  const dailyEstimate = (() => {
    const equipped = soldiers.filter(s => s.equipped);
    if (equipped.length === 0) return 0;
    const avgPowerLevel = equipped.reduce((sum, s) => sum + s.power * s.level, 0) / equipped.length;
    const bestMission = [...MISSIONS].reverse().find(m => avgPowerLevel >= m.requirements.minPower * m.requirements.minLevel) || MISSIONS[0];
    const runsPerDay = Math.floor(86400 / bestMission.duration);
    const avgReward = bestMission.baseReward * (1 + avgPowerLevel / 500);
    return Math.floor(avgReward * runsPerDay * equipped.length * 0.6);
  })();

  const deployOnMission = (soldier: Soldier, mission: Mission) => {
    const powerMultiplier = 1 + (soldier.power * soldier.level) / 500;
    const isJackpot = Math.random() * 100 < mission.jackpotChance;
    const jackpotMult = isJackpot ? mission.jackpotMultiplier : 1;
    const reward = Math.floor(mission.baseReward * powerMultiplier * streakMultiplier * jackpotMult);
    setSoldiers(prev => prev.map(s =>
      s.id === soldier.id
        ? { ...s, missionStatus: 'grinding' as MissionStatus, missionEndTime: Date.now() + mission.duration * 1000, missionReward: reward }
        : s
    ));
    setDeployModal(null);
  };

  const claimReward = (soldierId: string) => {
    setSoldiers(prev => {
      const soldier = prev.find(s => s.id === soldierId);
      if (soldier && soldier.missionStatus === 'done') {
        const reward = soldier.missionReward || 0;
        const deployedMission = MISSIONS.find(m => m.baseReward <= reward) || MISSIONS[0];
        setRaidLog(log => [{
          id: `log-${Date.now()}`,
          soldierName: soldier.name,
          soldierEmoji: soldier.emoji,
          missionName: deployedMission.name,
          missionEmoji: deployedMission.emoji,
          reward,
          xp: 500,
          timestamp: Date.now(),
        }, ...log].slice(0, 50));
      }
      return prev;
    });
    setRaidStreak(prev => prev + 1);
    setSoldiers(prev => prev.map(s => {
      if (s.id !== soldierId || s.missionStatus !== 'done') return s;
      const reward = s.missionReward || 0;
      setTotalClaimed(c => c + reward);
      return {
        ...s,
        missionStatus: 'chilling' as MissionStatus,
        missionEndTime: null,
        missionReward: null,
        xp: s.xp + 500,
        totalLooted: s.totalLooted + reward,
        raidsCompleted: s.raidsCompleted + 1,
        level: s.xp + 500 >= XP_PER_LEVEL ? s.level + 1 : s.level,
      };
    }));
  };

  const levelUpSoldier = (soldierId: string) => {
    setSoldiers(prev => prev.map(s => {
      if (s.id !== soldierId) return s;
      const cost = LEVEL_UP_COST[Math.min(s.level, LEVEL_UP_COST.length - 1)];
      if (s.xp < cost) return s;
      return { ...s, level: s.level + 1, xp: s.xp - cost, power: s.power + Math.floor(s.power * 0.15) };
    }));
  };

  const toggleEquip = (soldierId: string) => {
    setSoldiers(prev => {
      const soldier = prev.find(s => s.id === soldierId);
      if (!soldier) return prev;
      if (!soldier.equipped && equippedCount >= 5) return prev;
      return prev.map(s => s.id === soldierId ? { ...s, equipped: !s.equipped } : s);
    });
  };

  const [canRecruit, setCanRecruit] = useState(true);

  useEffect(() => {
    if (lastRecruitTime === 0) return;
    setCanRecruit(false);
    const timer = setTimeout(() => setCanRecruit(true), RECRUIT_COOLDOWN_MS);
    return () => clearTimeout(timer);
  }, [lastRecruitTime]);

  const recruitSoldier = () => {
    if (!canRecruit) return;
    setLastRecruitTime(Date.now());
    setMinting(true);
    setTimeout(() => {
      const roll = Math.random() * 100;
      let cumulative = 0;
      let chosen = RECRUIT_CHANCES[0];
      for (const tier of RECRUIT_CHANCES) {
        cumulative += tier.chance;
        if (roll <= cumulative) { chosen = tier; break; }
      }
      const power = Math.floor(chosen.power[0] + Math.random() * (chosen.power[1] - chosen.power[0]));
      const emojis = SOLDIER_EMOJIS[chosen.rank];
      const names = SOLDIER_NAMES;
      const skills = SKILLS_POOL[chosen.rank];
      const numSkills = chosen.rank === 'Normie' ? 1 : chosen.rank === 'Degen' ? 2 : chosen.rank === 'Ape' ? 2 : 3;

      const newSoldier: Soldier = {
        id: `new-${Date.now()}`,
        name: `${names[Math.floor(Math.random() * names.length)]} #${Math.floor(Math.random() * 999)}`,
        rank: chosen.rank,
        power,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        skills: [...skills].sort(() => Math.random() - 0.5).slice(0, numSkills),
        acquiredAt: new Date().toISOString().split('T')[0],
        xp: 0,
        level: 1,
        equipped: false,
        missionStatus: 'chilling',
        missionEndTime: null,
        missionReward: null,
        totalLooted: 0,
        raidsCompleted: 0,
      };
      setSoldiers(prev => [...prev, newSoldier]);
      setMintResult(newSoldier);
      setMinting(false);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8 relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 blur-2xl rounded-full" />
        <div className="relative text-center">
          <div className="text-6xl mb-2">💩</div>
          <h1 className="text-4xl sm:text-5xl font-black mb-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent uppercase tracking-tight">
            SHIT ARMY
          </h1>
          <p className="text-zinc-500 text-sm uppercase tracking-widest">build your squad. raid the sewers. stack $SHIT or get rekt.</p>

          {/* Stats Row */}
          <div className="mt-5 inline-flex flex-wrap items-center gap-3 sm:gap-5 px-5 sm:px-8 py-4 bg-zinc-900/70 rounded-2xl border border-amber-500/20">
            <div className="text-left">
              <div className="text-[10px] text-amber-500/60 uppercase font-bold tracking-wider">DEGEN POWER</div>
              <div className="text-xl sm:text-2xl font-black text-amber-400">{squadPower.toLocaleString()} ⚡</div>
            </div>
            <div className="w-px h-10 bg-amber-500/20" />
            <div className="text-left">
              <div className="text-[10px] text-green-500/60 uppercase font-bold tracking-wider">OFFER BOOST</div>
              <div className="text-xl sm:text-2xl font-black text-green-400">+{offerwallBonus}%</div>
            </div>
            <div className="w-px h-10 bg-amber-500/20" />
            <div className="text-left">
              <div className="text-[10px] text-purple-500/60 uppercase font-bold tracking-wider">GRINDING</div>
              <div className="text-xl sm:text-2xl font-black text-purple-400">{deployedCount}/{soldiers.length}</div>
            </div>
            {completedCount > 0 && (
              <>
                <div className="w-px h-10 bg-amber-500/20" />
                <div className="text-left">
                  <div className="text-[10px] text-amber-500/60 uppercase font-bold tracking-wider">LOOT READY</div>
                  <div className="text-xl sm:text-2xl font-black text-amber-400 animate-pulse">{completedCount} 💰</div>
                </div>
              </>
            )}
          </div>

          {/* Earning Projections + Streak */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {dailyEstimate > 0 && (
              <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                <span className="text-[10px] text-green-500/70 uppercase font-bold tracking-wider">EST. DAILY LOOT </span>
                <span className="text-green-400 font-black">~{dailyEstimate.toLocaleString()} $SHIT</span>
                <span className="text-[10px] text-zinc-600 ml-1">(~{(dailyEstimate * 7).toLocaleString()}/week)</span>
              </div>
            )}

            {raidStreak > 0 && (
              <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <span className="text-amber-400 font-black">🔥 {raidStreak} RAID STREAK</span>
                {streakMultiplier > 1 && (
                  <span className="text-amber-300 font-black ml-2">{streakMultiplier}x BONUS</span>
                )}
                {nextStreakAt && (
                  <span className="text-[10px] text-zinc-500 ml-2">next: {nextStreakAt} raids → {nextStreakMult}x</span>
                )}
              </div>
            )}
          </div>

          {totalClaimed > 0 && (
            <div className="mt-3 text-sm text-green-400 font-black uppercase tracking-wider">
              looted this session: +{totalClaimed.toLocaleString()} $SHIT 🔥
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {([
          { id: 'army' as const, label: `MY DEGENS (${soldiers.length})`, icon: '💩' },
          { id: 'missions' as const, label: 'RAID', icon: '⚔️' },
          { id: 'recruit' as const, label: 'MINT NEW', icon: '🎰' },
          { id: 'log' as const, label: `RAID LOG (${raidLog.length})`, icon: '📜' },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-5 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/30'
                : 'bg-zinc-800/50 text-zinc-500 hover:text-amber-400 border border-white/5 hover:border-amber-500/30'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* MY DEGENS TAB */}
      {activeTab === 'army' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {soldiers.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                icon="⚔️"
                title="NO SOLDIERS YET"
                description="recruit your first degen soldier to start raiding sewers and earning passive $SHIT."
                action={{ label: '💩 RECRUIT NOW', onClick: () => setActiveTab('recruit') }}
              />
            </div>
          )}
          {soldiers.map((s) => {
            const isGrinding = s.missionStatus === 'grinding';
            const isDone = s.missionStatus === 'done';
            const canLevelUp = s.xp >= LEVEL_UP_COST[Math.min(s.level, LEVEL_UP_COST.length - 1)];

            return (
              <div
                key={s.id}
                className={`group relative p-5 rounded-2xl border-2 transition-all ${
                  isDone ? 'border-amber-500 bg-amber-500/5' :
                  isGrinding ? 'border-purple-500/50 bg-purple-500/5 opacity-80' :
                  s.equipped ? `${RANK_BORDER[s.rank]} bg-zinc-900/50` :
                  'border-white/5 bg-zinc-900/20 opacity-60'
                }`}
              >
                <div className={`absolute -inset-px bg-gradient-to-r ${RANK_COLORS[s.rank]} opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity blur-xl`} />

                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${RANK_COLORS[s.rank]} flex items-center justify-center text-3xl shadow-lg`}>
                      {s.emoji}
                    </div>
                    <div className="text-right space-y-1">
                      <div className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${RANK_COLORS[s.rank]} text-white`}>
                        {s.rank}
                      </div>
                      {s.equipped && <div className="text-amber-400 text-[10px] font-black uppercase">⚡ ACTIVE</div>}
                    </div>
                  </div>

                  <h3 className="font-black text-sm mb-1 uppercase tracking-wide">{s.name}</h3>

                  <div className="flex items-center gap-3 text-xs mb-2">
                    <span className="text-amber-400 font-bold">LVL {s.level}</span>
                    <span className="text-purple-400 font-bold">{s.power} PWR</span>
                    <span className="text-zinc-600">{s.raidsCompleted} raids</span>
                  </div>

                  {/* XP + Next Level */}
                  <div className="mb-2">
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-zinc-600 uppercase">LVL {s.level} → {s.level + 1}</span>
                      <span className="text-zinc-500">{s.xp}/{XP_PER_LEVEL} XP</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${RANK_COLORS[s.rank]} rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, (s.xp / XP_PER_LEVEL) * 100)}%` }} />
                    </div>
                    <div className="text-[10px] text-zinc-600 mt-0.5">
                      next level: +{Math.floor(s.power * 0.15)} PWR · better missions
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-600 mb-2">
                    <span>looted: <span className="text-amber-400 font-bold">{s.totalLooted.toLocaleString()} $SHIT</span></span>
                    <span>{s.raidsCompleted} raids</span>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {s.skills.map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 bg-zinc-800/80 rounded text-[10px] text-zinc-400 font-bold">{skill}</span>
                    ))}
                  </div>

                  {/* Mission Status */}
                  {isGrinding && s.missionEndTime && (
                    <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-center mb-3">
                      <div className="text-[10px] text-purple-400 uppercase font-black tracking-widest">GRINDING...</div>
                      <div className="text-xl font-black text-white font-mono">{formatCountdown(s.missionEndTime)}</div>
                      <div className="text-[10px] text-zinc-500">incoming: +{s.missionReward?.toLocaleString()} $SHIT</div>
                    </div>
                  )}
                  {isDone && (
                    <button
                      onClick={() => claimReward(s.id)}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-xl font-black text-sm uppercase tracking-wider hover:scale-105 transition-transform shadow-lg shadow-amber-500/30 mb-3 animate-pulse"
                    >
                      💰 CLAIM +{s.missionReward?.toLocaleString()} $SHIT
                    </button>
                  )}

                  {/* Actions */}
                  {s.missionStatus === 'chilling' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedSoldier(s); setActiveTab('missions'); }}
                        className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-xs font-black uppercase tracking-wider hover:scale-105 transition-transform"
                      >
                        ⚔️ RAID
                      </button>
                      <button
                        onClick={() => toggleEquip(s.id)}
                        className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold"
                        title={s.equipped ? 'Bench' : 'Deploy'}
                      >
                        {s.equipped ? '📤' : '📥'}
                      </button>
                      {canLevelUp && (
                        <button
                          onClick={() => levelUpSoldier(s.id)}
                          className="py-2 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-xl text-xs font-black animate-pulse"
                          title="LEVEL UP"
                        >
                          ⬆️ LVL UP
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Recruit slot */}
          <button
            onClick={() => setActiveTab('recruit')}
            className="group p-5 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-amber-500/50 bg-zinc-900/20 hover:bg-amber-500/5 transition-all min-h-[200px] flex flex-col items-center justify-center gap-3"
          >
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 group-hover:bg-amber-500/20 flex items-center justify-center text-3xl transition-colors">🎰</div>
            <div className="text-zinc-600 group-hover:text-amber-400 font-black text-sm uppercase tracking-wider transition-colors">MINT A DEGEN</div>
            <div className="text-[10px] text-zinc-700">{RECRUIT_COST} $SHIT per pull</div>
          </button>
        </div>
      )}

      {/* RAID TAB */}
      {activeTab === 'missions' && (
        <div className="space-y-4">
          {selectedSoldier && (
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center gap-4 mb-2">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${RANK_COLORS[selectedSoldier.rank]} flex items-center justify-center text-2xl`}>
                {selectedSoldier.emoji}
              </div>
              <div className="flex-1">
                <div className="font-black text-sm uppercase">{selectedSoldier.name}</div>
                <div className="text-xs text-zinc-500">LVL {selectedSoldier.level} | {selectedSoldier.power} PWR | {selectedSoldier.rank}</div>
              </div>
              <button onClick={() => setSelectedSoldier(null)} className="text-xs text-zinc-600 hover:text-amber-400 font-bold uppercase">swap ✕</button>
            </div>
          )}

          {!selectedSoldier && (
            <div className="p-6 bg-zinc-800/30 rounded-2xl border border-white/5 text-center mb-2">
              <div className="text-zinc-500 mb-3 text-sm uppercase font-bold tracking-wider">pick your degen</div>
              <div className="flex flex-wrap justify-center gap-2">
                {soldiers.filter(s => s.missionStatus === 'chilling').map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSoldier(s)}
                    className={`p-3 rounded-xl border-2 ${RANK_BORDER[s.rank]} bg-zinc-900/50 hover:scale-110 transition-transform`}
                  >
                    <span className="text-2xl">{s.emoji}</span>
                    <div className="text-[10px] font-black mt-1 uppercase">{s.name.split(' ')[0]}</div>
                    <div className="text-[10px] text-zinc-600">LVL {s.level}</div>
                  </button>
                ))}
                {soldiers.filter(s => s.missionStatus === 'chilling').length === 0 && (
                  <div className="text-zinc-600 text-sm">all your degens are grinding rn 💀</div>
                )}
              </div>
            </div>
          )}

          {MISSIONS.map((mission) => {
            const soldier = selectedSoldier;
            const meetsReqs = soldier ? soldier.power >= mission.requirements.minPower && soldier.level >= mission.requirements.minLevel : false;
            const powerMultiplier = soldier ? 1 + (soldier.power * soldier.level) / 500 : 1;
            const estimatedReward = Math.floor(mission.baseReward * powerMultiplier * streakMultiplier);
            const jackpotReward = Math.floor(estimatedReward * mission.jackpotMultiplier);
            const isLocked = soldier && !meetsReqs;
            const needsPower = soldier && soldier.power < mission.requirements.minPower;
            const needsLevel = soldier && soldier.level < mission.requirements.minLevel;

            return (
              <div
                key={mission.id}
                className={`p-5 rounded-2xl border transition-all ${
                  meetsReqs && soldier
                    ? 'bg-zinc-900/50 border-amber-500/30 hover:border-amber-500/60'
                    : isLocked
                    ? 'bg-zinc-900/30 border-white/5'
                    : 'bg-zinc-900/20 border-white/5 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${
                    meetsReqs && soldier ? 'bg-zinc-800' : 'bg-zinc-800/50'
                  }`}>
                    {mission.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className={`font-black uppercase tracking-wide ${isLocked ? 'text-zinc-500' : ''}`}>{mission.name}</h3>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${DIFFICULTY_COLORS[mission.difficulty]}`}>
                        {mission.difficulty}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase text-yellow-400 bg-yellow-500/10">
                        🎰 {mission.jackpotChance}% JACKPOT
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-600 italic mb-2">&quot;{mission.flavorText}&quot;</div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                      <span>⏱️ {mission.durationLabel}</span>
                      <span className="text-amber-400 font-bold">💰 {soldier ? `~${estimatedReward.toLocaleString()}` : `${mission.baseReward}+`} $SHIT</span>
                      {soldier && meetsReqs && (
                        <span className="text-yellow-400 font-bold">🎰 up to {jackpotReward.toLocaleString()}</span>
                      )}
                      <span>⚡ {mission.requirements.minPower}+ PWR</span>
                      <span>LVL {mission.requirements.minLevel}+</span>
                    </div>

                    {/* Locked: show what to do + what you'll earn */}
                    {isLocked && (
                      <div className="mt-2 p-2 bg-zinc-800/30 rounded-lg border border-white/5">
                        <div className="text-[10px] text-red-400 font-bold uppercase mb-1">
                          {needsPower && `need ${mission.requirements.minPower} PWR (you have ${soldier.power})`}
                          {needsPower && needsLevel && ' · '}
                          {needsLevel && `need LVL ${mission.requirements.minLevel} (you're ${soldier.level})`}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          unlock this to earn <span className="text-amber-400 font-bold">~{Math.floor(mission.baseReward * 1.5).toLocaleString()}-{Math.floor(mission.baseReward * 3).toLocaleString()} $SHIT</span> per run
                          {mission.jackpotChance >= 10 && <span className="text-yellow-400"> · high jackpot chance!</span>}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    disabled={!meetsReqs || !soldier}
                    onClick={() => { if (soldier && meetsReqs) setDeployModal({ soldier, mission }); }}
                    className={`px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all flex-shrink-0 ${
                      meetsReqs && soldier
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:scale-105 shadow-lg shadow-amber-500/30'
                        : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    {meetsReqs && soldier ? '⚔️ SEND IT' : '🔒 NGMI'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MINT TAB */}
      {activeTab === 'recruit' && (
        <div className="max-w-md mx-auto text-center">
          <div className="bg-zinc-900/70 rounded-3xl p-8 border border-amber-500/20">
            <div className="text-6xl mb-3">🎰</div>
            <h2 className="text-2xl font-black uppercase tracking-wider mb-1">MINT A DEGEN</h2>
            <p className="text-zinc-600 text-sm mb-6 uppercase tracking-wider">ape into the gacha. no refunds ser.</p>

            <div className="space-y-2 mb-6 text-left">
              {RECRUIT_CHANCES.map((r) => (
                <div key={r.rank} className="flex items-center gap-3 p-2 bg-zinc-800/30 rounded-lg">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${RANK_COLORS[r.rank]}`} />
                  <span className="flex-1 text-sm font-bold uppercase">{r.rank}</span>
                  <span className="text-zinc-500 text-sm font-mono">{r.chance}%</span>
                  <span className="text-zinc-600 text-[10px]">{r.power[0]}-{r.power[1]} PWR</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 mb-6">
              <button onClick={() => setRecruitCount(Math.max(1, recruitCount - 1))} className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-black text-lg">-</button>
              <div className="text-3xl font-black w-16">{recruitCount}</div>
              <button onClick={() => setRecruitCount(Math.min(10, recruitCount + 1))} className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-black text-lg">+</button>
            </div>

            <button
              onClick={recruitSoldier}
              disabled={minting || !canRecruit}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-black text-lg uppercase tracking-wider hover:scale-105 transition-transform shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:hover:scale-100"
            >
              {minting ? <span className="animate-pulse">🎲 SUMMONING...</span> : !canRecruit ? 'COOLDOWN SER...' : `APE IN ${recruitCount}x — ${(recruitCount * RECRUIT_COST).toLocaleString()} $SHIT`}
            </button>

            <div className="mt-3 text-[10px] text-zinc-700 uppercase">0.1% chance of GigaChad. do you feel lucky punk?</div>
          </div>
        </div>
      )}

      {/* RAID LOG TAB */}
      {activeTab === 'log' && (
        <div>
          {raidLog.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📜</div>
              <div className="text-xl font-black uppercase tracking-wider text-zinc-500">NO RAIDS YET</div>
              <div className="text-sm text-zinc-600 mt-2">send your degens on missions first. history will appear here.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {raidLog.map((entry) => (
                <div key={entry.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${
                  entry.isJackpot
                    ? 'bg-yellow-500/5 border-yellow-500/30'
                    : 'bg-zinc-900/50 border-white/5 hover:border-amber-500/20'
                }`}>
                  <div className="text-3xl">{entry.soldierEmoji}</div>
                  <div className="flex-1">
                    <div className="font-black text-sm uppercase">
                      {entry.soldierName}
                      {entry.isJackpot && <span className="text-yellow-400 ml-2">🎰 JACKPOT!</span>}
                    </div>
                    <div className="text-xs text-zinc-500">{entry.missionEmoji} {entry.missionName}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-black ${entry.isJackpot ? 'text-yellow-400' : 'text-amber-400'}`}>+{entry.reward.toLocaleString()} $SHIT</div>
                    <div className="text-xs text-purple-400">+{entry.xp} XP</div>
                  </div>
                  <div className="text-xs text-zinc-600 w-16 text-right">
                    {(() => {
                      const ago = Date.now() - entry.timestamp;
                      if (ago < 60000) return 'just now';
                      if (ago < 3600000) return `${Math.floor(ago / 60000)}m ago`;
                      return `${Math.floor(ago / 3600000)}h ago`;
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Deploy Confirm */}
      {deployModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl max-w-md w-full border border-amber-500/20 p-6">
            <h2 className="text-xl font-black mb-4 text-center uppercase tracking-wider">⚔️ CONFIRM RAID</h2>

            <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-2xl mb-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${RANK_COLORS[deployModal.soldier.rank]} flex items-center justify-center text-3xl`}>
                {deployModal.soldier.emoji}
              </div>
              <div>
                <div className="font-black uppercase text-sm">{deployModal.soldier.name}</div>
                <div className="text-xs text-zinc-500">LVL {deployModal.soldier.level} | {deployModal.soldier.power} PWR | {deployModal.soldier.rank}</div>
              </div>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Target</span>
                <span className="font-black uppercase">{deployModal.mission.emoji} {deployModal.mission.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Duration</span>
                <span className="font-bold">{deployModal.mission.durationLabel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Est. Loot</span>
                <span className="font-black text-amber-400">
                  ~{Math.floor(deployModal.mission.baseReward * (1 + (deployModal.soldier.power * deployModal.soldier.level) / 500) * streakMultiplier).toLocaleString()} $SHIT
                </span>
              </div>
              {streakMultiplier > 1 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Streak Bonus</span>
                  <span className="font-black text-amber-300">🔥 {streakMultiplier}x</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Jackpot Chance</span>
                <span className="font-black text-yellow-400">🎰 {deployModal.mission.jackpotChance}% ({deployModal.mission.jackpotMultiplier}x loot)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">XP</span>
                <span className="font-bold text-purple-400">+{deployModal.mission.xpReward}</span>
              </div>
            </div>

            <div className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-xl mb-4 text-center">
              <div className="text-[10px] text-yellow-400 font-bold uppercase">🎰 JACKPOT POTENTIAL</div>
              <div className="text-lg font-black text-yellow-400">
                up to {Math.floor(deployModal.mission.baseReward * (1 + (deployModal.soldier.power * deployModal.soldier.level) / 500) * streakMultiplier * deployModal.mission.jackpotMultiplier).toLocaleString()} $SHIT
              </div>
            </div>

            <div className="text-[10px] text-zinc-600 text-center mb-4 uppercase tracking-wider">
              degen will be busy grinding. no early recall.
            </div>

            <div className="flex gap-3">
              <button onClick={() => setDeployModal(null)} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-bold uppercase text-sm">
                NAH
              </button>
              <button
                onClick={() => deployOnMission(deployModal.soldier, deployModal.mission)}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-black uppercase tracking-wider hover:scale-105 transition-transform shadow-lg shadow-amber-500/30"
              >
                ⚔️ SEND IT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mint Result */}
      {mintResult && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl max-w-md w-full border border-amber-500/20 p-6 text-center">
            <div className="text-[10px] text-amber-500/60 uppercase tracking-[0.3em] mb-3">YOU PULLED A...</div>
            <div className={`w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br ${RANK_COLORS[mintResult.rank]} flex items-center justify-center text-6xl mb-4 shadow-2xl`}>
              {mintResult.emoji}
            </div>
            <div className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r ${RANK_COLORS[mintResult.rank]} text-white mb-2`}>
              {mintResult.rank}
            </div>
            <h2 className="text-2xl font-black uppercase tracking-wide mb-1">{mintResult.name}</h2>
            <div className="text-zinc-500 text-sm mb-4">⚡ {mintResult.power} PWR | LVL {mintResult.level}</div>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {mintResult.skills.map((s, i) => (
                <span key={i} className="px-3 py-1 bg-zinc-800 rounded-lg text-xs font-bold">{s}</span>
              ))}
            </div>
            <button
              onClick={() => setMintResult(null)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-black uppercase tracking-wider hover:scale-105 transition-transform"
            >
              {mintResult.rank === 'GigaChad' || mintResult.rank === 'Whale' ? 'HOLY SHIT LFG 🔥' : 'ADD TO SQUAD'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
