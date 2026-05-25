'use client';

import React, { useState, useCallback } from 'react';
import EmptyState from './ui/EmptyState';

interface GuildMember {
  username: string;
  avatar: string;
  role: 'leader' | 'officer' | 'member';
  earned: number;
  joinedAt: string;
}

interface Guild {
  id: string;
  name: string;
  tag: string;
  emoji: string;
  description: string;
  members: GuildMember[];
  maxMembers: number;
  weeklyEarnings: number;
  rank: number;
  totalEarned: number;
  minLevel: number;
  isOpen: boolean;
  chat: Array<{ author: string; msg: string; time: string }>;
}

const MOCK_GUILDS: Guild[] = [
  {
    id: 'g1', name: 'Sewer Kings', tag: 'SEW', emoji: '\u{1F451}',
    description: 'the OGs of shit.army. we dont flush, we stack.', members: [
      { username: 'ShitKing420', avatar: '\u{1F451}', role: 'leader', earned: 2500000, joinedAt: '3mo ago' },
      { username: 'CryptoPoop', avatar: '\u{1F48E}', role: 'officer', earned: 1890000, joinedAt: '2mo ago' },
      { username: 'FlushMaster', avatar: '\u{1F6BD}', role: 'member', earned: 720000, joinedAt: '1mo ago' },
    ], maxMembers: 50, weeklyEarnings: 145000, rank: 1, totalEarned: 8900000, minLevel: 5, isOpen: true,
    chat: [
      { author: 'ShitKing420', msg: 'gm degens, new raid dropped \u{1F525}', time: '2m ago' },
      { author: 'CryptoPoop', msg: 'already on it ser', time: '1m ago' },
    ],
  },
  {
    id: 'g2', name: 'Toilet Mafia', tag: 'TLT', emoji: '\u{1F6BD}',
    description: 'we run these sewers. join if u got diamond hands.',
    members: [
      { username: 'ToiletBoss', avatar: '\u{1F6BD}', role: 'leader', earned: 1450000, joinedAt: '3mo ago' },
      { username: 'DrainGang', avatar: '\u{1F30A}', role: 'officer', earned: 980000, joinedAt: '2mo ago' },
    ], maxMembers: 30, weeklyEarnings: 89000, rank: 2, totalEarned: 5400000, minLevel: 3, isOpen: true,
    chat: [],
  },
  {
    id: 'g3', name: 'Diamond Dumps', tag: 'DDP', emoji: '\u{1F48E}',
    description: 'we hold everything. even the shit.',
    members: [
      { username: 'DiamondDegen', avatar: '\u{1F48E}', role: 'leader', earned: 875000, joinedAt: '2mo ago' },
    ], maxMembers: 25, weeklyEarnings: 45000, rank: 3, totalEarned: 2100000, minLevel: 1, isOpen: true,
    chat: [],
  },
];

interface GuildsProps {
  balance: number;
  onSpend: (amount: number, reason: string) => void;
}

export default function Guilds({ balance, onSpend }: GuildsProps) {
  const [guilds] = useState<Guild[]>(MOCK_GUILDS);
  const [myGuild, setMyGuild] = useState<Guild | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'my_guild' | 'leaderboard'>('browse');
  const [showCreate, setShowCreate] = useState(false);
  const [guildName, setGuildName] = useState('');
  const [guildTag, setGuildTag] = useState('');
  const [guildDesc, setGuildDesc] = useState('');
  const [chatMsg, setChatMsg] = useState('');

  const joinGuild = useCallback((guild: Guild) => {
    setMyGuild({
      ...guild,
      members: [...guild.members, { username: 'You', avatar: '\u{1F4A9}', role: 'member', earned: 3240, joinedAt: 'just now' }],
    });
    setActiveTab('my_guild');
  }, []);

  const createGuild = useCallback(() => {
    if (!guildName || !guildTag || balance < 1000) return;
    onSpend(1000, `created guild "${guildName}"`);
    const newGuild: Guild = {
      id: `g-${Date.now()}`, name: guildName, tag: guildTag.toUpperCase().slice(0, 4), emoji: '\u{1F4A9}',
      description: guildDesc || 'a new shit army guild', members: [
        { username: 'You', avatar: '\u{1F4A9}', role: 'leader', earned: 3240, joinedAt: 'just now' },
      ], maxMembers: 25, weeklyEarnings: 0, rank: 99, totalEarned: 0, minLevel: 1, isOpen: true, chat: [],
    };
    setMyGuild(newGuild);
    setShowCreate(false);
    setActiveTab('my_guild');
  }, [guildName, guildTag, guildDesc, balance, onSpend]);

  const sendChat = useCallback(() => {
    if (!chatMsg.trim() || !myGuild) return;
    setMyGuild(prev => prev ? {
      ...prev,
      chat: [...prev.chat, { author: 'You', msg: chatMsg, time: 'now' }],
    } : null);
    setChatMsg('');
  }, [chatMsg, myGuild]);

  const tabs = [
    { key: 'browse' as const, label: 'BROWSE GUILDS', icon: '\u{1F50D}' },
    { key: 'my_guild' as const, label: 'MY GUILD', icon: '\u{1F3F0}' },
    { key: 'leaderboard' as const, label: 'RANKINGS', icon: '\u{1F3C6}' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-8">
        <div className="text-amber-500 text-sm font-bold tracking-[3px]">DEGEN CLANS</div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight">GUILD <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">HALL</span></h2>
        <p className="text-zinc-400 text-sm mt-1">squad up. raid together. compete for weekly bags. we don&apos;t flush alone.</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === tab.key ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'browse' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-zinc-500">{guilds.length} active guilds</span>
            <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black rounded-xl text-sm font-bold">
              + CREATE GUILD (1,000 $SHIT)
            </button>
          </div>

          {showCreate && (
            <div className="bg-zinc-900/80 border border-amber-500/20 rounded-2xl p-6 mb-4">
              <div className="text-lg font-bold mb-4">{'\u{1F3F0}'} Create Your Guild</div>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input type="text" value={guildName} onChange={(e) => setGuildName(e.target.value)} placeholder="Guild name..." maxLength={24} className="flex-1 px-4 py-2 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none" />
                  <input type="text" value={guildTag} onChange={(e) => setGuildTag(e.target.value.toUpperCase())} placeholder="TAG" maxLength={4} className="w-20 px-3 py-2 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none text-center uppercase" />
                </div>
                <textarea value={guildDesc} onChange={(e) => setGuildDesc(e.target.value)} placeholder="describe your guild (keep it degen)..." maxLength={100} rows={2} className="w-full px-4 py-2 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none resize-none" />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-zinc-800 rounded-xl text-sm">Cancel</button>
                  <button onClick={createGuild} disabled={!guildName || !guildTag || balance < 1000} className="px-4 py-2 bg-amber-600 text-black rounded-xl text-sm font-bold disabled:opacity-50">CREATE</button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {guilds.length === 0 && (
              <EmptyState
                icon="🏰"
                title="NO GUILDS YET"
                description="create the first guild and recruit degens to dominate the leaderboard together."
                action={{ label: '+ CREATE GUILD', onClick: () => setShowCreate(true) }}
              />
            )}
            {guilds.map(guild => (
              <div key={guild.id} className="bg-zinc-900/60 rounded-2xl p-5 border border-white/5 hover:border-amber-500/20 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{guild.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{guild.name}</span>
                        <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">[{guild.tag}]</span>
                        <span className="text-xs text-amber-400">#{guild.rank}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{guild.description}</p>
                    </div>
                  </div>
                  <button onClick={() => joinGuild(guild)} disabled={myGuild !== null} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black rounded-xl text-sm font-bold disabled:opacity-50">
                    {myGuild ? 'IN A GUILD' : 'JOIN'}
                  </button>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-zinc-500">
                  <span>{'\u{1F465}'} {guild.members.length}/{guild.maxMembers}</span>
                  <span>{'\u{1F4B0}'} {(guild.weeklyEarnings).toLocaleString()} $SHIT/week</span>
                  <span>{'\u{1F3C6}'} {(guild.totalEarned).toLocaleString()} total</span>
                  <span>Lvl {guild.minLevel}+ required</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'my_guild' && (
        <div>
          {!myGuild ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">{'\u{1F3F0}'}</div>
              <div className="text-xl font-bold mb-2">No Guild Yet</div>
              <p className="text-zinc-500 text-sm mb-4">join or create a guild to start earning together</p>
              <button onClick={() => setActiveTab('browse')} className="px-6 py-2 bg-amber-600 text-black rounded-xl font-bold">BROWSE GUILDS</button>
            </div>
          ) : (
            <div>
              <div className="bg-zinc-900/80 border border-amber-500/20 rounded-2xl p-6 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{myGuild.emoji}</span>
                  <div>
                    <div className="text-xl font-bold">{myGuild.name} <span className="text-zinc-500 text-sm">[{myGuild.tag}]</span></div>
                    <div className="text-xs text-zinc-500">Rank #{myGuild.rank} {'\u2022'} {myGuild.members.length}/{myGuild.maxMembers} members</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-zinc-800 rounded-xl p-3 text-center">
                    <div className="text-amber-400 font-bold">{myGuild.weeklyEarnings.toLocaleString()}</div>
                    <div className="text-xs text-zinc-500">$SHIT/week</div>
                  </div>
                  <div className="bg-zinc-800 rounded-xl p-3 text-center">
                    <div className="text-amber-400 font-bold">{myGuild.totalEarned.toLocaleString()}</div>
                    <div className="text-xs text-zinc-500">total earned</div>
                  </div>
                  <div className="bg-zinc-800 rounded-xl p-3 text-center">
                    <div className="text-amber-400 font-bold">{myGuild.members.length}</div>
                    <div className="text-xs text-zinc-500">members</div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
                  <div className="text-sm font-bold mb-3">{'\u{1F465}'} MEMBERS</div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {myGuild.members.map((m, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-2">
                          <span>{m.avatar}</span>
                          <span className="text-sm font-semibold">{m.username}</span>
                          {m.role === 'leader' && <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">LEADER</span>}
                          {m.role === 'officer' && <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">OFFICER</span>}
                        </div>
                        <span className="text-xs text-zinc-500">{m.earned.toLocaleString()} $SHIT</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 flex flex-col">
                  <div className="text-sm font-bold mb-3">{'\u{1F4AC}'} GUILD CHAT</div>
                  <div className="flex-1 space-y-2 max-h-48 overflow-y-auto mb-3">
                    {myGuild.chat.length === 0 ? (
                      <div className="text-xs text-zinc-600 text-center py-4">no messages yet. say gm.</div>
                    ) : myGuild.chat.map((msg, i) => (
                      <div key={i} className="text-sm">
                        <span className="text-amber-400 font-semibold">{msg.author}</span>
                        <span className="text-zinc-600 text-xs ml-1">{msg.time}</span>
                        <div className="text-zinc-300">{msg.msg}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendChat()} placeholder="type here ser..." className="flex-1 px-3 py-2 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none text-sm" />
                    <button onClick={sendChat} className="px-3 py-2 bg-amber-600 text-black rounded-xl text-sm font-bold">SEND</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div>
          <div className="text-sm text-zinc-500 mb-4">top guilds by weekly earnings</div>
          <div className="space-y-3">
            {[...guilds].sort((a, b) => b.weeklyEarnings - a.weeklyEarnings).map((guild, i) => (
              <div key={guild.id} className={`bg-zinc-900/60 rounded-2xl p-4 border ${i === 0 ? 'border-amber-500/30' : 'border-white/5'}`}>
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-black ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-zinc-300' : 'text-orange-500'}`}>
                    #{i + 1}
                  </div>
                  <span className="text-2xl">{guild.emoji}</span>
                  <div className="flex-1">
                    <div className="font-bold">{guild.name} <span className="text-zinc-500 text-xs">[{guild.tag}]</span></div>
                    <div className="text-xs text-zinc-500">{guild.members.length} members</div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-400 font-bold">{guild.weeklyEarnings.toLocaleString()}</div>
                    <div className="text-xs text-zinc-500">$SHIT/week</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-xs text-zinc-600">
            top 3 guilds get bonus rewards every Sunday {'\u{1F3C6}'}
          </div>
        </div>
      )}
    </div>
  );
}
