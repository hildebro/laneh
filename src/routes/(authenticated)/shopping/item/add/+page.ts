import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { resolve } from '$app/paths';
import { getApiClient } from '$lib/apiClient';
import * as m from '$lib/paraglide/messages.js';
import { handleApiLoad } from '$lib/utils/apiHelper';
import { getStagedShoppingItems } from '$lib/utils/shoppingItemStaging';
import { shuffleByRank } from '$lib/utils/suggestionHelper';

export const load: PageLoad = async ({ fetch, parent }) => {
  const client = getApiClient(fetch);
  const { logged_in_user } = await parent();

  if (getStagedShoppingItems(logged_in_user.id)) {
    return redirect(302, resolve('/shopping/item/categorize'));
  }

  return {
    // Shuffled once per visit, so the suggestions don't change while picking.
    suggestions: shuffleByRank(await handleApiLoad(client.api.shopping.itemSuggestions.$get())),
    help_text: m.shopping_add_items_help()
  };
};
