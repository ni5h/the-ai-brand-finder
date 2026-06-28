import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { DohDomainProvider } from './domain/domain-availability/providers/doh-domain-provider';
import { DOMAIN_PROVIDER } from './domain/domain-availability/domain-availability.tokens';
import { CompositeNameGenerator } from './domain/name-generation/engines/composite-name-generator';
import { NAME_GENERATOR } from './domain/name-generation/name-generation.tokens';
import { DefaultBrandScorer } from './domain/scoring/engines/default-brand-scorer';
import { BRAND_SCORER } from './domain/scoring/scoring.tokens';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    { provide: NAME_GENERATOR, useClass: CompositeNameGenerator },
    { provide: BRAND_SCORER, useClass: DefaultBrandScorer },
    { provide: DOMAIN_PROVIDER, useClass: DohDomainProvider },
  ],
};
