interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading products...' }: LoadingStateProps) {
  return (
    <div className="glass-panel mx-auto flex max-w-xl flex-col items-center justify-center rounded-[32px] px-8 py-14 text-center dark:bg-opacity-50">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-600 shadow-[0_12px_24px_rgba(13,148,136,0.16)] dark:bg-teal-950/30 dark:text-teal-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600 dark:border-teal-800 dark:border-t-teal-400" />
      </div>
      <h3 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">Loading inventory</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="glass-panel mx-auto flex max-w-xl flex-col items-center justify-center rounded-[32px] px-8 py-14 text-center dark:bg-opacity-50">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600 shadow-[0_12px_24px_rgba(244,63,94,0.14)] dark:bg-rose-950/30 dark:text-rose-400">
        <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">Feed unavailable</h3>
      <p className="mb-5 mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          Retry
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = 'No products found matching your filters.' }: EmptyStateProps) {
  return (
    <div className="glass-panel mx-auto flex max-w-xl flex-col items-center justify-center rounded-[32px] px-8 py-14 text-center dark:bg-opacity-50">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500 shadow-[0_12px_24px_rgba(15,23,42,0.08)] dark:bg-slate-700/30 dark:text-slate-400">
        <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">No matches right now</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{message}</p>
    </div>
  );
}

