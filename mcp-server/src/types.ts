/** Shared types for the NeuroEdge scan engine. */

export interface ScanSampleNode {
  /** CSS selector(s) locating the offending element. */
  target: string[];
  /** Truncated outer HTML of the element. */
  html: string;
  /** axe-core's human-readable failure summary. */
  failureSummary: string;
}

export interface ScanViolation {
  /** axe-core rule id, e.g. "image-alt", "color-contrast". */
  id: string;
  /** "critical" | "serious" | "moderate" | "minor". */
  impact: string;
  /** axe-core's technical description of the rule. */
  description: string;
  /** Link to axe-core's documentation for this rule. */
  helpUrl: string;
  /** Number of elements on the page that fail this rule. */
  nodeCount: number;
  /** WCAG success-criteria tags (e.g. "wcag2aa", "wcag143"). */
  wcagTags: string[];
  /** Up to a few concrete example elements that failed. */
  sampleNodes: ScanSampleNode[];
}

export interface ScanResult {
  /** The final URL that was scanned (post-redirect, normalised). */
  url: string;
  /** Accessibility score 0–100. */
  score: number;
  /** Total failing elements across all violations. */
  totalViolations: number;
  /** Violations, sorted critical → minor. */
  violations: ScanViolation[];
  /** Count of axe-core rules that passed. */
  passedRules: number;
  /** Total rules evaluated (passes + violations + incomplete). */
  totalRules: number;
  /** Detected CMS/platform, or "unknown". */
  cms: string;
}
