<script lang="ts">
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  const priceFormatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  });

  let lastPurchaseDate = $derived(
    !data.last_purchase_date
      ? null
      : new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(data.last_purchase_date)
  );
</script>

<article>
  <h2>{ m.header_shopping() }</h2>
  <p>
    { m.dashboard_shopping_count({ count: data.shopping_item_count }) }
  </p>
  {#if lastPurchaseDate}
    <p>
      { m.dashboard_shopping_last_purchase({ date: lastPurchaseDate }) }
    </p>
  {/if}
  <footer>
    <a role="button" href={resolve('/shopping/item/add')}>{m.shopping_add_items()}</a>
    <a role="button" href={resolve('/shopping/purchase')}>{m.shopping_start_purchase()}</a>
  </footer>
</article>

<article>
  <h2>{ m.header_schedule() }</h2>
  <p>{ m.dashboard_schedule_count({ count: data.due_task_count }) }</p>
  <footer>
    <a role="button" href={resolve('/schedule')}>{ m.dashboard_schedule_go_to() }</a>
  </footer>
</article>

<article>
  <h2>{ m.balance() }</h2>
  {#if data.userDebts.length === 0}
    <p>{ m.balance_none() }</p>
  {:else }
    {#each data.userDebts as userDebt (userDebt.creditor.id)}
      <div>
        <h4>{m.balance_owed({ user: userDebt.creditor.username })}</h4>
        <ul>
          {#each userDebt.debtorData as debtorEntry (debtorEntry.debtor.id)}
            <li>
              {m.balance_owed_debtor({
                amount: priceFormatter.format(debtorEntry.amount / 100),
                debtor: debtorEntry.debtor.username
              })}
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  {/if}
  <footer>
    <a role="button" href={resolve('/schedule')}>{ m.dashboard_balance_go_to() }</a>
  </footer>
</article>
