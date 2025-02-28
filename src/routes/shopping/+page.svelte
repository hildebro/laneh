<script lang="ts">
	let { data } = $props();
</script>

{#await data.categories}
	loading...
{:then categories}
	<div class="flex flex-col gap-4 justify-center items-center w-full h-full">
		{#each categories as category}
			<div class="card preset-filled-secondary-100-900 w-full h-36">
				<!-- Header -->
				<div class="flex justify-between p-2">
					{category.name}
					<a href="/shopping/{category.id}" class="btn border">Edit</a>
				</div>
			</div>
		{/each}
		<a class="card btn preset-filled-primary-100-900 w-36 h-24" href="/shopping/add">
			Add new category
		</a>
	</div>
{/await}
