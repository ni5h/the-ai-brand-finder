import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ExportService } from '../../domain/export/export.service';
import type { BrandSuggestion } from '../../domain/models';
import { ScoreBadge } from '../../shared/ui/score-badge/score-badge';
import { GenerationStore } from '../../state/generation.store';

type SortKey = 'score' | 'name' | 'length';

@Component({
  selector: 'app-results-page',
  imports: [FormsModule, RouterLink, ScoreBadge],
  templateUrl: './results-page.html',
})
export class ResultsPage {
  protected readonly generationStore = inject(GenerationStore);
  protected readonly exportService = inject(ExportService);

  protected readonly loading = this.generationStore.loading;
  protected readonly error = this.generationStore.error;
  protected readonly lastRequest = this.generationStore.lastRequest;

  protected readonly search = signal('');
  protected readonly favouritesOnly = signal(false);
  protected readonly sortKey = signal<SortKey>('score');
  protected readonly sortDescending = signal(true);

  protected readonly suggestions = computed(() => {
    const term = this.search().trim().toLowerCase();
    const favouritesOnly = this.favouritesOnly();
    const key = this.sortKey();
    const descending = this.sortDescending();

    const filtered = this.generationStore
      .suggestions()
      .filter((suggestion) => !term || suggestion.name.toLowerCase().includes(term))
      .filter((suggestion) => !favouritesOnly || suggestion.favourite);

    const sorted = [...filtered].sort((a, b) => {
      const comparison = this.compareBy(key, a, b);
      return descending ? -comparison : comparison;
    });

    return sorted;
  });

  protected setSort(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDescending.set(!this.sortDescending());
    } else {
      this.sortKey.set(key);
      this.sortDescending.set(true);
    }
  }

  protected toggleFavourite(suggestion: BrandSuggestion): void {
    this.generationStore.toggleFavourite(suggestion);
  }

  protected exportCsv(): void {
    this.exportService.downloadCsv(this.suggestions());
  }

  protected exportJson(): void {
    this.exportService.downloadJson(this.suggestions());
  }

  protected copyToClipboard(): void {
    void this.exportService.copyNamesToClipboard(this.suggestions());
  }

  protected print(): void {
    window.print();
  }

  private compareBy(key: SortKey, a: BrandSuggestion, b: BrandSuggestion): number {
    switch (key) {
      case 'score':
        return a.score.overall - b.score.overall;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'length':
        return a.length - b.length;
    }
  }
}
