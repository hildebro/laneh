<script lang="ts">
  import DragAndDropList from './DragAndDropList.svelte';

  let { data } = $props();
</script>

{#await data.categories}
	loading...
{:then categories}
	<DragAndDropList {categories}/>
{/await}
