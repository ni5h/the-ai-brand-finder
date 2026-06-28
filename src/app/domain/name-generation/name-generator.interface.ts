import type { Observable } from 'rxjs';
import type { GenerationRequest } from '../models';

/**
 * Generates raw candidate brand name strings only. Scoring and domain
 * availability are separate pipeline stages (see BrandScorer, DomainProvider)
 * so a generation engine never needs to know about either. Returns an
 * Observable so engines that call out (e.g. an LLM) implement the same
 * contract as ones that don't.
 */
export interface NameGenerator {
  generate(request: GenerationRequest, count: number): Observable<string[]>;
}
