<script lang="ts">
  import { enhance } from '$app/forms';

  let { data } = $props();

  // Initialize form state directly from props
  let categoryName = $state(data.category?.name || '');
</script>

<div class="flex justify-center items-center h-full bg-surface-100">
	<div class="card p-8  preset-filled-primary-100-900">
		<div class="h4 mb-2">{data.category ? 'Edit Category' : 'Add New Category'}</div>
		<form method="POST" use:enhance>
			<input type="hidden" name="categoryId" value={data.category?.id}>
			<div class="mb-4">
				<label>
					Name
					<input class="input preset-filled-primary-50-950 border" type="text" name="name" bind:value={categoryName}
								 required />
				</label>
			</div>
			<div class="flex flex-col sm:flex-row gap-2">
				<button type="submit" class="btn preset-filled-primary-800-200 variant-outline w-full sm:w-1/2">
					{data.category ? 'Update' : 'Create'}
				</button>
			</div>
		</form>
	</div>
</div>
