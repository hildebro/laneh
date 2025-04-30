<script lang="ts">
  import { Modal } from '@skeletonlabs/skeleton-svelte';
  import { enhance } from '$app/forms';
  import CategorizedItemSelect from '$lib/CategorizedItemSelect.svelte';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let openState = $state(false);

  // Reference to the form DOM element
  let formElement: HTMLFormElement | undefined = $state();

  function modalClose() {
    openState = false;
  }

  /**
   * Function to handle the form submit. Can't rely on submit button, because the modal that contains that button
   * is rendered outside of the form in the DOM.
   */
  function handleConfirmSubmit() {
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
  <form
    class="flex flex-col gap-4 items-center h-full w-full"
    method="POST"
    use:enhance
    bind:this={formElement}
  >
    <CategorizedItemSelect {categories} unfiltered />
    {#if form?.message}
      <p class="card preset-filled-error-50-950 rounded text-center">{form.message}</p>
    {/if}
    <button type="submit"
            class="btn preset-filled-warning-800-200"
            name="action"
            value="deactivate"
            onclick={modalClose}
    >
      { m.settings_items_deactivate() }
    </button>
    <Modal
      open={openState}
      onOpenChange={(e) => (openState = e.open)}
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
          <button type="button" class="btn preset-filled-warning-800-200" onclick={handleConfirmSubmit}>
            { m.generic_confirm() }
          </button>
        </div>
      {/snippet}
    </Modal>
  </form>
{/await}
