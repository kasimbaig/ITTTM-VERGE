import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SelectButton } from 'primeng/selectbutton';
import { DropdownModule } from 'primeng/dropdown';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AddFormComponent } from '../../../shared/components/add-form/add-form.component';
import { CommonModule,Location } from '@angular/common';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { ViewDetailsComponent } from '../../../shared/components/view-details/view-details.component';

@Component({
  selector: 'app-class',
  imports: [
    TableModule,
    AddFormComponent,
    ButtonModule,
    InputTextModule,
    FormsModule,
    TieredMenuModule,
    CommonModule,
    PaginatedTableComponent,
    DropdownModule,
    ToastComponent,
    DeleteConfirmationModalComponent,
    ViewDetailsComponent
],
  templateUrl: './class.component.html',
  styleUrl: './class.component.css',
})
export class ClassComponent implements OnInit {
  searchText: string = '';
  departments: any = [];
  isFormOpen: boolean = false;
  title: string = 'Add new Class';
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  deletedisplayModal: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit Class';

  newDepartment = {
    code: '',
    name: '',
    active: 1,
  };
  selectedDept: any = {
    code: '',
    name: '',
    active: null,
  };
  formConfigForNewDetails = [
    {
      label: 'Code',
      key: 'code',
      type: 'text',
      required: true,
    },
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
  toggleTable: boolean = true;

  // New properties for pagination
  apiUrl: string = 'master/class/';
  totalCount: number = 0;

  constructor(private apiService: ApiService, private location:Location, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    //console.log('🚢 Class Component Initializing...');
    //console.log('API URL:', this.apiUrl);
    //console.log('Total Count:', this.totalCount);
    //console.log('Enable URL Fetching: true');
    
    // Note: Table data will be loaded by the paginated table component
    // No need to call getDepartments() here
  }

  goBack(){
    this.location.back(); 
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
  getDepartments(): void {
    this.apiService
      .get<any[]>('master/class/') // Adjust endpoint
      .subscribe({
        next: (data: any) => {
          this.departments = data.results || [];
          this.filteredDepartments = data.results || [];
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
      (dept: { name: string; code: string }) =>
        dept.name.toLowerCase().includes(search) ||
        dept.code.toLowerCase().includes(search)
    );
  }

  closeDialog() {
    this.deptdisplayModal = false;
    this.viewdisplayModal = false;
    this.deletedisplayModal = false;
    this.editdisplayModal = false;
    this.selectedDept = {
      code: '',
      description: '',
      active: null,
    };
  }
  handleSubmit(data: any) {
    this.newDepartment = data;
    //console.log('New Department:', this.newDepartment);
    this.apiService.post(`master/class/`, this.newDepartment).subscribe({
      next: (data: any) => {
        //console.log(data);
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
    //console.log(dept);
    this.selectedDept = dept;
  }
  editDetails(details: any, open: boolean) {
    this.isEditFormOpen = open;
    this.selectedDept = { ...details };
  }
  deleteDeptDetails(dept: any) {
    this.deletedisplayModal = true;
    this.selectedDept = dept;
  }
  confirmDeletion() {
    this.apiService.delete(`master/class/${this.selectedDept.id}/`).subscribe({
      next: (data: any) => {
        //console.log(data);
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
    this.closeDialog();
  }
  handleEditSubmit(data: any) {
    this.selectedDept = { ...this.selectedDept, ...data };
    this.apiService
      .put(`master/class/${this.selectedDept.id}/`, this.selectedDept)
      .subscribe({
        next: (data: any) => {
          //console.log(data);
          this.toggleTable = false;
          setTimeout(() => {
            this.toggleTable = true;
          }, 100);
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
    //console.log(this.selectedDept);
    this.closeDialog();
  }
  cols = [
    { field: 'name', header: 'Class Name', filterType: 'text' },
    { field: 'active', header: 'Active', filterType: 'text'},
  ];
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
