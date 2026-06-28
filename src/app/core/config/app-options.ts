import type {
  AnnualBudget,
  BrandCategory,
  BrandStyle,
  DomainExtension,
} from '../../domain/models';

export interface SelectOption<T> {
  value: T;
  label: string;
}

export const BRAND_CATEGORIES: SelectOption<BrandCategory>[] = [
  { value: 'startup', label: 'Startup' },
  { value: 'education', label: 'Education' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'blog', label: 'Blog' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'app', label: 'App' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'ngo', label: 'NGO' },
  { value: 'school', label: 'School' },
  { value: 'personal-brand', label: 'Personal Brand' },
  { value: 'custom', label: 'Custom' },
];

export const BRAND_STYLES: SelectOption<BrandStyle>[] = [
  { value: 'modern', label: 'Modern' },
  { value: 'professional', label: 'Professional' },
  { value: 'playful', label: 'Playful' },
  { value: 'premium', label: 'Premium' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'tech', label: 'Tech' },
  { value: 'creative', label: 'Creative' },
  { value: 'educational', label: 'Educational' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'short', label: 'Short' },
  { value: 'invented-word', label: 'Invented Word' },
  { value: 'two-word', label: 'Two-word Brand' },
  { value: 'acronym', label: 'Acronym' },
  { value: 'no-preference', label: 'No Preference' },
];

export const DOMAIN_EXTENSIONS: DomainExtension[] = [
  '.com',
  '.in',
  '.io',
  '.app',
  '.dev',
  '.ai',
  '.org',
  '.net',
  '.co',
];

export const BUDGET_TIERS: SelectOption<AnnualBudget>[] = [
  { value: 500, label: '₹500' },
  { value: 1000, label: '₹1,000' },
  { value: 2000, label: '₹2,000' },
  { value: 5000, label: '₹5,000' },
  { value: null, label: 'Unlimited' },
];

export const SUGGESTION_COUNTS: number[] = [50, 100, 250, 500, 1000];
