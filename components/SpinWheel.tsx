'use client';

import React, { useState, useCallback } from 'react';

interface SpinWheelProps {
  onReward: (amount: number, label: string) => void;
  isVip?: boolean;
}

const SEGMENTS = [
  { label: '50 PTS', value: 50, color: 'from-zinc-700 to-zinc-800', chance: 25 },
  { label: '100 PTS', value: 100, color: 'from-amber-700 to-amber-800', chance: 20 },
  { label: '250 PTS', value: 250, color: 'from-zinc-700 to-zinc-800', chance: 15 },
  { label: '500 PTS', value: 500, color: 'from-amber-600 to-amber-700', chance: 12 },
  { label: '1K PTS', value: 1000, color: 'from-zinc-700 to-zinc-800', chance: 10 },
  { label: '2x BOOST', value: 0, color: 'from-purple-600 to-purple-700', chance: 8 },
  { label: '2.5K PTS', value: 2500, color: 'from-amber-500 to-amber-600', chance: 5 },
  { label: '5K PTS', value: 5000, color: 'from-orange-500 to-red-500', chance: 3 },
  { label: 'JACKPOT', value: 10000, color: 'from-yellow-400 to-amber-500', chance: 2 },
];

const SCRATCH_PRIZES = [
  { label: '25 PTS', value: 25, rarity: 'common' },
  { label: '50 PTS', value: 50, rarity: 'common' },
  { label: '100 PTS', value: 100, rarity: 'uncommon' },
  { label: '250 PTS', value: 250, rarity: 'rare' },
  { label: '500 PTS', value: 500, rarity: 'epic' },
  { label: '1K PTS', value: 1000, rarity: 'legendary' },
];

export default function SpinWheel({ onReward, isVip = false }: SpinWheelProps) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<typeof SEGMENTS[0] | null>(null);
  const [spinsLeft, setSpinsLeft] = useState(isVip ? 3 : 1);
  const [nextSpinTime, setNextSpinTime] = useState<Date | null>(null);
  const [activeGame, setActiveGame] = useState<'wheel' | 'scratch'>('wheel');

  // Scratch card state
  const [scratchCards, setScratchCards] = useState(() =>
    Array.from({ length: 6 }, () => ({
      revealed: false,
      prize: SCRATCH_PRIZES[Math.floor(Math.random() * SCRATCH_PRIZES.length)],
    }))
  );
  const [scratchesLeft, setScratchesLeft] = useState(isVip ? 5 : 3);
  const [scratchResult, setScratchResult] = useState<string | null>(null);

  const spin = useCallback(() => {
    if (spinning || spinsLeft <= 0) return;

    setSpinning(true);
    setResult(null);

    // Weighted random selection
    const totalWeight = SEGMENTS.reduce((sum, s) => sum + s.chance, 0);
    let random = Math.random() * totalWeight;
    let selected = SEGMENTS[0];
    for (const segment of SEGMENTS) {
      random -= segment.chance;
      if (random <= 0) {
        selected = segment;
        break;
      }
    }

    const segmentAngle = 360 / SEGMENTS.length;
    const selectedIndex = SEGMENTS.indexOf(selected);
    const targetAngle = 360 - (selectedIndex * segmentAngle) - (segmentAngle / 2);
    const fullSpins = 5 + Math.floor(Math.random() * 3);
    const newRotation = rotation + (fullSpins * 360) + targetAngle;

    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(selected);
      setSpinsLeft(prev => prev - 1);

      if (selected.value > 0) {
        onReward(selected.value, selected.label);
      } else {
        onReward(0, selected.label);
      }

      if (spinsLeft <= 1) {
        const next = new Date();
        next.setHours(next.getHours() + 24);
        setNextSpinTime(next);
      }
    }, 4000);
  }, [spinning, spinsLeft, rotation, onReward]);

  const handleScratch = (index: number) => {
    if (scratchesLeft <= 0 || scratchCards[index].revealed) return;

    const updated = [...scratchCards];
    updated[index] = { ...updated[index], revealed: true };
    setScratchCards(updated);
    setScratchesLeft(prev => prev - 1);

    const prize = scratchCards[index].prize;
    setScratchResult(`Won ${prize.label}!`);
    if (prize.value > 0) {
      onReward(prize.value, `Scratch: ${prize.label}`);
    }

    setTimeout(() => setScratchResult(null), 2000);
  };

  const rarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-zinc-400';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-amber-400';
      default: return 'text-zinc-400';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-10">
        <div className="text-amber-500 text-sm font-bold tracking-[3px]">DAILY REWARDS</div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">Lucky Wheel</h2>
      </div>

      {/* Game Selector */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setActiveGame('wheel')}
          className={`px-6 py-3 rounded-2xl font-bold transition-all ${
            activeGame === 'wheel'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20'
              : 'bg-zinc-800/50 text-zinc-400 hover:text-white border border-white/10'
          }`}
        >
          {'\u{1F3B0}'} Spin Wheel
        </button>
        <button
          onClick={() => setActiveGame('scratch')}
          className={`px-6 py-3 rounded-2xl font-bold transition-all ${
            activeGame === 'scratch'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20'
              : 'bg-zinc-800/50 text-zinc-400 hover:text-white border border-white/10'
          }`}
        >
          {'\u{1F3AB}'} Scratch Cards
        </button>
      </div>

      {/* Spin Wheel */}
      {activeGame === 'wheel' && (
        <div className="flex flex-col items-center">
          {/* Wheel */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 mb-8">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 text-3xl drop-shadow-lg">
              {'\u{1F53D}'}
            </div>

            {/* Wheel Circle */}
            <div
              className="w-full h-full rounded-full border-4 border-amber-500/50 overflow-hidden relative shadow-2xl shadow-amber-500/20"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
              }}
            >
              {SEGMENTS.map((segment, i) => {
                const angle = (360 / SEGMENTS.length) * i;
                return (
                  <div
                    key={i}
                    className={`absolute w-full h-full`}
                    style={{
                      transform: `rotate(${angle}deg)`,
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((360 / SEGMENTS.length) * Math.PI / 180)}% ${50 - 50 * Math.cos((360 / SEGMENTS.length) * Math.PI / 180)}%)`,
                    }}
                  >
                    <div className={`w-full h-full bg-gradient-to-br ${segment.color}`} />
                    <div
                      className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold whitespace-nowrap"
                      style={{ transform: `rotate(${360 / SEGMENTS.length / 2}deg)` }}
                    >
                      {segment.label}
                    </div>
                  </div>
                );
              })}
              {/* Center */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-zinc-900 border-2 border-amber-500 flex items-center justify-center text-2xl z-10 shadow-lg">
                {'\u{1F4A9}'}
              </div>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-center animate-bounce">
              <div className="text-2xl font-black text-amber-400">{result.label}</div>
              <div className="text-sm text-zinc-400">
                {result.value > 0 ? `+${result.value} points added!` : 'Boost activated!'}
              </div>
            </div>
          )}

          {/* Spin Button */}
          <button
            onClick={spin}
            disabled={spinning || spinsLeft <= 0}
            className="px-12 py-4 bg-gradient-to-r from-amber-500 to-orange-500 disabled:from-zinc-700 disabled:to-zinc-800 rounded-2xl font-black text-lg active:scale-[0.985] shadow-lg shadow-amber-500/20 transition-all disabled:shadow-none"
          >
            {spinning ? 'SPINNING...' : spinsLeft > 0 ? `SPIN (${spinsLeft} left)` : 'COME BACK TOMORROW'}
          </button>

          {nextSpinTime && spinsLeft <= 0 && (
            <div className="mt-4 text-sm text-zinc-500">
              Next free spin resets daily at midnight
            </div>
          )}

          {isVip && (
            <div className="mt-3 text-xs text-amber-400">
              {'\u{1F451}'} VIP: 3 daily spins + better odds
            </div>
          )}

          {/* Prize Table */}
          <div className="mt-8 w-full max-w-sm">
            <h3 className="font-bold mb-3 text-sm text-zinc-400">PRIZE TABLE</h3>
            <div className="space-y-1">
              {SEGMENTS.map((segment, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-zinc-800/30 rounded-lg text-sm">
                  <span>{segment.label}</span>
                  <span className="text-zinc-500">{segment.chance}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scratch Cards */}
      {activeGame === 'scratch' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-zinc-400">Scratches remaining: <span className="text-amber-400 font-bold">{scratchesLeft}</span></div>
            {isVip && <div className="text-xs text-amber-400">{'\u{1F451}'} VIP: 5 daily scratches</div>}
          </div>

          {scratchResult && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-center">
              <span className="text-xl font-black text-amber-400">{scratchResult}</span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {scratchCards.map((card, i) => (
              <button
                key={i}
                onClick={() => handleScratch(i)}
                disabled={card.revealed || scratchesLeft <= 0}
                className={`relative h-36 rounded-2xl border-2 transition-all overflow-hidden ${
                  card.revealed
                    ? 'border-amber-500/40 bg-zinc-900/50'
                    : scratchesLeft > 0
                    ? 'border-white/10 bg-gradient-to-br from-amber-600 to-orange-700 hover:scale-105 cursor-pointer active:scale-95'
                    : 'border-white/5 bg-zinc-800/50 cursor-not-allowed opacity-50'
                }`}
              >
                {card.revealed ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className={`text-2xl font-black ${rarityColor(card.prize.rarity)}`}>
                      {card.prize.label}
                    </div>
                    <div className={`text-xs mt-1 capitalize ${rarityColor(card.prize.rarity)}`}>
                      {card.prize.rarity}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-4xl mb-2">{'\u{1F4A9}'}</div>
                    <div className="text-sm font-bold text-white/80">SCRATCH ME</div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {scratchesLeft <= 0 && (
            <div className="mt-6 text-center text-sm text-zinc-500">
              Daily scratches used up. Come back tomorrow!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
