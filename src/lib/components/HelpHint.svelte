<script lang="ts">
  import { CircleQuestionMark } from 'lucide-svelte';
  import * as m from '$lib/paraglide/messages.js';
</script>

<!-- The attention dialog needs a user to store its dismissal, so pages before login point to the help button with this. -->
<article>
  <p>
    <CircleQuestionMark />
    {m.generic_help_hint()}
  </p>
</article>

<style>
    p {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    p :global(svg) {
        flex-shrink: 0;
    }
</style>
