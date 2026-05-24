'use client';

import React, { useState } from 'react';

interface OnboardingStep {
  title: string;
  description: string;
  icon: string;
  action: string;
}

const STEPS: OnboardingStep[] = [
  { title: "Welcome to Shit Army", description: "The meme-powered earning platform. Complete offers, stake $SHIT, recruit friends, and climb the ranks.", icon: "💩", action: "Let's Go!" },
  { title: "Complete Offers", description: "Browse the offerwall and complete tasks to earn $SHIT. The harder the offer, the bigger the reward.", icon: "🎯", action: "Got It" },
  { title: "Stake & Earn", description: "Lock your $SHIT in staking pools to earn passive income. Longer stakes = higher APY.", icon: "🔒", action: "Nice" },
  { title: "Recruit Soldiers", description: "Share your referral code and earn commissions from everyone you invite. Build your poop platoon!", icon: "👥", action: "I'm Ready" },
  { title: "Battle Pass & Quests", description: "Complete daily/weekly quests and climb the Battle Pass for exclusive NFTs and rewards.", icon: "🏆", action: "Start Earning!" },
];

export default function OnboardingModal({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setIsVisible(false);
      onComplete();
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  const currentStep = STEPS[step];

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-3xl max-w-lg w-full border border-amber-500/30 p-8 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-purple-500/5" />
        
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8 relative z-10">
          {STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${
                i <= step ? 'w-8 bg-amber-500' : 'w-2 bg-zinc-700'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center relative z-10">
          <div className="text-7xl mb-6 animate-bounce">{currentStep.icon}</div>
          <h2 className="text-3xl font-black mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            {currentStep.title}
          </h2>
          <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
            {currentStep.description}
          </p>

          {/* Action buttons */}
          <div className="space-y-3">
            <button 
              onClick={handleNext}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-amber-500/20"
            >
              {currentStep.action}
            </button>
            
            {step < STEPS.length - 1 && (
              <button 
                onClick={handleSkip}
                className="text-zinc-500 hover:text-zinc-400 text-sm"
              >
                Skip Tutorial
              </button>
            )}
          </div>
        </div>

        {/* Step counter */}
        <div className="absolute bottom-4 right-4 text-xs text-zinc-600">
          {step + 1} / {STEPS.length}
        </div>
      </div>
    </div>
  );
}
