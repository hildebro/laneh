<script lang="ts">
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

<nav>
  <ul>
    {#each links as link (link.href)}
      {@const Icon = link.icon}
      <li>
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve False positive. -->
        <a href={link.href}>
          <div>
            <Icon />
            {#if link.badge}
              <mark>{link.badge}</mark>
            {/if}
          </div>
          <span>{link.label}</span>
        </a>
      </li>
    {/each}
  </ul>
</nav>

<style>
    nav {
        width: 100%;
        flex: 1;
        display: flex;
        justify-content: center; /* Centers the ul perfectly */
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        justify-content: center;
        gap: 2.5rem;
    }

    a {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.4rem;
        color: var(--text-muted);
        text-decoration: none;
        transition: color 0.2s ease, transform 0.1s ease;
    }

    a:hover {
        color: var(--accent);
    }

    /* Tiny click effect */
    a:active {
        transform: scale(0.95);
    }

    /* Wrapper for icon + badge */
    div {
        position: relative;
        display: inline-flex;
    }

    /* Target the Lucide icon */
    div :global(svg) {
        width: 1.75rem;
        height: 1.75rem;
    }

    /* The label below the icon */
    span {
        font-size: 0.8rem;
        font-weight: 500;
    }

    /* The notification badge */
    mark {
        position: absolute;
        top: -0.3rem;
        right: -0.6rem;
        z-index: 10;

        background-color: var(--error-bg); /* Sits nicely against most themes */
        color: var(--error-text);
        font-size: 0.65rem;
        font-weight: bold;
        line-height: 1;
        padding: 0.15rem 0.35rem;
        border-radius: 999px;

        /* Overrides default browser highlighter styling for <mark> */
        background-image: none;
    }
</style>