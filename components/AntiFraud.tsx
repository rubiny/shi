'use client';

import React, { useState } from 'react';

interface FraudAlert {
  id: string;
  userId: string;
  username: string;
  type: 'vpn' | 'multi_account' | 'bot' | 'rapid_completion' | 'suspicious_ip';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  timestamp: string;
  resolved: boolean;
}

interface FraudRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  action: 'flag' | 'block' | 'ban';
  triggerCount: number;
}

export default function AntiFraud() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'rules' | 'stats'>('alerts');

  const [alerts] = useState<FraudAlert[]>([
    { id: 'f1', userId: '101', username: 'ShadyUser42', type: 'vpn', severity: 'high', details: 'VPN detected (NordVPN) during offer completion. IP: 185.x.x.x → Netherlands', timestamp: '2026-05-24T11:30:00', resolved: false },
    { id: 'f2', userId: '102', username: 'BotFarm3000', type: 'bot', severity: 'critical', details: 'Automated clicking pattern detected. 47 offers started in 3 minutes.', timestamp: '2026-05-24T11:15:00', resolved: false },
    { id: 'f3', userId: '103', username: 'MultiAccounter', type: 'multi_account', severity: 'medium', details: 'Same device fingerprint as user FakeUser99. Browser: Chrome 126, Screen: 1920x1080', timestamp: '2026-05-24T10:45:00', resolved: false },
    { id: 'f4', userId: '104', username: 'SpeedRunner', type: 'rapid_completion', severity: 'low', details: 'Completed 5-minute survey in 28 seconds', timestamp: '2026-05-24T10:00:00', resolved: true },
    { id: 'f5', userId: '105', username: 'ProxyKing', type: 'suspicious_ip', severity: 'high', details: 'IP changed 12 times in 1 hour. Datacenter IPs detected.', timestamp: '2026-05-24T09:30:00', resolved: false },
  ]);

  const [rules, setRules] = useState<FraudRule[]>([
    { id: 'r1', name: 'VPN / Proxy Detection', description: 'Flag users accessing offers through VPN, proxy, or Tor', enabled: true, action: 'block', triggerCount: 1 },
    { id: 'r2', name: 'Device Fingerprinting', description: 'Detect multiple accounts from the same device/browser', enabled: true, action: 'flag', triggerCount: 2 },
    { id: 'r3', name: 'Bot Detection', description: 'Identify automated clicking patterns and scripts', enabled: true, action: 'ban', triggerCount: 1 },
    { id: 'r4', name: 'Rapid Completion', description: 'Flag offers completed suspiciously fast', enabled: true, action: 'flag', triggerCount: 3 },
    { id: 'r5', name: 'IP Rate Limiting', description: 'Limit offer starts per IP per hour', enabled: true, action: 'block', triggerCount: 10 },
    { id: 'r6', name: 'Geo Mismatch', description: 'Flag when IP country differs from KYC country', enabled: false, action: 'flag', triggerCount: 1 },
    { id: 'r7', name: 'Withdrawal Velocity', description: 'Flag rapid withdrawal attempts after offer completion', enabled: true, action: 'flag', triggerCount: 1 },
    { id: 'r8', name: 'Referral Abuse', description: 'Detect self-referral and referral farming', enabled: true, action: 'ban', triggerCount: 1 },
  ]);

  const toggleRule = (ruleId: string) => {
    setRules(rules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
  };

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'vpn': return '\u{1F310}';
      case 'multi_account': return '\u{1F465}';
      case 'bot': return '\u{1F916}';
      case 'rapid_completion': return '\u26A1';
      case 'suspicious_ip': return '\u{1F6A8}';
      default: return '\u26A0\uFE0F';
    }
  };

  const actionColor = (action: string) => {
    switch (action) {
      case 'flag': return 'bg-amber-500/20 text-amber-400';
      case 'block': return 'bg-orange-500/20 text-orange-400';
      case 'ban': return 'bg-red-500/20 text-red-400';
      default: return 'bg-zinc-500/20 text-zinc-400';
    }
  };

  const unresolvedCount = alerts.filter(a => !a.resolved).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5">
          <div className="text-2xl font-bold text-red-400">{unresolvedCount}</div>
          <div className="text-xs text-zinc-500 uppercase">Active Alerts</div>
        </div>
        <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5">
          <div className="text-2xl font-bold text-amber-400">47</div>
          <div className="text-xs text-zinc-500 uppercase">Blocked Today</div>
        </div>
        <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5">
          <div className="text-2xl font-bold text-orange-400">12</div>
          <div className="text-xs text-zinc-500 uppercase">VPN Attempts</div>
        </div>
        <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5">
          <div className="text-2xl font-bold text-purple-400">3</div>
          <div className="text-xs text-zinc-500 uppercase">Bans This Week</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        {[
          { id: 'alerts' as const, label: 'Alerts', icon: '\u{1F6A8}', count: unresolvedCount },
          { id: 'rules' as const, label: 'Rules', icon: '\u{1F6E1}\uFE0F' },
          { id: 'stats' as const, label: 'Analytics', icon: '\u{1F4CA}' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border transition-all ${
                alert.resolved
                  ? 'bg-zinc-900/30 border-white/5 opacity-60'
                  : `bg-zinc-900/50 ${severityColor(alert.severity).split(' ')[2]}`
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{typeIcon(alert.type)}</span>
                  <div>
                    <div className="font-bold flex items-center gap-2">
                      {alert.username}
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${severityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500">{alert.type.replace(/_/g, ' ')} &middot; {new Date(alert.timestamp).toLocaleString()}</div>
                  </div>
                </div>
                {!alert.resolved && (
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-xs font-medium">
                      Investigate
                    </button>
                    <button className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-medium">
                      Ban User
                    </button>
                    <button className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-xs font-medium">
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
              <div className="text-sm text-zinc-400 bg-zinc-800/50 rounded-xl p-3">
                {alert.details}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className={`p-5 rounded-2xl border transition-all ${rule.enabled ? 'bg-zinc-900/50 border-white/5' : 'bg-zinc-900/30 border-white/5 opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="font-bold">{rule.name}</div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${actionColor(rule.action)}`}>
                      {rule.action.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-zinc-400">{rule.description}</div>
                  <div className="text-xs text-zinc-500 mt-1">
                    Trigger threshold: {rule.triggerCount} {rule.triggerCount === 1 ? 'occurrence' : 'occurrences'}
                  </div>
                </div>
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${rule.enabled ? 'bg-amber-500' : 'bg-zinc-700'}`}
                >
                  <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${rule.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <h3 className="font-bold mb-4">{'\u{1F4CA}'} Fraud Detection (Last 30 Days)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-3 bg-zinc-800 rounded-xl text-center">
                <div className="text-xl font-bold text-amber-400">1,247</div>
                <div className="text-xs text-zinc-500">Total Checks</div>
              </div>
              <div className="p-3 bg-zinc-800 rounded-xl text-center">
                <div className="text-xl font-bold text-red-400">89</div>
                <div className="text-xs text-zinc-500">Blocked</div>
              </div>
              <div className="p-3 bg-zinc-800 rounded-xl text-center">
                <div className="text-xl font-bold text-orange-400">7.1%</div>
                <div className="text-xs text-zinc-500">Fraud Rate</div>
              </div>
              <div className="p-3 bg-zinc-800 rounded-xl text-center">
                <div className="text-xl font-bold text-green-400">$4,230</div>
                <div className="text-xs text-zinc-500">Saved</div>
              </div>
            </div>

            {/* Fraud Types Breakdown */}
            <h4 className="font-semibold mb-3 text-sm text-zinc-400">Fraud Types Breakdown</h4>
            <div className="space-y-3">
              {[
                { type: 'VPN / Proxy', count: 34, percent: 38, color: 'bg-amber-500' },
                { type: 'Bot Activity', count: 23, percent: 26, color: 'bg-red-500' },
                { type: 'Multi-Account', count: 18, percent: 20, color: 'bg-orange-500' },
                { type: 'Rapid Completion', count: 9, percent: 10, color: 'bg-purple-500' },
                { type: 'Other', count: 5, percent: 6, color: 'bg-zinc-500' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-300">{item.type}</span>
                    <span className="text-zinc-500">{item.count} ({item.percent}%)</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-6 border border-amber-500/20">
            <h3 className="font-bold mb-2">{'\u{1F6E1}\uFE0F'} Protection Summary</h3>
            <p className="text-sm text-zinc-400">
              Anti-fraud system has saved an estimated <span className="text-amber-400 font-bold">$4,230</span> in
              fraudulent completions this month. {rules.filter(r => r.enabled).length}/{rules.length} rules are active.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
