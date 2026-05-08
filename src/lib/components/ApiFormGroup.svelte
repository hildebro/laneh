<script lang="ts">
  import { getContext, type Snippet } from 'svelte';

  let {
    label,
    name = '',
    layout = 'column',
    children
  }: {
    label: string;
    name?: string;
    layout?: 'column' | 'row';
    children: Snippet;
  } = $props();

  const formState = getContext<{ errors: Record<string, string> }>('api-form-context');
  let displayError = $derived((name && formState?.errors?.[name]) || '');
</script>

<div class="form-group">
  <div class="group-header">
    {#if label}
      <span class="group-label">{label}</span>
    {/if}

    {#if displayError}
      <span class="group-error-badge">{displayError}</span>
    {/if}
  </div>

  <div class="group-content" class:row={layout === 'row'}>
    {@render children()}
  </div>
</div>

<style>
    .form-group {
        /* Rely on the child spacers for bottom margin */
        margin-bottom: 0.25rem;
    }

    .group-header {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 0.1rem;
        margin-bottom: 0.5rem;
        min-height: 1.5rem;
    }

    .group-label {
        font-weight: var(--heading-font-weight);
        color: var(--text-heading);
        font-size: 0.95rem;
    }

    .group-error-badge {
        min-height: 1.85rem;
        font-size: 0.85rem;
        background-color: var(--btn-error-bg);
        color: var(--btn-error-text);
        padding: 0.35rem 0.5rem;
        border-radius: var(--radius-base, 0.25rem);
        animation: pop-in 0.2s ease-out;
    }

    .group-content {
        display: flex;
        gap: 1rem;
    }

    .group-content:not(.row) {
        flex-direction: column;
    }

    .group-content.row {
        flex-direction: row;
        flex-wrap: wrap;
    }

    .group-content.row > :global(.form-item) {
        flex: 1;
        min-width: 95px;
        margin-bottom: 0;
    }

    @keyframes pop-in {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
</style>