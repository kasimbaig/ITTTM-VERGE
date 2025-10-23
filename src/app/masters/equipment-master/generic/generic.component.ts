import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog'; // Use DialogModule for p-dialog
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ApiService } from '../../../services/api.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AddFormComponent } from '../../../shared/components/add-form/add-form.component';
import { CommonModule, Location } from '@angular/common';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';
import { ToastService } from '../../../services/toast.service'; // Import ToastService
import { ToastComponent } from '../../../shared/components/toast/toast.component'; // Import ToastComponent
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component'; // Import LoadingSpinnerComponent
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { ViewDetailsComponent } from '../../../shared/components/view-details/view-details.component';

@Component({
  selector: 'app-generic',
  imports: [
    TableModule,
    AddFormComponent,
    CommonModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    PaginatedTableComponent,
    TieredMenuModule,
    ToastComponent, // Add ToastComponent to imports
    DialogModule, // Add DialogModule to imports
    LoadingSpinnerComponent, // Add LoadingSpinnerComponent to imports
    DeleteConfirmationModalComponent,
    ViewDetailsComponent
  ],
  templateUrl: './generic.component.html',
  styleUrl: './generic.component.css',
})
export class GenericComponent implements OnInit {
  searchText: string = '';
  departments: any = [];
  title: string = 'Add new Generic';
  isFormOpen: boolean = false;
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  showDeleteDialog: boolean = false;
  filtredTypes: any[] = [];
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit Gneric';
  isLoading: boolean = false; // New property for loading state

  newDepartment = {
    code: '',
    type: null,
    sr_no: null,
    active: 1, // Add the active field with a default value
  };
  selectedDept: any = {
    code: '',
    type: null,
    sr_no: null,
    active: 1,
  };
  formConfigForNewDetails = [
    {
      label: 'Code',
      key: 'code',
      type: 'text',
      required: true,
    },
    {
      label: 'Type',
      key: 'type',
      type: 'text',
      required: true,
    },
    
  ];
  filteredDepartments: any = [];

  // New properties for pagination
  apiUrl: string = 'master/generic/';
  totalCount: number = 0;

  toggleForm(open: boolean) {
    this.isFormOpen = open;
  }

  constructor(
    private apiService: ApiService,
    private location: Location,
    private toastService: ToastService, // Inject ToastService
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    //console.log('🚢 Generic Component Initializing...');
    //console.log('API URL:', this.apiUrl);
    //console.log('Total Count:', this.totalCount);
    //console.log('Enable URL Fetching: true');
    
    // Note: Table data will be loaded by the paginated table component
    // No need to call getDepartments() here
  }
  goBack() {
    this.location.back();
  }


  getDepartments(): void {
    this.isLoading = true;
    this.apiService
      .get<any>('master/generic/') // Changed to handle paginated response
      .subscribe({
        next: (response) => {
          // Handle paginated response structure
          if (response && response.results) {
            this.departments = response.results;
            this.filteredDepartments = [...this.departments];
          } else {
            // Fallback for non-paginated response
            this.departments = response;
            this.filteredDepartments = [...this.departments];
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching generics:', error);
          this.isLoading = false;
          this.toastService.showError('Error fetching generic data');
        },
      });
  }
  // Search function
  filterDepartments() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.departments = [...this.filteredDepartments];
      return;
    }

    this.departments = this.filteredDepartments.filter(
      (dept: { code: string; type: any; sr_no: number }) =>
        dept.code.toLowerCase().includes(search) ||
        (dept.type && dept.type.toLowerCase().includes(search)) ||
        (dept.sr_no && dept.sr_no.toString().includes(search))
    );
  }
  openAddDept() {
    this.deptdisplayModal = true;
  }

  closeDialog() {
    this.isFormOpen = false;
    this.isEditFormOpen = false;
    this.viewdisplayModal = false;
    this.showDeleteDialog = false;
    this.newDepartment = {
      code: '',
      type: null,
      sr_no: null,
      active: 1,
    };
    this.selectedDept = {
      code: '',
      type: null,
      sr_no: null,
      active: 1,
    };
  }

  handleSubmit(data: any) {
    this.isLoading = true;
    const newGeneric = {
      ...this.newDepartment,
      ...data,
      active: 1
    };

    this.apiService.post(`master/generic/`, newGeneric).subscribe({
      next: (res: any) => {
        // Refresh the data after successful addition
        this.getDepartments();
        this.closeDialog();
        this.isLoading = false;
        this.toastService.showSuccess(res.message || 'Generic added successfully');
      },
      error: (err) => {
        this.isLoading = false;
        const errorMsg = err?.error?.error || 'Something went wrong';
        this.toastService.showError(errorMsg);
      },
    });
  }
  viewDeptDetails(dept: any) {
    this.viewdisplayModal = true;
    this.selectedDept = dept;
  }
  editDetails(dept: any, open: boolean) {
    this.isEditFormOpen = open;
    this.selectedDept = { ...dept };
  }
  deleteDeptDetails(dept: any) {
    this.showDeleteDialog = true;
    this.selectedDept = dept;
  }

  confirmDeletion() {
    this.isLoading = true;
    this.apiService
      .delete(`master/generic/${this.selectedDept.id}/`)
      .subscribe({
        next: (data: any) => {
          // Refresh the data after successful deletion
          this.getDepartments();
          this.showDeleteDialog = false;
          this.isLoading = false;
          this.toastService.showSuccess('Generic deleted successfully');
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error:', error);
          this.toastService.showError('Error deleting generic');
        },
      });
  }

  cancelDeletion() {
    this.showDeleteDialog = false;
  }

  handleEditSubmit(data: any) {
    this.isLoading = true;
    this.selectedDept = { ...this.selectedDept, ...data };
    this.apiService
      .put(`master/generic/${this.selectedDept.id}/`, this.selectedDept)
      .subscribe({
        next: (res: any) => {
          // Refresh the data after successful edit
          this.getDepartments();
          this.closeDialog();
          this.isLoading = false;
          this.toastService.showSuccess(res.message || 'Generic updated successfully');
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error:', error);
          this.toastService.showError('Error updating generic');
        },
      });
  }
  exportOptions = [
    {
      label: 'Export as PDF',
      icon: 'pi pi-file-pdf',
      command: () => this.exportPDF(),
    },
    {
      label: 'Export as Excel',
      icon: 'pi pi-file-excel',
      command: () => this.exportExcel(),
    },
  ];
  cols = [
    { field: 'code', header: 'Generic Code', filterType: 'text' },
    { field: 'type', header: 'Generic Type', filterType: 'text' }, // Updated to use type_name if available
    { field: 'active', header: 'Active', filterType: 'text' },
  ];
  @ViewChild('dt') dt!: Table;
  value: number = 0;
  stateOptions: any[] = [
    { label: 'Equipment Specification', value: 'equipment' },
    { label: 'HID Equipment', value: 'hid' },
    { label: 'Generic Specification', value: 'generic' },
  ];
  tabvalue: string = 'equipment';
  @Output() exportCSVEvent = new EventEmitter<void>();
  @Output() exportPDFEvent = new EventEmitter<void>();
  exportPDF() {
    //console.log('Exporting as PDF...');
    this.exportPDFEvent.emit();
    const doc = new jsPDF();
    autoTable(doc, {
      head: [this.cols.map((col) => col.header)],
      body: this.departments.map((row: { [x: string]: any }) =>
        this.cols.map((col) => {
          
          return row[col.field] || '';
        })
      ),
    });
    doc.save(`${this.tableName || 'generic'}.pdf`);
  }
  @Input() tableName: string = '';
  exportExcel() {
    //console.log('Exporting as Excel...');
    this.exportCSVEvent.emit();
    const headers = this.cols.map((col) => col.header);
    const rows = this.departments.map((row: { [x: string]: any }) =>
      this.cols.map((col) => {
       
        return row[col.field] || '';
      })
    );
    const csv = [
      headers.join(','),
      ...rows.map((row: any[]) => row.join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.tableName || 'generic'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Handle data loaded from paginated table
  onDataLoaded(data: any[]): void {
    //console.log('🚢 Data loaded from paginated table:', data);
    //console.log('🚢 Data length:', data?.length);
    //console.log('🚢 Data type:', typeof data);
    //console.log('🚢 First record:', data?.[0]);
    
    this.departments = data || [];
    this.filteredDepartments = [...(data || [])];
    
    //console.log('🚢 Departments array updated:', this.departments);
    //console.log('🚢 Filtered departments updated:', this.filteredDepartments);
    
    // Force change detection
    this.cdr.detectChanges();
  }
}