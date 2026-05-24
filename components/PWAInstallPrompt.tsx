'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt: () => Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    if (typeof window !== 'undefined') {
      const wasDismissed = localStorage.getItem('pwa-install-dismissed');
      if (wasDismissed) {
        const dismissedAt = parseInt(wasDismissed, 10);
        // Re-show after 7 days
        if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) {
          setDismissed(true);
          return;
        }
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after 30 seconds of engagement
      setTimeout(() => setShowPrompt(true), 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!deferredPrompt || dismissed || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
      >
        <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-4 shadow-2xl shadow-amber-500/10">
          <div className="flex items-start gap-3">
            <div className="text-3xl">💩</div>
            <div className="flex-1">
              <h3 className="font-black text-white text-sm">INSTALL SHIT.ARMY</h3>
              <p className="text-xs text-zinc-400 mt-1">
                add to home screen ser. faster access, push notifications, offline mode. ngmi without it.
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-zinc-500 hover:text-white text-lg leading-none"
            >
              &times;
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-sm py-2 rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all active:scale-[0.98]"
            >
              APE IN
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-zinc-400 text-sm font-bold hover:text-white transition-colors"
            >
              LATER
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
