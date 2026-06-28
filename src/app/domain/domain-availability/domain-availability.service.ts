import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { forkJoin, map } from 'rxjs';
import type { DomainExtension, DomainResult } from '../models';
import { INDICATIVE_ANNUAL_PRICING } from '../../core/config/domain-pricing';
import { DOMAIN_PROVIDER } from './domain-availability.tokens';

@Injectable({ providedIn: 'root' })
export class DomainAvailabilityService {
  private readonly provider = inject(DOMAIN_PROVIDER);

  checkAll(name: string, extensions: DomainExtension[]): Observable<DomainResult[]> {
    if (extensions.length === 0) {
      return forkJoin([]);
    }
    const checks = extensions.map((extension) =>
      this.provider.search(`${name.toLowerCase()}${extension}`).pipe(map((result) => this.withIndicativePrice(result))),
    );
    return forkJoin(checks);
  }

  private withIndicativePrice(result: DomainResult): DomainResult {
    if (result.status !== 'available') {
      return result;
    }
    return { ...result, price: INDICATIVE_ANNUAL_PRICING[result.extension], currency: 'INR' };
  }
}
