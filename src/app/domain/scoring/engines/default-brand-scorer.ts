import type { BrandScore, GenerationRequest } from '../../models';
import {
  longestConsonantRun,
  longestRepeatedCharRun,
  normalizeWord,
  splitIntoChunks,
  vowelRatio,
  isVisuallyConfusing,
} from '../../shared/text-analysis';
import type { BrandScorer } from '../brand-scorer.interface';

const PLAYFUL_SUFFIXES = ['oo', 'zy', 'bop', 'doodle', 'wiggle'];
const PROFESSIONAL_STYLES = new Set(['professional', 'premium', 'luxury', 'tech', 'minimal']);
const PLAYFUL_STYLES = new Set(['playful', 'creative']);

const OVERALL_WEIGHTS = {
  length: 0.15,
  pronunciation: 0.2,
  memorability: 0.2,
  visualAppeal: 0.15,
  uniqueness: 0.15,
  professionalFeel: 0.15,
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

/** V1 scoring engine: deterministic heuristics over letter/syllable patterns. */
export class DefaultBrandScorer implements BrandScorer {
  score(name: string, request: GenerationRequest): BrandScore {
    const word = normalizeWord(name);

    const length = this.scoreLength(word);
    const pronunciation = this.scorePronunciation(word);
    const memorability = this.scoreMemorability(word);
    const visualAppeal = this.scoreVisualAppeal(word);
    const uniqueness = this.scoreUniqueness(word, request);
    const professionalFeel = this.scoreProfessionalFeel(word, request);
    const kidFriendliness = this.scoreKidFriendliness(word, pronunciation, memorability);

    const overall =
      length * OVERALL_WEIGHTS.length +
      pronunciation * OVERALL_WEIGHTS.pronunciation +
      memorability * OVERALL_WEIGHTS.memorability +
      visualAppeal * OVERALL_WEIGHTS.visualAppeal +
      uniqueness * OVERALL_WEIGHTS.uniqueness +
      professionalFeel * OVERALL_WEIGHTS.professionalFeel;

    return {
      length,
      pronunciation,
      memorability,
      visualAppeal,
      uniqueness,
      professionalFeel,
      kidFriendliness,
      overall: Math.round(overall),
    };
  }

  private scoreLength(word: string): number {
    const idealLength = 7;
    return Math.round(clamp(100 - Math.abs(word.length - idealLength) * 8));
  }

  private scorePronunciation(word: string): number {
    const vowelScore = 100 - Math.abs(vowelRatio(word) - 0.4) * 150;
    const consonantRun = longestConsonantRun(word);
    const consonantPenalty = consonantRun > 2 ? (consonantRun - 2) * 20 : 0;
    return Math.round(clamp(vowelScore - consonantPenalty));
  }

  private scoreMemorability(word: string): number {
    const chunkCount = splitIntoChunks(word).length;
    let score = 100;
    if (word.length > 10) {
      score -= (word.length - 10) * 5;
    }
    if (chunkCount > 3) {
      score -= (chunkCount - 3) * 10;
    }
    const repeatRun = longestRepeatedCharRun(word);
    if (repeatRun > 2) {
      score -= (repeatRun - 2) * 15;
    }
    return Math.round(clamp(score));
  }

  private scoreVisualAppeal(word: string): number {
    let score = 100;
    if (isVisuallyConfusing(word)) {
      score -= 30;
    }
    const variety = word.length > 0 ? new Set(word).size / word.length : 0;
    score += (variety - 0.6) * 40;
    return Math.round(clamp(score));
  }

  private scoreUniqueness(word: string, request: GenerationRequest): number {
    const keywords = request.keywords.map(normalizeWord);
    if (keywords.includes(word)) {
      return 40;
    }
    if (keywords.some((keyword) => keyword.length > 2 && word.includes(keyword))) {
      return 70;
    }
    return 90;
  }

  private scoreProfessionalFeel(word: string, request: GenerationRequest): number {
    let score = PROFESSIONAL_STYLES.has(request.style) ? 75 : 60;
    if (PLAYFUL_STYLES.has(request.style)) {
      score -= 10;
    }
    if (PLAYFUL_SUFFIXES.some((suffix) => word.endsWith(suffix))) {
      score -= 15;
    }
    return Math.round(clamp(score));
  }

  private scoreKidFriendliness(word: string, pronunciation: number, memorability: number): number {
    const shortBonus = word.length <= 8 ? 10 : 0;
    return Math.round(clamp((pronunciation + memorability) / 2 + shortBonus));
  }
}
