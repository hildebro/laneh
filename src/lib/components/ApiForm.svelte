<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { z } from 'zod';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';
  import { transPath } from '$lib/path-translations';
  import { addToast } from '$lib/stores/toast';

  let {
    submitAction,
    redirectTo,
    children
  }: {
    submitAction: () => Promise<Response>;
    redirectTo: string;
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
        goto(resolve(redirectTo));
      } else {
        const result = await response.json().catch(() => ({}));
        let issues: z.core.$ZodIssue[] | null = null;

        // Check for Hono's default unhooked ZodError (where issues are stringified in the message)
        if (result.success === false && result.error?.name === 'ZodError' && typeof result.error.message === 'string') {
          try {
            issues = JSON.parse(result.error.message);
          } catch (e) {
            console.error('Failed to parse ZodError string:', e);
          }
        } 
        // Fallback just in case you ever pass actual arrays (e.g. { error: { issues: [...] } })
        else if (result.success === false && Array.isArray(result.error?.issues)) {
          issues = result.error.issues;
        }

        if (issues && Array.isArray(issues) && issues.length > 0) {
          const formattedIssues = issues.map((issue) => {
            const path = transPath(issue.path.join('.'));
            return `${path}: ${issue.message}`;
          }).join('\n');

          addToast({ title: m.form_invalid(), message: formattedIssues, type: 'error' });
        } else {
          // Generic API error (e.g., 500 internal server error)
          const errorMsg = result.message || result.error || 'Failed to save data. Please try again.';
          addToast({ title: 'Error', message: typeof errorMsg === 'string' ? errorMsg : 'Unknown error', type: 'error' });
          console.error('API Error:', result);
        }
      }
    } catch (err) {
      addToast({ title: 'Error', message: 'An unexpected error occurred.', type: 'error' });
      console.error('Network or parsing error:', err);
    } finally {
      isSubmitting = false;
    }
  }
</script>

<form onsubmit={handleSubmit}>
  {@render children()}

  <button type="submit" disabled={isSubmitting}>
    {isSubmitting ? 'Saving...' : 'Save'}
  </button>
</form>