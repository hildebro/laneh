<script lang="ts">
  import { CloudAlert, LoaderCircle } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import AppHeader from './AppHeader.svelte';
  import { invalidateAll } from '$app/navigation';
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';

  let { children, data } = $props();

  let updateAvailable = $state(false);

  // --- Pull to Refresh State ---
  const resistance = 0.3;
  let startY = $state(0);
  let currentY = $state(0);
  let pulling = $state(false);
  let rotateDeg = $state(0);
  let shouldRefresh = $state(false);
  let translateY = $state(0);
  let isRefreshing = $state(false);

  const touchStart = (event: TouchEvent) => {
    // Only engage if we are at the very top of the page
    if (window.scrollY === 0) {
      startY = event.touches[0].clientY;
    } else {
      startY = 0;
    }
  };

  const touchMove = (event: TouchEvent) => {
    if (startY === 0 || isRefreshing) return;

    currentY = event.touches[0].clientY;
    const diff = currentY - startY;

    // Only pull if swiping down
    if (diff > 20) {
      pulling = true;
      rotateDeg = diff * 1;
      translateY = diff * resistance;
      shouldRefresh = rotateDeg > 180;

      // Prevent standard browser pull-to-refresh/overscroll
      if (event.cancelable) event.preventDefault();
    } else {
      pulling = false;
    }
  };

  const touchEnd = async () => {
    if (!pulling) return;

    if (shouldRefresh) {
      rotateDeg = 0;
      isRefreshing = true;
      translateY = 60; // Lock it open while fetching

      await invalidateAll();

      // Small delay so the user registers the refresh actually happened
      setTimeout(() => {
        translateY = 0;
        pulling = false;
        shouldRefresh = false;
        isRefreshing = false;
      }, 500);
    } else {
      // Snap back if they didn't pull far enough
      translateY = 0;
      pulling = false;
      shouldRefresh = false;
    }
  };

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

{#if pulling || isRefreshing}
  <div class="pull-indicator">
    <LoaderCircle
      size={28}
      style="transform: rotate({rotateDeg}deg); transition: {isRefreshing ? 'none' : 'transform 0.1s linear'}"
      class={isRefreshing ? 'animate-spin' : ''}
    />
  </div>
{/if}

<main
  ontouchstart={touchStart}
  ontouchmove={touchMove}
  ontouchend={touchEnd}
  style="transform: translateY({translateY}px); transition: {pulling ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'};"
>
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

    /* Pull to refresh styles */
    .pull-indicator {
        position: fixed;
        top: 6rem; /* Adjust this to match the height of your <header> */
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        z-index: 0; /* Keeps it behind <main> so it reveals underneath */
        color: var(--text-muted); /* Leverages your existing semantic variables */
        pointer-events: none;
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