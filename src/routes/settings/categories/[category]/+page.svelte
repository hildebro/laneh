<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  // Initialize form state directly from props
  let categoryName = $state(data.category?.name || '');
</script>

<div class="card">
  <div class="h5 mb-4">{data.category ? 'Edit Category' : 'Add New Category'}</div>
  <form method="POST" action="?/create" use:enhance>
    <input type="hidden" name="categoryId" value={data.category?.id}>
    <label>
      Name
      <input class="form-input input" type="text" name="name" bind:value={categoryName} required />
    </label>

    {#if data.category}
      <div class="mt-2 mb-2">
        Items to delete:
        {#each data.category.shoppingItems as item (item.id)}
          <div>
            <label>
              <input type="checkbox" name="items" value={item.id} />
              {item.name}
            </label>
          </div>
        {/each}
      </div>
    {/if}

    <button type="submit" class="btn mt-1">
      {data.category ? 'Update' : 'Create'}
    </button>

    {#if form?.message}
      <p class="preset-filled-error-50-950 rounded mt-4 text-center">{form.message}</p>
    {/if}
  </form>

  {#if data.category}
    <form method="POST" action="?/delete" use:enhance>
      <input type="hidden" name="categoryId" value={data.category?.id}>
      <button type="submit" class="mt-2 btn preset-filled-error-400-600">
        DELETE CATEGORY
      </button>
    </form>
  {/if}
</div>
