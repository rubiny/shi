'use client';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

interface SentryEvent {
  message?: string;
  level: 'error' | 'warning' | 'info';
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  timestamp: string;
  platform: string;
  environment: string;
}

class SentryClient {
  private dsn: string | null;
  private environment: string;
  private initialized = false;

  constructor() {
    this.dsn = SENTRY_DSN || null;
    this.environment = process.env.NODE_ENV || 'development';
  }

  init() {
    if (!this.dsn) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Sentry: No DSN configured, running in noop mode');
      }
      return;
    }
    this.initialized = true;
  }

  captureException(error: Error, context?: Record<string, unknown>) {
    if (!this.initialized) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Sentry-dev]', error, context);
      }
      return;
    }

    const event: SentryEvent = {
      message: `${error.name}: ${error.message}`,
      level: 'error',
      tags: {
        errorName: error.name,
        ...(context?.tags as Record<string, string>),
      },
      extra: {
        stack: error.stack,
        ...context,
      },
      timestamp: new Date().toISOString(),
      platform: 'javascript',
      environment: this.environment,
    };

    this.sendEvent(event);
  }

  captureMessage(message: string, level: SentryEvent['level'] = 'info', extra?: Record<string, unknown>) {
    if (!this.initialized) return;

    const event: SentryEvent = {
      message,
      level,
      extra,
      timestamp: new Date().toISOString(),
      platform: 'javascript',
      environment: this.environment,
    };

    this.sendEvent(event);
  }

  setUser(user: { id: string; wallet?: string; username?: string }) {
    if (!this.initialized) return;
    this.sendEvent({
      message: 'user.set',
      level: 'info',
      tags: { userId: user.id },
      extra: { user },
      timestamp: new Date().toISOString(),
      platform: 'javascript',
      environment: this.environment,
    });
  }

  private async sendEvent(event: SentryEvent) {
    if (!this.dsn) return;

    try {
      const url = this.dsn.replace(/\/(\d+)$/, '/api/$1/store/');
      const publicKey = new URL(this.dsn).username;

      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sentry-Auth': `Sentry sentry_version=7, sentry_client=shit-army/1.0, sentry_key=${publicKey}`,
        },
        body: JSON.stringify(event),
      }).catch(() => {
        // Silently fail — don't crash the app over error reporting
      });
    } catch {
      // noop
    }
  }
}

export const sentry = new SentryClient();

// Auto-init
if (typeof window !== 'undefined') {
  sentry.init();

  // Global error handler
  window.addEventListener('error', (event) => {
    sentry.captureException(event.error || new Error(event.message), {
      source: 'window.onerror',
      filename: event.filename,
      lineno: event.lineno,
    });
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));
    sentry.captureException(error, { source: 'unhandledrejection' });
  });
}
