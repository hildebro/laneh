<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton-svelte';
  import { enhance } from '$app/forms';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';

  let { data } = $props();
</script>

<div class="card">
  {#await data.users}
    <LoadingSpinner/>
  {:then users}
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
        Add new user
      </a>
    </div>
  {/await}
</div>
