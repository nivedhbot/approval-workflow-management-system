const heights = ["h-32", "h-40", "h-28"];

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {heights.map((height, index) => (
      <div
        key={index}
        className={`animate-pulse rounded-2xl bg-white border border-[#e8e6e3] shadow-sm p-6 ${height}`}
      >
        <div className="mb-4 h-4 w-1/3 rounded-lg bg-[#f0efed]" />
        <div className="mb-2 h-3 w-full rounded-lg bg-[#f0efed]" />
        <div className="mb-2 h-3 w-5/6 rounded-lg bg-[#f0efed]" />
        <div className="h-3 w-2/3 rounded-lg bg-[#f0efed]" />
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
