import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  BRAND_CATEGORIES,
  BRAND_STYLES,
  BUDGET_TIERS,
  DOMAIN_EXTENSIONS,
  SUGGESTION_COUNTS,
} from '../../core/config/app-options';
import type { AnnualBudget, DomainExtension, GenerationRequest } from '../../domain/models';
import { TagInput } from '../../shared/ui/tag-input/tag-input';
import { GenerationStore } from '../../state/generation.store';

@Component({
  selector: 'app-generator-page',
  imports: [ReactiveFormsModule, TagInput],
  templateUrl: './generator-page.html',
})
export class GeneratorPage {
  private readonly fb = inject(FormBuilder);
  private readonly generationStore = inject(GenerationStore);
  private readonly router = inject(Router);

  protected readonly categories = BRAND_CATEGORIES;
  protected readonly styles = BRAND_STYLES;
  protected readonly extensions = DOMAIN_EXTENSIONS;
  protected readonly budgetTiers = BUDGET_TIERS;
  protected readonly suggestionCounts = SUGGESTION_COUNTS;

  protected readonly loading = this.generationStore.loading;
  protected readonly error = this.generationStore.error;
  protected readonly submitted = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    keywords: this.fb.nonNullable.control<string[]>([], Validators.required),
    category: this.fb.nonNullable.control(this.categories[0].value),
    customCategory: this.fb.nonNullable.control(''),
    style: this.fb.nonNullable.control(this.styles.at(-1)!.value),
    domainExtensions: this.fb.nonNullable.control<DomainExtension[]>(['.com'], Validators.required),
    budgetIndex: this.fb.nonNullable.control(this.budgetTiers.length - 1),
    suggestionCount: this.fb.nonNullable.control(this.suggestionCounts[0]),
  });

  protected readonly isCustomCategory = computed(() => this.form.controls.category.value === 'custom');

  protected readonly selectedBudgetLabel = computed(() => {
    const index = this.form.controls.budgetIndex.value;
    return this.budgetTiers[index]?.label ?? '';
  });

  protected toggleExtension(extension: DomainExtension): void {
    const current = this.form.controls.domainExtensions.value;
    const next = current.includes(extension)
      ? current.filter((value) => value !== extension)
      : [...current, extension];
    this.form.controls.domainExtensions.setValue(next);
  }

  protected isExtensionSelected(extension: DomainExtension): boolean {
    return this.form.controls.domainExtensions.value.includes(extension);
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.form.controls.keywords.value.length === 0) {
      return;
    }

    const { keywords, category, customCategory, style, domainExtensions, budgetIndex, suggestionCount } =
      this.form.getRawValue();

    const request: GenerationRequest = {
      keywords,
      category,
      customCategory: category === 'custom' ? customCategory : undefined,
      style,
      domainExtensions,
      maxAnnualBudget: this.budgetTiers[budgetIndex].value as AnnualBudget,
      suggestionCount,
    };

    this.generationStore.generate(request);
    this.router.navigateByUrl('/results');
  }
}
