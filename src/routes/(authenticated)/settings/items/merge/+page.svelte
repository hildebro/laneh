<script lang="ts">
  import { getApiClient } from '$lib/apiClient';
  import type { ShoppingItem } from '$lib/backend/db/schema';
  import ItemMerge from '$lib/ItemMerge.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  let dismissing = $state(false);

  const groupKey = (group: ShoppingItem[]) => group.map(item => item.id).join();

  // Merged and dismissed groups are only hidden, since reloading the candidates takes a while.
  let handledKeys = $state<string[]>([]);
  let groups = $derived(data.groups.filter(group => !handledKeys.includes(groupKey(group))));

  async function dismiss(group: ShoppingItem[]) {
    dismissing = true;
    try {
      const client = getApiClient();
      await client.api.shopping.dismissMergeCandidates.$post({ json: { itemIds: group.map(item => item.id) } });
      handledKeys.push(groupKey(group));
    } finally {
      dismissing = false;
    }
  }
</script>

{#if groups.length === 0}
  <article>{m.settings_items_merge_empty()}</article>
{:else}
  <div class="single-col-wrapper">
    <!-- Keyed by all ids, so a group that changed after a merge starts over with its defaults. -->
    {#each groups as group (groupKey(group))}
      <article>
        <ItemMerge
          items={group}
          categories={data.categories}
          allowDeselect
          invalidateOnMerged={false}
          onMerged={() => { handledKeys.push(groupKey(group)); }}
        >
          {#snippet additionalButtons()}
            <button type="button" class="warning" onclick={() => dismiss(group)} disabled={dismissing}>
              {m.settings_items_merge_dismiss()}
            </button>
          {/snippet}
        </ItemMerge>
      </article>
    {/each}
  </div>
{/if}
