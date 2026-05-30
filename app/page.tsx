"use client";

import React, { useState, useSyncExternalStore } from 'react';
import LandingPage from './landing-page';
import Dashboard from '../components/Dashboard';
import LoginModal from '../components/LoginModal';
import { useAuth } from '../hooks/useAuth';

// Onboarding completion is stored in localStorage and exposed to React via an
// external store so we can read it during render without a setState-in-effect.
const onboardingListeners = new Set<() => void>();

function subscribeOnboarding(listener: () => void) {
  onboardingListeners.add(listener);
  return () => {
    onboardingListeners.delete(listener);
  };
}

function getOnboardingSnapshot(): boolean {
  const seen = window.localStorage.getItem('shit-onboarding-complete');
  const hasUserId = window.localStorage.getItem('shit-user-id');
  // Onboarding is considered "seen" if completed before or the user already exists.
  return seen != null || hasUserId != null;
}

// During SSR assume onboarding was seen so it never flashes before hydration.
function getOnboardingServerSnapshot(): boolean {
  return true;
}

function markOnboardingComplete(userId: string) {
  window.localStorage.setItem('shit-onboarding-complete', 'true');
  window.localStorage.setItem('shit-user-id', userId);
  onboardingListeners.forEach((listener) => listener());
}

export default function ShitArmy() {
  const { user, isAuthenticated, signOut, isLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const isGeneral = false;
  const generalDaysLeft = 0;

  const hasSeenOnboarding = useSyncExternalStore(
    subscribeOnboarding,
    getOnboardingSnapshot,
    getOnboardingServerSnapshot
  );

  const completeOnboarding = () => {
    markOnboardingComplete(user?.id || 'dev-user');
  };

  // For mock/development mode
  const [devConnected, setDevConnected] = useState(false);
  const [devWallet, setDevWallet] = useState("");

  const handleDisconnect = async () => {
    if (user) {
      await signOut();
    } else {
      setDevConnected(false);
      setDevWallet("");
    }
  };

  // Use real auth or dev mock
  const isUserConnected = isAuthenticated || devConnected;
  const walletAddress = user?.wallet_address || user?.email || devWallet;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full" />
      </div>
    );
  }

  if (!isUserConnected) {
    return (
      <>
        <LandingPage
          onConnect={() => setShowLoginModal(true)}
          onGoogle={() => setShowLoginModal(true)}
          onApple={() => setShowLoginModal(true)}
        />
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        />
      </>
    );
  }

  return (
    <>
      <Dashboard 
        onDisconnect={handleDisconnect}
        walletAddress={walletAddress || ''}
        isGeneral={user?.is_general || isGeneral}
        generalDaysLeft={generalDaysLeft}
        showOnboarding={!hasSeenOnboarding}
        onCompleteOnboarding={completeOnboarding}
      />
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
}
