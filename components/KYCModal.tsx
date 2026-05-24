"use client";

import React, { useState } from 'react';

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: KYCData) => void;
  status: 'none' | 'pending' | 'verified' | 'rejected';
}

interface KYCData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country: string;
  idType: 'passport' | 'id_card' | 'drivers_license';
  idNumber: string;
  idFront: File | null;
  idBack: File | null;
  selfie: File | null;
}

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'PL', name: 'Poland' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
];

export default function KYCModal({ isOpen, onClose, onSubmit, status }: KYCModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<KYCData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    country: '',
    idType: 'passport',
    idNumber: '',
    idFront: null,
    idBack: null,
    selfie: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  if (status === 'verified') {
    return (
      <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-6">
        <div className="bg-zinc-950 border border-amber-500/40 rounded-3xl max-w-md w-full p-10 text-center">
          <div className="text-8xl mb-6">✅</div>
          <div className="text-3xl font-bold text-amber-400 mb-3">KYC Verified!</div>
          <div className="text-zinc-400 mb-8">Your identity has been verified. You can now make unlimited withdrawals.</div>
          <button onClick={onClose} className="w-full py-4 bg-amber-600 rounded-2xl font-bold active:scale-[0.985]">
            CONTINUE
          </button>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-6">
        <div className="bg-zinc-950 border border-amber-500/40 rounded-3xl max-w-md w-full p-10 text-center">
          <div className="text-8xl mb-6">⏳</div>
          <div className="text-3xl font-bold text-amber-400 mb-3">Under Review</div>
          <div className="text-zinc-400 mb-4">Your KYC submission is being reviewed.</div>
          <div className="text-sm text-zinc-500 mb-8">Usually takes 24-48 hours. You will be notified via email.</div>
          <button onClick={onClose} className="w-full py-4 border border-white/20 rounded-2xl font-semibold">
            CLOSE
          </button>
        </div>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-6">
        <div className="bg-zinc-950 border border-red-500/40 rounded-3xl max-w-md w-full p-10 text-center">
          <div className="text-8xl mb-6">❌</div>
          <div className="text-3xl font-bold text-red-400 mb-3">Verification Failed</div>
          <div className="text-zinc-400 mb-4">Your KYC submission was rejected.</div>
          <div className="text-sm text-zinc-500 mb-8">Reason: Unclear document photo. Please resubmit with better quality.</div>
          <button onClick={() => { setStep(1); }} className="w-full py-4 bg-red-600 rounded-2xl font-bold active:scale-[0.985] mb-3">
            RETRY SUBMISSION
          </button>
          <button onClick={onClose} className="w-full py-4 border border-white/20 rounded-2xl font-semibold">
            CLOSE
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    onSubmit(formData);
    setIsSubmitting(false);
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 p-6 overflow-y-auto" onClick={onClose}>
      <div className="max-w-lg mx-auto py-8" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🛡️</div>
          <h2 className="text-3xl font-bold tracking-tight">Identity Verification</h2>
          <p className="text-zinc-400 mt-2 text-sm">Required for withdrawals above $100. Your data is encrypted and secure.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-amber-600' : 'bg-white/10'}`}>1</div>
          <div className="w-16 h-0.5 bg-white/20" />
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-amber-600' : 'bg-white/10'}`}>2</div>
          <div className="w-16 h-0.5 bg-white/20" />
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-amber-600' : 'bg-white/10'}`}>3</div>
        </div>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="bg-zinc-950 border border-white/10 rounded-3xl p-8 space-y-5">
            <div>
              <label className="text-xs text-zinc-500 mb-2 block">FIRST NAME</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-3 outline-none focus:border-amber-500"
                placeholder="John"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-2 block">LAST NAME</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-3 outline-none focus:border-amber-500"
                placeholder="Doe"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-2 block">DATE OF BIRTH</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-3 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-2 block">COUNTRY</label>
              <select
                value={formData.country}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-3 outline-none focus:border-amber-500"
              >
                <option value="">Select country</option>
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.country}
              className="w-full py-4 bg-amber-600 rounded-2xl font-bold active:scale-[0.985] disabled:bg-zinc-800 mt-4"
            >
              CONTINUE
            </button>
          </div>
        )}

        {/* Step 2: ID Document */}
        {step === 2 && (
          <div className="bg-zinc-950 border border-white/10 rounded-3xl p-8 space-y-5">
            <div>
              <label className="text-xs text-zinc-500 mb-2 block">ID TYPE</label>
              <div className="grid grid-cols-3 gap-3">
                {(['passport', 'id_card', 'drivers_license'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setFormData({ ...formData, idType: type })}
                    className={`py-3 rounded-xl text-sm font-medium border transition-all ${formData.idType === type ? 'border-amber-500 bg-amber-500/10' : 'border-white/10'}`}
                  >
                    {type === 'id_card' ? 'ID Card' : type === 'drivers_license' ? 'License' : 'Passport'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-2 block">ID NUMBER</label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={e => setFormData({ ...formData, idNumber: e.target.value })}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-3 outline-none focus:border-amber-500"
                placeholder="AB123456"
              />
            </div>

            {/* File uploads simulation */}
            <div>
              <label className="text-xs text-zinc-500 mb-2 block">ID FRONT SIDE</label>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-amber-500/50 transition-all cursor-pointer">
                <div className="text-4xl mb-2">📄</div>
                <div className="text-sm text-zinc-400">Drop file here or click to upload</div>
                <div className="text-xs text-zinc-600 mt-1">JPG, PNG, PDF up to 5MB</div>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-500 mb-2 block">ID BACK SIDE</label>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-amber-500/50 transition-all cursor-pointer">
                <div className="text-4xl mb-2">📄</div>
                <div className="text-sm text-zinc-400">Drop file here or click to upload</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-4 border border-white/20 rounded-2xl font-semibold">
                BACK
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.idNumber}
                className="flex-1 py-4 bg-amber-600 rounded-2xl font-bold active:scale-[0.985] disabled:bg-zinc-800"
              >
                CONTINUE
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Selfie */}
        {step === 3 && (
          <div className="bg-zinc-950 border border-white/10 rounded-3xl p-8 space-y-5">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🤳</div>
              <div className="font-semibold mb-2">Selfie Verification</div>
              <div className="text-sm text-zinc-400">Take a photo holding your ID next to your face</div>
            </div>

            <div className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-amber-500/50 transition-all cursor-pointer">
              <div className="text-6xl mb-4">📷</div>
              <div className="text-sm text-zinc-400 mb-2">Click to open camera</div>
              <div className="text-xs text-zinc-600">Make sure your face and ID are clearly visible</div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div className="text-amber-400">
                  <div className="font-semibold mb-1">Requirements:</div>
                  <ul className="text-xs space-y-1 text-zinc-400">
                    <li>• Face clearly visible, no sunglasses</li>
                    <li>• ID text readable, no glare</li>
                    <li>• Plain background preferred</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(2)} className="flex-1 py-4 border border-white/20 rounded-2xl font-semibold">
                BACK
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-4 bg-amber-600 rounded-2xl font-bold active:scale-[0.985] disabled:bg-zinc-800"
              >
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT KYC'}
              </button>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
            <span>🔒</span>
            <span>256-bit SSL Encryption</span>
            <span className="mx-2">•</span>
            <span>GDPR Compliant</span>
            <span className="mx-2">•</span>
            <span>SOC 2 Certified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
