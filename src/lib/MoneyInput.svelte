<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';

  let { value = $bindable() } = $props();

  let valueInCents = $state(value);

  const formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  });

  let formattedValue = $derived(formatter.format(valueInCents / 100));

  function handleKeyDown(e: KeyboardEvent) {
    const key = e.key;

    // Navigation keys allowed
    if (['Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(key) || e.ctrlKey || e.metaKey) {
      return;
    }

    // Stop default typing
    e.preventDefault();

    // Digits
    if (/^[0-9]$/.test(key)) {
      if (valueInCents < 10000000000) { // Safety limit
        valueInCents = (valueInCents * 10) + parseInt(key);
      }
    }

    // Backspace
    if (key === 'Backspace') {
      valueInCents = Math.floor(valueInCents / 10);
    }
  }
</script>

<div class="flex flex-col w-full max-w-sm mx-auto">
  <label>
    { m.balance_price() }
    <input
      type="text"
      inputmode="numeric"
      value={formattedValue}
      onkeydown={handleKeyDown}
      class="input form-input"
      placeholder="0,00 €"
    />
  </label>

  <input
    type="hidden"
    name="price"
    value={valueInCents}
  />
</div>