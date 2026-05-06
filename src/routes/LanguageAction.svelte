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

<div class="header-dropdown-wrapper" bind:this={wrapper}>
  <button class="header-action" onclick={toggleMenu} aria-expanded={isOpen}>
    <Globe size={24} />
    <span>{ m.header_language() }</span>
  </button>

  {#if isOpen}
    <div class="header-dropdown">
      <div class="header-dropdown-actions horizontal">
        {#each locales as locale(locale)}
          <button class="header-dropdown-item" onclick={() => setLocale(locale)}>
            {transLocale(locale)}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>
