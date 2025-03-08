<script lang="ts">
	import CategoryCard from './CategoryCard.svelte';

	let { data } = $props();
</script>

{#await data.categories}
	loading...
{:then categories}
	<a href="/shopping/purchase" class="btn border preset-filled-primary-600-400 float-right">Start purchase</a>
	<div class="flex flex-col gap-4 items-center w-full h-full">
		{#each categories as category}
			<CategoryCard {category}></CategoryCard>
		{/each}
		<a class="card btn preset-filled-primary-100-900 w-36 h-24" href="/shopping/add">
			Add new category
		</a>
	</div>
{/await}
