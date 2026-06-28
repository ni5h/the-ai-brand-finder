import type { GenerationRequest } from '../models';

/**
 * Generates raw candidate brand name strings only. Scoring and domain
 * availability are separate pipeline stages (see BrandScorer, DomainProvider)
 * so a generation engine never needs to know about either.
 */
export interface NameGenerator {
  generate(request: GenerationRequest, count: number): string[];
}
