<script lang="ts">
  import { Modal, Switch } from '@skeletonlabs/skeleton-svelte';
  import { enhance } from '$app/forms';
  import CategorizedItemSelect from '$lib/CategorizedItemSelect.svelte';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let showInactiveItems = $state(false);

  let deleteModalVisible = $state(false);

  // Reference to the form DOM element
  let formElement: HTMLFormElement | undefined = $state();

  function modalClose() {
    deleteModalVisible = false;
  }

  /**
   * Function to handle the form submit. Can't rely on submit button, because the modal that contains that button
   * is rendered outside of the form in the DOM.
   */
  function handleDeleteSubmit() {
    // Use requestSubmit() which is often preferred as it respects validation and behaves more like a user
    // click on a submit button. submit() would also work but might bypass some checks.
    formElement?.requestSubmit();
    modalClose();
  }

  let { data, form } = $props();
</script>

{#await data.categories}
  <LoadingSpinner />
{:then categories}
  <div class="card mb-2 ml-auto preset-filled-primary-800-200">
    <Switch checked={showInactiveItems} onCheckedChange={(e) => (showInactiveItems = e.checked)}>
      { m.settings_items_show_inactive() }
    </Switch>
  </div>
  <form
    class="flex flex-col gap-4 items-center h-full w-full"
    method="POST"
    use:enhance
    bind:this={formElement}
  >
    <CategorizedItemSelect {categories} unfiltered={showInactiveItems} />
    {#if form?.message}
      <p class="card preset-filled-error-50-950 rounded text-center">{form.message}</p>
    {/if}
    <div class="card">
      { m.settings_items_change_category() }
      <div class="flex gap-1 flex-wrap mt-2">
        {#each categories as category (category.id)}
          <button type="submit"
                  class="btn"
                  name="category"
                  value={category.id}
                  onclick={modalClose}
          >
            {category.name}
          </button>
        {/each}
      </div>
      <div class="mt-4">{ m.settings_items_other_actions() }</div>
      <div class="flex gap-1 flex-wrap mt-2">
        <button type="submit"
                class="btn preset-filled-warning-800-200"
                name="action"
                value="deactivate"
                onclick={modalClose}
        >
          { m.settings_items_deactivate() }
        </button>
        <Modal
          open={deleteModalVisible}
          onOpenChange={(e) => (deleteModalVisible = e.open)}
          triggerBase="btn preset-filled-error-800-200"
          contentBase="card preset-filled-warning-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
          backdropClasses="backdrop-blur-sm"
        >
          {#snippet trigger()}{m.settings_items_delete()}{/snippet}
          {#snippet content()}
            <h2 class="h2">{m.settings_items_delete()}</h2>
            <p class="opacity-60">{ m.settings_items_delete_info() }</p>
            <div class="flex justify-end gap-4">
              <button type="button" class="btn preset-filled-warning-800-200" onclick={modalClose}>
                { m.generic_cancel() }
              </button>
              <button type="button" class="btn preset-filled-warning-800-200" onclick={handleDeleteSubmit}>
                { m.generic_confirm() }
              </button>
            </div>
          {/snippet}
        </Modal>
      </div>
    </div>
  </form>
{/await}
