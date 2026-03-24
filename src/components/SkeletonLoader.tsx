// Skeleton loading components to replace spinners

export function SkeletonRow({ count = 4 }: { count?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
          <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-gray-200 rounded-lg w-1/3" />
            <div className="h-3 bg-gray-200 rounded-lg w-1/2" />
          </div>
          <div className="h-3 bg-gray-200 rounded-lg w-16" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonCard({ count = 3 }: { count?: number }) {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gray-200 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded-lg w-2/3" />
              <div className="h-3 bg-gray-200 rounded-lg w-1/3" />
              <div className="flex gap-3">
                <div className="h-3 bg-gray-200 rounded-lg w-16" />
                <div className="h-3 bg-gray-200 rounded-lg w-16" />
                <div className="h-3 bg-gray-200 rounded-lg w-16" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonStat({ count = 3 }: { count?: number }) {
  return (
    <div className="animate-pulse grid grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <div className="h-3 bg-gray-200 rounded-lg w-1/2" />
          <div className="h-7 bg-gray-200 rounded-lg w-2/3" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonDetailHeader() {
  return (
    <div className="animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl p-6 mb-6 flex items-center gap-5">
      <div className="w-16 h-16 bg-white/30 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <div className="h-6 bg-white/30 rounded-lg w-1/3" />
        <div className="h-4 bg-white/30 rounded-lg w-1/4" />
      </div>
    </div>
  )
}
