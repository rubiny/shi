"use client";

import React, { useState } from 'react';
import LandingPage from './landing-page';
import Dashboard from '../components/Dashboard';
import LoginModal from '../components/LoginModal';
import { useAuth } from '../hooks/useAuth';

function getInitialOnboardingState(): boolean {
  if (typeof window === 'undefined') return true;
  const seen = window.localStorage.getItem('shit-onboarding-complete');
  const hasUserId = window.localStorage.getItem('shit-user-id');
  return !!(seen || hasUserId);
}

export default function ShitArmy() {
  const { user, isAuthenticated, signOut, isLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [generalDaysLeft] = useState(0);
  
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(getInitialOnboardingState);
  
  const completeOnboarding = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('shit-onboarding-complete', 'true');
      window.localStorage.setItem('shit-user-id', user?.id || 'dev-user');
    }
    setHasSeenOnboarding(true);
  };

  const [devConnected, setDevConnected] = useState(false);
  const [devWallet, setDevWallet] = useState("");

  const handleConnect = () => {
    setShowLoginModal(true);
  };

  const handleGoogle = () => {
    setShowLoginModal(true);
  };

  const handleDisconnect = async () => {
    if (user) {
      await signOut();
    } else {
      setDevConnected(false);
      setDevWallet("");
    }
  };

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
        <LandingPage onConnect={handleConnect} onGoogle={handleGoogle} />
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
        isGeneral={user?.is_general || false}
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
