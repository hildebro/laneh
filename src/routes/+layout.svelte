<script lang="ts">
  import '../app.css';
  import { Toaster } from '@skeletonlabs/skeleton-svelte';
  import AppHeader from './AppHeader.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { toaster } from '$lib/toaster-ref';

  let { children, data } = $props();
</script>

<Toaster titleClasses="h4" descriptionClasses="whitespace-pre-line p-4" {toaster}></Toaster>

<svelte:head>
  <title>Chorehub</title>
</svelte:head>

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
