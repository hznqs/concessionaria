export default function VeiculosLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-8">
      <div className="flex gap-4">
        <div className="hidden lg:block w-64 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-ink-800/60 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 w-36 bg-ink-800 rounded animate-pulse" />
            <div className="h-9 w-32 bg-ink-800/60 rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-ink-900 border border-white/5">
                <div className="aspect-[4/3] bg-ink-800 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-3/4 bg-ink-800 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-ink-800/60 rounded animate-pulse" />
                  <div className="h-6 w-1/3 bg-ink-800 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
