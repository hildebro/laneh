<script lang="ts">
  import '../app.css';
  import { Capacitor } from '@capacitor/core';
  import { StatusBar } from '@capacitor/status-bar';
  import { Toast } from '@skeletonlabs/skeleton-svelte';
  import { onMount } from 'svelte';
  import AppHeader from './AppHeader.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { toaster } from '$lib/toaster-ref';

  // 1. Only show the button if we are running inside the native wrapper
  const isNative = Capacitor.isNativePlatform();

  function disconnectFromWrapper() {
    const platform = Capacitor.getPlatform();
    const localBaseUrl = platform === 'ios'
      ? 'capacitor://localhost'
      : 'http://localhost';

    // Bounce back to the wrapper, appending a query parameter
    window.location.replace(`${localBaseUrl}?action=disconnect`);
  }

  let { children, data } = $props();

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

<div class="h-screen grid grid-rows-[auto_1fr_auto] overflow-y-auto app-shell">
  <AppHeader dueTaskCount={data.dueTaskCount} />
  <main class="flex flex-col items-center p-4">
    {@render children()}
  </main>
  <footer class="text-right text-xs p-1">
    {#if isNative}
      <div class="native-controls">
        <button type="button" onclick={disconnectFromWrapper} class="btn">
          Disconnect / Change Server
        </button>
      </div>
    {/if}
    {#if data.user}
      { m.footer_user({ name: data.user.username }) }
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