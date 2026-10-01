<script lang="ts">
  import { CircleAlert } from 'lucide-svelte';
  import type { Snippet } from 'svelte';

  // A flashing header button that opens a dialog. The content receives a function to close the dialog.
  let { label, children }: { label: string; children: Snippet<[close: () => void]> } = $props();

  let attentionDialog = $state<HTMLDialogElement>();

  const close = () => attentionDialog?.close();
</script>

<dialog bind:this={attentionDialog}>
  {@render children(close)}
</dialog>

<button class="header-action flashing" onclick={() => attentionDialog?.showModal()}>
  <CircleAlert />
  {label}
</button>

<style>
    dialog {
        white-space: pre-line;
    }

    .flashing {
        animation: blinker 2s linear infinite;
    }

    @keyframes blinker {
        0%,49% {
            color: var(--text-heading);
        }
        50%,100% {
            color: var(--btn-error-bg);
        }
    }
</style>
