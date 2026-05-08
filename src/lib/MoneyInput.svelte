<script lang="ts">
  import { priceFormatter } from '$lib/utils/formatter';

  let {
    value = $bindable(),
    name,
    id,
    hasError = false
  }: {
    value: number;
    name: string;
    id: string;
    hasError?: boolean;
  } = $props();

  let formattedValue = $derived(priceFormatter.format(value / 100));

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

<input
  class="input"
  class:error-border={hasError}
  type="text"
  inputmode="numeric"
  {name}
  {id}
  value={formattedValue}
  onkeydown={handleKeyDown}
  placeholder="0,00 €"
/>
