import type { PublicUser } from '$lib/backend/db/schema';

export type Variables = {
  loggedInUser: PublicUser;
  // Set when the session of a mobile request was renewed.
  refreshedToken?: string;
};

export type AppEnv = {
  Variables: Variables;
};
