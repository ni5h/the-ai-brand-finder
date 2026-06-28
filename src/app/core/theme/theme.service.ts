import { effect, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from '../storage/local-storage.service';
import { STORAGE_KEYS } from '../storage/storage-keys';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = inject(LocalStorageService);

  private readonly _dark = signal(this.resolveInitialTheme());
  readonly dark = this._dark.asReadonly();

  constructor() {
    effect(() => {
      document.documentElement.classList.toggle('dark', this._dark());
      this.storage.set(STORAGE_KEYS.theme, this._dark());
    });
  }

  toggle(): void {
    this._dark.set(!this._dark());
  }

  private resolveInitialTheme(): boolean {
    const stored = this.storage.get<boolean | null>(STORAGE_KEYS.theme, null);
    if (stored !== null) {
      return stored;
    }
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false;
  }
}
