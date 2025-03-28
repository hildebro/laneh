<script lang="ts">
  import { enhance } from '$app/forms';

  let textValue = $state('');
  let isSubmitting = $state(false);
</script>

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
	<label class="form-label">
		<span>Add Items (one per line, e.g., "2x Apples" or "Milk")</span>
		<textarea
			bind:value={textValue}
			name="items"
			class="textarea textarea-bordered w-full h-32"
			placeholder="Add items..."
			disabled={isSubmitting}
		></textarea>
	</label>

	<button type="submit" class="btn btn-primary mt-2" disabled={isSubmitting || textValue.trim() === ''}>
		{#if isSubmitting}
			<span class="loading loading-spinner loading-xs"></span> Processing...
		{:else}
			Add Items to List
		{/if}
	</button>
</form>