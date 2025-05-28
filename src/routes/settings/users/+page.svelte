<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton-svelte';
  import { enhance } from '$app/forms';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import { transLocale } from '$lib/locale-translations.js';
  import * as m from '$lib/paraglide/messages.js';
  import { locales, setLocale } from '$lib/paraglide/runtime.js';

  let { data } = $props();
</script>

{#await data.users}
  <div class="card">
    <LoadingSpinner />
  </div>
{:then users}
  {#if !data.has_active_user}
    <p class="card w-full preset-filled-error-50-950 rounded m-2 text-center">
      { m.settings_users_no_active_user() }
    </p>
  {/if}
  <div class="card mb-2 w-full flex justify-between">
    <h1 class="text-2xl font-semibold mb-4">{ m.settings_users_language() }</h1>
    <span class="flex flex-wrap justify-center gap-4">
      {#each locales as locale(locale)}
        <button class="btn text-3xl" onclick={() => setLocale(locale)}>
          {transLocale(locale)}
        </button>
      {/each}
    </span>
  </div>
  <div class="card w-full">
    <h1 class="text-2xl font-semibold mb-4">{ m.settings_users_switch() }</h1>
    <div class="flex flex-wrap justify-center gap-4">
      {#each users as user (user.id)}
        <form method="POST" action="?/select" use:enhance>
          <input type="hidden" name="userId" value={user.id}>
          <button type="submit" class="btn w-40 h-40 flex flex-col items-center justify-center gap-1">
            <Avatar name={user?.username ?? ''}
                    background="preset-filled-secondary-500"
                    classes="w-20 h-20"
            />
            {user?.username}
          </button>
        </form>
      {/each}
      <a class="btn w-40 h-40 flex items-center justify-center" href="users/add">
        {m.settings_users_add()}
      </a>
    </div>
  </div>
{/await}
