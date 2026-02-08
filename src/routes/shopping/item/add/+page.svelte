<script lang="ts">
  import { CirclePlus, Trash2 } from 'lucide-svelte';
  import { tick } from 'svelte';
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let items: { amount: string, name: string }[] = $state([{ amount: '', name: '' }]);

  let amountRefs: HTMLInputElement[] = [];
  let nameRefs: HTMLInputElement[] = [];

  async function addItem() {
    items.push({ amount: '', name: '' });

    // Wait for DOM update
    await tick();

    // Focus the 'amount' field of the newly created last item
    const lastIndex = items.length - 1;
    amountRefs[lastIndex]?.focus();
  }

  function deleteItem(index: number) {
    if (items.length > 1) {
      items.splice(index, 1);
    }
  }

  async function handleKeyDown(e: KeyboardEvent, index: number, field: 'amount' | 'name') {
    const isEnter = e.key === 'Enter';
    const isTabForward = e.key === 'Tab' && !e.shiftKey;

    if (!isEnter && !isTabForward) return;

    e.preventDefault();

    if (field === 'amount') {
      // Jump to Name in same row
      nameRefs[index]?.focus();
    } else {
      // Jump to next row or create a new one
      const isLastItem = index === items.length - 1;

      if (isLastItem) {
        await addItem();
      } else {
        amountRefs[index + 1]?.focus();
      }
    }
  }
</script>

<div class="card w-full">
  <EnhancedForm submitButtonClasses="ml-auto">
    <h1 class="text-2xl font-semibold">{m.shopping_add_items()}</h1>
    <div class="flex flex-col gap-1">
      {#each items as item, index (index)}
        <div class="flex gap-1">
          <input
            name="amounts"
            bind:this={amountRefs[index]}
            class="input flex-4"
            type="text"
            placeholder="1"
            bind:value={item.amount}
            onkeydown={(e) => handleKeyDown(e, index, 'amount')}
          />

          <input
            name="names"
            bind:this={nameRefs[index]}
            class="input flex-12"
            type="text"
            placeholder="Item Name"
            bind:value={item.name}
            onkeydown={(e) => handleKeyDown(e, index, 'name')}
          />

          <button
            type="button"
            class="btn preset-filled-error-800-200 btn-sm flex-1"
            tabindex="-1"
            onclick={() => deleteItem(index)}
          >
            <Trash2 />
          </button>
        </div>
      {/each}

      <div class="flex gap-2">
        <button type="button" class="btn btn-sm" onclick={addItem}>
          <CirclePlus />
        </button>
      </div>
    </div>
  </EnhancedForm>
</div>