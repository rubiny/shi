'use client';

import React, { useState, useEffect, useCallback } from 'react';

type SoldierRank = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
type MissionStatus = 'idle' | 'deployed' | 'completed';
type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Extreme';

interface Soldier {
  id: string;
  name: string;
  rank: SoldierRank;
  power: number;
  emoji: string;
  abilities: string[];
  acquiredAt: string;
  xp: number;
  level: number;
  equipped: boolean;
  missionStatus: MissionStatus;
  missionEndTime: number | null;
  missionReward: number | null;
  totalEarned: number;
  missionsCompleted: number;
}

interface Mission {
  id: string;
  name: string;
  difficulty: Difficulty;
  baseReward: number;
  duration: number; // seconds
  durationLabel: string;
  requirements: { minPower: number; minLevel: number };
  emoji: string;
  xpReward: number;
}

const INITIAL_SOLDIERS: Soldier[] = [
  { id: '1', name: 'Poop Soldier #001', rank: 'Rare', power: 52, emoji: '💩', abilities: ['Stink Bomb', 'Stealth'], acquiredAt: '2026-05-20', xp: 1200, level: 3, equipped: true, missionStatus: 'idle', missionEndTime: null, missionReward: null, totalEarned: 2400, missionsCompleted: 8 },
  { id: '2', name: 'Toilet Warrior #042', rank: 'Epic', power: 78, emoji: '🚽', abilities: ['Flush Attack', 'Water Cannon', 'Plunge Strike'], acquiredAt: '2026-05-22', xp: 2800, level: 5, equipped: true, missionStatus: 'idle', missionEndTime: null, missionReward: null, totalEarned: 6800, missionsCompleted: 15 },
  { id: '3', name: 'Paper Ninja #069', rank: 'Uncommon', power: 35, emoji: '🧻', abilities: ['Paper Cut', 'Roll Out'], acquiredAt: '2026-05-23', xp: 450, level: 2, equipped: false, missionStatus: 'idle', missionEndTime: null, missionReward: null, totalEarned: 600, missionsCompleted: 3 },
  { id: '4', name: 'Golden Throne #001', rank: 'Legendary', power: 150, emoji: '👑', abilities: ['Royal Flush', 'Golden Shower', 'Throne Power'], acquiredAt: '2026-05-24', xp: 500, level: 1, equipped: true, missionStatus: 'idle', missionEndTime: null, missionReward: null, totalEarned: 0, missionsCompleted: 0 },
];

const MISSIONS: Mission[] = [
  { id: 'sewer', name: 'Sewer Patrol', difficulty: 'Easy', baseReward: 50, duration: 60, durationLabel: '1 min', requirements: { minPower: 10, minLevel: 1 }, emoji: '🕳️', xpReward: 100 },
  { id: 'restroom', name: 'Restroom Takeover', difficulty: 'Medium', baseReward: 200, duration: 300, durationLabel: '5 min', requirements: { minPower: 40, minLevel: 2 }, emoji: '🚻', xpReward: 250 },
  { id: 'septic', name: 'Septic Tank Heist', difficulty: 'Hard', baseReward: 800, duration: 900, durationLabel: '15 min', requirements: { minPower: 80, minLevel: 4 }, emoji: '🏭', xpReward: 600 },
  { id: 'flush', name: 'The Great Flush', difficulty: 'Extreme', baseReward: 3000, duration: 3600, durationLabel: '1 hour', requirements: { minPower: 150, minLevel: 6 }, emoji: '🌊', xpReward: 1500 },
];

const RANK_COLORS: Record<SoldierRank, string> = {
  Common: 'from-zinc-600 to-zinc-500',
  Uncommon: 'from-green-600 to-green-500',
  Rare: 'from-blue-600 to-cyan-500',
  Epic: 'from-purple-600 to-pink-500',
  Legendary: 'from-amber-500 via-orange-500 to-red-500',
  Mythic: 'from-pink-600 via-purple-500 to-blue-500',
};

const RANK_BORDER: Record<SoldierRank, string> = {
  Common: 'border-zinc-600',
  Uncommon: 'border-green-500',
  Rare: 'border-blue-500',
  Epic: 'border-purple-500',
  Legendary: 'border-amber-500',
  Mythic: 'border-pink-500',
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Easy: 'text-green-400 bg-green-500/10',
  Medium: 'text-amber-400 bg-amber-500/10',
  Hard: 'text-orange-400 bg-orange-500/10',
  Extreme: 'text-red-400 bg-red-500/10',
};

const LEVEL_UP_COST = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 15000, 30000];
const XP_PER_LEVEL = 5000;

const RECRUIT_COST = 500;
const RECRUIT_CHANCES: { rank: SoldierRank; chance: number; power: [number, number] }[] = [
  { rank: 'Common', chance: 50, power: [10, 25] },
  { rank: 'Uncommon', chance: 30, power: [25, 45] },
  { rank: 'Rare', chance: 15, power: [45, 70] },
  { rank: 'Epic', chance: 4, power: [70, 100] },
  { rank: 'Legendary', chance: 0.9, power: [100, 200] },
  { rank: 'Mythic', chance: 0.1, power: [200, 500] },
];

const SOLDIER_NAMES = ['Poop Trooper', 'Toilet Raider', 'Flush Phantom', 'Sewage Knight', 'Drain Drake', 'Manhole Marauder', 'Plunger Paladin', 'Bidet Berserker'];
const SOLDIER_EMOJIS: Record<SoldierRank, string[]> = {
  Common: ['💩', '🪣'],
  Uncommon: ['🧻', '🧽'],
  Rare: ['🚽', '🔧'],
  Epic: ['🥷', '🤖'],
  Legendary: ['👑', '💎'],
  Mythic: ['🏆', '🌟'],
};
const ABILITIES_POOL: Record<SoldierRank, string[]> = {
  Common: ['Stink', 'Splat'],
  Uncommon: ['Paper Cut', 'Roll Out', 'Scrub'],
  Rare: ['Flush Attack', 'Stealth', 'Water Cannon'],
  Epic: ['Hack Flush', 'Silent Kill', 'Plunge Strike'],
  Legendary: ['Royal Flush', 'Diamond Rain', 'Golden Touch'],
  Mythic: ['Legendary Stink', 'Toilet Throne', 'Mythic Blast'],
};

export default function Army({ userId: _userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<'army' | 'missions' | 'recruit'>('army');
  const [soldiers, setSoldiers] = useState<Soldier[]>(INITIAL_SOLDIERS);
  const [selectedSoldier, setSelectedSoldier] = useState<Soldier | null>(null);
  const [deployModal, setDeployModal] = useState<{ soldier: Soldier; mission: Mission } | null>(null);
  const [minting, setMinting] = useState(false);
  const [mintResult, setMintResult] = useState<Soldier | null>(null);
  const [recruitCount, setRecruitCount] = useState(1);
  const [, setTick] = useState(0);
  const [totalClaimed, setTotalClaimed] = useState(0);

  // Timer tick for mission countdowns + auto-complete
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
      setSoldiers(prev => {
        const now = Date.now();
        const hasCompleted = prev.some(s => s.missionStatus === 'deployed' && s.missionEndTime && s.missionEndTime <= now);
        if (!hasCompleted) return prev;
        return prev.map(s =>
          s.missionStatus === 'deployed' && s.missionEndTime && s.missionEndTime <= now
            ? { ...s, missionStatus: 'completed' as MissionStatus }
            : s
        );
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const squadPower = soldiers.filter(s => s.equipped).reduce((sum, s) => sum + s.power * s.level, 0);
  const equippedCount = soldiers.filter(s => s.equipped).length;
  const offerwallBonus = Math.floor(squadPower / 100);
  const deployedCount = soldiers.filter(s => s.missionStatus === 'deployed').length;
  const completedCount = soldiers.filter(s => s.missionStatus === 'completed').length;

  const formatCountdown = useCallback((endTime: number) => {
    const diff = Math.max(0, endTime - Date.now());
    if (diff <= 0) return 'DONE';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }, []);

  const deployOnMission = (soldier: Soldier, mission: Mission) => {
    const powerMultiplier = 1 + (soldier.power * soldier.level) / 500;
    const reward = Math.floor(mission.baseReward * powerMultiplier);

    setSoldiers(prev => prev.map(s =>
      s.id === soldier.id
        ? { ...s, missionStatus: 'deployed' as MissionStatus, missionEndTime: Date.now() + mission.duration * 1000, missionReward: reward }
        : s
    ));
    setDeployModal(null);
  };

  const claimReward = (soldierId: string) => {
    setSoldiers(prev => prev.map(s => {
      if (s.id !== soldierId || s.missionStatus !== 'completed') return s;
      const reward = s.missionReward || 0;
      setTotalClaimed(c => c + reward);
      return {
        ...s,
        missionStatus: 'idle' as MissionStatus,
        missionEndTime: null,
        missionReward: null,
        xp: s.xp + 500,
        totalEarned: s.totalEarned + reward,
        missionsCompleted: s.missionsCompleted + 1,
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

  const recruitSoldier = () => {
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
      const abilities = ABILITIES_POOL[chosen.rank];
      const numAbilities = chosen.rank === 'Common' ? 1 : chosen.rank === 'Uncommon' ? 2 : chosen.rank === 'Rare' ? 2 : 3;

      const newSoldier: Soldier = {
        id: `new-${Date.now()}`,
        name: `${names[Math.floor(Math.random() * names.length)]} #${Math.floor(Math.random() * 999)}`,
        rank: chosen.rank,
        power,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        abilities: abilities.sort(() => Math.random() - 0.5).slice(0, numAbilities),
        acquiredAt: new Date().toISOString().split('T')[0],
        xp: 0,
        level: 1,
        equipped: false,
        missionStatus: 'idle',
        missionEndTime: null,
        missionReward: null,
        totalEarned: 0,
        missionsCompleted: 0,
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
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-amber-500/20 blur-2xl rounded-full" />
        <div className="relative text-center">
          <div className="text-6xl mb-2">🪖</div>
          <h1 className="text-4xl sm:text-5xl font-black mb-2 bg-gradient-to-r from-purple-400 via-pink-500 to-amber-500 bg-clip-text text-transparent">
            My Army
          </h1>
          <p className="text-zinc-400">Deploy soldiers on missions. Earn $SHIT passively. Level up your squad.</p>

          {/* Stats Bar */}
          <div className="mt-4 inline-flex flex-wrap items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 bg-zinc-900/50 rounded-2xl border border-white/10">
            <div className="text-left">
              <div className="text-[10px] text-zinc-500 uppercase">Squad Power</div>
              <div className="text-lg sm:text-2xl font-black text-amber-400">{squadPower.toLocaleString()} ⚡</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-left">
              <div className="text-[10px] text-zinc-500 uppercase">Offerwall Bonus</div>
              <div className="text-lg sm:text-2xl font-black text-green-400">+{offerwallBonus}%</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-left">
              <div className="text-[10px] text-zinc-500 uppercase">Deployed</div>
              <div className="text-lg sm:text-2xl font-black text-purple-400">{deployedCount} / {soldiers.length}</div>
            </div>
            {completedCount > 0 && (
              <>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-left">
                  <div className="text-[10px] text-zinc-500 uppercase">Ready to Claim</div>
                  <div className="text-lg sm:text-2xl font-black text-amber-400 animate-pulse">{completedCount} 🎁</div>
                </div>
              </>
            )}
          </div>

          {totalClaimed > 0 && (
            <div className="mt-2 text-sm text-green-400 font-bold">
              Total claimed this session: +{totalClaimed.toLocaleString()} $SHIT
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {([
          { id: 'army' as const, label: `My Squad (${soldiers.length})`, icon: '🪖' },
          { id: 'missions' as const, label: 'Deploy', icon: '🎯' },
          { id: 'recruit' as const, label: 'Recruit', icon: '➕' },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-5 py-3 rounded-2xl font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg'
                : 'bg-zinc-800/50 text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* MY SQUAD TAB */}
      {activeTab === 'army' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {soldiers.map((s) => {
            const isDeployed = s.missionStatus === 'deployed';
            const isCompleted = s.missionStatus === 'completed';
            const canLevelUp = s.xp >= LEVEL_UP_COST[Math.min(s.level, LEVEL_UP_COST.length - 1)];

            return (
              <div
                key={s.id}
                className={`group relative p-5 rounded-2xl border-2 transition-all ${
                  isCompleted ? 'border-amber-500 bg-amber-500/5 animate-pulse' :
                  isDeployed ? 'border-purple-500/50 bg-purple-500/5 opacity-80' :
                  s.equipped ? `${RANK_BORDER[s.rank]} bg-zinc-900/50` :
                  'border-white/10 bg-zinc-900/20 opacity-70'
                }`}
              >
                <div className={`absolute -inset-px bg-gradient-to-r ${RANK_COLORS[s.rank]} opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity blur-xl`} />

                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${RANK_COLORS[s.rank]} flex items-center justify-center text-3xl shadow-lg`}>
                      {s.emoji}
                    </div>
                    <div className="text-right space-y-1">
                      <div className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gradient-to-r ${RANK_COLORS[s.rank]} text-white`}>
                        {s.rank}
                      </div>
                      {s.equipped && <div className="text-amber-400 text-[10px] font-bold">⚡ EQUIPPED</div>}
                    </div>
                  </div>

                  <h3 className="font-bold text-sm mb-1">{s.name}</h3>

                  <div className="flex items-center gap-3 text-xs mb-2">
                    <span className="text-amber-400 font-bold">⭐ Lvl {s.level}</span>
                    <span className="text-purple-400 font-bold">⚡ {s.power} PWR</span>
                    <span className="text-zinc-500">{s.missionsCompleted} missions</span>
                  </div>

                  {/* XP bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-zinc-500">XP</span>
                      <span className="text-zinc-400">{s.xp}/{XP_PER_LEVEL}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${RANK_COLORS[s.rank]} rounded-full`} style={{ width: `${Math.min(100, (s.xp / XP_PER_LEVEL) * 100)}%` }} />
                    </div>
                  </div>

                  {/* Earnings */}
                  <div className="text-[10px] text-zinc-500 mb-3">
                    Lifetime earned: <span className="text-amber-400 font-bold">{s.totalEarned.toLocaleString()} $SHIT</span>
                  </div>

                  {/* Status */}
                  {isDeployed && s.missionEndTime && (
                    <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-xl text-center mb-3">
                      <div className="text-[10px] text-purple-400 uppercase font-bold">On Mission</div>
                      <div className="text-lg font-black text-white">{formatCountdown(s.missionEndTime)}</div>
                      <div className="text-[10px] text-zinc-500">+{s.missionReward?.toLocaleString()} $SHIT</div>
                    </div>
                  )}
                  {isCompleted && (
                    <button
                      onClick={() => claimReward(s.id)}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-xl font-black text-sm hover:scale-105 transition-transform shadow-lg shadow-amber-500/20 mb-3"
                    >
                      🎁 CLAIM +{s.missionReward?.toLocaleString()} $SHIT
                    </button>
                  )}

                  {/* Actions */}
                  {s.missionStatus === 'idle' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedSoldier(s); setActiveTab('missions'); }}
                        className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-xs font-bold hover:scale-105 transition-transform"
                      >
                        🎯 Deploy
                      </button>
                      <button
                        onClick={() => toggleEquip(s.id)}
                        className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold"
                      >
                        {s.equipped ? '📤' : '📥'}
                      </button>
                      {canLevelUp && (
                        <button
                          onClick={() => levelUpSoldier(s.id)}
                          className="py-2 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-xl text-xs font-bold"
                        >
                          ⬆️
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
            className="group p-5 rounded-2xl border-2 border-dashed border-zinc-700 hover:border-amber-500/50 bg-zinc-900/20 hover:bg-zinc-900/40 transition-all min-h-[200px] flex flex-col items-center justify-center gap-3"
          >
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 group-hover:bg-amber-500/20 flex items-center justify-center text-3xl transition-colors">➕</div>
            <div className="text-zinc-500 group-hover:text-amber-400 font-bold text-sm transition-colors">Recruit New Soldier</div>
            <div className="text-xs text-zinc-600">{RECRUIT_COST} $SHIT per recruit</div>
          </button>
        </div>
      )}

      {/* MISSIONS / DEPLOY TAB */}
      {activeTab === 'missions' && (
        <div className="space-y-4">
          {selectedSoldier && (
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${RANK_COLORS[selectedSoldier.rank]} flex items-center justify-center text-2xl`}>
                {selectedSoldier.emoji}
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm">{selectedSoldier.name}</div>
                <div className="text-xs text-zinc-400">Lvl {selectedSoldier.level} • {selectedSoldier.power} PWR</div>
              </div>
              <button onClick={() => setSelectedSoldier(null)} className="text-xs text-zinc-500 hover:text-white">Change ✕</button>
            </div>
          )}

          {!selectedSoldier && (
            <div className="p-6 bg-zinc-800/30 rounded-2xl border border-white/10 text-center mb-4">
              <div className="text-zinc-400 mb-2">Select a soldier to deploy</div>
              <div className="flex flex-wrap justify-center gap-2">
                {soldiers.filter(s => s.missionStatus === 'idle').map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSoldier(s)}
                    className={`p-3 rounded-xl border ${RANK_BORDER[s.rank]} bg-zinc-900/50 hover:scale-105 transition-transform`}
                  >
                    <span className="text-2xl">{s.emoji}</span>
                    <div className="text-[10px] font-bold mt-1">{s.name.split(' ')[0]}</div>
                    <div className="text-[10px] text-zinc-500">Lvl {s.level}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {MISSIONS.map((mission) => {
            const soldier = selectedSoldier;
            const meetsReqs = soldier ? soldier.power >= mission.requirements.minPower && soldier.level >= mission.requirements.minLevel : false;
            const powerMultiplier = soldier ? 1 + (soldier.power * soldier.level) / 500 : 1;
            const estimatedReward = Math.floor(mission.baseReward * powerMultiplier);

            return (
              <div
                key={mission.id}
                className={`p-5 rounded-2xl border transition-all ${
                  meetsReqs && soldier
                    ? 'bg-zinc-900/50 border-amber-500/30 hover:border-amber-500/60 cursor-pointer'
                    : 'bg-zinc-900/20 border-white/5 opacity-50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-3xl flex-shrink-0">
                    {mission.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold">{mission.name}</h3>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${DIFFICULTY_COLORS[mission.difficulty]}`}>
                        {mission.difficulty}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                      <span>⏱️ {mission.durationLabel}</span>
                      <span>💰 {soldier ? `${estimatedReward.toLocaleString()} $SHIT` : `${mission.baseReward}+ $SHIT`}</span>
                      <span>⚡ {mission.requirements.minPower} PWR min</span>
                      <span>⭐ Lvl {mission.requirements.minLevel}+</span>
                      <span>📊 +{mission.xpReward} XP</span>
                    </div>
                    {soldier && !meetsReqs && (
                      <div className="text-[10px] text-red-400 mt-1">
                        {soldier.power < mission.requirements.minPower && `Needs ${mission.requirements.minPower} PWR (has ${soldier.power})`}
                        {soldier.level < mission.requirements.minLevel && ` Needs Lvl ${mission.requirements.minLevel} (is Lvl ${soldier.level})`}
                      </div>
                    )}
                  </div>

                  <button
                    disabled={!meetsReqs || !soldier}
                    onClick={() => { if (soldier && meetsReqs) setDeployModal({ soldier, mission }); }}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex-shrink-0 ${
                      meetsReqs && soldier
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:scale-105 shadow-lg shadow-amber-500/20'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    {meetsReqs && soldier ? '🚀 DEPLOY' : '🔒 LOCKED'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RECRUIT TAB */}
      {activeTab === 'recruit' && (
        <div className="max-w-md mx-auto text-center">
          <div className="bg-zinc-900/50 rounded-3xl p-8 border border-amber-500/30">
            <div className="text-6xl mb-4">🎲</div>
            <h2 className="text-2xl font-black mb-2">Recruit New Soldier</h2>
            <p className="text-zinc-400 mb-6">Mint a random NFT soldier for your army</p>

            <div className="space-y-2 mb-6 text-left">
              {RECRUIT_CHANCES.map((r) => (
                <div key={r.rank} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${RANK_COLORS[r.rank]}`} />
                  <span className="flex-1 text-sm">{r.rank}</span>
                  <span className="text-zinc-500 text-sm font-mono">{r.chance}%</span>
                  <span className="text-zinc-600 text-xs">{r.power[0]}-{r.power[1]} PWR</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={() => setRecruitCount(Math.max(1, recruitCount - 1))}
                className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold"
              >-</button>
              <div className="text-2xl font-black w-16">{recruitCount}</div>
              <button
                onClick={() => setRecruitCount(Math.min(10, recruitCount + 1))}
                className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold"
              >+</button>
            </div>

            <button
              onClick={recruitSoldier}
              disabled={minting}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {minting ? <span className="animate-pulse">🎲 Summoning...</span> : `RECRUIT ${recruitCount}x — ${(recruitCount * RECRUIT_COST).toLocaleString()} $SHIT`}
            </button>
          </div>
        </div>
      )}

      {/* Deploy Confirm Modal */}
      {deployModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl max-w-md w-full border border-white/10 p-6">
            <h2 className="text-xl font-black mb-4 text-center">🎯 Confirm Deploy</h2>

            <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-2xl mb-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${RANK_COLORS[deployModal.soldier.rank]} flex items-center justify-center text-3xl`}>
                {deployModal.soldier.emoji}
              </div>
              <div>
                <div className="font-bold">{deployModal.soldier.name}</div>
                <div className="text-xs text-zinc-400">Lvl {deployModal.soldier.level} • {deployModal.soldier.power} PWR</div>
              </div>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Mission</span>
                <span className="font-bold">{deployModal.mission.emoji} {deployModal.mission.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Duration</span>
                <span className="font-bold">{deployModal.mission.durationLabel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Est. Reward</span>
                <span className="font-bold text-amber-400">
                  +{Math.floor(deployModal.mission.baseReward * (1 + (deployModal.soldier.power * deployModal.soldier.level) / 500)).toLocaleString()} $SHIT
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">XP Reward</span>
                <span className="font-bold text-purple-400">+{deployModal.mission.xpReward} XP</span>
              </div>
            </div>

            <div className="text-xs text-zinc-500 text-center mb-4">
              Soldier will be unavailable during the mission
            </div>

            <div className="flex gap-3">
              <button onClick={() => setDeployModal(null)} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-bold">
                Cancel
              </button>
              <button
                onClick={() => deployOnMission(deployModal.soldier, deployModal.mission)}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-black hover:scale-105 transition-transform shadow-lg shadow-amber-500/20"
              >
                🚀 DEPLOY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recruit Result Modal */}
      {mintResult && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl max-w-md w-full border border-white/10 p-6 text-center">
            <div className="text-sm text-zinc-500 uppercase tracking-widest mb-2">New Recruit</div>
            <div className={`w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br ${RANK_COLORS[mintResult.rank]} flex items-center justify-center text-6xl mb-4 shadow-2xl`}>
              {mintResult.emoji}
            </div>
            <div className={`inline-block px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${RANK_COLORS[mintResult.rank]} text-white mb-2`}>
              {mintResult.rank}
            </div>
            <h2 className="text-2xl font-black mb-1">{mintResult.name}</h2>
            <div className="text-zinc-400 text-sm mb-4">⚡ {mintResult.power} Power • Lvl {mintResult.level}</div>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {mintResult.abilities.map((a, i) => (
                <span key={i} className="px-3 py-1 bg-zinc-800 rounded-lg text-xs">{a}</span>
              ))}
            </div>
            <button
              onClick={() => setMintResult(null)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-black hover:scale-105 transition-transform"
            >
              Add to Squad
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
