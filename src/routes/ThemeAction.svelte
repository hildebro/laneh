<script lang="ts">
  import { Capacitor } from '@capacitor/core';
  import { StatusBar, Style } from '@capacitor/status-bar';
  import { Moon, Sun } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import * as m from '$lib/paraglide/messages.js';

  let isDark = $state(false);

  async function toggleTheme() {
    isDark = !isDark;
    const newScheme = isDark ? 'dark' : 'light';

    document.documentElement.setAttribute('data-color-scheme', newScheme);
    localStorage.setItem('color-scheme', newScheme);

    // Sync the native status bar text color on tap
    if (Capacitor.isNativePlatform()) {
      await StatusBar.setStyle({
        style: isDark ? Style.Dark : Style.Light
      });
    }
  }

  onMount(() => {
    isDark = document.documentElement.getAttribute('data-color-scheme') === 'dark';
  });
</script>

<button class="header-action" onclick={toggleTheme}>
  {#if isDark}
    <Moon size={24} />
  {:else}
    <Sun size={24} />
  {/if}
  <span>{ m.header_theme() }</span>
</button>
