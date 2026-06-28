import type { DomainExtension } from '../../domain/models';

/**
 * Indicative yearly registration prices (INR) by extension. DNS-over-HTTPS
 * availability checks carry no real pricing, so this static table is the
 * V1 stand-in until a registrar pricing API is wired in via DOMAIN_PROVIDER.
 */
export const INDICATIVE_ANNUAL_PRICING: Record<DomainExtension, number> = {
  '.com': 999,
  '.in': 699,
  '.io': 2999,
  '.app': 1499,
  '.dev': 1499,
  '.ai': 7999,
  '.org': 999,
  '.net': 999,
  '.co': 1999,
};
