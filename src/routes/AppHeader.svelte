<script lang="ts">
  // noinspection ES6UnusedImports Intellij doesn't resolve the dot annotation correctly
  import { Navigation } from '@skeletonlabs/skeleton-svelte';
  import { CalendarDays, House, Settings, ShoppingCart } from 'lucide-svelte';
  import { base } from '$app/paths';
  import { page } from '$app/state';
  import * as m from '$lib/paraglide/messages.js';
  import { locales } from '$lib/paraglide/runtime';

  let { dueTaskCount } = $props();

  function getActiveTileId(pathname: string): string {
    // Remove the base path and split path into segments.
    let path = pathname.substring(base.length);
    let segments = path.replace(/^\/|\/$/g, '').split('/');

    // Remove language tag from the segments if it's present at the beginning.
    if (segments.length > 0 && (locales as readonly string[]).includes(segments[0])) {
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

  let anchorBar = 'btn preset-filled-surface-100-900 hover:preset-tonal flex-col items-center gap-1';
</script>

<header class="sticky top-0 z-50 bg-surface-50-950 backdrop-blur-xs">
  <Navigation layout="bar">
    <Navigation.Menu class="grid grid-cols-4 gap-2">
      <a href={base} class={anchorBar}>
        <House />
        <span>{m.header_dashboard()}</span>
      </a>
      <a href="{base}/shopping" class={anchorBar}>
        <ShoppingCart />
        <span>{m.header_shopping()}</span>
      </a>
      <a href="{base}/schedule" class={anchorBar}>
        <div class="relative">
          <CalendarDays />
          {#if dueTaskCount > 0}
          <span
            class="absolute -top-3.5 -right-3.5 px-2 py-1 text-xs font-bold leading-none preset-filled-error-500 rounded-full">
            {dueTaskCount}
          </span>
          {/if}
        </div>
        <span>{m.header_schedule()}</span>
      </a>
      <a href="{base}/settings" class={anchorBar}>
        <Settings />
        <span>{m.header_settings()}</span>
      </a>
    </Navigation.Menu>
  </Navigation>
</header>
