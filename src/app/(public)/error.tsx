'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/base/button';
import { AlertTriangle } from 'lucide-react';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[PublicError]', error);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 flex items-center justify-center mb-6">
          <AlertTriangle className="text-primary-600" size={28} />
        </div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-ink-100 mb-2">
          Algo deu errado
        </h1>
        <p className="text-sm text-ink-600 dark:text-ink-400 mb-6">
          Ocorreu um erro ao carregar esta página. Tente novamente.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset}>Tentar novamente</Button>
          <Button variant="outline" asChild>
            <a href="/">Voltar ao início</a>
          </Button>
        </div>
      </div>
    </main>
  );
}
