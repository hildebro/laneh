<script lang="ts">
  import type { ActionResult } from '@sveltejs/kit';
  import type { Snippet } from 'svelte';
  import { z } from 'zod/v4';
  import { enhance } from '$app/forms';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { transPath } from '$lib/path-translations';
  import { addToast } from '$lib/stores/toast';

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
    submitButtonsLayout?: 'form-actions' | 'action-row' | 'none';
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
    submitButtonsLayout = 'form-actions',
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

      addToast({ title: m.form_invalid(), message: formattedIssues, type: 'error' });
    } else {
      addToast({ message: m.form_success() });
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
  <div class="{submitButtonsLayout}">
    {@render additionalButtons?.(submitting)}
    {#if !hideSubmitButton}
      <button
        class="{submitButtonClasses} {submitting ? 'icon-button' : ''}"
        type="submit"
        disabled={submitting}
      >
        {submitButtonText}
        {#if submitting}
          <LoadingSpinner size={6} bright />
        {/if}
      </button>
    {/if}
  </div>
</form>

<style>
  .form-actions {
      margin-top: 1.5rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
  }
</style>