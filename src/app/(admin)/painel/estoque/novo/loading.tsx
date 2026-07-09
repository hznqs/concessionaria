export default function NovoVeiculoLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-56 bg-ink-800 rounded animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 bg-ink-800 rounded animate-pulse" />
            <div className="h-11 w-full bg-ink-800/60 rounded-xl animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
