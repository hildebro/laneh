<script lang="ts">
  import type { ShoppingItem } from '$lib/server/db/schema';

  let { options }: {options: ShoppingItem[]} = $props();

  let inputValue = $state('');
  const filteredOptions = $derived(
    options.filter((item) =>
      item.name.toLowerCase().startsWith(inputValue.toLowerCase())
    )
  );
  let showDropdown = $derived(inputValue.length > 0 && filteredOptions.length > 0);
</script>

<div class="relative">
	<input
		type="text"
		bind:value={inputValue}
		placeholder="Type to search..."
		class="form-input mt-2"
		name="name"
		autocomplete="off"
	/>

	{#if showDropdown}
		<div
			class="absolute z-50 w-64 mt-1 bg-surface-100 border border-surface-300 rounded shadow-lg"
			role="listbox"
		>
			{#each filteredOptions as option}
				<!-- Setting the option as the input value is enough, because the form submit is automatically triggered afterwards. -->
				<button
					onclick={() => inputValue = option.name}
					class="w-full px-4 py-2 text-left hover:bg-primary-500 hover:text-white transition-colors"
				>
					{option.name}
				</button>
			{/each}
		</div>
	{/if}
</div>