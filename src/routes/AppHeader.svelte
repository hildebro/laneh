<script lang="ts">
  // noinspection ES6UnusedImports Intellij doesn't resolve the dot annotation correctly
  import { Navigation } from '@skeletonlabs/skeleton-svelte';
  import { CalendarDays, House, Settings, ShoppingCart, Star } from 'lucide-svelte';
  import { base } from '$app/paths';
  import { page } from '$app/state';
  import * as m from '$lib/paraglide/messages.js';
  import { availableLanguageTags } from '$lib/paraglide/runtime';

  function getActiveTileId(pathname: string): string {
    // Remove the base path and split path into segments.
    let path = pathname.substring(base.length);
    let segments = path.replace(/^\/|\/$/g, '').split('/');

    // Remove language tag from the segments if it's present at the beginning.
    if (segments.length > 0 && (availableLanguageTags as readonly string[]).includes(segments[0])) {
      segments.shift();
    }

    // If no segments are left, we are at the effective base URL.
    if (segments.length === 0 || segments[0] === '') {
      return 'dashboard';
    }

    // The first segment after base path and language code is the active tile ID.
    return segments[0];
  }

  // Initialize the state based on the current page path.
  // This $state will hold the ID of the active navigation tile.
  let value = $state(getActiveTileId(page.url.pathname));

  // Use an $effect to reactively update 'value' whenever the page URL pathname changes.
  // This ensures the header highlight updates, even if navigation is triggered externally.
  $effect(() => {
    const newActiveId = getActiveTileId(page.url.pathname);
    if (value !== newActiveId) {
      value = newActiveId; // Update the $state variable
    }
  });
</script>

<header class="sticky">
  <Navigation.Bar {value}>
    <Navigation.Tile id="dashboard" href={base} label={m.header_dashboard()}>
      <House />
    </Navigation.Tile>
    <Navigation.Tile id="shopping" href="{base}/shopping" label={m.header_shopping()}>
      <ShoppingCart />
    </Navigation.Tile>
    <Navigation.Tile id="schedule" href="{base}/schedule" label={m.header_schedule()}>
      <CalendarDays />
    </Navigation.Tile>
    <Navigation.Tile label={m.header_daily_upkeep()} labelClasses="disabled">
      <Star />
    </Navigation.Tile>
    <Navigation.Tile id="settings" href="{base}/settings" label={m.header_settings()}>
      <Settings />
    </Navigation.Tile>
  </Navigation.Bar>
</header>
