import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { getMockData } from '$lib/demo/mockFactory';

export async function setDemoMode(demoMode: boolean) {
  if (Capacitor.isNativePlatform()) {
    await Preferences.set({
      key: 'demoMode',
      value: `${demoMode}`
    });
  }
}

export async function isDemoMode() {
  return Capacitor.isNativePlatform() && (await Preferences.get({ key: 'demoMode' })).value === 'true';
}

export function handleDemoMode(input: RequestInfo | URL, init?: RequestInit) {
  const method = (init?.method || 'GET').toUpperCase();
  if (method !== 'GET') {
    return new Response(
      JSON.stringify({ message: 'Demo mode is read-only.' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const mockPayload = getMockData(input.toString());
  console.log(input.toString());
  console.log(mockPayload);

  return new Response(
    JSON.stringify(mockPayload),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}