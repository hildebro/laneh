// noinspection JSUnusedGlobalSymbols Intellij doesn't see the usage, because it's through auto-generated files.

import type { User } from '$lib/server/db/schema';

declare global {
  namespace App {
    interface Locals {
      user: User | undefined;
    }
  }
  const __APP_VERSION__: string;
}

export {};
