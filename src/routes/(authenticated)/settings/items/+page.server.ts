import { deleteShoppingItems } from '$lib/server/db/functions';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

const itemUpdateSchema = z.object({
  itemIds: z.transform((val: string) => {
    if (val === '') {
      return [];
    }

    return val.split(',');
  }).pipe(z.array(z.string().nonempty()).nonempty())
});

export const actions = {
  deleteItems: async (event) => {
    return processForm(event, itemUpdateSchema, async (itemUpdate) => {
      await deleteShoppingItems(itemUpdate.itemIds);
    });
  }
};
