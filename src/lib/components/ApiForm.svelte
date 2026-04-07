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
        // Parse the error payload
        const result = await response.json().catch(() => ({}));

        // Hono's default Zod validator format returns { success: false, error: { issues: [...] } }
        const isHonoZodError = result.success === false && result.error?.issues;

        if (isHonoZodError) {
          const formattedIssues = result.error.issues.map((issue: z.core.$ZodIssue) => {
            const path = transPath(issue.path.join('.'));
            return `${path}: ${issue.message}`;
          }).join('\n');

          addToast({ title: m.form_invalid(), message: formattedIssues, type: 'error' });
        } else {
          // Generic API error (e.g., 500 internal server error or a non-validation 400)
          const errorMsg = result.message || 'Failed to save data. Please try again.';
          addToast({ title: 'Error', message: errorMsg, type: 'error' });
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