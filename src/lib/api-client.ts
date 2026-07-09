export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const isFormData = init?.body instanceof FormData;
  const headers: Record<string, string> = { 'x-requested-by': 'autoprime' };
  if (!isFormData) headers['Content-Type'] = 'application/json';
  return fetch(input, {
    ...init,
    headers: { ...headers, ...(init?.headers as Record<string, string> | undefined) },
  });
}
