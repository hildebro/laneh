// src/routes/api/tasks/[task]/+server.ts
import { json } from '@sveltejs/kit';
import { addSingleTask, findSingleTask, updateSingleTask } from '$lib/server/db/functions';
import { z } from '$lib/zod';

// Replaces your PageServerLoad
export async function GET({ params }) {
  if (params.task === 'add') {
    return json({ task: null });
  }

  const task = await findSingleTask(params.task);
  if (!task) {
    return json({ error: 'Task not found' }, { status: 404 });
  }

  return json({ task });
}

const taskSchema = z.object({
  id: z.string().trim().nullish(),
  name: z.string().trim().nonempty(),
  dueUserId: z.string().trim().pipe(z.transform(val => val === '' ? null : val)),
  dueDate: z.string().trim().pipe(z.transform(val => val === '' ? null : val))
});

// Replaces your 'create' Action
export async function POST({ request }) {
  const body = await request.json();
  const parsed = taskSchema.safeParse(body);

  if (!parsed.success) {
    return json({ error: 'Invalid data' }, { status: 400 });
  }

  const task = parsed.data;

  try {
    if (task.id) {
      await updateSingleTask(task.id, task.name, task.dueUserId, task.dueDate);
    } else {
      await addSingleTask(task.name, task.dueUserId, task.dueDate);
    }
    return json({ success: true });
  } catch (error) {
    return json({ error: 'Database error' }, { status: 500 });
  }
}