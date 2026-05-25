'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { Notification } from '@/lib/types';

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
}

const TYPE_ICONS: Record<Notification['type'], string> = {
  success: '✅',
  warning: '⚠️',
  info: 'ℹ️',
  error: '❌',
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function NotificationCenter({ notifications, onMarkRead, onClearAll }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="font-bold text-sm">Notifications</span>
            {notifications.length > 0 && (
              <button onClick={onClearAll} className="text-xs text-zinc-500 hover:text-white transition-colors">
                Clear all
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 text-sm">
                <div className="text-3xl mb-2">🔕</div>
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 20).map(notif => (
                <div
                  key={notif.id}
                  onClick={() => onMarkRead(notif.id)}
                  className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${!notif.read ? 'bg-amber-500/5' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">{TYPE_ICONS[notif.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">{notif.title}</span>
                        {!notif.read && <span className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />}
                      </div>
                      <div className="text-xs text-zinc-500 truncate">{notif.message}</div>
                      <div className="text-[10px] text-zinc-600 mt-1">{timeAgo(notif.timestamp)}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
