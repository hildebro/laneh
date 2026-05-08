<script lang="ts">
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import ApiFormItem from '$lib/components/ApiFormItem.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  const getBalanceDistributions = () => {
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

  let id = $derived(data.entry?.id || '');
  let name = $derived(data.entry?.name || '');
  let creditorId = $derived(data.entry?.userId || data.logged_in_user?.id);
  let purchasePrice = $derived(data.entry?.price || '0');
  let distributions = $derived(getBalanceDistributions());
  let purchaseId = $derived(data.purchaseId || null);

  async function saveEntry() {
    const client = getApiClient();
    return client.api.balance.$post({
      json: { id, name, creditorId, price: purchasePrice, distributions, purchaseId }
    });
  }
</script>

{#if data.purchaseId}
  <article class="primary">
    <p>
      { m.shopping_purchase_finished() }
    </p>
    <footer>
      <a role="button" href={resolve('/shopping')}>{ m.shopping_purchase_finished_skip() }</a>
    </footer>
  </article>
{/if}
<article>
  <h2>{data.entry ? m.balance_expense_edit() : m.balance_expense_add()}</h2>

  <ApiForm submitAction={saveEntry} onSuccess={resolve('/balance')}>
    <input type="hidden" name="id" value={data.entry?.id}>
    <input type="hidden" name="purchaseId" value={data.purchaseId}>
    <ApiFormItem
      label={m.generic_name()}
      name="name"
      bind:value={name}
    />
    <ApiFormItem
      label={m.balance_expense_user()}
      name="creditorId"
      type="select"
      bind:value={creditorId}
    >
      {#each data.users as user (user.id)}
        <option value={user.id}>{user.username}</option>
      {/each}
    </ApiFormItem>
    <ApiFormItem
      label={m.balance_price()}
      name="price"
      type="money"
      bind:value={purchasePrice}
    />
    <div>
      <span class="label">{ m.balance_expense_distribution() }</span>
      <div class="distribution-users">
        {#each distributions as dist (dist.userId)}
          <label>
            {dist.username}
            <input type="hidden" name="userIds" value={dist.userId} />
            <input
              type="text"
              name="percents"
              bind:value={dist.percent}
            />
          </label>
        {/each}
      </div>
    </div>
  </ApiForm>
</article>

<style>
    .distribution-users {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .distribution-users label {
        flex: 1;
        min-width: 95px;
        margin-bottom: 0;
        font-size: 0.85rem;
    }
</style>