import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  ViewChild,
  AfterViewInit,
  ElementRef,
  TemplateRef,
  ContentChild,
} from '@angular/core';
import { TableModule, Table } from 'primeng/table';

@Component({
  selector: 'app-table',
  imports: [TableModule, CommonModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements AfterViewInit {
  // @Input() columns: any[] = [];
  // @Input() data: any[] = [];
  @Input() tableName: string = '';
  @Input() showStartActions: boolean = true;
  @Input() customHeaderNameStart: string = '';
  @Input() showEndActions: boolean = true;
  @Input() customHeaderNameEnd: string = '';
  // @ContentChild('actions') actionsTemplate!: TemplateRef<any>;
  @Input() actionsTemplate!: TemplateRef<any>; 
  @Input() columns: any[] = []; // ✅ Ensure columns input exists
  @Input() data: any[] = []; 
  @ViewChild(Table, { static: false }) table!: Table; 
  @ViewChild('filterInput') filterInput!: ElementRef;

  // data = [
  //   { id: 1, name: 'John Doe', department: 'Engineering', status: 'Active' },
  //   { id: 2, name: 'Jane Smith', department: 'HR', status: 'Inactive' },
  //   { id: 3, name: 'Michael Brown', department: 'Finance', status: 'Active' },
  //   { id: 4, name: 'Emily Johnson', department: 'Marketing', status: 'Active' },
  //   { id: 5, name: 'David Wilson', department: 'IT', status: 'Inactive' }
  // ];

  // columns = [
  //   { field: 'id', header: 'ID' },
  //   { field: 'name', header: 'Name' },
  //   { field: 'department', header: 'Department' },
  //   { field: 'status', header: 'Status' }
  // ];

  ngAfterViewInit(): void {
    if (!this.table) {
      console.error(`Table instance "${this.tableName}" is not available.`);
    }
  }

  applyGlobalFilter(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.table.filterGlobal(inputElement.value, 'contains');
  }
  activeFilters: { [key: string]: boolean } = {}; // Track active filters
originalData: any[] = [...this.data]; // Store original data

toggleFilter(column: string) {
  this.activeFilters[column] = !this.activeFilters[column];
}

applyFilter(event: Event, field: string) {
  const inputElement = event.target as HTMLInputElement;
  const value = inputElement.value;

  if (!value) {
    this.data = [...this.originalData]; // Reset if filter is cleared
  } else {
    this.data = this.originalData.filter(item =>
      item[field]?.toString().toLowerCase().includes(value.toLowerCase())
    );
  }
}

}
