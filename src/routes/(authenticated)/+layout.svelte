<script lang="ts">
  import { CloudAlert } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import AppHeader from './AppHeader.svelte';
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';

  let { children, data } = $props();

  let updateAvailable = $state(false);

  onMount(async () => {
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
  {#if data.logged_in_user}
    <div>
      { m.footer_user({ name: data.logged_in_user.username }) }
    </div>
  {/if}
</footer>

<style>
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