'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CONFIG } from '@/lib/config';

interface LandingPageProps {
  onConnect?: () => void;
  onGoogle?: () => void;
}

const RANKS = [
  { name: 'Normie', emoji: '💩', color: '#71717a' },
  { name: 'Degen', emoji: '🧴', color: '#22c55e' },
  { name: 'Ape', emoji: '🚽', color: '#3b82f6' },
  { name: 'Chad', emoji: '🥷', color: '#a855f7' },
  { name: 'Whale', emoji: '👑', color: '#f59e0b' },
  { name: 'GigaChad', emoji: '🏆', color: '#ec4899' },
];

const LIVE_FEED_NAMES = ['0xChad', 'ShitKing420', 'DegenApe', 'ToiletWhale', 'FlushMaster', 'SewerRat69', 'PumpIt', 'PoopLord', 'CryptoTurd', 'DiamondCheeks'];
const LIVE_FEED_ACTIONS = [
  { action: 'just earned', amounts: [250, 500, 800, 1200, 2100], suffix: '$SHIT from offers' },
  { action: 'staked', amounts: [1000, 2500, 5000, 10000], suffix: '$SHIT' },
  { action: 'minted a', amounts: [0], suffix: '' },
  { action: 'claimed', amounts: [150, 300, 500], suffix: '$SHIT from missions' },
];

const MEME_GALLERY = [
  { emoji: '💩', title: 'when $SHIT moons', caption: 'by @ShitKing420 • earned 2,400 $SHIT from upvotes', likes: '12.4K', bg: 'from-amber-900/40 to-orange-900/40' },
  { emoji: '🚀', title: 'toilet to the moon', caption: 'by @CryptoDegenFR • featured meme of the week', likes: '8.9K', bg: 'from-blue-900/40 to-purple-900/40' },
  { emoji: '🧴', title: 'paper hands be like', caption: 'by @ToiletMaster • sold at the bottom lmao', likes: '23.1K', bg: 'from-red-900/40 to-pink-900/40' },
  { emoji: '💎', title: 'diamond hands only', caption: 'by @HODLer • staking since day 1', likes: '15.6K', bg: 'from-cyan-900/40 to-blue-900/40' },
  { emoji: '🚽', title: 'flush the bears', caption: 'by @FlushForce • bears r absolutely fuk', likes: '9.2K', bg: 'from-green-900/40 to-emerald-900/40' },
  { emoji: '🦍', title: 'apes together strong', caption: 'by @GuildLeader • posted from guild chat', likes: '18.7K', bg: 'from-purple-900/40 to-pink-900/40' },
];

export default function LandingPage({ onConnect, onGoogle }: LandingPageProps) {
  const [currentEmoji, setCurrentEmoji] = useState(0);
  const [activeRank, setActiveRank] = useState(3);
  const [liveFeed, setLiveFeed] = useState<Array<{ id: number; text: string }>>([]);
  const [calcOffers, setCalcOffers] = useState(5);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const emojiInterval = setInterval(() => {
      setCurrentEmoji(prev => (prev + 1) % 6);
    }, 2000);
    return () => clearInterval(emojiInterval);
  }, []);

  useEffect(() => {
    const generateFeedItem = () => {
      const name = LIVE_FEED_NAMES[Math.floor(Math.random() * LIVE_FEED_NAMES.length)];
      const actionData = LIVE_FEED_ACTIONS[Math.floor(Math.random() * LIVE_FEED_ACTIONS.length)];
      const amount = actionData.amounts[Math.floor(Math.random() * actionData.amounts.length)];
      const text = amount > 0
        ? `🔥 ${name} ${actionData.action} ${amount.toLocaleString()} ${actionData.suffix}`
        : `🔥 ${name} ${actionData.action} ${RANKS[Math.floor(Math.random() * RANKS.length)].name} soldier`;
      return { id: Date.now() + Math.random(), text };
    };
    setLiveFeed([generateFeedItem(), generateFeedItem()]);
    const feedInterval = setInterval(() => {
      setLiveFeed(prev => [generateFeedItem(), ...prev].slice(0, 3));
    }, 4000);
    return () => clearInterval(feedInterval);
  }, []);

  const emojis = ['💩', '🚽', '🧻', '💰', '🔥', '🚀'];

  const getSeasonCountdown = useCallback(() => {
    const end = new Date(CONFIG.BUSINESS.BATTLE_PASS.SEASON_END_DATE).getTime();
    const now = Date.now();
    const diff = end - now;
    if (diff <= 0) return 'Season ended';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${days}d ${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
  }, []);

  const [countdown, setCountdown] = useState(getSeasonCountdown);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getSeasonCountdown());
    }, 60000);
    return () => clearInterval(timer);
  }, [getSeasonCountdown]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💩</span>
              <span className="font-black text-xl tracking-tighter">
                SHIT<span className="text-amber-500">.ARMY</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => scrollToSection('how-it-works')} className="hidden sm:block text-zinc-400 hover:text-white text-sm transition-colors font-bold">
                HOW TO STACK
              </button>
              <button onClick={() => scrollToSection('rank-system')} className="hidden sm:block text-zinc-400 hover:text-white text-sm transition-colors font-bold">
                RANKS
              </button>
              <button 
                onClick={onConnect}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full font-black text-sm hover:scale-105 transition-transform shadow-lg shadow-amber-500/20"
              >
                {"\u{1F4A9}"} APE IN
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/8 rounded-full blur-[100px] animate-subtle-float" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-[100px] animate-subtle-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px] animate-pulse" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Floating emoji */}
            <motion.div 
              className="text-8xl mb-6"
              animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {emojis[currentEmoji]}
            </motion.div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-6 leading-tight">
              <motion.span 
                className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent inline-block animate-gradient-shift"
                style={{ backgroundSize: '200% 200%' }}
              >
                APE IN OR
              </motion.span>
              <br />
              <motion.span 
                className="text-white inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                STAY POOR
              </motion.span>
            </h1>

            <p className="text-xl sm:text-2xl text-zinc-400 max-w-3xl mx-auto mb-8">
              the most degen army on Base.
              <span className="text-amber-400 font-bold"> grind offers, stake $SHIT,</span> build your squad &
              <span className="text-amber-300 font-bold"> stack real bags</span>.
              <br />
              <span className="text-sm text-zinc-500">no rug. no cap. just poop & profit. {"\u{1F4A9}"}</span>
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-12">
              {[
                { value: `$${(CONFIG.PLATFORM_STATS.TOTAL_EARNED / 1_000_000).toFixed(1)}M`, label: 'LOOTED', icon: '💰' },
                { value: `${(CONFIG.PLATFORM_STATS.TOTAL_SOLDIERS / 1000).toFixed(0)}K`, label: 'DEGENS', icon: '🦍' },
                { value: `${(CONFIG.PLATFORM_STATS.OFFERS_COMPLETED / 1_000_000).toFixed(1)}M`, label: 'OFFERS CRUSHED', icon: '🎯' },
                { value: `${(CONFIG.PLATFORM_STATS.SHIT_STAKED / 1000).toFixed(0)}K`, label: 'BAGS LOCKED', icon: '🔒' }
              ].map((stat, i) => (
                <motion.div 
                  key={i} 
                  className="bg-zinc-900/50 border border-white/10 rounded-2xl px-6 py-4 backdrop-blur-sm glass-card-shine hover-lift cursor-default"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                >
                  <div className="text-lg mb-1">{stat.icon}</div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400 balance-glow">{stat.value}</div>
                  <div className="text-xs text-zinc-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onConnect}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl font-black text-lg shadow-lg shadow-amber-500/20 animate-glow-pulse"
              >
                💩 APE IN NOW
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGoogle}
                className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 border border-white/20 rounded-2xl font-bold text-lg"
              >
                🎮 GOOGLE LOGIN (NGMI WITHOUT IT)
              </motion.button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-500">
              <span className="flex items-center gap-2">
                <span className="text-amber-400">✓</span> instant withdrawals ser
              </span>
              <span className="flex items-center gap-2">
                <span className="text-amber-400">✓</span> no KYC under $500
              </span>
              <span className="flex items-center gap-2">
                <span className="text-amber-400">✓</span> built on Base. no cap.
              </span>
            </div>

            {/* Live Earnings Feed */}
            <div className="mt-8 max-w-md mx-auto space-y-2">
              {liveFeed.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-zinc-900/80 border border-amber-500/20 rounded-xl px-4 py-2 text-sm text-zinc-300 backdrop-blur-sm"
                >
                  {item.text}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="text-zinc-500 text-2xl">↓</div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-zinc-950 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              HOW TO <span className="text-amber-500">STACK $SHIT</span>
            </h2>
            <p className="text-zinc-400 text-lg">4 steps from normie to GigaChad</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                step: '1', 
                icon: '💩', 
                title: 'APE IN', 
                desc: 'connect wallet or google. 2 seconds. no email spam. no KYC (yet).',
                color: 'amber'
              },
              { 
                step: '2', 
                icon: '🎯', 
                title: 'GRIND OFFERS', 
                desc: 'surveys, apps, videos. 2-5 mins = 50-500 PTS. instant credit. ez money.',
                color: 'blue'
              },
              { 
                step: '3', 
                icon: '🔒', 
                title: 'LOCK YOUR BAGS', 
                desc: 'stake $SHIT for 32-67% APY. diamond hands = bigger bags.',
                color: 'emerald'
              },
              { 
                step: '4', 
                icon: '👥', 
                title: 'BUILD YOUR ARMY', 
                desc: 'recruit degens. earn 10% from their grind FOREVER. passive income ser.',
                color: 'purple'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6 hover:border-amber-500/30 transition-all glass-card-shine hover-lift"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-2xl mb-4">
                  {item.icon}
                </div>
                <div className="text-xs text-zinc-500 mb-2">Step {item.step}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Earning Calculator */}
      <section className="py-20 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black mb-3">
              HOW MUCH CAN YOU <span className="text-amber-500">STACK</span>?
            </h2>
            <p className="text-zinc-400">slide to see your potential bags ser</p>
          </div>
          <div className="bg-zinc-900/80 border border-amber-500/20 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-zinc-400">Offers per day:</span>
              <span className="text-2xl font-black text-amber-400">{calcOffers}</span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={calcOffers}
              onChange={(e) => setCalcOffers(Number(e.target.value))}
              className="w-full h-2 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-amber-500 mb-8"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-zinc-800/80 rounded-2xl p-5">
                <div className="text-xs text-zinc-500 mb-1">DAILY (MIN)</div>
                <div className="text-xl font-black text-zinc-400">{(calcOffers * 50).toLocaleString()}</div>
                <div className="text-xs text-zinc-500">$SHIT</div>
              </div>
              <div className="bg-zinc-800/80 rounded-2xl p-5">
                <div className="text-xs text-zinc-500 mb-1">DAILY (AVG)</div>
                <div className="text-xl font-black text-amber-400">{(calcOffers * 150).toLocaleString()}</div>
                <div className="text-xs text-zinc-500">$SHIT</div>
              </div>
              <div className="bg-zinc-800/80 rounded-2xl p-5">
                <div className="text-xs text-zinc-500 mb-1">MONTHLY (AVG)</div>
                <div className="text-xl font-black text-amber-400">{(calcOffers * 150 * 30).toLocaleString()}</div>
                <div className="text-xs text-zinc-500">$SHIT</div>
              </div>
              <div className="bg-zinc-800/80 rounded-2xl p-5 border border-amber-500/20">
                <div className="text-xs text-zinc-500 mb-1">≈ USD/MONTH</div>
                <div className="text-xl font-black text-green-400">${(calcOffers * 150 * 30 * 0.01).toFixed(0)}</div>
                <div className="text-[10px] text-zinc-600">range: ${(calcOffers * 50 * 30 * 0.01).toFixed(0)}-${(calcOffers * 300 * 30 * 0.01).toFixed(0)}</div>
              </div>
            </div>
            <div className="text-center mt-6">
              <p className="text-xs text-zinc-500">earnings vary per offer type. surveys ~50 PTS, app installs ~500-2000 PTS. + staking, referrals, army missions on top.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why $SHIT Section */}
      <section id="rank-system" className="py-24 relative overflow-hidden scroll-mt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-black mb-6">
                WHY <span className="text-amber-500">$SHIT</span>?
              </h2>
              <p className="text-zinc-400 text-lg mb-8">
                another memecoin? nah ser. we built something that actually prints money while you shitpost.
              </p>

              <div className="space-y-4">
                {[
                  { icon: '💰', title: 'REAL BAGS', desc: 'not promises. actual money from offers you grind. withdraw anytime.' },
                  { icon: '🎮', title: 'ADDICTIVE AF', desc: 'battle pass, raids, daily spins, mini games, gacha mints. you won\'t leave.' },
                  { icon: '🦧', title: 'DEGEN CULTURE', desc: 'community runs the vibe. best memes get featured & rewarded with $SHIT.' },
                  { icon: '🔒', title: 'NO RUG', desc: 'on-chain everything. smart contracts audited. we\'re here to stay ser.' }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 p-4 bg-zinc-900/50 rounded-2xl border border-white/10"
                  >
                    <div className="text-3xl">{feature.icon}</div>
                    <div>
                      <h3 className="font-bold">{feature.title}</h3>
                      <p className="text-sm text-zinc-400">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Interactive Rank Preview */}
            <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6">
              <h3 className="text-xl font-bold mb-4 text-center">RANK UP SYSTEM</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {RANKS.map((rank, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                      activeRank === i 
                        ? 'bg-amber-500/20 border border-amber-500/50' 
                        : 'bg-zinc-800/50 hover:bg-zinc-800'
                    }`}
                    onClick={() => setActiveRank(i)}
                  >
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${rank.color}20` }}
                    >
                      {rank.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold" style={{ color: rank.color }}>
                        {rank.name}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {i === 0 ? 'start here normie' : `${(i * 5000).toLocaleString()} $SHIT to rank up`}
                      </div>
                    </div>
                    {activeRank === i && (
                      <motion.div
                        layoutId="activeRank"
                        className="w-2 h-2 rounded-full bg-amber-500"
                      />
                    )}
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 text-center text-sm text-zinc-400">
                tap a rank to see the perks ser
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Battle Pass Preview */}
      <section id="battle-pass" className="py-24 bg-zinc-950 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              SEASON 1: <span className="text-amber-500">SHIT RISING</span>
            </h2>
            <p className="text-zinc-400">grind XP. claim loot. flex on normies.</p>
          </div>

          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-purple-500/10 rounded-3xl border border-amber-500/20 p-8">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { tier: 5, free: '+500 $SHIT', premium: '+1000 $SHIT + NFT', icon: '🎁' },
                { tier: 15, free: '2x XP JUICE', premium: '3x XP + DEGEN BADGE', icon: '⚡' },
                { tier: 30, premium: 'Legendary "ShitLord" NFT', icon: '👑', featured: true }
              ].map((reward, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className={`p-6 rounded-2xl border ${
                    reward.featured 
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/50' 
                      : 'bg-zinc-900/50 border-white/10'
                  }`}
                >
                  <div className="text-4xl mb-4">{reward.icon}</div>
                  <div className="text-sm text-zinc-500 mb-1">TIER {reward.tier}</div>
                  <h3 className="font-bold mb-2">{reward.featured ? 'ULTIMATE LOOT' : 'FREE LOOT'}</h3>
                  {reward.free && <div className="text-sm text-zinc-400">Free: {reward.free}</div>}
                  {reward.premium && (
                    <div className="text-sm text-amber-400">Premium: {reward.premium}</div>
                  )}
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full text-sm text-zinc-400">
                <span className="text-amber-400">⚠️</span>
                Season ends in: <span className="text-white font-mono">{countdown}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meme Gallery */}
      <section id="memes" className="py-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">COMMUNITY <span className="text-amber-500">MEMES</span></h2>
            <p className="text-zinc-400">post degen shit. get upvotes. earn $SHIT. simple.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MEME_GALLERY.map((meme, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${meme.bg}`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-8xl group-hover:scale-125 transition-transform duration-300">{meme.emoji}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="font-bold text-sm mb-0.5">{meme.title}</div>
                  <div className="text-xs text-zinc-400 mb-2">{meme.caption}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-400">❤️ {meme.likes}</span>
                    <span className="text-xs text-zinc-500">💩 community post</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button onClick={onConnect} className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-black border border-amber-500/30 hover:scale-105 transition-transform">
              💩 LOGIN TO POST YOUR SHIT
            </button>
            <p className="text-xs text-zinc-600 mt-2">first 100 memes with 50+ upvotes → 500 $SHIT bonus</p>
          </div>
        </div>
      </section>

      {/* DEGENS GOT PAID — Proof of Payment */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              DEGENS GOT <span className="text-green-400">PAID</span>
            </h2>
            <p className="text-zinc-400">real withdrawals. real money. no cap.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { user: '0xChad...9F3A', amount: '$247.50', network: 'Base', time: '2 hours ago', emoji: '💰' },
              { user: 'ShitKing420', amount: '$89.00', network: 'Polygon', time: '5 hours ago', emoji: '🚀' },
              { user: 'DegenApe99', amount: '$1,200.00', network: 'Base', time: '1 day ago', emoji: '🐋' },
              { user: 'ToiletWhale', amount: '$520.00', network: 'Ethereum', time: '1 day ago', emoji: '💎' },
            ].map((tx, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-zinc-900/80 border border-green-500/20 rounded-2xl p-5 hover:border-green-500/40 transition-all glass-card-shine hover-lift"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">{tx.emoji}</div>
                  <div>
                    <div className="font-bold text-sm text-white">{tx.user}</div>
                    <div className="text-xs text-zinc-500">{tx.time}</div>
                  </div>
                </div>
                <div className="text-2xl font-black text-green-400 mb-1">{tx.amount}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-zinc-400">via {tx.network}</span>
                  <span className="text-xs text-green-400 ml-auto">✓ confirmed</span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8 text-sm text-zinc-500">
            <span className="text-green-400 font-bold">$2.4M+</span> paid out to degens worldwide. you could be next.
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-zinc-900/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">FAQ <span className="text-amber-500">(FOR NORMIES)</span></h2>
            <p className="text-zinc-400">questions your smooth brain might have</p>
          </div>
          <div className="space-y-3">
            {[
              { q: 'Is this legit or another rug?', a: 'Legit ser. Smart contracts on Base, audited code, transparent tokenomics. We\'ve paid out $2.4M+ to users. Check the withdrawal proofs above.' },
              { q: 'How do I actually earn?', a: 'Complete offers (surveys, app installs, videos) on the offerwall. Each offer pays 50-2000+ $SHIT. You can also stake, play mini-games, do army missions, and refer friends.' },
              { q: 'How do I withdraw?', a: 'Dashboard → Withdraw → choose network (Base, Ethereum, Polygon) → paste wallet address → done. Under $100 = no KYC. Instant processing for most networks.' },
              { q: 'Is KYC required?', a: 'Only if your balance exceeds $100 USD equivalent. Under that, no verification needed. We use SumSub for KYC — quick 2-minute process.' },
              { q: 'What is $SHIT token?', a: 'ERC-20 token on Base network. 1B max supply. You earn it by grinding offers, and can stake it for 32-67% APY, trade it on the marketplace, or withdraw to your wallet.' },
              { q: 'How much can I realistically earn?', a: 'Depends on how hard you grind. Casual (3-5 offers/day) = $50-150/month. Hardcore grinders doing 15-20 offers/day + staking + referrals = $500-1000+/month.' },
              { q: 'What\'s the Army / soldiers thing?', a: 'Mint NFT soldiers, send them on missions (raids), earn $SHIT passively. Higher level soldiers = better missions = more loot. Think of it as idle earnings.' },
              { q: 'Can I get banned?', a: 'Only for fraud: multi-accounting, VPN abuse, bot farming, or fake offer completions. Play fair and you\'re good ser.' },
            ].map((faq, i) => (
              <div key={i} className="border border-white/10 rounded-2xl overflow-hidden hover:border-amber-500/20 transition-colors">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-bold text-sm">{faq.q}</span>
                  <span className={`text-amber-400 text-xl transition-transform duration-300 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                <div 
                  className="overflow-hidden transition-all duration-300 ease-out"
                  style={{ maxHeight: openFaq === i ? '200px' : '0px', opacity: openFaq === i ? 1 : 0 }}
                >
                  <div className="px-5 pb-5 text-sm text-zinc-400 leading-relaxed">{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-t from-amber-500/10 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-6xl font-black mb-6">
              STILL READING?
              <br />
              <span className="text-amber-500">NGMI</span>
              <br />
              JUST APE IN.
            </h2>
            <p className="text-xl text-zinc-400 mb-8">
              47K degens already grinding. don&apos;t be the last one to flush.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onConnect}
                className="px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl font-black text-xl shadow-xl shadow-amber-500/20"
              >
                💩 SEND IT
              </motion.button>
            </div>

            <p className="mt-6 text-sm text-zinc-500">
              no wallet? no problem. google login = 2 seconds. zero excuses.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💩</span>
                <span className="font-black">SHIT.ARMY</span>
              </div>
              <p className="text-sm text-zinc-500">
                the degen earning machine on Base. stack $SHIT or stay poor.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-amber-400">GRIND</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li onClick={() => scrollToSection('how-it-works')} className="hover:text-white cursor-pointer transition-colors">Offerwall</li>
                <li onClick={() => scrollToSection('how-it-works')} className="hover:text-white cursor-pointer transition-colors">Staking</li>
                <li onClick={() => scrollToSection('how-it-works')} className="hover:text-white cursor-pointer transition-colors">Referrals</li>
                <li onClick={() => scrollToSection('battle-pass')} className="hover:text-white cursor-pointer transition-colors">Battle Pass</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-amber-400">SQUAD</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="https://discord.gg/shitarmy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="https://x.com/shitarmy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter/X</a></li>
                <li><a href="https://t.me/shitarmy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Telegram</a></li>
                <li onClick={() => scrollToSection('memes')} className="hover:text-white cursor-pointer transition-colors">Meme Contest</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-zinc-400">BORING STUFF</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/legal/cookies" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-sm text-zinc-500">
            <p>© 2026 SHIT.ARMY. all rights reserved. NFA. DYOR. WAGMI. {"\u{1F4A9}"}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
