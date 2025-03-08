<script lang="ts">
	let { category } = $props();
</script>

<div class="card preset-filled-secondary-100-900 w-full">
	<!-- Header -->
	<div class="flex justify-between p-2">
		{category.name}
		<a href="/shopping/category/{category.id}" class="btn border">Edit</a>
	</div>
	<!-- Item list -->
	<div class="p-2">
		{#each category.shoppingItems as item}
			- {item.name}<br/>
		{/each}
		<form method="POST" action="/shopping/item?/create">
			<input type="hidden" name="categoryId" value={category.id}>
			<input class="preset-filled-secondary-50-950" type="text" name="name" />
		</form>
	</div>
</div>