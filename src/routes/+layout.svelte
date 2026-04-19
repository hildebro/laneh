<script lang="ts">
  import '../app.css';
  import { Capacitor } from '@capacitor/core';
  import { StatusBar } from '@capacitor/status-bar';
  import { onMount } from 'svelte';
  import ToastContainer from '$lib/components/ToastContainer.svelte';

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
  {@render children()}
</div>

<style>
    /* This ensures the background color extends BEHIND the status bar, but content starts BELOW it. */
    .app-shell {
        min-height: 100vh;

        padding-top: env(safe-area-inset-top, 1rem);
    }
</style>