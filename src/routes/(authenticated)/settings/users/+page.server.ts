import { type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import * as m from '$lib/paraglide/messages';
import { findAllUsers, updateDefaultDistribution } from '$lib/server/db/functions';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

export const load: PageServerLoad = async ({ locals }) => {
  return {
    users: findAllUsers(),
    has_active_user: locals.user !== undefined
  };
};

const distributionSchema = z
  .object({
    userIds: z.array(z.string()),
    percents: z.array(z.coerce.number())
  })
  .transform((data) => {
    const distributions = data.userIds.map((userId, index) => ({
      userId,
      percent: data.percents[index] ?? 0
    }));

    return {
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
  distribution: async (event) => {
    return processForm(event, distributionSchema, async (distributionData) => {
      await updateDefaultDistribution(distributionData.distributions);
    }, { arrays: ['userIds', 'percents'] });
  },
};
