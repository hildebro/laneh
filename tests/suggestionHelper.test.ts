import { describe, expect, it } from 'vitest';
import { shuffleByRank } from '../src/lib/utils/suggestionHelper';

const ranked = Array.from({ length: 40 }, (_, i) => i);

describe('shuffleByRank', () => {
  it('keeps every item exactly once', () => {
    expect([...shuffleByRank(ranked)].sort((a, b) => a - b)).toEqual(ranked);
  });

  it('handles empty and single item lists', () => {
    expect(shuffleByRank([])).toEqual([]);
    expect(shuffleByRank(['a'])).toEqual(['a']);
  });

  it('varies the order between calls', () => {
    const orders = new Set(Array.from({ length: 20 }, () => shuffleByRank(ranked).join(',')));
    expect(orders.size).toBeGreaterThan(1);
  });

  it('keeps the order for a constant random source', () => {
    expect(shuffleByRank(ranked, 6, () => 0.5)).toEqual(ranked);
  });

  it('mostly fills the top slots from the top of the ranking, but not exclusively', () => {
    const runs = 500;
    let topSlotsFromTop = 0;
    let tailAppeared = false;
    for (let i = 0; i < runs; i++) {
      const top6 = shuffleByRank(ranked).slice(0, 6);
      topSlotsFromTop += top6.filter((item) => item < 12).length;
      tailAppeared ||= top6.some((item) => item >= 20);
    }
    expect(topSlotsFromTop / (runs * 6)).toBeGreaterThan(0.6);
    expect(tailAppeared).toBe(true);
  });
});
