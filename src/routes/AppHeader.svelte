<script lang="ts">
  // noinspection ES6UnusedImports Intellij doesn't resolve the dot annotation correctly
  import { Navigation } from '@skeletonlabs/skeleton-svelte';
  import { CalendarDays, Settings, ShoppingCart, Star } from 'lucide-svelte';
  import { base } from '$app/paths';
</script>

<header class="sticky top-0 z-10 p-1 text-xs">
  <Navigation.Bar>
    <Navigation.Tile href="{base}/shopping" label="Shopping">
      <ShoppingCart />
    </Navigation.Tile>
    <Navigation.Tile label="Schedule" labelClasses="disabled">
      <CalendarDays />
    </Navigation.Tile>
    <Navigation.Tile label="Daily Upkeep" labelClasses="disabled">
      <Star />
    </Navigation.Tile>
    <Navigation.Tile href="{base}/settings" label="Settings">
      <Settings />
    </Navigation.Tile>
  </Navigation.Bar>
</header>
