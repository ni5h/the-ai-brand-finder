import type { BrandScore, GenerationRequest } from '../models';

export interface BrandScorer {
  score(name: string, request: GenerationRequest): BrandScore;
}
