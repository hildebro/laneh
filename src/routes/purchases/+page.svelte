<script lang="ts">
  let { data } = $props();
</script>

{#each data.purchases as purchase (purchase.id)}
  <div>{purchase.id}</div>
{/each}