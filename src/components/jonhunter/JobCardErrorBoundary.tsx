import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { errorLogger } from '../../lib/errors/errorLogger';

interface Props {
  children: ReactNode;
  jobId?: string;
  jobTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class JobCardErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorLogger.error('JobCardErrorBoundary', error, {
      jobId: this.props.jobId,
      jobTitle: this.props.jobTitle,
      componentStack: errorInfo.componentStack,
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-[#141519] border border-red-500/20 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-zinc-200 truncate">
                {this.props.jobTitle ? `Failed to render "${this.props.jobTitle}"` : 'Failed to display opportunity card'}
              </p>
              <p className="text-[11px] text-zinc-300 truncate">
                {this.state.error?.message || 'Data formatting error in this record'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={this.handleRetry}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 shrink-0 transition-colors text-xs font-medium cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default JobCardErrorBoundary;
