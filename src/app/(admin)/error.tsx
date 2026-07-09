'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/base/button';
import { AlertTriangle } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AdminError]', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
          <AlertTriangle className="text-red-500" size={28} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Erro no painel
        </h1>
        <p className="text-sm text-ink-400 mb-6">
          Ocorreu um erro ao carregar esta seção. Tente novamente.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset}>Tentar novamente</Button>
          <Button variant="outline" asChild>
            <a href="/painel">Voltar ao painel</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
