import { inject, Injectable, signal } from '@angular/core';
import { BrandGenerationService } from '../domain/brand-generation.service';
import type { BrandSuggestion, GenerationRequest } from '../domain/models';
import { FavouritesStore } from './favourites.store';
import { RecentSearchesStore } from './recent-searches.store';

/** Holds the in-memory results of the most recent generation run. */
@Injectable({ providedIn: 'root' })
export class GenerationStore {
  private readonly generationService = inject(BrandGenerationService);
  private readonly recentSearches = inject(RecentSearchesStore);
  private readonly favouritesStore = inject(FavouritesStore);

  private readonly _suggestions = signal<BrandSuggestion[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _lastRequest = signal<GenerationRequest | null>(null);

  readonly suggestions = this._suggestions.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly lastRequest = this._lastRequest.asReadonly();

  generate(request: GenerationRequest): void {
    this._loading.set(true);
    this._error.set(null);
    this._lastRequest.set(request);

    this.generationService.generate(request).subscribe({
      next: (suggestions) => {
        const withFavourites = suggestions.map((suggestion) => ({
          ...suggestion,
          favourite: this.favouritesStore.isFavourite(suggestion.id),
        }));
        this._suggestions.set(withFavourites);
        this._loading.set(false);
        this.recentSearches.record(request, withFavourites.length);
      },
      error: () => {
        this._error.set('Something went wrong while generating names. Please try again.');
        this._loading.set(false);
      },
    });
  }

  toggleFavourite(suggestion: BrandSuggestion): void {
    this.favouritesStore.toggle(suggestion);
    this._suggestions.update((list) =>
      list.map((item) => (item.id === suggestion.id ? { ...item, favourite: !item.favourite } : item)),
    );
  }
}
