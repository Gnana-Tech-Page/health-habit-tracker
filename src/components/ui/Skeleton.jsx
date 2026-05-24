export default function Skeleton({ className = '' }) {
  return <div className={`bg-slate-700 rounded animate-pulse ${className}`} />
}

export function SkeletonCard() {
  return (
    <div className="card-dark p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  )
}
