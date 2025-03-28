<script lang="ts">
  import BulkAddItem from './BulkAddItem.svelte';

  let { data } = $props();
</script>

<div class="card">
	<BulkAddItem />
</div>
