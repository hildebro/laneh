<script lang="ts">
	let { data } = $props();
</script>

{#await data.categories}
	loading...
{:then categories}
	{#each categories as category}
		{category.name}
	{/each}
{/await}