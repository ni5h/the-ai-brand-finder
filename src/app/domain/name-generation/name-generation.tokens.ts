import { InjectionToken } from '@angular/core';
import type { NameGenerator } from './name-generator.interface';

export const NAME_GENERATOR = new InjectionToken<NameGenerator>('NAME_GENERATOR');
