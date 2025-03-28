import type { PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import type { ShoppingItem } from '$lib/server/db/schema';
import {
  addShoppingItem,
  findAllShoppingCategories,
  findShoppingItem,
  findSimilarShoppingItems
} from '$lib/server/db/functions';

export const load: PageServerLoad = async () => {
  return {};
};

export const actions = {
  create: async ({ request, cookies }) => {
    const formData = await request.formData();
    const itemsText = formData.get('items') as string || '';
    const lines = itemsText.split('\n').map(line => line.trim()).filter(l => l !== '');

    if (lines.length === 0) {
      return fail(400, { message: 'No items entered' });
    }

    const results: MatchResult[] = [];
    for (const line of lines) {
      const { name, amount } = parseLine(line);
      if (name) { // Only process if a name was found
        results.push(await findItemMatch(name, amount));
      }
    }

    const needsValidation = results.some(r => r.status === 'very_close');
    const hasNewItems = results.some(r => r.status === 'new');
    const hasPerfectMatches = results.some(r => r.status === 'perfect');

    // --- Decision Logic ---

    // Option A: Store results in session/temp storage for next steps
    // const resultId = crypto.randomUUID(); // Generate unique ID
    // await storeResultsTemporarily(resultId, results); // Implement DB/Cache storage
    // Or use cookies/session if appropriate for your setup and data size
    // Example using cookies (limited size!) - Session is generally better
    cookies.set('validationData', JSON.stringify(results), { path: '/', maxAge: 300 }); // Short expiry

    // TODO Temp add items directly into the db for testing, remove later
    let categories = await findAllShoppingCategories();
    for (const result of results) {
      if (result.status === 'new') {
        await addShoppingItem(categories[0].id, result.originalName, result.originalAmount);
      }
    }

    return redirect(303, '../');

    if (needsValidation) {
      // Redirect to validation page, passing the ID or relying on session/cookie
      // throw redirect(303, `/shopping/validate?id=${resultId}`);
      return redirect(303, `validate`); // Rely on cookie/session
    } else if (hasNewItems) {
      // No validation needed, but new items require categorization
      // throw redirect(303, `/shopping/categorize?id=${resultId}`);
      return redirect(303, `categorize`); // Rely on cookie/session
    } else if (hasPerfectMatches) {
      // Only perfect matches - process them directly
      // await activateItems(results.filter(r => r.status === 'perfect').map(r => ({ id: r.item.id, amount: r.originalAmount }))); // Implement DB logic
      console.log('Processing perfect matches only...'); // Replace with actual DB update
      // Invalidate data and redirect back to the main list
      // Use invalidateAll() on the client via enhance's update, or specific layout data invalidation if needed
      return redirect(303, '../'); // Redirect back to origin page
    } else {
      // No items processed (e.g., only empty lines submitted)
      return redirect(303, '../');
    }
  }
};

// --- Helper: Parsing ---
function parseLine(line: string): { name: string; amount: string } {
  line = line.trim();
  let name = line;
  let amount = '1x'; // Default amount

  // Regex to find amount at start (e.g., "2x ", "5 ") or end (e.g., " 6", " x3")
  // This regex can be quite complex depending on allowed formats.
  const amountRegex = /^(?:(\d+(?:\.\d+)?)\s*x?\s+)(.+)|(.+?)(?:\s+(?:x?\s*)?(\d+(?:\.\d+)?))$/i;
  const match = line.match(amountRegex);

  if (match) {
    if (match[1] !== undefined && match[2] !== undefined) {
      // Amount at start: "2x Apples"
      amount = match[1];
      name = match[2].trim();
    } else if (match[3] !== undefined && match[4] !== undefined) {
      // Amount at end: "Apples 3"
      amount = match[4];
      name = match[3].trim();
    }
    // Ensure amount has 'x' if it's just a number, adjust as needed
    if (!/x$/i.test(amount) && !isNaN(parseFloat(amount))) {
      amount = amount + 'x';
    }
  } else {
    // No clear amount pattern found, use default
    name = line;
    amount = '1x';
  }

  return { name: name.trim(), amount };
}

// --- Helper: Matching (Simplified) ---
type MatchResult =
  | { status: 'perfect'; item: ShoppingItem; originalAmount: string }
  | { status: 'very_close'; originalName: string; originalAmount: string; suggestions: ShoppingItem[] }
  | { status: 'new'; originalName: string; originalAmount: string };

async function findItemMatch(name: string, amount: string): Promise<MatchResult> {
  // 1. Perfect Match (case-insensitive, check active & inactive)
  const perfectMatch = await findShoppingItem(name);
  if (perfectMatch) {
    return { status: 'perfect', item: perfectMatch, originalAmount: amount };
  }

  // 2. Very Close Match
  const similarItems = await findSimilarShoppingItems(name);
  if (similarItems && similarItems.length > 0) {
    return { status: 'very_close', originalName: name, originalAmount: amount, suggestions: similarItems };
  }

  // 3. New Item
  return { status: 'new', originalName: name, originalAmount: amount };
}
