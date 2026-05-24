'use client';

import React, { useState, useCallback } from 'react';

interface Meme {
  id: string;
  author: string;
  authorAvatar: string;
  title: string;
  emoji: string;
  caption: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  createdAt: string;
  tags: string[];
  userVote: 'up' | 'down' | null;
  isFeatured: boolean;
}

const MOCK_MEMES: Meme[] = [
  { id: 'm1', author: '0xChad', authorAvatar: '\u{1F451}', title: 'when $SHIT moons', emoji: '\u{1F4A9}\u{1F680}', caption: 'told you ser. never doubt the poop.', upvotes: 1247, downvotes: 23, comments: 89, createdAt: '2h ago', tags: ['moon', 'bullish'], userVote: null, isFeatured: true },
  { id: 'm2', author: 'DegenApe69', authorAvatar: '\u{1F9B4}', title: 'paper hands be like', emoji: '\u{1F9FB}\u{1F4A8}', caption: 'sold at the bottom. classic.', upvotes: 892, downvotes: 45, comments: 56, createdAt: '4h ago', tags: ['paperhands', 'ngmi'], userVote: null, isFeatured: false },
  { id: 'm3', author: 'FlushMaster', authorAvatar: '\u{1F6BD}', title: 'flushing the bears', emoji: '\u{1F6BD}\u{1F43B}', caption: 'bears r absolutely rekt', upvotes: 2103, downvotes: 12, comments: 134, createdAt: '6h ago', tags: ['flush', 'bearish'], userVote: null, isFeatured: true },
  { id: 'm4', author: 'ShitKing420', authorAvatar: '\u{1F48E}', title: 'diamond hands assemble', emoji: '\u{1F48E}\u{270B}', caption: 'we hold. we win. this is the way.', upvotes: 567, downvotes: 34, comments: 43, createdAt: '12h ago', tags: ['diamondhands', 'wagmi'], userVote: null, isFeatured: false },
  { id: 'm5', author: 'PoopLord', authorAvatar: '\u{1F4A9}', title: 'ape in or stay poor', emoji: '\u{1F98D}\u{1F4B0}', caption: 'the only two choices in life', upvotes: 3421, downvotes: 67, comments: 201, createdAt: '1d ago', tags: ['apein', 'degen'], userVote: null, isFeatured: true },
  { id: 'm6', author: 'CryptoTurd', authorAvatar: '\u{1F525}', title: 'rugged but still here', emoji: '\u{1F3A2}\u{1F4A9}', caption: 'cant rug these diamond cheeks', upvotes: 789, downvotes: 56, comments: 67, createdAt: '2d ago', tags: ['rug', 'survivor'], userVote: null, isFeatured: false },
];

const SORT_OPTIONS = ['Hot', 'New', 'Top (24h)', 'Top (Week)'] as const;

interface MemeFeedProps {
  balance: number;
  onSpend: (amount: number, reason: string) => void;
}

export default function MemeFeed({ balance, onSpend }: MemeFeedProps) {
  const [memes, setMemes] = useState<Meme[]>(MOCK_MEMES);
  const [sortBy, setSortBy] = useState<typeof SORT_OPTIONS[number]>('Hot');
  const [showSubmit, setShowSubmit] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newEmoji, setNewEmoji] = useState('\u{1F4A9}');
  const [filter, setFilter] = useState('all');

  const vote = useCallback((memeId: string, direction: 'up' | 'down') => {
    setMemes(prev => prev.map(m => {
      if (m.id !== memeId) return m;
      const cost = 10;
      if (m.userVote === direction) {
        return { ...m, userVote: null, upvotes: direction === 'up' ? m.upvotes - 1 : m.upvotes, downvotes: direction === 'down' ? m.downvotes - 1 : m.downvotes };
      }
      if (balance < cost) return m;
      onSpend(cost, `${direction}vote on "${m.title}"`);
      const prevUp = m.userVote === 'up' ? -1 : 0;
      const prevDown = m.userVote === 'down' ? -1 : 0;
      return {
        ...m,
        userVote: direction,
        upvotes: m.upvotes + (direction === 'up' ? 1 : 0) + prevUp,
        downvotes: m.downvotes + (direction === 'down' ? 1 : 0) + prevDown,
      };
    }));
  }, [balance, onSpend]);

  const submitMeme = useCallback(() => {
    if (!newTitle || !newCaption) return;
    const cost = 50;
    if (balance < cost) return;
    onSpend(cost, `submitted meme "${newTitle}"`);
    const newMeme: Meme = {
      id: `m-${Date.now()}`,
      author: 'You',
      authorAvatar: '\u{1F4A9}',
      title: newTitle,
      emoji: newEmoji,
      caption: newCaption,
      upvotes: 1,
      downvotes: 0,
      comments: 0,
      createdAt: 'just now',
      tags: [],
      userVote: 'up',
      isFeatured: false,
    };
    setMemes(prev => [newMeme, ...prev]);
    setNewTitle('');
    setNewCaption('');
    setShowSubmit(false);
  }, [newTitle, newCaption, newEmoji, balance, onSpend]);

  const sortedMemes = [...memes].sort((a, b) => {
    if (sortBy === 'New') return 0;
    if (sortBy === 'Hot') return (b.upvotes - b.downvotes + b.comments * 2) - (a.upvotes - a.downvotes + a.comments * 2);
    return b.upvotes - a.upvotes;
  }).filter(m => filter === 'featured' ? m.isFeatured : true);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="mb-8">
        <div className="text-amber-500 text-sm font-bold tracking-[3px]">DEGEN CONTENT</div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight">MEME <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">FEED</span></h2>
        <p className="text-zinc-400 text-sm mt-1">post shit. vote with $SHIT. top memes get rewarded. shitposting is an art.</p>
      </div>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex gap-2">
          {SORT_OPTIONS.map(opt => (
            <button key={opt} onClick={() => setSortBy(opt)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sortBy === opt ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
              {opt}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilter(filter === 'featured' ? 'all' : 'featured')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filter === 'featured' ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-400'}`}>
            {'\u2B50'} Featured
          </button>
          <button onClick={() => setShowSubmit(!showSubmit)} className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-black rounded-lg text-xs font-bold">
            + POST MEME (50 $SHIT)
          </button>
        </div>
      </div>

      {showSubmit && (
        <div className="bg-zinc-900/80 border border-amber-500/20 rounded-2xl p-6 mb-6">
          <div className="text-lg font-bold mb-4">{'\u{1F4DD}'} Submit Your Meme</div>
          <div className="space-y-3">
            <div className="flex gap-3">
              <select value={newEmoji} onChange={(e) => setNewEmoji(e.target.value)} className="px-3 py-2 bg-zinc-800 rounded-xl border border-white/10 text-2xl">
                {['\u{1F4A9}', '\u{1F680}', '\u{1F6BD}', '\u{1F48E}', '\u{1F525}', '\u{1F98D}', '\u{1F451}', '\u{1FA99}', '\u{1F4B0}', '\u{1F9FB}'].map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="meme title ser..." maxLength={50} className="flex-1 px-4 py-2 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none" />
            </div>
            <textarea value={newCaption} onChange={(e) => setNewCaption(e.target.value)} placeholder="caption (keep it degen)..." maxLength={140} rows={2} className="w-full px-4 py-2 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none resize-none" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-500">costs 50 $SHIT to post. top memes earn rewards.</span>
              <div className="flex gap-2">
                <button onClick={() => setShowSubmit(false)} className="px-4 py-2 bg-zinc-800 rounded-xl text-sm">Cancel</button>
                <button onClick={submitMeme} disabled={!newTitle || !newCaption || balance < 50} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black rounded-xl text-sm font-bold disabled:opacity-50">SEND IT</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {sortedMemes.map(meme => (
          <div key={meme.id} className={`bg-zinc-900/60 rounded-2xl p-5 border ${meme.isFeatured ? 'border-amber-500/30' : 'border-white/5'}`}>
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-1">
                <button onClick={() => vote(meme.id, 'up')} className={`text-xl hover:scale-125 transition-transform ${meme.userVote === 'up' ? 'text-amber-400' : 'text-zinc-500'}`}>
                  {'\u25B2'}
                </button>
                <span className={`text-sm font-bold ${meme.upvotes - meme.downvotes > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                  {meme.upvotes - meme.downvotes}
                </span>
                <button onClick={() => vote(meme.id, 'down')} className={`text-xl hover:scale-125 transition-transform ${meme.userVote === 'down' ? 'text-red-400' : 'text-zinc-500'}`}>
                  {'\u25BC'}
                </button>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{meme.authorAvatar}</span>
                  <span className="font-semibold text-sm">{meme.author}</span>
                  <span className="text-xs text-zinc-600">{meme.createdAt}</span>
                  {meme.isFeatured && <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-semibold">{'\u2B50'} FEATURED</span>}
                </div>
                <div className="mb-2">
                  <span className="text-3xl mr-2">{meme.emoji}</span>
                  <span className="font-bold">{meme.title}</span>
                </div>
                <p className="text-sm text-zinc-400 mb-3">{meme.caption}</p>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span>{'\u{1F4AC}'} {meme.comments} comments</span>
                  <span>{'\u2B06\uFE0F'} {meme.upvotes} upvotes</span>
                  {meme.tags.map(tag => (
                    <span key={tag} className="text-amber-500/60">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center text-xs text-zinc-600">
        vote costs 10 $SHIT {'\u2022'} post costs 50 $SHIT {'\u2022'} top memes get weekly rewards
      </div>
    </div>
  );
}
