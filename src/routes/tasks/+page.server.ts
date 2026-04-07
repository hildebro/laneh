import type { Actions } from '@sveltejs/kit';
import { markTaskAsDone } from '$lib/server/db/functions';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

const taskCompletionSchema = z.object({
  taskId: z.string().trim().nonempty(),
  userId: z.string().trim().nullish()
});

export const actions: Actions = {
  markAsDone: async (event) => {
    return processForm(event, taskCompletionSchema, async (taskCompletion, { locals }) => {
      const completionUserId = taskCompletion.userId ?? locals.user?.id as string;

      await markTaskAsDone(taskCompletion.taskId, completionUserId);
    });
  }
};
