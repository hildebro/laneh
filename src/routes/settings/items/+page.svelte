<script lang="ts">
  import { enhance } from '$app/forms';
  import CategorizedItemSelect from '$lib/CategorizedItemSelect.svelte';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data, form } = $props();
</script>

{#await data.categories}
  <LoadingSpinner />
{:then categories}
  <form class="flex flex-col gap-4 items-center h-full w-full" method="POST" use:enhance>
    <CategorizedItemSelect {categories} unfiltered />
    {#if form?.message}
      <p class="card preset-filled-error-50-950 rounded text-center">{form.message}</p>
    {/if}
    <button class="btn ml-auto" type="submit">{m.settings_items_delete()}</button>
  </form>
{/await}
