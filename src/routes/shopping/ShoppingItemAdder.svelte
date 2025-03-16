<script lang="ts">
  import type { ShoppingItem } from '$lib/server/db/schema';
  import { invalidateAll } from '$app/navigation';

  let { categoryId, options }: { categoryId: string, options: ShoppingItem[] } = $props();

  let expanded = $state(false);

  let nameValue = $state('');
  let amountValue = $state('');
  const filteredOptions = $derived(
    options.filter((item) =>
      nameValue === '' || item.name.toLowerCase().startsWith(nameValue.toLowerCase())
    )
  );

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  }

  async function handleSubmit() {
    let trimmedName = nameValue.trim();
    if (!trimmedName) {
      return; // Don't send empty values
    }

    try {
      const formData = new FormData();
      formData.append('categoryId', categoryId);
      formData.append('name', trimmedName);
      formData.append('amount', amountValue)
      const response = await fetch('shopping/item?/create', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        console.log('Data sent successfully!');
        nameValue = ''; // Clear the input after successful submission
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
	<div class="flex flex-col w-full">
		<div class="flex gap-1 w-full">
			<label class="w-1/2">
				Name
				<input
					type="text"
					bind:value={nameValue}
					placeholder="Type and hit enter..."
					class="form-input input"
					name="name"
					autocomplete="off"
					onkeydown={handleKeyDown}
				/>
			</label>
			<label class="w-1/4">
				Amount
				<input
					type="text"
					bind:value={amountValue}
					placeholder="1x"
					class="form-input input"
					name="name"
					autocomplete="off"
					onkeydown={handleKeyDown}
				/>
			</label>
		</div>
		<div class="flex flex-col w-1/2">
			Or select a suggestion:
			{#each filteredOptions as option}
				<button
					onclick={() => nameValue = option.name}
					class="form-input"
				>
					{option.name}
				</button>
			{/each}
		</div>
	</div>
{/if}