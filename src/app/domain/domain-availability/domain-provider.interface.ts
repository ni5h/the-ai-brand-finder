import type { Observable } from 'rxjs';
import type { DomainResult } from '../models';

export interface DomainProvider {
  search(domain: string): Observable<DomainResult>;
}
