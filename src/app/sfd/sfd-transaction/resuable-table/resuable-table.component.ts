import { Component, Input, Output, EventEmitter, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CheckboxModule } from 'primeng/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-resuable-table',
  standalone: true,
  imports:[CommonModule,
     CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    CalendarModule,
    ToastModule,
    MatMenuModule,
    MatButtonModule,
    CheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    ToastModule,
    ],
  templateUrl: './resuable-table.component.html',
  styleUrls: ['./resuable-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class 
ResuableTableComponent {
  @Input() gridColumns: any[] = [];
  @Input() filteredData: any[] = [];
  @Input() isPaginator: boolean = true;
  @Input() isShearchDisable: string = 'T';
  @Input() isCheckBox:boolean =false;
  @Input() isAction: boolean = false;
  @Input() isView: boolean = false;
  @Input() isEditable: boolean = false;
  @Input() isDeletable: boolean = false;
  @Input() isAdd: boolean = false;
  @Input() Approve: string = '';
  @Input() Reject: string = '';
  @Input() editButtonname: string = 'Edit';
  @Input() uploadDataName: string = '';
  @Input() generateReportName: string = '';
  
  // Server-side pagination properties
  @Input() totalRecords: number = 0;
  @Input() rowsPerPage: number = 10;
  @Input() rowsPerPageOptions: number[] = [5, 10, 20, 50, 100];
  @Input() showFirstLastIcon: boolean = true;
  @Input() showPageLinks: boolean = true;
  @Input() showCurrentPageReport: boolean = true;
  @Input() showJumpToPageDropdown: boolean = true;
  @Input() lazy: boolean = false; // Enable lazy loading for server-side pagination
  
  @Output() clearEvent = new EventEmitter<void>();
  @Output() filterEvent = new EventEmitter<any>();
  @Output() viewEvent = new EventEmitter<any>();
  @Output() editEvent = new EventEmitter<any>();
  @Output() deleteEvent = new EventEmitter<any>();
  @Output() addEvent = new EventEmitter<any>(); 
  @Output() approveEvent = new EventEmitter<any>();
  @Output() rejectEvent = new EventEmitter<any>();
  @Output() selectionEvent = new EventEmitter<any>();
  
  // Pagination events for server-side pagination
  @Output() pageChangeEvent = new EventEmitter<any>();
  @Output() rowsPerPageChangeEvent = new EventEmitter<any>();
  
  searchValue: string = '';
  selectedItems: any[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cdr.detectChanges();
  }

  ngOnChanges(): void {
    // Ensure OnPush table updates when inputs change (e.g., API results arrive)
    this.cdr.markForCheck();
  }

  // Pagination event handlers
  onPageChange(event: any): void {
    //console.log('Page changed:', event);
    this.pageChangeEvent.emit(event);
  }

  onRowsPerPageChange(event: any): void {
    //console.log('Rows per page changed:', event);
    this.rowsPerPageChangeEvent.emit(event);
  }

  onTableFilter(event: any): void {
    // Handle table filter event
  }

  clear(dataTable: any): void {
    if (dataTable) {
      dataTable.clear();
    }
    this.searchValue = '';
  }

  onSearchInput(value: string): string {
    const val=value.trim()
    return val || '';
  }

  emitSearchEvent(value: string): void {
    // Emit search event with the value
  }

  resolveNestedField(obj: any, field: string): any {
    if (!obj || !field) return '';
    
    const keys = field.split('.');
    let value = obj;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return '';
      }
    }
    
    return value || '';
  }

  isHtml(value: any): boolean {
    if (typeof value !== 'string') return false;
    return value.includes('<') && value.includes('>');
  }

  getStatusClass(status: number): string {
    const statusMap: { [key: string]: string } = {
      1: 'bg-green-100 text-green-800',
      0: 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-blue-600 -100 text-blue-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'draft': 'bg-gray-100 text-gray-800',
      'submitted': 'bg-blue-600 -100 text-blue-800',
      'forwarded': 'bg-purple-100 text-purple-800',
      'received': 'bg-indigo-100 text-indigo-800'
    };
    
    return statusMap[status?.toString()] || 'bg-gray-100 text-gray-800';
  }

  getStatusStyle(status: number): any {
    const statusMap: { [key: string]: any } = {
      1: { 'background-color': '#dcfce7', 'color': '#166534' },
      0: { 'background-color': '#fee2e2', 'color': '#991b1b' },
      'pending': { 'background-color': '#fef3c7', 'color': '#92400e' },
      'completed': { 'background-color': '#dbeafe', 'color': '#1e40af' },
      'approved': { 'background-color': '#dcfce7', 'color': '#166534' },
      'rejected': { 'background-color': '#fee2e2', 'color': '#991b1b' },
      'draft': { 'background-color': '#f3f4f6', 'color': '#374151' },
      'submitted': { 'background-color': '#dbeafe', 'color': '#1e40af' },
      'forwarded': { 'background-color': '#f3e8ff', 'color': '#7c3aed' },
      'received': { 'background-color': '#e0e7ff', 'color': '#4338ca' }
    };
    
    return statusMap[status?.toString()] || { 'background-color': '#f3f4f6', 'color': '#374151' };
  }

  getStatusName(status: number): string {
    if (!status) return 'Unknown';
    
    const statusMap: { [key: string]: string } = {
      1: 'Active',
      0: 'Inactive',
      'pending': 'Pending',
      'completed': 'Completed',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'draft': 'Draft',
      'submitted': 'Submitted',
      'forwarded': 'Forwarded',
      'received': 'Received'
    };
    
    return statusMap[status.toString()] || status.toString();
  }

  getButtonClass(type: number): string {
    const buttonClasses: { [key: number]: string } = {
      7: 'text-blue-600 hover:text-blue-800', // View
      8: 'text-green-600 hover:text-green-800', // Edit
      11: 'text-red-600 hover:text-red-800' // Delete
    };
    
    return buttonClasses[type] || 'text-gray-600 hover:text-gray-800';
  }

  displayUploadDialog: boolean = false;
  displayReportDialog: boolean = false;
  showConfirmDialog: boolean = false;
  confirmMessage: any;

  showConfirmationDialog(message: any): void {
    this.showConfirmDialog = true;
    this.confirmMessage = message;
   
  }

  isDisabled(rowData:any):boolean{
   const user_permissions=rowData.user_permissions
   const user_role=localStorage.getItem('user_role')
   if(user_permissions.can_initiate && user_role =='INIT'){
    return false;
   }else if(user_permissions.can_recommend && user_role =='REC'){
    return false;
   }else if(user_permissions.can_approve && user_role =='APP'){
    return false;
   }
   return true;

  }
}
