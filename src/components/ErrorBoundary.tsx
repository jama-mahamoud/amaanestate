import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#070707] text-white p-6 select-none font-sans">
          <div className="max-w-md w-full glass-card p-8 md:p-10 rounded-[2.5rem] border border-white/5 text-center relative overflow-hidden shadow-2xl bg-[#0a0a0abd]/80 backdrop-blur-xl">
            {/* Background Accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-red-500/5 blur-[40px] pointer-events-none" />
            
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
              <ShieldAlert size={32} />
            </div>

            <h2 className="text-2xl md:text-3xl font-display font-light text-white tracking-tight mb-3">
              Unexpected <span className="font-bold text-red-400">interruption</span>
            </h2>
            
            <p className="text-white/40 text-sm mb-8 leading-relaxed font-light">
              An error occurred while loading this view. Our security shields kept the application stable.
              <span className="block mt-2 font-mono text-[10px] text-red-300/60 font-medium truncate max-w-full">
                {this.state.error?.message || "Internal Rendering Crash"}
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={this.handleReload} 
                variant="outline"
                className="flex-1 h-12 rounded-xl border-white/10 hover:border-white/20 bg-white/5 text-xs font-bold uppercase tracking-widest text-white/80 transition-all cursor-pointer"
              >
                <RefreshCw size={14} className="mr-2 animate-spin-slow" /> Retry
              </Button>
              <Button 
                onClick={this.handleReset}
                className="flex-1 bg-luxury-gold text-black hover:bg-white h-12 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-lg shadow-luxury-gold/5 cursor-pointer"
              >
                <Home size={14} className="mr-2" /> Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
