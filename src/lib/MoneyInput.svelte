<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';

  let { value = $bindable() } = $props();

  const formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  });

  let formattedValue = $derived(formatter.format(value / 100));

  function handleKeyDown(e: KeyboardEvent) {
    const key = e.key;

    // Navigation keys allowed
    if (['Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(key) || e.ctrlKey || e.metaKey) {
      return;
    }

    // Stop default typing
    e.preventDefault();

    if (/^[0-9]$/.test(key)) {
      if (value < 1000000000) { // Safety limit
        value = (value * 10) + parseInt(key);
      }
    }

    // Backspace
    if (key === 'Backspace') {
      value = Math.floor(value / 10);
    }
  }
</script>

<div class="flex flex-col w-full mx-auto">
  <label class="label">
    <span class="label-text">{ m.balance_price() }</span>
    <input
      type="text"
      inputmode="numeric"
      value={formattedValue}
      onkeydown={handleKeyDown}
      placeholder="0,00 €"
    />
  </label>
</div>