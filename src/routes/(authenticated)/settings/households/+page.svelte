<script lang="ts">
  import { CheckIcon, Pencil, XIcon } from 'lucide-svelte';
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();
</script>

<div class="action-bar">
  <a role="button" href={resolve('/settings/households/add')}>{ m.settings_households_add() }</a>
</div>
<div class="single-col-wrapper">
  {#each data.households as household (household.id)}
    <article>
      <div class="action-bar">
        <a role="button" href={resolve('/(authenticated)/settings/households/[id]', {id: household.id})}>
          <Pencil size={16} />
        </a>
      </div>
      <h3>{household.name}</h3>
      <table>
        <thead>
        <tr>
          <th>{m.initiate_username()}</th>
          <th>{m.settings_users_admin()}</th>
        </tr>
        </thead>
        <tbody>
        {#each household.users as user (user.id)}
          <tr>
            <td>{user.username}</td>
            <td>
              {m.settings_users_admin_server()}
              {#if user.serverAdmin}
                <CheckIcon />
              {:else}
                <XIcon />
              {/if}
              {m.settings_users_admin_household()}
              {#if user.householdAdmin}
                <CheckIcon />
              {:else}
                <XIcon />
              {/if}
            </td>
            <td>
              <a role="button" href={resolve('/(authenticated)/settings/users/[id]', {id: user.id})}>
                <Pencil size={16} />
              </a>
            </td>
          </tr>
        {/each}
        </tbody>
      </table>
    </article>
  {/each}
</div>
