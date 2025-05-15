<script lang="ts">
  // noinspection ES6UnusedImports Intellij doesn't resolve the dot annotation correctly
  import { Navigation } from '@skeletonlabs/skeleton-svelte';
  import { CalendarDays, House, Settings, ShoppingCart, Star } from 'lucide-svelte';
  import { base } from '$app/paths';
  import { page } from '$app/state';
  import { availableLanguageTags } from '$lib/paraglide/runtime';
  import * as m from '$lib/paraglide/messages.js';

  function getActiveTileId(pathname: string): string {
    // Remove the base path and split path into segments.
    let path = pathname.substring(base.length);
    let segments = path.replace(/^\/|\/$/g, '').split('/');

    // Remove language tag from the segments, if it's present
    if ((availableLanguageTags as readonly string[]).includes(segments[0])) {
      segments.shift();
    }

    // If no segments are present, we are at the base url.
    if (segments.length === 0) {
      return 'dashboard';
    }

    // Grab the main segment, defaulting to dashboard for type safety even though it should be impossible.
    return segments.shift() ?? 'dashboard';
  }

  // Initialize the state based on the current page path
  let value = $state(getActiveTileId(page.url.pathname));
</script>

<header class="sticky">
  <Navigation.Bar {value} onValueChange={(newValue) => (value = newValue)}>
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
