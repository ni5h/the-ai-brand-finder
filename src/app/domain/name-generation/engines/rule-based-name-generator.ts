import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';
import type { GenerationRequest } from '../../models';
import {
  capitalize,
  isPronounceable,
  isVisuallyConfusing,
  longestRepeatedCharRun,
  normalizeWord,
  splitIntoChunks,
} from '../../shared/text-analysis';
import type { NameGenerator } from '../name-generator.interface';
import { GENERIC_PREFIXES, GENERIC_SUFFIXES, STYLE_SUFFIXES } from '../lexicon';

const MIN_LENGTH = 3;
const MAX_LENGTH = 16;
const MAX_REPEATED_CHAR_RUN = 2;

/**
 * V1 generation engine: combines keyword fragments with prefixes, suffixes
 * and portmanteau blending. No external calls, no AI — pure string rules.
 * Future engines (e.g. LLM-backed) implement the same NameGenerator
 * interface and are swapped in via the NAME_GENERATOR injection token.
 */
@Injectable({ providedIn: 'root' })
export class RuleBasedNameGenerator implements NameGenerator {
  generate(request: GenerationRequest, count: number): Observable<string[]> {
    const keywords = request.keywords.map(normalizeWord).filter((word) => word.length > 0);
    if (keywords.length === 0) {
      return of([]);
    }

    const suffixPool = [...GENERIC_SUFFIXES, ...(STYLE_SUFFIXES[request.style] ?? [])];
    const candidates = new Set<string>();

    for (const candidate of this.buildCandidates(keywords, request, suffixPool)) {
      if (this.isAcceptable(candidate)) {
        candidates.add(candidate);
      }
      if (candidates.size >= count) {
        break;
      }
    }

    return of([...candidates].slice(0, count).map(capitalize));
  }

  private *buildCandidates(
    keywords: string[],
    request: GenerationRequest,
    suffixPool: string[],
  ): Generator<string> {
    if (request.style === 'acronym') {
      yield* this.acronymCandidates(keywords);
      return;
    }

    if (request.style === 'two-word') {
      yield* this.twoWordCandidates(keywords);
      return;
    }

    yield* this.keywordPlusSuffixCandidates(keywords, suffixPool);
    yield* this.prefixPlusKeywordCandidates(keywords);
    yield* this.blendCandidates(keywords);
    yield* this.syllableRecombinationCandidates(keywords, suffixPool);
  }

  private *keywordPlusSuffixCandidates(
    keywords: string[],
    suffixPool: string[],
  ): Generator<string> {
    for (const keyword of keywords) {
      for (const suffix of suffixPool) {
        yield this.joinTrimmingOverlap(keyword, suffix);
      }
    }
  }

  private *prefixPlusKeywordCandidates(keywords: string[]): Generator<string> {
    for (const keyword of keywords) {
      for (const prefix of GENERIC_PREFIXES) {
        yield prefix + keyword;
      }
    }
  }

  /** Portmanteau blend: front half of one keyword + back half of another. */
  private *blendCandidates(keywords: string[]): Generator<string> {
    for (const first of keywords) {
      for (const second of keywords) {
        if (first === second) {
          continue;
        }
        const firstChunks = splitIntoChunks(first);
        const secondChunks = splitIntoChunks(second);
        const head = firstChunks.slice(0, Math.ceil(firstChunks.length / 2)).join('');
        const tail = secondChunks.slice(Math.floor(secondChunks.length / 2)).join('');
        if (head && tail) {
          yield head + tail;
        }
      }
    }
  }

  private *syllableRecombinationCandidates(
    keywords: string[],
    suffixPool: string[],
  ): Generator<string> {
    const allChunks = keywords.flatMap(splitIntoChunks).filter((chunk) => chunk.length >= 2);
    for (const chunk of allChunks) {
      for (const suffix of suffixPool) {
        yield this.joinTrimmingOverlap(chunk, suffix);
      }
    }
  }

  private *acronymCandidates(keywords: string[]): Generator<string> {
    if (keywords.length < 2) {
      return;
    }
    const initials = keywords.map((word) => word[0]).join('');
    yield initials;
    for (const suffix of ['ly', 'hq', 'labs', 'co']) {
      yield initials + suffix;
    }
  }

  private *twoWordCandidates(keywords: string[]): Generator<string> {
    for (const first of keywords) {
      for (const second of keywords) {
        if (first !== second) {
          yield capitalize(first) + capitalize(second);
        }
      }
    }
  }

  /** Avoids an awkward doubled letter where the two fragments meet, e.g. "thinkk". */
  private joinTrimmingOverlap(left: string, right: string): string {
    if (left.length > 0 && right.length > 0 && left[left.length - 1] === right[0]) {
      return left + right.slice(1);
    }
    return left + right;
  }

  private isAcceptable(word: string): boolean {
    return (
      word.length >= MIN_LENGTH &&
      word.length <= MAX_LENGTH &&
      longestRepeatedCharRun(word) <= MAX_REPEATED_CHAR_RUN &&
      isPronounceable(word) &&
      !isVisuallyConfusing(word)
    );
  }
}
