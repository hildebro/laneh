import { type Actions, error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import * as m from '$lib/paraglide/messages.js';
import { addBalanceEntry, findAllUsers, findBalanceEntry, updateBalanceEntry } from '$lib/server/db/functions';
import type { User } from '$lib/server/db/schema';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

export const load: PageServerLoad = async ({ params }) => {
  const users = await findAllUsers();
  if (params.entry === 'add') {
    return { entry: null, users };
  }

  const entry = await findBalanceEntry(params.entry);
  if (!entry) {
    throw error(404, m.error_balance_entry_not_found());
  }

  return { entry, users };
};

const expenseSchema = z.object({
  id: z.string().nullable(),
  name: z.string().min(1, 'Name is required'),
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
  .refine((data) => {
    const total = data.distributions.reduce((sum, d) => sum + d.percent, 0);
    return Math.abs(total - 100) < 0.1;
  }, {
    message: m.balance_expense_distribution_invalid_sum(),
    path: ['distributions']
  });

export const actions: Actions = {
  default: async (event) => {
    const user = event.locals.user as User;

    return processForm(event, expenseSchema, async (expense) => {
      if (expense.id) {
        await updateBalanceEntry(expense.id, expense.name, expense.price, expense.distributions)
      } else {
        await addBalanceEntry(user.id, expense.name, expense.price, expense.distributions);
      }

      return redirect(302, resolve('/balance'));
    }, { arrays: ['userIds', 'percents'] });
  }
};
