<script lang="ts">
  import { getContext } from 'svelte';

  let {
    label,
    name,
    value = $bindable(),
    type = 'text',
    error = ''
  }: {
    label: string;
    name: string;
    value: string;
    type?: 'text' | 'password' | 'email' | 'number';
    error?: string;
  } = $props();

  // Retrieve the shared state from ApiForm (fallback to empty object if used outside ApiForm)
  const formState = getContext<{ errors: Record<string, string> }>('api-form-context');

  let displayError = $derived(error || formState?.errors?.[name] || '');
</script>

<div class="form-item">
  <label for={name}>{label}</label>
  <input
    class="input"
    class:error-border={!!displayError}
    {type}
    {name}
    id={name}
    bind:value
  />

  <div class="error-spacer">
    {#if displayError}
      <span class="error-text">{displayError}</span>
    {/if}
  </div>
</div>

<style>
  .form-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 0.25rem;
  }

  .input.error-border {
    border-color: var(--btn-error-bg);
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .input.error-border:focus-visible {
    outline-color: var(--btn-error-bg);
  }

  .error-spacer {
    min-height: 1.85rem;
  }

  .error-text {
    display: block;
    font-size: 0.85rem;
    font-weight: 500;

    background-color: var(--btn-error-bg);
    color: var(--btn-error-text);
    padding: 0.35rem 0.5rem;

    border-radius: 0 0 var(--radius-base, 0.25rem) var(--radius-base, 0.25rem);

    line-height: 1.2;
    animation: fade-in 0.2s ease-out;
  }

  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-2px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
