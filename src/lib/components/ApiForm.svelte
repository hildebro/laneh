<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { z } from 'zod';
  import { goto, invalidateAll } from '$app/navigation';
  import type { ResolvedPathname } from '$app/types';
  import * as m from '$lib/paraglide/messages.js';
  import { transPath } from '$lib/path-translations';
  import { addToast } from '$lib/stores/toast';

  let {
    submitAction,
    onSuccess = undefined,
    additionalButtons = undefined,
    submitButtonText = m.generic_save(),
    children
  }: {
    submitAction: () => Promise<Response>;
    onSuccess?: ResolvedPathname | (() => void) | undefined;
    additionalButtons?: Snippet,
    submitButtonText?: string;
    children: Snippet;
  } = $props();

  let isSubmitting = $state(false);

  async function handleSubmit(event: Event) {
    event.preventDefault();
    isSubmitting = true;

    try {
      const response = await submitAction();

      if (response.ok) {
        addToast({ message: m.form_success() });

        if (typeof onSuccess === 'function') {
          onSuccess();
          await invalidateAll();
        } else if (typeof onSuccess === 'string') {
          // `redirectTo` is typed as ResolvedPathname, so it's fine to navigate without resolve.
          // eslint-disable-next-line svelte/no-navigation-without-resolve
          await goto(onSuccess);
        }

        return;
      }

      const result = await response.json().catch(() => ({}));
      const issues: z.core.$ZodIssue[] | null = JSON.parse(result?.error?.message);

      if (issues && Array.isArray(issues) && issues.length > 0) {
        const formattedIssues = issues.map((issue) => {
          const path = transPath(issue.path.join('.'));
          return `${path}: ${issue.message}`;
        }).join('\n');

        addToast({ title: m.form_invalid(), message: formattedIssues, type: 'error' });
      } else {
        const errorMsg = result.message || result.error || m.form_error_generic();

        addToast({ title: m.form_error(), message: errorMsg, type: 'error' });
      }
    } catch {
      addToast({ title: m.form_error(), message: m.form_error_generic(), type: 'error' });
    } finally {
      isSubmitting = false;
    }
  }
</script>

<form onsubmit={handleSubmit}>
  {@render children()}

  {#if additionalButtons}
    {@render additionalButtons()}
  {/if}
  <button type="submit" disabled={isSubmitting}>
    {isSubmitting ? m.generic_loading() : submitButtonText}
  </button>
</form>