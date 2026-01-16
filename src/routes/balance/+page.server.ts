import type { PageServerLoad } from './$types';
import { findAllBalanceEntries, findAllUsers } from '$lib/server/db/functions';

export const load: PageServerLoad = async () => {
  return { users: await findAllUsers(), entries: await findAllBalanceEntries() };
};