<script lang="ts">
	let { data } = $props();
</script>

{#await data.categories}
	loading...
{:then categories}
	<div class="flex gap-4 justify-center items-center w-full h-full">
		{#each categories as category}
			<a href="/shopping/{category.name}" class="card btn preset-filled-secondary-100-900 w-32 h-24">{category.name}</a>
		{/each}
		<a class="card btn preset-filled-primary-100-900 w-32 h-24" href="/shopping/add">
			Add new category
		</a>
	</div>
{/await}
