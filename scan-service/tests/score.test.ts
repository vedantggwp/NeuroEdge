import { describe, it, expect } from 'vitest';
import { calculateScore } from '../src/score.js';

describe('calculateScore', () => {
  it('returns 100 for no violations', () => {
    expect(calculateScore({ violations: [], passes: new Array(50) })).toBe(100);
  });

  it('returns 0 for all critical violations no passes', () => {
    const violations = new Array(20).fill({ impact: 'critical', nodes: [{}] });
    expect(calculateScore({ violations, passes: [] })).toBe(0);
  });

  it('weighs critical higher than minor', () => {
    const critical = [{ impact: 'critical', nodes: [{}, {}] }];
    const minor = [{ impact: 'minor', nodes: [{}, {}] }];
    const passes = new Array(10).fill({});
    expect(calculateScore({ violations: critical, passes }))
      .toBeLessThan(calculateScore({ violations: minor, passes }));
  });

  it('clamps between 0 and 100', () => {
    const score = calculateScore({ violations: [], passes: [] });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
