<script lang="ts">
  import { Pencil } from 'lucide-svelte';
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
      <div>
        {#each household.users as user (user.id)}
          - {user.username}<br />
        {/each}
      </div>
    </article>
  {/each}
</div>
