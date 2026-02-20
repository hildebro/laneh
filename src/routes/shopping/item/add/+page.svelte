<script lang="ts">
  import { Collapsible } from '@skeletonlabs/skeleton-svelte';
  import levenshteinPkg from 'fast-levenshtein';
  import { CircleAlert, CirclePlus, Trash2 } from 'lucide-svelte';
  import { tick } from 'svelte';
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { toaster } from '$lib/toaster-ref';
  // The actual function is usually on the '.get' property for this library
  const levenshtein = levenshteinPkg.get;

  let { data } = $props();

  let correctionRequired = $state(true);

  let items: { amount: string, name: string, collapsibleOpen: boolean, overwrittenName?: string }[] = $state(
    [{
      amount: '',
      name: '',
      collapsibleOpen: false,
      overwrittenName: undefined
    }]
  );

  let amountRefs: HTMLInputElement[] = [];
  let nameRefs: HTMLInputElement[] = [];

  async function addEmptyRow() {
    items.push({ amount: '', name: '', collapsibleOpen: false });

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

        return;
      }
    }

    // Push a new line, if no empty line was present to fill.
    items.push({ amount: '', name, collapsibleOpen: false });
  }

  function suggestionNotPresent(name: string) {
    return !items.find(item => item.name === name);
  }

  function deleteItem(index: number) {
    if (items.length > 1) {
      items.splice(index, 1);
    } else {
      // If we only have a single line, we clear it instead of removing it. It's not a great UX to
      // have no input fields at all.
      items[index].amount = '';
      items[index].name = '';
    }
  }

  async function handleKeyDown(e: KeyboardEvent, index: number, field: 'amount' | 'name') {
    const isEnter = e.key === 'Enter';
    const isTabForward = e.key === 'Tab' && !e.shiftKey;

    if (!isEnter && !isTabForward) return;

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

  function applyCorrections(e: MouseEvent) {
    let anyItemCorrected = false;
    for (const index in items) {
      anyItemCorrected = anyItemCorrected || handleCorrection(parseInt(index));
    }

    if (anyItemCorrected) {
      // Prevent the button from causing a submit.
      e.preventDefault();
      // Let the user know about executed corrections.
      toaster.warning({
        title: m.shopping_add_items_correction_title(),
        description: m.shopping_add_items_correction_description(),
        duration: 5000
      });
      // Flip the value, so the next submit won't execute corrections again. Note that it's
      // technically more appropriate to update this flag outside the if-clause. Whether something
      // was corrected doesn't really matter for this flag: It could be set to false regardless.
      // But that would cause the correction button to be removed from the DOM and in turn prevent
      // the submit action. Since we only want to prevent it, if an item was corrected, we are
      // forced to keep it here.
      correctionRequired = false;
    }
  }

  function handleCorrection(index: number): boolean {
    const maxDistance = 2;

    const name = items[index].name.trim().toLowerCase();
    if (name.length === 0) {
      return false;
    }

    let closestItem = null;
    let minDistanceFound = Infinity; // Start with a distance larger than any possible outcome

    for (const item of data.allItems) {
      const compareName = item.name.trim().toLowerCase();

      // If an exact match exists, we don't need to correct.
      if (compareName === name) {
        return false;
      }

      // Calculate Levenshtein distance
      const distance = levenshtein(name, compareName);

      // Check if this item is within the threshold AND closer than the current best match found
      if (distance > 0 && distance <= maxDistance && distance < minDistanceFound) {
        // We found a new closest item
        minDistanceFound = distance;
        closestItem = item;
      }
    }

    if (closestItem) {
      items[index].overwrittenName = items[index].name;
      items[index].name = closestItem.name;
    }

    return !!closestItem;
  }

  function handleRestore(index: number) {
    if (items[index].overwrittenName) {
      items[index].name = items[index].overwrittenName;
      items[index].overwrittenName = undefined;
      items[index].collapsibleOpen = false;
    }
  }
</script>

<div class="card w-full">
  <EnhancedForm submitButtonClasses="ml-auto" hideSubmitButton={correctionRequired}>
    <h1 class="text-2xl font-semibold">{m.shopping_add_items()}</h1>
    <div class="flex flex-col gap-1">
      <div class="flex gap-1">
        <div class="w-18">{ m.generic_amount() }</div>
        <div>{ m.generic_name() }</div>
      </div>
      {#each items as item, index (index)}
        <div class="flex gap-1">
          <input
            name="amounts"
            bind:this={amountRefs[index]}
            class="input w-18"
            type="text"
            placeholder="1"
            bind:value={item.amount}
            onkeydown={(e) => handleKeyDown(e, index, 'amount')}
          />

          <Collapsible
            open={item.collapsibleOpen}
            onOpenChange={(details) => (item.collapsibleOpen = details.open)}
          >
            <div class="flex gap-0.5">
              <input
                name="names"
                bind:this={nameRefs[index]}
                class="input"
                type="text"
                bind:value={item.name}
                onkeydown={(e) => handleKeyDown(e, index, 'name')}
              />
              {#if item.overwrittenName}
                <Collapsible.Trigger>
                  <button
                    type="button"
                    class="btn preset-filled-warning-800-200 btn-sm"
                    tabindex="-1"
                  >
                    <CircleAlert />
                  </button>
                </Collapsible.Trigger>
              {/if}
            </div>
            <Collapsible.Content>
              { m.shopping_add_items_original_value({ value: item.overwrittenName ?? '' }) }
              <button type="button"
                      class="btn"
                      onclick={() => handleRestore(index)}
              >
                { m.shopping_add_items_original_value_revert() }
              </button>
            </Collapsible.Content>
          </Collapsible>
          <button
            type="button"
            class="btn preset-filled-error-800-200 btn-sm"
            tabindex="-1"
            onclick={() => deleteItem(index)}
          >
            <Trash2 />
          </button>
        </div>
      {/each}
      <div class="flex gap-2">
        <button type="button" class="btn btn-sm" onclick={addEmptyRow}>
          <CirclePlus />
        </button>
      </div>
      {#await data.suggestions}
        <LoadingSpinner />
      {:then suggestions}
        {m.shopping_add_items_suggestions()}
        {#each suggestions as suggestion(suggestion.name)}
          {#if suggestionNotPresent(suggestion.name)}
            <button type="button" class="btn" onclick={() => addSuggestion(suggestion.name)}>
              {suggestion.name}
            </button>
          {/if}
        {/each}
      {/await}
    </div>
    {#snippet additionalButtons()}
      {#if correctionRequired}
        <button class="btn ml-auto" type="submit" onclick={applyCorrections}>{ m.generic_save() }</button>
      {/if}
    {/snippet}
  </EnhancedForm>
</div>