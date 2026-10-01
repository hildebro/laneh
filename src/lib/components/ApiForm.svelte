<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { z } from 'zod';
  import { beforeNavigate, goto, invalidateAll } from '$app/navigation';
  import type { ResolvedPathname } from '$app/types';
  import * as m from '$lib/paraglide/messages.js';
  import { addToast } from '$lib/stores/toast';
  import { translateZodIssue } from '$lib/utils/zod';

  let {
    submitAction,
    onSuccess = undefined,
    additionalButtons = undefined,
    submitButtonText = m.generic_save(),
    submitButtonClasses = '',
    submitButtonHidden = false,
    warnOnUnsavedChanges = true,
    children
  }: {
    submitAction: () => Promise<Response>;
    onSuccess?: ResolvedPathname | ((response: Response) => void | Promise<void>) | undefined;
    additionalButtons?: Snippet,
    submitButtonText?: string;
    submitButtonClasses?: string,
    submitButtonHidden?: boolean,
    warnOnUnsavedChanges?: boolean,
    children: Snippet;
  } = $props();

  let isSubmitting = $state(false);

  let formState = $state({ errors: {} as Record<string, string> });

  let formWideError = $derived(formState.errors['form']);

  setContext('api-form-context', formState);

  // Set by any input/change event bubbling up from a field inside the form
  let isDirty = $state(false);

  function markDirty() {
    isDirty = true;
  }

  beforeNavigate((navigation) => {
    if (!warnOnUnsavedChanges || !isDirty) {
      return;
    }

    // Leaving the app (reload, closing the tab, external link): cancel() triggers the browser's native dialog
    if (navigation.type === 'leave') {
      navigation.cancel();
      return;
    }

    if (!confirm(m.form_unsaved_changes())) {
      navigation.cancel();
    }
  });

  async function handleSubmit(event: Event) {
    event.preventDefault();
    isSubmitting = true;
    formState.errors = {};

    try {
      const response = await submitAction();

      if (response.ok) {
        isDirty = false;
        addToast({ message: m.form_success() });

        if (typeof onSuccess === 'function') {
          await onSuccess(response);
          await invalidateAll();
        } else if (typeof onSuccess === 'string') {
          // `redirectTo` is typed as ResolvedPathname, so it's fine to navigate without resolve.
          // eslint-disable-next-line svelte/no-navigation-without-resolve
          await goto(onSuccess);
        }

        return;
      }

      const result = await response.json().catch(() => ({}));
      const issues: z.core.$ZodIssue[] | null = result?.error?.message ? JSON.parse(result.error.message) : null;

      if (issues && Array.isArray(issues) && issues.length > 0) {
        const newErrors: Record<string, string> = {};

        issues.map((issue) => {
          const fieldPath = issue.path.join('.');
          newErrors[fieldPath] = translateZodIssue(issue);
        });

        formState.errors = newErrors;
      } else if (response.status === 403) {
        addToast({ title: m.form_error(), message: m.form_error_forbidden(), type: 'error' });
      } else {
        const errorMsg = result.message || result.error || m.form_error_generic();

        addToast({ title: m.form_error(), message: errorMsg, type: 'error' });
      }
    } catch(e) {
      addToast({ title: m.form_error(), message: m.form_error_generic(), type: 'error' });
      throw e;
    } finally {
      isSubmitting = false;
    }
  }
</script>

<form onsubmit={handleSubmit} oninput={markDirty} onchange={markDirty}>
  {#if formWideError}
    <span class="error-text">{formWideError}</span>
  {/if}

  {@render children()}

  {#if additionalButtons}
    {@render additionalButtons()}
  {/if}
  {#if !submitButtonHidden}
    <button class={submitButtonClasses} type="submit" disabled={isSubmitting}>
      {isSubmitting ? m.generic_loading() : submitButtonText}
    </button>
  {/if}
</form>

<style>
    .error-text {
        display: block;
        font-size: 0.85rem;
        font-weight: 500;

        background-color: var(--btn-error-bg);
        color: var(--btn-error-text);
        padding: 0.35rem 0.5rem;
        margin-bottom: 0.25rem;

        border-radius: var(--radius-base, 0.25rem);

        line-height: 1.2;
        animation: fade-in 0.2s ease-out;
    }
</style>