<script lang="ts">
  import { resolve } from '$app/paths';
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import MoneyInput from '$lib/MoneyInput.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  const getInitialDistributions = () => {
    const equalSplit = 100 / data.users.length;
    const useEqualSplit = !data.users.some(user => user.defaultDistribution !== null);

    return data.users.map((user) => {
      if (!data.entry) {
        return {
          userId: user.id,
          username: user.username,
          percent: useEqualSplit ? equalSplit : (user.defaultDistribution ?? 0)
        };
      }

      const distribution = data.entry?.distributions.find(d => d.userId === user.id);
      return {
        userId: user.id,
        username: user.username,
        percent: distribution?.percent ?? 0
      };
    });
  };

  let purchaseName = $state(data.entry?.name || '');
  let purchasePrice = $state(data.entry?.price || '0');
  let distributions = $state(getInitialDistributions());
</script>

{#if data.purchaseId}
  <div class="card preset-filled-error-100-900 p-5 space-y-4 shadow-xl font-semibold mb-2">
    { m.shopping_purchase_finished() }
    <br/>
    <a href={resolve('/shopping')} class="btn">{ m.shopping_purchase_finished_skip() }</a>
  </div>
{/if}
<div class="card">
  <div class="h5 mb-4">
    {data.entry ? m.balance_expense_edit() : m.balance_expense_add()}
  </div>

  <EnhancedForm method="POST">
    <input type="hidden" name="id" value={data.entry?.id}>
    <input type="hidden" name="purchaseId" value={data.purchaseId}>
    <label>
      { m.generic_name() }
      <input class="form-input input" type="text" name="name" bind:value={purchaseName} />
    </label>
    <MoneyInput bind:value={purchasePrice} />
    <div>
      { m.balance_expense_distribution() }
      <div class="flex flex-row flex-wrap gap-4">
        {#each distributions as dist (dist.userId)}
          <label class="w-17">
            {dist.username}
            <input type="hidden" name="userIds" value={dist.userId} />
            <input
              class="form-input input"
              type="text"
              name="percents"
              bind:value={dist.percent}
            />
          </label>
        {/each}
      </div>
    </div>
  </EnhancedForm>
</div>
