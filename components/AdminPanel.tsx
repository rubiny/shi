'use client';

import React, { useState, useEffect } from 'react';
import AdminEventsModal from './AdminEventsModal';
import AdminBroadcastModal from './AdminBroadcastModal';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalEarned: number;
  dailyActiveUsers: number;
  pendingWithdrawals: number;
  totalWithdrawals: number;
  newUsersToday: number;
  offersCompletedToday: number;
}

interface User {
  id: string;
  username: string;
  wallet_address: string;
  total_earned: number;
  is_general: boolean;
  is_banned: boolean;
  created_at: string;
  last_active: string;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  reward: number;
  is_active: boolean;
  category: string;
  completions: number;
}

interface Withdrawal {
  id: string;
  user_id: string;
  username: string;
  amount: number;
  network: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
}

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  details: string;
  created_at: string;
}

const ADMIN_EMOJIS = ['👑', '⚡', '🎮', '🎯', '💎', '🔥'];

// Mock data for development (replace with real fetch when wiring the backend).
const MOCK_STATS: AdminStats = {
  totalUsers: 1247,
  activeUsers: 892,
  totalEarned: 2450000,
  dailyActiveUsers: 456,
  pendingWithdrawals: 23,
  totalWithdrawals: 156,
  newUsersToday: 12,
  offersCompletedToday: 89,
};

const MOCK_USERS: User[] = [
  { id: '1', username: 'CryptoKing', wallet_address: '0x1234...5678', total_earned: 15420, is_general: true, is_banned: false, created_at: '2026-01-15', last_active: '2026-05-24' },
  { id: '2', username: 'ShitSoldier', wallet_address: '0xabcd...efgh', total_earned: 8930, is_general: false, is_banned: false, created_at: '2026-02-20', last_active: '2026-05-23' },
  { id: '3', username: 'SuspiciousUser', wallet_address: '0x9999...0000', total_earned: 50, is_general: false, is_banned: true, created_at: '2026-05-20', last_active: '2026-05-21' },
];

const MOCK_OFFERS: Offer[] = [
  { id: '1', title: 'Crypto Survey 2026', description: 'Complete a 5-minute survey', reward: 1500, is_active: true, category: 'survey', completions: 234 },
  { id: '2', title: 'Install Coinbase', description: 'Download and register', reward: 3500, is_active: true, category: 'app', completions: 156 },
  { id: '3', title: 'Old Offer', description: 'Expired offer', reward: 500, is_active: false, category: 'survey', completions: 45 },
];

const MOCK_WITHDRAWALS: Withdrawal[] = [
  { id: 'w1', user_id: '1', username: 'CryptoKing', amount: 5000, network: 'Base', address: '0x1234...5678', status: 'pending', requested_at: '2026-05-24T10:00:00' },
  { id: 'w2', user_id: '2', username: 'ShitSoldier', amount: 2500, network: 'Ethereum', address: '0xabcd...efgh', status: 'pending', requested_at: '2026-05-24T09:30:00' },
];

const MOCK_AUDIT: AuditLog[] = [
  { id: 'a1', user_id: '1', action: 'offer_completed', details: 'Completed Crypto Survey 2026', created_at: '2026-05-24T10:00:00' },
  { id: 'a2', user_id: 'admin', action: 'user_banned', details: 'Banned user SuspiciousUser for fraud', created_at: '2026-05-24T09:00:00' },
];

export default function AdminPanel({ adminUserId: _adminUserId }: { adminUserId: string }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'offers' | 'withdrawals' | 'audit'>('overview');
  const [stats] = useState<AdminStats | null>(MOCK_STATS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentEmoji, setCurrentEmoji] = useState(0);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [offers, setOffers] = useState<Offer[]>(MOCK_OFFERS);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(MOCK_WITHDRAWALS);
  const [auditLogs] = useState<AuditLog[]>(MOCK_AUDIT);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  // Rotate admin emojis in the header.
  useEffect(() => {
    const emojiInterval = setInterval(() => {
      setCurrentEmoji(prev => (prev + 1) % ADMIN_EMOJIS.length);
    }, 2000);

    return () => clearInterval(emojiInterval);
  }, []);

  const handleBanUser = (userId: string, ban: boolean) => {
    setUsers(users.map(u => u.id === userId ? { ...u, is_banned: ban } : u));
  };

  const handleApproveWithdrawal = (withdrawalId: string) => {
    setWithdrawals(withdrawals.map(w => w.id === withdrawalId ? { ...w, status: 'approved' } : w));
  };

  const handleRejectWithdrawal = (withdrawalId: string) => {
    setWithdrawals(withdrawals.map(w => w.id === withdrawalId ? { ...w, status: 'rejected' } : w));
  };

  const handleToggleOffer = (offerId: string) => {
    setOffers(offers.map(o => o.id === offerId ? { ...o, is_active: !o.is_active } : o));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Animated Header */}
      <div className="mb-8 relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-amber-500/20 to-red-500/20 blur-2xl rounded-full"></div>
        <div className="relative flex items-center gap-4 mb-2">
          <span className="text-4xl animate-pulse">{ADMIN_EMOJIS[currentEmoji]}</span>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-amber-400 to-red-400 bg-clip-text text-transparent">
              Supreme Commander
            </h1>
            <p className="text-zinc-400">Control the shit army empire 🎮</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5">
          <div className="text-2xl font-bold text-emerald-400">{stats?.totalUsers.toLocaleString()}</div>
          <div className="text-xs text-zinc-500 uppercase">Total Users</div>
          <div className="text-xs text-emerald-400 mt-1">+{stats?.newUsersToday} today</div>
        </div>
        <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5">
          <div className="text-2xl font-bold text-amber-400">{stats?.dailyActiveUsers}</div>
          <div className="text-xs text-zinc-500 uppercase">Daily Active</div>
          <div className="text-xs text-zinc-500 mt-1">{((stats?.dailyActiveUsers || 0) / (stats?.totalUsers || 1) * 100).toFixed(1)}% of total</div>
        </div>
        <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5">
          <div className="text-2xl font-bold text-purple-400">{(stats?.totalEarned || 0).toLocaleString()}</div>
          <div className="text-xs text-zinc-500 uppercase">$SHIT Earned</div>
          <div className="text-xs text-zinc-500 mt-1">All time</div>
        </div>
        <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5">
          <div className="text-2xl font-bold text-red-400">{stats?.pendingWithdrawals}</div>
          <div className="text-xs text-zinc-500 uppercase">Pending Payouts</div>
          <div className="text-xs text-red-400 mt-1">Needs action</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => setShowOfferModal(true)}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-semibold transition-all"
        >
          + Add New Offer
        </button>
        <button
          onClick={() => setShowEventsModal(true)}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold transition-all"
        >
          🎉 Event Manager
        </button>
        <button
          onClick={() => setShowBroadcastModal(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-all"
        >
          📢 Broadcast
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-semibold transition-all"
        >
          ⚠️ Review {stats?.pendingWithdrawals} Withdrawals
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'users', label: 'Users', icon: '👥' },
          { id: 'offers', label: 'Offers', icon: '🎯' },
          { id: 'withdrawals', label: 'Withdrawals', icon: '💰' },
          { id: 'audit', label: 'Audit Log', icon: '📜' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'overview' | 'users' | 'offers' | 'withdrawals' | 'audit')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              activeTab === tab.id ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Activity Chart Placeholder */}
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <h3 className="font-bold mb-4">📈 Platform Activity (Last 7 Days)</h3>
            <div className="h-48 flex items-end justify-between gap-2">
              {[
                { day: 'Mon', users: 45, offers: 89 },
                { day: 'Tue', users: 52, offers: 102 },
                { day: 'Wed', users: 48, offers: 95 },
                { day: 'Thu', users: 61, offers: 123 },
                { day: 'Fri', users: 58, offers: 110 },
                { day: 'Sat', users: 72, offers: 145 },
                { day: 'Sun', users: 68, offers: 134 },
              ].map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-1 h-32">
                    <div 
                      className="flex-1 bg-amber-500/50 rounded-t"
                      style={{ height: `${(day.users / 80) * 100}%` }}
                      title={`${day.users} new users`}
                    />
                    <div 
                      className="flex-1 bg-emerald-500/50 rounded-t"
                      style={{ height: `${(day.offers / 150) * 100}%` }}
                      title={`${day.offers} offers completed`}
                    />
                  </div>
                  <span className="text-xs text-zinc-500">{day.day}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-6 mt-4 justify-center">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-amber-500/50 rounded" />
                <span className="text-zinc-400">New Users</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-emerald-500/50 rounded" />
                <span className="text-zinc-400">Offers Completed</span>
              </div>
            </div>
          </div>

          {/* Top Stats */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
              <h3 className="font-bold mb-4">🏆 Top Earners This Week</h3>
              <div className="space-y-3">
                {[
                  { name: 'CryptoKing', earned: 5200 },
                  { name: 'ShitMaster', earned: 4300 },
                  { name: 'PoopWarrior', earned: 3800 },
                  { name: 'TokenHunter', earned: 3200 },
                  { name: 'CryptoNoob', earned: 2900 },
                ].map((user, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-zinc-500 w-6">#{i + 1}</span>
                      <span>{user.name}</span>
                    </div>
                    <span className="font-bold text-emerald-400">+{user.earned} $SHIT</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
              <h3 className="font-bold mb-4">🔥 Popular Offers</h3>
              <div className="space-y-3">
                {offers.slice(0, 5).map((offer, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                    <div>
                      <div className="font-medium">{offer.title}</div>
                      <div className="text-xs text-zinc-500">{offer.completions} completions</div>
                    </div>
                    <span className="font-bold text-amber-400">{offer.reward} PTS</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center gap-4">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none"
            />
            <select className="px-4 py-2 bg-zinc-800 rounded-xl border border-white/10">
              <option>All Users</option>
              <option>General</option>
              <option>Banned</option>
              <option>New (7 days)</option>
            </select>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-zinc-400">User</th>
                  <th className="text-right p-4 text-sm font-medium text-zinc-400">Earned</th>
                  <th className="text-center p-4 text-sm font-medium text-zinc-400">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-zinc-400">Joined</th>
                  <th className="text-center p-4 text-sm font-medium text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase())).map((user) => (
                  <tr key={user.id} className="hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                          💩
                        </div>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-xs text-zinc-500 font-mono">{user.wallet_address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right font-medium">{user.total_earned.toLocaleString()} $SHIT</td>
                    <td className="p-4 text-center">
                      {user.is_general && <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs mr-1">👑 GENERAL</span>}
                      {user.is_banned && <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">🚫 BANNED</span>}
                      {!user.is_general && !user.is_banned && <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">✓ Active</span>}
                    </td>
                    <td className="p-4 text-right text-sm text-zinc-400">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => { setSelectedUser(user); setShowUserModal(true); }}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleBanUser(user.id, !user.is_banned)}
                          className={`px-3 py-1.5 rounded-lg text-xs ${
                            user.is_banned 
                              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
                              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          }`}
                        >
                          {user.is_banned ? 'Unban' : 'Ban'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Offers Tab */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div key={offer.id} className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl">
                  🎯
                </div>
                <div>
                  <div className="font-bold">{offer.title}</div>
                  <div className="text-sm text-zinc-400">{offer.description}</div>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="text-amber-400">{offer.reward} PTS</span>
                    <span className="text-zinc-500">{offer.completions} completions</span>
                    <span className={`px-2 py-0.5 rounded ${offer.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
                      {offer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleToggleOffer(offer.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    offer.is_active 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                      : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                  }`}
                >
                  {offer.is_active ? 'Disable' : 'Enable'}
                </button>
                <button 
                  onClick={() => { setEditingOffer(offer); setShowOfferModal(true); }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-semibold"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Withdrawals Tab */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-4">
          {/* Pending Section */}
          <div className="bg-red-500/10 rounded-2xl p-6 border border-red-500/30">
            <h3 className="font-bold text-red-400 mb-4">⚠️ Pending Withdrawals ({withdrawals.filter(w => w.status === 'pending').length})</h3>
            {withdrawals.filter(w => w.status === 'pending').map((withdrawal) => (
              <div key={withdrawal.id} className="bg-zinc-900/50 rounded-xl p-4 mb-4 flex items-center justify-between">
                <div>
                  <div className="font-bold">{withdrawal.username}</div>
                  <div className="text-sm text-zinc-400">{withdrawal.amount.toLocaleString()} $SHIT → {withdrawal.network}</div>
                  <div className="text-xs text-zinc-500 font-mono">{withdrawal.address}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleApproveWithdrawal(withdrawal.id)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-sm font-semibold"
                  >
                    ✓ Approve
                  </button>
                  <button 
                    onClick={() => handleRejectWithdrawal(withdrawal.id)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm font-semibold"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* History */}
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <h3 className="font-bold mb-4">📜 Withdrawal History</h3>
            <div className="space-y-2">
              {withdrawals.filter(w => w.status !== 'pending').map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                  <div>
                    <span className="font-medium">{withdrawal.username}</span>
                    <span className="text-sm text-zinc-400 ml-2">{withdrawal.amount.toLocaleString()} $SHIT</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    withdrawal.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {withdrawal.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
          <h3 className="font-bold mb-4">📜 Audit Log</h3>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 bg-zinc-800/30 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm">
                  📝
                </div>
                <div className="flex-1">
                  <div className="font-medium">{log.action}</div>
                  <div className="text-sm text-zinc-400">{log.details}</div>
                  <div className="text-xs text-zinc-500 mt-1">{new Date(log.created_at).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl max-w-lg w-full border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">User Details</h2>
              <button onClick={() => setShowUserModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl">
                  💩
                </div>
                <div>
                  <div className="font-bold text-lg">{selectedUser.username}</div>
                  <div className="text-sm text-zinc-400 font-mono">{selectedUser.wallet_address}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-zinc-800 rounded-xl">
                  <div className="text-sm text-zinc-400">Total Earned</div>
                  <div className="text-xl font-bold text-emerald-400">{selectedUser.total_earned.toLocaleString()} $SHIT</div>
                </div>
                <div className="p-3 bg-zinc-800 rounded-xl">
                  <div className="text-sm text-zinc-400">Member Since</div>
                  <div className="text-xl font-bold">{new Date(selectedUser.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => { handleBanUser(selectedUser.id, !selectedUser.is_banned); setShowUserModal(false); }}
                  className={`flex-1 py-3 rounded-xl font-semibold ${
                    selectedUser.is_banned 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {selectedUser.is_banned ? 'Unban User' : 'Ban User'}
                </button>
                <button 
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl max-w-lg w-full border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editingOffer ? 'Edit Offer' : 'Add New Offer'}</h2>
              <button onClick={() => setShowOfferModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Title</label>
                <input type="text" className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10" placeholder="Offer title" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Description</label>
                <textarea className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10 resize-none" rows={3} placeholder="Description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Reward (PTS)</label>
                  <input type="number" className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10" placeholder="1000" />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Category</label>
                  <select className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10">
                    <option>Survey</option>
                    <option>App Install</option>
                    <option>Video</option>
                    <option>Sign Up</option>
                  </select>
                </div>
              </div>
              <button 
                onClick={() => setShowOfferModal(false)}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-semibold mt-4"
              >
                {editingOffer ? 'Save Changes' : 'Create Offer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Events Modal */}
      {showEventsModal && (
        <AdminEventsModal onClose={() => setShowEventsModal(false)} />
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <AdminBroadcastModal onClose={() => setShowBroadcastModal(false)} />
      )}
    </div>
  );
}
