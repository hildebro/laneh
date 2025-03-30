import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { ShoppingCategory } from '$lib/server/db/schema';
import { addShoppingItem, findAllShoppingCategories } from '$lib/server/db/functions';
import type { MatchResult } from '../add/+page.server'; // Adjust path

// Define the structure of the item data expected from the session
interface ItemToCategorize {
  originalName: string;
  originalAmount: string;
  // Include other relevant details if needed, e.g., parsed name/amount if different
}

export const load: PageServerLoad = async ({ cookies }) => {
  // --- 2. Retrieve items from session ---
  // Replace with your actual session retrieval logic
  const itemsToValidate: MatchResult[] = JSON.parse(cookies.get('validationData') ?? '');

  // --- 3. Handle missing data ---
  if (!itemsToValidate || itemsToValidate.length === 0) {
    // No items need categorization, maybe they were already processed or user navigated directly.
    // Redirect to the main list. Optionally add a flash message.
    // locals.session?.flash('info', 'No items to categorize.');
    return redirect(303, '../');
  }

  // --- 5. Return data to the page ---
  return {
    items: itemsToValidate
  };
};

export const actions: Actions = {
  default: async ({ cookies, request }) => {
    let itemsToValidate: MatchResult[] = JSON.parse(cookies.get('validationData') ?? '');

    const formData = await request.formData();

    const veryCloseItems = itemsToValidate.filter(item => item.status === 'very_close');
    if (!veryCloseItems || veryCloseItems.length === 0) {
      return redirect(302, 'categorize');
    }

    itemsToValidate = itemsToValidate.map(
      item => {
        if (item.status !== 'very_close') {
          return item;
        }

        if (formData.has(item.originalName)) {
          return { status: 'new', originalName: item.originalName, originalAmount: item.originalAmount };
        } else {
          return { status: 'perfect', item: item.suggestion, originalAmount: item.originalAmount };
        }
      }
    );

    cookies.set('validationData', JSON.stringify(itemsToValidate), { path: '/', maxAge: 300 }); // Short expiry

    // --- Success ---
    // Option 1: Redirect on success (common pattern after POST)
    // Replace '/path/to/success/page' with your target route
    return redirect(303, 'categorize'); // Redirect to homepage or a confirmation page

    // Option 2: Return success data (if you want the page to update without full redirect)
    // return {
    //   success: true,
    //   message: 'Items processed successfully!',
    //   processedResults: results
    // };
  }
};
