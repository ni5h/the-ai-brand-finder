import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { map, throwError } from 'rxjs';
import type { GenerationRequest } from '../../models';
import { AiSettingsStore } from '../../../state/ai-settings.store';
import type { NameGenerator } from '../name-generator.interface';

const ANTHROPIC_MESSAGES_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const ANTHROPIC_MODEL = 'claude-sonnet-4-6';
/** Keeps a single call within reasonable token/latency bounds; the pipeline tolerates fewer names than requested. */
const MAX_NAMES_PER_CALL = 150;
const MAX_TOKENS = 2048;
const VALID_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9]{2,19}$/;

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicMessagesResponse {
  content: AnthropicContentBlock[];
}

/**
 * Calls the Anthropic Messages API directly from the browser with a
 * user-supplied (BYOK) API key — this app has no backend to hold secrets.
 * Any failure (missing key, network, bad response) is surfaced as an
 * Observable error; CompositeNameGenerator decides what to do about it.
 */
@Injectable({ providedIn: 'root' })
export class LlmNameGenerator implements NameGenerator {
  private readonly http = inject(HttpClient);
  private readonly aiSettings = inject(AiSettingsStore);

  generate(request: GenerationRequest, count: number): Observable<string[]> {
    const apiKey = this.aiSettings.settings().apiKey.trim();
    if (!apiKey) {
      return throwError(() => new Error('No Anthropic API key configured.'));
    }

    const requestedCount = Math.min(count, MAX_NAMES_PER_CALL);
    const body = {
      model: ANTHROPIC_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: this.buildPrompt(request, requestedCount) }],
    };
    const headers = {
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    };

    return this.http
      .post<AnthropicMessagesResponse>(ANTHROPIC_MESSAGES_URL, body, { headers })
      .pipe(map((response) => this.parseNames(response, requestedCount)));
  }

  private buildPrompt(request: GenerationRequest, count: number): string {
    const category =
      request.category === 'custom' ? request.customCategory || 'business' : request.category;
    return [
      `Invent ${count} short, brandable, made-up-sounding business names.`,
      `Keywords/theme: ${request.keywords.join(', ')}.`,
      `Category: ${category}. Style: ${request.style}.`,
      'Rules: each name is a single capitalized word of 3-16 letters (letters/digits only, no spaces or punctuation), not a generic dictionary word, easy to pronounce.',
      `Respond with ONLY a JSON array of ${count} unique strings. No markdown, no code fences, no commentary.`,
    ].join('\n');
  }

  private parseNames(response: AnthropicMessagesResponse, count: number): string[] {
    const text = response.content.find((block) => block.type === 'text')?.text ?? '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not find a JSON array in the AI response.');
    }

    const parsed: unknown = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) {
      throw new Error('AI response was not a list of names.');
    }

    const names = new Set<string>();
    for (const candidate of parsed) {
      if (typeof candidate === 'string' && VALID_NAME_PATTERN.test(candidate)) {
        names.add(candidate);
      }
    }
    return [...names].slice(0, count);
  }
}
