<script lang="ts">
  import { Circle, CircleCheck, LoaderCircle, RefreshCw } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { enhance } from '$app/forms';
  import { beforeNavigate, invalidateAll } from '$app/navigation';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  const isUnchecked = (itemId: string) => {
    return data.unstagedItemsByCategory.some((category) => category.shoppingItems.some(item => item.id === itemId));
  };

  // Track local state for items: 'loading' | 'retrying' | undefined
  let itemStates = $state<Record<string, 'loading' | 'retrying'>>({});
  let isDirty = $derived(Object.keys(itemStates).length > 0);

  const stageItem = async (itemId: string) => {
    const target = isUnchecked(itemId)
      ? '?/stage'
      : '?/unstage';

    itemStates[itemId] = 'loading';

    await sendStagingRequest(itemId, target);
  };

  const sendStagingRequest = async (itemId: string, target: string) => {
    const formData = new FormData();
    formData.append('itemId', itemId);

    try {
      const response = await fetch(target, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        await invalidateAll();
        delete itemStates[itemId];
      } else {
        itemStates[itemId] = 'retrying';

        // Retry after 3 seconds
        setTimeout(() => {
          sendStagingRequest(itemId, target);
        }, 3000);
      }
    } catch {
      itemStates[itemId] = 'retrying';

      // Retry after 3 seconds
      setTimeout(() => {
        sendStagingRequest(itemId, target);
      }, 3000);
    }
  };

  onMount(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        // Standard browsers requirereturnValue to be set
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  });

  beforeNavigate(({ cancel }) => {
    if (isDirty) {
      const confirmLeave = confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) {
        cancel();
      }
    }
  });
</script>

<form class="ml-auto" method="POST" action="?/commit" use:enhance>
  <button class="btn" type="submit">{m.shopping_finish_purchase()}</button>
</form>
{#each data.unstagedItemsByCategory as category (category.id)}
  <div class="card w-full mt-2">
    <b>{category.name}</b>
    <div class="flex flex-col text-base gap-1">
      {#each category.shoppingItems as item (item.id)}
        {@const isProcessing = !!itemStates[item.id]}
        {@const isRetrying = itemStates[item.id] === 'retrying'}

        <button
          class="card flex flex-row gap-1 items-center transition-colors duration-200"
          class:preset-filled-warning-500={isRetrying}
          disabled={isProcessing}
          onclick={() => stageItem(item.id)}
        >
          {#if isRetrying}
            <RefreshCw class="animate-spin" size={20} />
          {:else if isProcessing}
            <LoaderCircle class="animate-spin" size={20} />
          {:else }
            <Circle size={20} />
          {/if}

          <span>{item.amount} {item.name}</span>
        </button>
      {/each}
    </div>
  </div>
{/each}
{#each data.stagedItemsForUser as category (category.id)}
  <div class="card w-full mt-2">
    <b>{category.name}</b>
    <div class="flex flex-col text-base gap-1">
      {#each category.shoppingItems as item (item.id)}
        {@const isProcessing = !!itemStates[item.id]}
        {@const isRetrying = itemStates[item.id] === 'retrying'}

        <button
          class="card flex flex-row gap-1 items-center transition-colors duration-200"
          class:preset-filled-surface-500={!isProcessing}
          class:preset-filled-warning-500={isRetrying}
          disabled={isProcessing}
          onclick={() => stageItem(item.id)}
        >
          {#if isRetrying}
            <RefreshCw class="animate-spin" size={20} />
          {:else if isProcessing}
            <LoaderCircle class="animate-spin" size={20} />
          {:else }
            <CircleCheck size={20} />
          {/if}

          <span>{item.amount} {item.name}</span>
        </button>
      {/each}
    </div>
  </div>
{/each}
{#each data.stagedItemsForOtherUser as category (category.id)}
  <div class="card w-full mt-2">
    <b>{category.name}</b>
    <div class="flex flex-col text-base gap-1">
      {#each category.shoppingItems as item (item.id)}
        <button
          class="flex flex-row gap-1 items-center transition-colors duration-200"
          disabled
        >
          <span>{item.amount} {item.name}</span>
        </button>
      {/each}
    </div>
  </div>
{/each}
