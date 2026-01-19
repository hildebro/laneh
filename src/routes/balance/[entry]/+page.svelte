<script lang="ts">
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import MoneyInput from '$lib/MoneyInput.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  const getInitialDistributions = () => {
    const equalSplit = 100 / data.users.length;

    return data.users.map((user) => {
      if (!data.entry) {
        return {
          userId: user.id,
          username: user.username,
          percent: equalSplit
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

<div class="card">
  <div class="h5 mb-4">
    {data.entry ? m.balance_expense_edit() : m.balance_expense_add()}
  </div>

  <EnhancedForm method="POST">
    <input type="hidden" name="id" value={data.entry?.id}>
    <label>
      { m.generic_name() }
      <input class="form-input input" type="text" name="name" bind:value={purchaseName} />
    </label>
    <MoneyInput bind:value={purchasePrice} />
    <div>
      { m.balance_expense_distribution() }
      <div>
        {#each distributions as dist (dist.userId)}
          <label>
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
