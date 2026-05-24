'use client';

import React, { Component, type ReactNode } from 'react';
import { sentry } from '@/lib/sentry';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    sentry.captureException(error, {
      component: this.props.fallbackTitle || 'unknown',
      componentStack: errorInfo.componentStack,
    });
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-card rounded-2xl p-8 text-center border border-red-500/20 my-4">
          <div className="text-4xl mb-4">💥</div>
          <h3 className="text-xl font-black text-red-400 mb-2">
            {this.props.fallbackTitle || 'SOMETHING BROKE'}
          </h3>
          <p className="text-zinc-400 text-sm mb-4">
            {this.state.error?.message || 'unexpected error ser'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-6 py-2 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors"
          >
            TRY AGAIN
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
