<script lang="ts">
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import MoneyInput from '$lib/MoneyInput.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  // Initialize form state directly from props
  let purchaseName = $state(data.purchase?.name || '');
  let purchasePrice = $state(data.purchase?.price || '0');
</script>

<div class="card">
  <div class="h5 mb-4">
    {#if data.purchase}
      { m.shopping_purchases_edit() }
    {:else }
      { m.shopping_purchases_add() }
    {/if}
  </div>
  <EnhancedForm method="POST" action={data.purchase ? '?/edit' : '?/create'}>
    <input type="hidden" name="id" value={data.purchase?.id}>
    <label>
      { m.generic_name() }
      <input class="form-input input" type="text" name="name" bind:value={purchaseName} />
    </label>
    <MoneyInput bind:value={purchasePrice} />
  </EnhancedForm>
</div>
