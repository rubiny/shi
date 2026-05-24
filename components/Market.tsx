'use client';

import React, { useState } from 'react';

interface Listing {
  id: string;
  name: string;
  rank: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  power: number;
  emoji: string;
  price: number;
  seller: string;
  listedAt: string;
  abilities: string[];
  level: number;
}

const LISTINGS: Listing[] = [
  { id: '1', name: 'Diamond Throne #007', rank: 'Legendary', power: 200, emoji: '💎', price: 50000, seller: 'CryptoKing', listedAt: '2026-05-24', abilities: ['Royal Flush', 'Diamond Rain'], level: 7 },
  { id: '2', name: 'Platinum Paper #42', rank: 'Epic', power: 95, emoji: '🧻', price: 8000, seller: 'ShitMaster', listedAt: '2026-05-23', abilities: ['Paper Cut+', 'Unroll'], level: 4 },
  { id: '3', name: 'Golden Poop #001', rank: 'Mythic', power: 500, emoji: '🏆', price: 250000, seller: 'OGShitter', listedAt: '2026-05-20', abilities: ['Legendary Stink', 'Golden Touch', 'Toilet Throne'], level: 10 },
  { id: '4', name: 'Cyber Toilet 2077', rank: 'Rare', power: 65, emoji: '🤖', price: 2500, seller: 'TechPoop', listedAt: '2026-05-24', abilities: ['Hack Flush'], level: 3 },
  { id: '5', name: 'Ninja Roll #88', rank: 'Epic', power: 88, emoji: '🥷', price: 6000, seller: 'SilentButDeadly', listedAt: '2026-05-22', abilities: ['Stealth Mode', 'Silent Kill'], level: 5 },
];

const RANK_COLORS = {
  Common: 'from-zinc-600 to-zinc-500',
  Uncommon: 'from-green-600 to-emerald-500',
  Rare: 'from-blue-600 to-cyan-500',
  Epic: 'from-purple-600 to-pink-500',
  Legendary: 'from-amber-500 via-orange-500 to-red-500',
  Mythic: 'from-pink-600 via-purple-500 to-blue-500',
};

const CATEGORIES = [
  { id: 'all', label: 'All Items', icon: '🌟' },
  { id: 'characters', label: 'Characters', icon: '💩' },
  { id: 'weapons', label: 'Weapons', icon: '⚔️' },
  { id: 'boosts', label: 'Boosts', icon: '⚡' },
  { id: 'titles', label: 'Titles', icon: '🏅' },
];

export default function Market({ userId }: { userId: string }) {
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'power' | 'newest'>('newest');
  const [selectedItem, setSelectedItem] = useState<Listing | null>(null);
  const [showSell, setShowSell] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = LISTINGS.filter(item => 
    search === '' || item.name.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'power') return b.power - a.power;
    return new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime();
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8 relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 blur-2xl rounded-full"></div>
        <div className="relative">
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">🛒</div>
            <h1 className="text-4xl sm:text-5xl font-black mb-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Shit Market
            </h1>
            <p className="text-zinc-400">Buy, sell, and trade NFT soldiers & gear</p>
          </div>

          {/* Search & Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-zinc-900/50 border border-white/10 rounded-2xl focus:border-emerald-500/50 focus:outline-none"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
            </div>
            
            <div className="flex gap-3">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-2xl focus:outline-none"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="power">Highest Power</option>
              </select>
              
              <button 
                onClick={() => setShowSell(true)}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl font-bold hover:scale-105 transition-transform"
              >
                📤 Sell Item
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              category === cat.id
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                : 'bg-zinc-800/50 text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            <span className="mr-2">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Featured Item */}
      <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-500/30">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex items-center justify-center text-6xl animate-pulse shadow-2xl shadow-amber-500/30">
            🏆
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="inline-block px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold mb-2">
              🔥 FEATURED ITEM
            </div>
            <h2 className="text-3xl font-black mb-1">Golden Poop #001</h2>
            <p className="text-zinc-400 mb-3">The legendary first mint. One of a kind.</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm">
              <span className="text-amber-400 font-bold">Mythic Rank</span>
              <span>⚡ 500 Power</span>
              <span>⭐ Level 10</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-amber-400 mb-1">250,000 $SHIT</div>
            <button className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-amber-500/20">
              💰 BUY NOW
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div 
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group relative p-4 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-emerald-500/50 transition-all hover:scale-105 cursor-pointer"
          >
            {/* Glow */}
            <div className={`absolute -inset-px bg-gradient-to-r ${RANK_COLORS[item.rank]} opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity blur-xl`} />
            
            <div className="relative">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${RANK_COLORS[item.rank]} flex items-center justify-center text-3xl shadow-lg`}>
                  {item.emoji}
                </div>
                <div className={`inline-block px-2 py-1 rounded-lg text-[10px] font-bold bg-gradient-to-r ${RANK_COLORS[item.rank]} text-white`}>
                  {item.rank}
                </div>
              </div>
              
              {/* Info */}
              <h3 className="font-bold text-sm mb-1 truncate">{item.name}</h3>
              
              <div className="flex items-center gap-3 text-xs text-zinc-400 mb-3">
                <span>⚡ {item.power}</span>
                <span>⭐ Lvl {item.level}</span>
              </div>
              
              {/* Abilities preview */}
              <div className="flex flex-wrap gap-1 mb-3">
                {item.abilities.slice(0, 2).map((ability, i) => (
                  <span key={i} className="px-2 py-1 bg-zinc-800 rounded text-[10px] text-zinc-400">
                    {ability}
                  </span>
                ))}
                {item.abilities.length > 2 && (
                  <span className="px-2 py-1 bg-zinc-800 rounded text-[10px] text-zinc-500">
                    +{item.abilities.length - 2}
                  </span>
                )}
              </div>
              
              {/* Price & Seller */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="text-emerald-400 font-bold">{item.price.toLocaleString()} $SHIT</div>
                <div className="text-xs text-zinc-500">@{item.seller}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Sales */}
      <div className="mt-8 p-6 bg-zinc-900/30 rounded-2xl border border-white/5">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <span>📈</span> Recent Sales
        </h3>
        <div className="space-y-2">
          {[
            { item: 'Golden Throne #003', price: 45000, time: '2 min ago' },
            { item: 'Silver Paper #22', price: 3200, time: '5 min ago' },
            { item: 'Cyber Poop #77', price: 8900, time: '12 min ago' },
          ].map((sale, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-xl text-sm">
              <span className="text-zinc-300">{sale.item}</span>
              <div className="flex items-center gap-4">
                <span className="text-emerald-400 font-bold">{sale.price.toLocaleString()} $SHIT</span>
                <span className="text-zinc-500 text-xs">{sale.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl max-w-lg w-full border border-white/10 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`inline-block px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${RANK_COLORS[selectedItem.rank]} text-white`}>
                {selectedItem.rank}
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-zinc-400 hover:text-white text-xl">✕</button>
            </div>
            
            <div className="text-center mb-6">
              <div className={`w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br ${RANK_COLORS[selectedItem.rank]} flex items-center justify-center text-6xl mb-4 shadow-2xl`}>
                {selectedItem.emoji}
              </div>
              <h2 className="text-2xl font-black">{selectedItem.name}</h2>
              <p className="text-zinc-400 text-sm">Listed by @{selectedItem.seller}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-3 bg-zinc-800 rounded-xl text-center">
                <div className="text-xl font-bold text-amber-400">{selectedItem.level}</div>
                <div className="text-xs text-zinc-500">Level</div>
              </div>
              <div className="p-3 bg-zinc-800 rounded-xl text-center">
                <div className="text-xl font-bold text-purple-400">{selectedItem.power}</div>
                <div className="text-xs text-zinc-500">Power</div>
              </div>
              <div className="p-3 bg-zinc-800 rounded-xl text-center">
                <div className="text-xl font-bold text-emerald-400">{selectedItem.price.toLocaleString()}</div>
                <div className="text-xs text-zinc-500">Price</div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-bold mb-2 text-sm">Abilities</h4>
              <div className="flex flex-wrap gap-2">
                {selectedItem.abilities.map((ability, i) => (
                  <span key={i} className="px-3 py-2 bg-zinc-800 rounded-xl text-sm">
                    {ability}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedItem(null)}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={() => setSelectedItem(null)}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl font-bold hover:scale-105 transition-transform"
              >
                💰 BUY NOW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sell Modal */}
      {showSell && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl max-w-md w-full border border-white/10 p-6">
            <h2 className="text-2xl font-black mb-4 text-center">📤 List Item for Sale</h2>
            
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-zinc-800/50 rounded-2xl border border-white/10">
                <div className="text-sm text-zinc-500 mb-2">Select item from inventory</div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                    🚽
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">Toilet Warrior #042</div>
                    <div className="text-xs text-zinc-500">Epic • Level 5 • 78 PWR</div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Price ($SHIT)</label>
                <input 
                  type="number" 
                  placeholder="Enter price..."
                  className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10 focus:border-emerald-500/50 focus:outline-none"
                />
              </div>
              
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-sm">
                <span className="text-amber-400">💡</span> Market fee: 5% (250 $SHIT minimum)
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowSell(false)}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowSell(false)}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl font-bold hover:scale-105 transition-transform"
              >
                📤 LIST ITEM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
