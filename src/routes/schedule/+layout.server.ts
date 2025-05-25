import type { LayoutServerLoad } from './$types';
import { findAllUsers } from '$lib/server/db/functions';

export const load: LayoutServerLoad = async () => {
  return { users: findAllUsers() };
};