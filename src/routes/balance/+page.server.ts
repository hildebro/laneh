import type { PageServerLoad } from './$types';
import { findAllBalanceEntries } from '$lib/server/db/functions';

export const load: PageServerLoad = async () => {
  return { entries: await findAllBalanceEntries() };
};