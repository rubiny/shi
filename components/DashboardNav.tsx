"use client";

import React, { useRef, useState } from 'react';
import NotificationCenter from './NotificationCenter';
import type { Notification } from '@/lib/types';

type TabId = "dashboard" | "offerwall" | "stake" | "market" | "quests" | "merch" | "army" | "referral" | "achievements" | "history" | "settings" | "admin" | "battlepass" | "leaderboard" | "spin" | "games" | "vip" | "fiat" | "antifraud";

interface DashboardNavProps {
  currentTab: TabId;
  setCurrentTab: (tab: TabId) => void;
  walletAddress: string;
  isGeneral: boolean;
  kycStatus: 'none' | 'pending' | 'verified' | 'rejected';
  setShowKYCModal: (show: boolean) => void;
  onDisconnect: () => void;
  notifications?: Notification[];
  onMarkNotificationRead?: (id: string) => void;
  onClearNotifications?: () => void;
}

export const mainTabs = [
  { id: "dashboard", label: "Home", icon: "\uD83C\uDFE0" },
  { id: "offerwall", label: "Earn", icon: "\uD83D\uDCB0" },
  { id: "market", label: "Market", icon: "\uD83D\uDED2" },
  { id: "quests", label: "Quests", icon: "\uD83D\uDCDC" },
];

export default function DashboardNav({
  currentTab,
  setCurrentTab,
  walletAddress,
  isGeneral,
  kycStatus,
  setShowKYCModal,
  onDisconnect,
  notifications = [],
  onMarkNotificationRead,
  onClearNotifications,
}: DashboardNavProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const moreTabIds = ['battlepass', 'achievements', 'leaderboard', 'referral', 'army', 'history', 'settings', 'admin', 'stake', 'merch', 'spin', 'games', 'vip', 'fiat', 'antifraud'];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setCurrentTab("dashboard")}
          >
            <span className="text-3xl">💩</span>
            <div className="font-black text-xl tracking-tighter">
              SHIT<span className="text-amber-500">.ARMY</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 text-sm">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as TabId)}
                className={`px-5 py-2.5 rounded-full flex items-center gap-2 transition-all ${
                  currentTab === tab.id
                    ? "bg-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20"
                    : "hover:bg-white/10 text-zinc-400"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}

            {/* More Menu */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`h-10 px-4 rounded-xl flex items-center gap-1.5 transition-all text-sm font-medium ${
                  showMoreMenu || moreTabIds.includes(currentTab)
                    ? "bg-amber-500 text-black"
                    : "hover:bg-white/10 text-zinc-400"
                }`}
              >
                <span className="text-base">💩</span>
                <span>More</span>
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-zinc-950 border border-white/10 rounded-2xl py-2 shadow-2xl z-50">
                  <div className="px-3 py-1.5 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                    Progress
                  </div>
                  {[
                    { id: "battlepass", label: "Battle Pass", icon: "🏆" },
                    { id: "achievements", label: "Achievements", icon: "🏅" },
                    { id: "leaderboard", label: "Leaderboard", icon: "📊" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { setCurrentTab(item.id as TabId); setShowMoreMenu(false); }}
                      className={`w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-white/5 text-sm ${currentTab === item.id ? 'text-amber-400' : ''}`}
                    >
                      <span>{item.icon}</span> <span>{item.label}</span>
                    </button>
                  ))}

                  <div className="px-3 py-1.5 text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1 border-t border-white/5 pt-2">
                    Social
                  </div>
                  {[
                    { id: "referral", label: "Referrals", icon: "👥" },
                    { id: "army", label: "My Army", icon: "\uD83E\uDE96" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { setCurrentTab(item.id as TabId); setShowMoreMenu(false); }}
                      className={`w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-white/5 text-sm ${currentTab === item.id ? 'text-amber-400' : ''}`}
                    >
                      <span>{item.icon}</span> <span>{item.label}</span>
                    </button>
                  ))}

                  <div className="px-3 py-1.5 text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1 border-t border-white/5 pt-2">
                    Play & Earn
                  </div>
                  {[
                    { id: "spin", label: "Lucky Wheel", icon: "\u{1F3B0}" },
                    { id: "games", label: "Mini Games", icon: "\u{1F3B2}" },
                    { id: "vip", label: "VIP Tiers", icon: "\u{1F48E}" },
                    { id: "fiat", label: "Buy/Sell", icon: "\u{1F4B5}" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { setCurrentTab(item.id as TabId); setShowMoreMenu(false); }}
                      className={`w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-white/5 text-sm ${currentTab === item.id ? 'text-amber-400' : ''}`}
                    >
                      <span>{item.icon}</span> <span>{item.label}</span>
                    </button>
                  ))}

                  <div className="px-3 py-1.5 text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1 border-t border-white/5 pt-2">
                    Account
                  </div>
                  {[
                    { id: "stake", label: "Staking", icon: "🔒" },
                    { id: "merch", label: "Merch", icon: "👕" },
                    { id: "history", label: "History", icon: "📋" },
                    { id: "settings", label: "Settings", icon: "⚙️" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { setCurrentTab(item.id as TabId); setShowMoreMenu(false); }}
                      className={`w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-white/5 text-sm ${currentTab === item.id ? 'text-amber-400' : ''}`}
                    >
                      <span>{item.icon}</span> <span>{item.label}</span>
                    </button>
                  ))}

                  {isGeneral && (
                    <>
                      <div className="border-t border-white/10 my-1" />
                      <button
                        onClick={() => { setCurrentTab("admin"); setShowMoreMenu(false); }}
                        className={`w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-white/5 text-sm ${currentTab === 'admin' ? 'text-amber-400' : 'text-amber-400/70'}`}
                      >
                        <span>{'\u{1F451}'}</span> <span>Admin Panel</span>
                      </button>
                      <button
                        onClick={() => { setCurrentTab("antifraud"); setShowMoreMenu(false); }}
                        className={`w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-white/5 text-sm ${currentTab === 'antifraud' ? 'text-red-400' : 'text-red-400/70'}`}
                      >
                        <span>{'\u{1F6E1}\uFE0F'}</span> <span>Anti-Fraud</span>
                      </button>
                    </>
                  )}

                  <div className="border-t border-white/10 my-1" />
                  <button
                    onClick={onDisconnect}
                    className="w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-white/5 text-sm text-red-400"
                  >
                    <span>🚪</span> <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {kycStatus !== 'verified' && (
              <button
                onClick={() => setShowKYCModal(true)}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  kycStatus === 'none'
                    ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
                    : kycStatus === 'pending'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-green-500/20 border-green-500/40 text-green-400'
                }`}
              >
                <span>{kycStatus === 'none' ? '⚠️' : kycStatus === 'pending' ? '⏳' : '✓'}</span>
                <span className="uppercase tracking-wider">
                  {kycStatus === 'none' ? 'KYC Required' : kycStatus === 'pending' ? 'KYC Pending' : 'KYC Verified'}
                </span>
              </button>
            )}
            {kycStatus === 'verified' && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-500/20 border border-green-500/40 text-green-400">
                <span>✓</span>
                <span className="uppercase tracking-wider">Verified</span>
              </div>
            )}
            <div className="hidden sm:block px-4 py-1.5 bg-zinc-900 rounded-full text-xs border border-white/10 font-mono">
              {walletAddress.length > 18 ? walletAddress.slice(0, 18) + '...' : walletAddress}
            </div>
            {onMarkNotificationRead && onClearNotifications && (
              <NotificationCenter
                notifications={notifications}
                onMarkRead={onMarkNotificationRead}
                onClearAll={onClearNotifications}
              />
            )}
            {isGeneral && (
              <>
                <div className="text-xl" title="Admin Mode">👑</div>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                  title="DEV: Clear session & reload"
                >
                  🔄
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar */}
      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setShowMoreMenu(false)} />
      )}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 z-50 py-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around text-xs">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as TabId)}
              className={`flex flex-col items-center px-2 py-1 ${
                currentTab === tab.id ? 'text-amber-400' : 'text-zinc-400'
              }`}
            >
              <span className="text-xl mb-0.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center px-2 py-1 ${
              moreTabIds.includes(currentTab) ? 'text-amber-400' : 'text-zinc-400'
            }`}
          >
            <span className="text-xl mb-0.5">⋯</span>
            More
          </button>
        </div>
      </div>
    </>
  );
}
