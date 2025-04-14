import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import * as m from '$lib/paraglide/messages.js';
import {
  addCloseStagedItem,
  addNewStagedItem,
  addPerfectStagedItem,
  addStagedShoppingList,
  commitStagedItems,
  findShoppingItem,
  findSimilarShoppingItem,
  findStagedShoppingList
} from '$lib/server/db/functions';

export const load: PageServerLoad = async ({ locals }) => {
  const userId = locals.user?.id as string;

  const existingList = await findStagedShoppingList(userId);
  if (existingList) {
    return redirect(302, 'validate')
  }
  
  return {};
};

export const actions = {
  create: async ({ request, locals }) => {
    // --- Process Input Lines ---
    const formData = await request.formData();
    const itemsText = formData.get('items') as string || '';
    const lines = itemsText.split('\n').map(line => line.trim()).filter(l => l !== '');

    if (lines.length === 0) {
      return fail(400, { message: m.generic_empty() });
    }

    // --- Get User (Essential) ---
    const userId = locals.user?.id as string;
    const listId = await addStagedShoppingList(userId);

    // --- Process lines and prepare staged data ---
    let needsValidation = false;
    let needsCategorization = false;
    for (const line of lines) {
      const { name, amount } = parseLine(line);
      if (!name) {
        return fail(400, { message: m.shopping_add_items_parse_error() });
      }

      // case `perfect_match` doesn't matter to us here.
      const result = await persistStagedItem(name, amount, listId);
      switch (result) {
        case 'close_match':
          needsValidation = true;
          continue;
        case 'unmatched':
          needsCategorization = true;
      }
    }

    // --- Decision Logic ---
    if (needsValidation) {
      return redirect(303, `validate`);
    } else if (needsCategorization) {
      return redirect(303, `categorize`);
    } else {
      // If all items are perfect matches, we can just commit them
      await commitStagedItems(userId);

      return redirect(303, '../');
    }
  }
};

// --- Helper: Parsing (Keep your existing function) ---
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

type MatchResult = 'perfect_match' | 'close_match' | 'unmatched';

async function persistStagedItem(name: string, amount: string, listId: string): Promise<MatchResult> {
  // 1. Perfect Match (case-insensitive, check active & inactive)
  const perfectMatch = await findShoppingItem(name);
  if (perfectMatch) {
    await addPerfectStagedItem(listId, perfectMatch, amount);

    return 'perfect_match';
  }

  // 2. Very Close Match
  const similarItem = await findSimilarShoppingItem(name);
  if (similarItem) {
    await addCloseStagedItem(listId, similarItem, name, amount);

    return 'close_match';
  }

  await addNewStagedItem(listId, name, amount);

  return 'unmatched';
}
