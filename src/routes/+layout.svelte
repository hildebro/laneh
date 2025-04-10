<script lang="ts">
  import '../app.css';
  import { ParaglideJS } from '@inlang/paraglide-sveltekit';
  import AppHeader from './AppHeader.svelte';
  import { i18n } from '$lib/i18n';

  let { children, data } = $props();
</script>

<svelte:head>
  <title>Chorehub</title>
</svelte:head>

<ParaglideJS {i18n}>
  <div class="h-screen grid grid-rows-[auto_1fr_auto] overflow-y-auto">
    <AppHeader user={data.user}></AppHeader>
    <main class="flex flex-col items-center p-4">
      {@render children()}
    </main>
  </div>
</ParaglideJS>
