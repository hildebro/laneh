<script lang="ts">
  let list = $state([
    { id: 1, value: 'red' },
    { id: 2, value: 'green' },
    { id: 3, value: 'blue' },
    { id: 4, value: 'cyan' }
  ]);

  let mouseYCoordinate = $state(null);
  let mouseXCoordinate = $state(null); // Add mouseXCoordinate
  let distanceTopGrabbedVsPointer = $state(null);
  let distanceLeftGrabbedVsPointer = $state(null); //and distance for left
  let draggingItem = $state(null);
  let draggingItemId = $state(null);
  let draggingItemIndex = $state(null);
  let hoveredItemIndex = $state(null);
  let container = $state(null);

  $effect(() => {
    if (
      draggingItemIndex !== null &&
      hoveredItemIndex !== null &&
      draggingItemIndex !== hoveredItemIndex
    ) {
      // Swap items using array destructuring.  Svelte 5's reactivity handles this perfectly.
      [list[draggingItemIndex], list[hoveredItemIndex]] = [
        list[hoveredItemIndex],
        list[draggingItemIndex]
      ];

      // Update the draggingItemIndex to maintain the correct drag position.
      draggingItemIndex = hoveredItemIndex;
    }
  });

  function handleDragStart(e: DragEvent, item, index) {
    mouseYCoordinate = e.clientY;
    mouseXCoordinate = e.clientX; // Capture initial X coordinate
    draggingItem = item;
    draggingItemIndex = index;
    draggingItemId = item.id;
    distanceTopGrabbedVsPointer = e.target.getBoundingClientRect().y - e.clientY;
    distanceLeftGrabbedVsPointer = e.target.getBoundingClientRect().x - e.clientX; //calculate distance for left
  }

  function handleDrag(e) {
    mouseYCoordinate = e.clientY;
    mouseXCoordinate = e.clientX; // Keep updating X coordinate during drag
  }

  function handleDragOver(e, index) {
    e.preventDefault(); // Necessary to allow dropping
    hoveredItemIndex = index;
  }

  function handleDragEnd() {
    draggingItemId = null;
    hoveredItemIndex = null;
  }
</script>

<div class="bg-yellow-400 p-4 rounded" bind:this={container}>
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

	{#each list as item, index (item.id)}
		<div
			class="w-72 p-4 mb-2.5 cursor-grab bg-white rounded border {draggingItemId ===
			item.id
				? 'opacity-0'
				: ''}"
			style:background="{item.value}"
			draggable="true"
			on:dragstart={(e) => handleDragStart(e, item, index)}
			on:drag={handleDrag}
			on:dragover|preventDefault={(e) => handleDragOver(e, index)}
			on:dragend={handleDragEnd}
		>
			{item.value}
		</div>
	{/each}
</div>

<pre class="mt-4">
{JSON.stringify(list, null, 2)}
</pre>