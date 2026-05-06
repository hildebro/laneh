<script lang="ts">
  import '../app.css';
  import { Capacitor } from '@capacitor/core';
  import { StatusBar } from '@capacitor/status-bar';
  import { onMount } from 'svelte';
  import LanguageAction from './LanguageAction.svelte';
  import MenuAction from './MenuAction.svelte';
  import ThemeAction from './ThemeAction.svelte';
  import { page } from '$app/state';
  import ToastContainer from '$lib/components/ToastContainer.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { children } = $props();

  onMount(async () => {
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
      <div class="header-action-container">
        <ThemeAction/>
        <LanguageAction />
        <MenuAction logged_in_user={page.data.logged_in_user} />
      </div>
    </div>
  </header>
  {@render children()}
</div>

<style>
    /* This ensures the background color extends BEHIND the status bar, but content starts BELOW it. */
    .app-shell {
        min-height: 100vh;
    }

    header {
        position: sticky;
        top: 0;
        z-index: 100;
        background-color: var(--bg-app);
        border-bottom: var(--default-border-width) solid var(--border-main);
        padding-top: env(safe-area-inset-top, 1rem);
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

    .header-action-container {
        display: flex;
        align-items: start;
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
</style>