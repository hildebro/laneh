<script lang="ts">
  import { CircleUser, CloudAlert } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';

  let { logged_in_user } = $props();

  let updateAvailable = $state(false);

  let isOpen = $state(false);
  let wrapper = $state<HTMLElement>();

  const toggleMenu = () => {
    isOpen = !isOpen;
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
  };

  // Close the dropdown if the user clicks outside of the component
  const handleOutsideClick = (event: MouseEvent) => {
    if (isOpen && wrapper && !wrapper.contains(event.target as Node)) {
      isOpen = false;
    }
  };

  onMount(async () => {
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

<svelte:window onclick={handleOutsideClick} />

<div class="user-menu-wrapper" bind:this={wrapper}>
  <button class="trigger" onclick={toggleMenu} aria-expanded={isOpen}>
    <span style="display: flex; flex-direction: column; align-items: center; line-height: 0.7rem; font-size: 0.7rem;">
      <CircleUser size={24} />
      {#if logged_in_user}
        <span style="margin-top: 0.2rem;">{ logged_in_user.username }</span>
      {/if}
    </span>
  </button>

  {#if isOpen}
    <div class="dropdown">
      <div class="dropdown-header" class:warning={updateAvailable}>
        {#if updateAvailable}
          <CloudAlert size={20} class="icon" />
        {/if}
        {m.footer_version({ app_version: __APP_VERSION__ })}
      </div>

      <div class="dropdown-actions">
        <a href={resolve('/settings')} class="dropdown-item" onclick={() => isOpen = false}>
          { m.header_settings() }
        </a>

        <button class="dropdown-item" onclick={() => { handleLogout(); isOpen = false; }}>
          { m.auth_logout() }
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
    .warning {
        color: var(--btn-warning-text);
    }

    .user-menu-wrapper {
        position: relative;
        display: inline-block;
    }

    .trigger {
        background: transparent;
        border: none;
        color: var(--text-heading);
        cursor: pointer;
        padding: 0.25rem;
        transition: color 0.2s ease, transform 0.1s ease;
        font-family: inherit;
    }

    .trigger:hover {
        color: var(--btn-primary-bg);
    }

    .trigger:active {
        transform: scale(0.95);
    }

    .dropdown {
        position: absolute;
        top: calc(100% + 0.5rem);
        right: 0;
        min-width: 12rem;

        background-color: var(--bg-surface);
        border: var(--default-border-width) solid var(--border-main);
        border-radius: var(--radius-container);
        box-shadow: var(--dialog-shadow);

        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 200;
    }

    .dropdown-header {
        padding: 0.75rem 1rem;
        font-size: 0.8rem;
        color: var(--text-muted);
        border-bottom: var(--default-border-width) solid var(--border-main);
        text-align: right;
        background-color: var(--table-header-bg); /* Reusing a subtle background variable */
    }

    .dropdown-actions {
        display: flex;
        flex-direction: column;
        padding: 0.5rem 0;
    }

    .dropdown-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.6rem 1rem;

        color: var(--text-heading);
        background-color: transparent;
        border: none;
        font-size: 0.95rem;
        font-family: inherit;
        text-decoration: none;
        text-align: left;
        cursor: pointer;

        transition: background-color 0.2s ease, color 0.2s ease;
    }

    .dropdown-item:hover {
        background-color: var(--bg-surface-hover);
        color: var(--btn-primary-bg);
    }

    /* Reset button specific styles that might clash from app.css */
    button.dropdown-item {
        border-radius: 0;
        line-height: normal;
    }
</style>