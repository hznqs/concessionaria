import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function BreadcrumbNav({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="bg-white dark:bg-ink-950 border-b border-ink-200 dark:border-ink-800 py-3">
      <ol className="flex items-center gap-1 text-xs text-ink-500 dark:text-ink-500 flex-wrap">
        <li>
          <Link href="/" className="hover:text-primary-500 dark:hover:text-primary-400 transition-colors flex items-center gap-1">
            <Home size={12} />
            Home
          </Link>
        </li>
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-1">
            <ChevronRight size={12} className="text-ink-400 dark:text-ink-700" />
            {item.href ? (
              <Link href={item.href} className="hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-ink-900 dark:text-ink-300 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
