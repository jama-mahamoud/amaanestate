import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import BrandLogo from './layout/BrandLogo';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error captured by AmaanEstate ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF8F5] text-[#141413] p-6 font-sans">
          <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-xl border border-[#E2DDD5] text-center shadow-sm">
            <div className="w-14 h-14 bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg flex items-center justify-center text-[#8C4A27] mx-auto mb-6">
              <ShieldAlert size={26} />
            </div>

            <BrandLogo variant="error" className="mb-3" />
            <h2 className="text-2xl md:text-3xl font-serif font-semibold text-[#141413] tracking-tight mb-3">
              Unexpected interruption
            </h2>

            <p className="text-[#5C5A55] text-sm mb-8 leading-relaxed">
              An error occurred while rendering this view. Please reload the page or return to the publication homepage.
              <span className="block mt-3 font-mono text-[11px] text-[#8C4A27] bg-[#FAF8F5] border border-[#E2DDD5] rounded px-3 py-2 truncate max-w-full">
                {this.state.error?.message || 'Unexpected rendering error'}
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={this.handleReload}
                variant="outline"
                className="flex-1 h-11 rounded-md border-[#E2DDD5] hover:bg-[#FAF8F5] text-xs font-semibold uppercase tracking-wider text-[#141413] cursor-pointer"
              >
                <RefreshCw size={14} className="mr-2" /> Reload
              </Button>
              <Button
                onClick={this.handleReset}
                className="flex-1 bg-[#141413] text-white hover:bg-[#1E3A5F] h-11 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Home size={14} className="mr-2" /> Homepage
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
