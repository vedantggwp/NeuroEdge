import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export interface TranslatedIssue {
  id: string;
  plainEnglish: string;
  businessImpact: string;
  fixDifficulty: 'easy' | 'medium' | 'hard';
  estimatedFixTime: string;
  whatToTellDeveloper: string;
}

export interface TranslationOutput {
  issues: TranslatedIssue[];
}

export type ViolationInput = {
  id: string;
  impact: string;
  description: string;
  helpUrl: string;
  nodeCount: number;
};

function isTranslatedIssue(value: unknown): value is TranslatedIssue {
  if (!value || typeof value !== 'object') return false;
  const i = value as Record<string, unknown>;
  return (
    typeof i['id'] === 'string' &&
    i['id'].length > 0 &&
    typeof i['plainEnglish'] === 'string' &&
    i['plainEnglish'].length > 0 &&
    typeof i['businessImpact'] === 'string' &&
    i['businessImpact'].length > 0 &&
    typeof i['fixDifficulty'] === 'string' &&
    i['fixDifficulty'].length > 0
  );
}

export function validateTranslation(output: unknown): output is TranslationOutput {
  if (!output || typeof output !== 'object') return false;
  const obj = output as Record<string, unknown>;
  if (!Array.isArray(obj['issues'])) return false;
  if (obj['issues'].length === 0) return false;
  return obj['issues'].every(isTranslatedIssue);
}

function buildPrompt(violations: ViolationInput[], url: string, industry: string): string {
  const violationList = violations
    .map((v) => `- ${v.id} (${v.impact}): ${v.description} — affects ${v.nodeCount} elements`)
    .join('\n');

  return `You are NeuroEdge, an accessibility audit tool for UK small businesses. Translate these WCAG violations into plain English that a non-technical business owner can understand.

Website: ${url}
Industry: ${industry}

Violations:
${violationList}

For each violation, return a JSON array with:
- id: the violation ID
- plainEnglish: explain what's wrong in simple language (no jargon, no WCAG codes)
- businessImpact: explain how this affects their customers and revenue
- fixDifficulty: "easy" (under 1 hour), "medium" (1-4 hours), or "hard" (needs a developer)
- estimatedFixTime: human-readable estimate
- whatToTellDeveloper: one sentence a business owner can copy-paste to their web developer

Respond ONLY with valid JSON: { "issues": [...] }`;
}

function buildFallback(violations: ViolationInput[]): TranslatedIssue[] {
  return violations.map((v) => ({
    id: v.id,
    plainEnglish: v.description,
    businessImpact: `This ${v.impact} issue affects ${v.nodeCount} elements on your website.`,
    fixDifficulty:
      v.impact === 'critical' || v.impact === 'serious' ? ('medium' as const) : ('easy' as const),
    estimatedFixTime: 'Varies',
    whatToTellDeveloper: `Please fix: ${v.id} — ${v.description}`,
  }));
}

function extractJson(text: string): unknown {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const toParse = fenceMatch ? fenceMatch[1] : text;
  return JSON.parse(toParse.trim());
}

export async function translateViolations(
  violations: ViolationInput[],
  url: string,
  industry: string,
): Promise<TranslatedIssue[]> {
  if (violations.length === 0) return [];

  const prompt = buildPrompt(violations, url, industry);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = extractJson(text);

    if (validateTranslation(parsed)) {
      return parsed.issues;
    }
  } catch {
    // fall through to retry
  }

  // Retry with explicit system instruction
  try {
    const retryResponse = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 4096,
      system: 'You MUST respond with ONLY valid JSON. No markdown, no explanation, no code fences.',
      messages: [{ role: 'user', content: prompt }],
    });

    const retryText =
      retryResponse.content[0].type === 'text' ? retryResponse.content[0].text : '';
    const retryParsed = extractJson(retryText);

    if (validateTranslation(retryParsed)) {
      return retryParsed.issues;
    }
  } catch {
    // fall through to fallback
  }

  return buildFallback(violations);
}
