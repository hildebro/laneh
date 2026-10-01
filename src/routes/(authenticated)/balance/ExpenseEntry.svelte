<script lang="ts">
  import { resolve } from '$app/paths';
  import type { BalanceEntry } from '$lib/backend/db/schema';
  import * as m from '$lib/paraglide/messages.js';
  import { translateBalanceEntryType } from '$lib/utils/balanceTranslations';
  import { dateFormatter, priceFormatter } from '$lib/utils/formatter';

  let { entry }: { entry: BalanceEntry & { user: { username: string } } } = $props();

  const getLabel = (balanceEntry: BalanceEntry) => {
    const typeLabel = translateBalanceEntryType(balanceEntry.type);
    if (balanceEntry.description) {
      return `${typeLabel}: ${balanceEntry.description}`;
    }

    return typeLabel;
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
