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
  url: string;
  postbackUrl: string;
  provider: string;
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

interface OfferProvider {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  apiKeySet: boolean;
  revenue: number;
  completions: number;
  conversionRate: number;
}

const ADMIN_EMOJIS = ['\u{1F451}', '\u26A1', '\u{1F3AE}', '\u{1F3AF}', '\u{1F48E}', '\u{1F525}'];

export default function AdminPanel({ adminUserId }: { adminUserId: string }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'offers' | 'withdrawals' | 'audit' | 'config'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [currentEmoji, setCurrentEmoji] = useState(0);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [withdrawFilter, setWithdrawFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [withdrawNetworkFilter, setWithdrawNetworkFilter] = useState('all');
  const [selectedWithdrawals, setSelectedWithdrawals] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [configSaved, setConfigSaved] = useState(false);
  const [userEditBalance, setUserEditBalance] = useState('');
  const [userEditNote, setUserEditNote] = useState('');

  // Config values
  const [exchangeRate, setExchangeRate] = useState(12);
  const [minConvert, setMinConvert] = useState(100);
  const [maxOffersPerHour, setMaxOffersPerHour] = useState(10);
  const [referralCommission, setReferralCommission] = useState(15);
  const [minWithdrawal, setMinWithdrawal] = useState(25);
  const [withdrawalFee, setWithdrawalFee] = useState(0.5);

  // Alerts
  const alerts = [
    ...(stats && stats.pendingWithdrawals > 10 ? [{ type: 'warning' as const, msg: `${stats.pendingWithdrawals} pending withdrawals need review` }] : []),
    ...(stats && stats.dailyActiveUsers < stats.totalUsers * 0.3 ? [{ type: 'info' as const, msg: `DAU dropped below 30% (${stats.dailyActiveUsers}/${stats.totalUsers})` }] : []),
    { type: 'warning' as const, msg: 'Fraud rate at 7.1% — above 5% threshold' },
  ];

  // Config state
  const [providers, setProviders] = useState<OfferProvider[]>([
    { id: 'offertoro', name: 'OfferToro', icon: '\u{1F3AF}', enabled: true, apiKeySet: true, revenue: 12450, completions: 892, conversionRate: 34.2 },
    { id: 'adgem', name: 'AdGem', icon: '\u{1F48E}', enabled: true, apiKeySet: true, revenue: 8930, completions: 623, conversionRate: 28.7 },
    { id: 'adscend', name: 'AdScend', icon: '\u{1F4CA}', enabled: false, apiKeySet: false, revenue: 0, completions: 0, conversionRate: 0 },
  ]);
  const [featureFlags, setFeatureFlags] = useState({
    kycRequired: false,
    withdrawal2fa: false,
    referralSystem: true,
    battlePass: true,
    staking: true,
    nftMarketplace: true,
    merchStore: true,
    leaderboard: true,
    achievements: true,
  });

  // Offer form state
  const [offerForm, setOfferForm] = useState({
    title: '',
    description: '',
    reward: '',
    category: 'survey',
    url: '',
    postbackUrl: '',
    provider: 'internal',
  });

  useEffect(() => {
    fetchAdminData();
    
    const emojiInterval = setInterval(() => {
      setCurrentEmoji(prev => (prev + 1) % ADMIN_EMOJIS.length);
    }, 2000);
    
    return () => clearInterval(emojiInterval);
  }, [adminUserId]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      const mockStats: AdminStats = {
        totalUsers: 1247,
        activeUsers: 892,
        totalEarned: 2450000,
        dailyActiveUsers: 456,
        pendingWithdrawals: 23,
        totalWithdrawals: 156,
        newUsersToday: 12,
        offersCompletedToday: 89,
      };
      
      const mockUsers: User[] = [
        { id: '1', username: 'CryptoKing', wallet_address: '0x1234...5678', total_earned: 15420, is_general: true, is_banned: false, created_at: '2026-01-15', last_active: '2026-05-24' },
        { id: '2', username: 'ShitSoldier', wallet_address: '0xabcd...efgh', total_earned: 8930, is_general: false, is_banned: false, created_at: '2026-02-20', last_active: '2026-05-23' },
        { id: '3', username: 'SuspiciousUser', wallet_address: '0x9999...0000', total_earned: 50, is_general: false, is_banned: true, created_at: '2026-05-20', last_active: '2026-05-21' },
      ];
      
      const mockOffers: Offer[] = [
        { id: '1', title: 'Crypto Survey 2026', description: 'Complete a 5-minute survey', reward: 1500, is_active: true, category: 'survey', completions: 234, url: 'https://offertoro.com/survey/123', postbackUrl: 'https://api.shit.army/v1/postback/offertoro', provider: 'offertoro' },
        { id: '2', title: 'Install Coinbase', description: 'Download and register', reward: 3500, is_active: true, category: 'app', completions: 156, url: 'https://adgem.com/offer/456', postbackUrl: 'https://api.shit.army/v1/postback/adgem', provider: 'adgem' },
        { id: '3', title: 'Old Offer', description: 'Expired offer', reward: 500, is_active: false, category: 'survey', completions: 45, url: '', postbackUrl: '', provider: 'internal' },
      ];
      
      const mockWithdrawals: Withdrawal[] = [
        { id: 'w1', user_id: '1', username: 'CryptoKing', amount: 5000, network: 'Base', address: '0x1234...5678', status: 'pending', requested_at: '2026-05-24T10:00:00' },
        { id: 'w2', user_id: '2', username: 'ShitSoldier', amount: 2500, network: 'Ethereum', address: '0xabcd...efgh', status: 'pending', requested_at: '2026-05-24T09:30:00' },
      ];
      
      const mockAudit: AuditLog[] = [
        { id: 'a1', user_id: '1', action: 'offer_completed', details: 'Completed Crypto Survey 2026', created_at: '2026-05-24T10:00:00' },
        { id: 'a2', user_id: 'admin', action: 'user_banned', details: 'Banned user SuspiciousUser for fraud', created_at: '2026-05-24T09:00:00' },
        { id: 'a3', user_id: 'admin', action: 'offer_created', details: 'Created offer: Crypto Survey 2026', created_at: '2026-05-23T14:00:00' },
        { id: 'a4', user_id: '2', action: 'withdrawal_approved', details: 'Approved 2500 $SHIT withdrawal to Base', created_at: '2026-05-23T11:00:00' },
      ];

      setStats(mockStats);
      setUsers(mockUsers);
      setOffers(mockOffers);
      setWithdrawals(mockWithdrawals);
      setAuditLogs(mockAudit);
    } catch (error) {
      console.error('Admin data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleToggleProvider = (providerId: string) => {
    setProviders(providers.map(p => p.id === providerId ? { ...p, enabled: !p.enabled } : p));
  };

  const handleToggleFeature = (key: keyof typeof featureFlags) => {
    setFeatureFlags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCreateOffer = () => {
    if (offerForm.title && offerForm.reward) {
      const newOffer: Offer = {
        id: Date.now().toString(),
        title: offerForm.title,
        description: offerForm.description,
        reward: Number(offerForm.reward),
        is_active: true,
        category: offerForm.category,
        completions: 0,
        url: offerForm.url,
        postbackUrl: offerForm.postbackUrl,
        provider: offerForm.provider,
      };
      setOffers([newOffer, ...offers]);
      setOfferForm({ title: '', description: '', reward: '', category: 'survey', url: '', postbackUrl: '', provider: 'internal' });
      setShowOfferModal(false);
    }
  };

  const openEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setOfferForm({
      title: offer.title,
      description: offer.description,
      reward: offer.reward.toString(),
      category: offer.category,
      url: offer.url,
      postbackUrl: offer.postbackUrl,
      provider: offer.provider,
    });
    setShowOfferModal(true);
  };

  const handleSaveOffer = () => {
    if (editingOffer) {
      setOffers(offers.map(o => o.id === editingOffer.id ? {
        ...o,
        title: offerForm.title,
        description: offerForm.description,
        reward: Number(offerForm.reward),
        category: offerForm.category,
        url: offerForm.url,
        postbackUrl: offerForm.postbackUrl,
        provider: offerForm.provider,
      } : o));
      setEditingOffer(null);
      setShowOfferModal(false);
      setOfferForm({ title: '', description: '', reward: '', category: 'survey', url: '', postbackUrl: '', provider: 'internal' });
    } else {
      handleCreateOffer();
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full" />
      </div>
    );
  }

  const exportCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [headers.join(','), ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkApprove = () => {
    setWithdrawals(withdrawals.map(w => selectedWithdrawals.includes(w.id) ? { ...w, status: 'approved' } : w));
    setSelectedWithdrawals([]);
  };

  const handleBulkReject = () => {
    setWithdrawals(withdrawals.map(w => selectedWithdrawals.includes(w.id) ? { ...w, status: 'rejected' } : w));
    setSelectedWithdrawals([]);
  };

  const handleBulkBan = () => {
    setUsers(users.map(u => selectedUsers.includes(u.id) ? { ...u, is_banned: true } : u));
    setSelectedUsers([]);
  };

  const handleSaveConfig = () => {
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
  };

  const handleAdjustBalance = (userId: string, amount: number) => {
    setUsers(users.map(u => u.id === userId ? { ...u, total_earned: u.total_earned + amount } : u));
    setUserEditBalance('');
  };

  const filteredWithdrawals = withdrawals.filter(w => {
    if (withdrawFilter !== 'all' && w.status !== withdrawFilter) return false;
    if (withdrawNetworkFilter !== 'all' && w.network !== withdrawNetworkFilter) return false;
    return true;
  });

  const totalProviderRevenue = providers.reduce((sum, p) => sum + p.revenue, 0);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2 mb-6">
          {alerts.map((alert, i) => (
            <div key={i} className={`rounded-xl p-4 border flex items-center gap-3 text-sm ${
              alert.type === 'warning' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              <span>{alert.type === 'warning' ? '\u26A0\uFE0F' : '\u{1F4CA}'}</span>
              {alert.msg}
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-amber-500/20 to-red-500/20 blur-2xl rounded-full"></div>
        <div className="relative flex items-center gap-4 mb-2">
          <span className="text-4xl animate-pulse">{ADMIN_EMOJIS[currentEmoji]}</span>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-amber-400 to-red-400 bg-clip-text text-transparent">
              SHIT CONTROL CENTER
            </h1>
            <p className="text-zinc-400">manage your degens, distribute loot, control the chaos {'\u{1F4A9}'}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5">
          <div className="text-2xl font-bold text-amber-400">{stats?.totalUsers.toLocaleString()}</div>
          <div className="text-xs text-zinc-500 uppercase">Total Users</div>
          <div className="text-xs text-amber-400 mt-1">+{stats?.newUsersToday} today</div>
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
          onClick={() => { setEditingOffer(null); setOfferForm({ title: '', description: '', reward: '', category: 'survey', url: '', postbackUrl: '', provider: 'internal' }); setShowOfferModal(true); }}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-semibold transition-all"
        >
          + Add New Offer
        </button>
        <button
          onClick={() => setShowEventsModal(true)}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold transition-all"
        >
          {'\u{1F389}'} Event Manager
        </button>
        <button
          onClick={() => setShowBroadcastModal(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-all"
        >
          {'\u{1F4E2}'} Broadcast
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-semibold transition-all"
        >
          {'\u26A0\uFE0F'} Review {stats?.pendingWithdrawals} Withdrawals
        </button>
        <button
          onClick={fetchAdminData}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold transition-all"
        >
          {'\u{1F504}'} Refresh Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/10 pb-4 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: '\u{1F4CA}' },
          { id: 'users', label: 'Users', icon: '\u{1F465}' },
          { id: 'offers', label: 'Offers', icon: '\u{1F3AF}' },
          { id: 'withdrawals', label: 'Withdrawals', icon: '\u{1F4B0}' },
          { id: 'audit', label: 'Audit Log', icon: '\u{1F4DC}' },
          { id: 'config', label: 'Config', icon: '\u2699\uFE0F' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
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
          {/* Offerwall Revenue */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-6 border border-amber-500/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-lg">{'\u{1F4B0}'} Offerwall Revenue</h3>
                <p className="text-sm text-zinc-400">Main monetization channel</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-amber-400">${totalProviderRevenue.toLocaleString()}</div>
                <div className="text-xs text-zinc-500">Total revenue</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {providers.filter(p => p.enabled).map((provider) => (
                <div key={provider.id} className="bg-zinc-900/60 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{provider.icon}</span>
                    <span className="font-semibold">{provider.name}</span>
                    <span className="ml-auto px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs">Active</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-amber-400">${provider.revenue.toLocaleString()}</div>
                      <div className="text-[10px] text-zinc-500 uppercase">Revenue</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{provider.completions}</div>
                      <div className="text-[10px] text-zinc-500 uppercase">Completions</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-400">{provider.conversionRate}%</div>
                      <div className="text-[10px] text-zinc-500 uppercase">CVR</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Chart */}
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <h3 className="font-bold mb-4">{'\u{1F4C8}'} Platform Activity (Last 7 Days)</h3>
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
                      className="flex-1 bg-purple-500/50 rounded-t"
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
                <div className="w-3 h-3 bg-purple-500/50 rounded" />
                <span className="text-zinc-400">Offers Completed</span>
              </div>
            </div>
          </div>

          {/* Top Stats */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
              <h3 className="font-bold mb-4">{'\u{1F3C6}'} Top Earners This Week</h3>
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
                    <span className="font-bold text-amber-400">+{user.earned} $SHIT</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
              <h3 className="font-bold mb-4">{'\u{1F525}'} Popular Offers</h3>
              <div className="space-y-3">
                {offers.slice(0, 5).map((offer, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                    <div>
                      <div className="font-medium">{offer.title}</div>
                      <div className="text-xs text-zinc-500">{offer.completions} completions &middot; via {offer.provider}</div>
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
          <div className="p-4 border-b border-white/5 flex items-center gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Search degens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none"
            />
            <select className="px-4 py-2 bg-zinc-800 rounded-xl border border-white/10">
              <option>All Degens</option>
              <option>Generals</option>
              <option>Banned</option>
              <option>New (7 days)</option>
            </select>
            {selectedUsers.length > 0 && (
              <button onClick={handleBulkBan} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm font-semibold">
                Ban {selectedUsers.length} selected
              </button>
            )}
            <button onClick={() => exportCSV(users as unknown as Record<string, unknown>[], 'users')} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-semibold">
              {'\u{1F4E5}'} Export CSV
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="text-center p-4 w-12">
                    <input type="checkbox" className="accent-amber-500" onChange={(e) => setSelectedUsers(e.target.checked ? users.map(u => u.id) : [])} checked={selectedUsers.length === users.length && users.length > 0} />
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-zinc-400">Degen</th>
                  <th className="text-right p-4 text-sm font-medium text-zinc-400">Loot</th>
                  <th className="text-center p-4 text-sm font-medium text-zinc-400">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-zinc-400">Joined</th>
                  <th className="text-center p-4 text-sm font-medium text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase())).map((user) => (
                  <tr key={user.id} className="hover:bg-white/5">
                    <td className="p-4 text-center">
                      <input type="checkbox" className="accent-amber-500" checked={selectedUsers.includes(user.id)} onChange={(e) => setSelectedUsers(e.target.checked ? [...selectedUsers, user.id] : selectedUsers.filter(id => id !== user.id))} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                          {'\u{1F4A9}'}
                        </div>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-xs text-zinc-500 font-mono">{user.wallet_address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right font-medium">{user.total_earned.toLocaleString()} $SHIT</td>
                    <td className="p-4 text-center">
                      {user.is_general && <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs mr-1">{'\u{1F451}'} GENERAL</span>}
                      {user.is_banned && <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">{'\u{1F6AB}'} BANNED</span>}
                      {!user.is_general && !user.is_banned && <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs">{'\u2713'} Active</span>}
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
                              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
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
            <div key={offer.id} className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl">
                  {'\u{1F3AF}'}
                </div>
                <div>
                  <div className="font-bold">{offer.title}</div>
                  <div className="text-sm text-zinc-400">{offer.description}</div>
                  <div className="flex items-center gap-4 mt-2 text-xs flex-wrap">
                    <span className="text-amber-400">{offer.reward} PTS</span>
                    <span className="text-zinc-500">{offer.completions} completions</span>
                    <span className="text-zinc-500">via {offer.provider}</span>
                    <span className={`px-2 py-0.5 rounded ${offer.is_active ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-700 text-zinc-400'}`}>
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
                      : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                  }`}
                >
                  {offer.is_active ? 'Disable' : 'Enable'}
                </button>
                <button 
                  onClick={() => openEditOffer(offer)}
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
          <div className="flex flex-wrap gap-3 items-center">
            <select value={withdrawFilter} onChange={(e) => setWithdrawFilter(e.target.value as typeof withdrawFilter)} className="px-4 py-2 bg-zinc-800 rounded-xl border border-white/10">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select value={withdrawNetworkFilter} onChange={(e) => setWithdrawNetworkFilter(e.target.value)} className="px-4 py-2 bg-zinc-800 rounded-xl border border-white/10">
              <option value="all">All Networks</option>
              <option value="Base">Base</option>
              <option value="Ethereum">Ethereum</option>
              <option value="Polygon">Polygon</option>
            </select>
            {selectedWithdrawals.length > 0 && (
              <>
                <button onClick={handleBulkApprove} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black rounded-xl text-sm font-semibold">
                  {'\u2713'} Approve {selectedWithdrawals.length}
                </button>
                <button onClick={handleBulkReject} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm font-semibold">
                  {'\u2717'} Reject {selectedWithdrawals.length}
                </button>
              </>
            )}
            <button onClick={() => exportCSV(withdrawals as unknown as Record<string, unknown>[], 'withdrawals')} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-semibold ml-auto">
              {'\u{1F4E5}'} Export CSV
            </button>
          </div>

          <div className="space-y-3">
            {filteredWithdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="bg-zinc-900/50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/5">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="accent-amber-500" checked={selectedWithdrawals.includes(withdrawal.id)} onChange={(e) => setSelectedWithdrawals(e.target.checked ? [...selectedWithdrawals, withdrawal.id] : selectedWithdrawals.filter(id => id !== withdrawal.id))} />
                  <div>
                    <div className="font-bold">{withdrawal.username}</div>
                    <div className="text-sm text-zinc-400">{withdrawal.amount.toLocaleString()} $SHIT {'\u2192'} {withdrawal.network}</div>
                    <div className="text-xs text-zinc-500 font-mono">{withdrawal.address}</div>
                    <div className="text-xs text-zinc-600 mt-1">{new Date(withdrawal.requested_at).toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {withdrawal.status === 'pending' ? (
                    <>
                      <button onClick={() => handleApproveWithdrawal(withdrawal.id)} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-sm font-semibold">{'\u2713'} Approve</button>
                      <button onClick={() => handleRejectWithdrawal(withdrawal.id)} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm font-semibold">{'\u2717'} Reject</button>
                    </>
                  ) : (
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${withdrawal.status === 'approved' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                      {withdrawal.status === 'approved' ? '\u2713 Approved' : '\u2717 Rejected'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">{'\u{1F4DC}'} Audit Log</h3>
            <button onClick={() => exportCSV(auditLogs as unknown as Record<string, unknown>[], 'audit-log')} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-semibold">
              {'\u{1F4E5}'} Export CSV
            </button>
          </div>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 bg-zinc-800/30 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm">
                  {'\u{1F4DD}'}
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

      {/* Config Tab */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          {/* Offerwall Providers */}
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold">{'\u{1F3AF}'} Offerwall Providers</h3>
                <p className="text-sm text-zinc-400">Configure external offer networks</p>
              </div>
            </div>
            <div className="space-y-4">
              {providers.map((provider) => (
                <div key={provider.id} className={`p-5 rounded-xl border transition-all ${provider.enabled ? 'bg-amber-500/5 border-amber-500/20' : 'bg-zinc-800/50 border-white/5'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{provider.icon}</span>
                      <div>
                        <div className="font-bold">{provider.name}</div>
                        <div className="text-xs text-zinc-500">
                          {provider.apiKeySet ? 'API key configured' : 'API key not set'}
                          {provider.apiKeySet && <span className="text-amber-400 ml-2">{'\u2713'}</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleProvider(provider.id)}
                      className={`relative w-12 h-7 rounded-full transition-colors ${provider.enabled ? 'bg-amber-500' : 'bg-zinc-700'}`}
                    >
                      <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${provider.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  {provider.enabled && (
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                      <div className="text-center">
                        <div className="text-lg font-bold text-amber-400">${provider.revenue.toLocaleString()}</div>
                        <div className="text-[10px] text-zinc-500 uppercase">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{provider.completions}</div>
                        <div className="text-[10px] text-zinc-500 uppercase">Completions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">{provider.conversionRate}%</div>
                        <div className="text-[10px] text-zinc-500 uppercase">Conversion</div>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1">API Key</label>
                      <input
                        type="password"
                        value={provider.apiKeySet ? '••••••••••••••••' : ''}
                        readOnly
                        className="w-full px-3 py-2 bg-zinc-900 rounded-lg border border-white/10 text-sm"
                        placeholder="Enter API key..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1">Postback URL</label>
                      <input
                        type="text"
                        defaultValue={provider.enabled ? `https://api.shit.army/v1/postback/${provider.id}` : ''}
                        readOnly
                        className="w-full px-3 py-2 bg-zinc-900 rounded-lg border border-white/10 text-sm text-zinc-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Flags */}
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <h3 className="font-bold mb-6">{'\u{1F6A9}'} Feature Flags</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                { key: 'kycRequired' as const, label: 'KYC Required', desc: 'Require identity verification' },
                { key: 'withdrawal2fa' as const, label: 'Withdrawal 2FA', desc: 'Two-factor for withdrawals' },
                { key: 'referralSystem' as const, label: 'Referral System', desc: 'User referral rewards' },
                { key: 'battlePass' as const, label: 'Battle Pass', desc: 'Season pass with tiers' },
                { key: 'staking' as const, label: 'Staking', desc: 'Token staking for APY' },
                { key: 'nftMarketplace' as const, label: 'NFT Marketplace', desc: 'Buy/sell collectibles' },
                { key: 'merchStore' as const, label: 'Merch Store', desc: 'Physical merchandise' },
                { key: 'leaderboard' as const, label: 'Leaderboard', desc: 'Weekly rankings' },
                { key: 'achievements' as const, label: 'Achievements', desc: 'Badge collection' },
              ]).map((flag) => (
                <div key={flag.key} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                  <div>
                    <div className="font-medium text-sm">{flag.label}</div>
                    <div className="text-xs text-zinc-500">{flag.desc}</div>
                  </div>
                  <button
                    onClick={() => handleToggleFeature(flag.key)}
                    className={`relative w-12 h-7 rounded-full transition-colors ${featureFlags[flag.key] ? 'bg-amber-500' : 'bg-zinc-700'}`}
                  >
                    <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${featureFlags[flag.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Settings */}
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <h3 className="font-bold mb-6">{'\u{1F4CA}'} Offerwall Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Exchange Rate (PTS per $SHIT)</label>
                <input type="number" value={exchangeRate} onChange={(e) => setExchangeRate(Number(e.target.value))} className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Min Convert Amount (PTS)</label>
                <input type="number" value={minConvert} onChange={(e) => setMinConvert(Number(e.target.value))} className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Max Offers Per Hour</label>
                <input type="number" value={maxOffersPerHour} onChange={(e) => setMaxOffersPerHour(Number(e.target.value))} className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Referral Commission (%)</label>
                <input type="number" value={referralCommission} onChange={(e) => setReferralCommission(Number(e.target.value))} className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Min Withdrawal ($SHIT)</label>
                <input type="number" value={minWithdrawal} onChange={(e) => setMinWithdrawal(Number(e.target.value))} className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Withdrawal Fee (%)</label>
                <input type="number" value={withdrawalFee} onChange={(e) => setWithdrawalFee(Number(e.target.value))} step={0.1} className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none" />
              </div>
            </div>
            <button onClick={handleSaveConfig} className={`mt-6 px-6 py-3 rounded-xl font-semibold transition-all ${configSaved ? 'bg-green-600' : 'bg-amber-600 hover:bg-amber-500'}`}>
              {configSaved ? '\u2713 Config Saved!' : 'Save Config'}
            </button>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-500/5 rounded-2xl p-6 border border-red-500/20">
            <h3 className="font-bold text-red-400 mb-4">{'\u26A0\uFE0F'} Danger Zone</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl">
                <div>
                  <div className="font-medium">Pause All Offers</div>
                  <div className="text-xs text-zinc-500">Temporarily disable all offerwall activity</div>
                </div>
                <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm font-semibold">
                  Pause
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl">
                <div>
                  <div className="font-medium">Maintenance Mode</div>
                  <div className="text-xs text-zinc-500">Show maintenance page to all users</div>
                </div>
                <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm font-semibold">
                  Enable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl max-w-lg w-full border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">User Details</h2>
              <button onClick={() => setShowUserModal(false)} className="text-zinc-400 hover:text-white">{'\u2715'}</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl">
                  {'\u{1F4A9}'}
                </div>
                <div>
                  <div className="font-bold text-lg">{selectedUser.username}</div>
                  <div className="text-sm text-zinc-400 font-mono">{selectedUser.wallet_address}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-zinc-800 rounded-xl">
                  <div className="text-sm text-zinc-400">Total Loot</div>
                  <div className="text-xl font-bold text-amber-400">{selectedUser.total_earned.toLocaleString()} $SHIT</div>
                </div>
                <div className="p-3 bg-zinc-800 rounded-xl">
                  <div className="text-sm text-zinc-400">Recruited</div>
                  <div className="text-xl font-bold">{new Date(selectedUser.created_at).toLocaleDateString()}</div>
                </div>
                <div className="p-3 bg-zinc-800 rounded-xl">
                  <div className="text-sm text-zinc-400">Last Active</div>
                  <div className="text-xl font-bold">{new Date(selectedUser.last_active).toLocaleDateString()}</div>
                </div>
                <div className="p-3 bg-zinc-800 rounded-xl">
                  <div className="text-sm text-zinc-400">Status</div>
                  <div className="text-xl font-bold">{selectedUser.is_banned ? '\u{1F6AB} BANNED' : selectedUser.is_general ? '\u{1F451} GENERAL' : '\u2713 Active'}</div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Adjust Balance ($SHIT)</label>
                <div className="flex gap-2">
                  <input type="number" value={userEditBalance} onChange={(e) => setUserEditBalance(e.target.value)} placeholder="+500 or -200" className="flex-1 px-4 py-2 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none" />
                  <button onClick={() => { if (userEditBalance) handleAdjustBalance(selectedUser.id, Number(userEditBalance)); }} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-xl font-semibold text-sm">Apply</button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Admin Note</label>
                <textarea value={userEditNote} onChange={(e) => setUserEditNote(e.target.value)} placeholder="Internal notes..." className="w-full px-4 py-2 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none resize-none" rows={2} />
              </div>
              <div className="flex gap-3 mt-4">
                <button 
                  onClick={() => { handleBanUser(selectedUser.id, !selectedUser.is_banned); setShowUserModal(false); }}
                  className={`flex-1 py-3 rounded-xl font-semibold ${
                    selectedUser.is_banned 
                      ? 'bg-amber-500/20 text-amber-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {selectedUser.is_banned ? 'Unban Degen' : 'Ban Degen'}
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

      {/* Offer Modal (Create/Edit) */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl max-w-lg w-full border border-white/10 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editingOffer ? 'Edit Offer' : 'Add New Offer'}</h2>
              <button onClick={() => { setShowOfferModal(false); setEditingOffer(null); }} className="text-zinc-400 hover:text-white">{'\u2715'}</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Title</label>
                <input
                  type="text"
                  value={offerForm.title}
                  onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none"
                  placeholder="Offer title"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Description</label>
                <textarea
                  value={offerForm.description}
                  onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none resize-none"
                  rows={3}
                  placeholder="Description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Reward (PTS)</label>
                  <input
                    type="number"
                    value={offerForm.reward}
                    onChange={(e) => setOfferForm({ ...offerForm, reward: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none"
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Category</label>
                  <select
                    value={offerForm.category}
                    onChange={(e) => setOfferForm({ ...offerForm, category: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="survey">Survey</option>
                    <option value="app">App Install</option>
                    <option value="video">Video</option>
                    <option value="signup">Sign Up</option>
                    <option value="task">Task</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Provider</label>
                <select
                  value={offerForm.provider}
                  onChange={(e) => setOfferForm({ ...offerForm, provider: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none"
                >
                  <option value="internal">Internal</option>
                  <option value="offertoro">OfferToro</option>
                  <option value="adgem">AdGem</option>
                  <option value="adscend">AdScend</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Offer URL</label>
                <input
                  type="url"
                  value={offerForm.url}
                  onChange={(e) => setOfferForm({ ...offerForm, url: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none"
                  placeholder="https://provider.com/offer/123"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Postback URL</label>
                <input
                  type="url"
                  value={offerForm.postbackUrl}
                  onChange={(e) => setOfferForm({ ...offerForm, postbackUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none"
                  placeholder="https://api.shit.army/v1/postback/{provider}"
                />
                <div className="text-xs text-zinc-500 mt-1">
                  Macros: {'{user_id}'}, {'{amount}'}, {'{offer_id}'}, {'{transaction_id}'}
                </div>
              </div>
              <button 
                onClick={handleSaveOffer}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-semibold mt-4 transition-all"
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
