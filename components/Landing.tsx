"use client";

import React from 'react';
import Image from 'next/image';

interface LandingProps {
  onConnect: () => void;
  onGoogle: () => void;
  onApple: () => void;
}

export default function Landing({ onConnect, onGoogle, onApple }: LandingProps) {
  const [soldiers, setSoldiers] = React.useState(124892);

  // Animated counter
  React.useEffect(() => {
    const interval = setInterval(() => {
      setSoldiers(prev => {
        const target = 124892 + Math.floor(Math.random() * 50);
        return Math.floor(prev + (target - prev) * 0.1);
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 border-b border-white/10 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/white-shit-logo.png" alt="Shit Army" width={44} height={44} className="rounded-full" />
            <div className="font-bold text-xl sm:text-3xl tracking-tighter">SHIT.ARMY</div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onGoogle} className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-zinc-200 active:scale-[0.985] transition-all">
              <span>🔵</span> Google
            </button>
            <button onClick={onApple} className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-zinc-200 active:scale-[0.985] transition-all">
              <span>🍎</span> Apple
            </button>
            <button onClick={onConnect} className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 rounded-full font-semibold text-sm active:scale-[0.985] transition-all">
              CONNECT WALLET
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="pt-20 min-h-[100dvh] flex items-center relative overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#222_0.8px,transparent_1px)] bg-[length:4px_4px] animate-[grid_20s_linear_infinite]" />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl opacity-20 animate-float"
              style={{
                left: `${15 + i * 9}%`,
                top: `${20 + (i % 3) * 15}%`,
                animationDelay: `-${i * 0.8}s`,
              }}
            >
              💩
            </div>
          ))}
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-white/5 text-emerald-400 text-sm mb-6 border border-white/10 animate-pulse">
            🔥 LIVE ON BASE • {soldiers.toLocaleString()} ACTIVE SOLDIERS
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-[92px] lg:text-[130px] font-black tracking-[-3px] md:tracking-[-7px] leading-[0.88] mb-8">
            JOIN THE<br />
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent">SHIT ARMY</span>
          </h1>

          <p className="max-w-[560px] mx-auto text-2xl text-zinc-400 mb-12">
            Complete offers. Earn $SHIT.<br />Stake. Mint. Climb. Repeat.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onConnect} 
              className="group relative overflow-hidden bg-white text-black text-xl font-semibold px-16 py-5 rounded-2xl flex items-center gap-4 mx-auto hover:bg-emerald-400 active:scale-[0.985] transition-all"
            >
              <span>CONNECT WALLET &amp; JOIN</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-700" />
            </button>
            
            <button 
              onClick={onGoogle} 
              className="group border border-white/30 text-xl font-semibold px-10 py-5 rounded-2xl flex items-center gap-4 mx-auto hover:bg-white/5 active:scale-[0.985] transition-all"
            >
              Sign in with Google
            </button>
          </div>

          <div className="mt-8 text-xs text-zinc-500 tracking-[2px]">NO KYC • INSTANT WITHDRAWALS ON BASE • 0.4% SWAP FEE</div>
        </div>

        {/* Floating tank */}
        <div className="absolute bottom-12 right-8 hidden xl:block animate-[float_6s_ease-in-out_infinite]">
          <Image 
            src="/hero-image.webp" 
            alt="Tank" 
            width={420} 
            height={420} 
            className="drop-shadow-[0_60px_120px_rgb(16,185,129)]" 
          />
        </div>
      </div>

      {/* STATS BAR */}
      <div className="border-y border-white/10 bg-black/60 py-6">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { number: "124k+", label: "Active Soldiers" },
            { number: "$2.4M", label: "Total Earned" },
            { number: "48%", label: "Max Staking APY" },
            { number: "8,472", label: "Daily Active" },
          ].map((stat, i) => (
            <div key={i} className="animate-fadeInUp" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="text-4xl font-bold text-emerald-400 tabular-nums">{stat.number}</div>
              <div className="text-xs text-zinc-500 mt-1 tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="text-emerald-500 text-sm tracking-[3px]">4 SIMPLE STEPS</div>
          <h2 className="text-6xl font-bold tracking-tight mt-3">How Shit Army Works</h2>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Connect", desc: "Wallet, Google or Apple in seconds", icon: "🔗" },
            { step: "02", title: "Earn", desc: "Complete offers, surveys & games", icon: "⚡" },
            { step: "03", title: "Convert", desc: "Points → $SHIT instantly", icon: "💰" },
            { step: "04", title: "Flex", desc: "Stake, mint NFTs, climb ranks", icon: "🪖" },
          ].map((item, i) => (
            <div 
              key={i} 
              className="group bg-zinc-950 border border-white/10 rounded-3xl p-9 hover:border-emerald-500/50 transition-all hover:-translate-y-1 duration-300"
            >
              <div className="text-6xl mb-8 group-hover:scale-110 transition-transform">{item.icon}</div>
              <div className="text-emerald-500 text-6xl font-black mb-6">{item.step}</div>
              <div className="text-3xl font-semibold mb-4">{item.title}</div>
              <div className="text-zinc-400 text-[15px]">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AIRDROP TEASER */}
      <div className="bg-gradient-to-b from-purple-950/60 to-black border-y border-purple-500/20 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-block px-4 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm mb-6">🪂 EARLY SOLDIER AIRDROP</div>
          
          <h2 className="text-6xl font-bold tracking-tight mb-6">The bigger you earn,<br />the bigger your airdrop</h2>
          
          <div className="max-w-md mx-auto text-xl text-zinc-400 mb-10">
            Top 10% earners this month get up to <span className="text-purple-400 font-semibold">1,500 $SHIT</span> instantly.
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="bg-black/60 px-6 py-3 rounded-2xl border border-purple-500/30">5,000 $SHIT → 250 $SHIT</div>
            <div className="bg-black/60 px-6 py-3 rounded-2xl border border-purple-500/30">10,000 $SHIT → 600 $SHIT</div>
            <div className="bg-black/60 px-6 py-3 rounded-2xl border border-purple-500/30">25,000+ $SHIT → 1,500 $SHIT</div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="text-center py-16 text-xs text-zinc-500 border-t border-white/10">
        Shit.Army • Built on Base • Not financial advice • v1.0
      </footer>
    </div>
  );
}
