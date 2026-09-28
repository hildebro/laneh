<script lang="ts">
  import { resolve } from '$app/paths';
  import type { BalanceEntry } from '$lib/backend/db/schema';
  import * as m from '$lib/paraglide/messages.js';
  import { dateFormatter, priceFormatter } from '$lib/utils/formatter';

  let { entry }: { entry: BalanceEntry & { user: { username: string } } } = $props();

  const getLabel = (balanceEntry: BalanceEntry) => {
    if (balanceEntry.name) {
      return balanceEntry.name;
    }

    return m.balance_no_name_label();
  };
</script>

<article>
  <div class="action-bar">
    <a role="button" href={resolve('/(authenticated)/balance/[entry]', {entry: entry.id})}>
      {m.generic_edit()}
    </a>
  </div>
  <div>
    {getLabel(entry)}
    <b>{priceFormatter.format(entry.price / 100)}</b>
  </div>
  <span>{entry.user.username}</span>
  <footer>
    <span>{dateFormatter.format(entry.date)}</span>
  </footer>
</article>
