<script lang="ts">
  import { ArrowDown, ArrowUp, Pencil } from 'lucide-svelte';
  import { flip } from 'svelte/animate';
  import { enhance } from '$app/forms';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();
</script>

{#await data.categories}
  <LoadingSpinner />
{:then categories}
  <div class="card w-full">
    <div class="flex justify-end mb-4">
      <a class="btn" href="categories/add">{ m.settings_categories_add() }</a>
    </div>
    <div class="flex flex-col gap-2">
      {#each categories as category, index (category.id)}
        <div
          class="flex justify-between w-full card preset-filled-secondary-200-800"
          animate:flip={{ duration: 200 }}
        >
          <span>{category.name}</span>
          <div class="flex gap-1">
            <a href="categories/{category.id}" class="btn">
              <Pencil />
            </a>
            <form method="POST" action="?/up" use:enhance>
              <input type="hidden" name="categoryId" value={category.id} />
              <button type="submit" class="btn" disabled={index === 0}>
                <ArrowUp />
              </button>
            </form>
            <form method="POST" action="?/down" use:enhance>
              <input type="hidden" name="categoryId" value={category.id} />
              <button type="submit" class="btn" disabled={index === categories.length - 1}>
                <ArrowDown />
              </button>
            </form>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/await}
