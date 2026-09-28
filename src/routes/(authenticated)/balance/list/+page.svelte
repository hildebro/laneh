<script lang="ts">
  import ExpenseEntry from '../ExpenseEntry.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();
</script>

<h2 class="headline">{ m.balance_expenses_all() }</h2>
{#each data.entries as entry (entry.id)}
  <ExpenseEntry {entry} />
{/each}
