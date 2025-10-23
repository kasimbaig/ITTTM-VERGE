import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AddFormComponent } from '../../../shared/components/add-form/add-form.component';
import { CommonModule, Location } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { Department } from '../../../shared/models/department.model';
import { DepartmentService } from '../ship-services/department.service';

@Component({
  selector: 'app-department-master',
  standalone: true,
  imports: [
    TableModule,
    // Dialog,
    ButtonModule,
    InputTextModule,
    FormsModule,
    TieredMenuModule,
    PaginatedTableComponent,
    AddFormComponent,
    CommonModule,
    ToastComponent,
    DeleteConfirmationModalComponent,
  ],
  templateUrl: './department-master.component.html',
  styleUrl: './department-master.component.css',
})
export class DepartmentMasterComponent implements OnInit {
  searchText: string = '';
  departments: Department[] = [];
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  showDeleteDialog: boolean = false;
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit Department';
  title: string = 'Add new Department Master';
  newDepartment: Omit<Department, 'id' | 'active' | 'created_by'> = {
    code: '',
    name: '',
    description: '',
    sfd_applicable: 1,
  };
  // Initialize sfd_applicable for selectedDept to be a number (0 or 1)
  selectedDept: Department = {
    code: '',
    name: '',
    description: '',
    sfd_applicable: 0
  }

  formConfigForNewDetails = [
    {
      label: 'Name',
      key: 'name',
      type: 'text',
      required: true,
    },
    {
      label: 'Code',
      key: 'code',
      type: 'text',
      required: true,
    },
    {
      label: 'Description',
      key: 'description',
      type: 'text',
      required: false,
    },
    {
      label: 'SFD Applicable',
      key: 'sfd_applicable',
      type: 'checkbox', // The AddFormComponent expects a boolean for checkbox
      required: true,
    },
  ];
  filteredDepartments: Department[] = [];
  toggleTable: boolean = true;

  // New properties for pagination
  apiUrl: string = 'master/department/';
  totalCount: number = 0;

  constructor(
    private departmentService: DepartmentService,
    private toastService: ToastService,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    //console.log('🚢 Department Master Component Initializing...');
    //console.log('API URL:', this.apiUrl);
    //console.log('Total Count:', this.totalCount);
    //console.log('Enable URL Fetching: true');
    
    // Load master data for dropdowns (but not departments data - paginated table will handle that)
    this.departmentService.loadAllDepartmentsData();
    
    // Note: Table data will be loaded by the paginated table component
    // No need to call getDepartments() here
  }

  goBack(): void {
    this.location.back();
  }

  getDepartments(): void {
    this.departmentService.getDepartments().subscribe((departments: Department[]) => {
      this.departments = departments.map(d => ({
        ...d,
        sfd_applicable: d.sfd_applicable === 1 // convert number to boolean
      }));
      this.filteredDepartments = [...this.departments];
    });
  
    this.departmentService.loadAllDepartmentsData();
  }
  

  filterDepartments(): void {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.departments = [...this.filteredDepartments];
      return;
    }

    this.departments = this.filteredDepartments.filter(
      (dept) =>
        dept.name.toLowerCase().includes(search) ||
        dept.description.toLowerCase().includes(search)
    );
  }

  openAddDept(): void {
    this.isFormOpen = true;
    // Reset newDepartment to ensure clean form for adding
    this.newDepartment = {
      code: '',
      name: '',
      description: '',
      sfd_applicable: 1, // Default to 1 (true) for new department
    };
    // Ensure AddFormComponent receives a boolean for checkbox in add mode
    const sfdApplicableField = this.formConfigForNewDetails.find(field => field.key === 'sfd_applicable');
    if (sfdApplicableField) {
      sfdApplicableField.type = 'checkbox'; // Ensure type is checkbox for boolean handling
    }
  }

  closeDialog(): void {
    this.deptdisplayModal = false;
    this.viewdisplayModal = false;
    this.showDeleteDialog = false;
    this.editdisplayModal = false;
    this.isFormOpen = false;
    this.isEditFormOpen = false;
    this.selectedDept = {
      code: '',
      name: '',
      description: '',
      sfd_applicable: 0 // Reset to a number
    };
  }

  handleSubmit(data: any): void {
    const newDept: Department = {
      ...data,
      sfd_applicable: data.sfd_applicable ? 1 : 0, // boolean → 1|0
    };
  
    this.departmentService.addDepartment(newDept).subscribe({
      next: () => {
        this.toastService.showSuccess('Department added successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.closeDialog();
      },
      error: () => {
        this.toastService.showError('Failed to add department');
      }
    });
  }
  
  handleEditSubmit(data: any): void {
    if (!this.selectedDept.id) return;
  
    const updatedDept: Department = {
      ...this.selectedDept,
      ...data,
      sfd_applicable: data.sfd_applicable ? 1 : 0, // boolean → 1|0
    };
  
    this.departmentService.updateDepartment(this.selectedDept.id, updatedDept).subscribe({
      next: () => {
        this.toastService.showSuccess('Updated successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.closeDialog();
      },
      error: () => this.toastService.showError('Failed to update')
    });
  }
  


  toggleForm(open: boolean): void {
    this.isFormOpen = open;
    if (!open) {
      this.selectedDept = { code: '', name: '', description: '', sfd_applicable: 0 };
      this.isEditFormOpen = false;
    }
  }

  viewDeptDetails(dept: Department): void {
    this.viewdisplayModal = true;
    this.selectedDept = { ...dept };
    // No conversion needed here as it's for display, not form patching
  }

  editDeptDetails(dept: Department): void {
    this.isEditFormOpen = true;
    this.isFormOpen = false;
    // Create a copy and convert sfd_applicable from number (from API) to boolean for AddFormComponent
    this.selectedDept = {
      ...dept,
      sfd_applicable: dept.sfd_applicable === 1 ? true : false // Convert number to boolean for form
    };
    // If your AddFormComponent expects a 'boolean' type in its config for this field
    // You might also need to ensure the formConfigForNewDetails (or a separate one for edit)
    // correctly reflects this:
    const sfdApplicableField = this.formConfigForNewDetails.find(field => field.key === 'sfd_applicable');
    if (sfdApplicableField) {
      sfdApplicableField.type = 'checkbox'; // Ensure type is checkbox for boolean handling
    }
  }

  deleteDeptDetails(dept: Department): void {
    this.showDeleteDialog = true;
    this.selectedDept = dept;
  }
  // Similar for edit and delete:
  // handleEditSubmit(data: any): void {
  //   if (!this.selectedDept.id) return;

  //   const updatedDept: Department = {
  //     ...this.selectedDept,
  //     ...data,
  //     sfd_applicable: !!data.sfd_applicable,
  //   };

  //   this.departmentService.updateDepartment(this.selectedDept.id, updatedDept).subscribe({
  //     next: () => {
  //       this.toastService.showSuccess('Updated successfully');
  //       this.departmentService.loadAllDepartmentsData();
  //       this.closeDialog();
  //     },
  //     error: () => this.toastService.showError('Failed to update')
  //   });
  // }

  confirmDeletion(): void {
    if (!this.selectedDept.id) return;

    this.departmentService.deleteDepartment(this.selectedDept.id).subscribe({
      next: () => {
        this.toastService.showSuccess('Deleted successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.showDeleteDialog = false;
      },
      error: () => this.toastService.showError('Failed to delete')
    });
  }

  cancelDeletion(): void {
    this.showDeleteDialog = false;
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
    { field: 'name', header: 'Name', filterType: 'text' },
    { field: 'code', header: 'Code', filterType: 'text' },
    { field: 'description', header: 'Description', filterType: 'text' },
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

  exportPDF(): void {
    //console.log('Exporting as PDF...');
    this.exportPDFEvent.emit();
    const doc = new jsPDF();
    autoTable(doc, {
      head: [this.cols.map((col) => col.header)],
      body: this.departments.map((row) =>
        this.cols.map((col) => row[col.field as keyof Department] || '')
      ),
    });
    doc.save(`${this.tableName || 'table'}.pdf`);
  }

  @Input() tableName: string = '';

  exportExcel(): void {
    //console.log('Exporting as Excel...');
    this.exportCSVEvent.emit();
    const headers = this.cols.map((col) => col.header);
    const rows = this.departments.map((row) =>
      this.cols.map((col) => row[col.field as keyof Department] || '')
    );
    const csv = [
      headers.join(','),
      ...rows.map((row: any[]) => row.join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.tableName || 'table'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}