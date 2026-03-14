<script lang="ts">
  import type { ActionResult } from '@sveltejs/kit';
  import type { Snippet } from 'svelte';
  import { z } from 'zod/v4';
  import { enhance } from '$app/forms';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { transPath } from '$lib/path-translations';
  import { toaster } from '$lib/toaster-ref';

  type EnhancedFormProps = {
    children: Snippet;
    additionalButtons?: Snippet<[submitting: boolean]>;
    action?: string;
    method?: 'dialog' | 'get' | 'post' | 'DIALOG' | 'GET' | 'POST' | undefined | null;
    enctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data';
    preUpdatedCallback?: () => void;
    submitButtonText?: string;
    submitButtonClasses?: string;
    hideSubmitButton?: boolean;
  };

  let {
    children,
    additionalButtons = undefined,
    action = undefined,
    method = 'POST',
    enctype = 'application/x-www-form-urlencoded',
    preUpdatedCallback = undefined,
    submitButtonText = m.generic_save(),
    submitButtonClasses = '',
    hideSubmitButton = false,
    ...restProps
  }: EnhancedFormProps = $props();

  let submitting = $state(false);

  const handleFormSubmit = () => {
    submitting = true;

    return handlePostSubmit;
  };

  const handlePostSubmit = async ({ result, update }: {
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

    // Reset form only on failure or error
    await update({ reset: result.type !== 'success' });
  };
</script>

<form
  method={method}
  action={action}
  {enctype}
  use:enhance={handleFormSubmit}
  {...restProps}
>
  {@render children()}
  <div class="mt-4 flex gap-1.5 flex-wrap">
    {@render additionalButtons?.(submitting)}
    {#if !hideSubmitButton}
      <button class={['btn', submitButtonClasses]} type="submit" disabled={submitting}>
        {submitButtonText}
        {#if submitting}
          <LoadingSpinner size={6} bright />
        {/if}
      </button>
    {/if}
  </div>
</form>
