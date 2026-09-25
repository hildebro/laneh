import { Capacitor } from '@capacitor/core';
import { isOfflineMode, OFFLINE_BASE_URL } from '$lib/offline';

export function getBaseUrl(): string {
  if (isOfflineMode()) {
    return OFFLINE_BASE_URL;
  }

  if (Capacitor.isNativePlatform()) {
    // Return the saved URL or default to empty string (for web fallback)
    const storedUrl = localStorage.getItem('serverUrl');
    return storedUrl ? storedUrl.replace(/\/$/, '') : '';
  }

  return '';
}