<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();
</script>

<div class="action-bar">
  <a href={resolve('/shopping/purchase/list')}>{m.shopping_purchase_list()}</a>
  <button
    disabled={data.hasNoCategories}
    onclick={() => goto(resolve('/shopping/item/add'))}
  >
    {m.shopping_add_items()}
  </button>
  <button
    disabled={data.activeCategories.length === 0}
    onclick={() => goto(resolve('/shopping/purchase'))}
  >
    {m.shopping_start_purchase()}
  </button>
</div>

{#if data.hasNoCategories}
  <article>
    { m.error_shopping_no_categories() }
    <div>
      <a href={resolve('/settings/categories/add')}>
        { m.settings_categories_add() }
      </a>
    </div>
  </article>
{:else if data.activeCategories.length === 0}
  <article>{ m.error_shopping_no_active_categories() }</article>
{/if}
{#each data.activeCategories as category (category.id)}
  <article>
    <b>{category.name}</b>
    <div>
      {#each category.shoppingItems as item (item.id)}
        - {item.amount} {item.name}<br />
      {/each}
    </div>
  </article>
{/each}
