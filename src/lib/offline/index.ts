import { Capacitor } from '@capacitor/core';

// Stored instead of a server URL, when the app runs its own backend on the device.
const OFFLINE = 'offline';

// Fake origin for requests to the offline backend. They never leave the app.
export const OFFLINE_BASE_URL = 'http://offline.localhost';

type OfflineBackend = (request: Request) => Response | Promise<Response>;

let backend: Promise<OfflineBackend> | undefined;

export function setOfflineMode() {
  if (Capacitor.isNativePlatform()) {
    localStorage.setItem('serverUrl', OFFLINE);
  }
}

export function isOfflineMode() {
  return Capacitor.isNativePlatform() && localStorage.getItem('serverUrl') === OFFLINE;
}

// Starts the database and backend on first use. The import is limited to mobile builds (and dev for live reload), so
// the web build doesn't ship PGlite.
export function getOfflineBackend(): Promise<OfflineBackend> {
  if (backend) {
    return backend;
  }

  backend = (__CAPACITOR_BUILD__ || import.meta.env.DEV
    ? import('$lib/offline/backend').then((module) => module.startOfflineBackend())
    : Promise.reject(new Error('Offline mode is only available in the mobile app.'))
  ).catch((error) => {
    // Allow another attempt on the next request.
    backend = undefined;
    throw error;
  });

  return backend;
}
