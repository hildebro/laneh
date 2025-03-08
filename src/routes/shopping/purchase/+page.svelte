<script lang="ts">
  import PurchaseCategoryCard from './PurchaseCategoryCard.svelte';
  import { enhance } from '$app/forms';

  let { data } = $props();
</script>

{#await data.categories}
	loading...
{:then categories}
	<form method="POST" use:enhance>
		<button class="btn border preset-filled-primary-600-400 float-right" type="submit">Finish purchase</button>
		<div class="flex flex-col gap-4 items-center w-full h-full">
			{#each categories as category}
				<PurchaseCategoryCard
					{category}
				/>
			{/each}
		</div>
	</form>
{/await}
