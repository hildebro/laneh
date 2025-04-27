<script lang="ts">
  import '../app.css';
  import { ParaglideJS } from '@inlang/paraglide-sveltekit';
  import AppHeader from './AppHeader.svelte';
  import { i18n } from '$lib/i18n';
  import * as m from '$lib/paraglide/messages.js';

  let { children, data } = $props();
</script>

<svelte:head>
  <title>Chorehub</title>
</svelte:head>

<ParaglideJS {i18n}>
  <div class="h-screen grid grid-rows-[auto_1fr_auto] overflow-y-auto">
    <AppHeader />
    <main class="flex flex-col items-center p-4">
      {@render children()}
    </main>
    <footer class="text-right text-xs p-1">
      {#if data.user}
        { m.footer_user({ name: data.user.username }) }
      {/if}
    </footer>
  </div>
</ParaglideJS>
