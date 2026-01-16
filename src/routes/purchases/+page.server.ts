import type { PageServerLoad } from './$types';
import { findAllPurchases } from '$lib/server/db/functions';

export const load: PageServerLoad = async () => {
  return { purchases: await findAllPurchases() };
};