<script lang="ts">
  import '../app.css';
  import { Capacitor } from '@capacitor/core';
  import { StatusBar } from '@capacitor/status-bar';
  import { Toast } from '@skeletonlabs/skeleton-svelte';
  import { onMount } from 'svelte';
  import AppHeader from './AppHeader.svelte';
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';
  import { toaster } from '$lib/toaster-ref';

  let { children, data } = $props();

  let updateAvailable = $state(false);
  let latestVersion = $state('');

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

    // Check for updates
    try {
      const res = await fetch(resolve('/api/update'));
      const updateData = await res.json();
      if (updateData.hasUpdate) {
        updateAvailable = true;
        latestVersion = updateData.latestVersion;
      }
    } catch {
      console.error('Failed to check for updates');
    }
  });
</script>

<Toast.Group {toaster}>
  {#snippet children(toast)}
    <Toast {toast}>
      <Toast.Message>
        <Toast.Title class="h4">{toast.title}</Toast.Title>
        <Toast.Description class="whitespace-pre-line p-4">{toast.description}</Toast.Description>
      </Toast.Message>
      <Toast.CloseTrigger />
    </Toast>
  {/snippet}
</Toast.Group>

<svelte:head>
  <title>Chorehub</title>
</svelte:head>

<div class="min-h-screen flex flex-col bg-surface-50-950 app-shell">
  <header class="sticky top-0 z-50 w-full bg-surface-100-800 shadow-md pt-[env(safe-area-inset-top)]">
    <AppHeader dueTaskCount={data.dueTaskCount} />
  </header>
  <main class="flex flex-1 flex-col items-center p-4">
    {@render children()}
  </main>
  <footer class="flex justify-between text-xs">
    <div>
      {m.footer_version({ app_version: __APP_VERSION__ })}
    </div>
    {#if updateAvailable}
      <span class="font-bold">⚠️ Update available</span>
    {/if}
    {#if data.user}
      <div>
        { m.footer_user({ name: data.user.username }) }
      </div>
    {/if}
  </footer>
</div>

<style>
    /* This ensures the background color extends BEHIND the status bar,
       but your content starts BELOW it.
    */
    .app-shell {
        min-height: 100vh;
    }
</style>