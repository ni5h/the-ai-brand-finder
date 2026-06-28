import { Injectable } from '@angular/core';
import type { BrandSuggestion } from '../models';

const CSV_HEADERS = ['Name', 'Overall Score', 'Category', 'Style', 'Length', 'Domains', 'Favourite'];

@Injectable({ providedIn: 'root' })
export class ExportService {
  toCsv(suggestions: BrandSuggestion[]): string {
    const rows = suggestions.map((suggestion) => [
      suggestion.name,
      String(suggestion.score.overall),
      suggestion.category,
      suggestion.style,
      String(suggestion.length),
      suggestion.domains.map((domain) => `${domain.domain}:${domain.status}`).join('; '),
      suggestion.favourite ? 'Yes' : 'No',
    ]);
    return [CSV_HEADERS, ...rows].map((row) => row.map((cell) => this.escapeCsvCell(cell)).join(',')).join('\n');
  }

  toJson(suggestions: BrandSuggestion[]): string {
    return JSON.stringify(suggestions, null, 2);
  }

  downloadCsv(suggestions: BrandSuggestion[], filename = 'brand-suggestions.csv'): void {
    this.download(this.toCsv(suggestions), filename, 'text/csv');
  }

  downloadJson(suggestions: BrandSuggestion[], filename = 'brand-suggestions.json'): void {
    this.download(this.toJson(suggestions), filename, 'application/json');
  }

  copyNamesToClipboard(suggestions: BrandSuggestion[]): Promise<void> {
    return navigator.clipboard.writeText(suggestions.map((suggestion) => suggestion.name).join('\n'));
  }

  private download(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  private escapeCsvCell(value: string): string {
    return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  }
}
