import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiSettingsStore } from '../../../state/ai-settings.store';

@Component({
  selector: 'app-ai-settings-panel',
  imports: [FormsModule],
  templateUrl: './ai-settings-panel.html',
})
export class AiSettingsPanel {
  private readonly aiSettings = inject(AiSettingsStore);

  protected readonly enabled = computed(() => this.aiSettings.settings().enabled);
  protected readonly apiKey = computed(() => this.aiSettings.settings().apiKey);

  protected toggle(): void {
    this.aiSettings.setEnabled(!this.enabled());
  }

  protected onApiKeyChange(value: string): void {
    this.aiSettings.setApiKey(value);
  }
}
