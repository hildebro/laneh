<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { getApiClient } from '$lib/apiClient';
  import type { ShoppingItem } from '$lib/backend/db/schema';
  import ItemMerge from '$lib/ItemMerge.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  let dismissing = $state(false);

  async function dismiss(group: ShoppingItem[]) {
    dismissing = true;
    try {
      const client = getApiClient();
      await client.api.shopping.dismissMergeCandidates.$post({ json: { itemIds: group.map(item => item.id) } });
      await invalidateAll();
    } finally {
      dismissing = false;
    }
  }
</script>

{#if data.groups.length === 0}
  <article>{m.settings_items_merge_empty()}</article>
{:else}
  <div class="single-col-wrapper">
    <!-- Keyed by all ids, so a group that changed after a merge starts over with its defaults. -->
    {#each data.groups as group (group.map(item => item.id).join())}
      <article>
        <ItemMerge items={group} categories={data.categories} allowDeselect>
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
