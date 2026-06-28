import { inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from '../core/storage/local-storage.service';
import { STORAGE_KEYS } from '../core/storage/storage-keys';
import type { GenerationRequest } from '../domain/models';

export interface RecentSearchEntry {
  id: string;
  request: GenerationRequest;
  resultCount: number;
  createdAt: number;
}

const MAX_ENTRIES = 20;

@Injectable({ providedIn: 'root' })
export class RecentSearchesStore {
  private readonly storage = inject(LocalStorageService);

  private readonly _entries = signal<RecentSearchEntry[]>(
    this.storage.get(STORAGE_KEYS.recentSearches, []),
  );
  readonly entries = this._entries.asReadonly();

  record(request: GenerationRequest, resultCount: number): void {
    const entry: RecentSearchEntry = {
      id: crypto.randomUUID(),
      request,
      resultCount,
      createdAt: Date.now(),
    };
    const next = [entry, ...this._entries()].slice(0, MAX_ENTRIES);
    this._entries.set(next);
    this.storage.set(STORAGE_KEYS.recentSearches, next);
  }

  clear(): void {
    this._entries.set([]);
    this.storage.remove(STORAGE_KEYS.recentSearches);
  }
}
