import { z } from 'zod/v4';
import * as m from '$lib/paraglide/messages.js';

export function translateZodIssue(issue: z.core.$ZodIssue) {
  switch (issue.code) {
    case 'too_small':
      if (issue.origin === 'string' && issue.minimum === 1) {
        return m.form_invalid_nonempty();
      }
      if (issue.origin === 'string') {
        return m.form_invalid_minimum({ minimum: issue.minimum });
      }
      if (issue.origin === 'number') {
        return m.form_invalid_number_too_small({ minimum: issue.minimum });
      }
      if (issue.origin === 'array' && issue.path.join('.') === 'itemIds') {
        return m.settings_items_action_empty();
      }

      break;
    case 'invalid_value':
      if (issue.values.some(value => value === 'application/gzip')) {
        return m.settings_actions_import_file_missing();
      }

      break;
    case 'custom':
      return handleCustomCode(issue.message, issue.params);
  }

  return issue.message;
}

function handleCustomCode(message: string, params: Record<string, unknown> | undefined) {
  const key = message as keyof typeof m;

  if (message in m && typeof m[key] === 'function') {
    // @ts-expect-error Params may or may not exist on the key. We can't make this type-safe easily.
    return (m[key])(params || {});
  }

  return message;
}