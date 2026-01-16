<script lang="ts">
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import MoneyInput from '$lib/MoneyInput.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  // Initialize form state directly from props
  let purchaseName = $state(data.entry?.name || '');
  let purchasePrice = $state(data.entry?.price || '0');
</script>

<div class="card">
  <div class="h5 mb-4">
    {#if data.entry}
      { m.balance_edit() }
    {:else }
      { m.balance_add() }
    {/if}
  </div>
  <EnhancedForm method="POST" action={data.entry ? '?/edit' : '?/create'}>
    <input type="hidden" name="id" value={data.entry?.id}>
    <label>
      { m.generic_name() }
      <input class="form-input input" type="text" name="name" bind:value={purchaseName} />
    </label>
    <MoneyInput bind:value={purchasePrice} />
  </EnhancedForm>
</div>
