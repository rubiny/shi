'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CONFIG } from '@/lib/config';

interface LandingPageProps {
  onConnect?: () => void;
  onGoogle?: () => void;
}

const RANKS = [
  { name: 'Recruit', emoji: '🪖', color: '#8B7355' },
  { name: 'Private', emoji: '🎖️', color: '#4A7C4E' },
  { name: 'Corporal', emoji: '⭐', color: '#5D4E6D' },
  { name: 'Sergeant', emoji: '🎯', color: '#D4A574' },
  { name: 'Lieutenant', emoji: '⚔️', color: '#4A6FA5' },
  { name: 'Captain', emoji: '🛡️', color: '#8B6914' },
  { name: 'Major', emoji: '🏅', color: '#CD7F32' },
  { name: 'Colonel', emoji: '💎', color: '#A0B2C6' },
  { name: 'General', emoji: '👑', color: '#FFD700' },
  { name: 'ShitLord', emoji: '🚽👑', color: '#E5E4E2' }
];

const MEME_IMAGES = [
  { src: '/memes/shit-coin-pepe.png', alt: 'Pepe with $SHIT', likes: '12.4K' },
  { src: '/memes/toilet-moon.png', alt: 'Toilet to the moon', likes: '8.9K' },
  { src: '/memes/poop-rocket.png', alt: 'Poop rocket', likes: '23.1K' },
  { src: '/memes/shit-hodl.png', alt: 'HODL SHIT', likes: '15.6K' },
  { src: '/memes/crap-currency.png', alt: 'Crap Currency', likes: '9.2K' },
  { src: '/memes/toilet-finance.png', alt: 'Toilet Finance', likes: '18.7K' }
];

export default function LandingPage({ onConnect, onGoogle }: LandingPageProps) {
  const [currentEmoji, setCurrentEmoji] = useState(0);
  const [activeRank, setActiveRank] = useState(4);

  useEffect(() => {
    const emojiInterval = setInterval(() => {
      setCurrentEmoji(prev => (prev + 1) % 6);
    }, 2000);
    return () => clearInterval(emojiInterval);
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
              <button onClick={() => scrollToSection('how-it-works')} className="hidden sm:block text-zinc-400 hover:text-white text-sm transition-colors">
                How it Works
              </button>
              <button onClick={() => scrollToSection('rank-system')} className="hidden sm:block text-zinc-400 hover:text-white text-sm transition-colors">
                Leaderboard
              </button>
              <button 
                onClick={onConnect}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full font-bold text-sm hover:scale-105 transition-transform"
              >
                Enter App
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Floating emoji */}
            <div className="text-8xl mb-6 animate-bounce">
              {emojis[currentEmoji]}
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                THE MEME ARMY
              </span>
              <br />
              <span className="text-white">THAT PAYS</span>
            </h1>

            <p className="text-xl sm:text-2xl text-zinc-400 max-w-3xl mx-auto mb-8">
              Join the most degenerate army on Base. 
              <span className="text-amber-400 font-bold">Complete offers, stake $SHIT,</span> recruit soldiers & 
              <span className="text-amber-300 font-bold"> earn real crypto</span>. 
              <br />
              <span className="text-sm text-zinc-500">No BS. Just poop & profit. 💩</span>
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-12">
              {[
                { value: '$2.4M', label: 'Total Earned' },
                { value: '47K', label: 'Soldiers' },
                { value: '1.2M', label: 'Offers Done' },
                { value: '420K', label: '$SHIT Staked' }
              ].map((stat, i) => (
                <div key={i} className="bg-zinc-900/50 border border-white/10 rounded-2xl px-6 py-4 backdrop-blur-sm">
                  <div className="text-2xl sm:text-3xl font-black text-amber-400">{stat.value}</div>
                  <div className="text-xs text-zinc-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onConnect}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl font-black text-lg shadow-lg shadow-amber-500/20"
              >
                🚀 JOIN THE ARMY
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGoogle}
                className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 border border-white/20 rounded-2xl font-bold text-lg"
              >
                🎮 Login with Google
              </motion.button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-500">
              <span className="flex items-center gap-2">
                <span className="text-amber-400">✓</span> Instant Withdrawals
              </span>
              <span className="flex items-center gap-2">
                <span className="text-amber-400">✓</span> No KYC under $500
              </span>
              <span className="flex items-center gap-2">
                <span className="text-amber-400">✓</span> Base Chain
              </span>
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
              HOW TO <span className="text-amber-500">SHITPOST</span> & EARN
            </h2>
            <p className="text-zinc-400 text-lg">4 steps from zero to ShitLord</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                step: '1', 
                icon: '💩', 
                title: 'Join the Army', 
                desc: 'Connect wallet (MetaMask, Coinbase, or Google). No email spam.',
                color: 'amber'
              },
              { 
                step: '2', 
                icon: '🎯', 
                title: 'Complete Offers', 
                desc: 'Surveys, apps, videos. 2-5 mins = 50-500 PTS. Instant credit.',
                color: 'blue'
              },
              { 
                step: '3', 
                icon: '🔒', 
                title: 'Stake & Multiply', 
                desc: 'Lock $SHIT for 50-200% APY. The longer, the bigger.',
                color: 'emerald'
              },
              { 
                step: '4', 
                icon: '👥', 
                title: 'Build Your Squad', 
                desc: 'Recruit friends. Earn 10% from their offers FOREVER.',
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
                className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6 hover:border-amber-500/30 transition-all"
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
                Another meme coin? Nah. We actually built something that makes you money while you laugh.
              </p>

              <div className="space-y-4">
                {[
                  { icon: '💰', title: 'Real Earnings', desc: 'Not promises. Actual dollars from offers you complete.' },
                  { icon: '🎮', title: 'Gamified AF', desc: 'Battle Pass, quests, streaks. You\'ll get addicted (in a good way).' },
                  { icon: '🎨', title: 'Meme Culture', desc: 'Community creates the vibe. Best memes get featured & rewarded.' },
                  { icon: '🔒', title: 'Safe & Transparent', desc: 'On-chain everything. Smart contracts audited. No rug pull BS.' }
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
                        {i === 0 ? 'Start here' : `${(i * 1000).toLocaleString()} PTS to next`}
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
                Click ranks to preview rewards
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
            <p className="text-zinc-400">Battle Pass with free & premium rewards</p>
          </div>

          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-purple-500/10 rounded-3xl border border-amber-500/20 p-8">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { tier: 5, free: '+500 PTS', premium: '+1000 PTS + NFT', icon: '🎁' },
                { tier: 15, free: '2x XP Boost', premium: '3x XP + Badge', icon: '⚡' },
                { tier: 30, premium: 'Exclusive "ShitLord" NFT', icon: '👑', featured: true }
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
                  <div className="text-sm text-zinc-500 mb-1">Tier {reward.tier}</div>
                  <h3 className="font-bold mb-2">{reward.featured ? 'MAX REWARD' : 'FREE REWARD'}</h3>
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
            <p className="text-zinc-400">Best memes get featured & rewarded</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MEME_IMAGES.map((meme, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="group relative aspect-square bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="text-sm text-zinc-300">{meme.alt}</span>
                  <span className="text-sm text-amber-400">❤️ {meme.likes}</span>
                </div>
                {/* Placeholder for meme image */}
                <div className="w-full h-full flex items-center justify-center text-7xl group-hover:scale-110 transition-transform opacity-60 group-hover:opacity-100">
                  {['💩', '🚀', '🌙', '💎', '🚽', '🎮'][i]}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold border border-white/10">
              📤 Submit Your Meme
            </button>
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
              READY TO JOIN THE
              <br />
              <span className="text-amber-500">MOST DEGENERATE</span>
              <br />
              ARMY ON BASE?
            </h2>
            <p className="text-xl text-zinc-400 mb-8">
              47,000 soldiers already earning. Don&apos;t miss the flush.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onConnect}
                className="px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl font-black text-xl shadow-xl shadow-amber-500/20"
              >
                🚽 ENTER THE TOILET
              </motion.button>
            </div>

            <p className="mt-6 text-sm text-zinc-500">
              No wallet? No problem. Connect with Google in 2 seconds.
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
                The meme-powered earning platform on Base.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Earn</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li onClick={() => scrollToSection('how-it-works')} className="hover:text-white cursor-pointer transition-colors">Offerwall</li>
                <li onClick={() => scrollToSection('how-it-works')} className="hover:text-white cursor-pointer transition-colors">Staking</li>
                <li onClick={() => scrollToSection('how-it-works')} className="hover:text-white cursor-pointer transition-colors">Referrals</li>
                <li onClick={() => scrollToSection('battle-pass')} className="hover:text-white cursor-pointer transition-colors">Battle Pass</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li className="hover:text-white cursor-pointer">Discord</li>
                <li className="hover:text-white cursor-pointer">Twitter/X</li>
                <li className="hover:text-white cursor-pointer">Telegram</li>
                <li onClick={() => scrollToSection('memes')} className="hover:text-white cursor-pointer transition-colors">Meme Contest</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li className="hover:text-white cursor-pointer">Terms</li>
                <li className="hover:text-white cursor-pointer">Privacy</li>
                <li className="hover:text-white cursor-pointer">KYC Policy</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-sm text-zinc-500">
            <p>© 2026 SHIT.ARMY. All rights reserved. Not financial advice. 💩</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
