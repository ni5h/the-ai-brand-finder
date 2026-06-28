import { Component, computed, input } from '@angular/core';

/** Small visual indicator for a 0-100 score: a colored bar plus the numeric value. */
@Component({
  selector: 'app-score-badge',
  template: `
    <div class="flex items-center gap-2" [attr.title]="label() ?? null">
      <div class="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div class="h-full rounded-full transition-all" [class]="barColor()" [style.width.%]="score()"></div>
      </div>
      <span class="text-sm font-semibold tabular-nums" [class]="textColor()">{{ score() }}</span>
    </div>
  `,
})
export class ScoreBadge {
  readonly score = input.required<number>();
  readonly label = input<string>();

  protected readonly barColor = computed(() => {
    const value = this.score();
    if (value >= 75) return 'bg-emerald-500';
    if (value >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  });

  protected readonly textColor = computed(() => {
    const value = this.score();
    if (value >= 75) return 'text-emerald-600 dark:text-emerald-400';
    if (value >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  });
}
