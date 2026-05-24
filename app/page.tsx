"use client";

import React, { useState, useEffect } from 'react';
import LandingPage from './landing-page';
import Dashboard from '../components/Dashboard';
import LoginModal from '../components/LoginModal';
import { useAuth } from '../hooks/useAuth';

export default function ShitArmy() {
  const { user, isAuthenticated, signOut, isLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isGeneral, setIsGeneral] = useState(false);
  const [generalDaysLeft, setGeneralDaysLeft] = useState(0);
  
  // Onboarding - check if already seen
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = window.localStorage.getItem('shit-onboarding-complete');
      const hasUserId = window.localStorage.getItem('shit-user-id');
      // Show onboarding only if: never seen AND no user-id (new user)
      if (!seen && !hasUserId) {
        setHasSeenOnboarding(false);
      }
    }
  }, []);
  
  const completeOnboarding = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('shit-onboarding-complete', 'true');
      window.localStorage.setItem('shit-user-id', user?.id || 'dev-user');
    }
    setHasSeenOnboarding(true);
  };

  // For mock/development mode
  const [devConnected, setDevConnected] = useState(false);
  const [devWallet, setDevWallet] = useState("");

  const handleConnect = () => {
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
        <LandingPage />
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
