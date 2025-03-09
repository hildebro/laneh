<script lang="ts">
  import CategoryCard from './CategoryCard.svelte';

  let { data } = $props();
</script>

{#await data.categories}
	loading...
{:then categories}
	<a href="/shopping/purchase" class="btn ml-auto">Start purchase</a>
	{#each categories as category}
		<CategoryCard {category}></CategoryCard>
	{/each}
	<a class="btn ml-auto" href="/shopping/category/add">New category</a>
{/await}
