<script lang="ts">
  import { Moon, Sun } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import * as m from '$lib/paraglide/messages.js';

  let isDark = $state(false);

  function toggleTheme() {
    isDark = !isDark;
    const newScheme = isDark ? 'dark' : 'light';

    document.documentElement.setAttribute('data-color-scheme', newScheme);
    localStorage.setItem('color-scheme', newScheme);
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