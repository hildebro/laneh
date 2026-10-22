<script lang="ts">
  import { expenseTypeColors } from './expenseTypeColors';
  import * as m from '$lib/paraglide/messages.js';
  import type { BalanceEntryType } from '$lib/utils/balanceHelper';
  import { translateBalanceEntryType } from '$lib/utils/balanceTranslations';
  import { priceFormatter } from '$lib/utils/formatter';

  let { months }: {
    // Ordered from the oldest to the newest month. The month is formatted as YYYY-MM.
    months: { month: string, totals: { type: BalanceEntryType, amount: number }[] }[]
  } = $props();

  const width = 320;
  const height = 180;
  const padding = { top: 12, right: 12, bottom: 24, left: 44 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const monthFormatter = new Intl.DateTimeFormat(undefined, { month: 'short' });
  const monthLabel = (month: string) => {
    const [year, number] = month.split('-').map(Number);
    return monthFormatter.format(new Date(year!, number! - 1, 1));
  };

  const series = $derived.by(() => {
    const types: Partial<Record<BalanceEntryType, number[]>> = {};
    months.forEach(({ totals }, index) => {
      for (const { type, amount } of totals) {
        types[type] ??= months.map(() => 0);
        types[type][index] = amount;
      }
    });

    return (Object.entries(types) as [BalanceEntryType, number[]][])
      .map(([type, amounts]) => ({ type, amounts }))
      .filter(({ amounts }) => amounts.some(amount => amount > 0))
      .sort((a, b) => Math.max(...b.amounts) - Math.max(...a.amounts));
  });

  // A "nice" upper bound, so the grid lines land on round numbers.
  const maxAmount = $derived.by(() => {
    const max = Math.max(1, ...series.flatMap(({ amounts }) => amounts));
    const magnitude = 10 ** Math.floor(Math.log10(max));
    return Math.ceil(max / magnitude * 2) / 2 * magnitude;
  });

  const gridValues = $derived([0, 0.5, 1].map(fraction => fraction * maxAmount));

  const x = (index: number) => padding.left + (months.length > 1 ? index / (months.length - 1) * plotWidth : plotWidth / 2);
  const y = (amount: number) => padding.top + plotHeight - amount / maxAmount * plotHeight;

  const compactFormatter = new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 });
</script>

<div class="monthly-expenses">
  <svg viewBox="0 0 {width} {height}" role="img" aria-label={m.balance_monthly_history()}>
    {#each gridValues as value (value)}
      <line class="grid" x1={padding.left} x2={width - padding.right} y1={y(value)} y2={y(value)} />
      <text class="axis" x={padding.left - 6} y={y(value)} text-anchor="end" dominant-baseline="central">
        {compactFormatter.format(value / 100)}
      </text>
    {/each}
    {#each months as { month }, index (month)}
      <text class="axis" x={x(index)} y={height - 6} text-anchor="middle">{monthLabel(month)}</text>
    {/each}
    {#each series as { type, amounts } (type)}
      <g data-type={type} style:color="var(--series-{expenseTypeColors[type]})">
        <polyline points={amounts.map((amount, index) => `${x(index)},${y(amount)}`).join(' ')} />
        {#each amounts as amount, index (index)}
          <circle cx={x(index)} cy={y(amount)} r="3">
            <title>{translateBalanceEntryType(type)}, {monthLabel(months[index]!.month)}: {priceFormatter.format(amount / 100)}</title>
          </circle>
        {/each}
      </g>
    {/each}
  </svg>

  {#if series.length > 0}
    <ul class="legend">
      {#each series as { type } (type)}
        <li data-type={type}>
          <span class="swatch" style:background-color="var(--series-{expenseTypeColors[type]})"></span>
          {translateBalanceEntryType(type)}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
    .monthly-expenses {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    svg {
        width: 100%;
        max-width: 28rem;
    }

    .grid {
        stroke: var(--border-main);
        stroke-width: 1;
    }

    .axis {
        fill: var(--text-muted);
        font-size: 10px;
    }

    polyline {
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linejoin: round;
        stroke-linecap: round;
    }

    circle {
        fill: currentColor;
        stroke: var(--bg-surface);
        stroke-width: 1.5;
    }

    .legend {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.25rem 1rem;
    }

    .legend li {
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }

    .swatch {
        width: 0.75rem;
        height: 0.75rem;
        border-radius: 2px;
    }

    g,
    .legend li {
        transition: opacity 0.15s;
    }

    /* Hovering a line or legend row fades out the other types. CSS can't compare attribute values, so every type
       needs its own selector. */
    .monthly-expenses:has([data-type="groceries"]:hover) [data-type]:not([data-type="groceries"]),
    .monthly-expenses:has([data-type="eating_out"]:hover) [data-type]:not([data-type="eating_out"]),
    .monthly-expenses:has([data-type="household_goods"]:hover) [data-type]:not([data-type="household_goods"]),
    .monthly-expenses:has([data-type="transportation"]:hover) [data-type]:not([data-type="transportation"]),
    .monthly-expenses:has([data-type="events"]:hover) [data-type]:not([data-type="events"]),
    .monthly-expenses:has([data-type="gifts"]:hover) [data-type]:not([data-type="gifts"]),
    .monthly-expenses:has([data-type="miscellaneous"]:hover) [data-type]:not([data-type="miscellaneous"]) {
        opacity: 0.35;
    }
</style>
