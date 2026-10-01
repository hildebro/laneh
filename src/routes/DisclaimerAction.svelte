<script lang="ts">
  import AttentionAction from './AttentionAction.svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import * as m from '$lib/paraglide/messages.js';

  async function submitAction() {
    const client = getApiClient();
    return client.api.users.dismissHelpDisclaimer.$post();
  }

  async function onSuccess() {
    await goto(resolve('/shopping'));
  }
</script>

<AttentionAction label={m.generic_attention()}>
  {#snippet children(close)}
    <p>{m.initiate_disclaimer()}</p>
    <ApiForm {submitAction} {onSuccess} submitButtonText={m.initiate_disclaimer_dismiss()}>
      <button type="button" onclick={close}>{m.generic_close()}</button>
    </ApiForm>
  {/snippet}
</AttentionAction>
