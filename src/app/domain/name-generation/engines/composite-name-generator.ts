import { inject, Injectable, signal } from '@angular/core';
import type { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs';
import type { GenerationRequest } from '../../models';
import { AiSettingsStore } from '../../../state/ai-settings.store';
import type { NameGenerator } from '../name-generator.interface';
import { LlmNameGenerator } from './llm-name-generator';
import { RuleBasedNameGenerator } from './rule-based-name-generator';

/**
 * The NAME_GENERATOR binding: uses the AI engine when the user has enabled
 * it in settings, silently falling back to the rule-based engine if the AI
 * call fails (no/invalid key, network error, rate limit, malformed reply).
 * Exposes `usedAiLastRun` so the UI can tell the user which engine ran.
 */
@Injectable({ providedIn: 'root' })
export class CompositeNameGenerator implements NameGenerator {
  private readonly aiSettings = inject(AiSettingsStore);
  private readonly llmGenerator = inject(LlmNameGenerator);
  private readonly ruleBasedGenerator = inject(RuleBasedNameGenerator);

  private readonly _usedAiLastRun = signal(false);
  readonly usedAiLastRun = this._usedAiLastRun.asReadonly();

  generate(request: GenerationRequest, count: number): Observable<string[]> {
    if (!this.aiSettings.settings().enabled) {
      this._usedAiLastRun.set(false);
      return this.ruleBasedGenerator.generate(request, count);
    }

    return this.llmGenerator.generate(request, count).pipe(
      tap(() => this._usedAiLastRun.set(true)),
      catchError(() => {
        this._usedAiLastRun.set(false);
        return this.ruleBasedGenerator.generate(request, count);
      }),
    );
  }
}
