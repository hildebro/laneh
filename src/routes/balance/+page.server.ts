import type { PageServerLoad } from './$types';
import { calculateUserDebts, findAllBalanceEntries, findAllUsers } from '$lib/server/db/functions';

export const load: PageServerLoad = async () => {
  return {
    users: await findAllUsers(),
    userDebts: await calculateUserDebts(),
    entries: await findAllBalanceEntries()
  };
};