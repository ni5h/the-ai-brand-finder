import type { DomainExtension } from './generation-request.model';

export type DomainStatus = 'available' | 'taken' | 'premium' | 'unknown';

export interface DomainResult {
  domain: string;
  extension: DomainExtension;
  status: DomainStatus;
  /** Yearly price in the provider's currency, if known. */
  price?: number;
  currency?: string;
}
