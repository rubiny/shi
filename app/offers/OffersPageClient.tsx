'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { PublicOffer, OfferCategory } from '@/lib/blog/offers';

interface Props {
  offers: PublicOffer[];
  totalPotential: number;
  categoryMeta: Record<string, { label: string; emoji: string; color: string }>;
}

const DIFFICULTY_STYLES = {
  easy: 'text-green-400 bg-green-500/10 border-green-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  hard: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export default function OffersPageClient({ offers, totalPotential, categoryMeta }: Props) {
  const [activeCategory, setActiveCategory] = useState<OfferCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'payout' | 'difficulty' | 'time'>('payout');
  const [expandedOffer, setExpandedOffer] = useState<string | null>(null);

  const categories = useMemo(() => [...new Set(offers.map(o => o.category))] as OfferCategory[], [offers]);

  const filtered = useMemo(() => {
    let result = offers;
    if (activeCategory !== 'all') {
      result = result.filter(o => o.category === activeCategory);
    }
    if (sortBy === 'difficulty') {
      const order = { easy: 0, medium: 1, hard: 2 };
      result = [...result].sort((a, b) => order[a.difficulty] - order[b.difficulty]);
    } else if (sortBy === 'time') {
      result = [...result].sort((a, b) => a.timeEstimate.localeCompare(b.timeEstimate));
    }
    return result;
  }, [offers, activeCategory, sortBy]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl">💩</span>
              <span className="font-black text-xl tracking-tighter">
                SHIT<span className="text-amber-500">.ARMY</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/blog" className="text-zinc-400 hover:text-white text-sm font-bold transition-colors">BLOG</Link>
              <Link href="/offers" className="text-amber-400 text-sm font-bold">OFFERS</Link>
              <Link
                href="/"
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full font-black text-sm hover:scale-105 transition-transform shadow-lg shadow-amber-500/20"
              >
                💩 APE IN
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-amber-500 text-sm font-bold tracking-[3px] mb-2">HIGHEST PAYING OFFERS</div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4">
            GET <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">PAID</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto mb-6">
            Browse the best-paying offers from our offerwall partners. Complete tasks, earn $SHIT, withdraw real crypto.
          </p>

          {/* Stats */}
          <div className="inline-flex items-center gap-6 px-8 py-4 bg-zinc-900/70 rounded-2xl border border-amber-500/20">
            <div>
              <div className="text-[10px] text-amber-500/60 uppercase font-bold tracking-wider">TOTAL POTENTIAL</div>
              <div className="text-2xl font-black text-amber-400">${totalPotential.toFixed(0)}</div>
            </div>
            <div className="w-px h-10 bg-amber-500/20" />
            <div>
              <div className="text-[10px] text-green-500/60 uppercase font-bold tracking-wider">ACTIVE OFFERS</div>
              <div className="text-2xl font-black text-green-400">{offers.length}</div>
            </div>
            <div className="w-px h-10 bg-amber-500/20" />
            <div>
              <div className="text-[10px] text-purple-500/60 uppercase font-bold tracking-wider">PROVIDERS</div>
              <div className="text-2xl font-black text-purple-400">3</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 flex-1">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === 'all'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-zinc-900/60 text-zinc-500 border border-white/5 hover:text-zinc-300'
              }`}
            >
              ALL ({offers.length})
            </button>
            {categories.map((cat) => {
              const count = offers.filter(o => o.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-zinc-900/60 text-zinc-500 border border-white/5 hover:text-zinc-300'
                  }`}
                >
                  {categoryMeta[cat]?.emoji} {categoryMeta[cat]?.label} ({count})
                </button>
              );
            })}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2.5 bg-zinc-900/60 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 focus:outline-none"
          >
            <option value="payout">💰 Highest Payout</option>
            <option value="difficulty">⚡ Easiest First</option>
            <option value="time">⏱️ Fastest First</option>
          </select>
        </div>

        {/* Offers List */}
        <div className="space-y-4">
          {filtered.map((offer) => {
            const isExpanded = expandedOffer === offer.id;
            const cat = categoryMeta[offer.category];
            return (
              <div
                key={offer.id}
                className="rounded-2xl border border-white/5 hover:border-amber-500/20 transition-all bg-zinc-900/20 glass-card-shine overflow-hidden"
              >
                <button
                  onClick={() => setExpandedOffer(isExpanded ? null : offer.id)}
                  className="w-full p-6 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 flex items-center justify-center text-2xl shrink-0">
                      {offer.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-black text-lg truncate">{offer.name}</h3>
                        {offer.popular && (
                          <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-bold text-amber-400 shrink-0">
                            🔥 HOT
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className={`${cat?.color || 'text-zinc-400'}`}>{cat?.emoji} {cat?.label}</span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-zinc-500">{offer.provider}</span>
                        <span className="text-zinc-600">·</span>
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${DIFFICULTY_STYLES[offer.difficulty]}`}>
                          {offer.difficulty.toUpperCase()}
                        </span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-zinc-500">⏱️ {offer.timeEstimate}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-black text-green-400">${offer.payout.toFixed(2)}</div>
                      <div className="text-[10px] text-zinc-600">in $SHIT</div>
                    </div>
                    <span className={`text-zinc-500 text-xl transition-transform duration-300 shrink-0 ${isExpanded ? 'rotate-45' : ''}`}>
                      +
                    </span>
                  </div>
                </button>

                <div
                  className="overflow-hidden transition-all duration-300 ease-out"
                  style={{ maxHeight: isExpanded ? '400px' : '0px', opacity: isExpanded ? 1 : 0 }}
                >
                  <div className="px-6 pb-6 border-t border-white/5 pt-4">
                    <p className="text-sm text-zinc-400 mb-4">{offer.description}</p>

                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Requirements</h4>
                        <ol className="space-y-1">
                          {offer.requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                              <span className="text-amber-500 font-bold shrink-0">{i + 1}.</span>
                              {req}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">Pro Tips</h4>
                        <p className="text-sm text-zinc-400">{offer.tips}</p>
                      </div>
                    </div>

                    <Link
                      href="/"
                      className="inline-block px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-black text-sm hover:scale-105 transition-transform shadow-lg shadow-amber-500/20"
                    >
                      💩 START THIS OFFER — EARN ${offer.payout.toFixed(2)}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 p-8 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5 text-center">
          <h2 className="text-2xl font-black mb-2">Total earning potential: ${totalPotential.toFixed(0)}+</h2>
          <p className="text-zinc-400 mb-6">New offers added weekly. Sign up to start earning.</p>
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl font-black text-lg shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform"
          >
            💩 APE IN AND START EARNING
          </Link>
        </div>

        {/* SEO Content */}
        <div className="mt-16 space-y-8 text-sm text-zinc-500 leading-relaxed">
          <div>
            <h2 className="text-xl font-black text-white mb-3">What are Offerwalls?</h2>
            <p>
              Offerwalls are a legitimate way to earn money online by completing simple tasks. Companies pay platforms like SHIT.ARMY 
              to acquire new users, and we share that revenue with you. Tasks include installing mobile apps, signing up for services, 
              completing surveys, and watching videos. The more complex the task, the higher the payout.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-black text-white mb-3">How Much Can You Earn?</h2>
            <p>
              Earnings vary based on which offers you complete and how much time you invest. Our top earners consistently make 
              $50-$100 per day by focusing on high-value offers and leveraging the staking and Army systems for passive income. 
              New users typically earn $10-$20 in their first day. Payments are instant via crypto on 5 networks.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-black text-white mb-3">Which Offers Pay the Most?</h2>
            <p>
              Mobile game progression offers typically pay the most ($10-$50), but they take several days to complete. 
              Financial app signups ($5-$25) are the fastest high-value options. For quick cash, survey and video offers 
              pay $0.50-$5 each and can be completed in minutes. We recommend mixing all three types for optimal earnings.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 bg-black mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>💩</span>
            <span className="font-black text-sm">SHIT.ARMY</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-zinc-500">
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/offers" className="hover:text-white transition-colors">Offers</Link>
            <Link href="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
          <p className="text-xs text-zinc-600">© 2026 SHIT.ARMY</p>
        </div>
      </footer>
    </div>
  );
}
