<script lang="ts">
  import type { ShoppingItem } from '$lib/server/db/schema';
  import ShoppingItemAdder from './ShoppingItemAdder.svelte';

  let { category } = $props();
</script>

<div class="card w-full">
	<!-- Header -->
	<div class="flex justify-between">
		<b>{category.name}</b>
		<a href="shopping/category/{category.id}" class="btn">Edit</a>
	</div>
	<!-- Item list -->
	<div class="mb-2">
		{#each category.shoppingItems.filter((item: ShoppingItem) => item.active) as item}
			- {item.amount} {item.name}<br />
		{/each}
	</div>
</div>