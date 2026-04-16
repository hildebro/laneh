<script lang="ts">
  import { ArrowDown, ArrowUp, Pencil } from 'lucide-svelte';
  import { flip } from 'svelte/animate';
  import { invalidateAll } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  let submitting = $state(false);

  async function submitAction(categoryId: string, direction: 'up' | 'down'): Promise<void> {
    submitting = true;

    const client = getApiClient();
    if (direction === 'up') {
      await client.api.shopping.moveCategoryUp.$post({ json: { categoryId } });
    } else {
      await client.api.shopping.moveCategoryDown.$post({ json: { categoryId } });
    }

    submitting = false;
    await invalidateAll();
  }
</script>

<div class="action-bar">
  <a role="button" href={resolve('/settings/categories/add')}>{ m.settings_categories_add() }</a>
</div>
<div class="single-col-wrapper">
  {#each data.categories as category (category.id)}
    <article animate:flip={{ duration: 200 }}>
      <h2>{category.name}</h2>
      <div class="action-row">
        <a role="button" href={resolve('/(authenticated)/settings/categories/[category]', {category: category.id})}>
          <Pencil />
        </a>
        <button type="button" disabled={submitting} onclick={async () => await submitAction(category.id, 'up')}>
          {#if submitting}
            <LoadingSpinner size={6} bright />
          {:else }
            <ArrowUp />
          {/if}
        </button>
        <button type="button" disabled={submitting} onclick={async () => await submitAction(category.id, 'down')}>
          {#if submitting}
            <LoadingSpinner size={6} bright />
          {:else }
            <ArrowDown />
          {/if}
        </button>
      </div>
    </article>
  {/each}
</div>
