
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
import { ViewDetailsComponent } from '../../../shared/components/view-details/view-details.component';

@Component({
  selector: 'app-agency',
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
    Dialog,
    ViewDetailsComponent

  ],
  templateUrl: './agency.component.html',
  styleUrl: './agency.component.css'
})
export class AgencyComponent implements OnInit {
  title: string = 'Add New Agency';
  isFormOpen: boolean = false;
  searchText: string = '';
  departments: any = [];
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  deletedisplayModal: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit';
  isViewDetailsOpen: boolean = false;
  viewDetialsTitle: string = 'Agency Details';
  isLoading: boolean = false;
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
      label: 'Name',
      key: 'name',
      type: 'text',
      required: true,
    },
  ];

  toggleForm(open: boolean) {
    this.isFormOpen = open;
  }

  filteredDepartments: any = [];

  constructor(
    private apiService: ApiService, 
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    //console.log('🚢 Agency Component Initializing...');
    //console.log('API URL:', this.apiUrl);
    //console.log('Total Count:', this.totalCount);
    //console.log('Enable URL Fetching: true');
    
    // Note: Table data will be loaded by the paginated table component
    // No need to call getDepartments() here
  }

  // Handle data loaded from paginated table
  onDataLoaded(data: any[]): void {
 
    
    this.departments = data || [];
    this.filteredDepartments = [...(data || [])];

    
    // Force change detection
    this.cdr.detectChanges();
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

    this.apiService.post(`master/agency/`, this.newDetails).subscribe({
      next: (data: any) => {
        //console.log(data);
        this.toastService.showSuccess('Agency Added Successfully');
        // Data will be refreshed by the paginated table component
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.toastService.showError('Failed to add Agency');
      },
    });
    this.closeDialog();
  }

  // viewDeptDetails(dept: any) {
  //   this.viewdisplayModal = true;
  // }
   viewDeptDetails(dept: any, open: boolean) {
    this.selectedDetails = {
      ...dept,
    };

    this.isViewDetailsOpen = open;
  }
  editDetails(details: any, open: boolean) {
    this.selectedDetails = { ...details };
    this.isEditFormOpen = true;
  }
  deleteDeptDetails(dept: any): void {
    this.deletedisplayModal = true;
    // this.selectedDept = dept;
    this.selectedDetails = dept;
  }
  
  
  confirmDeletion() {
    this.apiService
      .delete(`master/agency/${this.selectedDetails.id}/`)
      .subscribe({
        next: (data: any) => {
          //console.log(data);
          this.toastService.showSuccess('Agency Deleted Successfully');
  
          // Data will be refreshed by the paginated table component
  
          // ✅ Close modal/dialog
          this.closeDialog();
          this.deletedisplayModal = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.toastService.showError('Failed to delete Agency');
        },
      });
  }
  handleEditSubmit(data: any) {
    this.selectedDetails = { ...this.selectedDetails, ...data };  
    this.apiService
      .put(`master/agency/${this.selectedDetails.id}/`, this.selectedDetails)
      .subscribe({
        next: (data: any) => {
          //console.log(data);
          this.toastService.showSuccess('Agency Updated Successfully');
  
          // Data will be refreshed by the paginated table component
          this.closeDialog();
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
    { field: 'id', header: 'ID', filterType: 'text' },
    { field: 'name', header: 'Agency Name', filterType: 'text' },
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


