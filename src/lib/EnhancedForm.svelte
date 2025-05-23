<script lang="ts">
  import type { ActionResult } from '@sveltejs/kit';
  import type { Snippet } from 'svelte';
  import { z } from 'zod/v4';
  import { enhance } from '$app/forms';
  import * as m from '$lib/paraglide/messages.js';
  import { toaster } from '$lib/toaster-ref';

  let {
    children,
    action = undefined,
    method = 'POST',
    ...restProps // Captures any other native form attributes (e.g., id or name)
  }: {
    children: Snippet;
    action?: string;
    method?: 'dialog' | 'get' | 'post' | 'DIALOG' | 'GET' | 'POST' | undefined | null;
  } = $props();

  const handleFormSubmit = () => {
    return async ({ result, update }: {
      result: ActionResult,
      update: (options?: { reset?: boolean; invalidateAll?: boolean }) => Promise<void>;
    }) => {
      if (result.type === 'failure' && result.data?.issues) {
        const formattedIssues = result.data.issues.map(
          (issue: z.core.$ZodIssue) => `${issue.path.join('.')}: ${issue.message}`
        ).join('\n');

        toaster.error({ title: m.generic_form_invalid(), description: formattedIssues });
      }

      // Call update to apply any changes to the page (e.g., if you're using $page.form)
      // It's important to call update() to ensure SvelteKit's progressive enhancement works correctly,
      // especially for updating form data or error messages displayed on the page.
      await update({ reset: result.type !== 'success' }); // Reset form only on failure or error
    };
  };
</script>

<form
  method={method}
  action={action}
  use:enhance={handleFormSubmit}
  {...restProps}
>
  {@render children()}
</form>