import type { User } from '$lib/server/db/schema';

export type Variables = {
  loggedInUser: User;
};

export type AppEnv = {
  Variables: Variables;
};