'use client';

import React, { useState } from 'react';

interface SettingsPageProps {
  userId: string;
  onKycClick: () => void;
}

export default function SettingsPage({ userId, onKycClick }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'connections' | 'notifications' | 'api'>('profile');
  const [username, setUsername] = useState('ShitGeneral420');
  const [bio, setBio] = useState('\u{1F4A9} Crypto enthusiast | Stacking $SHIT since 2026 | To the moon \u{1F680}\u{1F9FB}');
  const [discord, setDiscord] = useState('shitsoldier#1234');
  const [twitter, setTwitter] = useState('@shitarmy');
  const [telegram, setTelegram] = useState('@shituser');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Notification preferences
  const [notifOffers, setNotifOffers] = useState(true);
  const [notifStaking, setNotifStaking] = useState(true);
  const [notifReferrals, setNotifReferrals] = useState(true);
  const [notifBattlePass, setNotifBattlePass] = useState(false);
  const [notifEmail, setNotifEmail] = useState(false);
  const [notifPush, setNotifPush] = useState(true);
  const [notifSound, setNotifSound] = useState(true);

  // API keys (masked display)
  const [apiKeys] = useState([
    { id: 'sk_live_1', name: 'Production Key', created: '2026-04-15', lastUsed: '2026-05-24', status: 'active' as const },
    { id: 'sk_test_1', name: 'Test Key', created: '2026-05-01', lastUsed: '2026-05-20', status: 'active' as const },
  ]);

  const [webhookUrl, setWebhookUrl] = useState('');
  const [postbackUrl, setPostbackUrl] = useState('');

  const saveProfile = async () => {
    setSaving(true);
    setTimeout(() => {
      setMessage({ type: 'success', text: '\u{1F4A9} Profile turded successfully!' });
      setSaving(false);
    }, 1000);
  };

  const saveNotifications = async () => {
    setSaving(true);
    setTimeout(() => {
      setMessage({ type: 'success', text: '\u{1F514} Notification preferences saved!' });
      setSaving(false);
    }, 800);
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: '\u{1F464}' },
    { id: 'security' as const, label: 'Security', icon: '\u{1F512}' },
    { id: 'connections' as const, label: 'Connect', icon: '\u{1F517}' },
    { id: 'notifications' as const, label: 'Alerts', icon: '\u{1F514}' },
    { id: 'api' as const, label: 'API', icon: '\u{1F527}' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-black mb-2 relative inline-block">
          <span className="relative z-10">{'\u2699\uFE0F'} Settings</span>
          <span className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 blur-lg opacity-50"></span>
        </h1>
        <p className="text-zinc-400 text-lg">Customize your shitty profile</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-2xl border-2 ${
          message.type === 'success' 
            ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' 
            : 'bg-red-500/10 border-red-500/50 text-red-400'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{message.type === 'success' ? '\u{1F4A9}' : '\u{1F6BD}'}</span>
            <span className="font-bold">{message.text}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group relative px-5 py-3 rounded-2xl font-bold transition-all transform hover:scale-105 active:scale-95 ${
              activeTab === tab.id 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30' 
                : 'bg-zinc-800/50 text-zinc-400 hover:text-white border border-white/10 hover:border-white/30'
            }`}
          >
            <span className={`mr-2 inline-block transition-transform group-hover:rotate-12 ${activeTab === tab.id ? 'animate-bounce' : ''}`}>
              {tab.icon}
            </span>
            {tab.label}
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
                  {'\u{1F4A9}'}
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-zinc-800 rounded-full border border-white/20 flex items-center justify-center text-sm hover:bg-zinc-700">
                  {'\u{1F4F7}'}
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
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <h3 className="font-bold mb-4">Connected Wallet</h3>
            <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">{'\u{1F536}'}</div>
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
              {[
                { icon: '\u{1F4AC}', name: 'Discord', value: discord, onChange: setDiscord, color: 'bg-indigo-500/20' },
                { icon: '\u{1F426}', name: 'Twitter', value: twitter, onChange: setTwitter, color: 'bg-blue-500/20' },
                { icon: '\u2708\uFE0F', name: 'Telegram', value: telegram, onChange: setTelegram, color: 'bg-sky-500/20' },
              ].map((social) => (
                <div key={social.name} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${social.color} flex items-center justify-center`}>{social.icon}</div>
                    <div className="font-medium">{social.name}</div>
                  </div>
                  <input
                    type="text"
                    value={social.value}
                    onChange={(e) => social.onChange(e.target.value)}
                    className="px-3 py-2 bg-zinc-800 rounded-lg border border-white/10 text-sm w-48"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="mt-6 px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Connections'}
            </button>
          </div>

          <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-2xl p-6 border border-amber-500/30">
            <h3 className="font-bold mb-2">Connection Rewards</h3>
            <p className="text-sm text-zinc-400">Connect all 3 socials to earn +500 $SHIT</p>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <h3 className="font-bold mb-6">Notification Channels</h3>
            <div className="space-y-4">
              {[
                { label: 'Push Notifications', desc: 'Browser push alerts for important updates', value: notifPush, onChange: setNotifPush, icon: '\u{1F4F1}' },
                { label: 'Email Notifications', desc: 'Weekly digest and important alerts', value: notifEmail, onChange: setNotifEmail, icon: '\u{1F4E7}' },
                { label: 'Sound Effects', desc: 'Play sounds on new rewards and achievements', value: notifSound, onChange: setNotifSound, icon: '\u{1F50A}' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-zinc-500">{item.desc}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => item.onChange(!item.value)}
                    className={`relative w-12 h-7 rounded-full transition-colors ${item.value ? 'bg-amber-500' : 'bg-zinc-700'}`}
                  >
                    <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${item.value ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <h3 className="font-bold mb-6">Alert Types</h3>
            <div className="space-y-4">
              {[
                { label: 'Offer Completions', desc: 'When you earn points from offers', value: notifOffers, onChange: setNotifOffers, icon: '\u{1F4B0}' },
                { label: 'Staking Rewards', desc: 'When staking rewards are distributed', value: notifStaking, onChange: setNotifStaking, icon: '\u{1F512}' },
                { label: 'Referral Activity', desc: 'When referrals complete offers', value: notifReferrals, onChange: setNotifReferrals, icon: '\u{1F465}' },
                { label: 'Battle Pass Updates', desc: 'Season changes and tier unlocks', value: notifBattlePass, onChange: setNotifBattlePass, icon: '\u{1F3C6}' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-zinc-500">{item.desc}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => item.onChange(!item.value)}
                    className={`relative w-12 h-7 rounded-full transition-colors ${item.value ? 'bg-amber-500' : 'bg-zinc-700'}`}
                  >
                    <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${item.value ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={saveNotifications}
            disabled={saving}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-semibold transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      )}

      {/* API & Integrations Tab */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          {/* API Keys */}
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold">API Keys</h3>
                <p className="text-sm text-zinc-400">Manage your API keys for external integrations</p>
              </div>
              <button className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-xl text-sm font-semibold transition-all">
                + Generate Key
              </button>
            </div>
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">{'\u{1F511}'}</div>
                    <div>
                      <div className="font-medium">{key.name}</div>
                      <div className="text-xs text-zinc-500 font-mono">{key.id.substring(0, 8)}...{key.id.substring(key.id.length - 4)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-zinc-500">Last used: {key.lastUsed}</div>
                      <div className="text-xs text-zinc-500">Created: {key.created}</div>
                    </div>
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs">{key.status}</span>
                    <button className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs">
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Webhooks */}
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <h3 className="font-bold mb-2">Webhooks</h3>
            <p className="text-sm text-zinc-400 mb-6">Receive real-time notifications for events</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Webhook URL</label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-server.com/webhook"
                  className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none"
                />
                <div className="text-xs text-zinc-500 mt-1">We&apos;ll POST events (offer.completed, withdrawal.requested, referral.signup) here</div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Postback URL (Offerwall)</label>
                <input
                  type="url"
                  value={postbackUrl}
                  onChange={(e) => setPostbackUrl(e.target.value)}
                  placeholder="https://your-server.com/postback?uid={user_id}&amount={amount}&offer={offer_id}"
                  className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none"
                />
                <div className="text-xs text-zinc-500 mt-1">
                  Available macros: {'{user_id}'}, {'{amount}'}, {'{offer_id}'}, {'{transaction_id}'}, {'{status}'}
                </div>
              </div>
            </div>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="mt-6 px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Webhooks'}
            </button>
          </div>

          {/* Connected Services */}
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <h3 className="font-bold mb-6">Connected Services</h3>
            <div className="space-y-4">
              {[
                { name: 'Supabase', desc: 'Authentication & database', status: 'connected' as const, icon: '\u{26A1}' },
                { name: 'OfferToro', desc: 'Offerwall provider - surveys & app installs', status: 'not_configured' as const, icon: '\u{1F3AF}' },
                { name: 'AdGem', desc: 'Offerwall provider - video ads & offers', status: 'not_configured' as const, icon: '\u{1F48E}' },
                { name: 'AdScend', desc: 'Offerwall provider - content locking', status: 'not_configured' as const, icon: '\u{1F4CA}' },
                { name: 'OneSignal', desc: 'Push notification delivery', status: 'not_configured' as const, icon: '\u{1F514}' },
                { name: 'Sentry', desc: 'Error monitoring & performance', status: 'not_configured' as const, icon: '\u{1F41B}' },
                { name: 'Google Analytics', desc: 'Traffic & conversion tracking', status: 'not_configured' as const, icon: '\u{1F4C8}' },
                { name: 'SumSub', desc: 'KYC identity verification', status: 'not_configured' as const, icon: '\u{1F6E1}\uFE0F' },
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-700/50 flex items-center justify-center text-lg">{service.icon}</div>
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-xs text-zinc-500">{service.desc}</div>
                    </div>
                  </div>
                  {service.status === 'connected' ? (
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium">Connected</span>
                  ) : (
                    <button className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm transition-colors">
                      Configure
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Developer Info */}
          <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-2xl p-6 border border-amber-500/30">
            <h3 className="font-bold mb-2">{'\u{1F4D6}'} API Documentation</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Use the shit.army API to build custom integrations, automate offer tracking, and pull earnings data.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="px-3 py-1.5 bg-zinc-900/50 rounded-lg text-xs font-mono text-zinc-300">
                GET /api/v1/offers
              </div>
              <div className="px-3 py-1.5 bg-zinc-900/50 rounded-lg text-xs font-mono text-zinc-300">
                POST /api/v1/postback
              </div>
              <div className="px-3 py-1.5 bg-zinc-900/50 rounded-lg text-xs font-mono text-zinc-300">
                GET /api/v1/user/balance
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
