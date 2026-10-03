<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import ApiFormItem from '$lib/components/ApiFormItem.svelte';
  import { transLocale } from '$lib/locale-translations';
  import * as m from '$lib/paraglide/messages.js';
  import { getLocale, type Locale, locales } from '$lib/paraglide/runtime.js';

  let categoryLocale: Locale = $state(getLocale());

  // Each language is named in itself, since the display language might not be understood by the household.
  const languageName = (locale: Locale) => new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? locale;

  async function completeSetup() {
    const client = getApiClient();
    return client.api.setup.$post({ json: { categoryLocale } });
  }

  async function onCompleted() {
    await goto(resolve('/'));
  }
</script>

<main>
  <article>
    <h2>{m.setup_title()}</h2>
    <ApiForm
      submitAction={completeSetup}
      submitButtonText={m.setup_submit()}
      onSuccess={onCompleted}
      warnOnUnsavedChanges={false}
    >
      <p class="info">{m.setup_category_locale_info()}</p>
      <ApiFormItem
        type="select"
        label={m.setup_category_locale()}
        name="categoryLocale"
        bind:value={categoryLocale}
      >
        {#each locales as locale (locale)}
          <option value={locale}>{transLocale(locale)} {languageName(locale)}</option>
        {/each}
      </ApiFormItem>
    </ApiForm>
  </article>
</main>

<style>
    .info {
        white-space: pre-line;
    }
</style>
