import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { catchError, map, of } from 'rxjs';
import type { DomainExtension, DomainResult, DomainStatus } from '../../models';
import { DOMAIN_EXTENSIONS } from '../../../core/config/app-options';
import type { DomainProvider } from '../domain-provider.interface';

interface DohAnswer {
  name: string;
  type: number;
  data: string;
}

interface DohResponse {
  Status: number;
  Answer?: DohAnswer[];
}

const NXDOMAIN = 3;
const NOERROR = 0;

/**
 * Checks registration status via DNS-over-HTTPS NS lookups (Cloudflare's
 * public resolver). This is a heuristic: a domain with NS records is
 * registered, NXDOMAIN usually means it's free. No pricing data is
 * available this way, and parked-but-unconfigured domains can read as
 * available. Swap in a registrar API later via the DOMAIN_PROVIDER token.
 */
@Injectable()
export class DohDomainProvider implements DomainProvider {
  private readonly http = inject(HttpClient);
  private readonly endpoint = 'https://cloudflare-dns.com/dns-query';

  search(domain: string): Observable<DomainResult> {
    const extension = this.extractExtension(domain);
    return this.http
      .get<DohResponse>(this.endpoint, {
        params: { name: domain, type: 'NS' },
        headers: { Accept: 'application/dns-json' },
      })
      .pipe(
        map((response) => this.toDomainResult(domain, extension, response)),
        catchError(() => of(this.buildResult(domain, extension, 'unknown'))),
      );
  }

  private toDomainResult(domain: string, extension: DomainExtension, response: DohResponse): DomainResult {
    if (response.Status === NXDOMAIN) {
      return this.buildResult(domain, extension, 'available');
    }
    if (response.Status === NOERROR && (response.Answer?.length ?? 0) > 0) {
      return this.buildResult(domain, extension, 'taken');
    }
    return this.buildResult(domain, extension, 'unknown');
  }

  private buildResult(domain: string, extension: DomainExtension, status: DomainStatus): DomainResult {
    return { domain, extension, status };
  }

  private extractExtension(domain: string): DomainExtension {
    const match = DOMAIN_EXTENSIONS.find((extension) => domain.endsWith(extension));
    return match ?? '.com';
  }
}
