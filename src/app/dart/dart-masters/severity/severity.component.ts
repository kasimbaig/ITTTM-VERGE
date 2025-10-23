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
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';
import { CommonModule } from '@angular/common';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { AddFormComponent } from '../../../shared/components/add-form/add-form.component';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-severity',
  imports: [
    TableModule,
    AddFormComponent,
    CommonModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    TieredMenuModule,
    PaginatedTableComponent,
    ToastComponent,
    Dialog

  ],
  templateUrl: './severity.component.html',
  styleUrl: './severity.component.css'
})
export class SeverityComponent implements OnInit {
  title: string = 'Add new Severity';
  isFormOpen: boolean = false;
  searchText: string = '';
  departments: any = [];
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  deletedisplayModal: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit';

  // New properties for pagination
  apiUrl: string = 'master/propulsion/';
  totalCount: number = 0;

  newDetails = {
    name: '',
    active: 1,
  };
  selectedDetails: any = {
    name: '',
    description: '',
  };
  formConfigForNewDetails = [
    {
      label: 'Severity ID',
      key: 'name',
      type: 'text',
      required: true,
    },
    {
      label: 'Severity Code',
      key: 'name',
      type: 'text',
      required: true,
    }, {
      label: 'Severity Name',
      key: 'name',
      type: 'text',
      required: true,
    }, {
      label: 'ISMS Severity Code',
      key: 'name',
      type: 'text',
      required: true,
    }, {
      label: 'Created By',
      key: 'name',
      type: 'text',
      required: true,
    }, {
      label: 'Created Date',
      key: 'name',
      type: 'text',
      required: true,
    }, {
      label: 'Updated By',
      key: 'name',
      type: 'text',
      required: true,
    }, {
      label: 'Updated Date',
      key: 'name',
      type: 'text',
      required: true,
    },
  ];

  toggleForm(open: boolean) {
    this.isFormOpen = open;
  }

  filteredDepartments: any = [];
  toggleTable: boolean = true;

  constructor(
    private apiService: ApiService, 
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    //console.log('🚢 Severity Component Initializing...');
    //console.log('API URL:', this.apiUrl);
    //console.log('Total Count:', this.totalCount);
    //console.log('Enable URL Fetching: true');
    
    // Note: Table data will be loaded by the paginated table component
    // No need to call getDepartments() here
  }

  // Handle data loaded from paginated table
  onDataLoaded(data: any[]): void {
    //console.log('🚢 Data loaded from paginated table:', data);
    //console.log('🚢 Data length:', data?.length);
    //console.log('🚢 Data type:', typeof data);
    //console.log('🚢 First record:', data?.[0]);
    
    this.departments = data || [];
    this.filteredDepartments = [...(data || [])];
    
    //console.log('🚢 Departments updated:', this.departments);
    //console.log('🚢 Filtered departments updated:', this.filteredDepartments);
    
    // Force change detection
    this.cdr.detectChanges();
  }

  getDepartments(): void {
    this.apiService
      .get<any[]>('master/propulsion/') // Adjust endpoint
      .subscribe({
        next: (data:any) => {
          this.departments = data?.results;
          this.filteredDepartments = [...this.departments];
        },
        error: (error) => {
          console.error('Error fetching departments:', error);
        },
      });
  }
  // Search function
  filterDepartments() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.departments = [...this.filteredDepartments]; // Reset to original list if search is empty
      return;
    }

    this.departments = this.filteredDepartments.filter(
      (dept: { name: string; description: string }) =>
        dept.name.toLowerCase().includes(search) ||
        dept.description.toLowerCase().includes(search)
    );
  }
  openAddDept() {
    this.deptdisplayModal = true;
  }

  closeDialog() {
    this.deptdisplayModal = false;
    this.viewdisplayModal = false;
    this.deletedisplayModal = false;
    this.editdisplayModal = false;
 
  }
  handleSubmit(data: any) {
    this.newDetails = { ...this.newDetails, ...data };

    this.apiService.post(`master/propulsion/`, this.newDetails).subscribe({
      next: (data: any) => {
        //console.log(data);
        this.departments.push(data);
        this.filteredDepartments.push(data);
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
      },
      error: (error) => {
        console.error('Login failed:', error);
        alert('Invalid login credentials');
      },
    });
    this.closeDialog();
  }

  viewDeptDetails(dept: any) {
    this.viewdisplayModal = true;
  }
  editDetails(details: any, open: boolean) {
    this.selectedDetails = { ...details };
    this.isEditFormOpen = true;
  }
  deleteDeptDetails(dept: any): void {
    this.deletedisplayModal = true;
    // this.selectedDept = dept;
  }
  
  
  confirmDeletion() {
    this.apiService
      .delete(`master/country/${this.selectedDetails.id}/`)
      .subscribe({
        next: (data: any) => {
          //console.log(data);
          this.toastService.showSuccess('Country deleted successfully');
  
          // ✅ Remove from local array
          this.departments = this.departments.filter(
            (            dept: { id: any; }) => dept.id !== this.selectedDetails.id
          );
          this.filteredDepartments = [...this.departments];
  
          // ✅ Close modal/dialog
          this.closeDialog();
          this.deletedisplayModal = false;
          this.toggleTable = false;
          setTimeout(() => {
            this.toggleTable = true;
          }, 100);
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }
  handleEditSubmit(data: any) {
    this.selectedDetails = { ...this.selectedDetails, ...data };  
    this.apiService
      .put(`master/country/${this.selectedDetails.id}/`, this.selectedDetails)
      .subscribe({
        next: (data: any) => {
          //console.log(data);
          this.toastService.showSuccess('Updated Country successfully');
  
          this.getDepartments();
            this.closeDialog();
            this.toggleTable = false;
            setTimeout(() => {
              this.toggleTable = true;
            }, 100);
        },
        error: (error) => {
          console.error('Error:', error);
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
    { field: 'id', header: 'Severity ID', filterType: 'text' },
    { field: 'name', header: 'Severity Name', filterType: 'text' },
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
    // Your PDF export logic here
    this.exportPDFEvent.emit(); // Emit event instead of direct call
    const doc = new jsPDF();
    autoTable(doc, {
      head: [this.cols.map((col) => col.header)],
      body: this.departments.map((row: { [x: string]: any }) =>
        this.cols.map((col) => row[col.field] || '')
      ),
    });
    doc.save(`${this.tableName || 'table'}.pdf`); // ✅ Use backticks
  }
  @Input() tableName: string = '';
  exportExcel() {
    //console.log('Exporting as Excel...');
    // Your Excel export logic here
    this.exportCSVEvent.emit(); // Emit event instead of direct call
    const headers = this.cols.map((col) => col.header);
    const rows = this.departments.map((row: { [x: string]: any }) =>
      this.cols.map((col) => row[col.field] || '')
    );
    const csv = [
      headers.join(','),
      ...rows.map((row: any[]) => row.join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.tableName || 'table'}.csv`; // ✅ Use backticks
    link.click();
    window.URL.revokeObjectURL(url);
  }
}


