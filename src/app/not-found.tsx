import Link from 'next/link';
import { Button } from '@/components/ui/base/button';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-ink-50 dark:bg-ink-950">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 flex items-center justify-center mb-6">
          <Compass className="text-primary-600" size={28} />
        </div>
        <p className="text-sm font-semibold text-primary-600 uppercase tracking-widest mb-2">
          404
        </p>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-ink-100 mb-2">
          Página não encontrada
        </h1>
        <p className="text-sm text-ink-600 dark:text-ink-400 mb-6">
          A página que você procura não existe ou foi removida.
        </p>
        <Button asChild>
          <Link href="/">Voltar ao início</Link>
        </Button>
      </div>
    </main>
  );
}
