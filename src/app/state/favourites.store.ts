import { inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from '../core/storage/local-storage.service';
import { STORAGE_KEYS } from '../core/storage/storage-keys';
import type { BrandSuggestion } from '../domain/models';

@Injectable({ providedIn: 'root' })
export class FavouritesStore {
  private readonly storage = inject(LocalStorageService);

  private readonly _favourites = signal<BrandSuggestion[]>(
    this.storage.get(STORAGE_KEYS.favourites, []),
  );
  readonly favourites = this._favourites.asReadonly();

  isFavourite(id: string): boolean {
    return this._favourites().some((favourite) => favourite.id === id);
  }

  toggle(suggestion: BrandSuggestion): void {
    const next = this.isFavourite(suggestion.id)
      ? this._favourites().filter((favourite) => favourite.id !== suggestion.id)
      : [...this._favourites(), { ...suggestion, favourite: true }];
    this._favourites.set(next);
    this.storage.set(STORAGE_KEYS.favourites, next);
  }

  remove(id: string): void {
    const next = this._favourites().filter((favourite) => favourite.id !== id);
    this._favourites.set(next);
    this.storage.set(STORAGE_KEYS.favourites, next);
  }
}
