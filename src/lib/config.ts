import { Capacitor } from '@capacitor/core';
import { isLocalMode, LOCAL_BASE_URL } from '$lib/local';

export function getBaseUrl(): string {
  if (isLocalMode()) {
    return LOCAL_BASE_URL;
  }

  if (Capacitor.isNativePlatform()) {
    // Return the saved URL or default to empty string (for web fallback)
    const storedUrl = localStorage.getItem('serverUrl');
    return storedUrl ? storedUrl.replace(/\/$/, '') : '';
  }

  return '';
}