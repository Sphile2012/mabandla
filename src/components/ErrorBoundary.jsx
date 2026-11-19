import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
    
    // Store error info for display
    this.setState({
      error,
      errorInfo
    });

    // You can also log to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#080d1a] to-[#1a1a2e] p-8 font-sans text-slate-200">
          <div className="w-full max-w-[500px] rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-[10px]">
            <div className="mb-4 text-6xl">⚠️</div>
            <h1 className="mb-4 bg-gradient-to-br from-violet-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent">
              Something went wrong
            </h1>
            <p className="mb-6 leading-relaxed text-slate-400">
              We're sorry, but the application encountered an unexpected error. 
              Please try refreshing the page or come back later.
            </p>
            
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 rounded-lg bg-black/30 p-4 text-left text-sm">
                <summary className="mb-2 cursor-pointer font-semibold text-red-400">
                  Error Details (Development)
                </summary>
                <pre className="m-0 whitespace-pre-wrap break-words text-xs text-slate-300">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => window.location.reload()}
                className="cursor-pointer rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 px-6 py-3 text-base font-semibold text-white shadow-[0_4px_15px_rgba(124,58,237,0.4)] transition-transform hover:-translate-y-0.5"
              >
                Refresh Page
              </button>
              
              <button
                onClick={this.resetErrorBoundary}
                className="cursor-pointer rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-base font-semibold text-slate-200 transition-colors hover:bg-white/[0.15]"
              >
                Try Again
              </button>
            </div>
            
            <p className="mt-6 text-sm text-slate-500">
              If the problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;