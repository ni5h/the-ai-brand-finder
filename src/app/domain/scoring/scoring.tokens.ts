import { InjectionToken } from '@angular/core';
import type { BrandScorer } from './brand-scorer.interface';

export const BRAND_SCORER = new InjectionToken<BrandScorer>('BRAND_SCORER');
