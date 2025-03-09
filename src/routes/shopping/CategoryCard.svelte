<script lang="ts">
  import { enhance } from '$app/forms';

  let { category } = $props();
</script>

<div class="card preset-filled-secondary-100-900 w-full">
	<!-- Header -->
	<div class="flex justify-between">
		{category.name}
		<a href="/shopping/category/{category.id}" class="btn">Edit</a>
	</div>
	<!-- Item list -->
	{#each category.shoppingItems as item}
		- {item.name}<br />
	{/each}
	<form method="POST" action="/shopping/item?/create" use:enhance>
		<input type="hidden" name="categoryId" value={category.id}>
		<input class="form-input mt-2" type="text" name="name" />
	</form>
</div>