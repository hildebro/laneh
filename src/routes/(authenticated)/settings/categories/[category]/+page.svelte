<script lang="ts">
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  let categoryName = $derived(data.category?.name || '');
</script>

<article>
  <h2>
    {#if data.category}
      { m.settings_categories_edit() }
    {:else }
      { m.settings_categories_add() }
    {/if}
  </h2>
  <EnhancedForm method="POST" action="?/create">
    <input type="hidden" name="id" value={data.category?.id}>
    <label>
      { m.generic_name() }
      <input type="text" name="name" bind:value={categoryName} />
    </label>
  </EnhancedForm>

  {#if data.category}
    <EnhancedForm
      action="?/delete"
      submitButtonText={m.settings_categories_delete()}
      submitButtonClasses="error"
    >
      <input type="hidden" name="categoryId" value={data.category?.id}>
    </EnhancedForm>
  {/if}
</article>
