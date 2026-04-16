<script lang="ts">
  import { Trash, Undo2 } from 'lucide-svelte';
  import { invalidateAll } from '$app/navigation';
  import { getApiClient } from '$lib/apiClient';
  import CategorizedItemSelect from '$lib/CategorizedItemSelect.svelte';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let showInactiveItems = $state(false);

  let { data } = $props();

  let itemIds = $state<string[]>([]);

  async function setCategory(categoryId: string) {
    const client = getApiClient();
    return client.api.shopping.setItemCategory.$post({ json: { categoryId, itemIds } });
  }

  async function deactivateItems() {
    const client = getApiClient();
    return client.api.shopping.deactivate.$post({ json: {itemIds} });
  }

  async function onSuccess() {
    itemIds = [];
    await invalidateAll();
  }

  let deleteDialog: HTMLDialogElement;
</script>

<div class="action-bar">
  <label>
    <input type="checkbox" checked={showInactiveItems} onchange={() => showInactiveItems = !showInactiveItems} />
    { m.settings_items_show_inactive() }
  </label>
</div>
<CategorizedItemSelect bind:value={itemIds} categories={data.categories} unfiltered={showInactiveItems} />
<h2 class="headline">{m.settings_actions()}</h2>
<article>
  <h2>{ m.settings_items_change_category() }</h2>
  <div class="action-row">
    {#each data.categories as category (category.id)}
      <ApiForm
        submitAction={async () => {return await setCategory(category.id)}}
        submitButtonText={category.name}
        {onSuccess}
      >
        <input type="hidden" name="itemIds" value={itemIds}>
      </ApiForm>
    {/each}
  </div>
  <hr />
  <h2>{ m.settings_items_other_actions() }</h2>
  <div class="action-row">
    <ApiForm
      submitAction={deactivateItems}
      submitButtonClasses="warning"
      submitButtonText={m.settings_items_deactivate()}
      {onSuccess}
    >
      <input type="hidden" name="itemIds" value={itemIds}>
    </ApiForm>
    <button class="error" onclick={() => deleteDialog.showModal()}>
      { m.settings_items_delete() }
    </button>
  </div>
</article>

<dialog bind:this={deleteDialog}>
  <EnhancedForm
    action="?/deleteItems"
    preUpdatedCallback={() => deleteDialog.close()}
    hideSubmitButton
  >
    <input type="hidden" name="itemIds" value={itemIds}>
    <h2>{m.settings_items_delete()}</h2>
    <p>{ m.settings_items_delete_info() }</p>
    {#snippet additionalButtons()}
      <button
        type="button"
        onclick={() => deleteDialog.close()}
      >
        <Undo2 />
        { m.generic_cancel() }
      </button>
      <button type="submit">
        <Trash />
        { m.generic_confirm() }
      </button>
    {/snippet}
  </EnhancedForm>
</dialog>

<style>
    hr {
        margin-top: 1rem;
        margin-bottom: 1rem;
    }
</style>