<script lang="ts">
  import type { ActionResult } from '@sveltejs/kit';
  import type { Snippet } from 'svelte';
  import { z } from 'zod/v4';
  import { enhance } from '$app/forms';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { transPath } from '$lib/path-translations';
  import { toaster } from '$lib/toaster-ref';

  let {
    children,
    additionalButtons = undefined,
    action = undefined,
    method = 'POST',
    preUpdatedCallback = undefined,
    submitButtonText = m.generic_save(),
    submitButtonClasses = '',
    ...restProps // Captures any other native form attributes (e.g., id or name)
  }: {
    children: Snippet;
    additionalButtons?: Snippet<[submitting: boolean]>;
    action?: string;
    method?: 'dialog' | 'get' | 'post' | 'DIALOG' | 'GET' | 'POST' | undefined | null;
    preUpdatedCallback?: () => void;
    submitButtonText?: string;
    submitButtonClasses?: string;
  } = $props();

  let submitting = $state(false);

  const handleFormSubmit = () => {
    submitting = true;

    return async ({ result, update }: {
      result: ActionResult,
      update: (options?: { reset?: boolean; invalidateAll?: boolean }) => Promise<void>;
    }) => {
      if (result.type === 'failure' && result.data?.issues) {
        const formattedIssues = result.data.issues.map(
          (issue: z.core.$ZodIssue) => {
            const path = transPath(issue.path.join('.'));
            return `${path}: ${issue.message}`;
          }
        ).join('\n');

        toaster.error({ title: m.form_invalid(), description: formattedIssues, duration: 5000 });
      }

      if (preUpdatedCallback) {
        preUpdatedCallback();
      }

      submitting = false;

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
  <div class="mt-4">
    {@render additionalButtons?.(submitting)}
    <button class={['btn', submitButtonClasses]} type="submit" disabled={submitting}>
      {submitButtonText}
      {#if submitting}
        <LoadingSpinner size={6} bright />
      {/if}
    </button>
  </div>
</form>
