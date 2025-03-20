<script lang="ts">
  import CategoryCard from './CategoryCard.svelte';

  let { data } = $props();
</script>

{#await data.categories}
	loading...
{:then categories}
	<div class="flex flex-wrap gap-2 justify-center">
		<a class="btn" href="shopping/category/add">New category</a>
		<a class="btn" href="shopping/category/reorder">Reorder categories</a>
		<a class="btn" href="shopping/purchase" >Start purchase</a>
	</div>
	{#each categories as category}
		<CategoryCard {category}></CategoryCard>
	{/each}
{/await}
