<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { z } from 'zod';
  import { goto, invalidateAll } from '$app/navigation';
  import type { ResolvedPathname } from '$app/types';
  import * as m from '$lib/paraglide/messages.js';
  import { addToast } from '$lib/stores/toast';

  let {
    submitAction,
    onSuccess = undefined,
    additionalButtons = undefined,
    submitButtonText = m.generic_save(),
    submitButtonClasses = '',
    submitButtonHidden = false,
    children
  }: {
    submitAction: () => Promise<Response>;
    onSuccess?: ResolvedPathname | ((response: Response) => void) | undefined;
    additionalButtons?: Snippet,
    submitButtonText?: string;
    submitButtonClasses?: string,
    submitButtonHidden?: boolean,
    children: Snippet;
  } = $props();

  let isSubmitting = $state(false);

  let formState = $state({ errors: {} as Record<string, string> });

  let formWideError = $derived(formState.errors['form']);

  setContext('api-form-context', formState);

  async function handleSubmit(event: Event) {
    event.preventDefault();
    isSubmitting = true;
    formState.errors = {};

    try {
      const response = await submitAction();

      if (response.ok) {
        addToast({ message: m.form_success() });

        if (typeof onSuccess === 'function') {
          onSuccess(response);
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
          newErrors[fieldPath] = issue.message;
        });

        formState.errors = newErrors;
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