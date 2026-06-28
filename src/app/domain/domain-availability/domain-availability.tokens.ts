import { InjectionToken } from '@angular/core';
import type { DomainProvider } from './domain-provider.interface';

export const DOMAIN_PROVIDER = new InjectionToken<DomainProvider>('DOMAIN_PROVIDER');
