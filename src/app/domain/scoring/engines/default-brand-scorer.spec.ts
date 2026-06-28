import type { GenerationRequest } from '../../models';
import { DefaultBrandScorer } from './default-brand-scorer';

function makeRequest(overrides: Partial<GenerationRequest> = {}): GenerationRequest {
  return {
    keywords: ['think'],
    category: 'startup',
    style: 'modern',
    domainExtensions: ['.com'],
    maxAnnualBudget: null,
    suggestionCount: 20,
    ...overrides,
  };
}

describe('DefaultBrandScorer', () => {
  const scorer = new DefaultBrandScorer();

  it('produces every criterion within 0-100', () => {
    const score = scorer.score('Thinkify', makeRequest());
    for (const value of Object.values(score)) {
      if (value === undefined) continue;
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });

  it('scores an exact keyword match lower on uniqueness than an invented word', () => {
    const exactMatch = scorer.score('Think', makeRequest());
    const invented = scorer.score('Thinkify', makeRequest());
    expect(invented.uniqueness).toBeGreaterThan(exactMatch.uniqueness);
  });

  it('penalizes hard-to-pronounce consonant clusters', () => {
    const easy = scorer.score('Banana', makeRequest());
    const hard = scorer.score('Xzklpqr', makeRequest());
    expect(hard.pronunciation).toBeLessThan(easy.pronunciation);
  });

  it('rewards a professional style over a playful one for the same word', () => {
    const professional = scorer.score('Vantis', makeRequest({ style: 'professional' }));
    const playful = scorer.score('Vantis', makeRequest({ style: 'playful' }));
    expect(professional.professionalFeel).toBeGreaterThanOrEqual(playful.professionalFeel);
  });
});
