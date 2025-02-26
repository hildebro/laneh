// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { User } from '$lib/server/db/schema';

declare global {
	namespace App {
        interface Locals {
          user: User|undefined;
        }
    }
}

export {};
