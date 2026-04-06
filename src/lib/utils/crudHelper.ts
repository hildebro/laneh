import { error } from '@sveltejs/kit';

export async function handleCrudLoad<T>(apiPromise: Promise<Response>): Promise<T> {
  const res = await apiPromise;

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Server Error (${res.status}):`, errorText);
    throw error(res.status, `Server returned ${res.status}`);
  }

  const data = await res.json();

  if (data && typeof data === 'object' && 'error' in data) {
    throw error(400, data.error as string);
  }

  return data;
}