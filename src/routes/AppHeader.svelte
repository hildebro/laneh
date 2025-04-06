<script lang="ts">
  // noinspection ES6UnusedImports
  import { Navigation } from '@skeletonlabs/skeleton-svelte';
  import { Avatar } from '@skeletonlabs/skeleton-svelte';
  import { base } from '$app/paths';
  import { CalendarDays, ShoppingCart, Star } from 'lucide-svelte';

  let { user } = $props();
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
    <Navigation.Tile href="{base}/users" label={user?.username ?? ''}>
      <Avatar
        name={user?.username ?? ''}
        background="preset-filled-secondary-800-200"
        classes="w-7 h-7 rounded-full text-lg flex"
      />
    </Navigation.Tile>
  </Navigation.Bar>
</header>
