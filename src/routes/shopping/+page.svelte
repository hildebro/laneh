<script lang="ts">
	import CategoryCard from './CategoryCard.svelte';

	let { data } = $props();
</script>

{#await data.categories}
	loading...
{:then categories}
	<div class="flex flex-col gap-4 justify-center items-center w-full h-full">
		{#each categories as category}
			<CategoryCard {category}></CategoryCard>
		{/each}
		<a class="card btn preset-filled-primary-100-900 w-36 h-24" href="/shopping/add">
			Add new category
		</a>
	</div>
{/await}
