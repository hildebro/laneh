<script lang="ts">
  import { ArrowDown, ArrowUp } from 'lucide-svelte';
  import { enhance } from '$app/forms';

  let { data } = $props();
</script>

{#await data.categories}
  loading...
{:then categories}
  <div class="flex flex-col gap-2 w-full">
    {#each categories as category}
      <div class="flex justify-between w-full card preset-filled-secondary-200-800">
        <span>{category.name}</span>
        <div class="flex gap-1">
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
{/await}
