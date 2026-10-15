import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';
import { errorLogger } from '../lib/errors/errorLogger';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  mode?: 'full' | 'compact';
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorLogger.error('ErrorBoundary', error, {
      componentStack: errorInfo.componentStack,
      mode: this.props.mode || 'full',
      fallbackTitle: this.props.fallbackTitle,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      try {
        this.props.onReset();
      } catch {}
    }
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      const mode = this.props.mode || 'full';

      if (mode === 'compact') {
        return (
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-red-500/30 flex items-center justify-between gap-3 text-xs text-zinc-300 my-2">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="truncate">
                {this.props.fallbackTitle || this.state.error?.message || 'Component failed to render'}
              </span>
            </div>
            <button
              type="button"
              onClick={this.handleReset}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium border border-zinc-700 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer text-[11px]"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        );
      }

      return (
        <div className="min-h-[250px] p-6 rounded-2xl bg-zinc-950 border border-red-500/30 flex flex-col items-center justify-center text-center space-y-4 my-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-base font-bold text-white">
              {this.props.fallbackTitle || 'Something went wrong loading this section'}
            </h3>
            <p className="text-xs text-zinc-400">
              {this.props.fallbackMessage ||
                this.state.error?.message ||
                'An unexpected error occurred. Please click below to refresh and try again.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold border border-zinc-600 flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
