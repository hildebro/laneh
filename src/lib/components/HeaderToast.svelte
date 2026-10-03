<script lang="ts">
  import { currentToast, removeToast } from '$lib/stores/toast';
</script>

<!-- The fill doubles as the timer: the toast is done, once the header is fully colored. -->
{#if $currentToast}
  {#key $currentToast.id}
    <div
      class="toast-fill"
      class:primary={$currentToast.type === 'primary'}
      class:warning={$currentToast.type === 'warning'}
      class:error={$currentToast.type === 'error'}
      style:--toast-duration="{$currentToast.duration}ms"
      onanimationend={() => removeToast($currentToast.id)}
    ></div>
  {/key}
{/if}

<style>
    .toast-fill {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background-image: linear-gradient(
            to right,
            color-mix(in srgb, var(--toast-color) 15%, var(--bg-app)),
            color-mix(in srgb, var(--toast-color) 45%, var(--bg-app))
        );
        transform-origin: left;
        animation: toast-progress var(--toast-duration) linear forwards;
    }

    .toast-fill.primary {
        --toast-color: var(--btn-primary-bg);
    }

    .toast-fill.warning {
        --toast-color: var(--btn-warning-bg);
    }

    .toast-fill.error {
        --toast-color: var(--btn-error-bg);
    }

    @keyframes toast-progress {
        from {
            transform: scaleX(0);
        }
        to {
            transform: scaleX(1);
        }
    }
</style>
