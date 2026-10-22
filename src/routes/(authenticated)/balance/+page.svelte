<script lang="ts">
  import ExpenseEntry from './ExpenseEntry.svelte';
  import MonthExpensesChart from './MonthExpensesChart.svelte';
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';
  import { priceFormatter } from '$lib/utils/formatter';

  let { data } = $props();

  // The overview only loads aggregates, the full history lives on the list page. The totals are the six months before
  // the current one, followed by the current month.
  const totalsOfMonths = (from: number, to: number) => data.monthlyTotals.slice(from, to).flat();

  // Only completed months count for the last month and the averages, so the running month doesn't skew them.
  const monthTotals = $derived(totalsOfMonths(6, 7));
  const lastMonthTotals = $derived(totalsOfMonths(5, 6));
  const last3MonthsTotals = $derived(totalsOfMonths(3, 6));
  const last6MonthsTotals = $derived(totalsOfMonths(0, 6));
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
  <h2>{m.balance_last_month_total()}</h2>
  <MonthExpensesChart totals={lastMonthTotals} label={m.balance_last_month_total()} />
</article>

<article>
  <h2>{m.balance_average_3_months()}</h2>
  <MonthExpensesChart totals={last3MonthsTotals} months={3} label={m.balance_average_3_months()} />
</article>

<article>
  <h2>{m.balance_average_6_months()}</h2>
  <MonthExpensesChart totals={last6MonthsTotals} months={6} label={m.balance_average_6_months()} />
</article>

<h2 class="headline">{ m.balance_expenses_recent() }</h2>
{#if data.recentEntries.length === 0}
  <p class="headline">{ m.balance_expenses_recent_none() }</p>
{/if}
{#each data.recentEntries as entry (entry.id)}
  <ExpenseEntry {entry} />
{/each}
