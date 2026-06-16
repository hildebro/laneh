<script lang="ts">
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import ApiFormItem from '$lib/components/ApiFormItem.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  let id = $derived(data.household?.id);
  let name = $derived(data.household?.name || '');

  async function saveHousehold() {
    const client = getApiClient();
    return client.api.households.$post({
      json: { id: id ?? null, name }
    });
  }
</script>

<article>
  <h2>
    {#if data.household}
      { m.settings_households_edit() }
    {:else }
      { m.settings_households_add() }
    {/if}
  </h2>
  <div class="action-row">
    <ApiForm submitAction={saveHousehold} onSuccess={resolve('/settings/households')}>
      <ApiFormItem
        label={m.generic_name()}
        name="name"
        bind:value={name}
      />
    </ApiForm>
  </div>
</article>
