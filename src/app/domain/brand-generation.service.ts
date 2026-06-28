import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { DomainAvailabilityService } from './domain-availability/domain-availability.service';
import type { BrandSuggestion, DomainResult, GenerationRequest } from './models';
import { NAME_GENERATOR } from './name-generation/name-generation.tokens';
import { BRAND_SCORER } from './scoring/scoring.tokens';

const OVERSAMPLE_FACTOR = 3;

/** Orchestrates generation -> scoring -> domain availability into ranked BrandSuggestions. */
@Injectable({ providedIn: 'root' })
export class BrandGenerationService {
  private readonly nameGenerator = inject(NAME_GENERATOR);
  private readonly scorer = inject(BRAND_SCORER);
  private readonly domainAvailability = inject(DomainAvailabilityService);

  generate(request: GenerationRequest): Observable<BrandSuggestion[]> {
    return this.nameGenerator.generate(request, request.suggestionCount * OVERSAMPLE_FACTOR).pipe(
      switchMap((candidateNames) => {
        if (candidateNames.length === 0) {
          return of([]);
        }
        return forkJoin(candidateNames.map((name) => this.buildSuggestion(name, request))).pipe(
          map((suggestions) =>
            suggestions
              .sort((a, b) => b.score.overall - a.score.overall)
              .slice(0, request.suggestionCount),
          ),
        );
      }),
    );
  }

  private buildSuggestion(name: string, request: GenerationRequest): Observable<BrandSuggestion> {
    const score = this.scorer.score(name, request);
    return this.domainAvailability.checkAll(name, request.domainExtensions).pipe(
      map((domains) => ({
        id: this.makeId(),
        name,
        category: request.category,
        style: request.style,
        length: name.length,
        score,
        domains: this.applyBudgetFilter(domains, request.maxAnnualBudget),
        favourite: false,
        createdAt: Date.now(),
      })),
    );
  }

  private applyBudgetFilter(
    domains: DomainResult[],
    maxAnnualBudget: GenerationRequest['maxAnnualBudget'],
  ): DomainResult[] {
    if (maxAnnualBudget === null) {
      return domains;
    }
    return domains.filter(
      (domain) => domain.status !== 'available' || (domain.price ?? Infinity) <= maxAnnualBudget,
    );
  }

  private makeId(): string {
    return crypto.randomUUID();
  }
}
