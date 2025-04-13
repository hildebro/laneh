<script lang="ts">
  // noinspection ES6UnusedImports Intellij doesn't resolve the dot annotation correctly
  import { Navigation } from '@skeletonlabs/skeleton-svelte';
  import { CalendarDays, Settings, ShoppingCart, Star } from 'lucide-svelte';
  import { base } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';
</script>

<header class="sticky top-0 z-10 p-1 text-xs">
  <Navigation.Bar>
    <Navigation.Tile href="{base}/shopping" label={m.header_shopping()}>
      <ShoppingCart />
    </Navigation.Tile>
    <Navigation.Tile label={m.header_schedule()} labelClasses="disabled">
      <CalendarDays />
    </Navigation.Tile>
    <Navigation.Tile label={m.header_daily_upkeep()} labelClasses="disabled">
      <Star />
    </Navigation.Tile>
    <Navigation.Tile href="{base}/settings" label={m.header_settings()}>
      <Settings />
    </Navigation.Tile>
  </Navigation.Bar>
</header>
