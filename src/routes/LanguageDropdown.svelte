<script lang="ts">
  import { Globe } from 'lucide-svelte';
  import { transLocale } from '$lib/locale-translations.js';
  import * as m from '$lib/paraglide/messages.js';
  import { locales, setLocale } from '$lib/paraglide/runtime.js';

  let isOpen = $state(false);
  let wrapper = $state<HTMLElement>();

  const toggleMenu = () => {
    isOpen = !isOpen;
  };

  // Close the dropdown if the user clicks outside the component
  const handleOutsideClick = (event: MouseEvent) => {
    if (isOpen && wrapper && !wrapper.contains(event.target as Node)) {
      isOpen = false;
    }
  };
</script>

<svelte:window onclick={handleOutsideClick} />

<div class="user-menu-wrapper" bind:this={wrapper}>
  <button class="header-action" onclick={toggleMenu} aria-expanded={isOpen}>
    <Globe size={24} />
    <span>{ m.header_language() }</span>
  </button>

  {#if isOpen}
    <div class="dropdown">
      <div class="dropdown-actions">
        {#each locales as locale(locale)}
          <button class="dropdown-item" onclick={() => setLocale(locale)}>
            {transLocale(locale)}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
    .user-menu-wrapper {
        position: relative;
        display: inline-block;
    }

    .dropdown {
        position: absolute;
        top: calc(100% + 0.5rem);
        right: 0;

        background-color: var(--bg-surface);
        border: var(--default-border-width) solid var(--border-main);
        border-radius: var(--radius-container);
        box-shadow: var(--dialog-shadow);

        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 200;
    }

    .dropdown-actions {
        display: flex;
        flex-direction: row;
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