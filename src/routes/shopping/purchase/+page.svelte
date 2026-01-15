<script lang="ts">
  import { Circle, CircleCheck } from 'lucide-svelte';
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  let stagedItems = $derived(data.stagedItems);
  let checkedItems = $derived(stagedItems.map(stagedItem => stagedItem.itemId));
  let checkedByOtherUser = $derived(
    stagedItems
      .filter(stagedItem => stagedItem.userId !== data.user?.id)
      .map(stagedItem => stagedItem.itemId)
  );
  let checkedByThisUser = $derived(
    stagedItems
      .filter(stagedItem => stagedItem.userId === data.user?.id)
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
  <form class="ml-auto" method="POST" action="?/commit" use:enhance>
    <button class="btn" type="submit">{m.shopping_finish_purchase()}</button>
  </form>
  {#each categories as category (category.id)}
    <div class="card w-full mt-2">
      <b>{category.name}</b>
      <div class="flex flex-col text-base gap-1">
        {#each category.shoppingItems as item (item.id)}
          <button class="card flex flex-row gap-1"
                  class:card={!checkedByOtherUser.includes(item.id)}
                  class:preset-filled-surface-500={checkedByThisUser.includes(item.id)}
                  disabled={checkedByOtherUser.includes(item.id)}
                  onclick={() => stageItem(item.id)}>
            {#if checkedItems.includes(item.id)}
              <CircleCheck />
            {:else }
              <Circle />
            {/if}
            {item.amount} {item.name}
          </button>
        {/each}
      </div>
    </div>
  {/each}
{/await}
