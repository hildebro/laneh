<script lang="ts">
  import CategoryCard from './CategoryCard.svelte';

  let { data } = $props();
</script>

<div class="card w-full">
  {#await data.categories}
    loading...
  {:then categories}
    <div class="flex justify-end gap-2 mb-4">
      <a class="btn" href="shopping/item/add">Add items</a>
      <a class="btn" href="shopping/category/add">New category</a>
      <a class="btn" href="shopping/category/reorder">Reorder categories</a>
      <a class="btn" href="shopping/purchase">Start purchase</a>
    </div>
    <div class="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-2 mb-4">
      {#each categories as category}
        <CategoryCard {category}></CategoryCard>
      {/each}
    </div>
  {/await}
</div>
