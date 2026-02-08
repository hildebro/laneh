import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import * as m from '$lib/paraglide/messages.js';
import {
  addCloseStagedItem,
  addNewStagedItem,
  addPerfectStagedItem,
  addStagedShoppingList,
  commitStagedItems,
  findShoppingItem,
  findSimilarShoppingItem,
  findStagedShoppingList,
  getItemAddSuggestions
} from '$lib/server/db/functions';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

export const load: PageServerLoad = async ({ locals }) => {
  const userId = locals.user?.id as string;

  const existingList = await findStagedShoppingList(userId);
  if (existingList) {
    return redirect(302, 'validate');
  }

  return { suggestions: getItemAddSuggestions() };
};

const addingItemsSchema = z
  .object({
    amounts: z.array(z.string()),
    names: z.array(z.string().nonempty())
  })
  .transform((data) => {
    return data.amounts.map((amount, index) => ({
      amount,
      name: data.names[index] ?? 0
    }));
  })
  .refine(
    (data) => {
      return data.length > 0;
    },
    {
      message: m.generic_empty(),
      path: ['names']
    }
  );

export const actions = {
  default: async (event) => {
    return processForm(event, addingItemsSchema, async (items, event) => {
      // --- Get User (Essential) ---
      const userId = event.locals.user?.id as string;
      const listId = await addStagedShoppingList(userId);

      // --- Process lines and prepare staged data ---
      let needsValidation = false;
      let needsCategorization = false;
      for (const item of items) {
        // case `perfect_match` doesn't matter to us here.
        const result = await persistStagedItem(item.name, item.amount, listId);
        switch (result) {
          case 'close_match':
            needsValidation = true;
            continue;
          case 'unmatched':
            needsCategorization = true;
        }
      }

      if (needsValidation) {
        return redirect(303, resolve('/shopping/item/validate'));
      } else if (needsCategorization) {
        return redirect(303, resolve('/shopping/item/categorize'));
      } else {
        // If all items are perfect matches, we can just commit them
        await commitStagedItems(userId);

        return redirect(303, resolve('/shopping'));
      }
    }, { arrays: ['amounts', 'names'] });
  }
};

type MatchResult = 'perfect_match' | 'close_match' | 'unmatched';

async function persistStagedItem(name: string, amount: string, listId: string): Promise<MatchResult> {
  // 1. Perfect Match (case-insensitive, check active & inactive)
  const perfectMatch = await findShoppingItem(name);
  if (perfectMatch) {
    await addPerfectStagedItem(listId, perfectMatch, amount);

    return 'perfect_match';
  }

  // 2. Very Close Match
  const similarItem = await findSimilarShoppingItem(name);
  if (similarItem) {
    await addCloseStagedItem(listId, similarItem, name, amount);

    return 'close_match';
  }

  await addNewStagedItem(listId, name, amount);

  return 'unmatched';
}
