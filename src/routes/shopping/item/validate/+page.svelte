<script lang="ts">
  import CancelAction from '../cancel/CancelAction.svelte';
  import { enhance } from '$app/forms';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  let closeMatchItems = $state(data.items.filter(item => item.status === 'close_match'));
  // Keep track of the checkbox states
  let checkboxStates = $state(Object.fromEntries(data.items.map(item => [item.id, true])));

  let isSubmitting = $state(false);
</script>

<svelte:head>
  <title>{ m.shopping_validate_headline() }</title>
</svelte:head>

<CancelAction />
<div class="card">
  <h1 class="text-2xl font-semibold mb-4">{ m.shopping_validate_headline() }</h1>

  <form
    method="POST"
    use:enhance={() => {
        isSubmitting = true;
        return async ({ update }) => {
          isSubmitting = false;
          await update();
        };
      }}
  >
    { m.shopping_validate_explanation() }
    {#each closeMatchItems as item (item.id)}
      <div class="mt-2 flex gap-2 items-center">
        <input type="checkbox" name="{item.name}" bind:checked={checkboxStates[item.id]} />
        <span
          class:preset-filled-success-100-900={!checkboxStates[item.id]}
          class:preset-filled-error-100-900={checkboxStates[item.id]}
          class:line-through={checkboxStates[item.id]}
        >
          {item.name}
        </span>
        {#if checkboxStates[item.id]}
          ⟶ <span class="preset-filled-success-100-900">{item.suggestedItem?.name}</span>
        {/if}
      </div>
    {/each}

    <div class="mt-6 text-center">
      <button type="submit" class="btn" disabled={isSubmitting}>
        { m.generic_continue() }
      </button>
    </div>
  </form>

  <br />

  { m.shopping_validate_all_items() }
  <ul>
    {#each data.items as item(item.id)}
      <li>
        - {item.amount} {item.name}
      </li>
    {/each}
  </ul>
</div>
