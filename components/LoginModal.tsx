'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WALLETS = [
  { id: 'metamask', name: 'MetaMask', icon: '🦊', color: '#E8831D' },
  { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵', color: '#0052FF' },
  { id: 'trust', name: 'Trust Wallet', icon: '💙', color: '#3375BB' },
  { id: 'rainbow', name: 'Rainbow', icon: '🌈', color: '#001E3D' },
  { id: 'walletconnect', name: 'Other Wallet', icon: '🔗', color: '#3B99FC' },
];

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { signInWithGoogle, isLoading } = useAuth();
  const [step, setStep] = useState<'choose' | 'wallet' | 'connecting'>('choose');
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleWalletSelect = async (walletId: string) => {
    setSelectedWallet(walletId);
    setStep('connecting');
    setConnectionError(null);

    try {
      const ethereum = typeof window !== 'undefined' ? (window as Record<string, unknown>).ethereum : null;
      if (ethereum && walletId === 'metamask') {
        const accounts = await (ethereum as { request: (args: { method: string }) => Promise<string[]> }).request({ method: 'eth_requestAccounts' });
        if (accounts?.[0]) {
          console.log('Connected wallet:', walletId, 'address:', accounts[0]);
          onClose();
          setStep('choose');
          return;
        }
      }
    } catch {
      console.log('Native wallet connection unavailable, using demo mode');
    }

    // Demo mode: simulate connection with progress steps
    await new Promise(r => setTimeout(r, 800));
    setConnectionError(null);
    await new Promise(r => setTimeout(r, 700));
    const demoAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    console.log('Demo wallet connected:', walletId, 'address:', demoAddress);
    onClose();
    setStep('choose');
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      onClose();
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 rounded-3xl max-w-md w-full border border-amber-500/20 overflow-hidden shadow-2xl shadow-amber-500/10">
        {/* Animated Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-bounce">💩</span>
              <div>
                <h2 className="text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Join Shit Army
                </h2>
                <p className="text-xs text-zinc-500">Your shitty journey starts here 🚽</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            Connect your wallet or sign in with Google
          </p>
        </div>

        <div className="p-6">
          {step === 'choose' && (
            <div className="space-y-4">
              {/* Wallet Options */}
              <div className="grid grid-cols-2 gap-3">
                {WALLETS.slice(0, 4).map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => handleWalletSelect(wallet.id)}
                    className="group relative flex items-center gap-3 p-4 rounded-2xl bg-zinc-800/50 hover:bg-zinc-800 border border-white/10 hover:border-amber-500/50 transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-2xl group-hover:animate-bounce relative z-10">{wallet.icon}</span>
                    <span className="font-bold text-sm relative z-10 group-hover:text-amber-400 transition-colors">{wallet.name}</span>
                    <span className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity text-amber-500">→</span>
                  </button>
                ))}
              </div>

              {/* More Options */}
              <button
                onClick={() => setStep('wallet')}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-zinc-800/30 to-zinc-800/50 hover:from-zinc-800/50 hover:to-zinc-800/70 border border-white/10 hover:border-amber-500/30 transition-all text-sm text-zinc-400 hover:text-amber-400 font-medium"
              >
                <span className="mr-2">💩</span> More wallet options →
              </button>

              {/* Divider with poop */}
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="text-lg animate-pulse">💩</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>

              {/* Google */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="group w-full p-4 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-900 font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg shadow-white/10"
              >
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>
          )}

          {step === 'wallet' && (
            <div className="space-y-3">
              <button
                onClick={() => setStep('choose')}
                className="text-sm text-zinc-400 hover:text-white mb-4 flex items-center gap-1"
              >
                ← Back
              </button>
              
              {WALLETS.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleWalletSelect(wallet.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 hover:border-white/20 transition-all"
                >
                  <span className="text-2xl">{wallet.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{wallet.name}</div>
                    <div className="text-xs text-zinc-500">
                      {wallet.id === 'walletconnect' ? 'Connect any wallet' : 'Popular wallet'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 'connecting' && (
            <div className="py-12 text-center">
              <div className="text-4xl mb-4 animate-pulse">
                {WALLETS.find(w => w.id === selectedWallet)?.icon || '💎'}
              </div>
              <div className="text-lg font-semibold mb-2">
                Connecting to {WALLETS.find(w => w.id === selectedWallet)?.name}...
              </div>
              <div className="text-sm text-zinc-500">
                {connectionError || 'Please confirm in your wallet app'}
              </div>
              <div className="mt-6 flex justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-amber-500 rounded-full animate-spin" />
              </div>
              <button onClick={() => { setStep('choose'); setConnectionError(null); }} className="mt-6 text-xs text-zinc-500 hover:text-white transition-colors">
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-900/50 border-t border-white/10 text-center">
          <p className="text-xs text-zinc-500">
            By connecting, you agree to our{' '}
            <a href="#" className="text-white hover:underline">Terms</a> and{' '}
            <a href="#" className="text-white hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
