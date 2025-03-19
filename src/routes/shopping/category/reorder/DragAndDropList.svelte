<script lang="ts">
  import type { ShoppingCategory } from '$lib/server/db/schema';

  let { categories } = $props();

  let list = $state(categories);

  let mouseYCoordinate = $state<number | null>(null);
  let mouseXCoordinate = $state<number | null>(null);
  let distanceTopGrabbedVsPointer = $state<number | null>(null);
  let distanceLeftGrabbedVsPointer = $state<number | null>(null);
  let draggingItem = $state<ShoppingCategory | null>(null);
  let draggingItemId = $state<string | null>(null);
  let draggingItemIndex = $state<number | null>(null);
  let hoveredItemIndex = $state<number | null>(null);

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

  function handleDragStart(e: DragEvent, category: ShoppingCategory, index: number) {
    // Type assertion
    const target = e.target as HTMLElement;
    mouseYCoordinate = e.clientY;
    mouseXCoordinate = e.clientX;
    draggingItem = category;
    draggingItemIndex = index;
    draggingItemId = category.id;
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

<div class="card">
	{#if mouseYCoordinate && distanceTopGrabbedVsPointer && mouseXCoordinate && distanceLeftGrabbedVsPointer && draggingItem}
		<div
			class="absolute w-72 p-4 mb-2.5 pointer-events-none z-50 rounded border"
			style:top="{mouseYCoordinate + distanceTopGrabbedVsPointer}px"
			style:left="{mouseXCoordinate + distanceLeftGrabbedVsPointer}px"
			style:background="{draggingItem.name}"
		>
			{draggingItem.name}
		</div>
	{/if}

	<form method="POST" action="?/reorder">
		{#each list as item, index (item.id)}
			<div
				class="form-input w-72 p-4 mb-2.5 cursor-grab rounded border {draggingItemId === item.id ? 'preset-filled-primary-800-200' : ''}"
				style:background="{item.name}"
				draggable="true"
				ondragstart={(e) => handleDragStart(e, item, index)}
				ondrag={handleDrag}
				ondragover={(e) => handleDragOver(e, index)}
				ondragend={handleDragEnd}
				role="listitem"
			>
				{item.name}
				<input type="hidden" name="ids" value={item.id} />
			</div>
		{/each}
		<button type="submit" class="btn">Save Order</button>
	</form>
</div>
