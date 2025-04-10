<script lang="ts">
  import { enhance } from '$app/forms';

  let textValue = $state('');
  let isSubmitting = $state(false);
</script>

<div class="card">
  <form
    method="POST"
    action="?/create"
    use:enhance={() => {
        // Runs before the form submits
        isSubmitting = true;

        // Runs after the server action completes
        return async ({ update }) => {
            // Reset form state after successful submission and update/redirect
            textValue = '';
            isSubmitting = false;
            // Ensure the component updates if the action modified data
            // or completed a redirect.
            await update();
        };
    }}
  >
    <div class="flex flex-col">
      <h1 class="text-2xl font-semibold mb-4">Add items to shopping list</h1>
      <span>Write one type of item per line.</span>
      <span>You can add an amount for each line, i.e. "3 Tomatoes" or "Milk 2x".</span>
      <textarea
        bind:value={textValue}
        name="items"
        class="textarea textarea-bordered w-full h-32"
        placeholder="Items to add..."
        disabled={isSubmitting}
      ></textarea>
    </div>

    <button type="submit" class="btn btn-primary mt-2" disabled={isSubmitting || textValue.trim() === ''}>
      {#if isSubmitting}
        <span class="loading loading-spinner loading-xs"></span> Processing...
      {:else}
        Add Items to List
      {/if}
    </button>
  </form>
</div>
