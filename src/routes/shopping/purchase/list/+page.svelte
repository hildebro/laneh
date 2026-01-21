<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  const dateFormatter = new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
</script>

{#each data.purchases as purchase (purchase.id)}
  <div class="card flex flex-col gap-0.5">
    <span>
      { m.shopping_purchase_list_entry({ user: purchase.user.username, count: purchase.shoppingItems.length }) }
    </span>
    <span class="text-primary-900-100">{dateFormatter.format(purchase.date)}</span>
  </div>
{/each}