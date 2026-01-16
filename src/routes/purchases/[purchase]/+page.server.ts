import { type Actions, error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import * as m from '$lib/paraglide/messages.js';
import { createGenericPurchase, findPurchase, updatePurchase } from '$lib/server/db/functions';
import type { User } from '$lib/server/db/schema';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

export const load: PageServerLoad = async ({ params }) => {
  if (params.purchase === 'add') {
    return { purchase: null };
  }

  const purchase = await findPurchase(params.purchase);
  if (!purchase) {
    throw error(404, m.error_purchase_not_found());
  }

  return { purchase };
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
      await createGenericPurchase(user.id, purchase.name, purchase.price);

      return redirect(302, resolve('/purchases'));
    });
  },
  edit: async (event) => {
    return processForm(event, purchaseEditSchema, async (purchase) => {
      await updatePurchase(purchase.id, purchase.name, purchase.price);

      return redirect(302, resolve('/purchases'));
    });
  }
};
