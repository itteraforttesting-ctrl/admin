import React from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true);
      setError(event.error);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-lg w-full text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">System Error</h2>
          <p className="text-muted mb-6">
            An unexpected error occurred. This might be due to missing permissions or a configuration issue.
          </p>
          <pre className="bg-black/50 p-4 rounded text-left text-xs overflow-auto max-h-40 mb-6 font-mono text-red-400">
            {error?.message || 'Unknown error'}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/80 transition-colors"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
