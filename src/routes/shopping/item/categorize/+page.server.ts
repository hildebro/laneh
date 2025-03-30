import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { ShoppingCategory } from '$lib/server/db/schema';
import { addShoppingItem, findAllShoppingCategories, reactivateShoppingItem } from '$lib/server/db/functions';
import type { MatchResult } from '../add/+page.server'; // Adjust path

// Define the structure of the item data expected from the session
interface ItemToCategorize {
  originalName: string;
  originalAmount: string;
  // Include other relevant details if needed, e.g., parsed name/amount if different
}

export const load: PageServerLoad = async ({ cookies }) => {
  // --- 1. Authentication Check (if needed) ---
  // if (!locals.user) {
  //     throw redirect(303, '/login');
  // }

  // --- 2. Retrieve items from session ---
  // Replace with your actual session retrieval logic
  const itemsToCategorize: { name: string, amount: string }[] = JSON.parse(cookies.get('validationData') ?? '')
    .filter((item: MatchResult) => item.status === 'new')
    .map((item: MatchResult) => ({ originalName: item.originalName, originalAmount: item.originalAmount }));


  // --- 3. Handle missing data ---
  if (!itemsToCategorize || itemsToCategorize.length === 0) {
    // No items need categorization, maybe they were already processed or user navigated directly.
    // Redirect to the main list. Optionally add a flash message.
    // locals.session?.flash('info', 'No items to categorize.');
    // todo temp empty item return for testing. should be replaced by service call and instant adding
    return {
      newItems: [],
      categories: []
    };
  }

  // --- 4. Fetch categories from DB ---
  let categories: ShoppingCategory[] = [];
  try {
    categories = await findAllShoppingCategories();
    if (categories.length === 0) {
      // Handle case with no categories defined (maybe create a default 'Misc'?)
      console.warn('No shopping categories found in the database.');
      // Optionally, create a default 'Misc' category here if needed
    }
  } catch (error) {
    console.error('Failed to load categories:', error);
    // Decide how to handle DB errors - show error page or try to proceed?
    // Returning error here will show SvelteKit's default error page
    // return fail(500, { message: 'Could not load categories.'}) // This doesn't work well in load, better to throw or handle gracefully
    throw new Error('Could not load categories'); // Or render page with error message
  }

  // --- 5. Return data to the page ---
  return {
    newItems: itemsToCategorize,
    categories: categories
    // Pass any form errors from previous attempts if using named actions + redirect with status
    // form: null // Placeholder for form error handling
  };
};

export const actions: Actions = {
  // Default action for saving category assignments
  default: async ({ request, cookies }) => {
    // TODO Wrap in transaction so no half baked stuff gets in.
    // --- 3. Get form data (assignments) ---
    const formData = await request.formData();
    const assignmentsJson = formData.get('assignments') as string | null;
    const assignments = JSON.parse(assignmentsJson ?? '[]');
    if (assignments.some(item => item.categoryId === null)) {
      return fail(400, { message: 'Assign all items' });
    }
    // --- 5. Process and Save Items ---
    for (const assignment of assignments) {
      // Add the new item to the database
      await addShoppingItem(
        assignment.categoryId,
        assignment.originalName,
        assignment.originalAmount
      );
    }

    let allItems: MatchResult[] = JSON.parse(cookies.get('validationData') ?? '');
    for (const index in allItems) {
      const item = allItems[index]
      switch (item.status) {
        case 'new':
          // Nothing to do, already added via assignments.
          continue;
        case 'perfect':
          await reactivateShoppingItem(item.item, item.originalAmount);
          continue;
        case 'very_close':
          return fail(400, { message: 'very_close data arrived in final step. please start from scratch' });
      }
    }

    // --- 7. Cleanup Session ---
    await cookies.set('validationData', null, { path: '/' });
    // Optionally flash a success message
    // await locals.session?.flash('success', `${savedItems.length} new items added successfully!`);

    // --- 8. Redirect on Success ---
    // Using throw redirect is standard after successful POST/actions
    return redirect(303, '../');
  }
};