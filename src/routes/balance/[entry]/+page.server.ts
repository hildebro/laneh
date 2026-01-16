import { type Actions, error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import * as m from '$lib/paraglide/messages.js';
import { addBalanceEntry, findBalanceEntry, updateBalanceEntry } from '$lib/server/db/functions';
import type { User } from '$lib/server/db/schema';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

export const load: PageServerLoad = async ({ params }) => {
  if (params.entry === 'add') {
    return { entry: null };
  }

  const entry = await findBalanceEntry(params.entry);
  if (!entry) {
    throw error(404, m.error_balance_entry_not_found());
  }

  return { entry };
};

const purchaseCreateSchema = z.object({
  name: z.string().trim().nonempty(),
  price: z.transform((val: string) => parseInt(val)).pipe(z.number().nonoptional())
});

const purchaseEditSchema = z.object({
  id: z.string().nonoptional(),
  name: z.string().trim().nonempty(),
  price: z.transform((val: string) => parseInt(val)).pipe(z.number().nonoptional())
});

export const actions: Actions = {
  create: async (event) => {
    const user = event.locals.user as User;

    return processForm(event, purchaseCreateSchema, async (purchase) => {
      await addBalanceEntry(user.id, purchase.name, purchase.price);

      return redirect(302, resolve('/balance'));
    });
  },
  edit: async (event) => {
    return processForm(event, purchaseEditSchema, async (purchase) => {
      await updateBalanceEntry(purchase.id, purchase.name, purchase.price);

      return redirect(302, resolve('/balance'));
    });
  }
};
