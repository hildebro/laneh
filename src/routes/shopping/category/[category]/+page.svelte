<script lang="ts">
  import { enhance } from '$app/forms';

  let { data } = $props();

  // Initialize form state directly from props
  let categoryName = $state(data.category?.name || '');
</script>

<div class="card">
	<div class="h5 mb-4">{data.category ? 'Edit Category' : 'Add New Category'}</div>
	<form method="POST" use:enhance>
		<input type="hidden" name="categoryId" value={data.category?.id}>
		<div class="mb-2">
			<label>
				Name
				<br />
				<input type="text" name="name" bind:value={categoryName} required />
			</label>
		</div>
		<button type="submit" class="btn">
			{data.category ? 'Update' : 'Create'}
		</button>
	</form>
</div>
