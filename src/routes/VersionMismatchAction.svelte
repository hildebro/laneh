<script lang="ts">
  import { Capacitor } from '@capacitor/core';
  import AttentionAction from './AttentionAction.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { versions } from '$lib/stores/versions';
  import { compareVersions } from '$lib/utils/versionHelper';

  // App and server on different versions might not support the same functions. Positive if the app is newer.
  let versionDiff = $derived(
    Capacitor.isNativePlatform() && $versions?.serverVersion
      ? compareVersions(__APP_VERSION__, $versions.serverVersion)
      : 0
  );
  let messageParams = $derived({ appVersion: __APP_VERSION__, serverVersion: $versions?.serverVersion ?? '' });
</script>

<!-- Not dismissible, since it only goes away once app and server are on the same version. -->
{#if versionDiff !== 0}
  <AttentionAction label={m.attention_version()}>
    {#snippet children(close)}
      <p>
        {versionDiff > 0 ? m.attention_server_outdated(messageParams) : m.attention_app_outdated(messageParams)}
      </p>
      <button type="button" onclick={close}>{m.generic_close()}</button>
    {/snippet}
  </AttentionAction>
{/if}
