'use client';

import React, { useState, useCallback } from 'react';

interface MiniGamesProps {
  balance: number;
  onWin: (amount: number, game: string) => void;
  onLose: (amount: number, game: string) => void;
}

type GameType = 'coinflip' | 'dice' | 'prediction';

interface PredictionRound {
  token: string;
  currentPrice: number;
  timeLeft: number;
  direction: 'pump' | 'dump' | null;
  result: 'win' | 'lose' | null;
  betAmount: number;
}

const TOKENS = [
  { name: '$SHIT', icon: '\u{1F4A9}', volatility: 0.15 },
  { name: '$DOGE', icon: '\u{1F436}', volatility: 0.08 },
  { name: '$PEPE', icon: '\u{1F438}', volatility: 0.12 },
  { name: '$FLOKI', icon: '\u{1F43A}', volatility: 0.10 },
];

const MAX_PLAYS_PER_HOUR = 30;

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
  const [prediction, setPrediction] = useState<PredictionRound>({
    token: '$SHIT',
    currentPrice: 0.00042,
    timeLeft: 30,
    direction: null,
    result: null,
    betAmount: 100,
  });
  const [predicting, setPredicting] = useState(false);

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

      if (won) {
        onWin(coinBet, 'Coin Flip');
      } else {
        onLose(coinBet, 'Coin Flip');
      }
    }, 1500);
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
      const multiplier = (98 / diceTarget);
      setDiceResult({ roll, won });
      setDiceRolling(false);

      if (won) {
        onWin(Math.floor(diceBet * (multiplier - 1)), 'Dice Roll');
      } else {
        onLose(diceBet, 'Dice Roll');
      }
    }, 1200);
  }, [diceRolling, diceBet, diceTarget, balance, onWin, onLose, checkRateLimit, recordPlay]);

  const makePrediction = useCallback((direction: 'pump' | 'dump') => {
    if (predicting || prediction.betAmount > balance || prediction.betAmount <= 0) return;
    if (!checkRateLimit()) return;
    recordPlay();
    setPredicting(true);
    setPrediction(prev => ({ ...prev, direction }));

    // Simulate price movement
    let countdown = 5;
    const interval = setInterval(() => {
      countdown--;
      setPrediction(prev => ({ ...prev, timeLeft: countdown }));

      if (countdown <= 0) {
        clearInterval(interval);
        const priceChange = (Math.random() - 0.48) * 0.1; // Slight negative bias
        const went = priceChange > 0 ? 'pump' : 'dump';
        const won = went === direction;

        setPrediction(prev => ({
          ...prev,
          result: won ? 'win' : 'lose',
          currentPrice: prev.currentPrice * (1 + priceChange),
        }));
        setPredicting(false);

        if (won) {
          onWin(prediction.betAmount, `${prediction.token} Prediction`);
        } else {
          onLose(prediction.betAmount, `${prediction.token} Prediction`);
        }

        // Reset after showing result
        setTimeout(() => {
          setPrediction(prev => ({
            ...prev,
            direction: null,
            result: null,
            timeLeft: 30,
          }));
        }, 3000);
      }
    }, 1000);
  }, [predicting, prediction.betAmount, prediction.token, balance, onWin, onLose, checkRateLimit, recordPlay]);

  const betPresets = [50, 100, 250, 500, 1000];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-10">
        <div className="text-amber-500 text-sm font-bold tracking-[3px]">DEGEN CASINO</div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">MINI <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">GAMES</span></h2>
        <div className="mt-2 text-sm text-zinc-400">
          {playCount}/{MAX_PLAYS_PER_HOUR} plays this hour
          {cooldownEnd > Date.now() && (
            <span className="text-red-400 ml-2">Rate limited — try again later</span>
          )}
        </div>
      </div>

      {/* Balance */}
      <div className="glass-card border-amber-500/20 rounded-3xl p-6 mb-8 flex items-center justify-between">
        <div>
          <div className="text-xs text-zinc-500 uppercase">Your Balance</div>
          <div className="text-3xl font-black text-amber-400">{balance.toLocaleString()} $SHIT</div>
        </div>
        <div className="text-sm text-zinc-500">House edge: 2-4%</div>
      </div>

      {/* Game Tabs */}
      <div className="flex gap-3 mb-8 overflow-x-auto">
        {[
          { id: 'coinflip' as const, label: 'Coin Flip', icon: '\u{1FA99}' },
          { id: 'dice' as const, label: 'Dice Roll', icon: '\u{1F3B2}' },
          { id: 'prediction' as const, label: 'Pump or Dump', icon: '\u{1F4C8}' },
        ].map((game) => (
          <button
            key={game.id}
            onClick={() => setActiveGame(game.id)}
            className={`px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${
              activeGame === game.id
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-zinc-800/50 text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            <span className="mr-2">{game.icon}</span>
            {game.label}
          </button>
        ))}
      </div>

      {/* Coin Flip */}
      {activeGame === 'coinflip' && (
        <div className="bg-zinc-900/50 rounded-2xl p-8 border border-white/5">
          <div className="text-center mb-8">
            <div className={`text-8xl mb-4 inline-block transition-transform duration-500 ${coinFlipping ? 'animate-spin' : ''}`}>
              {coinResult ? (coinResult.side === 'heads' ? '\u{1FA99}' : '\u{1F4B0}') : '\u{1FA99}'}
            </div>

            {coinResult && (
              <div className={`text-2xl font-black mb-4 ${coinResult.won ? 'text-green-400' : 'text-red-400'}`}>
                {coinResult.side.toUpperCase()} — {coinResult.won ? `YOU WIN +${coinBet}!` : `YOU LOSE -${coinBet}`}
              </div>
            )}
          </div>

          {/* Choice */}
          <div className="flex gap-4 justify-center mb-6">
            <button
              onClick={() => setCoinChoice('heads')}
              className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all ${
                coinChoice === 'heads'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {'\u{1FA99}'} Heads
            </button>
            <button
              onClick={() => setCoinChoice('tails')}
              className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all ${
                coinChoice === 'tails'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {'\u{1F4B0}'} Tails
            </button>
          </div>

          {/* Bet Amount */}
          <div className="mb-6">
            <label className="block text-sm text-zinc-400 mb-2">Bet Amount ($SHIT)</label>
            <input
              type="number"
              value={coinBet}
              onChange={(e) => setCoinBet(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none text-center text-xl font-bold"
            />
            <div className="flex gap-2 mt-2">
              {betPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setCoinBet(preset)}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={flipCoin}
            disabled={coinFlipping || coinBet > balance || coinBet <= 0}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 disabled:from-zinc-700 disabled:to-zinc-800 rounded-2xl font-black text-lg transition-all shadow-lg shadow-amber-500/20 disabled:shadow-none"
          >
            {coinFlipping ? 'FLIPPING...' : `FLIP FOR ${coinBet} $SHIT`}
          </button>
          <div className="text-center text-xs text-zinc-500 mt-2">Win chance: 49% &middot; Payout: 2x</div>
        </div>
      )}

      {/* Dice Roll */}
      {activeGame === 'dice' && (
        <div className="bg-zinc-900/50 rounded-2xl p-8 border border-white/5">
          <div className="text-center mb-8">
            <div className={`text-8xl mb-4 inline-block ${diceRolling ? 'animate-bounce' : ''}`}>
              {'\u{1F3B2}'}
            </div>

            {diceResult && (
              <div className={`mb-4 ${diceResult.won ? 'text-green-400' : 'text-red-400'}`}>
                <div className="text-5xl font-black mb-2">{diceResult.roll}</div>
                <div className="text-lg font-bold">
                  {diceResult.won
                    ? `WIN! +${Math.floor(diceBet * ((98 / diceTarget) - 1))} $SHIT`
                    : `LOSE -${diceBet} $SHIT`
                  }
                </div>
              </div>
            )}
          </div>

          {/* Target Slider */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">Roll under {diceTarget} to win</span>
              <span className="text-sm text-amber-400 font-bold">{(98 / diceTarget).toFixed(2)}x payout</span>
            </div>
            <input
              type="range"
              min={5}
              max={95}
              value={diceTarget}
              onChange={(e) => setDiceTarget(Number(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>5 (high risk)</span>
              <span>Win chance: {diceTarget}%</span>
              <span>95 (low risk)</span>
            </div>
          </div>

          {/* Bet Amount */}
          <div className="mb-6">
            <label className="block text-sm text-zinc-400 mb-2">Bet Amount ($SHIT)</label>
            <input
              type="number"
              value={diceBet}
              onChange={(e) => setDiceBet(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none text-center text-xl font-bold"
            />
            <div className="flex gap-2 mt-2">
              {betPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setDiceBet(preset)}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-zinc-800 rounded-xl text-center">
              <div className="text-xs text-zinc-500">Win Chance</div>
              <div className="text-lg font-bold text-amber-400">{diceTarget}%</div>
            </div>
            <div className="p-3 bg-zinc-800 rounded-xl text-center">
              <div className="text-xs text-zinc-500">Potential Win</div>
              <div className="text-lg font-bold text-green-400">+{Math.floor(diceBet * ((98 / diceTarget) - 1))}</div>
            </div>
          </div>

          <button
            onClick={rollDice}
            disabled={diceRolling || diceBet > balance || diceBet <= 0}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 disabled:from-zinc-700 disabled:to-zinc-800 rounded-2xl font-black text-lg transition-all shadow-lg shadow-amber-500/20 disabled:shadow-none"
          >
            {diceRolling ? 'ROLLING...' : `ROLL FOR ${diceBet} $SHIT`}
          </button>
        </div>
      )}

      {/* Pump or Dump */}
      {activeGame === 'prediction' && (
        <div className="bg-zinc-900/50 rounded-2xl p-8 border border-white/5">
          {/* Token Selector */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {TOKENS.map((token) => (
              <button
                key={token.name}
                onClick={() => !predicting && setPrediction(prev => ({ ...prev, token: token.name }))}
                className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                  prediction.token === token.name
                    ? 'bg-amber-500 text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                <span className="mr-1">{token.icon}</span>
                {token.name}
              </button>
            ))}
          </div>

          {/* Price Display */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-2">
              {TOKENS.find(t => t.name === prediction.token)?.icon}
            </div>
            <div className="text-3xl font-black text-amber-400">
              ${prediction.currentPrice.toFixed(6)}
            </div>
            <div className="text-sm text-zinc-500">{prediction.token} / USD</div>

            {predicting && prediction.direction && !prediction.result && (
              <div className="mt-4 text-xl font-bold text-amber-400 animate-pulse">
                Waiting for result... {prediction.timeLeft}s
              </div>
            )}

            {prediction.result && (
              <div className={`mt-4 text-2xl font-black ${prediction.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                {prediction.result === 'win'
                  ? `CORRECT! +${prediction.betAmount} $SHIT`
                  : `WRONG! -${prediction.betAmount} $SHIT`
                }
              </div>
            )}
          </div>

          {/* Bet Amount */}
          <div className="mb-6">
            <label className="block text-sm text-zinc-400 mb-2">Bet Amount ($SHIT)</label>
            <input
              type="number"
              value={prediction.betAmount}
              onChange={(e) => setPrediction(prev => ({ ...prev, betAmount: Math.max(0, Number(e.target.value)) }))}
              className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none text-center text-xl font-bold"
            />
            <div className="flex gap-2 mt-2">
              {betPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setPrediction(prev => ({ ...prev, betAmount: preset }))}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Predict Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => makePrediction('pump')}
              disabled={predicting || prediction.betAmount > balance || prediction.betAmount <= 0}
              className="py-4 bg-green-500/20 hover:bg-green-500/30 disabled:bg-zinc-800 disabled:text-zinc-600 text-green-400 rounded-2xl font-black text-lg transition-all border border-green-500/30 disabled:border-zinc-700"
            >
              {'\u{1F4C8}'} PUMP
            </button>
            <button
              onClick={() => makePrediction('dump')}
              disabled={predicting || prediction.betAmount > balance || prediction.betAmount <= 0}
              className="py-4 bg-red-500/20 hover:bg-red-500/30 disabled:bg-zinc-800 disabled:text-zinc-600 text-red-400 rounded-2xl font-black text-lg transition-all border border-red-500/30 disabled:border-zinc-700"
            >
              {'\u{1F4C9}'} DUMP
            </button>
          </div>
          <div className="text-center text-xs text-zinc-500 mt-3">
            Predict if the price goes up or down in 5 seconds &middot; Win chance: ~48% &middot; Payout: 2x
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-zinc-900/30 rounded-xl border border-white/5 text-xs text-zinc-500 text-center">
        {'\u26A0\uFE0F'} Games use provably fair RNG. The house has a small edge (2-4%) to sustain the platform. Play responsibly.
      </div>
    </div>
  );
}
