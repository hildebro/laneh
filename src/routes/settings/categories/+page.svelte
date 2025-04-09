<script lang="ts">
  import { ArrowDown, ArrowUp } from 'lucide-svelte';
  import { enhance } from '$app/forms';

  let { data } = $props();
</script>

{#await data.categories}
  loading...
{:then categories}
  <div class="card w-full">
    <div class="flex justify-end mb-4">
      <a class="btn" href="categories/add">New category</a>
    </div>
    <div class="flex flex-col gap-2">
      {#each categories as category}
        <div class="flex justify-between w-full card preset-filled-secondary-200-800">
          <span>{category.name}</span>
          <div class="flex gap-1">
            <a href="categories/{category.id}" class="btn">Edit</a>
            <form method="POST" action="?/up" use:enhance>
              <input type="hidden" name="categoryId" value={category.id}>
              <button type="submit" class="btn">
                <ArrowUp />
              </button>
            </form>
            <form method="POST" action="?/down" use:enhance>
              <input type="hidden" name="categoryId" value={category.id}>
              <button type="submit" class="btn">
                <ArrowDown />
              </button>
            </form>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/await}
