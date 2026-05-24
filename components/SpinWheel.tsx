'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

interface SpinWheelProps {
  onReward: (amount: number, label: string) => void;
  isVip?: boolean;
}

const SEGMENTS = [
  { label: '50 $SHIT', value: 50, color: '#3f3f46', colorEnd: '#52525b', chance: 25 },
  { label: '100 $SHIT', value: 100, color: '#b45309', colorEnd: '#92400e', chance: 20 },
  { label: '250 $SHIT', value: 250, color: '#52525b', colorEnd: '#3f3f46', chance: 15 },
  { label: '500 $SHIT', value: 500, color: '#d97706', colorEnd: '#b45309', chance: 12 },
  { label: '1K $SHIT', value: 1000, color: '#3f3f46', colorEnd: '#52525b', chance: 10 },
  { label: '2x JUICE', value: 0, color: '#7c3aed', colorEnd: '#6d28d9', chance: 8 },
  { label: '2.5K $SHIT', value: 2500, color: '#f59e0b', colorEnd: '#d97706', chance: 5 },
  { label: '5K $SHIT', value: 5000, color: '#ea580c', colorEnd: '#c2410c', chance: 3 },
  { label: 'MOON BAG', value: 10000, color: '#eab308', colorEnd: '#ca8a04', chance: 2 },
];

const SCRATCH_PRIZES = [
  { label: '25 $SHIT', value: 25, rarity: 'common' as const },
  { label: '50 $SHIT', value: 50, rarity: 'common' as const },
  { label: '100 $SHIT', value: 100, rarity: 'uncommon' as const },
  { label: '250 $SHIT', value: 250, rarity: 'rare' as const },
  { label: '500 $SHIT', value: 500, rarity: 'epic' as const },
  { label: '1K $SHIT', value: 1000, rarity: 'legendary' as const },
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

/* ─── Scratch Card Canvas Component ─── */
function ScratchCard({
  prize,
  onReveal,
  disabled,
}: {
  prize: { label: string; value: number; rarity: string };
  onReveal: () => void;
  disabled: boolean;
  index: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const isDrawingRef = useRef(false);
  const moveCountRef = useRef(0);

  const rarityColors: Record<string, { text: string; glow: string; bg: string }> = {
    common: { text: 'text-zinc-300', glow: '', bg: 'bg-zinc-700/30' },
    uncommon: { text: 'text-green-400', glow: 'shadow-green-500/30', bg: 'bg-green-900/20' },
    rare: { text: 'text-blue-400', glow: 'shadow-blue-500/30', bg: 'bg-blue-900/20' },
    epic: { text: 'text-purple-400', glow: 'shadow-purple-500/40', bg: 'bg-purple-900/20' },
    legendary: { text: 'text-amber-400', glow: 'shadow-amber-500/40', bg: 'bg-amber-900/20' },
  };

  const rc = rarityColors[prize.rarity] || rarityColors.common;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || revealed || disabled) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Draw the scratch surface with gradient
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#d97706');
    gradient.addColorStop(0.3, '#ea580c');
    gradient.addColorStop(0.7, '#b45309');
    gradient.addColorStop(1, '#d97706');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Add subtle diagonal stripe pattern
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    for (let i = -h; i < w + h; i += 12) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + h, h);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Add sparkle dots
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = '#fff';
      const x = Math.random() * w;
      const y = Math.random() * h;
      const size = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Poop emoji
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('\u{1F4A9}', w / 2, h / 2 + 2);

    // "SCRATCH ME" text with shadow
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('SCRATCH ME', w / 2, h / 2 + 28);
    ctx.shadowBlur = 0;
  }, [revealed, disabled]);

  const scratch = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas || revealed || disabled) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * canvas.width;
      const y = ((clientY - rect.top) / rect.height) * canvas.height;

      const brushSize = 22;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, brushSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';

      // Check actual scratched percentage every ~8 moves via pixel sampling
      moveCountRef.current += 1;
      if (moveCountRef.current % 8 === 0) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let transparent = 0;
        const total = imgData.data.length / 4;
        for (let p = 3; p < imgData.data.length; p += 16) {
          if (imgData.data[p] === 0) transparent++;
        }
        const sampled = imgData.data.length / 16;
        const pct = (transparent / sampled) * 100;

        if (pct > 70 && !revealed) {
          setRevealed(true);
          onReveal();
        }
      }
    },
    [revealed, disabled, onReveal]
  );

  const handleMouseDown = () => {
    isDrawingRef.current = true;
  };
  const handleMouseUp = () => {
    isDrawingRef.current = false;
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDrawingRef.current) scratch(e.clientX, e.clientY);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  };

  return (
    <div
      className={`relative h-44 sm:h-48 rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
        revealed
          ? `border-amber-500/40 ${rc.bg} shadow-lg ${rc.glow} scale-[1.02]`
          : disabled
          ? 'border-white/5 bg-zinc-800/50 opacity-50'
          : 'border-amber-500/20 hover:border-amber-500/40'
      }`}
    >
      {/* Prize underneath */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90">
        <div className={`text-2xl sm:text-3xl font-black ${rc.text} ${revealed ? 'animate-pulse' : ''}`}>
          {prize.label}
        </div>
        <div className={`text-xs mt-1 capitalize font-bold ${rc.text} opacity-70`}>{prize.rarity}</div>
        {revealed && (
          <div className="absolute top-2 right-2 text-amber-400 text-xs font-bold animate-bounce">
            {'\u2713'} WON
          </div>
        )}
      </div>

      {/* Canvas scratch overlay */}
      {!revealed && !disabled && (
        <canvas
          ref={canvasRef}
          width={320}
          height={200}
          className="absolute inset-0 w-full h-full cursor-pointer touch-none"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          onTouchMove={handleTouchMove}
        />
      )}
    </div>
  );
}

/* ─── Main SpinWheel Component ─── */
export default function SpinWheel({ onReward, isVip = false }: SpinWheelProps) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<(typeof SEGMENTS)[0] | null>(null);
  const [spinsLeft, setSpinsLeft] = useState(isVip ? 3 : 1);
  const [nextSpinTime, setNextSpinTime] = useState<Date | null>(null);
  const [activeGame, setActiveGame] = useState<'wheel' | 'scratch'>('wheel');

  // Scratch card state
  const [scratchCards] = useState(() =>
    Array.from({ length: 6 }, () => ({
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
    const targetAngle = 360 - selectedIndex * segmentAngle - segmentAngle / 2;
    const fullSpins = 5 + Math.floor(Math.random() * 3);
    const newRotation = rotation + fullSpins * 360 + targetAngle;

    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(selected);
      setSpinsLeft((prev) => prev - 1);

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

  const handleScratch = useCallback(
    (index: number) => {
      if (scratchesLeft <= 0) return;
      setScratchesLeft((prev) => prev - 1);

      const prize = scratchCards[index].prize;
      setScratchResult(`WON ${prize.label}!`);
      if (prize.value > 0) {
        onReward(prize.value, `Scratch: ${prize.label}`);
      }
      setTimeout(() => setScratchResult(null), 2500);
    },
    [scratchesLeft, scratchCards, onReward]
  );

  /* ─── SVG Wheel ─── */
  const wheelSize = 340;
  const cx = wheelSize / 2;
  const cy = wheelSize / 2;
  const outerRadius = wheelSize / 2 - 6;
  const innerRadius = outerRadius - 8;
  const segmentAngle = 360 / SEGMENTS.length;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-10">
        <div className="text-amber-500 text-sm font-bold tracking-[3px]">DAILY REWARDS</div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">DEGEN WHEEL</h2>
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
          {'\u{1F3B0}'} SPIN
        </button>
        <button
          onClick={() => setActiveGame('scratch')}
          className={`px-6 py-3 rounded-2xl font-bold transition-all ${
            activeGame === 'scratch'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20'
              : 'bg-zinc-800/50 text-zinc-400 hover:text-white border border-white/10'
          }`}
        >
          {'\u{1F3AB}'} SCRATCH
        </button>
      </div>

      {/* Spin Wheel */}
      {activeGame === 'wheel' && (
        <div className="flex flex-col items-center">
          {/* Wheel Container */}
          <div className="relative mb-8" style={{ width: wheelSize, height: wheelSize }}>
            {/* Pointer / Triangle - sits on top of wheel */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20" style={{ marginTop: -4 }}>
              <svg width="28" height="36" viewBox="0 0 28 36">
                <defs>
                  <filter id="pointerShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
                  </filter>
                </defs>
                <polygon points="14,36 0,0 28,0" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" filter="url(#pointerShadow)" />
              </svg>
            </div>

            {/* Pulsing outer glow */}
            <div
              className={`absolute -inset-6 rounded-full blur-2xl transition-opacity duration-1000 ${spinning ? 'opacity-60 animate-pulse' : 'opacity-30'}`}
              style={{
                background: 'radial-gradient(circle, rgba(245,158,11,0.5) 0%, rgba(234,88,12,0.2) 50%, transparent 70%)',
              }}
            />

            {/* SVG Wheel */}
            <svg
              width={wheelSize}
              height={wheelSize}
              viewBox={`0 0 ${wheelSize} ${wheelSize}`}
              className="relative z-10"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))',
              }}
            >
              <defs>
                {/* Gradient defs for each segment */}
                {SEGMENTS.map((segment, i) => (
                  <radialGradient key={`grad-${i}`} id={`seg-grad-${i}`} cx="50%" cy="50%" r="60%">
                    <stop offset="0%" stopColor={segment.colorEnd} />
                    <stop offset="100%" stopColor={segment.color} />
                  </radialGradient>
                ))}
              </defs>

              {/* Decorative outer ring */}
              <circle cx={cx} cy={cy} r={outerRadius + 4} fill="none" stroke="#f59e0b" strokeWidth="3" opacity="0.7" />
              <circle cx={cx} cy={cy} r={outerRadius + 1.5} fill="none" stroke="#78350f" strokeWidth="1" opacity="0.5" />

              {/* Segments */}
              {SEGMENTS.map((segment, i) => {
                const startAngle = i * segmentAngle;
                const endAngle = startAngle + segmentAngle;
                const d = describeArc(cx, cy, innerRadius, startAngle, endAngle);

                // Label position — pushed outward
                const midAngle = startAngle + segmentAngle / 2;
                const labelR = innerRadius * 0.62;
                const labelPos = polarToCartesian(cx, cy, labelR, midAngle);

                // Tick marks at segment boundaries
                const tickOuter = polarToCartesian(cx, cy, outerRadius + 1, startAngle);
                const tickInner = polarToCartesian(cx, cy, innerRadius - 6, startAngle);

                return (
                  <g key={i}>
                    <path d={d} fill={`url(#seg-grad-${i})`} stroke="#09090b" strokeWidth="1.5" />
                    {/* Tick mark line at boundary */}
                    <line
                      x1={tickOuter.x} y1={tickOuter.y}
                      x2={tickInner.x} y2={tickInner.y}
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      opacity="0.4"
                    />
                    {/* Label — flip text on bottom half so it stays readable */}
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      fill="white"
                      fontSize="11"
                      fontWeight="800"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${midAngle > 180 ? midAngle + 180 : midAngle}, ${labelPos.x}, ${labelPos.y})`}
                      style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
                    >
                      {segment.label}
                    </text>
                  </g>
                );
              })}

              {/* Dot markers on outer ring at each boundary */}
              {SEGMENTS.map((_, i) => {
                const angle = i * segmentAngle;
                const dotPos = polarToCartesian(cx, cy, outerRadius + 4, angle);
                return (
                  <circle key={`dot-${i}`} cx={dotPos.x} cy={dotPos.y} r="3" fill="#f59e0b" opacity="0.8" />
                );
              })}

              {/* Inner decorative rings */}
              <circle cx={cx} cy={cy} r="42" fill="#09090b" stroke="#f59e0b" strokeWidth="3" />
              <circle cx={cx} cy={cy} r="37" fill="#18181b" stroke="#27272a" strokeWidth="1" />
              <circle cx={cx} cy={cy} r="34" fill="url(#centerGrad)" />

              {/* Center gradient */}
              <defs>
                <radialGradient id="centerGrad">
                  <stop offset="0%" stopColor="#27272a" />
                  <stop offset="100%" stopColor="#18181b" />
                </radialGradient>
              </defs>

              {/* Center poop emoji */}
              <text x={cx} y={cy + 2} fontSize="30" textAnchor="middle" dominantBaseline="middle">
                {'\u{1F4A9}'}
              </text>
            </svg>
          </div>

          {/* Result */}
          {result && (
            <div className="mb-6 px-8 py-5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-center shadow-lg shadow-amber-500/10">
              <div className="text-3xl font-black text-amber-400 mb-1">{result.label}</div>
              <div className="text-sm text-zinc-400">
                {result.value > 0 ? `+${result.value} $SHIT added ser!` : 'Boost activated! LFG'}
              </div>
            </div>
          )}

          {/* Spin Button */}
          <button
            onClick={spin}
            disabled={spinning || spinsLeft <= 0}
            className={`px-14 py-5 rounded-2xl font-black text-lg transition-all shadow-lg ${
              spinning
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 animate-pulse shadow-amber-500/30'
                : spinsLeft > 0
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-[0.97] shadow-amber-500/20 hover:shadow-amber-500/40'
                : 'bg-zinc-800 text-zinc-500 shadow-none'
            }`}
          >
            {spinning ? 'SPINNING...' : spinsLeft > 0 ? `SEND IT (${spinsLeft} left)` : 'COPE. COME BACK TOMORROW.'}
          </button>

          {nextSpinTime && spinsLeft <= 0 && (
            <div className="mt-4 text-sm text-zinc-500">next free spin resets daily at midnight</div>
          )}

          {isVip && (
            <div className="mt-3 text-xs text-amber-400">{'\u{1F451}'} VIP: 3 daily spins + better odds</div>
          )}

          {/* Prize Table */}
          <div className="mt-8 w-full max-w-sm">
            <h3 className="font-bold mb-3 text-sm text-zinc-400">PRIZE TABLE</h3>
            <div className="space-y-1">
              {SEGMENTS.map((segment, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-zinc-800/30 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
                    <span>{segment.label}</span>
                  </div>
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
            <div className="text-sm text-zinc-400">
              scratches remaining: <span className="text-amber-400 font-bold">{scratchesLeft}</span>
            </div>
            {isVip && (
              <div className="text-xs text-amber-400">{'\u{1F451}'} VIP: 5 daily scratches</div>
            )}
          </div>

          <p className="text-xs text-zinc-500 mb-4">drag your finger / mouse to scratch the card and reveal your prize ser</p>

          {scratchResult && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-center animate-bounce">
              <span className="text-xl font-black text-amber-400">{scratchResult}</span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {scratchCards.map((card, i) => (
              <ScratchCard
                key={i}
                index={i}
                prize={card.prize}
                disabled={scratchesLeft <= 0}
                onReveal={() => handleScratch(i)}
              />
            ))}
          </div>

          {scratchesLeft <= 0 && (
            <div className="mt-6 text-center text-sm text-zinc-500">
              daily scratches used up. cope. come back tomorrow ser.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
