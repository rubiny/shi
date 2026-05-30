'use client';

import React, { useState, useEffect } from 'react';

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'milestone' | 'story';
  category: string;
  progress: number;
  max: number;
  reward: number;
  xp: number;
  icon: string;
  claimed: boolean;
  completed: boolean;
  chainId?: string;
  chainStep?: number;
  chainTotal?: number;
  expiresAt?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
}

const QUESTS: Quest[] = [
  // Daily Quests
  { id: 'd1', title: 'Morning Shit', description: 'Complete 3 offers before noon', type: 'daily', category: 'offers', progress: 1, max: 3, reward: 150, xp: 50, icon: '🌅', claimed: false, completed: false, difficulty: 'easy' },
  { id: 'd2', title: 'Referral Hunter', description: 'Share your referral code with 5 friends', type: 'daily', category: 'social', progress: 2, max: 5, reward: 200, xp: 75, icon: '🎯', claimed: false, completed: false, difficulty: 'medium' },
  { id: 'd3', title: 'Staking Check', description: 'Check your staking rewards', type: 'daily', category: 'staking', progress: 1, max: 1, reward: 50, xp: 25, icon: '🔒', claimed: true, completed: true, difficulty: 'easy' },
  { id: 'd4', title: 'Market Scout', description: 'Browse the NFT marketplace', type: 'daily', category: 'market', progress: 0, max: 1, reward: 75, xp: 30, icon: '🛒', claimed: false, completed: false, difficulty: 'easy' },
  
  // Weekly Challenges
  { id: 'w1', title: 'Weekend Warrior', description: 'Complete 20 offers this week', type: 'weekly', category: 'offers', progress: 8, max: 20, reward: 1000, xp: 300, icon: '⚔️', claimed: false, completed: false, difficulty: 'medium' },
  { id: 'w2', title: 'Recruit Master', description: 'Get 3 friends to join', type: 'weekly', category: 'referrals', progress: 1, max: 3, reward: 1500, xp: 500, icon: '👥', claimed: false, completed: false, difficulty: 'hard' },
  { id: 'w3', title: 'Shit Tycoon', description: 'Earn 5,000 $SHIT from offers', type: 'weekly', category: 'offers', progress: 2340, max: 5000, reward: 2000, xp: 750, icon: '💰', claimed: false, completed: false, difficulty: 'hard' },
  { id: 'w4', title: 'NFT Collector', description: 'Buy or sell 3 NFTs', type: 'weekly', category: 'market', progress: 0, max: 3, reward: 800, xp: 250, icon: '🎨', claimed: false, completed: false, difficulty: 'medium' },
  
  // Milestone Quests
  { id: 'm1', title: 'First Blood', description: 'Complete your first offer', type: 'milestone', category: 'offers', progress: 1, max: 1, reward: 100, xp: 50, icon: '💩', claimed: true, completed: true, difficulty: 'easy' },
  { id: 'm2', title: 'Centurion', description: 'Complete 100 offers total', type: 'milestone', category: 'offers', progress: 12, max: 100, reward: 5000, xp: 2000, icon: '🏆', claimed: false, completed: false, difficulty: 'epic' },
  { id: 'm3', title: 'Diamond Hands', description: 'Stake $SHIT for 90 days', type: 'milestone', category: 'staking', progress: 30, max: 90, reward: 10000, xp: 5000, icon: '💎', claimed: false, completed: false, difficulty: 'epic' },
  { id: 'm4', title: 'Shit General', description: 'Earn 100,000 $SHIT total', type: 'milestone', category: 'offers', progress: 3240, max: 100000, reward: 25000, xp: 10000, icon: '⭐', claimed: false, completed: false, difficulty: 'epic' },
  
  // Story Chains - Chain 1: The Shit Begins
  { id: 's1-1', title: 'The Flush', description: 'Complete 5 offers', type: 'story', category: 'offers', progress: 5, max: 5, reward: 500, xp: 200, icon: '🚽', claimed: true, completed: true, chainId: 'chain1', chainStep: 1, chainTotal: 5, difficulty: 'easy' },
  { id: 's1-2', title: 'Paper Trail', description: 'Refer 2 friends', type: 'story', category: 'referrals', progress: 2, max: 2, reward: 800, xp: 300, icon: '🧻', claimed: true, completed: true, chainId: 'chain1', chainStep: 2, chainTotal: 5, difficulty: 'medium' },
  { id: 's1-3', title: 'The Stakeout', description: 'Stake 1000 $SHIT', type: 'story', category: 'staking', progress: 450, max: 1000, reward: 1200, xp: 500, icon: '🔒', claimed: false, completed: false, chainId: 'chain1', chainStep: 3, chainTotal: 5, difficulty: 'medium' },
  { id: 's1-4', title: 'Market Raid', description: 'Buy your first NFT', type: 'story', category: 'market', progress: 0, max: 1, reward: 1500, xp: 600, icon: '🛒', claimed: false, completed: false, chainId: 'chain1', chainStep: 4, chainTotal: 5, difficulty: 'medium' },
  { id: 's1-5', title: 'Legend of the Throne', description: 'Reach Battle Pass level 10', type: 'story', category: 'battlepass', progress: 3, max: 10, reward: 5000, xp: 2000, icon: '👑', claimed: false, completed: false, chainId: 'chain1', chainStep: 5, chainTotal: 5, difficulty: 'epic' },
  
  // Story Chains - Chain 2: The Resistance
  { id: 's2-1', title: 'Recruit Training', description: 'Complete 10 offers', type: 'story', category: 'offers', progress: 10, max: 10, reward: 1000, xp: 400, icon: '🪖', claimed: false, completed: false, chainId: 'chain2', chainStep: 1, chainTotal: 3, difficulty: 'medium' },
];

const DIFFICULTY_COLORS = {
  easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  hard: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  epic: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
};

export default function QuestsPage({ userId: _userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<'all' | 'daily' | 'weekly' | 'milestone' | 'story'>('all');
  const [quests, setQuests] = useState<Quest[]>(QUESTS);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 });
  const [claiming, setClaiming] = useState<string | null>(null);
  const [showChainModal, setShowChainModal] = useState<string | null>(null);

  // Daily reset timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      });
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const filteredQuests = quests.filter(q => {
    if (activeTab === 'all') return true;
    return q.type === activeTab;
  });

  const claimQuest = (id: string) => {
    setClaiming(id);
    setTimeout(() => {
      setQuests(quests.map(q => 
        q.id === id ? { ...q, claimed: true } : q
      ));
      setClaiming(null);
    }, 1000);
  };

  const getChainProgress = (chainId: string) => {
    const chainQuests = quests.filter(q => q.chainId === chainId);
    const completed = chainQuests.filter(q => q.completed).length;
    return { completed, total: chainQuests[0]?.chainTotal || 0 };
  };

  const stats = {
    daily: { total: quests.filter(q => q.type === 'daily').length, completed: quests.filter(q => q.type === 'daily' && q.completed).length },
    weekly: { total: quests.filter(q => q.type === 'weekly').length, completed: quests.filter(q => q.type === 'weekly' && q.completed).length },
    milestone: { total: quests.filter(q => q.type === 'milestone').length, completed: quests.filter(q => q.type === 'milestone' && q.completed).length },
    story: { total: quests.filter(q => q.type === 'story').length, completed: quests.filter(q => q.type === 'story' && q.completed).length },
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="text-6xl mb-2 animate-bounce">📜</div>
        <h1 className="text-4xl sm:text-5xl font-black mb-2 bg-gradient-to-r from-emerald-400 via-amber-500 to-purple-500 bg-clip-text text-transparent">
          Quests & Missions
        </h1>
        <p className="text-zinc-400">Complete quests. Earn rewards. Write your legend.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Daily', count: `${stats.daily.completed}/${stats.daily.total}`, icon: '📅', color: 'emerald' },
          { label: 'Weekly', count: `${stats.weekly.completed}/${stats.weekly.total}`, icon: '📆', color: 'amber' },
          { label: 'Milestone', count: `${stats.milestone.completed}/${stats.milestone.total}`, icon: '🏆', color: 'purple' },
          { label: 'Story', count: `${stats.story.completed}/${stats.story.total}`, icon: '📖', color: 'blue' },
        ].map((stat, i) => (
          <div key={i} className={`bg-zinc-900/50 rounded-2xl p-4 border border-${stat.color}-500/20`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-black text-zinc-100">{stat.count}</div>
            <div className="text-xs text-zinc-500 uppercase">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Daily Reset Timer */}
      {activeTab === 'daily' || activeTab === 'all' ? (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏰</span>
            <div>
              <div className="font-bold text-emerald-400">Daily Reset</div>
              <div className="text-sm text-zinc-400">New quests in:</div>
            </div>
          </div>
          <div className="flex gap-2">
            {[
              { val: timeLeft.hours, label: 'HRS' },
              { val: timeLeft.minutes, label: 'MIN' },
            ].map((t, i) => (
              <div key={i} className="bg-emerald-500/20 rounded-lg px-3 py-1 min-w-[60px] text-center">
                <div className="text-xl font-bold text-emerald-400">{t.val.toString().padStart(2, '0')}</div>
                <div className="text-[10px] text-emerald-400/70">{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'all', label: 'All Quests', count: quests.length, icon: '📜' },
          { id: 'daily', label: 'Daily', count: stats.daily.total, icon: '📅' },
          { id: 'weekly', label: 'Weekly', count: stats.weekly.total, icon: '📆' },
          { id: 'milestone', label: 'Milestone', count: stats.milestone.total, icon: '🏆' },
          { id: 'story', label: 'Story Mode', count: stats.story.total, icon: '📖' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'all' | 'daily' | 'weekly' | 'milestone' | 'story')}
            className={`px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                : 'bg-zinc-800/50 text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
            <span className="ml-2 text-xs bg-zinc-800/80 px-2 py-0.5 rounded-full">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Quests Grid */}
      <div className="space-y-4">
        {filteredQuests.map((quest) => {
          const progress = (quest.progress / quest.max) * 100;
          const isChain = quest.type === 'story' && quest.chainId;
          const chainProgress = isChain ? getChainProgress(quest.chainId!) : null;
          
          return (
            <div 
              key={quest.id}
              className={`group relative p-5 rounded-2xl border transition-all ${
                quest.completed
                  ? 'bg-zinc-900/30 border-emerald-500/30'
                  : 'bg-zinc-900/50 border-white/10 hover:border-amber-500/50'
              }`}
            >
              {/* Chain indicator */}
              {isChain && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-500/20 border border-purple-500/40 rounded-full text-xs font-bold text-purple-400">
                  Story {quest.chainStep}/{quest.chainTotal}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
                  quest.completed 
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
                    : 'bg-zinc-800'
                }`}>
                  {quest.icon}
                </div>
                
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-bold text-lg ${quest.completed ? 'text-zinc-400 line-through' : ''}`}>
                      {quest.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${DIFFICULTY_COLORS[quest.difficulty]}`}>
                      {quest.difficulty}
                    </span>
                    {quest.type === 'daily' && (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px]">
                        DAILY
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-zinc-400 mb-3">{quest.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-500">Progress</span>
                      <span className={quest.completed ? 'text-emerald-400' : 'text-amber-400'}>
                        {quest.progress}/{quest.max}
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          quest.completed 
                            ? 'bg-emerald-500' 
                            : 'bg-gradient-to-r from-amber-500 to-orange-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Rewards */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-amber-400 font-bold">💰 {quest.reward} $SHIT</span>
                    <span className="text-purple-400 font-bold">⭐ {quest.xp} XP</span>
                  </div>
                </div>
                
                {/* Action */}
                <div className="flex items-center gap-2">
                  {quest.claimed ? (
                    <div className="px-6 py-3 bg-emerald-500/20 text-emerald-400 rounded-xl font-bold">
                      ✓ CLAIMED
                    </div>
                  ) : quest.completed ? (
                    <button 
                      onClick={() => claimQuest(quest.id)}
                      disabled={claiming === quest.id}
                      className={`px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold transition-all ${
                        claiming === quest.id ? 'animate-pulse' : 'hover:scale-105'
                      }`}
                    >
                      {claiming === quest.id ? '🎁...' : 'CLAIM'}
                    </button>
                  ) : (
                    <button className="px-6 py-3 bg-zinc-800 rounded-xl font-bold text-zinc-400 cursor-not-allowed">
                      🔒 LOCKED
                    </button>
                  )}
                  
                  {isChain && chainProgress && (
                    <button 
                      onClick={() => setShowChainModal(quest.chainId!)}
                      className="p-3 bg-zinc-800 rounded-xl hover:bg-zinc-700"
                    >
                      🔗
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Story Chains Summary */}
      {(activeTab === 'all' || activeTab === 'story') && (
        <div className="mt-8 p-6 bg-zinc-900/30 rounded-2xl border border-white/5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <span>📖</span> Active Story Chains
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {['chain1', 'chain2'].map((chainId) => {
              const progress = getChainProgress(chainId);
              const chainQuests = quests.filter(q => q.chainId === chainId);
              const currentStep = chainQuests.find(q => !q.completed)?.chainStep || progress.total;
              
              return (
                <div 
                  key={chainId}
                  onClick={() => setShowChainModal(chainId)}
                  className="p-4 bg-zinc-800/50 rounded-xl border border-purple-500/30 hover:border-purple-500/60 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-purple-400">
                      {chainId === 'chain1' ? 'The Shit Begins' : 'The Resistance'}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {progress.completed}/{progress.total}
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-zinc-400">
                    Current: Step {currentStep}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chain Modal */}
      {showChainModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl max-w-2xl w-full border border-purple-500/30 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-purple-400">
                {showChainModal === 'chain1' ? 'The Shit Begins' : 'The Resistance'}
              </h2>
              <button 
                onClick={() => setShowChainModal(null)}
                className="text-zinc-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {quests
                .filter(q => q.chainId === showChainModal)
                .sort((a, b) => (a.chainStep || 0) - (b.chainStep || 0))
                .map((quest, index) => (
                  <div 
                    key={quest.id}
                    className={`flex items-center gap-4 p-4 rounded-xl ${
                      quest.completed 
                        ? 'bg-emerald-500/10 border border-emerald-500/30' 
                        : index === 0 || quests.filter(q => q.chainId === showChainModal)[index - 1]?.completed
                          ? 'bg-purple-500/10 border border-purple-500/30'
                          : 'bg-zinc-800/50 opacity-50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      quest.completed ? 'bg-emerald-500' : 'bg-zinc-700'
                    }`}>
                      {quest.completed ? '✓' : quest.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold">{quest.title}</div>
                      <div className="text-sm text-zinc-400">{quest.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400 font-bold">+{quest.reward}</div>
                      <div className="text-xs text-zinc-500">Step {quest.chainStep}</div>
                    </div>
                  </div>
                ))}
            </div>
            
            <button 
              onClick={() => setShowChainModal(null)}
              className="w-full mt-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Quest Tips */}
      <div className="mt-8 p-6 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 rounded-2xl border border-amber-500/30">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <span>💡</span> Quest Master Tips
        </h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm text-zinc-400">
          <div className="flex items-start gap-2">
            <span className="text-amber-400">🎯</span>
            <span>Complete daily quests before reset for maximum XP</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400">🔗</span>
            <span>Story chains give bonus rewards at the end</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400">⚡</span>
            <span>Harder difficulty = bigger rewards</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400">📅</span>
            <span>Weekly quests reset every Monday</span>
          </div>
        </div>
      </div>
    </div>
  );
}
