<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';

  let items: { units: string, name: string }[] = $state([{ units: '', name: '' }]);

  function handleKeyDown(e: KeyboardEvent, index: number) {
    const key = e.key;

    if (!['Tab', 'Enter'].includes(key)) {
      return;
    }

    e.preventDefault();
  }
</script>

<div class="card w-full">
  <h1 class="text-2xl font-semibold">{m.shopping_add_items()}</h1>
  {#each items as item, index (item.name)}
    <div class="flex gap-1">
      <input class="input flex-1" type="text" placeholder="1" onkeydown={(e) => handleKeyDown(e, index)} />
      <input class="input flex-5" type="text" />
    </div>
  {/each}
</div>
