<script lang="ts">
  import type { ShoppingItem } from '$lib/server/db/schema';

  let { category } = $props();
</script>

{#if category.shoppingItems.length > 0 }
	<div class="card w-full">
		<!-- Header -->
		{category.name}
		<!-- Item list -->
		<div>
			{#each category.shoppingItems.filter((item: ShoppingItem) => item.active) as item}
				<div>
					<label>
						<input type="checkbox" name="items" value={item.id} />
						{item.amount} {item.name}
					</label>
				</div>
			{/each}
		</div>
	</div>
{/if}