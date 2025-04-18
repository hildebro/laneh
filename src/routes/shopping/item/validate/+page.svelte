<script lang="ts">
  import { enhance } from '$app/forms';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  let closeMatchItems = $state(data.items.filter(item => item.status === 'close_match'));

  let isSubmitting = $state(false);
</script>

<svelte:head>
  <title>{ m.shopping_validate_headline() }</title>
</svelte:head>

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
    <div class="table-container preset-filled-primary-200-800 mt-2">
      <table class="table text-base">
        <thead>
        <tr>
          <th>Your input</th>
          <th>Existing item</th>
          <th>Prevent renaming?</th>
        </tr>
        </thead>
        <tbody>
        {#each closeMatchItems as item (item.name)}
          <tr>
            <td>{item.name}</td>
            <td>{item.suggestedItem?.name}</td>
            <td><input type="checkbox" name="{item.name}" /></td>
          </tr>
        {/each}
        </tbody>
      </table>
    </div>

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