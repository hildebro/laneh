<script lang="ts">
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();
</script>

<div class="flex flex-col gap-2">
  {#if data.users.length === 0}
    <div class="card">
      { m.settings_users_add_disclaimer_no_users() }
    </div>
  {/if}
  <div class="card">
    <h1 class="h1">{ m.settings_users_add() }</h1>
    <EnhancedForm action="?/register" submitButtonText={m.settings_users_add()}>
      <label>
        {m.generic_name()}
        <input class="input" type="text" name="username" id="username" />
      </label>
      <label>
        {m.auth_register_password()}
        <input class="input" type="password" name="password" id="password" />
      </label>
    </EnhancedForm>
  </div>
  {#if data.users.length === 0}
    <div class="card">
      <EnhancedForm
        action="?/import"
        submitButtonText={m.settings_actions_import()}
        enctype="multipart/form-data"
      >
        <label class="label">
          <span>{m.settings_actions_import_file_label()}</span>
          <input
            class="input"
            type="file"
            name="dumpFile"
            accept="application/gzip, .tar.gz, .gz"
          />
        </label>
      </EnhancedForm>
    </div>
  {/if}
</div>