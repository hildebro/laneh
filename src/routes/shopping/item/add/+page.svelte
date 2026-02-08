<script lang="ts">
  import { CirclePlus, Trash2 } from 'lucide-svelte';
  import { tick } from 'svelte';
  import * as m from '$lib/paraglide/messages.js';

  let items: { units: string, name: string }[] = $state([{ units: '', name: '' }]);

  let unitRefs: HTMLInputElement[] = [];
  let nameRefs: HTMLInputElement[] = [];

  async function addItem() {
    items.push({ units: '', name: '' });

    // Wait for DOM update
    await tick();

    // Focus the 'units' field of the newly created last item
    const lastIndex = items.length - 1;
    unitRefs[lastIndex]?.focus();
  }

  function deleteItem(index: number) {
    items.splice(index, 1);
  }

  async function handleKeyDown(e: KeyboardEvent, index: number, field: 'unit' | 'name') {
    const isEnter = e.key === 'Enter';
    const isTabForward = e.key === 'Tab' && !e.shiftKey;

    if (!isEnter && !isTabForward) return;

    e.preventDefault();

    if (field === 'unit') {
      // Jump to Name in same row
      nameRefs[index]?.focus();
    } else {
      // Jump to next row or create a new one
      const isLastItem = index === items.length - 1;

      if (isLastItem) {
        await addItem();
      } else {
        unitRefs[index + 1]?.focus();
      }
    }
  }
</script>

<div class="card w-full p-4 space-y-4">
  <h1 class="text-2xl font-semibold">{m.shopping_add_items()}</h1>

  {#each items as item, index (index)}
    <div class="flex gap-2 items-center">
      <input
        bind:this={unitRefs[index]}
        class="input w-20"
        type="text"
        placeholder="1"
        bind:value={item.units}
        onkeydown={(e) => handleKeyDown(e, index, 'unit')}
      />

      <input
        bind:this={nameRefs[index]}
        class="input flex-1"
        type="text"
        placeholder=""
        bind:value={item.name}
        onkeydown={(e) => handleKeyDown(e, index, 'name')}
      />

      <button
        class="btn btn-square btn-error btn-sm"
        tabindex="-1"
        onclick={() => deleteItem(index)}
        aria-label="Delete row"
      >
        <Trash2/>
      </button>
    </div>
  {/each}

  <button class="btn btn-primary" onclick={addItem}>
    <CirclePlus/>
  </button>
</div>