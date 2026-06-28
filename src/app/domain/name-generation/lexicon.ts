import type { BrandStyle } from '../models';

export const GENERIC_PREFIXES: string[] = [
  'get',
  'go',
  'my',
  'the',
  'we',
  'up',
  'pro',
  'meta',
  'nova',
  'neo',
  'zen',
];

export const GENERIC_SUFFIXES: string[] = [
  'ly',
  'ify',
  'io',
  'hub',
  'base',
  'lab',
  'labs',
  'works',
  'wise',
  'verse',
  'loop',
  'spot',
  'nest',
  'forge',
];

/** Per-style suffix pools layered on top of the generic suffixes for flavor. */
export const STYLE_SUFFIXES: Partial<Record<BrandStyle, string[]>> = {
  tech: ['io', 'ify', 'bit', 'sync', 'stack', 'node'],
  premium: ['ora', 'iva', 'exa', 'luxe'],
  luxury: ['luxe', 'noir', 'royale', 'ora'],
  playful: ['oo', 'zy', 'bop', 'doodle', 'wiggle'],
  minimal: ['ly', 'a', 'o'],
  educational: ['academy', 'school', 'minds', 'wise'],
  creative: ['studio', 'craft', 'spark', 'muse'],
  professional: ['group', 'partners', 'works', 'co'],
};

export const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);
