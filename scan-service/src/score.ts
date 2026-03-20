const IMPACT_WEIGHTS: Record<string, number> = {
  critical: 10,
  serious: 5,
  moderate: 3,
  minor: 1,
};

export interface ScoringInput {
  violations: Array<{ impact: string; nodes: unknown[] }>;
  passes: unknown[];
}

export function calculateScore(input: ScoringInput): number {
  const { violations, passes } = input;

  if (violations.length === 0 && passes.length === 0) return 100;

  const totalDeductions = violations.reduce((sum, v) => {
    const weight = IMPACT_WEIGHTS[v.impact] ?? 1;
    return sum + weight * v.nodes.length;
  }, 0);

  const totalRules = passes.length + violations.length;
  if (totalRules === 0) return 100;

  const passRatio = passes.length / totalRules;
  const deductionPenalty = Math.min(totalDeductions / (totalRules * 2), 1);
  const raw = (passRatio * 0.6 + (1 - deductionPenalty) * 0.4) * 100;

  return Math.max(0, Math.min(100, Math.round(raw)));
}
