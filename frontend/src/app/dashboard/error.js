'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-in fade-in duration-300">
      <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-6">
        <AlertTriangle className="w-12 h-12 text-red-300" strokeWidth={1.5} />
      </div>
      
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2 text-center">
        Something went wrong
      </h2>
      
      <p className="text-slate-500 max-w-md text-center mb-8">
        We encountered an unexpected error while loading this page. 
        Please try again or contact support if the problem persists.
      </p>
      
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-95"
      >
        <RotateCcw className="w-4 h-4" />
        Try Again
      </button>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-12 w-full max-w-2xl bg-slate-50 rounded-xl p-4 border border-slate-100 overflow-auto">
          <p className="text-xs font-mono text-slate-600 whitespace-pre-wrap">{error.message}</p>
        </div>
      )}
    </div>
  );
}
