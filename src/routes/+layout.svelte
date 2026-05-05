<script lang="ts">
  import '../app.css';
  import { Capacitor } from '@capacitor/core';
  import { StatusBar } from '@capacitor/status-bar';
  import { Moon, Sun } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import LanguageDropdown from './LanguageDropdown.svelte';
  import UserDropdown from './UserDropdown.svelte';
  import ToastContainer from '$lib/components/ToastContainer.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { children, data } = $props();

  let isDark = $state(false);

  function toggleTheme() {
    isDark = !isDark;
    const newScheme = isDark ? 'dark' : 'light';

    document.documentElement.setAttribute('data-color-scheme', newScheme);
    localStorage.setItem('color-scheme', newScheme);
  }

  onMount(async () => {
    isDark = document.documentElement.getAttribute('data-color-scheme') === 'dark';

    if (Capacitor.isNativePlatform()) {
      // Option A: Make the status bar transparent (Content goes BEHIND it)
      // You MUST use Method 1 (CSS padding) with this for it to look good.
      await StatusBar.setOverlaysWebView({ overlay: true });

      // Since your header is "bg-surface-50-950" (likely dark in dark mode, light in light mode),
      // you might want to dynamically set this, or just stick to Style.Default which adapts.
      // If your header is always dark-ish, force Light icons:
      // await StatusBar.setStyle({ style: Style.Dark });
    }
  });
</script>

<ToastContainer />

<svelte:head>
  <title>Laneh</title>
</svelte:head>

<div class="app-shell">
  <header>
    <div class="header-inner">
      <div>
        { m.header_head() }
      </div>
      <div style="display: flex; align-items: start">
        <button class="trigger" onclick={toggleTheme}>
        <span
          style="display: flex; flex-direction: column; align-items: center; line-height: 0.7rem; font-size: 0.7rem;">
            {#if isDark}
              <Moon size={24} />
            {:else}
              <Sun size={24} />
            {/if}
          <span style="margin-top: 0.2rem;">{ m.header_theme() }</span>
        </span>
        </button>
        <LanguageDropdown />
        <UserDropdown logged_in_user={data?.logged_in_user} />
      </div>
    </div>
  </header>
  {@render children()}
</div>

<style>
    /* This ensures the background color extends BEHIND the status bar, but content starts BELOW it. */
    .app-shell {
        min-height: 100vh;

        padding-top: env(safe-area-inset-top, 1rem);
    }

    header {
        position: sticky;
        top: 0;
        z-index: 100;
        background-color: var(--bg-app);
        border-bottom: var(--default-border-width) solid var(--border-main);
    }

    .header-inner {
        width: 100%;
        max-width: var(--max-width);
        margin: 0 auto;
        padding: 0.3rem;
        color: var(--text-heading);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .header-inner div {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    @media (max-width: 23.5rem) {
        .header-inner {
            padding-inline: 0.5rem;
        }
    }

    .trigger {
        background: transparent;
        border: none;
        color: var(--text-heading);
        cursor: pointer;
        padding: 0.25rem;
        transition: color 0.2s ease, transform 0.1s ease;
        font-family: inherit;
    }

    .trigger:hover {
        color: var(--btn-primary-bg);
    }

    .trigger:active {
        transform: scale(0.95);
    }
</style>