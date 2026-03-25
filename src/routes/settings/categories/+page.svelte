<script lang="ts">
  import type { ActionResult } from '@sveltejs/kit';
  import { ArrowDown, ArrowUp, Pencil } from 'lucide-svelte';
  import { flip } from 'svelte/animate';
  import { z } from 'zod/v4';
  import { enhance } from '$app/forms';
  import { resolve } from '$app/paths';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { transPath } from '$lib/path-translations';
  import { addToast } from '$lib/stores/toast';

  let { data } = $props();

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

      addToast({ title: m.form_invalid(), message: formattedIssues, type: 'error', duration: 5000 });
    }

    submitting = false;

    // Reset form only on failure or error
    await update({ reset: result.type !== 'success' });
  };
</script>

{#await data.categories}
  <article>
    <LoadingSpinner />
  </article>
{:then categories}
  <div class="action-bar">
    <a role="button" href={resolve('/settings/categories/add')}>{ m.settings_categories_add() }</a>
  </div>
  {#each categories as category, index (category.id)}
    <article animate:flip={{ duration: 200 }}>
      <h2>{category.name}</h2>
      <div class="action-row">
        <a role="button" href={resolve('/settings/categories/[category]', {category: category.id})}>
          <Pencil />
        </a>
        <form method="POST" action="?/up" use:enhance={handleFormSubmit}>
          <input type="hidden" name="id" value={category.id} />
          <button type="submit" disabled={submitting || index === 0}>
            {#if submitting}
              <LoadingSpinner size={6} bright />
            {:else }
              <ArrowUp />
            {/if}
          </button>
        </form>
        <form method="POST" action="?/down" use:enhance={handleFormSubmit}>
          <input type="hidden" name="id" value={category.id} />
          <button type="submit" disabled={submitting || index === categories.length - 1}>
            {#if submitting}
              <LoadingSpinner size={6} bright />
            {:else }
              <ArrowDown />
            {/if}
          </button>
        </form>
      </div>
    </article>
  {/each}
{/await}
