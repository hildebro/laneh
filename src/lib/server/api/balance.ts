import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import * as m from '$lib/paraglide/messages.js';
import {
  addBalanceEntry,
  calculateUserDebts,
  findAllBalanceEntries,
  findBalanceEntry,
  updateBalanceEntry
} from '$lib/server/db/functions';
import type { BalanceEntry } from '$lib/server/db/schema';
import { z } from '$lib/zod';

export type ApiBalanceEntry = Omit<BalanceEntry, 'date'> & {
  date: string;
};

const expenseSchema = z
  .object({
    id: z.string().nullable(),
    purchaseId: z.transform((val) => (val !== '' ? val : null)).pipe(z.string().nullable()),
    name: z.string().min(1),
    creditorId: z.string().min(1),
    price: z.coerce.number().min(0.01),
    distributions: z.array(z.object({ userId: z.string().nonempty(), percent: z.coerce.number().positive() })),
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

const balanceRouter = new Hono()
  .get('/', async (c) => {
    return c.json(await findAllBalanceEntries());
  })
  .get('/debts', async (c) => {
    return c.json(await calculateUserDebts());
  })
  .get('/:entry', async (c) => {
    const entryParam = c.req.param('entry');
    const entry = await findBalanceEntry(entryParam);
    if (!entry) return c.json({ error: 'Entry not found' }, 404);

    return c.json(entry);
  })
  .post(
    '/',
    zValidator('json', expenseSchema),
    async (c) => {
      const expense = c.req.valid('json');
      try {
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

        return c.json({ success: true });
      } catch {
        return c.json({ error: 'Database error' }, 500);
      }
    }
  )
;

export default balanceRouter;