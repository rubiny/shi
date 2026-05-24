'use client';

import React, { useState } from 'react';

type ItemCategory = 'all' | 'degens' | 'juice' | 'drip' | 'flex';
type ItemRank = 'Normie' | 'Degen' | 'Ape' | 'Chad' | 'Whale' | 'GigaChad';
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
  skills?: string[];
  duration?: string;
  effect?: string;
}

const RANK_COLORS: Record<ItemRank, string> = {
  Normie: 'from-zinc-600 to-zinc-500',
  Degen: 'from-green-600 to-green-500',
  Ape: 'from-blue-600 to-cyan-500',
  Chad: 'from-purple-600 to-pink-500',
  Whale: 'from-amber-500 via-orange-500 to-red-500',
  GigaChad: 'from-pink-600 via-purple-500 to-blue-500',
};

const CATEGORIES: { id: ItemCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'ALL LOOT', icon: '💀' },
  { id: 'degens', label: 'DEGENS', icon: '💩' },
  { id: 'juice', label: 'JUICE', icon: '⚡' },
  { id: 'drip', label: 'DRIP', icon: '👑' },
  { id: 'flex', label: 'FLEX', icon: '🔥' },
];

const LISTINGS: MarketItem[] = [
  // Degens (soldiers)
  { id: 's1', name: 'Diamond Hands Dan #007', category: 'degens', rank: 'Whale', price: 50000, seller: '0xChadKing', emoji: '💎', description: 'LVL 7 whale who never sold. ever. diamond hands till death.', listedAt: '2026-05-24', power: 200, level: 7, skills: ['Market Crash', 'Diamond Rain'] },
  { id: 's2', name: 'Cyber Shitter 2077', category: 'degens', rank: 'Ape', price: 2500, seller: '0xTechPoop', emoji: '🤖', description: 'bot-enhanced degen. auto-farms while you sleep.', listedAt: '2026-05-24', power: 65, level: 3, skills: ['MEV Sandwich'] },
  { id: 's3', name: 'Golden Turd #001', category: 'degens', rank: 'GigaChad', price: 250000, seller: '0xOGShitter', emoji: '🏆', description: 'THE genesis mint. the OG. the one and only. if you know you know.', listedAt: '2026-05-20', power: 500, level: 10, skills: ['God Flush', 'Infinite Liquidity', 'Toilet Singularity'] },
  { id: 's4', name: 'Septic Sigma #42', category: 'degens', rank: 'Chad', price: 8000, seller: '0xGrindset', emoji: '🧻', description: 'sigma grindset. no breaks. no sleep. only $SHIT.', listedAt: '2026-05-23', power: 95, level: 4, skills: ['Pump & Dump', 'Silent Dump'] },
  { id: 's5', name: 'Ninja Wiper #88', category: 'degens', rank: 'Chad', price: 6000, seller: '0xSilentFart', emoji: '🥷', description: 'you never see him coming. or smelling.', listedAt: '2026-05-22', power: 88, level: 5, skills: ['Stealth Mode', 'Silent Kill'] },

  // Juice (boosts)
  { id: 'b1', name: 'OFFERWALL CRACK', category: 'juice', rank: 'Ape', price: 1500, seller: '0xJuiceDealer', emoji: '💉', description: '+25% offerwall gains for 24h. inject this into your bags.', listedAt: '2026-05-24', duration: '24h', effect: '+25% offerwall rewards' },
  { id: 'b2', name: 'RAID STEROIDS', category: 'juice', rank: 'Chad', price: 3000, seller: '0xPumpItUp', emoji: '💊', description: '2x raid loot for 12h. your degens go berserk.', listedAt: '2026-05-24', duration: '12h', effect: '2x mission loot' },
  { id: 'b3', name: 'XP SPEEDBALL', category: 'juice', rank: 'Degen', price: 500, seller: '0xLevelMaxxer', emoji: '🧪', description: '+50% XP for 6h. level up or die trying.', listedAt: '2026-05-23', duration: '6h', effect: '+50% XP gains' },
  { id: 'b4', name: 'APY HOPIUM', category: 'juice', rank: 'Whale', price: 12000, seller: '0xYieldChad', emoji: '🫧', description: '+10% APY on all stakes for 7 days. pure hopium.', listedAt: '2026-05-22', duration: '7d', effect: '+10% staking APY' },
  { id: 'b5', name: 'LUCKY TOILET WATER', category: 'juice', rank: 'Ape', price: 2000, seller: '0xGambler', emoji: '🍀', description: '+3 daily spins for 3 days. sip the forbidden water.', listedAt: '2026-05-24', duration: '3d', effect: '+3 daily spins' },

  // Drip (titles)
  { id: 't1', name: 'SHIT COMMANDER', category: 'drip', rank: 'Chad', price: 5000, seller: '0xTitleKing', emoji: '🎖️', description: 'purple badge of honor. you command the sewers now.', listedAt: '2026-05-24', effect: 'Purple name badge' },
  { id: 't2', name: 'TOILET EMPEROR', category: 'drip', rank: 'Whale', price: 25000, seller: '0xTitleKing', emoji: '👑', description: 'gold animated crown. bow down peasants.', listedAt: '2026-05-23', effect: 'Gold animated crown badge' },
  { id: 't3', name: 'OG DEGEN', category: 'drip', rank: 'Ape', price: 3000, seller: '0xVeteran', emoji: '🪖', description: 'you were here before it was cool. respect.', listedAt: '2026-05-22', effect: 'Blue OG badge' },
  { id: 't4', name: 'DIAMOND HANDS', category: 'drip', rank: 'GigaChad', price: 100000, seller: '0xHODLer', emoji: '💎', description: 'animated diamond title. the ultimate flex. no paper hands allowed.', listedAt: '2026-05-20', effect: 'Animated diamond badge' },

  // Flex (cosmetics)
  { id: 'c1', name: 'GOLDEN TOILET FRAME', category: 'flex', rank: 'Chad', price: 4000, seller: '0xDripLord', emoji: '🖼️', description: 'gold border around your profile. certified rich degen.', listedAt: '2026-05-24', effect: 'Gold profile frame' },
  { id: 'c2', name: 'RAINBOW FART TRAIL', category: 'flex', rank: 'Ape', price: 2000, seller: '0xEffectGod', emoji: '🌈', description: 'rainbow particles follow your avatar. beautiful & disgusting.', listedAt: '2026-05-23', effect: 'Rainbow trail effect' },
  { id: 'c3', name: 'DUMPSTER FIRE AURA', category: 'flex', rank: 'Whale', price: 15000, seller: '0xFlameGuy', emoji: '🔥', description: 'your profile is literally on fire. because your bags are too.', listedAt: '2026-05-22', effect: 'Fire aura effect' },
];

const RECENT_SALES = [
  { item: 'Golden Shitter #003', price: 45000, time: '2m ago', rank: 'Whale' as ItemRank },
  { item: 'OFFERWALL CRACK x3', price: 4500, time: '5m ago', rank: 'Ape' as ItemRank },
  { item: 'RAID STEROIDS', price: 3000, time: '8m ago', rank: 'Chad' as ItemRank },
  { item: 'SHIT COMMANDER title', price: 5000, time: '12m ago', rank: 'Chad' as ItemRank },
  { item: 'Cyber Shitter 2077', price: 8900, time: '18m ago', rank: 'Ape' as ItemRank },
  { item: 'DIAMOND HANDS title', price: 100000, time: '23m ago', rank: 'GigaChad' as ItemRank },
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
            <div className="text-5xl mb-2">🏪</div>
            <h1 className="text-4xl sm:text-5xl font-black mb-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent uppercase tracking-tight">
              SHIT BAZAAR
            </h1>
            <p className="text-zinc-600 text-sm uppercase tracking-widest">trade degens. buy juice. flex on normies. no refunds.</p>
          </div>

          {/* Floor Stats */}
          <div className="flex justify-center gap-4 mb-6 text-center">
            <div className="px-4 py-3 bg-zinc-900/70 rounded-xl border border-amber-500/20">
              <div className="text-xl font-black text-amber-400">{LISTINGS.length}</div>
              <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider">LISTED</div>
            </div>
            <div className="px-4 py-3 bg-zinc-900/70 rounded-xl border border-amber-500/20">
              <div className="text-xl font-black text-red-400">7.5%</div>
              <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider">TAX</div>
            </div>
            <div className="px-4 py-3 bg-zinc-900/70 rounded-xl border border-amber-500/20">
              <div className="text-xl font-black text-green-400">66.6K</div>
              <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider">24H VOL</div>
            </div>
            <div className="px-4 py-3 bg-zinc-900/70 rounded-xl border border-amber-500/20">
              <div className="text-xl font-black text-purple-400">2.5K</div>
              <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider">FLOOR</div>
            </div>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="search the bazaar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-zinc-900/70 border border-white/5 rounded-2xl focus:border-amber-500/50 focus:outline-none text-sm placeholder:text-zinc-700"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700">🔍</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-4 py-3 bg-zinc-900/70 border border-white/5 rounded-2xl focus:outline-none text-sm"
            >
              <option value="newest">NEWEST</option>
              <option value="price-low">CHEAPEST</option>
              <option value="price-high">MOST EXPENSIVE</option>
              <option value="power">MOST POWER</option>
            </select>
            <button
              onClick={() => setShowSell(true)}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-black uppercase tracking-wider text-sm hover:scale-105 transition-transform shadow-lg shadow-amber-500/30"
            >
              📤 DUMP
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
            className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
              category === cat.id
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/30'
                : 'bg-zinc-800/50 text-zinc-600 hover:text-amber-400 border border-white/5 hover:border-amber-500/30'
            }`}
          >
            <span className="mr-1.5">{cat.icon}</span>
            {cat.label}
            <span className="ml-1.5 opacity-60">({categoryCount(cat.id)})</span>
          </button>
        ))}
      </div>

      {/* Category Banners */}
      {category === 'juice' && (
        <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💉</span>
            <div>
              <div className="font-black text-sm uppercase">JUICE = TEMPORARY POWER-UPS</div>
              <div className="text-xs text-zinc-500">offerwall boosts, raid multipliers, extra spins, APY hopium. effects activate instantly. no cap.</div>
            </div>
          </div>
        </div>
      )}
      {category === 'drip' && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <div>
              <div className="font-black text-sm uppercase">DRIP = FLEX ON THE LEADERBOARD</div>
              <div className="text-xs text-zinc-500">titles next to your name. everyone sees it. higher rarity = bigger flex. respect is earned ser.</div>
            </div>
          </div>
        </div>
      )}

      {/* Featured - only on ALL tab */}
      {category === 'all' && (
        <div className="mb-6 p-5 rounded-3xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 border border-pink-500/20 relative overflow-hidden">
          <div className="absolute top-2 right-3 text-[10px] text-red-400 font-black uppercase tracking-widest animate-pulse">🔥 GRAIL ALERT</div>
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-600 via-purple-500 to-blue-500 flex items-center justify-center text-5xl shadow-2xl shadow-purple-500/30">
              🏆
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-black uppercase tracking-wide mb-1">GOLDEN TURD #001</h2>
              <p className="text-zinc-500 text-sm mb-2 italic">&quot;the genesis mint. if you have to ask the price, you can&apos;t afford it.&quot;</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs">
                <span className="text-pink-400 font-black uppercase">GigaChad</span>
                <span>⚡ 500 PWR</span>
                <span>LVL 10</span>
                <span>3 skills</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-amber-400 mb-2">250,000 $SHIT</div>
              <button
                onClick={() => setBuyConfirm(LISTINGS.find(l => l.id === 's3') || null)}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-black uppercase tracking-wider text-sm hover:scale-105 transition-transform shadow-lg shadow-amber-500/30"
              >
                💰 APE IN
              </button>
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
            className="group relative p-4 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-amber-500/30 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className={`absolute -inset-px bg-gradient-to-r ${RANK_COLORS[item.rank]} opacity-0 group-hover:opacity-15 rounded-2xl transition-opacity blur-xl`} />
            <div className="relative">
              <div className="flex justify-between items-start mb-3">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${RANK_COLORS[item.rank]} flex items-center justify-center text-2xl shadow-lg`}>
                  {item.emoji}
                </div>
                <div className="text-right space-y-1">
                  <div className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${RANK_COLORS[item.rank]} text-white`}>
                    {item.rank}
                  </div>
                  <div className="text-[10px] text-zinc-700 uppercase font-black tracking-wider">{item.category}</div>
                </div>
              </div>

              <h3 className="font-black text-xs mb-1 uppercase tracking-wide truncate">{item.name}</h3>

              {item.category === 'degens' && (
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 mb-2">
                  <span>⚡ {item.power} PWR</span>
                  <span>LVL {item.level}</span>
                </div>
              )}
              {item.category === 'juice' && (
                <div className="flex items-center gap-2 text-[10px] mb-2">
                  <span className="text-purple-400 font-black">{item.effect}</span>
                  <span className="text-zinc-700">| {item.duration}</span>
                </div>
              )}
              {(item.category === 'drip' || item.category === 'flex') && (
                <div className="text-[10px] text-purple-400 font-bold mb-2">{item.effect}</div>
              )}

              {item.skills && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.skills.slice(0, 2).map((s, i) => (
                    <span key={i} className="px-2 py-0.5 bg-zinc-800/80 rounded text-[10px] text-zinc-500 font-bold">{s}</span>
                  ))}
                  {item.skills.length > 2 && <span className="px-2 py-0.5 bg-zinc-800/80 rounded text-[10px] text-zinc-600">+{item.skills.length - 2}</span>}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="text-amber-400 font-black text-sm">{item.price.toLocaleString()} $SHIT</div>
                <div className="text-[10px] text-zinc-700">{item.seller}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Sales */}
      <div className="p-5 bg-zinc-900/30 rounded-2xl border border-white/5">
        <h3 className="font-black mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
          📈 RECENT FLIPS
        </h3>
        <div className="space-y-1.5">
          {RECENT_SALES.map((sale, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 bg-zinc-800/30 rounded-xl text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${RANK_COLORS[sale.rank]}`} />
                <span className="text-zinc-400 text-xs font-bold uppercase">{sale.item}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-amber-400 font-black text-xs">{sale.price.toLocaleString()} $SHIT</span>
                <span className="text-zinc-700 text-[10px]">{sale.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && !buyConfirm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl max-w-lg w-full border border-amber-500/20 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r ${RANK_COLORS[selectedItem.rank]} text-white`}>
                  {selectedItem.rank}
                </div>
                <span className="text-[10px] text-zinc-600 uppercase font-black tracking-wider">{selectedItem.category}</span>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-zinc-600 hover:text-white text-xl">✕</button>
            </div>

            <div className="text-center mb-6">
              <div className={`w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br ${RANK_COLORS[selectedItem.rank]} flex items-center justify-center text-5xl mb-4 shadow-2xl`}>
                {selectedItem.emoji}
              </div>
              <h2 className="text-2xl font-black uppercase tracking-wide">{selectedItem.name}</h2>
              <p className="text-zinc-500 text-sm mt-1 italic">&quot;{selectedItem.description}&quot;</p>
              <p className="text-zinc-700 text-[10px] mt-1 uppercase">seller: {selectedItem.seller}</p>
            </div>

            {selectedItem.category === 'degens' && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-zinc-800/50 rounded-xl text-center">
                  <div className="text-xl font-black text-amber-400">{selectedItem.level}</div>
                  <div className="text-[10px] text-zinc-600 uppercase font-bold">LVL</div>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded-xl text-center">
                  <div className="text-xl font-black text-purple-400">{selectedItem.power}</div>
                  <div className="text-[10px] text-zinc-600 uppercase font-bold">PWR</div>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded-xl text-center">
                  <div className="text-xl font-black text-green-400">{selectedItem.skills?.length || 0}</div>
                  <div className="text-[10px] text-zinc-600 uppercase font-bold">SKILLS</div>
                </div>
              </div>
            )}

            {selectedItem.category === 'juice' && (
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-500 uppercase text-xs font-bold">Effect</span>
                  <span className="font-black text-purple-400">{selectedItem.effect}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 uppercase text-xs font-bold">Duration</span>
                  <span className="font-bold">{selectedItem.duration}</span>
                </div>
              </div>
            )}

            {(selectedItem.category === 'drip' || selectedItem.category === 'flex') && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-4 text-center">
                <div className="text-[10px] text-zinc-600 uppercase font-bold mb-1">WHAT YOU GET</div>
                <div className="font-black text-amber-400">{selectedItem.effect}</div>
              </div>
            )}

            {selectedItem.skills && (
              <div className="mb-4">
                <div className="text-[10px] font-black text-zinc-600 uppercase tracking-wider mb-2">SKILLS</div>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.skills.map((s, i) => (
                    <span key={i} className="px-3 py-1.5 bg-zinc-800/50 rounded-xl text-xs font-bold">{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-zinc-800/30 rounded-2xl mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-500 text-xs uppercase font-bold">Price</span>
                <span className="font-black text-amber-400 text-lg">{selectedItem.price.toLocaleString()} $SHIT</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-700">platform tax (7.5%)</span>
                <span className="text-zinc-600">{Math.floor(selectedItem.price * 0.075).toLocaleString()} $SHIT</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSelectedItem(null)} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-bold uppercase text-sm">
                NAH
              </button>
              <button
                onClick={() => { setBuyConfirm(selectedItem); setSelectedItem(null); }}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-black uppercase tracking-wider text-sm hover:scale-105 transition-transform shadow-lg shadow-amber-500/30"
              >
                💰 APE IN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buy Confirm */}
      {buyConfirm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl max-w-md w-full border border-amber-500/20 p-6">
            <h2 className="text-xl font-black mb-4 text-center uppercase tracking-wider">CONFIRM APE</h2>

            <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-2xl mb-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${RANK_COLORS[buyConfirm.rank]} flex items-center justify-center text-3xl`}>
                {buyConfirm.emoji}
              </div>
              <div className="flex-1">
                <div className="font-black uppercase text-sm">{buyConfirm.name}</div>
                <div className="text-xs text-zinc-600">{buyConfirm.rank} | {buyConfirm.category}</div>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 text-xs uppercase font-bold">Price</span>
                <span className="font-bold">{buyConfirm.price.toLocaleString()} $SHIT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 text-xs uppercase font-bold">Tax (7.5%)</span>
                <span className="font-bold">{Math.floor(buyConfirm.price * 0.075).toLocaleString()} $SHIT</span>
              </div>
              <div className="border-t border-amber-500/20 pt-2 flex justify-between">
                <span className="text-zinc-500 text-xs uppercase font-bold">TOTAL</span>
                <span className="font-black text-amber-400 text-lg">{Math.floor(buyConfirm.price * 1.075).toLocaleString()} $SHIT</span>
              </div>
            </div>

            {buyConfirm.category === 'juice' && (
              <div className="text-xs text-center text-purple-400 mb-4 font-bold uppercase">
                ⚡ activates instantly: {buyConfirm.effect} for {buyConfirm.duration}
              </div>
            )}

            <div className="text-[10px] text-zinc-700 text-center mb-4 uppercase tracking-wider">
              all sales final. no refunds. this is the way.
            </div>

            <div className="flex gap-3">
              <button onClick={() => setBuyConfirm(null)} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-bold uppercase text-sm">
                PAPER HANDS
              </button>
              <button
                onClick={() => setBuyConfirm(null)}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-black uppercase tracking-wider text-sm hover:scale-105 transition-transform shadow-lg shadow-amber-500/30"
              >
                💰 SEND IT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sell Modal */}
      {showSell && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl max-w-md w-full border border-amber-500/20 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black uppercase tracking-wider">📤 DUMP YOUR BAGS</h2>
              <button onClick={() => setShowSell(false)} className="text-zinc-600 hover:text-white">✕</button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-zinc-800/50 rounded-2xl border border-white/5">
                <div className="text-[10px] text-zinc-600 mb-2 uppercase font-bold tracking-wider">PICK WHAT TO DUMP</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { emoji: '🚽', name: 'Porcelain Punisher', rank: 'Chad' as ItemRank },
                    { emoji: '🧻', name: 'Wipe Wizard', rank: 'Degen' as ItemRank },
                    { emoji: '💩', name: 'Turd Burglar', rank: 'Ape' as ItemRank },
                  ].map((item, i) => (
                    <button key={i} className="p-3 bg-zinc-700/30 hover:bg-zinc-700/50 rounded-xl text-center transition-colors border border-white/5 hover:border-amber-500/30">
                      <div className="text-2xl mb-1">{item.emoji}</div>
                      <div className="text-[10px] font-black truncate uppercase">{item.name}</div>
                      <div className={`text-[10px] bg-gradient-to-r ${RANK_COLORS[item.rank]} bg-clip-text text-transparent font-black uppercase`}>{item.rank}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-600 mb-1 block uppercase font-bold tracking-wider">SET PRICE ($SHIT)</label>
                <input
                  type="number"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  placeholder="name your price ser..."
                  className="w-full px-4 py-3 bg-zinc-800 border border-white/5 rounded-xl focus:border-amber-500/50 focus:outline-none text-sm placeholder:text-zinc-700"
                />
                {sellPrice && (
                  <div className="text-[10px] text-zinc-600 mt-1">
                    you get: <span className="text-amber-400 font-bold">{Math.floor(Number(sellPrice) * 0.925).toLocaleString()} $SHIT</span> after 7.5% tax
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowSell(false)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-2xl font-black uppercase tracking-wider text-sm hover:scale-105 transition-transform shadow-lg shadow-amber-500/30"
            >
              📤 LIST IT
            </button>

            <div className="mt-2 text-[10px] text-zinc-700 text-center uppercase">7.5% goes to the shit treasury. cope.</div>
          </div>
        </div>
      )}
    </div>
  );
}
