const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

export function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
}

export function capitalize(word: string): string {
  return word.length === 0 ? word : word[0].toUpperCase() + word.slice(1);
}

/** Splits a lowercase word into rough syllable-like chunks on vowel boundaries. */
export function splitIntoChunks(word: string): string[] {
  const chunks: string[] = [];
  let current = '';
  for (let i = 0; i < word.length; i++) {
    current += word[i];
    const isVowel = VOWELS.has(word[i]);
    const nextIsConsonant = i + 1 < word.length && !VOWELS.has(word[i + 1]);
    if (isVowel && nextIsConsonant && current.length >= 2) {
      chunks.push(current);
      current = '';
    }
  }
  if (current) {
    chunks.push(current);
  }
  return chunks.length > 0 ? chunks : [word];
}

export function longestConsonantRun(word: string): number {
  let longest = 0;
  let run = 0;
  for (const char of word) {
    if (VOWELS.has(char)) {
      run = 0;
    } else {
      run++;
      longest = Math.max(longest, run);
    }
  }
  return longest;
}

export function longestRepeatedCharRun(word: string): number {
  let longest = 1;
  let run = 1;
  for (let i = 1; i < word.length; i++) {
    run = word[i] === word[i - 1] ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  return word.length === 0 ? 0 : longest;
}

export function vowelRatio(word: string): number {
  if (word.length === 0) {
    return 0;
  }
  const vowelCount = [...word].filter((char) => VOWELS.has(char)).length;
  return vowelCount / word.length;
}

/** Letter sequences that are easy to misread (visual confusion). */
const CONFUSING_PATTERNS = [/[il1]{2,}/, /vv/, /uu/, /[wm]{2,}/];

export function isVisuallyConfusing(word: string): boolean {
  return CONFUSING_PATTERNS.some((pattern) => pattern.test(word));
}

export function isPronounceable(word: string, maxConsonantRun = 3): boolean {
  return longestConsonantRun(word) <= maxConsonantRun && vowelRatio(word) >= 0.2;
}
