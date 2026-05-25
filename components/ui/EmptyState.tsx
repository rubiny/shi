'use client';

import React from 'react';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  compact?: boolean;
}

export default function EmptyState({ icon, title, description, action, compact }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-10' : 'py-20'}`}>
      <div className={`${compact ? 'text-5xl mb-4' : 'text-7xl mb-6'} opacity-30 animate-float`}>{icon}</div>
      <div className={`${compact ? 'text-base' : 'text-xl'} font-black text-zinc-400 mb-2 tracking-wide`}>{title}</div>
      <div className="text-sm text-zinc-600 max-w-xs mb-6 leading-relaxed">{description}</div>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-xl font-bold text-sm active:scale-[0.985] shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
