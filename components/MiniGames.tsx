'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

interface MiniGamesProps {
  balance: number;
  onWin: (amount: number, game: string) => void;
  onLose: (amount: number, game: string) => void;
}

type GameType = 'coinflip' | 'dice' | 'prediction';

const TOKENS = [
  { name: '$SHIT', icon: '\u{1F4A9}', volatility: 0.15 },
  { name: '$DOGE', icon: '\u{1F436}', volatility: 0.08 },
  { name: '$PEPE', icon: '\u{1F438}', volatility: 0.12 },
  { name: '$FLOKI', icon: '\u{1F43A}', volatility: 0.10 },
];

const MAX_PLAYS_PER_HOUR = 30;

/* ─── Animated Coin ─── */
function AnimatedCoin({ flipping, result }: { flipping: boolean; result: 'heads' | 'tails' | null }) {
  return (
    <div className="perspective-[600px] mx-auto mb-6" style={{ width: 140, height: 140 }}>
      <div
        className="relative w-full h-full transition-transform duration-100"
        style={{
          transformStyle: 'preserve-3d',
          animation: flipping ? 'coinSpin 0.3s linear infinite' : 'none',
          transform: !flipping && result === 'tails' ? 'rotateY(180deg)' : !flipping ? 'rotateY(0deg)' : undefined,
        }}
      >
        {/* Heads side */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center text-6xl"
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 50%, #b45309 100%)',
            boxShadow: '0 8px 32px rgba(245,158,11,0.4), inset 0 2px 4px rgba(255,255,255,0.3)',
            border: '4px solid #92400e',
          }}
        >
          <span style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>{'\u{1F4A9}'}</span>
        </div>
        {/* Tails side */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center text-6xl"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #6d28d9 100%)',
            boxShadow: '0 8px 32px rgba(124,58,237,0.4), inset 0 2px 4px rgba(255,255,255,0.3)',
            border: '4px solid #5b21b6',
          }}
        >
          <span style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>{'\u{1F4B0}'}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Animated Dice ─── */
function AnimatedDice({ rolling, result }: { rolling: boolean; result: number | null }) {
  const [displayNum, setDisplayNum] = useState(0);

  useEffect(() => {
    if (!rolling) {
      if (result !== null) setDisplayNum(result);
      return;
    }
    const interval = setInterval(() => {
      setDisplayNum(Math.floor(Math.random() * 100) + 1);
    }, 60);
    return () => clearInterval(interval);
  }, [rolling, result]);

  const num = rolling ? displayNum : (result ?? 0);

  return (
    <div className="mx-auto mb-6 flex items-center justify-center">
      <div
        className="relative w-32 h-32 rounded-2xl flex items-center justify-center"
        style={{
          background: rolling
            ? 'linear-gradient(135deg, #f59e0b, #ea580c)'
            : result !== null
            ? 'linear-gradient(135deg, #18181b, #27272a)'
            : 'linear-gradient(135deg, #27272a, #3f3f46)',
          boxShadow: rolling
            ? '0 0 40px rgba(245,158,11,0.5), 0 8px 24px rgba(0,0,0,0.4)'
            : '0 8px 24px rgba(0,0,0,0.4)',
          animation: rolling ? 'diceShake 0.15s ease-in-out infinite' : 'none',
          transition: 'background 0.3s, box-shadow 0.3s',
        }}
      >
        <span
          className="font-black tabular-nums"
          style={{
            fontSize: num > 99 ? 48 : 56,
            color: rolling ? '#000' : '#f59e0b',
            textShadow: rolling ? 'none' : '0 0 20px rgba(245,158,11,0.5)',
          }}
        >
          {num || '?'}
        </span>
      </div>
    </div>
  );
}

/* ─── Mini Chart (Canvas) ─── */
function MiniChart({ active, result, direction }: { active: boolean; result: 'win' | 'lose' | null; direction: 'pump' | 'dump' | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<number[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Initialize with flat line
    if (pointsRef.current.length === 0) {
      pointsRef.current = Array.from({ length: 60 }, () => h * 0.5);
    }

    let running = true;

    const draw = () => {
      if (!running) return;

      ctx.clearRect(0, 0, w, h);

      // Background grid
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Add point when active
      if (active && !result) {
        const last = pointsRef.current[pointsRef.current.length - 1];
        const drift = (Math.random() - 0.48) * 8;
        const next = Math.max(20, Math.min(h - 20, last + drift));
        pointsRef.current.push(next);
        if (pointsRef.current.length > 120) pointsRef.current.shift();
      }

      const pts = pointsRef.current;
      if (pts.length < 2) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      // Determine color
      const lastPt = pts[pts.length - 1];
      const firstPt = pts[0];
      const goingUp = lastPt < firstPt;
      const lineColor = result
        ? (result === 'win' ? '#22c55e' : '#ef4444')
        : goingUp ? '#22c55e' : '#ef4444';

      // Draw area fill
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      if (goingUp || (result === 'win' && direction === 'pump') || (result === 'lose' && direction === 'dump')) {
        grad.addColorStop(0, 'rgba(34,197,94,0.2)');
        grad.addColorStop(1, 'rgba(34,197,94,0)');
      } else {
        grad.addColorStop(0, 'rgba(239,68,68,0)');
        grad.addColorStop(1, 'rgba(239,68,68,0.2)');
      }

      ctx.beginPath();
      const step = w / (pts.length - 1);
      ctx.moveTo(0, pts[0]);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(i * step, pts[i]);
      }
      ctx.lineTo((pts.length - 1) * step, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Draw line
      ctx.beginPath();
      ctx.moveTo(0, pts[0]);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(i * step, pts[i]);
      }
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Glow dot at end
      const endX = (pts.length - 1) * step;
      const endY = pts[pts.length - 1];
      ctx.beginPath();
      ctx.arc(endX, endY, 5, 0, Math.PI * 2);
      ctx.fillStyle = lineColor;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(endX, endY, 10, 0, Math.PI * 2);
      ctx.fillStyle = lineColor.replace(')', ',0.2)').replace('rgb', 'rgba');
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [active, result, direction]);

  // Reset chart on new round
  useEffect(() => {
    if (!active && !result) {
      pointsRef.current = Array.from({ length: 60 }, () => 80);
    }
  }, [active, result]);

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={160}
      className="w-full rounded-xl border border-white/5"
      style={{ background: 'rgba(9,9,11,0.8)' }}
    />
  );
}

/* ─── Bet Controls Component ─── */
function BetControls({
  bet,
  setBet,
  balance,
}: {
  bet: number;
  setBet: (v: number) => void;
  balance: number;
}) {
  const presets = [50, 100, 250, 500, 1000];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setBet(Math.max(10, Math.floor(bet / 2)))}
          className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-bold text-zinc-400"
        >
          ½
        </button>
        <input
          type="number"
          value={bet}
          onChange={(e) => setBet(Math.max(0, Number(e.target.value)))}
          className="flex-1 px-4 py-3 bg-zinc-800/80 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none text-center text-xl font-black text-amber-400"
        />
        <button
          onClick={() => setBet(Math.min(balance, bet * 2))}
          className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-bold text-zinc-400"
        >
          2x
        </button>
        <button
          onClick={() => setBet(balance)}
          className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-bold text-amber-400"
        >
          MAX
        </button>
      </div>
      <div className="flex gap-1.5">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => setBet(p)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              bet === p
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-zinc-800/60 text-zinc-500 hover:text-zinc-300 border border-transparent'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Countdown Ring ─── */
function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const pct = seconds / total;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="72" height="72" className="-rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
        <circle
          cx="36" cy="36" r={r}
          fill="none"
          stroke={seconds <= 2 ? '#ef4444' : '#f59e0b'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <span className={`absolute text-xl font-black ${seconds <= 2 ? 'text-red-400' : 'text-amber-400'}`}>
        {seconds}
      </span>
    </div>
  );
}



/* ─── Main Component ─── */
export default function MiniGames({ balance, onWin, onLose }: MiniGamesProps) {
  const [activeGame, setActiveGame] = useState<GameType>('coinflip');
  const [playCount, setPlayCount] = useState(0);
  const [lastResetTime, setLastResetTime] = useState(Date.now());
  const [cooldownEnd, setCooldownEnd] = useState(0);

  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    if (now - lastResetTime > 3600000) {
      setPlayCount(0);
      setLastResetTime(now);
      return true;
    }
    if (playCount >= MAX_PLAYS_PER_HOUR) {
      setCooldownEnd(lastResetTime + 3600000);
      return false;
    }
    return true;
  }, [playCount, lastResetTime]);

  const recordPlay = useCallback(() => {
    setPlayCount(prev => prev + 1);
  }, []);

  // Coin Flip state
  const [coinBet, setCoinBet] = useState(100);
  const [coinChoice, setCoinChoice] = useState<'heads' | 'tails'>('heads');
  const [coinFlipping, setCoinFlipping] = useState(false);
  const [coinResult, setCoinResult] = useState<{ side: 'heads' | 'tails'; won: boolean } | null>(null);

  // Dice Roll state
  const [diceBet, setDiceBet] = useState(100);
  const [diceTarget, setDiceTarget] = useState(50);
  const [diceRolling, setDiceRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<{ roll: number; won: boolean } | null>(null);

  // Prediction state
  const [predBet, setPredBet] = useState(100);
  const [predToken, setPredToken] = useState('$SHIT');
  const [predPrice, setPredPrice] = useState(0.00042);
  const [predDirection, setPredDirection] = useState<'pump' | 'dump' | null>(null);
  const [predResult, setPredResult] = useState<'win' | 'lose' | null>(null);
  const [predTime, setPredTime] = useState(5);
  const [predicting, setPredicting] = useState(false);

  // ─── Game Logic ───

  const flipCoin = useCallback(() => {
    if (coinFlipping || coinBet > balance || coinBet <= 0) return;
    if (!checkRateLimit()) return;
    setCoinFlipping(true);
    setCoinResult(null);
    recordPlay();

    setTimeout(() => {
      const result = Math.random() < 0.49 ? 'heads' : 'tails';
      const won = result === coinChoice;
      setCoinResult({ side: result, won });
      setCoinFlipping(false);

      if (won) onWin(coinBet, 'Coin Flip');
      else onLose(coinBet, 'Coin Flip');
    }, 2000);
  }, [coinFlipping, coinBet, coinChoice, balance, onWin, onLose, checkRateLimit, recordPlay]);

  const rollDice = useCallback(() => {
    if (diceRolling || diceBet > balance || diceBet <= 0) return;
    if (!checkRateLimit()) return;
    setDiceRolling(true);
    setDiceResult(null);
    recordPlay();

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 100) + 1;
      const won = roll <= diceTarget;
      const multiplier = 98 / diceTarget;
      setDiceResult({ roll, won });
      setDiceRolling(false);

      if (won) onWin(Math.floor(diceBet * (multiplier - 1)), 'Dice Roll');
      else onLose(diceBet, 'Dice Roll');
    }, 1800);
  }, [diceRolling, diceBet, diceTarget, balance, onWin, onLose, checkRateLimit, recordPlay]);

  const makePrediction = useCallback((direction: 'pump' | 'dump') => {
    if (predicting || predBet > balance || predBet <= 0) return;
    if (!checkRateLimit()) return;
    recordPlay();
    setPredicting(true);
    setPredDirection(direction);
    setPredResult(null);
    setPredTime(5);

    let countdown = 5;
    const interval = setInterval(() => {
      countdown--;
      setPredTime(countdown);
      setPredPrice(prev => prev * (1 + (Math.random() - 0.5) * 0.03));

      if (countdown <= 0) {
        clearInterval(interval);
        const priceChange = (Math.random() - 0.48) * 0.1;
        const went = priceChange > 0 ? 'pump' : 'dump';
        const won = went === direction;

        setPredResult(won ? 'win' : 'lose');
        setPredPrice(prev => prev * (1 + priceChange));
        setPredicting(false);

        if (won) onWin(predBet, `${predToken} Prediction`);
        else onLose(predBet, `${predToken} Prediction`);

        setTimeout(() => {
          setPredDirection(null);
          setPredResult(null);
          setPredTime(5);
        }, 3000);
      }
    }, 1000);
  }, [predicting, predBet, predToken, balance, onWin, onLose, checkRateLimit, recordPlay]);

  const diceMultiplier = (98 / diceTarget).toFixed(2);
  const dicePotentialWin = Math.floor(diceBet * (98 / diceTarget - 1));

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-8">
        <div className="text-amber-500 text-sm font-bold tracking-[3px]">DEGEN CASINO</div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight">MINI <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">GAMES</span></h2>
        <div className="mt-2 flex items-center gap-4 text-sm text-zinc-500">
          <span>{playCount}/{MAX_PLAYS_PER_HOUR} plays this hour</span>
          {cooldownEnd > Date.now() && (
            <span className="text-red-400">Rate limited</span>
          )}
        </div>
      </div>

      {/* Balance Bar */}
      <div className="flex items-center justify-between p-4 mb-6 rounded-2xl bg-zinc-900/60 border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-xl">{'\u{1F4A9}'}</div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Balance</div>
            <div className="text-xl font-black text-amber-400">{balance.toLocaleString()} $SHIT</div>
          </div>
        </div>
        <div className="text-xs text-zinc-600 bg-zinc-800/50 px-3 py-1 rounded-full">House edge 2-4%</div>
      </div>

      {/* Game Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-zinc-900/50 rounded-2xl border border-white/5">
        {[
          { id: 'coinflip' as const, label: 'COIN FLIP', icon: '\u{1FA99}' },
          { id: 'dice' as const, label: 'DICE', icon: '\u{1F3B2}' },
          { id: 'prediction' as const, label: 'PUMP/DUMP', icon: '\u{1F4C8}' },
        ].map((game) => (
          <button
            key={game.id}
            onClick={() => setActiveGame(game.id)}
            className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeGame === game.id
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className="mr-1.5">{game.icon}</span>
            {game.label}
          </button>
        ))}
      </div>

      {/* ═══════ COIN FLIP ═══════ */}
      {activeGame === 'coinflip' && (
        <div className="rounded-2xl border border-white/5 overflow-hidden">
          {/* Coin area */}
          <div
            className="p-8 flex flex-col items-center"
            style={{
              background: coinResult
                ? coinResult.won
                  ? 'radial-gradient(ellipse at center, rgba(34,197,94,0.08) 0%, rgba(9,9,11,0.9) 70%)'
                  : 'radial-gradient(ellipse at center, rgba(239,68,68,0.08) 0%, rgba(9,9,11,0.9) 70%)'
                : 'radial-gradient(ellipse at center, rgba(245,158,11,0.05) 0%, rgba(9,9,11,0.9) 70%)',
            }}
          >
            <AnimatedCoin flipping={coinFlipping} result={coinResult?.side ?? null} />

            {/* Result */}
            {coinResult && (
              <div
                className={`text-center px-8 py-4 rounded-2xl ${coinResult.won ? 'text-green-400 animate-win-glow' : 'text-red-400'}`}
                style={{
                  animation: coinResult.won 
                    ? 'resultPop 0.4s ease-out, win-glow 1.5s ease-in-out infinite' 
                    : 'loseShake 0.5s ease-out',
                  background: coinResult.won 
                    ? 'rgba(34, 197, 94, 0.05)' 
                    : 'rgba(239, 68, 68, 0.05)',
                }}
              >
                <div className="text-4xl font-black mb-1">
                  {coinResult.won ? `+${coinBet} $SHIT` : `-${coinBet} $SHIT`}
                </div>
                <div className="text-sm opacity-70 font-bold">
                  {coinResult.side.toUpperCase()} — {coinResult.won ? 'WAGMI SER' : 'NGMI SER'}
                </div>
              </div>
            )}

            {!coinResult && !coinFlipping && (
              <div className="text-sm text-zinc-500">Pick a side and send it</div>
            )}
          </div>

          {/* Controls */}
          <div className="p-6 bg-zinc-900/80 space-y-4">
            {/* Choice buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCoinChoice('heads')}
                className={`py-4 rounded-xl font-black text-lg transition-all ${
                  coinChoice === 'heads'
                    ? 'bg-gradient-to-br from-amber-500/30 to-amber-600/10 text-amber-400 border-2 border-amber-500/50 shadow-lg shadow-amber-500/10'
                    : 'bg-zinc-800/60 text-zinc-500 border-2 border-transparent hover:border-zinc-700'
                }`}
              >
                {'\u{1F4A9}'} HEADS
              </button>
              <button
                onClick={() => setCoinChoice('tails')}
                className={`py-4 rounded-xl font-black text-lg transition-all ${
                  coinChoice === 'tails'
                    ? 'bg-gradient-to-br from-purple-500/30 to-purple-600/10 text-purple-400 border-2 border-purple-500/50 shadow-lg shadow-purple-500/10'
                    : 'bg-zinc-800/60 text-zinc-500 border-2 border-transparent hover:border-zinc-700'
                }`}
              >
                {'\u{1F4B0}'} TAILS
              </button>
            </div>

            <BetControls bet={coinBet} setBet={setCoinBet} balance={balance} />

            <button
              onClick={flipCoin}
              disabled={coinFlipping || coinBet > balance || coinBet <= 0}
              className={`w-full py-4 rounded-xl font-black text-lg transition-all ${
                coinFlipping
                  ? 'bg-amber-600 animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] shadow-lg shadow-amber-500/20'
              } disabled:from-zinc-700 disabled:to-zinc-800 disabled:shadow-none disabled:text-zinc-500`}
            >
              {coinFlipping ? 'FLIPPING...' : 'SEND IT'}
            </button>

            <div className="text-center text-xs text-zinc-600">49% win chance · 2x payout</div>
          </div>
        </div>
      )}

      {/* ═══════ DICE ROLL ═══════ */}
      {activeGame === 'dice' && (
        <div className="rounded-2xl border border-white/5 overflow-hidden">
          {/* Dice area */}
          <div
            className="p-8 flex flex-col items-center"
            style={{
              background: diceResult
                ? diceResult.won
                  ? 'radial-gradient(ellipse at center, rgba(34,197,94,0.08) 0%, rgba(9,9,11,0.9) 70%)'
                  : 'radial-gradient(ellipse at center, rgba(239,68,68,0.08) 0%, rgba(9,9,11,0.9) 70%)'
                : 'radial-gradient(ellipse at center, rgba(245,158,11,0.05) 0%, rgba(9,9,11,0.9) 70%)',
            }}
          >
            <AnimatedDice rolling={diceRolling} result={diceResult?.roll ?? null} />

            {diceResult && (
              <div
                className={`text-center px-8 py-4 rounded-2xl ${diceResult.won ? 'text-green-400' : 'text-red-400'}`}
                style={{
                  animation: diceResult.won 
                    ? 'resultPop 0.4s ease-out, win-glow 1.5s ease-in-out infinite' 
                    : 'loseShake 0.5s ease-out',
                  background: diceResult.won 
                    ? 'rgba(34, 197, 94, 0.05)' 
                    : 'rgba(239, 68, 68, 0.05)',
                }}
              >
                <div className="text-4xl font-black mb-1">
                  {diceResult.won ? `+${dicePotentialWin} $SHIT` : `-${diceBet} $SHIT`}
                </div>
                <div className="text-sm opacity-70 font-bold">
                  Rolled {diceResult.roll} — needed {'<'}{diceTarget}
                </div>
              </div>
            )}

            {!diceResult && !diceRolling && (
              <div className="text-sm text-zinc-500">Roll under your target to win</div>
            )}
          </div>

          {/* Controls */}
          <div className="p-6 bg-zinc-900/80 space-y-4">
            {/* Target slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-400">Roll under <span className="text-amber-400 font-bold">{diceTarget}</span></span>
                <span className="text-sm font-bold text-amber-400">{diceMultiplier}x</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min={5}
                  max={95}
                  value={diceTarget}
                  onChange={(e) => setDiceTarget(Number(e.target.value))}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #22c55e 0%, #22c55e ${diceTarget}%, #ef4444 ${diceTarget}%, #ef4444 100%)`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                <span>HIGH RISK</span>
                <span>{diceTarget}% chance</span>
                <span>LOW RISK</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-zinc-800/50 rounded-xl text-center">
                <div className="text-[10px] text-zinc-600 uppercase">Multiplier</div>
                <div className="text-sm font-black text-amber-400">{diceMultiplier}x</div>
              </div>
              <div className="p-2.5 bg-zinc-800/50 rounded-xl text-center">
                <div className="text-[10px] text-zinc-600 uppercase">Win Chance</div>
                <div className="text-sm font-black text-zinc-300">{diceTarget}%</div>
              </div>
              <div className="p-2.5 bg-zinc-800/50 rounded-xl text-center">
                <div className="text-[10px] text-zinc-600 uppercase">Potential</div>
                <div className="text-sm font-black text-green-400">+{dicePotentialWin}</div>
              </div>
            </div>

            <BetControls bet={diceBet} setBet={setDiceBet} balance={balance} />

            <button
              onClick={rollDice}
              disabled={diceRolling || diceBet > balance || diceBet <= 0}
              className={`w-full py-4 rounded-xl font-black text-lg transition-all ${
                diceRolling
                  ? 'bg-amber-600 animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] shadow-lg shadow-amber-500/20'
              } disabled:from-zinc-700 disabled:to-zinc-800 disabled:shadow-none disabled:text-zinc-500`}
            >
              {diceRolling ? 'ROLLING...' : 'ROLL IT'}
            </button>
          </div>
        </div>
      )}

      {/* ═══════ PUMP OR DUMP ═══════ */}
      {activeGame === 'prediction' && (
        <div className="rounded-2xl border border-white/5 overflow-hidden">
          {/* Chart area */}
          <div className="p-6 bg-zinc-950/80">
            {/* Token selector */}
            <div className="flex gap-1.5 mb-4">
              {TOKENS.map((token) => (
                <button
                  key={token.name}
                  onClick={() => !predicting && setPredToken(token.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    predToken === token.name
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 border border-transparent'
                  }`}
                >
                  {token.icon} {token.name}
                </button>
              ))}
            </div>

            {/* Price + countdown */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl font-black text-white">${predPrice.toFixed(6)}</div>
                <div className="text-xs text-zinc-500">{predToken} / USD</div>
              </div>
              {predicting && !predResult && (
                <CountdownRing seconds={predTime} total={5} />
              )}
              {predResult && (
                <div
                  className={`text-2xl font-black px-6 py-3 rounded-2xl ${predResult === 'win' ? 'text-green-400' : 'text-red-400'}`}
                  style={{ 
                    animation: predResult === 'win' 
                      ? 'resultPop 0.4s ease-out, win-glow 1.5s ease-in-out infinite' 
                      : 'loseShake 0.5s ease-out',
                    background: predResult === 'win' 
                      ? 'rgba(34, 197, 94, 0.08)' 
                      : 'rgba(239, 68, 68, 0.08)',
                  }}
                >
                  {predResult === 'win' ? `+${predBet}` : `-${predBet}`}
                </div>
              )}
            </div>

            {/* Chart */}
            <MiniChart active={predicting} result={predResult} direction={predDirection} />
          </div>

          {/* Controls */}
          <div className="p-6 bg-zinc-900/80 space-y-4">
            <BetControls bet={predBet} setBet={setPredBet} balance={balance} />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => makePrediction('pump')}
                disabled={predicting || predBet > balance || predBet <= 0}
                className="py-4 rounded-xl font-black text-lg transition-all bg-green-500/10 hover:bg-green-500/20 text-green-400 border-2 border-green-500/20 hover:border-green-500/40 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:border-zinc-700 active:scale-[0.98]"
              >
                {'\u{2B06}\uFE0F'} PUMP
              </button>
              <button
                onClick={() => makePrediction('dump')}
                disabled={predicting || predBet > balance || predBet <= 0}
                className="py-4 rounded-xl font-black text-lg transition-all bg-red-500/10 hover:bg-red-500/20 text-red-400 border-2 border-red-500/20 hover:border-red-500/40 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:border-zinc-700 active:scale-[0.98]"
              >
                {'\u{2B07}\uFE0F'} DUMP
              </button>
            </div>

            <div className="text-center text-xs text-zinc-600">~48% win chance · 2x payout · 5s round</div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-4 px-4 py-2.5 bg-zinc-900/30 rounded-xl text-[10px] text-zinc-600 text-center">
        Provably fair RNG · House edge 2-4% · Play responsibly ser
      </div>
    </div>
  );
}
