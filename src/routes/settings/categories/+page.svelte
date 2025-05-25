<script lang="ts">
  import type { ActionResult } from '@sveltejs/kit';
  import { ArrowDown, ArrowUp, Pencil } from 'lucide-svelte';
  import { flip } from 'svelte/animate';
  import { z } from 'zod/v4';
  import { enhance } from '$app/forms';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { transPath } from '$lib/path-translations';
  import { toaster } from '$lib/toaster-ref';

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

      toaster.error({ title: m.form_invalid(), description: formattedIssues, duration: 5000 });
    }

    submitting = false;

    // Reset form only on failure or error
    await update({ reset: result.type !== 'success' });
  };
</script>

{#await data.categories}
  <LoadingSpinner />
{:then categories}
  <div class="w-full">
    <div class="flex justify-end mb-4">
      <a class="btn" href="categories/add">{ m.settings_categories_add() }</a>
    </div>
    <div class="flex flex-col gap-2">
      {#each categories as category, index (category.id)}
        <div
          class="flex justify-between w-full card"
          animate:flip={{ duration: 200 }}
        >
          <span>{category.name}</span>
          <div class="flex gap-1">
            <a href="categories/{category.id}" class="btn">
              <Pencil />
            </a>
            <form method="POST" action="?/up" use:enhance={handleFormSubmit}>
              <input type="hidden" name="id" value={category.id} />
              <button type="submit" class="btn h-full" disabled={submitting || index === 0}>
                {#if submitting}
                  <LoadingSpinner size={6} bright />
                {:else }
                  <ArrowUp />
                {/if}
              </button>
            </form>
            <form method="POST" action="?/down" use:enhance={handleFormSubmit}>
              <input type="hidden" name="id" value={category.id} />
              <button type="submit" class="btn h-full" disabled={submitting || index === categories.length - 1}>
                {#if submitting}
                  <LoadingSpinner size={6} bright />
                {:else }
                  <ArrowDown />
                {/if}
              </button>
            </form>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/await}
