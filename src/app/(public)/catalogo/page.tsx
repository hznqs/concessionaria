import { redirect } from 'next/navigation';

export default function CatalogoRedirect({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string') {
      query.set(key, value);
    } else if (Array.isArray(value)) {
      for (const v of value) query.append(key, v);
    }
  }
  const qs = query.toString();
  redirect(qs ? `/veiculos?${qs}` : '/veiculos');
}
