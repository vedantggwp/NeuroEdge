import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export interface TranslatedIssue {
  id: string;
  plainEnglish: string;
  businessImpact: string;
  fixDifficulty: 'easy' | 'medium' | 'hard';
  estimatedFixTime: string;
  whatToTellDeveloper: string;
  howToFixYourself?: string;
  cmsSpecificSteps?: string;
  canFixYourself?: boolean;
}

export interface TranslationOutput {
  issues: TranslatedIssue[];
}

export type ViolationSampleNode = {
  target: string[];
  html: string;
  failureSummary: string;
};

export type ViolationInput = {
  id: string;
  impact: string;
  description: string;
  helpUrl: string;
  nodeCount: number;
  sampleNodes?: ViolationSampleNode[];
};

function isTranslatedIssue(value: unknown): value is TranslatedIssue {
  if (!value || typeof value !== 'object') return false;
  const i = value as Record<string, unknown>;
  const hasRequiredFields =
    typeof i['id'] === 'string' &&
    i['id'].length > 0 &&
    typeof i['plainEnglish'] === 'string' &&
    i['plainEnglish'].length > 0 &&
    typeof i['businessImpact'] === 'string' &&
    i['businessImpact'].length > 0 &&
    typeof i['fixDifficulty'] === 'string' &&
    i['fixDifficulty'].length > 0;

  if (!hasRequiredFields) return false;

  // Validate optional new fields if present (don't reject if absent)
  if ('howToFixYourself' in i && typeof i['howToFixYourself'] !== 'string') return false;
  if ('cmsSpecificSteps' in i && typeof i['cmsSpecificSteps'] !== 'string') return false;
  if ('canFixYourself' in i && typeof i['canFixYourself'] !== 'boolean') return false;

  return true;
}

export function validateTranslation(output: unknown): output is TranslationOutput {
  if (!output || typeof output !== 'object') return false;
  const obj = output as Record<string, unknown>;
  if (!Array.isArray(obj['issues'])) return false;
  if (obj['issues'].length === 0) return false;
  return obj['issues'].every(isTranslatedIssue);
}

const MAX_SAMPLE_NODES_IN_PROMPT = 3;
const MAX_HTML_CHARS_IN_PROMPT = 200;

function formatSampleNodes(sampleNodes?: ViolationSampleNode[]): string {
  if (!sampleNodes || sampleNodes.length === 0) return '';
  const examples = sampleNodes.slice(0, MAX_SAMPLE_NODES_IN_PROMPT).map((n, i) => {
    const selector = n.target.join(' ') || '(no selector)';
    const html = (n.html ?? '').slice(0, MAX_HTML_CHARS_IN_PROMPT);
    const htmlLine = html ? `\n    html: ${html}` : '';
    return `  ${i + 1}. selector: ${selector}${htmlLine}`;
  });
  return `\n  Example elements:\n${examples.join('\n')}`;
}

function buildPrompt(violations: ViolationInput[], url: string, industry: string, cms: string): string {
  const violationList = violations
    .map((v) => {
      const header = `- ${v.id} (${v.impact}): ${v.description} — affects ${v.nodeCount} elements`;
      return `${header}${formatSampleNodes(v.sampleNodes)}`;
    })
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
- whatToTellDeveloper: one sentence a business owner can copy-paste to their web developer. If example elements are listed above, reference one real selector from them so the developer knows exactly where to look.
- howToFixYourself: step-by-step instructions a non-technical person can follow to fix this issue themselves (if possible). Write as if explaining to someone who has never seen HTML. If the fix requires a developer, say "This one needs a web developer. Forward the 'whatToTellDeveloper' text to them."
- cmsSpecificSteps: if the CMS is "${cms}", provide specific steps for that platform's editor (e.g., "In WordPress: Go to Pages > Edit > click the image > add Alternative Text"). If CMS is "unknown", provide generic instructions.
- canFixYourself: true if a non-technical person could fix this using their CMS editor (alt text, contrast changes, form labels), false if it requires code changes

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
    howToFixYourself: 'This one needs a web developer. Forward the \'whatToTellDeveloper\' text to them.',
    cmsSpecificSteps: 'Contact your web developer for platform-specific guidance.',
    canFixYourself: false,
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
  cms: string = 'unknown',
): Promise<TranslatedIssue[]> {
  if (violations.length === 0) return [];

  const prompt = buildPrompt(violations, url, industry, cms);

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
