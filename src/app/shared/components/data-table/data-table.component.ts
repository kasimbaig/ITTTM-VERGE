import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
export interface TableColumn {
  field: string;
  header: string;
  type?: 'text' | 'date' | 'number' | 'boolean'; // For formatting
  format?: string; // e.g., 'shortDate' for dates
}
@Component({
  selector: 'app-data-table',
  imports: [TableModule,FormsModule,ReactiveFormsModule,CommonModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css'
})
export class DataTableComponent {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() paginator: boolean = true;
  @Input() rows: number = 5;
  @Input() showHeader: boolean = true;
  @Input() emptyMessage: string = 'No data available.';

  @Output() rowClick = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

  onRowSelect(event: any): void {
    this.rowClick.emit(event.data);
  }
}

