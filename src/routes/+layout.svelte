<script lang="ts">
  import '../app.css';
  import { Capacitor } from '@capacitor/core';
  import { StatusBar } from '@capacitor/status-bar';
  import { CloudAlert } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import AppHeader from './AppHeader.svelte';
  import { resolve } from '$app/paths';
  import ToastContainer from '$lib/components/ToastContainer.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { children, data } = $props();

  let updateAvailable = $state(false);

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
      }
    } catch {
      console.error('Failed to check for updates');
    }
  });
</script>

<ToastContainer />

<svelte:head>
  <title>Chorehub</title>
</svelte:head>

<div class="app-shell">
  <header>
    <AppHeader dueTaskCount={data.due_task_count} />
  </header>
  <main>
    {@render children()}
  </main>
  <footer>
    <div class:warning={updateAvailable}>
      {m.footer_version({ app_version: __APP_VERSION__ })}
      {#if updateAvailable}
        <CloudAlert size={20} class="icon" />
      {/if}
    </div>
    {#if data.user}
      <div>
        { m.footer_user({ name: data.user.username }) }
      </div>
    {/if}
  </footer>
</div>

<style>
    /* This ensures the background color extends BEHIND the status bar, but content starts BELOW it. */
    .app-shell {
        min-height: 100vh;
    }

    .warning {
        color: var(--btn-warning-text);
    }

    footer {
        color: var(--text-heading);
        display: flex;
        justify-content: space-between;
        padding: 0.5rem;

        div {
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }
    }
</style>