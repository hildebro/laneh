<script lang="ts">
	let { data } = $props();

  // Initialize form state directly from props
  let categoryName = $state(data.category?.name || '');
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
	<input type="hidden" name="categoryId" value={data.category?.id}>
	<button type="submit">{data.category ? 'Update' : 'Create'}</button>
</form>