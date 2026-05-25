import { describe, it, expect } from 'vitest';
import { getRank, RANKS } from '@/lib/types';

describe('getRank', () => {
  it('returns Recruit for 0 earned', () => {
    const result = getRank(0);
    expect(result.current.name).toBe('Recruit');
    expect(result.next?.name).toBe('Private');
    expect(result.index).toBe(0);
  });

  it('returns Private for 1000 earned', () => {
    const result = getRank(1000);
    expect(result.current.name).toBe('Private');
    expect(result.next?.name).toBe('Corporal');
    expect(result.toNext).toBe(4000);
  });

  it('returns ShitLord for 1000000+ earned', () => {
    const result = getRank(1500000);
    expect(result.current.name).toBe('ShitLord');
    expect(result.next).toBeNull();
    expect(result.toNext).toBe(0);
  });

  it('returns correct tier boundary values', () => {
    expect(getRank(999).current.name).toBe('Recruit');
    expect(getRank(1000).current.name).toBe('Private');
    expect(getRank(4999).current.name).toBe('Private');
    expect(getRank(5000).current.name).toBe('Corporal');
  });

  it('calculates correct toNext values', () => {
    const result = getRank(3000);
    expect(result.current.name).toBe('Private');
    expect(result.toNext).toBe(2000); // 5000 - 3000
  });
});

describe('RANKS', () => {
  it('has 10 ranks', () => {
    expect(RANKS.length).toBe(10);
  });

  it('ranks are in ascending order of minEarned', () => {
    for (let i = 1; i < RANKS.length; i++) {
      expect(RANKS[i].minEarned).toBeGreaterThan(RANKS[i - 1].minEarned);
    }
  });

  it('each rank has name and emoji', () => {
    for (const rank of RANKS) {
      expect(rank.name).toBeTruthy();
      expect(rank.emoji).toBeTruthy();
      expect(typeof rank.minEarned).toBe('number');
    }
  });
});
