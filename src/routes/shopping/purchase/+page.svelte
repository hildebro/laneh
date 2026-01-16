<script lang="ts">
  import { Circle, CircleCheck, LoaderCircle, RefreshCw } from 'lucide-svelte';
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

  // Track local state for items: 'loading' | 'retrying' | undefined
  let itemStates = $state<Record<string, 'loading' | 'retrying'>>({});

  const stageItem = async (itemId: string) => {
    itemStates[itemId] = 'loading';

    await performRequest(itemId);
  };

  const performRequest = async (itemId: string) => {
    const formData = new FormData();
    formData.append('itemId', itemId);

    try {
      const response = await fetch('?/stage', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        itemStates[itemId] = 'retrying';

        // Retry after 3 seconds
        setTimeout(() => {
          performRequest(itemId);
        }, 3000);
      }

      await invalidateAll();
      delete itemStates[itemId];
    } catch (error) {
      itemStates[itemId] = 'retrying';

      // Retry after 3 seconds
      setTimeout(() => {
        performRequest(itemId);
      }, 3000);
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
          {@const isProcessing = !!itemStates[item.id]}
          {@const isRetrying = itemStates[item.id] === 'retrying'}
          {@const isChecked = checkedItems.includes(item.id)}
          {@const isCheckedByOtherUser = checkedByOtherUser.includes(item.id)}
          {@const isCheckedByThisUser = checkedByThisUser.includes(item.id)}

          <button
            class="card flex flex-row gap-1 items-center transition-colors duration-200"
            class:card={!isCheckedByOtherUser}
            class:preset-filled-surface-500={isCheckedByThisUser && !isProcessing}
            class:preset-filled-warning-500={isRetrying}
            disabled={isProcessing || isCheckedByOtherUser}
            onclick={() => stageItem(item.id)}
          >
            {#if isRetrying}
              <RefreshCw class="animate-spin" size={20} />
            {:else if isProcessing}
              <LoaderCircle class="animate-spin" size={20} />
            {:else if isChecked}
              <CircleCheck size={20} />
            {:else }
              <Circle size={20} />
            {/if}

            <span>{item.amount} {item.name}</span>
          </button>
        {/each}
      </div>
    </div>
  {/each}
{/await}