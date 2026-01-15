<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  let stagedItems = $state(data.stagedItems);
  let checkedItems = $derived(stagedItems.map(stagedItem => stagedItem.itemId));
  let checkedByOtherUser = $derived(
    stagedItems
      .filter(stagedItem => stagedItem.userId !== data.user?.id)
      .map(stagedItem => stagedItem.itemId)
  );

  const stageItem = async (itemId: string) => {
    const formData = new FormData();
    formData.append('itemId', itemId);

    try {
      // Use a consistent upload endpoint, or pass this as a prop if they strictly differ
      // Assuming your backend can handle the context based on route or session
      const response = await fetch('?/stage', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        await invalidateAll();
      } else {
        // uploadError = response.statusText
      }
    } catch (error) {
      // uploadError = error as string
    } finally {
      // uploading = false
    }
  };
</script>

{#await data.categories}
  <LoadingSpinner />
{:then categories}
  <form class="flex flex-col gap-4 items-center h-full w-full" method="POST" action="?/commit" use:enhance>
    <button class="btn ml-auto" type="submit">{m.shopping_finish_purchase()}</button>
    {#each categories as category (category.id)}
      <div class="card w-full">
        <b>{category.name}</b>
        <div class="flex flex-col text-base">
          {#each category.shoppingItems as item (item.id)}
            <label class="flex items-center gap-0.5">
              <input type="checkbox" name="items" value={item.id} bind:group={checkedItems}
                     onclick={() => stageItem(item.id)} disabled={checkedByOtherUser.includes(item.id)}
              />
              {item.amount} {item.name}
            </label>
          {/each}
        </div>
      </div>
    {/each}
  </form>
{/await}
