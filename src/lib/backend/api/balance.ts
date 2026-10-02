import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { AppEnv } from '$lib/backend/api/types';
import {
  addBalanceEntry,
  addNotification,
  assertMatchingHousehold,
  calculateUserDebts,
  findAllBalanceEntries,
  findBalanceEntry,
  updateBalanceEntry
} from '$lib/backend/db/functions';
import { isLocalRuntime } from '$lib/backend/runtime';
import { BalanceEntryType } from '$lib/utils/balanceHelper';
import { z } from '$lib/zod';

const baseExpenseSchema = z.object({
  purchaseId: z.transform((val) => (val !== '' ? val : null)).pipe(z.string().nullable()),
  type: z.enum(BalanceEntryType),
  description: z.string().trim().transform((val) => (val !== '' ? val : null)),
  creditorId: z.string().min(1),
  price: z.coerce.number().min(0.01),
  distributions: z.array(z.object({ userId: z.string().nonempty(), percent: z.coerce.number().min(0) }))
});

const distributionValidation = (data: { distributions: { percent: number }[] }) => {
  const total = data.distributions.reduce((sum, d) => sum + d.percent, 0);
  return Math.abs(total - 100) < 0.1;
};

const distributionValidationMessage = {
  message: 'balance_expense_distribution_invalid_sum',
  path: ['distributions']
};

const createExpenseSchema = baseExpenseSchema
  .refine(distributionValidation, distributionValidationMessage);

const updateExpenseSchema = baseExpenseSchema
  .extend({ id: z.string().min(1) })
  .refine(distributionValidation, distributionValidationMessage);

// The creditor and all debtors must belong to the household of the logged-in user.
const involvesOnlyHouseholdMembers = (loggedInUserId: string, expense: z.infer<typeof baseExpenseSchema>) =>
  assertMatchingHousehold([
    loggedInUserId,
    expense.creditorId,
    ...expense.distributions.map((distribution) => distribution.userId)
  ]);

const householdMismatchError = { error: 'Household of all users must match your household' };

const balanceRouter = new Hono<AppEnv>()
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
    zValidator('json', createExpenseSchema),
    async (c) => {
      const expense = c.req.valid('json');
      if (!(await involvesOnlyHouseholdMembers(c.get('loggedInUser').id, expense))) {
        return c.json(householdMismatchError, 400);
      }

      await addBalanceEntry(
        expense.creditorId,
        expense.type,
        expense.description,
        expense.price,
        expense.distributions,
        expense.purchaseId
      );
      // Nobody else to notify in the single person local app.
      if (!isLocalRuntime()) {
        await addNotification('expense_created', c.get('loggedInUser').id, expense.description ?? expense.type);
      }

      return c.json({ success: true });
    }
  )
  .patch(
    '/',
    zValidator('json', updateExpenseSchema),
    async (c) => {
      const expense = c.req.valid('json');
      // Only finds entries of the own household. The distributions have no row level security, so this check guards them.
      if (!(await findBalanceEntry(expense.id))) {
        return c.json({ error: 'Entry not found' }, 404);
      }

      if (!(await involvesOnlyHouseholdMembers(c.get('loggedInUser').id, expense))) {
        return c.json(householdMismatchError, 400);
      }

      await updateBalanceEntry(
        expense.id,
        expense.creditorId,
        expense.type,
        expense.description,
        expense.price,
        expense.distributions
      );
      return c.json({ success: true });
    }
  );

export default balanceRouter;
