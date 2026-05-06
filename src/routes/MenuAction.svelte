<script lang="ts">
  import { Capacitor } from '@capacitor/core';
  import { CloudAlert, Menu } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { goto, invalidateAll } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { logged_in_user } = $props();

  let updateAvailable = $state(false);

  let isOpen = $state(false);
  let wrapper = $state<HTMLElement>();

  const toggleMenu = () => {
    isOpen = !isOpen;
  };

  async function logout() {
    const client = getApiClient();
    return client.api.users.logout.$post();
  }

  function exitInstance() {
    localStorage.removeItem('serverUrl');
    goto(resolve('/server-picker'));
    isOpen = false;
  }

  // Close the dropdown if the user clicks outside the component
  const handleOutsideClick = (event: MouseEvent) => {
    if (isOpen && wrapper && !wrapper.contains(event.target as Node)) {
      isOpen = false;
    }
  };

  async function onSuccess() {
    await invalidateAll();
    await goto(resolve('/login'));
    isOpen = false;
  }

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

<div class="header-dropdown-wrapper" bind:this={wrapper}>
  <button class="header-action" onclick={toggleMenu} aria-expanded={isOpen}>
    <Menu size={24} />
    <span>{ m.header_menu() }</span>
  </button>

  {#if isOpen}
    <div class="header-dropdown">
      <div class="header-dropdown-info" class:warning={updateAvailable}>
        <div>
          {#if logged_in_user}
            { m.header_user({ name: logged_in_user.username }) }
          {/if}
        </div>
        <div>
          {#if updateAvailable}
            <CloudAlert size={20} class="icon" />
          {/if}
          {m.footer_version({ app_version: __APP_VERSION__ })}
        </div>
      </div>

      <div class="header-dropdown-actions">
        {#if logged_in_user}
          <a href={resolve('/settings')} class="header-dropdown-item" onclick={() => isOpen = false}>
            { m.header_settings() }
          </a>

          <ApiForm submitAction={logout} submitButtonHidden {onSuccess}>
            <button type="submit" class="header-dropdown-item" style="width: 100%">
              {m.auth_logout()}
            </button>
          </ApiForm>
        {/if}

        {#if Capacitor.isNativePlatform() && localStorage.getItem('serverUrl')}
          <button class="header-dropdown-item" onclick={exitInstance}>{m.settings_mobile_return_to_wrapper()}</button>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
    .warning {
        color: var(--btn-warning-text);
    }
</style>