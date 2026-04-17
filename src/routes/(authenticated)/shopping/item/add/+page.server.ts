import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import * as m from '$lib/paraglide/messages.js';
import {
  addNewStagedItem,
  addPerfectStagedItem,
  addStagedShoppingList,
  commitStagedItems,
  findShoppingItem
} from '$lib/server/db/functions';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

const addingItemsSchema = z
  .object({
    amounts: z.array(z.string()),
    names: z.array(z.string())
  })
  .transform((data) => {
    return data.names
      .filter(name => name.trim().length > 0)
      .map((name, index) => ({
        amount: data.amounts[index]?.trim() ?? 0,
        name: name.trim(),
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
      const userId = event.locals.user?.id as string;
      const listId = await addStagedShoppingList(userId);

      let needsCategorization = false;
      for (const item of items) {
        const isNewItem = await persistStagedItem(item.name, item.amount, listId);
        if (isNewItem) {
          needsCategorization = true;
        }
      }

      if (needsCategorization) {
        return redirect(303, resolve('/shopping/item/categorize'));
      } else {
        // If all items are perfect matches, we can just commit them
        await commitStagedItems(userId);

        return redirect(303, resolve('/shopping'));
      }
    }, { arrays: ['amounts', 'names'] });
  }
};

/**
 * Returns true, if the item is new.
 */
async function persistStagedItem(name: string, amount: string, listId: string): Promise<boolean> {
  const matchedItem = await findShoppingItem(name);
  if (matchedItem) {
    await addPerfectStagedItem(listId, matchedItem, amount);

    return false;
  }

  await addNewStagedItem(listId, name, amount);

  return true;
}
