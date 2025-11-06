<script lang="ts">
  import { Dialog, Portal, Switch } from '@skeletonlabs/skeleton-svelte';
  import { Trash, Undo2 } from 'lucide-svelte';
  import CategorizedItemSelect from '$lib/CategorizedItemSelect.svelte';
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let showInactiveItems = $state(false);

  let deleteModalVisible = $state(false);

  let { data } = $props();

  let itemIds = $state([]);
</script>

{#await data.categories}
  <LoadingSpinner />
{:then categories}
  <div class="btn mb-2 ml-auto">
    <Switch checked={showInactiveItems} onCheckedChange={(e) => (showInactiveItems = e.checked)}>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Label>{ m.settings_items_show_inactive() }</Switch.Label>
      <Switch.HiddenInput />
    </Switch>
  </div>
  <div class="flex flex-col gap-4 w-full">
    <CategorizedItemSelect bind:value={itemIds} {categories} unfiltered={showInactiveItems} />
    <div class="card">
      <EnhancedForm action="?/setCategory" hideSubmitButton preUpdatedCallback={() => itemIds = []}>
        <input type="hidden" name="itemIds" value={itemIds}>
        { m.settings_items_change_category() }
        {#snippet additionalButtons(submitting)}
          {#each categories as category (category.id)}
            <button type="submit"
                    class="btn"
                    name="categoryId"
                    value={category.id}
                    disabled={submitting}
            >
              {category.name}
            </button>
          {/each}
        {/snippet}
      </EnhancedForm>
    </div>
    <div class="card">
      { m.settings_items_other_actions() }
      <div class="flex gap-1.5">
        <EnhancedForm action="?/deactivateItems" submitButtonText={m.settings_items_deactivate()}>
          <input type="hidden" name="itemIds" value={itemIds}>
        </EnhancedForm>
        <Dialog
          open={deleteModalVisible}
          onOpenChange={(e) => (deleteModalVisible = e.open)}
        >
          <Dialog.Trigger class="btn preset-filled-error-800-200 mt-4">{m.settings_items_delete()}</Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop class="fixed inset-0 z-50 backdrop-blur-sm" />
            <Dialog.Positioner class="fixed inset-0 z-50 flex justify-center items-center">
              <Dialog.Content class="card preset-filled-error-100-900 p-5 space-y-4 shadow-xl max-w-screen-sm">
                <Dialog.Description>
                  <h2 class="h2">{m.settings_items_delete()}</h2>
                  <p class="opacity-60">{ m.settings_items_delete_info() }</p>
                  <EnhancedForm action="?/deleteItems" hideSubmitButton
                                preUpdatedCallback={() => deleteModalVisible = false}>
                    <input type="hidden" name="itemIds" value={itemIds}>
                    {#snippet additionalButtons()}
                      <button type="button" class="btn preset-filled-surface-800-200"
                              onclick={() => deleteModalVisible = false}>
                        <Undo2 />
                        { m.generic_cancel() }
                      </button>
                      <button type="submit" class="btn preset-filled-error-800-200">
                        <Trash />
                        { m.generic_confirm() }
                      </button>
                    {/snippet}
                  </EnhancedForm>
                </Dialog.Description>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog>
      </div>
    </div>
  </div>
{/await}
