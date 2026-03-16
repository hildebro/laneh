<script>
  import { X } from 'lucide-svelte';
  import { flip } from 'svelte/animate';
  import { fade, fly } from 'svelte/transition';
  import { removeToast, toasts } from '$lib/stores/toast';
</script>

<section class="gui-toast-group" aria-live="polite">
  {#each $toasts as toast (toast.id)}
    <output
      class="gui-toast {toast.type}"
      animate:flip={{ duration: 300 }}
      in:fly={{ y: 50, duration: 300 }}
      out:fade={{ duration: 200 }}
    >
      <span class="message">{toast.message}</span>
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
        inset-block-end: 0;
        inset-inline: 0;
        padding-block-end: 5vh;

        display: grid;
        justify-content: center;
        justify-items: center;
        gap: 1vh;
        pointer-events: none;
    }

    .gui-toast {
        display: flex;
        align-items: center;
        gap: 1rem;

        background-color: var(--bg-surface);
        color: var(--text);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 0.75rem 1rem 0.75rem 1.5rem;
        font-family: var(--font-sans), sans-serif;
        font-size: 1rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

        pointer-events: auto;
        will-change: transform, opacity;
        max-width: calc(100vw - 4rem);
    }

    .message {
        flex: 1;
        text-align: left;
    }

    /* Reset base button styles for this specific close button */
    .close-btn {
        background: transparent;
        color: inherit;
        border: none;
        padding: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        opacity: 0.7;
        transition: opacity 0.2s ease, background-color 0.2s ease;
    }

    .close-btn:hover {
        opacity: 1;
        background-color: rgba(0, 0, 0, 0.05);
        transform: none;
    }

    @media (prefers-color-scheme: dark) {
        .close-btn:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }
    }

    .close-btn {
        width: 2.25rem;
        height: 2.25rem;
    }

    /* Type Variations */
    /*noinspection CssUnusedSymbol*/
    .gui-toast.error {
        background-color: var(--error-bg);
        color: var(--error-text);
        border-color: var(--error-bg);
    }

    /*noinspection CssUnusedSymbol*/
    .gui-toast.accent {
        background-color: var(--accent);
        color: #ffffff;
        border-color: var(--accent);
    }
</style>