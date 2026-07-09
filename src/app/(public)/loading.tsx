export default function PublicLoading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
      <p className="text-ink-400 font-light text-sm uppercase tracking-widest animate-pulse">Carregando...</p>
    </div>
  );
}
