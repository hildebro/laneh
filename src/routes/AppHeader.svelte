<script lang="ts">
  import { Navigation } from '@skeletonlabs/skeleton-svelte';
  import { CalendarDays, House, Receipt, Settings, ShoppingCart } from 'lucide-svelte';
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';

  let { dueTaskCount } = $props();

  const links = $derived([
    { label: m.header_dashboard(), href: resolve('/'), icon: House },
    { label: m.header_shopping(), href: resolve('/shopping'), icon: ShoppingCart },
    { label: m.header_balance(), href: resolve('/balance'), icon: Receipt },
    {
      label: m.header_schedule(),
      href: resolve('/schedule'),
      icon: CalendarDays,
      badge: dueTaskCount > 0 ? dueTaskCount : null
    },
    { label: m.header_settings(), href: resolve('/settings'), icon: Settings }
  ]);
</script>

<Navigation layout="bar">
  <Navigation.Menu class="grid grid-cols-5 gap-1">
    {#each links as link (link)}
      {@const Icon = link.icon}
      <Navigation.TriggerAnchor href={link.href} class="flex flex-col items-center">

        <div class="relative inline-block">
          {#if link.badge}
            <span
              class="badge-icon preset-filled-error-500 absolute -top-2.5 -right-4 z-10">
              {link.badge}
            </span>
          {/if}
          <Icon class="size-8" />
        </div>
        <Navigation.TriggerText>{link.label}</Navigation.TriggerText>
      </Navigation.TriggerAnchor>
    {/each}
  </Navigation.Menu>
</Navigation>
