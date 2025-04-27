<script lang="ts">
  import { enhance } from '$app/forms';
  import * as m from '$lib/paraglide/messages.js';

  let { data, form } = $props();

  // Initialize form state directly from props
  let categoryName = $state(data.category?.name || '');
</script>

<div class="card">
  <div class="h5 mb-4">
    {#if data.category}
      { m.settings_categories_edit() }
    {:else }
      { m.settings_categories_add() }
    {/if}
  </div>
  <form method="POST" action="?/create" use:enhance>
    <input type="hidden" name="categoryId" value={data.category?.id}>
    <label>
      { m.generic_name() }
      <input class="form-input input" type="text" name="name" bind:value={categoryName} required />
    </label>

    <button type="submit" class="btn mt-1">
      { m.generic_save() }
    </button>

    {#if form?.message}
      <p class="preset-filled-error-50-950 rounded mt-4 text-center">{form.message}</p>
    {/if}
  </form>

  {#if data.category}
    <form method="POST" action="?/delete" use:enhance>
      <input type="hidden" name="categoryId" value={data.category?.id}>
      <button type="submit" class="mt-2 btn preset-filled-error-400-600">
        { m.settings_categories_delete() }
      </button>
    </form>
  {/if}
</div>
