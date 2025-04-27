<script lang="ts">
  import { enhance } from '$app/forms';
  import CategorizedItemSelect from '$lib/CategorizedItemSelect.svelte';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();
</script>

{#await data.categories}
  <LoadingSpinner />
{:then categories}
  <form class="flex flex-col gap-4 items-center h-full w-full" method="POST" use:enhance>
    <button class="btn ml-auto" type="submit">{m.shopping_finish_purchase()}</button>
    <CategorizedItemSelect {categories} />
  </form>
{/await}
