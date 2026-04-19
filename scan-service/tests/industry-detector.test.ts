import { describe, it, expect } from 'vitest';
import { detectIndustry, type PageSignals } from '../src/industry-detector.js';

const baseSignals: PageSignals = {
  title: '',
  metaDescription: '',
  metaKeywords: '',
  h1s: [],
  schemaTypes: [],
  navText: '',
  bodySnippet: '',
  url: '',
};

describe('detectIndustry', () => {
  it('returns "other" for a BBC-like homepage with incidental substring matches', () => {
    // "barrister" contains "bar", "foodie" contains "food" — the old
    // substring matcher wrongly tagged this as restaurant. Word-boundary
    // matching must reject these fragments.
    const signals: PageSignals = {
      ...baseSignals,
      title: 'BBC Home - Breaking News, World News, US News, Sports, Business, Innovation, Climate, Culture, Travel, Video & Audio',
      metaDescription: 'Visit BBC for trusted reporting on the latest news, sport, business, weather, and more.',
      bodySnippet:
        'The barrister said justice would prevail. A foodie festival drew large crowds. Headlines from Parliament and the City.',
      navText: 'News Sport Weather iPlayer Sounds Bitesize',
      url: 'https://www.bbc.co.uk/',
    };

    expect(detectIndustry(signals)).toBe('other');
  });

  it('classifies a real restaurant homepage as "restaurant"', () => {
    const signals: PageSignals = {
      ...baseSignals,
      title: 'Bella Italia - Authentic Italian Restaurant',
      h1s: ['Welcome to Bella Italia'],
      bodySnippet:
        'View our menu and book a reservation for dinner. Hand-stretched pizza, fresh pasta and a warm welcome.',
      url: 'https://www.bellaitalia.example/',
    };

    expect(detectIndustry(signals)).toBe('restaurant');
  });

  it('classifies a law firm as "professional" without leaking "bar" into restaurant', () => {
    const signals: PageSignals = {
      ...baseSignals,
      title: 'Smith & Co Solicitors',
      h1s: ['Smith & Co Solicitors'],
      bodySnippet:
        'Independent legal advice from a trusted barrister-led team. Speak to a consultant about your matter today.',
      url: 'https://www.smithco.example/',
    };

    expect(detectIndustry(signals)).toBe('professional');
  });

  it('treats a Schema.org Dentist type as decisive health signal', () => {
    const signals: PageSignals = {
      ...baseSignals,
      title: 'Your Local NHS Dental Practice',
      schemaTypes: ['Dentist'],
      bodySnippet: 'Book a check-up with our friendly team.',
      url: 'https://www.example-dental.nhs.uk/',
    };

    expect(detectIndustry(signals)).toBe('health');
  });

  it('returns "other" when only one keyword hits (below the threshold)', () => {
    const signals: PageSignals = {
      ...baseSignals,
      title: 'Community Newsletter',
      bodySnippet: 'This month we feature a single mention of the local menu at the fete.',
      url: 'https://www.example.org/newsletter',
    };

    expect(detectIndustry(signals)).toBe('other');
  });

  it('does not mutate the input signals object', () => {
    const signals: PageSignals = {
      ...baseSignals,
      title: 'Bella Italia',
      bodySnippet: 'menu reservation',
    };
    const snapshot = JSON.parse(JSON.stringify(signals));

    detectIndustry(signals);

    expect(signals).toEqual(snapshot);
  });
});
