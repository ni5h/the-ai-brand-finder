import { Injectable } from '@angular/core';

/** Thin typed wrapper around window.localStorage; swallows quota/private-mode errors. */
@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable (quota exceeded, private mode) — fail silently */
    }
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }
}
