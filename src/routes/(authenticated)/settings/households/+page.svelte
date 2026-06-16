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
      <h2>{household.name}</h2>
      <div class="action-row">
        <a role="button" href={resolve('/(authenticated)/settings/households/[id]', {id: household.id})}>
          <Pencil />
        </a>
      </div>
    </article>
  {/each}
</div>
