<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  let closeMatchItems = $state(data.items.filter(item => item.status === 'close_match'));
  let perfectMatchItems = $state(data.items.filter(item => item.status === 'perfect_match'));
  let unmatchedItems = $state(data.items.filter(item => item.status === 'unmatched'));

  let isSubmitting = $state(false);
</script>

<svelte:head>
  <title>Validate Shopping Items</title>
</svelte:head>

<div class="card">
  <h1 class="text-2xl font-semibold mb-4">Validate Shopping Items</h1>

  <b>Existing items</b> (will be reactivated and receive the new amount you defined):
  <ul>
    {#each perfectMatchItems as item(item.id)}
      <li>
        - {item.amount} {item.name}
      </li>
    {/each}
  </ul>
  <br />
  <b>New items</b> (must be categorized in the next step):
  <ul>
    {#each unmatchedItems as item(item.id)}
      <li>
        - {item.amount} {item.name}
      </li>
    {/each}
  </ul>
  <br />
  <form
    method="POST"
    use:enhance={() => {
        isSubmitting = true;
        return async ({ update }) => {
          isSubmitting = false;
          await update(); // Perform redirect or update UI
        };
      }}
  >
    <b>Potentially existing items</b> (look very similar to existing items).
    <br />
    By default, your input items will be renamed to match the existing items. You can prevent the
    renaming to create new items instead by clicking the associated checkbox.
    <div class="table-container preset-filled-primary-200-800 mt-2">
      <table class="table">
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
        {#if isSubmitting}
          <span class="loading loading-spinner loading-xs"></span> Saving...
        {:else}
          Continue
        {/if}
      </button>
    </div>
  </form>
</div>