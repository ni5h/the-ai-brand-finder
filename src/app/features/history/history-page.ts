import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import type { RecentSearchEntry } from '../../state/recent-searches.store';
import { RecentSearchesStore } from '../../state/recent-searches.store';
import { GenerationStore } from '../../state/generation.store';

@Component({
  selector: 'app-history-page',
  imports: [DatePipe, RouterLink],
  templateUrl: './history-page.html',
})
export class HistoryPage {
  private readonly recentSearches = inject(RecentSearchesStore);
  private readonly generationStore = inject(GenerationStore);
  private readonly router = inject(Router);

  protected readonly entries = this.recentSearches.entries;

  protected rerun(entry: RecentSearchEntry): void {
    this.generationStore.generate(entry.request);
    this.router.navigateByUrl('/results');
  }

  protected editAndRerun(entry: RecentSearchEntry): void {
    void this.router.navigate(['/generate'], { state: { editRequest: entry.request } });
  }

  protected clear(): void {
    this.recentSearches.clear();
  }
}
