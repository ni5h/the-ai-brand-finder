import type { GenerationRequest } from '../../models';
import { RuleBasedNameGenerator } from './rule-based-name-generator';

function makeRequest(overrides: Partial<GenerationRequest> = {}): GenerationRequest {
  return {
    keywords: ['thinking', 'growth'],
    category: 'startup',
    style: 'modern',
    domainExtensions: ['.com'],
    maxAnnualBudget: null,
    suggestionCount: 20,
    ...overrides,
  };
}

/** RuleBasedNameGenerator emits synchronously, so subscribing resolves the value immediately. */
function generateNames(
  generator: RuleBasedNameGenerator,
  request: GenerationRequest,
  count: number,
): string[] {
  let result: string[] = [];
  generator.generate(request, count).subscribe((names) => (result = names));
  return result;
}

describe('RuleBasedNameGenerator', () => {
  const generator = new RuleBasedNameGenerator();

  it('returns no candidates when there are no keywords', () => {
    expect(generateNames(generator, makeRequest({ keywords: [] }), 10)).toEqual([]);
  });

  it('generates unique, capitalized names within the requested count', () => {
    const names = generateNames(generator, makeRequest(), 15);
    expect(names.length).toBeGreaterThan(0);
    expect(names.length).toBeLessThanOrEqual(15);
    expect(new Set(names).size).toBe(names.length);
    for (const name of names) {
      expect(name[0]).toBe(name[0].toUpperCase());
    }
  });

  it('rejects names that are too long, too short, or have excessive repeated letters', () => {
    const names = generateNames(generator, makeRequest(), 200);
    for (const name of names) {
      expect(name.length).toBeGreaterThanOrEqual(3);
      expect(name.length).toBeLessThanOrEqual(16);
      expect(/(.)\1\1/.test(name.toLowerCase())).toBe(false);
    }
  });

  it('builds acronyms when style is "acronym"', () => {
    const names = generateNames(
      generator,
      makeRequest({ style: 'acronym', keywords: ['up', 'run', 'any'] }),
      10,
    );
    expect(names.some((name) => name.toLowerCase().startsWith('ura'))).toBe(true);
  });

  it('builds two-word brand names when style is "two-word"', () => {
    const names = generateNames(
      generator,
      makeRequest({ style: 'two-word', keywords: ['go', 'time'] }),
      10,
    );
    expect(names).toContain('GoTime');
  });
});
