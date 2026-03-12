<script lang="ts">
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  let categoryName = $derived(data.category?.name || '');
</script>

<div class="card">
  <div class="h5 mb-4">
    {#if data.category}
      { m.settings_categories_edit() }
    {:else }
      { m.settings_categories_add() }
    {/if}
  </div>
  <EnhancedForm method="POST" action="?/create">
    <input type="hidden" name="id" value={data.category?.id}>
    <label>
      { m.generic_name() }
      <input class="input" type="text" name="name" bind:value={categoryName} />
    </label>
  </EnhancedForm>

  {#if data.category}
    <EnhancedForm
      action="?/delete"
      submitButtonText={m.settings_categories_delete()}
      submitButtonClasses="preset-filled-error-400-600"
    >
      <input type="hidden" name="categoryId" value={data.category?.id}>
    </EnhancedForm>
  {/if}
</div>
