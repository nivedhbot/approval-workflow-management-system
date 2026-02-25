const LoadingSkeleton = ({ rows = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="skeleton h-4 w-48" />
          <div className="skeleton h-5 w-20 rounded-full" />
        </div>
        <div className="skeleton h-3 w-full mb-2" />
        <div className="skeleton h-3 w-3/4" />
        <div className="flex items-center gap-4 mt-4">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-3 w-20" />
        </div>
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
