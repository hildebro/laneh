<script lang="ts">
  import ExpenseEntry from './ExpenseEntry.svelte';
  import MonthExpensesChart from './MonthExpensesChart.svelte';
  import MonthlyExpensesChart from './MonthlyExpensesChart.svelte';
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';
  import { priceFormatter } from '$lib/utils/formatter';

  let { data } = $props();

  // The overview only loads aggregates, the full history lives on the list page. The last month is the current one.
  const monthTotals = $derived(data.monthlyTotals.at(-1)?.totals ?? []);
</script>

<div class="action-bar">
  <a href={resolve('/balance/list')}>{ m.balance_expenses_all() }</a>
  <a role="button" href={resolve('/balance/add')}>{ m.balance_expense_add() }</a>
</div>

{#if data.showDebts}
  <article>
    <h2>{m.balance()}</h2>
    {#if data.userDebts.length === 0}
      <p>{ m.balance_none() }</p>
    {/if}
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
  </article>
{/if}

<article>
  <h2>{m.balance_month_total()}</h2>
  <MonthExpensesChart totals={monthTotals} label={m.balance_month_total()} />
</article>

<article>
  <h2>{m.balance_monthly_history()}</h2>
  <MonthlyExpensesChart months={data.monthlyTotals} />
</article>

<h2 class="headline">{ m.balance_expenses_recent() }</h2>
{#if data.recentEntries.length === 0}
  <p class="headline">{ m.balance_expenses_recent_none() }</p>
{/if}
{#each data.recentEntries as entry (entry.id)}
  <ExpenseEntry {entry} />
{/each}

<style>
    /* Set on the cards, so the charts inside share one palette without an extra wrapper that would break the card layout. */
    article {
        --series-1: #2a78d6;
        --series-2: #eb6834;
        --series-3: #1baf7a;
        --series-4: #eda100;
        --series-5: #e87ba4;
        --series-6: #008300;
        --series-7: #6250d6;
    }

    :global(:root[data-color-scheme="dark"]) article {
        --series-1: #3987e5;
        --series-2: #d95926;
        --series-3: #199e70;
        --series-4: #c98500;
        --series-5: #d55181;
        --series-6: #008300;
        --series-7: #9085e9;
    }
</style>
