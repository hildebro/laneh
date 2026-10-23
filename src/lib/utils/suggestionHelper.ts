export const maxVisibleSuggestions = 6;

// Reorders a list that is sorted by relevance, so the top stays likely but varies between calls (weighted random
// sampling by Efraimidis & Spirakis). The item at rank r gets the weight exp(-r / decay): the lower the decay, the
// stricter the original order is kept. Short lists are shuffled almost fully, while the tail of long lists stays rare.
export function shuffleByRank<T>(
  sortedItems: T[],
  decay: number = maxVisibleSuggestions,
  random: () => number = Math.random
): T[] {
  return sortedItems
    // The key is random^(1 / weight), and the highest keys come first.
    .map((item, rank) => ({ item, key: Math.pow(1 - random(), Math.exp(rank / decay)) }))
    .sort((a, b) => b.key - a.key)
    .map(({ item }) => item);
}
