'use client';

import React from 'react';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-7xl mb-6 opacity-40">{icon}</div>
      <div className="text-xl font-bold text-zinc-400 mb-2">{title}</div>
      <div className="text-sm text-zinc-600 max-w-xs mb-6">{description}</div>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-xl font-bold text-sm active:scale-[0.985] shadow-lg shadow-amber-500/20"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
