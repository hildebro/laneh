<script lang="ts">
	let { data } = $props();
	let categoryName = $state('');

	$effect(() => {
		if (data.category) {
			categoryName = data.category.name;
		}
	});
</script>

<h1>{data.category ? 'Edit Category' : 'Add New Category'}</h1>

<form method="POST">
	<input
		type="text"
		name="name"
		placeholder="Category name"
		bind:value={categoryName}
		required
	/>
	<button type="submit">{data.category ? 'Update' : 'Create'}</button>
</form>