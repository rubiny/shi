'use client';

import React, { useState } from 'react';

interface NFT {
  id: string;
  name: string;
  rank: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  power: number;
  emoji: string;
  abilities: string[];
  acquiredAt: string;
  xp: number;
  level: number;
  equipped: boolean;
}

interface Mission {
  id: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
  reward: number;
  duration: string;
  requirements: { power: number; count: number };
  emoji: string;
}

const MY_ARMY: NFT[] = [
  { id: '1', name: 'Poop Soldier #001', rank: 'Rare', power: 52, emoji: '💩', abilities: ['Stink Bomb', 'Stealth'], acquiredAt: '2026-05-20', xp: 1200, level: 3, equipped: true },
  { id: '2', name: 'Toilet Warrior #042', rank: 'Epic', power: 78, emoji: '🚽', abilities: ['Flush Attack', 'Water Cannon', 'Plunge Strike'], acquiredAt: '2026-05-22', xp: 2800, level: 5, equipped: true },
  { id: '3', name: 'Paper Ninja #069', rank: 'Uncommon', power: 35, emoji: '🧻', abilities: ['Paper Cut', 'Roll Out'], acquiredAt: '2026-05-23', xp: 450, level: 2, equipped: false },
  { id: '4', name: 'Golden Throne #001', rank: 'Legendary', power: 150, emoji: '👑', abilities: ['Royal Flush', 'Golden Shower', 'Throne Power'], acquiredAt: '2026-05-24', xp: 500, level: 1, equipped: true },
];

const MISSIONS: Mission[] = [
  { id: '1', name: 'Sewer Raid', difficulty: 'Easy', reward: 500, duration: '1h', requirements: { power: 20, count: 1 }, emoji: '🕳️' },
  { id: '2', name: 'Public Restroom Takeover', difficulty: 'Medium', reward: 1200, duration: '3h', requirements: { power: 50, count: 2 }, emoji: '🚻' },
  { id: '3', name: 'Septic Tank Heist', difficulty: 'Hard', reward: 3000, duration: '6h', requirements: { power: 100, count: 3 }, emoji: '🏭' },
  { id: '4', name: 'The Great Flush', difficulty: 'Extreme', reward: 10000, duration: '24h', requirements: { power: 300, count: 5 }, emoji: '🌊' },
];

const RANK_COLORS = {
  Common: 'from-zinc-600 to-zinc-500',
  Uncommon: 'from-green-600 to-emerald-500',
  Rare: 'from-blue-600 to-cyan-500',
  Epic: 'from-purple-600 to-pink-500',
  Legendary: 'from-amber-500 via-orange-500 to-red-500',
  Mythic: 'from-pink-600 via-purple-500 to-blue-500',
};

const RANK_BORDER = {
  Common: 'border-zinc-600',
  Uncommon: 'border-emerald-500',
  Rare: 'border-blue-500',
  Epic: 'border-purple-500',
  Legendary: 'border-amber-500',
  Mythic: 'border-pink-500',
};

const DIFFICULTY_COLORS = {
  Easy: 'text-emerald-400',
  Medium: 'text-amber-400',
  Hard: 'text-orange-400',
  Extreme: 'text-red-400',
};

export default function Army({ userId: _userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<'army' | 'missions' | 'recruit'>('army');
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  const [minting, setMinting] = useState(false);
  const [recruitCount, setRecruitCount] = useState(1);

  const totalPower = MY_ARMY.filter(n => n.equipped).reduce((sum, n) => sum + n.power * n.level, 0);
  const equippedCount = MY_ARMY.filter(n => n.equipped).length;

  const mintNFT = () => {
    setMinting(true);
    setTimeout(() => {
      setMinting(false);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8 relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-amber-500/20 blur-2xl rounded-full"></div>
        <div className="relative text-center">
          <div className="text-6xl mb-2 animate-pulse">🪖</div>
          <h1 className="text-4xl sm:text-5xl font-black mb-2 bg-gradient-to-r from-purple-400 via-pink-500 to-amber-500 bg-clip-text text-transparent">
            Shit Army
          </h1>
          <p className="text-zinc-400">Recruit NFT soldiers. Send them on missions. Conquer the sewers.</p>
          
          {/* Army Power */}
          <div className="mt-4 inline-flex items-center gap-4 px-6 py-3 bg-zinc-900/50 rounded-2xl border border-white/10">
            <div className="text-left">
              <div className="text-xs text-zinc-500 uppercase">Squad Power</div>
              <div className="text-2xl font-black text-amber-400">{totalPower.toLocaleString()} ⚡</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-left">
              <div className="text-xs text-zinc-500 uppercase">Equipped</div>
              <div className="text-2xl font-black text-purple-400">{equippedCount} / 5</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'army', label: 'My Squad', icon: '🪖', color: 'from-purple-500 to-pink-500' },
          { id: 'missions', label: 'Missions', icon: '🎯', color: 'from-amber-500 to-orange-500' },
          { id: 'recruit', label: 'Recruit', icon: '➕', color: 'from-emerald-500 to-teal-500' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'army' | 'missions' | 'recruit')}
            className={`group relative px-6 py-3 rounded-2xl font-bold transition-all transform hover:scale-105 ${
              activeTab === tab.id
                ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                : 'bg-zinc-800/50 text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            <span className="mr-2 group-hover:animate-bounce">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Army Tab */}
      {activeTab === 'army' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MY_ARMY.map((nft) => (
            <div 
              key={nft.id}
              onClick={() => setSelectedNft(nft)}
              className={`group relative p-5 rounded-2xl border-2 cursor-pointer transition-all hover:scale-105 ${
                nft.equipped 
                  ? `${RANK_BORDER[nft.rank]} bg-zinc-900/50` 
                  : 'border-white/10 bg-zinc-900/20 opacity-70'
              }`}
            >
              {/* Glow Effect */}
              <div className={`absolute -inset-px bg-gradient-to-r ${RANK_COLORS[nft.rank]} opacity-0 group-hover:opacity-30 rounded-2xl transition-opacity blur-xl`} />
              
              <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${RANK_COLORS[nft.rank]} flex items-center justify-center text-4xl shadow-lg`}>
                    {nft.emoji}
                  </div>
                  
                  <div className="text-right">
                    <div className={`inline-block px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${RANK_COLORS[nft.rank]} text-white`}>
                      {nft.rank}
                    </div>
                    {nft.equipped && (
                      <div className="mt-2 text-emerald-400 text-xs font-bold">
                        ⚡ EQUIPPED
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Info */}
                <h3 className="font-bold text-lg mb-1">{nft.name}</h3>
                
                {/* Level & Power */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    <span>⭐</span>
                    <span className="font-bold">Lvl {nft.level}</span>
                  </div>
                  <div className="flex items-center gap-1 text-purple-400">
                    <span>⚡</span>
                    <span className="font-bold">{nft.power} PWR</span>
                  </div>
                </div>
                
                {/* XP Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-500">XP to next level</span>
                    <span className="text-amber-400">{nft.xp}/5000</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${RANK_COLORS[nft.rank]} rounded-full`}
                      style={{ width: `${(nft.xp / 5000) * 100}%` }}
                    />
                  </div>
                </div>
                
                {/* Abilities */}
                <div className="flex flex-wrap gap-2">
                  {nft.abilities.map((ability, i) => (
                    <span key={i} className="px-2 py-1 bg-zinc-800 rounded-lg text-xs text-zinc-400">
                      {ability}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          {/* Add New Slot */}
          <button 
            onClick={() => setActiveTab('recruit')}
            className="group p-5 rounded-2xl border-2 border-dashed border-zinc-700 hover:border-amber-500/50 bg-zinc-900/20 hover:bg-zinc-900/40 transition-all min-h-[280px] flex flex-col items-center justify-center gap-4"
          >
            <div className="w-20 h-20 rounded-2xl bg-zinc-800 group-hover:bg-amber-500/20 flex items-center justify-center text-4xl transition-colors">
              ➕
            </div>
            <div className="text-zinc-500 group-hover:text-amber-400 font-bold transition-colors">
              Recruit New Soldier
            </div>
            <div className="text-xs text-zinc-600">500 $SHIT per recruit</div>
          </button>
        </div>
      )}

      {/* Missions Tab */}
      {activeTab === 'missions' && (
        <div className="space-y-4">
          {MISSIONS.map((mission) => {
            const canDo = totalPower >= mission.requirements.power && equippedCount >= mission.requirements.count;
            
            return (
              <div 
                key={mission.id}
                className={`p-5 rounded-2xl border transition-all ${
                  canDo 
                    ? 'bg-zinc-900/50 border-amber-500/30 hover:border-amber-500/60' 
                    : 'bg-zinc-900/20 border-white/5 opacity-50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center text-3xl">
                    {mission.emoji}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg">{mission.name}</h3>
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${DIFFICULTY_COLORS[mission.difficulty]}`}>
                        {mission.difficulty}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                      <span>⏱️ {mission.duration}</span>
                      <span>💰 {mission.reward.toLocaleString()} $SHIT</span>
                      <span>⚡ {mission.requirements.power} PWR required</span>
                      <span>🪖 {mission.requirements.count} soldiers</span>
                    </div>
                  </div>
                  
                  <button 
                    disabled={!canDo}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${
                      canDo
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-105'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    {canDo ? 'DEPLOY' : 'LOCKED'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recruit Tab */}
      {activeTab === 'recruit' && (
        <div className="max-w-md mx-auto text-center">
          <div className="bg-zinc-900/50 rounded-3xl p-8 border border-amber-500/30">
            <div className="text-6xl mb-4">🎲</div>
            <h2 className="text-2xl font-black mb-2">Recruit New Soldier</h2>
            <p className="text-zinc-400 mb-6">Mint a random NFT soldier for your army</p>
            
            {/* Rarity Chances */}
            <div className="space-y-2 mb-6 text-left">
              {[
                { rank: 'Common', chance: '50%', color: 'bg-zinc-600' },
                { rank: 'Uncommon', chance: '30%', color: 'bg-emerald-500' },
                { rank: 'Rare', chance: '15%', color: 'bg-blue-500' },
                { rank: 'Epic', chance: '4%', color: 'bg-purple-500' },
                { rank: 'Legendary', chance: '0.9%', color: 'bg-amber-500' },
                { rank: 'Mythic', chance: '0.1%', color: 'bg-pink-500' },
              ].map((r) => (
                <div key={r.rank} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${r.color}`} />
                  <span className="flex-1 text-sm">{r.rank}</span>
                  <span className="text-zinc-500 text-sm">{r.chance}</span>
                </div>
              ))}
            </div>
            
            {/* Amount Selector */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button 
                onClick={() => setRecruitCount(Math.max(1, recruitCount - 1))}
                className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold"
              >
                -
              </button>
              <div className="text-2xl font-black w-16">{recruitCount}</div>
              <button 
                onClick={() => setRecruitCount(Math.min(10, recruitCount + 1))}
                className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold"
              >
                +
              </button>
            </div>
            
            <button 
              onClick={mintNFT}
              disabled={minting}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl font-bold text-lg hover:scale-105 transition-transform"
            >
              {minting ? (
                <span className="animate-pulse">🎲 Summoning...</span>
              ) : (
                `RECRUIT ${recruitCount}x - ${(recruitCount * 500).toLocaleString()} $SHIT`
              )}
            </button>
          </div>
        </div>
      )}

      {/* NFT Detail Modal */}
      {selectedNft && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl max-w-md w-full border border-white/10 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`inline-block px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${RANK_COLORS[selectedNft.rank]} text-white`}>
                {selectedNft.rank}
              </div>
              <button onClick={() => setSelectedNft(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            
            <div className="text-center mb-6">
              <div className={`w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br ${RANK_COLORS[selectedNft.rank]} flex items-center justify-center text-6xl mb-4 shadow-2xl`}>
                {selectedNft.emoji}
              </div>
              <h2 className="text-2xl font-black">{selectedNft.name}</h2>
              <p className="text-zinc-400 text-sm">Acquired {new Date(selectedNft.acquiredAt).toLocaleDateString()}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-zinc-800 rounded-xl text-center">
                <div className="text-2xl font-black text-amber-400">{selectedNft.level}</div>
                <div className="text-xs text-zinc-500">Level</div>
              </div>
              <div className="p-3 bg-zinc-800 rounded-xl text-center">
                <div className="text-2xl font-black text-purple-400">{selectedNft.power}</div>
                <div className="text-xs text-zinc-500">Power</div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold">
                LEVEL UP
              </button>
              <button 
                onClick={() => setSelectedNft(null)}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
