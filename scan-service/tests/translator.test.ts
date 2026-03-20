import { describe, it, expect } from 'vitest';
import { validateTranslation } from '../src/translator.js';

describe('validateTranslation', () => {
  it('rejects null', () => {
    expect(validateTranslation(null)).toBe(false);
  });

  it('rejects non-object', () => {
    expect(validateTranslation('string')).toBe(false);
    expect(validateTranslation(42)).toBe(false);
  });

  it('rejects output missing required fields', () => {
    expect(validateTranslation({ issues: [] })).toBe(false);
  });

  it('rejects issues array with missing required fields', () => {
    const missingImpact = {
      issues: [{
        id: 'color-contrast',
        plainEnglish: 'Some text is hard to read.',
        // businessImpact missing
        fixDifficulty: 'easy',
      }],
    };
    expect(validateTranslation(missingImpact)).toBe(false);
  });

  it('rejects issues array with missing id', () => {
    const missingId = {
      issues: [{
        // id missing
        plainEnglish: 'Some text is hard to read.',
        businessImpact: 'Visitors may leave.',
        fixDifficulty: 'easy',
      }],
    };
    expect(validateTranslation(missingId)).toBe(false);
  });

  it('rejects issues array with missing plainEnglish', () => {
    const missingPlainEnglish = {
      issues: [{
        id: 'color-contrast',
        // plainEnglish missing
        businessImpact: 'Visitors may leave.',
        fixDifficulty: 'easy',
      }],
    };
    expect(validateTranslation(missingPlainEnglish)).toBe(false);
  });

  it('accepts well-formed translation', () => {
    const valid = {
      issues: [{
        id: 'color-contrast',
        plainEnglish: 'Some text on your website is hard to read.',
        businessImpact: 'Visitors with low vision may leave.',
        fixDifficulty: 'easy',
        estimatedFixTime: 'Under 1 hour',
        whatToTellDeveloper: 'Please increase the contrast ratio on body text.',
      }],
    };
    expect(validateTranslation(valid)).toBe(true);
  });

  it('accepts multiple well-formed issues', () => {
    const valid = {
      issues: [
        {
          id: 'color-contrast',
          plainEnglish: 'Text is hard to read.',
          businessImpact: 'Users with low vision may leave.',
          fixDifficulty: 'easy',
          estimatedFixTime: 'Under 1 hour',
          whatToTellDeveloper: 'Increase contrast ratio.',
        },
        {
          id: 'image-alt',
          plainEnglish: 'Images are missing descriptions.',
          businessImpact: 'Screen reader users cannot understand your images.',
          fixDifficulty: 'medium',
          estimatedFixTime: '1-2 hours',
          whatToTellDeveloper: 'Add alt text to all images.',
        },
      ],
    };
    expect(validateTranslation(valid)).toBe(true);
  });
});
