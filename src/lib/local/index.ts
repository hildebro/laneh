import { Capacitor } from '@capacitor/core';

// Stored instead of a server URL, when the app runs its own backend on the device. The value predates the rename to
// local mode and is kept, so existing installs stay in local mode.
const LOCAL = 'offline';

// Fake origin for requests to the local backend. They never leave the app.
export const LOCAL_BASE_URL = 'http://local.localhost';

type LocalBackend = (request: Request) => Response | Promise<Response>;

let backend: Promise<LocalBackend> | undefined;

export function setLocalMode() {
  if (Capacitor.isNativePlatform()) {
    localStorage.setItem('serverUrl', LOCAL);
  }
}

export function isLocalMode() {
  return Capacitor.isNativePlatform() && localStorage.getItem('serverUrl') === LOCAL;
}

// Starts the database and backend on first use. The import is limited to mobile builds (and dev for live reload), so
// the web build doesn't ship PGlite.
export function getLocalBackend(): Promise<LocalBackend> {
  if (backend) {
    return backend;
  }

  backend = (__CAPACITOR_BUILD__ || import.meta.env.DEV
    ? import('$lib/local/backend').then((module) => module.startLocalBackend())
    : Promise.reject(new Error('Local mode is only available in the mobile app.'))
  ).catch((error) => {
    // Allow another attempt on the next request.
    backend = undefined;
    throw error;
  });

  return backend;
}
