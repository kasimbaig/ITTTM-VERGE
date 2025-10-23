import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RowCounterComponent } from '../shared/components/row-counter/row-counter.component';

@Component({
  selector: 'app-row-counter-demo',
  standalone: true,
  imports: [CommonModule, RowCounterComponent],
  template: `
    <div class="max-w-4xl mx-auto p-6 space-y-8">
      <h1 class="text-3xl font-bold text-gray-900 text-center">Row Counter Component Demo</h1>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Basic Usage</h2>
        <app-row-counter
          [currentRows]="basicRows"
          [minRows]="1"
          [maxRows]="10"
          (rowCountChange)="onBasicRowsChange($event)">
        </app-row-counter>
        <p class="mt-2 text-sm text-gray-600">Current rows: {{ basicRows }}</p>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Compact Mode</h2>
        <app-row-counter
          [currentRows]="compactRows"
          [minRows]="1"
          [maxRows]="15"
          [compact]="true"
          (rowCountChange)="onCompactRowsChange($event)">
        </app-row-counter>
        <p class="mt-2 text-sm text-gray-600">Current rows: {{ compactRows }}</p>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Custom Label</h2>
        <app-row-counter
          [currentRows]="customRows"
          [minRows]="2"
          [maxRows]="25"
          [label]="'Custom Row Counter'"
          (rowCountChange)="onCustomRowsChange($event)">
        </app-row-counter>
        <p class="mt-2 text-sm text-gray-600">Current rows: {{ customRows }}</p>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Without Label</h2>
        <div class="flex items-center gap-4">
          <span class="text-sm font-medium text-gray-700">My Custom Section:</span>
          <app-row-counter
            [currentRows]="noLabelRows"
            [minRows]="1"
            [maxRows]="8"
            [showLabel]="false"
            (rowCountChange)="onNoLabelRowsChange($event)">
          </app-row-counter>
        </div>
        <p class="mt-2 text-sm text-gray-600">Current rows: {{ noLabelRows }}</p>
      </div>
    </div>
  `,
  styles: [`
    .space-y-8 > * + * {
      margin-top: 2rem;
    }
    .space-y-4 > * + * {
      margin-top: 1rem;
    }
  `]
})
export class RowCounterDemoComponent {
  basicRows = 3;
  compactRows = 5;
  customRows = 7;
  noLabelRows = 2;

  onBasicRowsChange(count: number) {
    this.basicRows = count;
     }

  onCompactRowsChange(count: number) {
    this.compactRows = count;
    }

  onCustomRowsChange(count: number) {
    this.customRows = count;
    }

  onNoLabelRowsChange(count: number) {
    this.noLabelRows = count;
   }
}
