interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  message?: string;
}

export default function ErrorFallback({ error, resetError, message }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800 min-h-[300px]">
      <div className="text-red-600 dark:text-red-400 text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-red-800 dark:text-red-300 mb-2">
        Something went wrong
      </h2>
      <p className="text-red-600 dark:text-red-400 mb-4 text-center max-w-md">
        {message || error?.message || 'An unexpected error occurred. Please try again.'}
      </p>
      {resetError && (
        <button
          onClick={resetError}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
