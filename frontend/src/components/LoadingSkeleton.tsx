interface LoadingSkeletonProps {
  count?: number;
}

export function LoadingSkeleton({ count = 6 }: LoadingSkeletonProps) {
  return (
    <div data-testid="loading-skeleton" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-5 animate-pulse"
        >
          <div className="flex gap-2 mb-3">
            <div className="h-5 w-16 bg-gray-200 rounded-full" />
            <div className="h-5 w-12 bg-gray-200 rounded-full" />
          </div>
          <div className="h-6 bg-gray-200 rounded mb-2 w-full" />
          <div className="h-6 bg-gray-200 rounded mb-3 w-3/4" />
          <div className="h-4 bg-gray-200 rounded mb-1 w-full" />
          <div className="h-4 bg-gray-200 rounded mb-3 w-5/6" />
          <div className="flex justify-between">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
