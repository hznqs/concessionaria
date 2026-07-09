export default function EstoqueLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-ink-800 rounded animate-pulse" />
      <div className="h-10 w-full bg-ink-800/60 rounded-xl animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-ink-800/40 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}
