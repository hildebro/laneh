<script lang="ts">
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import ApiFormItem from '$lib/components/ApiFormItem.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  let id = $derived(data.user?.id);
  let householdId = $derived(data.user?.householdId || '');
  let username = $derived(data.user?.username || '');
  let password = $derived(undefined);
  let serverAdmin = $derived(data.user?.serverAdmin || false);
  let householdAdmin = $derived(data.user?.householdAdmin || false);

  async function saveUser() {
    const client = getApiClient();
    return client.api.users.update.$post({
      json: { id: id ?? null, householdId, username, password, serverAdmin, householdAdmin }
    });
  }
</script>

<article>
  <h2>
    {#if data.user}
      { m.settings_categories_edit() }
    {:else }
      { m.settings_categories_add() }
    {/if}
  </h2>
  <div class="action-row">
    <ApiForm submitAction={saveUser} onSuccess={resolve('/settings/households')}>
      {#if !data.user}
        <ApiFormItem
          label={m.settings_users_household()}
          name="householdId"
          type="select"
          bind:value={householdId}
        >
          <option value="" selected></option>
          {#each data.households as household (household.id)}
            <option value={household.id}>{household.name}</option>
          {/each}
        </ApiFormItem>
      {/if}
      <ApiFormItem
        label={m.initiate_username()}
        name="username"
        bind:value={username}
      />
      <ApiFormItem
        label={m.settings_user_data_password()}
        name="password"
        type="password"
        bind:value={password}
      />
      <ApiFormItem
        label={m.settings_server_admin()}
        name="serverAdmin"
        type="checkbox"
        bind:value={serverAdmin}
        disabled={!data.logged_in_user.serverAdmin}
      />
      <ApiFormItem
        label={m.settings_household_admin()}
        name="householdAdmin"
        type="checkbox"
        bind:value={householdAdmin}
        disabled={!data.logged_in_user.householdAdmin}
      />
    </ApiForm>
  </div>
</article>
