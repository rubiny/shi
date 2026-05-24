'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SettingsPageProps {
  userId: string;
  onKycClick: () => void;
}

const POOP_EMOJIS = ['💩', '🚽', '🧻', '🚽', '💩', '🧻'];

export default function SettingsPage({ userId, onKycClick }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'connections'>('profile');
  const [username, setUsername] = useState('ShitGeneral420');
  const [bio, setBio] = useState('💩 Crypto enthusiast | Stacking $SHIT since 2026 | To the moon 🚀🧻');
  const [discord, setDiscord] = useState('shitsoldier#1234');
  const [twitter, setTwitter] = useState('@shitarmy');
  const [telegram, setTelegram] = useState('@shituser');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hoverPoop, setHoverPoop] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    setTimeout(() => {
      setMessage({ type: 'success', text: '💩 Profile turded successfully!' });
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Glitchy Header */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-black mb-2 relative inline-block">
          <span className="relative z-10">⚙️ Settings</span>
          <span className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 blur-lg opacity-50"></span>
        </h1>
        <p className="text-zinc-400 text-lg">Customize your shitty profile</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-2xl border-2 ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/50 text-red-400'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{message.type === 'success' ? '💩' : '🚽'}</span>
            <span className="font-bold">{message.text}</span>
          </div>
        </div>
      )}

      {/* Meme Tabs with hover effects */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { id: 'profile', label: 'Profile', icon: '�', color: 'from-amber-500 to-orange-500' },
          { id: 'security', label: 'Security', icon: '🔒', color: 'from-emerald-500 to-teal-500' },
          { id: 'connections', label: 'Connect', icon: '🔗', color: 'from-blue-500 to-indigo-500' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            onMouseEnter={() => setHoverPoop(true)}
            onMouseLeave={() => setHoverPoop(false)}
            className={`group relative px-6 py-3 rounded-2xl font-bold transition-all transform hover:scale-105 active:scale-95 ${
              activeTab === tab.id 
                ? `bg-gradient-to-r ${tab.color} text-white shadow-lg shadow-${tab.color.split('-')[1]}-500/30` 
                : 'bg-zinc-800/50 text-zinc-400 hover:text-white border border-white/10 hover:border-white/30'
            }`}
          >
            <span className={`mr-2 inline-block transition-transform group-hover:rotate-12 ${activeTab === tab.id ? 'animate-bounce' : ''}`}>
              {tab.icon}
            </span>
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs">
                {POOP_EMOJIS[Math.floor(Math.random() * POOP_EMOJIS.length)]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <h3 className="font-bold mb-4">Profile Information</h3>
            
            <div className="flex items-start gap-6 mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-4xl">
                  💩
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-zinc-800 rounded-full border border-white/20 flex items-center justify-center text-sm hover:bg-zinc-700">
                  📷
                </button>
              </div>
              <div className="flex-1">
                <label className="block text-sm text-zinc-400 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-zinc-400 mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none resize-none"
                maxLength={160}
              />
              <div className="text-right text-xs text-zinc-500 mt-1">{bio.length}/160</div>
            </div>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Wallet */}
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <h3 className="font-bold mb-4">Connected Wallet</h3>
            <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">🔶</div>
                <div>
                  <div className="font-mono text-sm">0x1234...5678</div>
                  <div className="text-xs text-zinc-500">Primary wallet</div>
                </div>
              </div>
              <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm">
                Disconnect
              </button>
            </div>
          </div>

          {/* KYC */}
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold">Identity Verification (KYC)</h3>
                <p className="text-sm text-zinc-400">Required for withdrawals over $100</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-700 text-zinc-400">
                Not Started
              </span>
            </div>
            <button 
              onClick={onKycClick}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-semibold transition-all"
            >
              Start KYC Verification
            </button>
          </div>

          {/* 2FA */}
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <h3 className="font-bold mb-4">Two-Factor Authentication</h3>
            <p className="text-sm text-zinc-400 mb-4">Add an extra layer of security</p>
            <button className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold transition-all">
              Enable 2FA
            </button>
          </div>
        </div>
      )}

      {/* Connections Tab */}
      {activeTab === 'connections' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <h3 className="font-bold mb-4">Social Connections</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">💬</div>
                  <div>
                    <div className="font-medium">Discord</div>
                  </div>
                </div>
                <input
                  type="text"
                  value={discord}
                  onChange={(e) => setDiscord(e.target.value)}
                  className="px-3 py-2 bg-zinc-800 rounded-lg border border-white/10 text-sm w-48"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">🐦</div>
                  <div>
                    <div className="font-medium">Twitter</div>
                  </div>
                </div>
                <input
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="px-3 py-2 bg-zinc-800 rounded-lg border border-white/10 text-sm w-48"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center">✈️</div>
                  <div>
                    <div className="font-medium">Telegram</div>
                  </div>
                </div>
                <input
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  className="px-3 py-2 bg-zinc-800 rounded-lg border border-white/10 text-sm w-48"
                />
              </div>
            </div>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="mt-6 px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Connections'}
            </button>
          </div>

          <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-2xl p-6 border border-emerald-500/30">
            <h3 className="font-bold mb-2">Connection Rewards</h3>
            <p className="text-sm text-zinc-400">Connect all 3 socials to earn +500 $SHIT</p>
          </div>
        </div>
      )}
    </div>
  );
}
