"use client";

import React, { useRef, useState } from 'react';
import NotificationCenter from './NotificationCenter';
import type { Notification } from '@/lib/types';

type TabId = "dashboard" | "offerwall" | "stake" | "market" | "quests" | "merch" | "army" | "referral" | "achievements" | "history" | "settings" | "admin" | "battlepass" | "leaderboard" | "spin" | "games" | "vip" | "fiat" | "antifraud" | "memes" | "guilds" | "events" | "help";

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
  { id: "dashboard", label: "HQ", icon: "\uD83C\uDFE0" },
  { id: "offerwall", label: "Grind", icon: "\uD83D\uDCB0" },
  { id: "army", label: "Army", icon: "\uD83D\uDCA9" },
  { id: "market", label: "Bazaar", icon: "\uD83C\uDFEA" },
];

const MENU_SECTIONS = [
  {
    label: "Progress",
    items: [
      { id: "battlepass", label: "Battle Pass", icon: "\u{1F3C6}" },
      { id: "achievements", label: "Achievements", icon: "\u{1F3C5}" },
      { id: "leaderboard", label: "Leaderboard", icon: "\u{1F4CA}" },
    ],
  },
  {
    label: "Social",
    items: [
      { id: "referral", label: "Recruit & Earn", icon: "\u{1F465}" },
      { id: "quests", label: "Missions", icon: "\u{1F4DC}" },
      { id: "memes", label: "Meme Feed", icon: "\u{1F92A}" },
      { id: "guilds", label: "Guilds", icon: "\u{1F3F0}" },
      { id: "events", label: "Events", icon: "\u{1F3D6}\uFE0F" },
    ],
  },
  {
    label: "Play & Earn",
    items: [
      { id: "spin", label: "Lucky Wheel", icon: "\u{1F3B0}" },
      { id: "games", label: "Mini Games", icon: "\u{1F3B2}" },
      { id: "vip", label: "VIP Tiers", icon: "\u{1F48E}" },
      { id: "fiat", label: "Buy/Sell", icon: "\u{1F4B5}" },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "stake", label: "Staking", icon: "\u{1F512}" },
      { id: "merch", label: "Merch", icon: "\u{1F455}" },
      { id: "history", label: "History", icon: "\u{1F4CB}" },
      { id: "help", label: "Help Center", icon: "\u2753" },
      { id: "settings", label: "Settings", icon: "\u2699\uFE0F" },
    ],
  },
];

const allMoreIds = MENU_SECTIONS.flatMap(s => s.items.map(i => i.id));

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

  const moreTabIds = [...allMoreIds, 'admin', 'antifraud'];

  const handleTabClick = (id: string) => {
    setCurrentTab(id as TabId);
    setShowMoreMenu(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab("dashboard")}>
            <span className="text-3xl">{'\u{1F4A9}'}</span>
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

            {/* Desktop More Dropdown */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`h-10 px-4 rounded-xl flex items-center gap-1.5 transition-all text-sm font-medium ${
                  showMoreMenu || moreTabIds.includes(currentTab)
                    ? "bg-amber-500 text-black"
                    : "hover:bg-white/10 text-zinc-400"
                }`}
              >
                <span className="text-base">{'\u{1F4A9}'}</span>
                <span>More</span>
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-950 border border-white/10 rounded-2xl py-2 shadow-2xl z-50 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">
                  {MENU_SECTIONS.map((section) => (
                    <div key={section.label}>
                      <div className="px-3 py-1 text-[10px] text-zinc-500 uppercase font-bold tracking-widest first:mt-0 mt-1 border-t border-white/5 pt-2 first:border-0">
                        {section.label}
                      </div>
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleTabClick(item.id)}
                          className={`w-full px-3 py-1.5 text-left flex items-center gap-3 hover:bg-white/5 text-sm ${currentTab === item.id ? 'text-amber-400' : ''}`}
                        >
                          <span>{item.icon}</span> <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  ))}

                  {isGeneral && (
                    <>
                      <div className="border-t border-white/10 my-1" />
                      <button onClick={() => handleTabClick("admin")} className={`w-full px-3 py-1.5 text-left flex items-center gap-3 hover:bg-white/5 text-sm ${currentTab === 'admin' ? 'text-amber-400' : 'text-amber-400/70'}`}>
                        <span>{'\u{1F451}'}</span> <span>Admin Panel</span>
                      </button>
                      <button onClick={() => handleTabClick("antifraud")} className={`w-full px-3 py-1.5 text-left flex items-center gap-3 hover:bg-white/5 text-sm ${currentTab === 'antifraud' ? 'text-red-400' : 'text-red-400/70'}`}>
                        <span>{'\u{1F6E1}\uFE0F'}</span> <span>Anti-Fraud</span>
                      </button>
                    </>
                  )}

                  <div className="border-t border-white/10 my-1" />
                  <button onClick={onDisconnect} className="w-full px-3 py-1.5 text-left flex items-center gap-3 hover:bg-white/5 text-sm text-red-400">
                    <span>{'\u{1F6AA}'}</span> <span>Logout</span>
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
                <span>{kycStatus === 'none' ? '\u26A0\uFE0F' : kycStatus === 'pending' ? '\u23F3' : '\u2713'}</span>
                <span className="uppercase tracking-wider">
                  {kycStatus === 'none' ? 'KYC Required' : kycStatus === 'pending' ? 'KYC Pending' : 'KYC Verified'}
                </span>
              </button>
            )}
            {kycStatus === 'verified' && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-500/20 border border-green-500/40 text-green-400">
                <span>{'\u2713'}</span>
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
                <div className="text-xl" title="Admin Mode">{'\u{1F451}'}</div>
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
                  {'\u{1F504}'}
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Sheet Overlay */}
      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" onClick={() => setShowMoreMenu(false)} />
      )}

      {/* Mobile Bottom Sheet Menu */}
      {showMoreMenu && (
        <div className="md:hidden fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-50 bg-zinc-950 border-t border-white/10 rounded-t-3xl max-h-[70vh] overflow-y-auto">
          <div className="p-4">
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-4" />
            {MENU_SECTIONS.map((section) => (
              <div key={section.label} className="mb-4">
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2">{section.label}</div>
                <div className="grid grid-cols-3 gap-2">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                        currentTab === item.id
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-zinc-900 hover:bg-zinc-800 border border-white/5'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-[11px] font-medium leading-tight text-center">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {isGeneral && (
              <div className="mb-4">
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2">Admin</div>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => handleTabClick("admin")} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${currentTab === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-900 hover:bg-zinc-800 border border-white/5'}`}>
                    <span className="text-xl">{'\u{1F451}'}</span>
                    <span className="text-[11px] font-medium">Admin</span>
                  </button>
                  <button onClick={() => handleTabClick("antifraud")} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${currentTab === 'antifraud' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-zinc-900 hover:bg-zinc-800 border border-white/5'}`}>
                    <span className="text-xl">{'\u{1F6E1}\uFE0F'}</span>
                    <span className="text-[11px] font-medium">Anti-Fraud</span>
                  </button>
                </div>
              </div>
            )}

            <button onClick={onDisconnect} className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">
              {'\u{1F6AA}'} Logout
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
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
            <span className="text-xl mb-0.5">{'\u22EF'}</span>
            More
          </button>
        </div>
      </div>
    </>
  );
}
