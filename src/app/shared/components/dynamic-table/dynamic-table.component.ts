import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormArray, FormGroup } from '@angular/forms';
import { RowCounterComponent } from '../row-counter/row-counter.component';

export interface TableColumn {
  key: string;
  label: string;
  required?: boolean;
  type?: 'text' | 'number' | 'email' | 'date' | 'select' | 'file';
  placeholder?: string;
  colSpan?: number;
  options?: { value: string; label: string }[];
}

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RowCounterComponent],
  templateUrl: './dynamic-table.component.html',
  styleUrl: './dynamic-table.component.css'
})
export class DynamicTableComponent implements OnChanges {
  @Input() title: string = '';
  @Input() columns: TableColumn[] = [];
  @Input() formArray: FormArray<any> = new FormArray<any>([]);
  @Input() minRows: number = 1;
  @Input() maxRows: number = 20;
  @Input() showRowCounter: boolean = true;
  @Input() showLabel: boolean = true;
  @Input() createRowFunction: () => FormGroup = () => new FormGroup({});
  
  @Output() rowCountChange = new EventEmitter<number>();
  @Output() formArrayChange = new EventEmitter<FormArray>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formArray'] && this.formArray) {
      this.ensureMinimumRows();
    }
  }

  private ensureMinimumRows() {
    while (this.formArray.length < this.minRows) {
      this.addRow();
    }
  }

  onRowCountChange(count: number) {
    const currentLength = this.formArray.length;
    
    if (count > currentLength) {
      // Add all rows at once for better performance
      const rowsToAdd = count - currentLength;
      for (let i = 0; i < rowsToAdd; i++) {
        this.addRow();
      }
    } else if (count < currentLength && count > 0) {
      // Remove rows from the end
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.formArray.removeAt(this.formArray.length - 1);
      }
    }
    
    this.rowCountChange.emit(count);
    this.formArrayChange.emit(this.formArray);
  }

  private addRow() {
    const newRow = this.createRowFunction();
    this.formArray.push(newRow);
  }

  getColumnClass(column: TableColumn, index: number): string {
    if (column.colSpan) {
      return `col-span-${column.colSpan}`;
    }
    
    // Default column spans based on number of columns
    const totalColumns = this.columns.length;
    if (totalColumns === 4) {
      // For 4 columns (like inspectors table)
      if (index === 0) return 'col-span-1'; // Sr No.
      if (index === 1) return 'col-span-4'; // Name
      if (index === 2) return 'col-span-3'; // Rank
      if (index === 3) return 'col-span-4'; // Designation
    } else if (totalColumns === 3) {
      // For 3 columns (like observation tables)
      if (index === 0) return 'col-span-1'; // Sr No.
      if (index === 1) return 'col-span-6'; // Observation
      if (index === 2) return 'col-span-5'; // Remarks
    } else if (totalColumns === 6) {
      // For 6 columns (like hull survey table)
      if (index === 0) return 'col-span-1'; // Sr No.
      if (index === 1) return 'col-span-2'; // Location
      if (index === 2) return 'col-span-1'; // From
      if (index === 3) return 'col-span-1'; // To
      if (index === 4) return 'col-span-3'; // Observation
      if (index === 5) return 'col-span-2'; // Remarks
    } else if (totalColumns === 7) {
      // For 7 columns (like file upload table)
      if (index === 0) return 'col-span-1'; // Sr No.
      if (index === 1) return 'col-span-3'; // File Upload
      if (index === 2) return 'col-span-2'; // Signature
      if (index === 3) return 'col-span-2'; // Name
      if (index === 4) return 'col-span-2'; // Rank
      if (index === 5) return 'col-span-2'; // Designation
    }
    
    return 'col-span-4'; // Default
  }

  getSignatureLabel(rowIndex: number): string {
    const signatures = [
      'Signature of Ship Staff*',
      'Signature of refitting Authority*',
      'Signature of HITU Inspector*'
    ];
    return signatures[rowIndex] || `Signature ${rowIndex + 1}*`;
  }

  hasFrameStationHeader(): boolean {
    // Check if this is a hull survey table (has 'from' and 'to' columns)
    return this.columns.some(col => col.key === 'from') && this.columns.some(col => col.key === 'to');
  }
}
