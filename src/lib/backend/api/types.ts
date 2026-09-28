import type { User } from '$lib/backend/db/schema';

export type Variables = {
  loggedInUser: User;
  // Set when the session of a mobile request was renewed.
  refreshedToken?: string;
};

export type AppEnv = {
  Variables: Variables;
};
