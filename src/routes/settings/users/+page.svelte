<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton-svelte';
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation'; // Import available tags and the current tag function
  import { base } from '$app/paths';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { availableLanguageTags, sourceLanguageTag } from '$lib/paraglide/runtime.js';

  let { data } = $props();

  function changeLanguage(targetLang: string) {
    if (targetLang === sourceLanguageTag) {
      goto(`${base}/settings/users`);
    } else {
      goto(`${base}/${targetLang}/settings/users`);
    }
  }
</script>

{#await data.users}
  <div class="card">
    <LoadingSpinner />
  </div>
{:then users}
  <div class="card mb-2 w-full">
    <h1 class="text-2xl font-semibold mb-4">{ m.settings_users_language() }</h1>
    <div class="flex flex-wrap justify-center gap-4">
      {#each availableLanguageTags as lang(lang)}
        <button class="btn" onclick={() => changeLanguage(lang)}>
          {lang}
        </button>
      {/each}
    </div>
  </div>
  <div class="card w-full">
    <h1 class="text-2xl font-semibold mb-4">{ m.settings_users_switch() }</h1>
    <div class="flex flex-wrap justify-center gap-4">
      {#each users as user (user.id)}
        <form method="POST" action="?/select" use:enhance>
          <input type="hidden" name="userId" value={user.id}>
          <button type="submit" class="card w-40 h-40 flex flex-col items-center justify-center gap-1">
            <Avatar name={user?.username ?? ''}
                    background="preset-filled-secondary-800-200"
                    classes="w-20 h-20"
            />
            {user?.username}
          </button>
        </form>
      {/each}
      <a class="card w-40 h-40 flex items-center justify-center" href="users/add">
        {m.settings_users_add()}
      </a>
    </div>
  </div>
{/await}
