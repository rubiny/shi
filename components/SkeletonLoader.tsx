"use client";

import React from 'react';

// Reusable skeleton components for loading states
// Use these while fetching real data from API

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-zinc-950 border border-white/5 rounded-3xl p-6 animate-pulse ${className}`}>
      <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
      <div className="h-8 bg-white/10 rounded w-2/3"></div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

export function SkeletonOffer() {
  return (
    <div className="bg-zinc-950 border border-white/5 rounded-3xl p-6 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="w-12 h-12 bg-white/10 rounded-full"></div>
        <div className="w-20 h-8 bg-white/10 rounded"></div>
      </div>
      <div className="h-6 bg-white/10 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
      <div className="h-4 bg-white/10 rounded w-2/3"></div>
    </div>
  );
}

export function SkeletonOfferwall() {
  return (
    <div className="space-y-4">
      <div className="h-20 bg-zinc-950 border border-white/5 rounded-3xl animate-pulse"></div>
      <div className="grid md:grid-cols-2 gap-4">
        <SkeletonOffer />
        <SkeletonOffer />
        <SkeletonOffer />
        <SkeletonOffer />
      </div>
    </div>
  );
}

export function SkeletonLeaderboard() {
  return (
    <div className="bg-zinc-950 border border-white/5 rounded-3xl overflow-hidden">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="px-8 py-6 border-b border-white/5 animate-pulse flex items-center gap-4">
          <div className="w-10 h-10 bg-white/10 rounded-full"></div>
          <div className="flex-1 h-6 bg-white/10 rounded"></div>
          <div className="w-20 h-6 bg-white/10 rounded"></div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero */}
      <div className="h-40 bg-zinc-950 border border-white/5 rounded-3xl"></div>
      
      {/* Stats */}
      <SkeletonStats />
      
      {/* Battle Pass */}
      <div className="h-32 bg-zinc-950 border border-white/5 rounded-3xl"></div>
      
      {/* Quests */}
      <div className="grid md:grid-cols-2 gap-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

// HOC to wrap components with loading state
export function withLoading<P extends object>(
  Component: React.ComponentType<P>,
  SkeletonComponent: React.FC
) {
  return function WithLoadingComponent({ isLoading, ...props }: P & { isLoading: boolean }) {
    if (isLoading) {
      return <SkeletonComponent />;
    }
    return <Component {...(props as P)} />;
  };
}

export default {
  Card: SkeletonCard,
  Stats: SkeletonStats,
  Offer: SkeletonOffer,
  Offerwall: SkeletonOfferwall,
  Leaderboard: SkeletonLeaderboard,
  Dashboard: SkeletonDashboard,
};
