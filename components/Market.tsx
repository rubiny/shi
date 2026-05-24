'use client';

import React, { useState } from 'react';

type ItemCategory = 'all' | 'soldiers' | 'boosts' | 'titles' | 'cosmetics';
type ItemRank = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
type SortBy = 'price-low' | 'price-high' | 'power' | 'newest';

interface MarketItem {
  id: string;
  name: string;
  category: Exclude<ItemCategory, 'all'>;
  rank: ItemRank;
  price: number;
  seller: string;
  emoji: string;
  description: string;
  listedAt: string;
  power?: number;
  level?: number;
  abilities?: string[];
  duration?: string;
  effect?: string;
}

const RANK_COLORS: Record<ItemRank, string> = {
  Common: 'from-zinc-600 to-zinc-500',
  Uncommon: 'from-green-600 to-green-500',
  Rare: 'from-blue-600 to-cyan-500',
  Epic: 'from-purple-600 to-pink-500',
  Legendary: 'from-amber-500 via-orange-500 to-red-500',
  Mythic: 'from-pink-600 via-purple-500 to-blue-500',
};

const CATEGORIES: { id: ItemCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'All Items', icon: '🌟' },
  { id: 'soldiers', label: 'Soldiers', icon: '💩' },
  { id: 'boosts', label: 'Boosts', icon: '⚡' },
  { id: 'titles', label: 'Titles', icon: '🏅' },
  { id: 'cosmetics', label: 'Cosmetics', icon: '🎨' },
];

const LISTINGS: MarketItem[] = [
  // Soldiers
  { id: 's1', name: 'Diamond Throne #007', category: 'soldiers', rank: 'Legendary', price: 50000, seller: 'CryptoKing', emoji: '💎', description: 'Lvl 7 legendary with Royal Flush ability', listedAt: '2026-05-24', power: 200, level: 7, abilities: ['Royal Flush', 'Diamond Rain'] },
  { id: 's2', name: 'Cyber Toilet 2077', category: 'soldiers', rank: 'Rare', price: 2500, seller: 'TechPoop', emoji: '🤖', description: 'Tech-enhanced warrior with hack abilities', listedAt: '2026-05-24', power: 65, level: 3, abilities: ['Hack Flush'] },
  { id: 's3', name: 'Golden Poop #001', category: 'soldiers', rank: 'Mythic', price: 250000, seller: 'OGShitter', emoji: '🏆', description: 'The legendary first mint. One of a kind.', listedAt: '2026-05-20', power: 500, level: 10, abilities: ['Legendary Stink', 'Golden Touch', 'Toilet Throne'] },
  { id: 's4', name: 'Platinum Paper #42', category: 'soldiers', rank: 'Epic', price: 8000, seller: 'ShitMaster', emoji: '🧻', description: 'High-level paper ninja', listedAt: '2026-05-23', power: 95, level: 4, abilities: ['Paper Cut+', 'Unroll'] },
  { id: 's5', name: 'Ninja Roll #88', category: 'soldiers', rank: 'Epic', price: 6000, seller: 'SilentButDeadly', emoji: '🥷', description: 'Silent assassin class', listedAt: '2026-05-22', power: 88, level: 5, abilities: ['Stealth Mode', 'Silent Kill'] },

  // Boosts
  { id: 'b1', name: 'Offerwall Surge', category: 'boosts', rank: 'Rare', price: 1500, seller: 'BoostDealer', emoji: '⚡', description: '+25% offerwall rewards for 24 hours', listedAt: '2026-05-24', duration: '24h', effect: '+25% offerwall' },
  { id: 'b2', name: 'Mission Overdrive', category: 'boosts', rank: 'Epic', price: 3000, seller: 'PowerUp420', emoji: '🚀', description: '2x mission rewards for 12 hours', listedAt: '2026-05-24', duration: '12h', effect: '2x mission rewards' },
  { id: 'b3', name: 'XP Amplifier', category: 'boosts', rank: 'Uncommon', price: 500, seller: 'LevelGrinder', emoji: '📈', description: '+50% XP gain for 6 hours', listedAt: '2026-05-23', duration: '6h', effect: '+50% XP' },
  { id: 'b4', name: 'Staking Maximizer', category: 'boosts', rank: 'Legendary', price: 12000, seller: 'APYKing', emoji: '💎', description: '+10% APY on all stakes for 7 days', listedAt: '2026-05-22', duration: '7d', effect: '+10% staking APY' },
  { id: 'b5', name: 'Lucky Charm', category: 'boosts', rank: 'Rare', price: 2000, seller: 'FortuneCookie', emoji: '🍀', description: '+3 daily spins on Lucky Wheel for 3 days', listedAt: '2026-05-24', duration: '3d', effect: '+3 daily spins' },

  // Titles
  { id: 't1', name: 'Shit Commander', category: 'titles', rank: 'Epic', price: 5000, seller: 'TitleShop', emoji: '🎖️', description: 'Purple title badge next to your name', listedAt: '2026-05-24', effect: 'Purple name badge' },
  { id: 't2', name: 'Toilet Emperor', category: 'titles', rank: 'Legendary', price: 25000, seller: 'TitleShop', emoji: '👑', description: 'Gold animated title with crown', listedAt: '2026-05-23', effect: 'Gold animated badge' },
  { id: 't3', name: 'OG Soldier', category: 'titles', rank: 'Rare', price: 3000, seller: 'VeteranSeller', emoji: '🪖', description: 'Blue veteran badge — show your loyalty', listedAt: '2026-05-22', effect: 'Blue veteran badge' },
  { id: 't4', name: 'Diamond Hands', category: 'titles', rank: 'Mythic', price: 100000, seller: 'HODLer', emoji: '💎', description: 'Animated diamond title — ultimate flex', listedAt: '2026-05-20', effect: 'Animated diamond badge' },

  // Cosmetics
  { id: 'c1', name: 'Golden Profile Frame', category: 'cosmetics', rank: 'Epic', price: 4000, seller: 'StyleKing', emoji: '🖼️', description: 'Gold animated border around your profile', listedAt: '2026-05-24', effect: 'Gold profile frame' },
  { id: 'c2', name: 'Rainbow Trail', category: 'cosmetics', rank: 'Rare', price: 2000, seller: 'EffectsMaster', emoji: '🌈', description: 'Rainbow particle trail on your avatar', listedAt: '2026-05-23', effect: 'Rainbow trail effect' },
  { id: 'c3', name: 'Fire Aura', category: 'cosmetics', rank: 'Legendary', price: 15000, seller: 'PyroSeller', emoji: '🔥', description: 'Flaming aura effect around your avatar', listedAt: '2026-05-22', effect: 'Fire aura effect' },
];

const RECENT_SALES = [
  { item: 'Golden Throne #003', price: 45000, time: '2 min ago', rank: 'Legendary' as ItemRank },
  { item: 'Offerwall Surge x3', price: 4500, time: '5 min ago', rank: 'Rare' as ItemRank },
  { item: 'Silver Paper #22', price: 3200, time: '8 min ago', rank: 'Uncommon' as ItemRank },
  { item: 'Shit Commander Title', price: 5000, time: '12 min ago', rank: 'Epic' as ItemRank },
  { item: 'Cyber Poop #77', price: 8900, time: '18 min ago', rank: 'Rare' as ItemRank },
];

export default function Market({ userId: _userId }: { userId: string }) {
  const [category, setCategory] = useState<ItemCategory>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [showSell, setShowSell] = useState(false);
  const [search, setSearch] = useState('');
  const [buyConfirm, setBuyConfirm] = useState<MarketItem | null>(null);
  const [sellPrice, setSellPrice] = useState('');

  const filtered = LISTINGS
    .filter(item => category === 'all' || item.category === category)
    .filter(item => search === '' || item.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'power') return (b.power || 0) - (a.power || 0);
      return new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime();
    });

  const categoryCount = (cat: ItemCategory) =>
    cat === 'all' ? LISTINGS.length : LISTINGS.filter(i => i.category === cat).length;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8 relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 blur-2xl rounded-full" />
        <div className="relative">
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">🛒</div>
            <h1 className="text-4xl sm:text-5xl font-black mb-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Shit Market
            </h1>
            <p className="text-zinc-400">Trade soldiers, buy boosts, flex with titles</p>
          </div>

          {/* Quick Stats */}
          <div className="flex justify-center gap-6 mb-6 text-center">
            <div className="px-4 py-2 bg-zinc-900/50 rounded-xl border border-white/10">
              <div className="text-lg font-black text-amber-400">{LISTINGS.length}</div>
              <div className="text-[10px] text-zinc-500 uppercase">Listed</div>
            </div>
            <div className="px-4 py-2 bg-zinc-900/50 rounded-xl border border-white/10">
              <div className="text-lg font-black text-green-400">7.5%</div>
              <div className="text-[10px] text-zinc-500 uppercase">Fee</div>
            </div>
            <div className="px-4 py-2 bg-zinc-900/50 rounded-xl border border-white/10">
              <div className="text-lg font-black text-purple-400">66.6K</div>
              <div className="text-[10px] text-zinc-500 uppercase">24h Volume</div>
            </div>
          </div>

          {/* Search & Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-zinc-900/50 border border-white/10 rounded-2xl focus:border-amber-500/50 focus:outline-none"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-2xl focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="power">Highest Power</option>
            </select>
            <button
              onClick={() => setShowSell(true)}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-black hover:scale-105 transition-transform shadow-lg shadow-amber-500/20"
            >
              📤 Sell Item
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              category === cat.id
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg'
                : 'bg-zinc-800/50 text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            <span className="mr-1.5">{cat.icon}</span>
            {cat.label}
            <span className="ml-1.5 text-xs opacity-70">({categoryCount(cat.id)})</span>
          </button>
        ))}
      </div>

      {/* Featured Item */}
      {category === 'all' && (
        <div className="mb-6 p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-600 via-purple-500 to-blue-500 flex items-center justify-center text-5xl shadow-2xl">
              🏆
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-block px-2 py-0.5 bg-red-500/20 text-red-400 rounded-lg text-[10px] font-bold mb-1">🔥 FEATURED</div>
              <h2 className="text-2xl font-black mb-1">Golden Poop #001</h2>
              <p className="text-zinc-400 text-sm mb-2">The legendary first mint. One of a kind.</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs">
                <span className="text-amber-400 font-bold">Mythic</span>
                <span>⚡ 500 PWR</span>
                <span>⭐ Level 10</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-amber-400 mb-2">250,000 $SHIT</div>
              <button
                onClick={() => setBuyConfirm(LISTINGS.find(l => l.id === 's3') || null)}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg shadow-amber-500/20"
              >
                💰 BUY NOW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Info Banners */}
      {category === 'boosts' && (
        <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <div className="font-bold text-sm">Boosts give temporary power-ups</div>
              <div className="text-xs text-zinc-400">Offerwall bonuses, mission multipliers, extra spins, APY bonuses — effects activate on purchase</div>
            </div>
          </div>
        </div>
      )}
      {category === 'titles' && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏅</span>
            <div>
              <div className="font-bold text-sm">Titles appear next to your name</div>
              <div className="text-xs text-zinc-400">Show off on leaderboards, in chat, and on your profile. Higher rarity = more impressive animation</div>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group relative p-4 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-amber-500/40 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className={`absolute -inset-px bg-gradient-to-r ${RANK_COLORS[item.rank]} opacity-0 group-hover:opacity-15 rounded-2xl transition-opacity blur-xl`} />
            <div className="relative">
              <div className="flex justify-between items-start mb-3">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${RANK_COLORS[item.rank]} flex items-center justify-center text-2xl shadow-lg`}>
                  {item.emoji}
                </div>
                <div className="text-right space-y-1">
                  <div className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gradient-to-r ${RANK_COLORS[item.rank]} text-white`}>
                    {item.rank}
                  </div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">{item.category}</div>
                </div>
              </div>

              <h3 className="font-bold text-sm mb-1 truncate">{item.name}</h3>

              {item.category === 'soldiers' && (
                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                  <span>⚡ {item.power}</span>
                  <span>⭐ Lvl {item.level}</span>
                </div>
              )}
              {item.category === 'boosts' && (
                <div className="flex items-center gap-2 text-xs mb-2">
                  <span className="text-purple-400 font-bold">{item.effect}</span>
                  <span className="text-zinc-500">• {item.duration}</span>
                </div>
              )}
              {(item.category === 'titles' || item.category === 'cosmetics') && (
                <div className="text-xs text-purple-400 font-bold mb-2">{item.effect}</div>
              )}

              {item.abilities && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.abilities.slice(0, 2).map((a, i) => (
                    <span key={i} className="px-2 py-0.5 bg-zinc-800 rounded text-[10px] text-zinc-400">{a}</span>
                  ))}
                  {item.abilities.length > 2 && <span className="px-2 py-0.5 bg-zinc-800 rounded text-[10px] text-zinc-500">+{item.abilities.length - 2}</span>}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="text-amber-400 font-bold text-sm">{item.price.toLocaleString()} $SHIT</div>
                <div className="text-[10px] text-zinc-500">@{item.seller}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Sales */}
      <div className="p-5 bg-zinc-900/30 rounded-2xl border border-white/5">
        <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
          📈 Recent Sales
        </h3>
        <div className="space-y-1.5">
          {RECENT_SALES.map((sale, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 bg-zinc-800/30 rounded-xl text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${RANK_COLORS[sale.rank]}`} />
                <span className="text-zinc-300">{sale.item}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-amber-400 font-bold">{sale.price.toLocaleString()} $SHIT</span>
                <span className="text-zinc-500 text-xs">{sale.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && !buyConfirm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl max-w-lg w-full border border-white/10 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className={`inline-block px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${RANK_COLORS[selectedItem.rank]} text-white`}>
                  {selectedItem.rank}
                </div>
                <span className="text-xs text-zinc-500 uppercase font-bold">{selectedItem.category}</span>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-zinc-400 hover:text-white text-xl">✕</button>
            </div>

            <div className="text-center mb-6">
              <div className={`w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br ${RANK_COLORS[selectedItem.rank]} flex items-center justify-center text-5xl mb-4 shadow-2xl`}>
                {selectedItem.emoji}
              </div>
              <h2 className="text-2xl font-black">{selectedItem.name}</h2>
              <p className="text-zinc-400 text-sm mt-1">{selectedItem.description}</p>
              <p className="text-zinc-500 text-xs mt-1">Listed by @{selectedItem.seller}</p>
            </div>

            {selectedItem.category === 'soldiers' && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-zinc-800 rounded-xl text-center">
                  <div className="text-xl font-bold text-amber-400">{selectedItem.level}</div>
                  <div className="text-[10px] text-zinc-500">Level</div>
                </div>
                <div className="p-3 bg-zinc-800 rounded-xl text-center">
                  <div className="text-xl font-bold text-purple-400">{selectedItem.power}</div>
                  <div className="text-[10px] text-zinc-500">Power</div>
                </div>
                <div className="p-3 bg-zinc-800 rounded-xl text-center">
                  <div className="text-xl font-bold text-green-400">{selectedItem.abilities?.length || 0}</div>
                  <div className="text-[10px] text-zinc-500">Abilities</div>
                </div>
              </div>
            )}

            {selectedItem.category === 'boosts' && (
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-400">Effect</span>
                  <span className="font-bold text-purple-400">{selectedItem.effect}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Duration</span>
                  <span className="font-bold">{selectedItem.duration}</span>
                </div>
              </div>
            )}

            {(selectedItem.category === 'titles' || selectedItem.category === 'cosmetics') && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-4 text-center">
                <div className="text-sm text-zinc-400">Effect</div>
                <div className="font-bold text-amber-400">{selectedItem.effect}</div>
              </div>
            )}

            {selectedItem.abilities && (
              <div className="mb-4">
                <div className="text-xs font-bold text-zinc-500 uppercase mb-2">Abilities</div>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.abilities.map((a, i) => (
                    <span key={i} className="px-3 py-1.5 bg-zinc-800 rounded-xl text-sm">{a}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-zinc-800/50 rounded-2xl mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-400">Price</span>
                <span className="font-black text-amber-400 text-lg">{selectedItem.price.toLocaleString()} $SHIT</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Platform fee (7.5%)</span>
                <span className="text-zinc-500">{Math.floor(selectedItem.price * 0.075).toLocaleString()} $SHIT</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSelectedItem(null)} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-bold">
                Close
              </button>
              <button
                onClick={() => { setBuyConfirm(selectedItem); setSelectedItem(null); }}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-black hover:scale-105 transition-transform shadow-lg shadow-amber-500/20"
              >
                💰 BUY NOW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buy Confirmation Modal */}
      {buyConfirm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl max-w-md w-full border border-white/10 p-6">
            <h2 className="text-xl font-black mb-4 text-center">Confirm Purchase</h2>

            <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-2xl mb-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${RANK_COLORS[buyConfirm.rank]} flex items-center justify-center text-3xl`}>
                {buyConfirm.emoji}
              </div>
              <div className="flex-1">
                <div className="font-bold">{buyConfirm.name}</div>
                <div className="text-xs text-zinc-400">{buyConfirm.rank} {buyConfirm.category}</div>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Item price</span>
                <span className="font-bold">{buyConfirm.price.toLocaleString()} $SHIT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Platform fee (7.5%)</span>
                <span className="font-bold">{Math.floor(buyConfirm.price * 0.075).toLocaleString()} $SHIT</span>
              </div>
              <div className="border-t border-amber-500/30 pt-2 flex justify-between text-sm">
                <span className="text-zinc-400">Total</span>
                <span className="font-black text-amber-400 text-lg">{Math.floor(buyConfirm.price * 1.075).toLocaleString()} $SHIT</span>
              </div>
            </div>

            {buyConfirm.category === 'boosts' && (
              <div className="text-xs text-center text-purple-400 mb-4">
                ⚡ Effect activates immediately after purchase: {buyConfirm.effect} for {buyConfirm.duration}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setBuyConfirm(null)} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-bold">
                Cancel
              </button>
              <button
                onClick={() => setBuyConfirm(null)}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-black hover:scale-105 transition-transform shadow-lg shadow-amber-500/20"
              >
                💰 CONFIRM BUY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sell Modal */}
      {showSell && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl max-w-md w-full border border-white/10 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black">📤 List Item for Sale</h2>
              <button onClick={() => setShowSell(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-zinc-800/50 rounded-2xl border border-white/10">
                <div className="text-xs text-zinc-500 mb-2">Select from inventory</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { emoji: '🚽', name: 'Toilet Warrior', rank: 'Epic' as ItemRank },
                    { emoji: '🧻', name: 'Paper Ninja', rank: 'Uncommon' as ItemRank },
                    { emoji: '💩', name: 'Poop Soldier', rank: 'Rare' as ItemRank },
                  ].map((item, i) => (
                    <button key={i} className="p-3 bg-zinc-700/50 hover:bg-zinc-700 rounded-xl text-center transition-colors">
                      <div className="text-2xl mb-1">{item.emoji}</div>
                      <div className="text-[10px] font-bold truncate">{item.name}</div>
                      <div className={`text-[10px] bg-gradient-to-r ${RANK_COLORS[item.rank]} bg-clip-text text-transparent font-bold`}>{item.rank}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Set Price ($SHIT)</label>
                <input
                  type="number"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  placeholder="Enter price..."
                  className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-xl focus:border-amber-500/50 focus:outline-none"
                />
                {sellPrice && (
                  <div className="text-xs text-zinc-500 mt-1">
                    You receive: {Math.floor(Number(sellPrice) * 0.925).toLocaleString()} $SHIT (after 7.5% fee)
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowSell(false)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-black hover:scale-105 transition-transform shadow-lg shadow-amber-500/20"
            >
              📤 LIST FOR SALE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
