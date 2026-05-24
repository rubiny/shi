'use client';

import React, { useEffect, useState } from 'react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'achievement';
  title: string;
  message: string;
  icon: string;
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Demo toasts for onboarding
  useEffect(() => {
    const demoToasts = [
      { id: `demo-1`, type: 'success', title: 'Offer Completed!', message: '+150 $SHIT earned from Survey', icon: '💰' },
      { id: `demo-2`, type: 'info', title: 'Staking Reward', message: '+12 $SHIT from your stake', icon: '🔒' },
      { id: `demo-3`, type: 'achievement', title: 'Quest Completed!', message: '"Morning Shit" - +50 XP', icon: '🏆' },
    ] as Toast[];

    // Show demo toasts with delay
    demoToasts.forEach((toast, index) => {
      setTimeout(() => {
        addToast(toast);
      }, 2000 + index * 3000);
    });
  }, []);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400';
      case 'error':
        return 'bg-red-500/20 border-red-500/50 text-red-400';
      case 'achievement':
        return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
      default:
        return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 w-80">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-2xl border backdrop-blur-sm transform transition-all duration-300 animate-in slide-in-from-right ${getToastStyles(toast.type)}`}
          style={{
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{toast.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm">{toast.title}</div>
              <div className="text-xs opacity-80">{toast.message}</div>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-current opacity-50 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
