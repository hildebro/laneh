import { Capacitor } from '@capacitor/core';

export function getBaseUrl(): string {
  if (Capacitor.isNativePlatform()) {
    // Return the saved URL or default to empty string (for web fallback)
    const storedUrl = localStorage.getItem('serverUrl');
    return storedUrl ? storedUrl.replace(/\/$/, '') : '';
  }

  return '';
}