<script lang="ts">
  import type { ShoppingItem } from '$lib/server/db/schema';
  import { invalidateAll } from '$app/navigation';

  let { categoryId, options }: { categoryId: string, options: ShoppingItem[] } = $props();

  let expanded = $state(false);

  let inputValue = $state('');
  const filteredOptions = $derived(
    options.filter((item) =>
      inputValue === '' || item.name.toLowerCase().startsWith(inputValue.toLowerCase())
    )
  );

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  }

  async function handleSubmit() {
    let trimmedValue = inputValue.trim();
    if (!trimmedValue) {
      return; // Don't send empty values
    }

    try {
      const formData = new FormData();
      formData.append('categoryId', categoryId);
      formData.append('name', trimmedValue);
      const response = await fetch('/shopping/item?/create', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        console.log('Data sent successfully!');
        inputValue = ''; // Clear the input after successful submission
        await invalidateAll();
      } else {
        console.error('Failed to send data:', response.status);
        // Optionally display an error message to the user
      }
    } catch (error) {
      console.error('An error occurred:', error);
      // Optionally display an error message to the user
    }
  }
</script>

{#if !expanded}
	<button onclick={() => expanded = true} class="btn">
		Add items
	</button>
{:else }
	<div class="flex flex-col">
		<input
			type="text"
			bind:value={inputValue}
			placeholder="Type and hit enter..."
			class="form-input"
			name="name"
			autocomplete="off"
			onkeydown={handleKeyDown}
		/>
		Or select a suggestion:
		{#each filteredOptions as option}
			<button
				onclick={() => inputValue = option.name}
				class="form-input"
			>
				{option.name}
			</button>
		{/each}
	</div>
{/if}