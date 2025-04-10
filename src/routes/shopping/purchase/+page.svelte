<script lang="ts">
	import PurchaseCategoryCard from './PurchaseCategoryCard.svelte';
	import { enhance } from '$app/forms';
	import LoadingSpinner from '$lib/LoadingSpinner.svelte';

	let { data } = $props();
</script>

{#await data.categories}
	<LoadingSpinner />
{:then categories}
	<form class="flex flex-col gap-4 items-center h-full w-full" method="POST" use:enhance>
		<button class="btn ml-auto" type="submit">Finish purchase</button>
		{#each categories as category (category.id)}
			<PurchaseCategoryCard
				{category}
			/>
		{/each}
	</form>
{/await}
