<script>
  import { X } from 'lucide-svelte';
  import { flip } from 'svelte/animate';
  import { fade, fly } from 'svelte/transition';
  import { removeToast, toasts } from '$lib/stores/toast';
</script>

<section class="gui-toast-group" aria-live="polite">
  {#each $toasts as toast (toast.id)}
    <output
      class="gui-toast"
      class:primary={toast.type === 'primary'}
      class:warning={toast.type === 'warning'}
      class:error={toast.type === 'error'}
      animate:flip={{ duration: 300 }}
      in:fly={{ x: 50, duration: 300 }}
      out:fade={{ duration: 200 }}
    >
      <span class="content">
        {#if toast.title}
          <span class="title">{toast.title}</span>
        {/if}
        <span class="message">{toast.message}</span>
      </span>
      <button
        class="close-btn"
        on:click={() => removeToast(toast.id)}
      >
        <X class="close-btn" />
      </button>
    </output>
  {/each}
</section>

<style>
    .gui-toast-group {
        position: fixed;
        z-index: 999;
        top: 0;
        left: 0;
        padding: 1.5rem;

        display: grid;
        justify-content: start;
        justify-items: start;
        gap: 0.75rem;
        pointer-events: none;
    }

    .gui-toast {
        display: flex;
        align-items: center;
        gap: 1rem;

        background-color: var(--bg-surface);
        color: var(--text-main);
        border: var(--default-border-width, 1px) solid var(--border-main);
        border-radius: var(--radius-container);
        padding: 0.75rem 1rem 0.75rem 1.5rem;
        font-family: inherit;
        font-size: 1rem;
        box-shadow: var(--dialog-shadow);

        pointer-events: auto;
        will-change: transform, opacity;
        max-width: calc(100vw - 3rem);
        width: max-content;
    }

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        text-align: left;
    }

    .title {
        font-weight: var(--heading-font-weight, 600);
        font-size: 1.05em;
        color: var(--text-heading);
        line-height: 1.2;
    }

    .message {
        font-size: 0.95em;
        opacity: 0.9; /* Gives slight visual hierarchy when paired with a title */
    }

    .close-btn {
        background: transparent;
        color: var(--text-muted);
        border: none;
        padding: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-base, 4px);
        width: 2.25rem;
        height: 2.25rem;
        cursor: pointer;
        flex-shrink: 0;
        transition: background-color 0.2s ease, color 0.2s ease;
    }

    .close-btn:hover {
        background-color: var(--bg-surface-hover);
        color: var(--text-main);
        transform: none;
    }

    .close-btn:focus-visible {
        outline: 2px solid var(--text-outline-focus);
        outline-offset: -2px;
    }

    /* --- Type Variations --- */
    .gui-toast.error {
        background-color: var(--btn-error-bg);
        color: var(--btn-error-text);
        border-color: var(--btn-error-bg);
    }

    .gui-toast.warning {
        background-color: var(--btn-warning-bg);
        color: var(--btn-warning-text);
        border-color: var(--btn-warning-bg);
    }

    .gui-toast.primary {
        background-color: var(--btn-primary-bg);
        color: var(--btn-primary-text);
        border-color: var(--btn-primary-bg);
    }

    .gui-toast.error .close-btn,
    .gui-toast.warning .close-btn,
    .gui-toast.primary .close-btn {
        color: inherit;
        opacity: 0.7;
    }

    .gui-toast.error .close-btn:hover,
    .gui-toast.warning .close-btn:hover,
    .gui-toast.primary .close-btn:hover {
        opacity: 1;
        background-color: rgba(0, 0, 0, 0.1);
    }

    .gui-toast.error .title,
    .gui-toast.warning .title,
    .gui-toast.primary .title {
        color: inherit;
    }
</style>