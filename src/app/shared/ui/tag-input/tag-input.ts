import { Component, input, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

/** Reactive-forms compatible chip input for an unbounded list of keywords. */
@Component({
  selector: 'app-tag-input',
  template: `
    <div
      class="flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
    >
      @for (tag of tags(); track tag) {
        <span
          class="flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
        >
          {{ tag }}
          <button
            type="button"
            (click)="remove(tag)"
            class="text-indigo-500 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-white"
            [attr.aria-label]="'Remove ' + tag"
          >
            ×
          </button>
        </span>
      }
      <input
        type="text"
        [placeholder]="tags().length === 0 ? placeholder() : ''"
        [(ngModel)]="draft"
        (keydown)="handleKeydown($event)"
        (blur)="addFromDraft()"
        class="min-w-32 flex-1 border-none bg-transparent py-1 text-sm outline-none placeholder:text-slate-400"
      />
    </div>
  `,
  imports: [FormsModule],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: TagInput, multi: true }],
})
export class TagInput implements ControlValueAccessor {
  readonly placeholder = input('Add a keyword and press Enter');

  protected readonly tags = signal<string[]>([]);
  protected draft = '';

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string[] | null): void {
    this.tags.set(value ?? []);
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addFromDraft();
    } else if (event.key === 'Backspace' && this.draft === '' && this.tags().length > 0) {
      this.tags.update((tags) => tags.slice(0, -1));
      this.emit();
    }
  }

  protected addFromDraft(): void {
    const value = this.draft.trim();
    if (value && !this.tags().includes(value)) {
      this.tags.update((tags) => [...tags, value]);
      this.emit();
    }
    this.draft = '';
  }

  protected remove(tag: string): void {
    this.tags.update((tags) => tags.filter((existing) => existing !== tag));
    this.emit();
  }

  private emit(): void {
    this.onChange(this.tags());
    this.onTouched();
  }
}
