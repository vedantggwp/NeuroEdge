import { describe, it, expect } from 'vitest';
import { calculateScore } from '@neuroedge/shared';

describe('calculateScore', () => {
  it('returns 100 for no violations', () => {
    expect(calculateScore({ violations: [], passes: new Array(50) })).toBe(100);
  });

  it('stays low for all-critical violations with no passes', () => {
    const violations = new Array(20).fill({ impact: 'critical', nodes: [{}] });
    const score = calculateScore({ violations, passes: [] });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThan(15);
  });

  it('weighs critical higher than minor', () => {
    const critical = [{ impact: 'critical', nodes: [{}, {}] }];
    const minor = [{ impact: 'minor', nodes: [{}, {}] }];
    const passes = new Array(10).fill({});
    expect(calculateScore({ violations: critical, passes })).toBeLessThan(
      calculateScore({ violations: minor, passes }),
    );
  });

  it('clamps between 0 and 100', () => {
    const score = calculateScore({ violations: [], passes: [] });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('does not saturate at high deduction counts', () => {
    const passes = new Array(20).fill({});
    const forty = [{ impact: 'critical', nodes: new Array(40).fill({}) }];
    const twoHundred = [{ impact: 'critical', nodes: new Array(200).fill({}) }];
    expect(calculateScore({ violations: twoHundred, passes })).toBeLessThan(
      calculateScore({ violations: forty, passes }),
    );
  });
});
