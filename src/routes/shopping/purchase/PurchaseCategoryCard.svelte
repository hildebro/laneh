<script lang="ts">
  let { category } = $props();
</script>

{#if category.shoppingItems.length > 0 }
	<div class="card preset-filled-secondary-100-900 w-full mt-2">
		<!-- Header -->
		<div class="flex justify-between p-2">
			{category.name}
		</div>
		<!-- Item list -->
		<div class="p-2">
			{#each category.shoppingItems as item}
				<div>
					<label>
						<input
							type="checkbox"
							name="items"
							value={item.id}
						/>
						{item.name}
					</label>
				</div>
			{/each}
		</div>
	</div>
{/if}