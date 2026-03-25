<script lang="ts">
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();
</script>

{#if data.users.length === 0}
  <article>
    { m.settings_users_add_disclaimer_no_users() }
  </article>
{/if}
<article>
  <h2>{ m.settings_users_add() }</h2>
  <EnhancedForm action="?/register" submitButtonText={m.settings_users_add()}>
    <label>
      {m.generic_name()}
      <input type="text" name="username" id="username" />
    </label>
    <label>
      {m.auth_register_password()}
      <input type="password" name="password" id="password" />
    </label>
  </EnhancedForm>
</article>
{#if data.users.length === 0}
  <article>
    <EnhancedForm
      action="?/import"
      submitButtonText={m.settings_actions_import()}
      enctype="multipart/form-data"
    >
      <label class="label">
        <span>{m.settings_actions_import_file_label()}</span>
        <input
          type="file"
          name="dumpFile"
          accept="application/gzip, .tar.gz, .gz"
        />
      </label>
    </EnhancedForm>
  </article>
{/if}