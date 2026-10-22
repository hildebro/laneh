<script lang="ts">
  import { expenseTypeColors } from './expenseTypeColors';
  import type { BalanceEntryType } from '$lib/utils/balanceHelper';
  import { translateBalanceEntryType } from '$lib/utils/balanceTranslations';
  import { priceFormatter } from '$lib/utils/formatter';

  let { totals, label }: {
    // Summed up prices per type.
    totals: { type: BalanceEntryType, amount: number }[],
    label: string
  } = $props();

  const radius = 80;
  const innerRadius = 52;

  const total = $derived(totals.reduce((sum, entry) => sum + entry.amount, 0));

  const slices = $derived.by(() => {
    const sums: Partial<Record<BalanceEntryType, number>> = {};
    for (const entry of totals) {
      sums[entry.type] = (sums[entry.type] ?? 0) + entry.amount;
    }

    const positiveSums = (Object.entries(sums) as [BalanceEntryType, number][])
      .filter(([, amount]) => amount > 0)
      .sort((a, b) => b[1] - a[1]);
    const positiveTotal = positiveSums.reduce((sum, [, amount]) => sum + amount, 0);

    let startAngle = 0;
    return positiveSums
      .map(([type, amount]) => {
        const share = amount / positiveTotal;
        const slice = { type, amount, share, startAngle, endAngle: startAngle + share * 2 * Math.PI };
        startAngle = slice.endAngle;
        return slice;
      });
  });

  const point = (r: number, angle: number) => {
    // Angles start at 12 o'clock and run clockwise.
    return `${r * Math.sin(angle)} ${-r * Math.cos(angle)}`;
  };

  const arcPath = (startAngle: number, endAngle: number): string => {
    // A full circle can't be drawn as a single arc, so it's split in two halves.
    if (endAngle - startAngle >= 2 * Math.PI - 1e-6) {
      return `${arcPath(0, Math.PI)} ${arcPath(Math.PI, 2 * Math.PI)}`;
    }

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return [
      `M ${point(radius, startAngle)}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${point(radius, endAngle)}`,
      `L ${point(innerRadius, endAngle)}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${point(innerRadius, startAngle)}`,
      'Z'
    ].join(' ');
  };

  const percentFormatter = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 0 });

  const describe = (slice: { type: BalanceEntryType, amount: number, share: number }) => {
    return `${translateBalanceEntryType(slice.type)}: ${priceFormatter.format(slice.amount / 100)} (${percentFormatter.format(slice.share)})`;
  };
</script>

<div class="month-expenses">
  <svg viewBox="-82 -82 164 164" role="img" aria-label={label}>
    {#if slices.length === 0}
      <path class="empty" d={arcPath(0, 2 * Math.PI)} />
    {/if}
    {#each slices as slice (slice.type)}
      <path
        data-type={slice.type}
        d={arcPath(slice.startAngle, slice.endAngle)}
        style:fill="var(--series-{expenseTypeColors[slice.type]})"
        style:stroke-width={slices.length === 1 ? 0 : null}
      >
        <title>{describe(slice)}</title>
      </path>
    {/each}
    <text class="total" text-anchor="middle" dominant-baseline="central">
      {priceFormatter.format(total / 100)}
    </text>
  </svg>

  {#if slices.length > 0}
    <ul class="legend">
      {#each slices as slice (slice.type)}
        <li data-type={slice.type}>
          <span class="swatch" style:background-color="var(--series-{expenseTypeColors[slice.type]})"></span>
          <span class="label">{translateBalanceEntryType(slice.type)}</span>
          <span class="amount">{priceFormatter.format(slice.amount / 100)}</span>
          <span class="share">{percentFormatter.format(slice.share)}</span>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
    .month-expenses {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    svg {
        width: 11rem;
        height: 11rem;
    }

    path {
        /* Draws a thin gap between neighbouring slices. */
        stroke: var(--bg-surface);
        stroke-width: 2;
        stroke-linejoin: round;
    }

    path.empty {
        fill: var(--border-main);
    }

    .total {
        fill: var(--text-main);
        font-size: 1.1rem;
        font-weight: bold;
    }

    .legend {
        list-style: none;
        width: 100%;
        display: grid;
        grid-template-columns: auto 1fr auto auto;
        column-gap: 0.75rem;
        row-gap: 0.25rem;
    }

    .legend li {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: subgrid;
    }

    .swatch {
        width: 0.75rem;
        height: 0.75rem;
        border-radius: 2px;
        align-self: center;
    }

    .amount,
    .share {
        text-align: right;
        font-variant-numeric: tabular-nums;
    }

    .share {
        color: var(--text-muted);
    }

    path,
    .legend li {
        transition: opacity 0.15s;
    }

    /* Hovering a slice or legend row fades out the other types in both. CSS can't compare
       attribute values, so every type needs its own selector. */
    .month-expenses:has([data-type="groceries"]:hover) [data-type]:not([data-type="groceries"]),
    .month-expenses:has([data-type="eating_out"]:hover) [data-type]:not([data-type="eating_out"]),
    .month-expenses:has([data-type="household_goods"]:hover) [data-type]:not([data-type="household_goods"]),
    .month-expenses:has([data-type="transportation"]:hover) [data-type]:not([data-type="transportation"]),
    .month-expenses:has([data-type="events"]:hover) [data-type]:not([data-type="events"]),
    .month-expenses:has([data-type="gifts"]:hover) [data-type]:not([data-type="gifts"]),
    .month-expenses:has([data-type="miscellaneous"]:hover) [data-type]:not([data-type="miscellaneous"]) {
        opacity: 0.35;
    }
</style>
