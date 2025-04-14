<script lang="ts">
  import { enhance } from '$app/forms';
  import * as m from '$lib/paraglide/messages.js';

  let textValue = $state('');
  let isSubmitting = $state(false);
</script>

<div class="card w-full">
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
      <h1 class="text-2xl font-semibold mb-4">{m.shopping_add_items()}</h1>
      <textarea
        bind:value={textValue}
        name="items"
        class="textarea textarea-bordered h-64"
        placeholder={m.shopping_add_items_explanation()}
        disabled={isSubmitting}
      ></textarea>
    </div>

    <button type="submit" class="btn btn-primary mt-2" disabled={isSubmitting || textValue.trim() === ''}>
      {m.shopping_add_items()}
    </button>
  </form>
</div>
