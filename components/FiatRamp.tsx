'use client';

import React, { useState } from 'react';

interface FiatRampProps {
  balance: number;
  walletAddress: string;
  onBuy: (amount: number, method: string) => void;
  onSell: (amount: number, method: string) => void;
}

const PAYMENT_METHODS = [
  { id: 'card', name: 'Credit / Debit Card', icon: '\u{1F4B3}', fee: '3.5%', speed: 'Instant', minBuy: 10, maxBuy: 5000, providers: ['MoonPay', 'Transak'] },
  { id: 'bank', name: 'Bank Transfer', icon: '\u{1F3E6}', fee: '1.0%', speed: '1-3 days', minBuy: 50, maxBuy: 50000, providers: ['MoonPay'] },
  { id: 'apple', name: 'Apple Pay', icon: '\u{1F34E}', fee: '3.5%', speed: 'Instant', minBuy: 10, maxBuy: 2000, providers: ['Transak'] },
  { id: 'google', name: 'Google Pay', icon: '\u{1F310}', fee: '3.5%', speed: 'Instant', minBuy: 10, maxBuy: 2000, providers: ['Transak'] },
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '\u{1F1FA}\u{1F1F8}' },
  { code: 'EUR', symbol: '\u20AC', name: 'Euro', flag: '\u{1F1EA}\u{1F1FA}' },
  { code: 'GBP', symbol: '\u00A3', name: 'British Pound', flag: '\u{1F1EC}\u{1F1E7}' },
  { code: 'PLN', symbol: 'z\u0142', name: 'Polish Zloty', flag: '\u{1F1F5}\u{1F1F1}' },
];

const EXCHANGE_RATE = 0.001; // 1 $SHIT = $0.001 USD

export default function FiatRamp({ balance, walletAddress, onBuy, onSell }: FiatRampProps) {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  const method = PAYMENT_METHODS.find(m => m.id === selectedMethod) || PAYMENT_METHODS[0];
  const numAmount = parseFloat(amount) || 0;

  const shitAmount = mode === 'buy'
    ? Math.floor(numAmount / EXCHANGE_RATE)
    : numAmount;

  const fiatAmount = mode === 'sell'
    ? numAmount * EXCHANGE_RATE
    : numAmount;

  const feePercent = parseFloat(method.fee);
  const feeAmount = fiatAmount * (feePercent / 100);
  const totalFiat = mode === 'buy' ? fiatAmount + feeAmount : fiatAmount - feeAmount;

  const handleTransaction = () => {
    if (numAmount <= 0) return;
    if (mode === 'sell' && numAmount > balance) return;
    if (mode === 'buy' && numAmount < method.minBuy) return;

    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      setShowSuccess(true);

      if (mode === 'buy') {
        onBuy(shitAmount, method.name);
      } else {
        onSell(numAmount, method.name);
      }

      setTimeout(() => {
        setShowSuccess(false);
        setAmount('');
      }, 3000);
    }, 2000);
  };

  const buyPresets = [25, 50, 100, 250, 500];

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="mb-10">
        <div className="text-amber-500 text-sm font-bold tracking-[3px]">BUY & SELL</div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">Fiat Ramp</h2>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-8 p-1 bg-zinc-800/50 rounded-2xl">
        <button
          onClick={() => setMode('buy')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${
            mode === 'buy'
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-black shadow-lg'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          {'\u{1F4B5}'} Buy $SHIT
        </button>
        <button
          onClick={() => setMode('sell')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${
            mode === 'sell'
              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          {'\u{1F4B8}'} Sell $SHIT
        </button>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-green-500/20 border border-green-500/40 text-center">
          <div className="text-2xl font-black text-green-400">
            {mode === 'buy' ? `Purchased ${shitAmount.toLocaleString()} $SHIT!` : `Sold ${numAmount.toLocaleString()} $SHIT!`}
          </div>
          <div className="text-sm text-green-300/70 mt-1">Transaction processing via {method.name}</div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5 mb-6">
        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm text-zinc-400 mb-2">
            {mode === 'buy' ? 'You Pay' : 'You Sell'}
          </label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-4 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none text-2xl font-bold pr-20"
              />
              {mode === 'buy' ? (
                <button
                  onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-bold flex items-center gap-1"
                >
                  <span>{selectedCurrency.flag}</span>
                  <span>{selectedCurrency.code}</span>
                </button>
              ) : (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-zinc-700 rounded-lg text-sm font-bold flex items-center gap-1">
                  <span>{'\u{1F4A9}'}</span>
                  <span>$SHIT</span>
                </div>
              )}
            </div>
          </div>

          {/* Currency Picker */}
          {showCurrencyPicker && (
            <div className="mt-2 bg-zinc-800 rounded-xl border border-white/10 p-2">
              {CURRENCIES.map((cur) => (
                <button
                  key={cur.code}
                  onClick={() => { setCurrency(cur.code); setShowCurrencyPicker(false); }}
                  className={`w-full px-3 py-2 rounded-lg text-left flex items-center gap-3 hover:bg-zinc-700 ${
                    currency === cur.code ? 'bg-amber-500/20 text-amber-400' : ''
                  }`}
                >
                  <span>{cur.flag}</span>
                  <span className="font-bold">{cur.code}</span>
                  <span className="text-zinc-500 text-sm">{cur.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Presets */}
          {mode === 'buy' && (
            <div className="flex gap-2 mt-3">
              {buyPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset.toString())}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium"
                >
                  {selectedCurrency.symbol}{preset}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Arrow */}
        <div className="flex justify-center my-4">
          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-lg">
            {'\u2193'}
          </div>
        </div>

        {/* You Receive */}
        <div className="mb-6">
          <label className="block text-sm text-zinc-400 mb-2">You Receive</label>
          <div className="px-4 py-4 bg-zinc-800/50 rounded-xl border border-white/5 text-2xl font-bold flex items-center justify-between">
            <span className="text-amber-400">
              {mode === 'buy'
                ? `${shitAmount.toLocaleString()} $SHIT`
                : `${selectedCurrency.symbol}${totalFiat.toFixed(2)} ${currency}`
              }
            </span>
            <span className="text-sm text-zinc-500">
              1 $SHIT = ${EXCHANGE_RATE.toFixed(4)}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-6 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-400">Exchange Rate</span>
            <span>1 $SHIT = ${EXCHANGE_RATE.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Network Fee</span>
            <span>{method.fee}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Fee Amount</span>
            <span>{selectedCurrency.symbol}{feeAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Processing Time</span>
            <span>{method.speed}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-white/5 pt-2">
            <span>{mode === 'buy' ? 'Total Cost' : 'You Receive'}</span>
            <span className="text-amber-400">{selectedCurrency.symbol}{totalFiat.toFixed(2)}</span>
          </div>
        </div>

        {/* Wallet */}
        <div className="mb-6 p-3 bg-zinc-800/50 rounded-xl flex items-center justify-between">
          <div className="text-sm text-zinc-400">
            {mode === 'buy' ? 'Deposit to' : 'From wallet'}
          </div>
          <div className="text-sm font-mono text-zinc-300">{walletAddress}</div>
        </div>

        {/* Payment Methods */}
        <div className="mb-6">
          <label className="block text-sm text-zinc-400 mb-3">Payment Method</label>
          <div className="space-y-2">
            {PAYMENT_METHODS.map((pm) => (
              <button
                key={pm.id}
                onClick={() => setSelectedMethod(pm.id)}
                className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between ${
                  selectedMethod === pm.id
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-white/10 bg-zinc-800/50 hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{pm.icon}</span>
                  <div className="text-left">
                    <div className="font-medium text-sm">{pm.name}</div>
                    <div className="text-xs text-zinc-500">
                      Fee: {pm.fee} &middot; {pm.speed}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {pm.providers.map(p => (
                    <span key={p} className="text-[10px] px-2 py-0.5 bg-zinc-700 rounded text-zinc-400">{p}</span>
                  ))}
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    selectedMethod === pm.id ? 'border-amber-500 bg-amber-500' : 'border-zinc-600'
                  }`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleTransaction}
          disabled={processing || numAmount <= 0 || (mode === 'sell' && numAmount > balance)}
          className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-lg disabled:shadow-none ${
            mode === 'buy'
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 disabled:from-zinc-700 disabled:to-zinc-800 shadow-green-500/20'
              : 'bg-gradient-to-r from-red-500 to-orange-500 disabled:from-zinc-700 disabled:to-zinc-800 shadow-red-500/20'
          }`}
        >
          {processing
            ? 'Processing...'
            : mode === 'buy'
            ? `Buy ${shitAmount.toLocaleString()} $SHIT`
            : `Sell ${numAmount.toLocaleString()} $SHIT`
          }
        </button>
      </div>

      {/* Balance Info */}
      <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-500 uppercase">Your Balance</div>
            <div className="text-2xl font-black text-amber-400">{balance.toLocaleString()} $SHIT</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-500 uppercase">Value</div>
            <div className="text-2xl font-bold">${(balance * EXCHANGE_RATE).toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="p-3 bg-zinc-900/30 rounded-xl border border-white/5 text-center">
          <div className="text-xl mb-1">{'\u{1F512}'}</div>
          <div className="text-xs text-zinc-500">SSL Encrypted</div>
        </div>
        <div className="p-3 bg-zinc-900/30 rounded-xl border border-white/5 text-center">
          <div className="text-xl mb-1">{'\u{1F6E1}\uFE0F'}</div>
          <div className="text-xs text-zinc-500">KYC Verified</div>
        </div>
        <div className="p-3 bg-zinc-900/30 rounded-xl border border-white/5 text-center">
          <div className="text-xl mb-1">{'\u26A1'}</div>
          <div className="text-xs text-zinc-500">Instant Settlement</div>
        </div>
      </div>
    </div>
  );
}
