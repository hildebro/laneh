<script lang="ts">
  import { Navigation } from '@skeletonlabs/skeleton-svelte';
  import { CalendarDays, House, Receipt, Settings, ShoppingCart } from 'lucide-svelte';
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';

  let { dueTaskCount } = $props();

  const links = [
    { label: m.header_dashboard(), href: resolve('/'), icon: House },
    { label: m.header_shopping(), href: resolve('/shopping'), icon: ShoppingCart },
    { label: m.header_balance(), href: resolve('/balance'), icon: Receipt },
    { label: m.header_settings(), href: resolve('/schedule'), icon: CalendarDays },
    { label: m.header_settings(), href: resolve('/settings'), icon: Settings }
  ];
</script>

<Navigation layout="bar">
  <Navigation.Menu class="grid grid-cols-5 gap-1">
    {#each links as link (link)}
      {@const Icon = link.icon}
      <Navigation.TriggerAnchor href={link.href}>
        <Icon class="size-8" />
        <Navigation.TriggerText>{link.label}</Navigation.TriggerText>
      </Navigation.TriggerAnchor>
    {/each}
  </Navigation.Menu>
</Navigation>
