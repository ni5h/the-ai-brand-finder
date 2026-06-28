export type BrandCategory =
  | 'startup'
  | 'education'
  | 'youtube'
  | 'blog'
  | 'podcast'
  | 'app'
  | 'restaurant'
  | 'cafe'
  | 'ngo'
  | 'school'
  | 'personal-brand'
  | 'custom';

export type BrandStyle =
  | 'modern'
  | 'professional'
  | 'playful'
  | 'premium'
  | 'minimal'
  | 'tech'
  | 'creative'
  | 'educational'
  | 'luxury'
  | 'short'
  | 'invented-word'
  | 'two-word'
  | 'acronym'
  | 'no-preference';

export type DomainExtension =
  | '.com'
  | '.in'
  | '.io'
  | '.app'
  | '.dev'
  | '.ai'
  | '.org'
  | '.net'
  | '.co';

/** `null` budget means "Unlimited". */
export type AnnualBudget = number | null;

export interface GenerationRequest {
  keywords: string[];
  category: BrandCategory;
  /** Required when category is 'custom'. */
  customCategory?: string;
  style: BrandStyle;
  domainExtensions: DomainExtension[];
  maxAnnualBudget: AnnualBudget;
  suggestionCount: number;
}
