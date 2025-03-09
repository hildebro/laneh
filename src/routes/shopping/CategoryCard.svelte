<script lang="ts">
  import { enhance } from '$app/forms';
  import SearchSelect from './SearchSelect.svelte';
  import type { ShoppingItem } from '$lib/server/db/schema';

  let { category } = $props();
</script>

<div class="card w-full">
	<!-- Header -->
	<div class="flex justify-between">
		{category.name}
		<a href="/shopping/category/{category.id}" class="btn">Edit</a>
	</div>
	<!-- Item list -->
	{#each category.shoppingItems.filter((item: ShoppingItem) => item.active) as item}
		- {item.name}<br />
	{/each}
	<form method="POST" action="/shopping/item?/create" use:enhance>
		<input type="hidden" name="categoryId" value={category.id}>
		<SearchSelect options={category.shoppingItems.filter((item: ShoppingItem) => !item.active)}/>
	</form>
</div>