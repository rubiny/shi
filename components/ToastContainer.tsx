'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { onToast } from '@/lib/toast';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'achievement';
  title: string;
  message: string;
  icon: string;
  exiting?: boolean;
}

const MAX_VISIBLE = 5;

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id' | 'exiting'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts(prev => {
      const next = [...prev, { ...toast, id }];
      return next.length > MAX_VISIBLE ? next.slice(-MAX_VISIBLE) : next;
    });
    const timer = setTimeout(() => removeToast(id), toast.type === 'achievement' ? 6000 : 4000);
    timersRef.current.set(id, timer);
  }, [removeToast]);

  // Listen to global toast events
  useEffect(() => {
    const unsub = onToast((payload) => addToast(payload));
    return unsub;
  }, [addToast]);

  // Demo toasts — only show once per session
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = 'shit-demo-toasts-shown';
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');

    const demos = [
      { type: 'success' as const, title: 'Offer Completed!', message: '+150 $SHIT earned from Survey', icon: '💰' },
      { type: 'info' as const, title: 'Staking Reward', message: '+12 $SHIT from your stake', icon: '🔒' },
    ];
    demos.forEach((d, i) => {
      setTimeout(() => addToast(d), 3000 + i * 4000);
    });
  }, [addToast]);

  const getStyle = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500/15 border-green-500/30 text-green-400';
      case 'error': return 'bg-red-500/15 border-red-500/30 text-red-400';
      case 'achievement': return 'bg-amber-500/15 border-amber-500/30 text-amber-400';
      default: return 'bg-blue-500/15 border-blue-500/30 text-blue-400';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-[60] space-y-2 w-80 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto p-3.5 rounded-2xl border backdrop-blur-xl shadow-lg ${getStyle(t.type)} ${t.exiting ? 'animate-toast-out' : 'animate-toast-in'}`}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">{t.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm leading-tight">{t.title}</div>
              <div className="text-xs opacity-70 mt-0.5">{t.message}</div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-current opacity-40 hover:opacity-100 transition-opacity shrink-0 text-sm"
            >
              ✕
            </button>
          </div>
          {t.type === 'achievement' && (
            <div className="mt-2 h-0.5 bg-current/20 rounded-full overflow-hidden">
              <div className="h-full bg-current rounded-full animate-toast-progress" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
