<script lang="ts">
  import CategorizedItemSelect from '$lib/CategorizedItemSelect.svelte';
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();
</script>

{#await data.categories}
  <LoadingSpinner />
{:then categories}
  <div class="w-full">
    <EnhancedForm>
      <div class="flex flex-col gap-4 items-center">
        <button class="btn ml-auto" type="submit">{m.shopping_finish_purchase()}</button>
        <CategorizedItemSelect {categories} />
      </div>
    </EnhancedForm>
  </div>
{/await}
