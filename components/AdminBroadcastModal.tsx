'use client';

import React, { useState } from 'react';

export default function AdminBroadcastModal({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<'all' | 'active' | 'inactive' | 'premium'>('all');
  const [type, setType] = useState<'info' | 'success' | 'warning' | 'urgent'>('info');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const sendBroadcast = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 1500);
  };

  const getTargetCount = (t: string) => {
    const counts = { all: 1247, active: 892, inactive: 355, premium: 156 };
    return counts[t as keyof typeof counts] || 0;
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-3xl max-w-xl w-full border border-amber-500/30 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black">📢 Broadcast</h2>
            <p className="text-zinc-400 text-sm">Send notification to all users</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-xl">✕</button>
        </div>

        {sent ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-amber-400 mb-2">Broadcast Sent!</h3>
            <p className="text-zinc-400">Message delivered to {getTargetCount(target)} users</p>
          </div>
        ) : (
          <>
            {/* Target Selection */}
            <div className="mb-4">
              <label className="block text-sm text-zinc-400 mb-2">Target Audience</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: 'All Users', count: 1247 },
                  { id: 'active', label: 'Active (24h)', count: 892 },
                  { id: 'inactive', label: 'Inactive (7d+)', count: 355 },
                  { id: 'premium', label: 'Premium', count: 156 },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTarget(t.id as any)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      target === t.id
                        ? 'bg-amber-500/20 border-amber-500/50'
                        : 'bg-zinc-800/50 border-white/10'
                    }`}
                  >
                    <div className="font-bold">{t.label}</div>
                    <div className="text-xs text-zinc-500">{t.count} users</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Type Selection */}
            <div className="mb-4">
              <label className="block text-sm text-zinc-400 mb-2">Message Type</label>
              <div className="flex gap-2">
                {[
                  { id: 'info', label: 'ℹ️ Info', color: 'blue' },
                  { id: 'success', label: '✅ Success', color: 'amber' },
                  { id: 'warning', label: '⚠️ Warning', color: 'amber' },
                  { id: 'urgent', label: '🚨 Urgent', color: 'red' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id as any)}
                    className={`flex-1 py-2 rounded-xl font-bold text-sm border transition-all ${
                      type === t.id
                        ? `bg-${t.color}-500/20 border-${t.color}-500/50 text-${t.color}-400`
                        : 'bg-zinc-800/50 border-white/10 text-zinc-400'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="mb-6">
              <label className="block text-sm text-zinc-400 mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message..."
                rows={4}
                className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500/50 focus:outline-none resize-none"
              />
              <div className="text-right text-xs text-zinc-500 mt-1">
                {message.length}/280
              </div>
            </div>

            {/* Preview */}
            {message && (
              <div className={`mb-6 p-4 rounded-xl border bg-zinc-800/50`}>
                <div className="text-xs text-zinc-500 mb-1">Preview</div>
                <div className="font-medium">{message}</div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={sendBroadcast}
                disabled={!message || sending}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? '📤 Sending...' : `📢 Send to ${getTargetCount(target)} users`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
