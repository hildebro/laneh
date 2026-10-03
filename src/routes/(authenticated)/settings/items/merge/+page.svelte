<script lang="ts">
  import MergeGroup from './MergeGroup.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();
</script>

{#if data.groups.length === 0}
  <article>{m.settings_items_merge_empty()}</article>
{:else}
  <div class="single-col-wrapper">
    <!-- Keyed by all ids, so a group that changed after a merge starts over with its defaults. -->
    {#each data.groups as group (group.map(item => item.id).join())}
      <MergeGroup items={group} categories={data.categories} />
    {/each}
  </div>
{/if}
