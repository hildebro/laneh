// src/routes/tasks/[task]/+page.ts
import type { PageLoad } from './$types';
import { resolve } from '$app/paths';
import { getBaseUrl } from '$lib/config';

export const load: PageLoad = async ({ params, fetch }) => {
  const baseUrl = getBaseUrl();

  // Make sure this URL exactly matches where your +server.ts is located!
  const res = await fetch(baseUrl + resolve('/api/tasks/single/[task]', { task: params.task }));

  // 1. Check if the server returned an error status (404, 500, etc.)
  if (!res.ok) {
    // Read the response as plain text so it doesn't crash JSON.parse
    const errorText = await res.text();
    console.error(`Server Error (${res.status}):`, errorText);
    throw new Error(`Server returned ${res.status}`);
  }

  // 2. Ensure the response is actually JSON before parsing
  // const contentType = res.headers.get('content-type');
  // if (!contentType || !contentType.includes('application/json')) {
  //   const rawText = await res.text();
  //   console.error('Expected JSON but got:', rawText);
  //   throw new Error('API did not return JSON');
  // }

  // 3. Now it is safe to parse
  const data = await res.json();

  return { task: data.task };
};