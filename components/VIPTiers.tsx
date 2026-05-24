'use client';

import React, { useState } from 'react';

interface VIPTiersProps {
  currentTier: number;
  balance: number;
  onPurchase: (tier: number, cost: number) => void;
}

const TIERS = [
  {
    id: 0,
    name: 'NORMIE',
    icon: '\u{1F4A9}',
    color: 'from-zinc-600 to-zinc-700',
    borderColor: 'border-zinc-600/30',
    price: 0,
    priceUsd: 0,
    perks: [
      '1 daily spin',
      '3 daily scratch cards',
      'normie offerwall rates',
      'basic support (cope)',
    ],
  },
  {
    id: 1,
    name: 'DEGEN',
    icon: '\u{1FA96}',
    color: 'from-amber-700 to-amber-800',
    borderColor: 'border-amber-700/30',
    price: 5000,
    priceUsd: 4.99,
    duration: '30 days',
    perks: [
      '2 daily spins',
      '5 daily scratch cards',
      '+10% offerwall boost',
      'faster withdrawals',
      'DEGEN badge',
      'chat access',
    ],
  },
  {
    id: 2,
    name: 'CHAD',
    icon: '\u{1F451}',
    color: 'from-amber-500 to-orange-500',
    borderColor: 'border-amber-500/30',
    price: 15000,
    priceUsd: 14.99,
    duration: '30 days',
    popular: true,
    perks: [
      '3 daily spins + juiced odds',
      '8 daily scratch cards',
      '+25% offerwall boost',
      'instant withdrawals',
      'CHAD badge + custom frame',
      'exclusive offers (alpha)',
      'degen games VIP tables',
      'priority support',
    ],
  },
  {
    id: 3,
    name: 'GIGACHAD',
    icon: '\u{1F48E}',
    color: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-500/30',
    price: 50000,
    priceUsd: 49.99,
    duration: '30 days',
    perks: [
      '5 daily spins + max odds',
      '12 daily scratch cards',
      '+50% offerwall boost',
      'instant withdrawals + 0% fee',
      'GIGACHAD badge + animated frame',
      'first access to new offers (alpha leaks)',
      'degen games VIP + no limits',
      'dedicated account manager',
      'revenue share (1% of army\'s loot)',
      'monthly $SHIT airdrop',
    ],
  },
];

export default function VIPTiers({ currentTier, balance, onPurchase }: VIPTiersProps) {
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [payMethod, setPayMethod] = useState<'shit' | 'fiat'>('shit');

  const handlePurchase = (tier: typeof TIERS[0]) => {
    if (tier.id <= currentTier) return;
    setSelectedTier(tier.id);
    setShowConfirm(true);
  };

  const confirmPurchase = () => {
    if (selectedTier === null) return;
    const tier = TIERS[selectedTier];
    onPurchase(tier.id, payMethod === 'shit' ? tier.price : 0);
    setShowConfirm(false);
    setSelectedTier(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="mb-10 text-center">
        <div className="text-amber-500 text-sm font-bold tracking-[3px]">LEVEL UP OR STAY POOR</div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">VIP PASS</h2>
        <p className="text-zinc-400 mt-2">bigger perks. bigger bags. no cap.</p>
      </div>

      {/* Current Tier Banner */}
      <div className={`mb-8 p-6 rounded-2xl bg-gradient-to-r ${TIERS[currentTier].color} border ${TIERS[currentTier].borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{TIERS[currentTier].icon}</span>
            <div>
              <div className="text-xs text-white/60 uppercase tracking-wider">Current Tier</div>
              <div className="text-2xl font-black">{TIERS[currentTier].name}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/60">Balance</div>
            <div className="text-xl font-bold">{balance.toLocaleString()} $SHIT</div>
          </div>
        </div>
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TIERS.map((tier) => {
          const isCurrentTier = tier.id === currentTier;
          const isLocked = tier.id < currentTier;
          const canAfford = balance >= tier.price || tier.price === 0;

          return (
            <div
              key={tier.id}
              className={`relative rounded-2xl border p-6 transition-all ${
                isCurrentTier
                  ? `bg-gradient-to-b ${tier.color} border-white/20 shadow-lg`
                  : `bg-zinc-900/50 ${tier.borderColor} hover:border-white/20`
              } ${tier.popular ? 'ring-2 ring-amber-500/50' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-black text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div className="text-center mb-6">
                <div className="text-4xl mb-2">{tier.icon}</div>
                <h3 className="text-xl font-black">{tier.name}</h3>
                {tier.price > 0 ? (
                  <div className="mt-2">
                    <div className="text-2xl font-black text-amber-400">{tier.price.toLocaleString()} $SHIT</div>
                    <div className="text-xs text-zinc-500">or ${tier.priceUsd}/mo</div>
                    <div className="text-xs text-zinc-500">{tier.duration}</div>
                  </div>
                ) : (
                  <div className="mt-2 text-lg font-bold text-zinc-400">Free</div>
                )}
              </div>

              <div className="space-y-2 mb-6">
                {tier.perks.map((perk, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-400 mt-0.5">{'\u2713'}</span>
                    <span className={isCurrentTier ? 'text-white/90' : 'text-zinc-400'}>{perk}</span>
                  </div>
                ))}
              </div>

              {tier.price === 0 ? (
                <div className="py-3 text-center text-sm text-zinc-500 font-medium">
                  {isCurrentTier ? 'Current Plan' : 'Default'}
                </div>
              ) : isCurrentTier ? (
                <div className="py-3 bg-white/20 rounded-xl text-center font-bold text-sm">
                  Active
                </div>
              ) : isLocked ? (
                <div className="py-3 bg-zinc-800 rounded-xl text-center text-sm text-zinc-500">
                  Owned
                </div>
              ) : (
                <button
                  onClick={() => handlePurchase(tier)}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                    canAfford
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:shadow-lg hover:shadow-amber-500/20'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                  disabled={!canAfford && payMethod === 'shit'}
                >
                  {canAfford ? 'Upgrade Now' : 'Not Enough $SHIT'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Benefits Comparison */}
      <div className="mt-12 bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
        <h3 className="font-bold text-lg mb-6 text-center">Why Go VIP?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="text-3xl mb-2">{'\u{1F4B0}'}</div>
            <div className="font-bold mb-1">Earn More</div>
            <div className="text-sm text-zinc-400">Up to +50% bonus on all offerwall earnings. Higher tiers = more $SHIT per offer.</div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-2">{'\u26A1'}</div>
            <div className="font-bold mb-1">Faster Payouts</div>
            <div className="text-sm text-zinc-400">Priority and instant withdrawals. Commander tier gets 0% withdrawal fees.</div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-2">{'\u{1F3B0}'}</div>
            <div className="font-bold mb-1">More Daily Rewards</div>
            <div className="text-sm text-zinc-400">Up to 5 daily spins, 12 scratch cards, and VIP-only game tables.</div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && selectedTier !== null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl max-w-md w-full border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Confirm Upgrade</h2>
              <button onClick={() => setShowConfirm(false)} className="text-zinc-400 hover:text-white">{'\u2715'}</button>
            </div>

            <div className="text-center mb-6">
              <div className="text-5xl mb-2">{TIERS[selectedTier].icon}</div>
              <div className="text-2xl font-black">{TIERS[selectedTier].name}</div>
              <div className="text-sm text-zinc-400 mt-1">{TIERS[selectedTier].duration}</div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setPayMethod('shit')}
                className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between ${
                  payMethod === 'shit' ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{'\u{1F4A9}'}</span>
                  <div className="text-left">
                    <div className="font-bold">Pay with $SHIT</div>
                    <div className="text-xs text-zinc-400">{TIERS[selectedTier].price.toLocaleString()} $SHIT</div>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 ${payMethod === 'shit' ? 'border-amber-500 bg-amber-500' : 'border-zinc-600'}`} />
              </button>

              <button
                onClick={() => setPayMethod('fiat')}
                className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between ${
                  payMethod === 'fiat' ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{'\u{1F4B3}'}</span>
                  <div className="text-left">
                    <div className="font-bold">Pay with Card</div>
                    <div className="text-xs text-zinc-400">${TIERS[selectedTier].priceUsd}/month</div>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 ${payMethod === 'fiat' ? 'border-amber-500 bg-amber-500' : 'border-zinc-600'}`} />
              </button>
            </div>

            <button
              onClick={confirmPurchase}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl font-black text-lg transition-all shadow-lg shadow-amber-500/20"
            >
              Upgrade to {TIERS[selectedTier].name}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
