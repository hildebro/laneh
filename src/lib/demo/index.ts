import { Capacitor } from '@capacitor/core';
import { getMockData } from '$lib/demo/mockFactory';

export async function setDemoMode() {
  if (Capacitor.isNativePlatform()) {
    localStorage.setItem('serverUrl', 'demo');
  }
}

export async function isDemoMode() {
  return Capacitor.isNativePlatform() && localStorage.getItem('serverUrl') === 'demo';
}

export function handleDemoMode(input: RequestInfo | URL, init?: RequestInit) {
  const method = (init?.method || 'GET').toUpperCase();
  if (method !== 'GET') {
    const errorPayload = {
      success: false,
      error: {
        name: 'ZodError',
        message: JSON.stringify([
          {
            code: 'custom',
            path: ['system'],
            message: 'Demo mode is read-only.'
          }
        ])
      }
    };

    return new Response(
      JSON.stringify(errorPayload),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const urlString = input instanceof Request ? input.url : input.toString();

  const parsedUrl = new URL(urlString, 'http://localhost');
  const pathname = parsedUrl.pathname;

  const mockPayload = getMockData(pathname);

  return new Response(
    JSON.stringify(mockPayload),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}