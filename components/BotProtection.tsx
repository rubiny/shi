'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface BotProtectionProps {
  onVerified: (token: string) => void;
  onError?: (error: string) => void;
  action: string;
}

declare global {
  interface Window {
    hcaptcha?: {
      render: (container: string | HTMLElement, params: Record<string, unknown>) => string;
      execute: (widgetId: string) => void;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onHCaptchaLoad?: () => void;
  }
}

const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '';

export default function BotProtection({ onVerified, onError, action }: BotProtectionProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const widgetIdRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleVerify = useCallback((token: string) => {
    onVerified(token);
  }, [onVerified]);

  const handleError = useCallback((err: string) => {
    onError?.(err || 'Captcha verification failed');
  }, [onError]);

  useEffect(() => {
    if (!HCAPTCHA_SITE_KEY) {
      // No captcha configured — auto-verify in dev
      if (process.env.NODE_ENV === 'development') {
        onVerified('dev-bypass');
      }
      return;
    }

    // Load hCaptcha script
    if (!document.getElementById('hcaptcha-script')) {
      const script = document.createElement('script');
      script.id = 'hcaptcha-script';
      script.src = 'https://hcaptcha.com/1/api.js?render=explicit&onload=onHCaptchaLoad';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    window.onHCaptchaLoad = () => {
      setIsLoaded(true);
    };

    // Check if already loaded
    if (window.hcaptcha) {
      setIsLoaded(true);
    }

    return () => {
      if (widgetIdRef.current && window.hcaptcha) {
        window.hcaptcha.remove(widgetIdRef.current);
      }
    };
  }, [onVerified]);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.hcaptcha || !HCAPTCHA_SITE_KEY) return;

    widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
      sitekey: HCAPTCHA_SITE_KEY,
      size: 'invisible',
      callback: handleVerify,
      'error-callback': handleError,
      'expired-callback': () => {
        if (widgetIdRef.current && window.hcaptcha) {
          window.hcaptcha.reset(widgetIdRef.current);
        }
      },
    });

    // Auto-execute for invisible captcha
    if (widgetIdRef.current) {
      window.hcaptcha.execute(widgetIdRef.current);
    }
  }, [isLoaded, handleVerify, handleError]);

  if (!HCAPTCHA_SITE_KEY) return null;

  return <div ref={containerRef} id={`hcaptcha-${action}`} />;
}

// HOC to protect actions
export function withBotProtection<T extends Record<string, unknown>>(
  action: string,
  onAction: (token: string, props: T) => void
) {
  return function ProtectedAction(props: T) {
    const [showCaptcha, setShowCaptcha] = useState(false);

    const handleClick = () => {
      if (!HCAPTCHA_SITE_KEY) {
        onAction('no-captcha', props);
        return;
      }
      setShowCaptcha(true);
    };

    return (
      <>
        {showCaptcha && (
          <BotProtection
            action={action}
            onVerified={(token) => {
              setShowCaptcha(false);
              onAction(token, props);
            }}
            onError={() => setShowCaptcha(false)}
          />
        )}
      </>
    );
  };
}
