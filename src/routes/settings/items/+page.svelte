<script lang="ts">
  import { Trash, Undo2 } from 'lucide-svelte';
  import CategorizedItemSelect from '$lib/CategorizedItemSelect.svelte';
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let showInactiveItems = $state(false);

  let { data } = $props();

  let itemIds = $state([]);

  let deleteDialog: HTMLDialogElement;
</script>

{#await data.categories}
  <article>
    <LoadingSpinner />
  </article>
{:then categories}
  <div class="action-bar">
    <label>
      <input type="checkbox" checked={showInactiveItems} onchange={() => showInactiveItems = !showInactiveItems} />
      { m.settings_items_show_inactive() }
    </label>
  </div>
  <CategorizedItemSelect bind:value={itemIds} {categories} unfiltered={showInactiveItems} />
  <article>
    <h2>{ m.settings_items_change_category() }</h2>
    <EnhancedForm
      action="?/setCategory"
      hideSubmitButton
      submitButtonsLayout="action-row"
      preUpdatedCallback={() => itemIds = []}
    >
      <input type="hidden" name="itemIds" value={itemIds}>
      {#snippet additionalButtons(submitting)}
        {#each categories as category (category.id)}
          <button
            type="submit"
            name="categoryId"
            value={category.id}
            disabled={submitting}
          >
            {category.name}
          </button>
        {/each}
      {/snippet}
    </EnhancedForm>
    <hr />
    <h2>{ m.settings_items_other_actions() }</h2>
    <div class="action-row">
      <EnhancedForm
        action="?/deactivateItems"
        submitButtonClasses="warning"
        submitButtonsLayout="none"
        submitButtonText={m.settings_items_deactivate()}
        preUpdatedCallback={() => itemIds = []}
      >
        <input type="hidden" name="itemIds" value={itemIds}>
      </EnhancedForm>
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
{/await}

<style>
    hr {
        margin-top: 1rem;
        margin-bottom: 1rem;
    }
</style>