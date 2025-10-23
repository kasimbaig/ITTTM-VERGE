import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-row-counter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './row-counter.component.html',
  styleUrl: './row-counter.component.css'
})
export class RowCounterComponent implements OnChanges {
  @Input() label: string = 'Enter Total Number of Rows';
  @Input() minRows: number = 1;
  @Input() maxRows: number = 20;
  @Input() currentRows: number = 1;
  @Input() showLabel: boolean = true;
  @Input() compact: boolean = false;
  
  @Output() rowCountChange = new EventEmitter<number>();

  ngOnChanges(changes: SimpleChanges) {
    // Update currentRows when input changes
    if (changes['currentRows'] && changes['currentRows'].currentValue) {
      this.currentRows = changes['currentRows'].currentValue;
    }
  }

  onRowCountChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    
    // Handle empty input
    if (value === '' || value === null || value === undefined) {
      this.currentRows = this.minRows;
      this.rowCountChange.emit(this.minRows);
      return;
    }
    
    const count = parseInt(value) || this.minRows;
    
    // Ensure count is within bounds
    const clampedCount = Math.max(this.minRows, Math.min(this.maxRows, count));
    
    // Update the input value if it was clamped
    if (clampedCount !== count) {
      target.value = clampedCount.toString();
    }
    
    // Update currentRows and emit the change immediately
    this.currentRows = clampedCount;
    this.rowCountChange.emit(clampedCount);
  }
}
