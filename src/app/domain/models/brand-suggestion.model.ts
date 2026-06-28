import type { BrandCategory, BrandStyle } from './generation-request.model';
import type { BrandScore } from './brand-score.model';
import type { DomainResult } from './domain-result.model';

export interface BrandSuggestion {
  id: string;
  name: string;
  category: BrandCategory;
  style: BrandStyle;
  length: number;
  score: BrandScore;
  domains: DomainResult[];
  favourite: boolean;
  createdAt: number;
}
