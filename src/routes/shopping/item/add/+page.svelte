<script lang="ts">
  import { enhance } from '$app/forms';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  let textValue = $state('');
  let isSubmitting = $state(false);

  const appendText = (name: string) => {
    // quick sanitizing
    textValue = textValue.trim();

    // empty input can be overridden
    if (textValue === '') {
      textValue = name;

      return;
    }

    // otherwise add the item in a new row
    textValue += `\n${name}`;
  };

  const formSubmitHandle = () => {
    // Runs before the form submits
    isSubmitting = true;

    // Runs after the server action completes
    return async ({ update }: {
      update: (options?: { reset?: boolean; invalidateAll?: boolean }) => Promise<void>;
    }) => {
      // Reset form state after successful submission and update/redirect
      textValue = '';
      isSubmitting = false;
      // Ensure the component updates if the action modified data
      // or completed a redirect.
      await update();
    };
  };
</script>

<div class="card w-full">
  {#await data.suggestions}
    <LoadingSpinner />
  {:then suggestions}
    <div class="flex flex-col gap-3">
      <h1 class="text-2xl font-semibold">{m.shopping_add_items()}</h1>
      {#if suggestions.length > 0}
        { m.shopping_add_items_suggestions() }
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {#each suggestions as suggestion (suggestion.id)}
            {#if !textValue.includes(suggestion.name)}
              <div class="flex items-center gap-1">
                <button class="btn text-sm" onclick={() => appendText(suggestion.name)}>
                  +
                </button>
                {suggestion.name}
              </div>
            {/if}
          {/each}
        </div>
      {/if}
      <form
        method="POST"
        action="?/create"
        use:enhance={formSubmitHandle}
      >
        <div class="flex flex-col gap-2">
          <button type="submit" class="btn btn-primary ml-auto" disabled={isSubmitting || textValue.trim() === ''}>
            {m.shopping_add_items()}
          </button>
          <label>
            { m.shopping_add_items_label() }
            <textarea
              bind:value={textValue}
              name="items"
              class="textarea textarea-bordered h-64 input form-input"
              placeholder={m.shopping_add_items_explanation()}
              disabled={isSubmitting}
            ></textarea>
          </label>
        </div>
      </form>
    </div>
  {/await}
</div>
