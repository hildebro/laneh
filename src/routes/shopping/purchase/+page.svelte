<script lang="ts">
  import { Circle, CircleCheck, LoaderCircle, RefreshCw } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';
  import { crossfade } from 'svelte/transition';
  import { enhance } from '$app/forms';
  import { beforeNavigate, invalidateAll } from '$app/navigation';
  import * as m from '$lib/paraglide/messages.js';

  const [send, receive] = crossfade({
    duration: (d) => Math.sqrt(d * 200),

    // fallback is used if the item is just appearing/disappearing
    // without moving to another list (e.g. initial load)
    fallback(node, params) {
      const style = getComputedStyle(node);
      const transform = style.transform === 'none' ? '' : style.transform;

      return {
        duration: 800,
        easing: quintOut,
        css: (t) => `
          transform: ${transform} scale(${t});
          opacity: ${t}
        `
      };
    }
  });

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

<div class="action-bar">
  <form method="POST" action="?/commit" use:enhance>
    <button type="submit">{m.shopping_finish_purchase()}</button>
  </form>
</div>
{#each data.unstagedItemsByCategory as category (category.id)}
  <article>
    <h4>{category.name}</h4>
    <div class="item-box">
      {#each category.shoppingItems as item (item.id)}
        {@const isProcessing = !!itemStates[item.id]}
        {@const isRetrying = itemStates[item.id] === 'retrying'}

        <button
          in:receive={{ key: item.id }}
          out:send={{ key: item.id }}
          animate:flip={{ duration: 600 }}
          class="icon-button"
          class:warning={isRetrying}
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
  </article>
{/each}
<article>
  <h4>{ m.shopping_purchase_staged_by_you() }</h4>
  <div class="item-box">
    {#each data.stagedItemsForUser as item (item.id)}
      {@const isProcessing = !!itemStates[item.id]}
      {@const isRetrying = itemStates[item.id] === 'retrying'}

      <button
        in:receive={{ key: item.id }}
        out:send={{ key: item.id }}
        animate:flip={{ duration: 600 }}
        class="icon-button checked-item"
        class:warning={isRetrying}
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
</article>
<article>
  <b>{ m.shopping_purchase_staged_by_others() }</b>
  {#each data.stagedItemsForOtherUsers as item (item.id)}
    <div>
      {item.amount} {item.name}
    </div>
  {/each}
</article>

<style>
    .item-box {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .icon-button {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.25rem;
    }

    .checked-item {
        background-color: var(--disabled-bg);
        color: var(--disabled-text);

        &:hover {
            background-color: var(--disabled-hover);
        }
    }
</style>