'use client';

import React, { useState } from 'react';

interface OnboardingStep {
  title: string;
  description: string;
  icon: string;
  action: string;
}

const STEPS: OnboardingStep[] = [
  { title: "GM DEGEN", description: "welcome to shit.army — the most unhinged earning platform on chain. grind offers, stake bags, mint degens, and climb from normie to gigachad.", icon: "💩", action: "LFG" },
  { title: "GRIND THE OFFERWALL", description: "complete offers to stack $SHIT. harder offers = bigger bags. streak bonuses for daily grinders. no shortcuts ser.", icon: "⚡", action: "APE IN" },
  { title: "LOCK YOUR BAGS", description: "stake $SHIT for 32-67% APY. longer lock = bigger returns. diamond hands only. paper hands get rekt.", icon: "💎", action: "WAGMI" },
  { title: "BUILD YOUR ARMY", description: "mint degen soldiers, send them on sewer raids, earn $SHIT passively. join a guild. recruit frens for commissions.", icon: "⚔️", action: "SEND IT" },
  { title: "READY TO STACK?", description: "daily missions, battle pass, mini games, seasonal events — everything earns $SHIT. the grind never stops.", icon: "🏆", action: "START GRINDING" },
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
