import type { PageLoad } from './$types';
import { getApiClient } from '$lib/apiClient';
import * as m from '$lib/paraglide/messages.js';
import { getLocale } from '$lib/paraglide/runtime.js';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: PageLoad = async ({ fetch }) => {
  const client = getApiClient(fetch);

  return {
    groups: await handleApiLoad(client.api.shopping.mergeCandidates.$get({ query: { locale: getLocale() } })),
    categories: await handleApiLoad(client.api.shopping.categoriesWithItems.$get()),
    help_text: m.settings_items_merge_help()
  };
};
