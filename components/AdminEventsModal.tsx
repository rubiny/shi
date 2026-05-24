'use client';

import React, { useState } from 'react';

interface Event {
  id: string;
  name: string;
  type: 'double_xp' | 'bonus_rewards' | 'flash_sale' | 'special_quest';
  startDate: string;
  endDate: string;
  multiplier: number;
  description: string;
  active: boolean;
}

const EVENT_TYPES = [
  { id: 'double_xp', name: 'Double XP Weekend', icon: '⚡', color: 'blue' },
  { id: 'bonus_rewards', name: 'Bonus Rewards', icon: '💰', color: 'amber' },
  { id: 'flash_sale', name: 'Flash Sale (Market)', icon: '🛒', color: 'purple' },
  { id: 'special_quest', name: 'Special Quest', icon: '📜', color: 'amber' },
];

export default function AdminEventsModal({ onClose }: { onClose: () => void }) {
  const [events, setEvents] = useState<Event[]>([
    { id: '1', name: 'Double XP Weekend', type: 'double_xp', startDate: '2026-05-24', endDate: '2026-05-26', multiplier: 2, description: '2x XP from all offers', active: true },
    { id: '2', name: 'Summer Sale', type: 'flash_sale', startDate: '2026-06-01', endDate: '2026-06-07', multiplier: 1.5, description: '50% off all NFTs', active: false },
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    type: 'double_xp',
    multiplier: 2,
  });

  const createEvent = () => {
    if (newEvent.name && newEvent.startDate && newEvent.endDate) {
      setEvents([...events, {
        ...newEvent as Event,
        id: Date.now().toString(),
        active: true,
      }]);
      setShowCreate(false);
      setNewEvent({ type: 'double_xp', multiplier: 2 });
    }
  };

  const toggleEvent = (id: string) => {
    setEvents(events.map(e => e.id === id ? { ...e, active: !e.active } : e));
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-3xl max-w-3xl w-full border border-amber-500/30 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">🎉 Event Manager</h2>
            <p className="text-zinc-400 text-sm">Create and manage special events</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Quick Actions */}
          <div className="flex gap-3 mb-6">
            <button 
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold hover:scale-105 transition-transform"
            >
              + Create Event
            </button>
            <button className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold">
              📊 Event Stats
            </button>
          </div>

          {/* Active Events */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg mb-4">Active & Upcoming Events</h3>
            {events.map((event) => {
              const typeInfo = EVENT_TYPES.find(t => t.id === event.type);
              return (
                <div 
                  key={event.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    event.active 
                      ? 'bg-amber-500/10 border-amber-500/30' 
                      : 'bg-zinc-800/50 border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-${typeInfo?.color}-500/20 flex items-center justify-center text-2xl`}>
                        {typeInfo?.icon}
                      </div>
                      <div>
                        <div className="font-bold">{event.name}</div>
                        <div className="text-sm text-zinc-400">{event.description}</div>
                        <div className="text-xs text-zinc-500 mt-1">
                          {event.startDate} → {event.endDate} • {event.multiplier}x multiplier
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleEvent(event.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold ${
                          event.active 
                            ? 'bg-amber-500/20 text-amber-400' 
                            : 'bg-zinc-700 text-zinc-400'
                        }`}
                      >
                        {event.active ? 'Active' : 'Paused'}
                      </button>
                      <button 
                        onClick={() => deleteEvent(event.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Create Event Form */}
          {showCreate && (
            <div className="mt-6 p-4 bg-zinc-800/50 rounded-2xl border border-white/10">
              <h4 className="font-bold mb-4">Create New Event</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Event name..."
                  value={newEvent.name || ''}
                  onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                  className="w-full px-4 py-3 bg-zinc-900 rounded-xl border border-white/10"
                />
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value as any})}
                  className="w-full px-4 py-3 bg-zinc-900 rounded-xl border border-white/10"
                >
                  {EVENT_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={newEvent.startDate || ''}
                    onChange={(e) => setNewEvent({...newEvent, startDate: e.target.value})}
                    className="px-4 py-3 bg-zinc-900 rounded-xl border border-white/10"
                  />
                  <input
                    type="date"
                    value={newEvent.endDate || ''}
                    onChange={(e) => setNewEvent({...newEvent, endDate: e.target.value})}
                    className="px-4 py-3 bg-zinc-900 rounded-xl border border-white/10"
                  />
                </div>
                <input
                  type="number"
                  placeholder="Multiplier (e.g. 2)"
                  value={newEvent.multiplier || ''}
                  onChange={(e) => setNewEvent({...newEvent, multiplier: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 bg-zinc-900 rounded-xl border border-white/10"
                />
                <input
                  type="text"
                  placeholder="Description..."
                  value={newEvent.description || ''}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  className="w-full px-4 py-3 bg-zinc-900 rounded-xl border border-white/10"
                />
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-3 bg-zinc-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={createEvent}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
