<script lang="ts">
  import type { SubmitFunction } from '@sveltejs/kit';
  import type { Snippet } from 'svelte';
  import { z } from 'zod/v4';
  import { enhance } from '$app/forms';

  type SvelteKitFormState = { issues?: z.core.$ZodIssue[]; [key: string]: unknown } | null | undefined;

  let {
    children,
    action = undefined,
    method = 'POST',
    class: className = '',
    style = '',
    form, // CRUCIAL: This is the reactive form state from your page ($props().form)
    enhancement = undefined,
    onSubmit = undefined,
    ...restProps // Captures any other native form attributes (e.g., id, name, enctype)
  }: {
    children: Snippet;
    action?: string;
    method?: 'dialog' | 'get' | 'post' | 'DIALOG' | 'GET' | 'POST' | undefined | null;
    class?: string;
    style?: string;
    form: SvelteKitFormState;
    enhancement?: SubmitFunction;
    onSubmit?: (event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) => void;
  } = $props();
</script>

<form
  method={method}
  action={action}
  use:enhance={enhancement}
  class={className}
  style={style}
  onsubmit={onSubmit}
  {...restProps}
>
  {@render children()}
  {#if form?.issues && form.issues.length > 0}
    <div class="preset-filled-error-50-950 rounded mt-4 p-3 text-center">
      <ul class="list-none p-0 m-0">
        {#each form.issues as issue (String(issue.path) + issue.message)}
          <li>
            {#if issue.path.length > 0}
              <strong>{issue.path.join('.')}:</strong>
            {/if}
            {issue.message}
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</form>