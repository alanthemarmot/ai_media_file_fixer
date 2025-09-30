interface SkeletonLoaderProps {
  className?: string;
}

export function SkeletonBox({ className = '' }: SkeletonLoaderProps) {
  return (
    <div
      className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded ${className}`}
      style={{ animationDuration: '1.5s' }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 animate-fadeIn">
      <div className="flex space-x-4">
        <SkeletonBox className="w-24 h-36 flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <SkeletonBox className="h-6 w-3/4" />
          <SkeletonBox className="h-4 w-1/2" />
          <SkeletonBox className="h-4 w-full" />
          <SkeletonBox className="h-4 w-full" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="space-y-3">
          <SkeletonBox className="w-full h-64" />
          <SkeletonBox className="h-5 w-3/4" />
          <SkeletonBox className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonDetails() {
  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex space-x-6">
        <SkeletonBox className="w-48 h-72 flex-shrink-0" />
        <div className="flex-1 space-y-4">
          <SkeletonBox className="h-8 w-2/3" />
          <SkeletonBox className="h-6 w-1/2" />
          <SkeletonBox className="h-4 w-full" />
          <SkeletonBox className="h-4 w-full" />
          <SkeletonBox className="h-4 w-3/4" />
        </div>
      </div>

      {/* Content sections */}
      <div className="space-y-4">
        <SkeletonBox className="h-6 w-32" />
        <div className="grid grid-cols-2 gap-4">
          <SkeletonBox className="h-20" />
          <SkeletonBox className="h-20" />
        </div>
      </div>

      <div className="space-y-4">
        <SkeletonBox className="h-6 w-32" />
        <div className="flex space-x-3 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <SkeletonBox key={i} className="w-16 h-16 rounded-full flex-shrink-0" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonEpisodeList() {
  return (
    <div className="space-y-3">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <SkeletonBox className="w-32 h-20 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBox className="h-5 w-1/4" />
            <SkeletonBox className="h-4 w-3/4" />
          </div>
          <SkeletonBox className="w-24 h-10" />
        </div>
      ))}
    </div>
  );
}
