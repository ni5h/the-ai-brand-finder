import { inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from '../core/storage/local-storage.service';
import { STORAGE_KEYS } from '../core/storage/storage-keys';

export interface AiSettings {
  enabled: boolean;
  apiKey: string;
}

const DEFAULT_SETTINGS: AiSettings = { enabled: false, apiKey: '' };

/** API key is BYOK — kept only in localStorage and sent directly to Anthropic; never to a backend (there isn't one). */
@Injectable({ providedIn: 'root' })
export class AiSettingsStore {
  private readonly storage = inject(LocalStorageService);

  private readonly _settings = signal<AiSettings>(
    this.storage.get(STORAGE_KEYS.aiSettings, DEFAULT_SETTINGS),
  );
  readonly settings = this._settings.asReadonly();

  setEnabled(enabled: boolean): void {
    this.update({ enabled });
  }

  setApiKey(apiKey: string): void {
    this.update({ apiKey });
  }

  private update(partial: Partial<AiSettings>): void {
    const next = { ...this._settings(), ...partial };
    this._settings.set(next);
    this.storage.set(STORAGE_KEYS.aiSettings, next);
  }
}
