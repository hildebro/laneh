<script lang="ts">
  import { Undo2 } from '@lucide/svelte';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import ApiFormItem from '$lib/components/ApiFormItem.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  let id = $derived(data.item?.id);
  let name = $derived(data.item?.name || '');
  let synonyms = $derived(data.item?.synonyms.join(', ') ?? '');
  let categoryId = $state('');

  async function saveItem() {
    const client = getApiClient();
    return client.api.shopping.item.$post({
      json: { id: id ?? null, name, categoryId: id ? null : categoryId, synonyms: synonyms.split(',') }
    });
  }

  async function deleteItem() {
    const client = getApiClient();
    return client.api.shopping.deleteItems.$post({ json: { itemIds: [id as string] } });
  }

  let deleteDialog = $state<HTMLDialogElement>();
</script>

<article>
  <h2>
    {#if data.item}
      { m.settings_items_edit() }
    {:else}
      { m.settings_items_add() }
    {/if}
  </h2>
  <ApiForm submitAction={saveItem} onSuccess={resolve('/settings/items')}>
    <ApiFormItem
      label={m.generic_name()}
      name="name"
      bind:value={name}
    />
    {#if !data.item}
      <ApiFormItem
        label={m.generic_category()}
        name="categoryId"
        type="select"
        bind:value={categoryId}
      >
        <option value="" selected></option>
        {#each data.categories as category (category.id)}
          <option value={category.id}>{category.name}</option>
        {/each}
      </ApiFormItem>
    {/if}
    <ApiFormItem
      label={m.settings_items_synonyms()}
      name="synonyms"
      bind:value={synonyms}
    />
    <p class="info">{ m.settings_items_synonyms_info() }</p>
    {#snippet additionalButtons()}
      {#if data.item}
        <button type="button" class="error" onclick={() => deleteDialog?.showModal()}>
          { m.settings_items_delete() }
        </button>
      {/if}
    {/snippet}
  </ApiForm>
</article>

{#if data.item}
  <dialog bind:this={deleteDialog}>
    <ApiForm
      submitAction={deleteItem}
      onSuccess={resolve('/settings/items')}
      submitButtonText={m.generic_confirm()}
      warnOnUnsavedChanges={false}
    >
      <h2>{m.settings_items_delete()}</h2>
      <p>{ m.settings_items_delete_single_info() }</p>
      {#snippet additionalButtons()}
        <button
          type="button"
          onclick={() => deleteDialog?.close()}
        >
          <Undo2 />
          { m.generic_cancel() }
        </button>
      {/snippet}
    </ApiForm>
  </dialog>
{/if}

<style>
    .info {
        margin-top: 0;
    }
</style>
