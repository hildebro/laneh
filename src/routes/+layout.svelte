<script lang="ts">
  import '../app.css';
  import { Toast } from '@skeletonlabs/skeleton-svelte';
  import AppHeader from './AppHeader.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { toaster } from '$lib/toaster-ref';

  let { children, data } = $props();
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

<div class="h-screen grid grid-rows-[auto_1fr_auto] overflow-y-auto">
  <AppHeader dueTaskCount={data.dueTaskCount} />
  <main class="flex flex-col items-center p-4">
    {@render children()}
  </main>
  <footer class="text-right text-xs p-1">
    {#if data.user}
      { m.footer_user({ name: data.user.username }) }
    {/if}
  </footer>
</div>
