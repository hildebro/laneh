<script lang="ts">
  import type { ShoppingCategory } from '$lib/server/db/schema';

  let { categories } = $props();

  let list = $state(
    categories.map((category: ShoppingCategory) => {
      return { id: category.id, value: category.name };
    })
  );

  let mouseYCoordinate = $state(null);
  let mouseXCoordinate = $state(null);
  let distanceTopGrabbedVsPointer = $state(null);
  let distanceLeftGrabbedVsPointer = $state(null);
  let draggingItem = $state(null);
  let draggingItemId = $state(null);
  let draggingItemIndex = $state(null);
  let hoveredItemIndex = $state(null);

  $effect(() => {
    if (
      draggingItemIndex !== null &&
      hoveredItemIndex !== null &&
      draggingItemIndex !== hoveredItemIndex
    ) {
      // Swap items
      [list[draggingItemIndex], list[hoveredItemIndex]] = [
        list[hoveredItemIndex],
        list[draggingItemIndex]
      ];

      // Update draggingItemIndex
      draggingItemIndex = hoveredItemIndex;
    }
  });

  function handleDragStart(e: DragEvent, item, index) {
    // Type assertion
    const target = e.target as HTMLElement;
    mouseYCoordinate = e.clientY;
    mouseXCoordinate = e.clientX;
    draggingItem = item;
    draggingItemIndex = index;
    draggingItemId = item.id;
    distanceTopGrabbedVsPointer = target.getBoundingClientRect().y - e.clientY;
    distanceLeftGrabbedVsPointer =
      target.getBoundingClientRect().x - e.clientX;
  }

  function handleDrag(e: DragEvent) {
    mouseYCoordinate = e.clientY;
    mouseXCoordinate = e.clientX;
  }

  function handleDragOver(e: DragEvent, index: number) {
    e.preventDefault();
    hoveredItemIndex = index;
  }

  function handleDragEnd() {
    draggingItemId = null;
    hoveredItemIndex = null;
  }
</script>

<div class="bg-yellow-400 p-4 rounded">
	{#if mouseYCoordinate}
		<div
			class="absolute w-72 p-4 mb-2.5 pointer-events-none z-50 bg-white rounded border"
			style:top="{mouseYCoordinate + distanceTopGrabbedVsPointer}px"
			style:left="{mouseXCoordinate + distanceLeftGrabbedVsPointer}px"
			style:background="{draggingItem.value}"
		>
			{draggingItem.value}
		</div>
	{/if}

	<form method="POST" action="?/reorder">
		{#each list as item, index (item.id)}
			<div
				class="w-72 p-4 mb-2.5 cursor-grab bg-white rounded border {draggingItemId ===
                item.id
                    ? 'opacity-0'
                    : ''}"
				style:background="{item.value}"
				draggable="true"
				ondragstart={(e) => handleDragStart(e, item, index)}
				ondrag={handleDrag}
				ondragover={(e) => handleDragOver(e, index)}
				ondragend={handleDragEnd}
				role="listitem"
			>
				{item.value}
				<input type="hidden" name="ids" value={item.id} />
			</div>
		{/each}

		<button
			type="submit"
			class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
		>
			Save Order
		</button>
	</form>
</div>
