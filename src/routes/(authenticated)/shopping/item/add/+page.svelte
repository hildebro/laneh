<script lang="ts">
  import { CircleAlert, CirclePlus, Trash } from '@lucide/svelte';
  import { tick } from 'svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { getLocale } from '$lib/paraglide/runtime.js';
  import { addToast } from '$lib/stores/toast';
  import { handleApiLoad } from '$lib/utils/apiHelper';
  import { setStagedShoppingItems } from '$lib/utils/shoppingItemStaging';

  let { data } = $props();

  let correctionRequired = $state(true);
  let correcting = $state(false);

  type RowItem = {
    amount: string,
    name: string,
    preventCorrection: boolean,
    overwrittenName?: string
  };

  let items: RowItem[] = $state(
    [{
      amount: '',
      name: '',
      preventCorrection: false,
      overwrittenName: undefined
    }]
  );

  let amountRefs: HTMLInputElement[] = [];
  let nameRefs: HTMLInputElement[] = [];

  async function addEmptyRow() {
    items.push({ amount: '', name: '', preventCorrection: false });

    // Wait for DOM update
    await tick();

    // Focus the 'amount' field of the newly created last item
    const lastIndex = items.length - 1;
    amountRefs[lastIndex]?.focus();
  }

  function addSuggestion(name: string) {
    for (const index in items) {
      if (items[index].name.trim().length === 0 && items[index].amount.trim().length === 0) {
        items[index].name = name;

        // Ensure we still have an empty line at the end after insertion.
        if (items[items.length - 1].name.trim().length > 0) {
          items.push({ amount: '', name: '', preventCorrection: false });
        }

        return;
      }
    }

    // Push the suggestion and a new empty line, if no empty line was present to fill.
    items.push({ amount: '', name, preventCorrection: false });
    items.push({ amount: '', name: '', preventCorrection: false });
  }

  // Show the first few suggestions that aren't in the list yet, so picked ones get replaced by the next in line.
  const maxVisibleSuggestions = 6;
  let visibleSuggestions = $derived(
    data.suggestions
      .filter(suggestion => !items.some(item => item.name === suggestion.name))
      .slice(0, maxVisibleSuggestions)
  );

  function deleteItem(index: number) {
    if (items.length > 1) {
      items.splice(index, 1);
    } else {
      // If we only have a single line, we clear it instead of removing it. It's not a great UX to
      // have no input fields at all.
      items[index].amount = '';
      items[index].name = '';
      items[index].preventCorrection = false;
      items[index].overwrittenName = undefined;
    }
  }

  async function handleKeyDown(e: KeyboardEvent, index: number, field: 'amount' | 'name') {
    const isEnter = e.key === 'Enter';
    const isTabForward = e.key === 'Tab' && !e.shiftKey;

    if (!isEnter && !isTabForward) {
      // Any kind of manual change to the input fields should force corrections again.
      correctionRequired = true;
      items[index].preventCorrection = false;
      items[index].overwrittenName = undefined;

      return;
    }

    e.preventDefault();

    if (field === 'amount') {
      // Jump to Name in same row
      nameRefs[index]?.focus();
    } else {
      // Jump to next row or create a new one
      const isLastItem = index === items.length - 1;

      if (isLastItem) {
        await addEmptyRow();
      } else {
        amountRefs[index + 1]?.focus();
      }
    }
  }

  async function applyCorrections(e: MouseEvent) {
    if (!correctionRequired) {
      // With this return, the corrections will be skipped and the normal submit action will come next.
      return;
    }

    // Looking up similar items takes a request, so the submit is triggered manually afterwards, if nothing changed.
    e.preventDefault();
    const form = (e.currentTarget as HTMLButtonElement).form;

    correcting = true;
    let anyItemCorrected = false;
    try {
      anyItemCorrected = await handleCorrections();
    } catch (error) {
      // Corrections are only a convenience, so a failed lookup shouldn't keep the items from being added.
      console.error(error);
    } finally {
      correcting = false;
    }

    // The next submit won't execute corrections again, so reverted corrections stick.
    correctionRequired = false;

    if (anyItemCorrected) {
      // Let the user know about executed corrections.
      addToast({ message: m.shopping_add_items_corrected(), duration: 6000 });
    } else {
      form?.requestSubmit();
    }
  }

  async function submitAction() {
    const client = getApiClient();
    return client.api.shopping.items.$post({
      json: items
    });
  }

  async function onSuccess(response: Response) {
    const result = await response.json();
    if (result.committed) {
      await goto(resolve('/shopping'));
    } else {
      // Unknown items need a category first. Until then, the list is kept on the device.
      setStagedShoppingItems(data.logged_in_user.id, result.items);
      await goto(resolve('/shopping/item/categorize'));
    }
  }

  /**
   * Replaces names that most likely refer to an existing item (typos, plurals) with that item's name. Returns true, if
   * any item has been corrected.
   */
  async function handleCorrections(): Promise<boolean> {
    const itemsToCorrect = items.filter(item => !item.preventCorrection && item.name.trim().length > 0);
    if (itemsToCorrect.length === 0) {
      return false;
    }

    const client = getApiClient();
    const similarItems = await handleApiLoad(client.api.shopping.similarItems.$post({
      json: { names: itemsToCorrect.map(item => item.name), locale: getLocale() }
    }));

    let anyItemCorrected = false;
    for (const item of itemsToCorrect) {
      const similarItem = similarItems[item.name.trim()];
      if (similarItem) {
        item.overwrittenName = item.name;
        item.name = similarItem.name;
        anyItemCorrected = true;
      }
    }

    return anyItemCorrected;
  }

  function handleRestore(index: number) {
    if (items[index].overwrittenName) {
      items[index].name = items[index].overwrittenName;
      items[index].overwrittenName = undefined;
      // After a correction is reverted, we don't want that field to be corrected again (unless that
      // field is modified later).
      items[index].preventCorrection = true;
    }
  }

  let correctionDialog: HTMLDialogElement;
  let correctionItemIndex: number | undefined = $state();
</script>

<dialog bind:this={correctionDialog}>
  <p>
    { m.shopping_add_items_original_value({ value: items[correctionItemIndex!]?.overwrittenName ?? '' }) }
  </p>
  <form method="dialog">
    <button onclick={() => handleRestore(correctionItemIndex!)}>
      { m.shopping_add_items_original_value_revert() }
    </button>
    <button>{m.generic_close()}</button>
  </form>
</dialog>

<article>
  <div class="header">
    <h4>{m.shopping_add_items()}</h4>
  </div>
  <ApiForm {submitAction} submitButtonHidden {onSuccess}>
    <table class="items-table">
      <thead>
      <tr>
        <th class="col-amount">{ m.generic_amount() }</th>
        <th>{ m.generic_name() }</th>
        <th></th>
      </tr>
      </thead>
      <tbody>
      {#each items as item, index (index)}
        <tr>
          <td>
            <input
              name="amounts"
              bind:this={amountRefs[index]}
              type="text"
              bind:value={item.amount}
              onkeydown={(e) => handleKeyDown(e, index, 'amount')}
            />
          </td>
          <td>
            <input
              name="names"
              bind:this={nameRefs[index]}
              type="text"
              bind:value={item.name}
              onkeydown={(e) => handleKeyDown(e, index, 'name')}
            />
          </td>
          <td class="actions-cell">
            {#if !!item.overwrittenName}
              <button
                type="button"
                class:warning={!!item.overwrittenName}
                onclick={() => {
                  correctionItemIndex = index;
                  correctionDialog.showModal();
                }}
              >
                <CircleAlert />
              </button>
            {/if}
            <button
              type="button"
              tabindex="-1"
              onclick={() => deleteItem(index)}
            >
              <Trash />
            </button>
          </td>
        </tr>
      {/each}
      <tr>
        <td>
          <button type="button" onclick={addEmptyRow}>
            <CirclePlus />
          </button>
        </td>
      </tr>
      </tbody>
    </table>

    {#if visibleSuggestions.length > 0}
      {m.shopping_add_items_suggestions()}
      <div class="suggestion-box">
        {#each visibleSuggestions as suggestion(suggestion.name)}
          <button class="tertiary" type="button" onclick={() => addSuggestion(suggestion.name)}>
            {suggestion.name}
          </button>
        {/each}
      </div>
    {/if}
    {#snippet additionalButtons()}
      <button type="submit" onclick={applyCorrections} disabled={correcting}>{ m.generic_save() }</button>
    {/snippet}
  </ApiForm>
</article>

<style>
    dialog {
        white-space: pre-line;
    }

    .header {
        display: flex;
        justify-content: space-between;
    }

    .items-table {
        margin-bottom: 1rem;
        margin-top: 1rem;
    }

    .col-amount {
        width: 5rem;
    }

    .actions-cell {
        display: flex;
    }

    .suggestion-box {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }
</style>
