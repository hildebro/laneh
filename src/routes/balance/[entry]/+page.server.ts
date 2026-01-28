import { type Actions, error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import * as m from '$lib/paraglide/messages.js';
import { addBalanceEntry, findAllUsers, findBalanceEntry, updateBalanceEntry } from '$lib/server/db/functions';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

export const load: PageServerLoad = async ({ params, url }) => {
  const purchaseId = url.searchParams.get('purchaseId');

  const users = await findAllUsers();
  if (params.entry === 'add') {
    return { entry: null, users, purchaseId };
  }

  const entry = await findBalanceEntry(params.entry);
  if (!entry) {
    throw error(404, m.error_balance_entry_not_found());
  }

  return { entry, users, purchaseId };
};

const expenseSchema = z
  .object({
    id: z.string().nullable(),
    purchaseId: z.transform((val) => (val !== '' ? val : null)).pipe(z.string().nullable()),
    name: z.string().min(1, 'Name is required'),
    creditorId: z.string().min(1, 'Creditor is required'),
    price: z.coerce.number().min(0.01),
    userIds: z.array(z.string()),
    percents: z.array(z.coerce.number())
  })
  .transform((data) => {
    const distributions = data.userIds.map((userId, index) => ({
      userId,
      percent: data.percents[index] ?? 0
    }));

    return {
      ...data,
      distributions
    };
  })
  .refine(
    (data) => {
      const total = data.distributions.reduce((sum, d) => sum + d.percent, 0);
      return Math.abs(total - 100) < 0.1;
    },
    {
      message: m.balance_expense_distribution_invalid_sum(),
      path: ['distributions']
    }
  );

export const actions: Actions = {
  default: async (event) => {
    return processForm(event, expenseSchema, async (expense) => {
      if (expense.id) {
        await updateBalanceEntry(
          expense.id,
          expense.creditorId,
          expense.name,
          expense.price,
          expense.distributions
        );
      } else {
        await addBalanceEntry(expense.creditorId, expense.name, expense.price, expense.distributions, expense.purchaseId);
      }

      return redirect(302, resolve('/balance'));
    }, { arrays: ['userIds', 'percents'] });
  }
};
