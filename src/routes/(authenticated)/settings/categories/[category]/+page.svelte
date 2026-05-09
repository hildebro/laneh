<script lang="ts">
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import ApiFormItem from '$lib/components/ApiFormItem.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  let id = $derived(data.category?.id);
  let name = $derived(data.category?.name || '');

  async function saveCategory() {
    const client = getApiClient();
    return client.api.shopping.category.$post({
      json: { id: id ?? null, name }
    });
  }

  async function deleteCategory() {
    const client = getApiClient();
    return client.api.shopping.category[':id'].$delete({
      param: { id: id as string }
    });
  }

</script>

<article>
  <h2>
    {#if data.category}
      { m.settings_categories_edit() }
    {:else }
      { m.settings_categories_add() }
    {/if}
  </h2>
  <div class="action-row">
    <ApiForm submitAction={saveCategory} onSuccess={resolve('/settings/categories')}>
      <ApiFormItem
        label={m.generic_name()}
        name="name"
        bind:value={name}
      />
    </ApiForm>

    {#if data.category}
      <ApiForm
        submitAction={deleteCategory}
        submitButtonText={m.settings_categories_delete()}
        submitButtonClasses="error"
        onSuccess={resolve('/settings/categories')}
      >
        <input type="hidden" name="categoryId" value={data.category?.id}>
      </ApiForm>
    {/if}
  </div>
</article>
