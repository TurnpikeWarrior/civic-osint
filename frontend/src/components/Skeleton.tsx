export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
  );
}

export function MemberHeaderSkeleton() {
  return (
    <div className="pb-8 border-b border-gray-200 bg-white">
      <div className="flex flex-col md:flex-row items-center gap-10">
        <Skeleton className="w-36 h-36 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-4 w-full">
          <div className="flex gap-3">
            <Skeleton className="w-20 h-6 rounded" />
            <Skeleton className="w-32 h-6 rounded" />
            <Skeleton className="w-24 h-6 rounded" />
          </div>
          <Skeleton className="w-full max-w-lg h-12" />
          <div className="flex gap-4">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-40 h-4" />
            <Skeleton className="w-40 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 border border-gray-100 rounded-2xl space-y-4">
      <div className="flex justify-between">
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-24 h-4" />
      </div>
      <Skeleton className="w-full h-6" />
      <Skeleton className="w-3/4 h-4" />
    </div>
  );
}

export function VoteCardSkeleton() {
  return (
    <div className="p-8 space-y-6 border-b border-gray-50 last:border-0">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="w-32 h-3" />
          <Skeleton className="w-48 h-8" />
        </div>
        <Skeleton className="w-24 h-6 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-20 h-3" />
        <Skeleton className="w-full h-4" />
      </div>
      <Skeleton className="w-full h-12 rounded-xl" />
    </div>
  );
}
