<script lang="ts">
  import { enhance } from '$app/forms';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();
</script>

{#await data.categories}
  <LoadingSpinner />
{:then categories}
  <form class="flex flex-col gap-4 items-center h-full w-full" method="POST" use:enhance>
    <button class="btn ml-auto" type="submit">{m.shopping_finish_purchase()}</button>
    {#each categories as category (category.id)}
      <div class="card w-full">
        <b>{category.name}</b>
        <div class="flex flex-col text-base">
          {#each category.shoppingItems as item (item.id)}
            <label class="flex items-center gap-0.5">
              <input type="checkbox" name="items" value={item.id} />
              {item.amount} {item.name}
            </label>
          {/each}
        </div>
      </div>
    {/each}
  </form>
{/await}
