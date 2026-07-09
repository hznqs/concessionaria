export default function VehicleLoading() {
  return (
    <div className="min-h-screen bg-ink-950 pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Breadcrumb */}
        <div className="h-3 w-64 skeleton mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
          {/* Gallery skeleton */}
          <div className="space-y-3">
            <div className="aspect-[4/3] skeleton" />
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square skeleton" />
              ))}
            </div>
          </div>

          {/* Details skeleton */}
          <div className="space-y-6">
            <div className="h-3 w-24 skeleton" />
            <div className="h-10 w-4/5 skeleton" />
            <div className="h-8 w-1/2 skeleton" />
            <div className="h-px bg-white/5 w-full" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-16 skeleton rounded" />
              ))}
            </div>
            <div className="h-px bg-white/5 w-full" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 skeleton" style={{ width: `${70 + i * 10}%` }} />
              ))}
            </div>
            <div className="h-12 skeleton" />
            <div className="h-12 skeleton opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
}
