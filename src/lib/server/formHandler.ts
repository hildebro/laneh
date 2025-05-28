import { type ActionFailure, fail, type RequestEvent } from '@sveltejs/kit';
import type { z } from 'zod/v4';

export async function processForm<Schema extends z.ZodObject, SuccessReturnType>(
  event: RequestEvent,
  schema: Schema,
  onSuccess: (
    data: z.infer<Schema>,
    event: RequestEvent
  ) => Promise<SuccessReturnType | ActionFailure>
): Promise<SuccessReturnType | ActionFailure<{ issues?: z.core.$ZodIssue[] } | undefined>> {
  const formData = Object.fromEntries(await event.request.formData());
  const validationResult = schema.safeParse(formData);

  if (!validationResult.success) {
    return fail(422, { issues: validationResult.error.issues });
  }

  return onSuccess(validationResult.data, event);
}

export function failForm(path: string, message: string) {
  return fail(422, {
    issues: [
      { path: [path], message }
    ]
  });
}