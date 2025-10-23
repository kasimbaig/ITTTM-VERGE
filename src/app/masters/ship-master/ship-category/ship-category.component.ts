import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ApiService } from '../../../services/api.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AddFormComponent } from '../../../shared/components/add-form/add-form.component';
import { CommonModule,Location } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { ShipCategory } from '../../../shared/models/ship-category.model';
import { ShipCategoryService } from '../ship-services/ship-category.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-ship-category',
  imports: [
    // Dialog,
    TableModule,
    AddFormComponent,
    CommonModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    TieredMenuModule,
    PaginatedTableComponent,
    ToastComponent,
    DeleteConfirmationModalComponent
  ],
  templateUrl: './ship-category.component.html',
  styleUrl: './ship-category.component.css',
})
export class ShipCategoryComponent implements OnInit { // Implement OnInit
  searchText: string = '';
  isFormOpen: boolean = false;
  title: string = 'Add new Ship Category';
  
  // Use Observable for departments to react to service updates
  departments$!: Observable<ShipCategory[]>; 
  
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  showDeleteDialog: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit Ship Category';

  newDepartment: ShipCategory = {
    code: '',
    name: '',
    active: 1,
    id: 0,
    created_by: null
  };
  selectedDept: ShipCategory | null = null; // Type this as ShipCategory or null

  // Form configuration for the reusable AddFormComponent
  shipCategoryFormConfig = [
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      placeholder: 'Enter category name'
    },
    {
      key: 'code',
      label: 'Code',
      type: 'text',
      required: true,
      placeholder: 'Enter category code'
    },
  ];

  // We will manage filtered data locally for search.
  // The 'departments' property will hold the current data for the table
  departments: ShipCategory[] = [];
  filteredDepartments: ShipCategory[] = [];
  private allCategories: ShipCategory[] = []; // To hold all data for filtering
  toggleTable: boolean = true;

  // New properties for pagination
  apiUrl: string = 'master/ship-category/';
  totalCount: number = 0;

  openAddCategory(): void {
    this.isFormOpen = true;
    this.isEditFormOpen = false;
    this.newDepartment = {
      code: '',
      name: '',
      active: 1,
      id: 0,
      created_by: null
    };
  }

  // Inject ShipCategoryService
  constructor(
    private shipCategoryService: ShipCategoryService, // Injected ShipCategoryService
    private toastService: ToastService,
    private location: Location,
    private apiService: ApiService, // Keep ApiService if used for generic calls or other non-category entities
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    //console.log('🚢 Ship Category Component Initializing...');
    //console.log('API URL:', this.apiUrl);
    //console.log('Total Count:', this.totalCount);
    //console.log('Enable URL Fetching: true');
    
    // Load master data for dropdowns (but not categories data - paginated table will handle that)
    this.shipCategoryService.loadAllCategoriesData();
    
    // Subscribe to the categories observable from the service for dropdown options
    this.departments$ = this.shipCategoryService.getCategories();
    
    // Subscribe to populate local 'departments' array for filtering and display
    this.departments$.subscribe((data: ShipCategory[]) => {
      this.allCategories = data; // Store original data for dropdowns
      // Note: Table data will be loaded by the paginated table component
    });
  }

  goBack(): void {
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

  // Filter function now operates on 'allCategories'
  filterDepartments(): void {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.departments = [...this.allCategories]; // Reset to original list if search is empty
      return;
    }

    this.departments = this.allCategories.filter(
      (dept: { name: string; code: string; }) => // Adjusted type for clarity
        dept.name.toLowerCase().includes(search) ||
        dept.code.toLowerCase().includes(search)
    );
  }



  closeDialog(): void {
    this.deptdisplayModal = false;
    this.viewdisplayModal = false;
    this.showDeleteDialog = false;
    this.editdisplayModal = false;
    this.isFormOpen = false;
    this.isEditFormOpen = false;
    this.selectedDept = null;
  }

  handleSubmit(data: any): void {
    // The data coming from AddFormComponent should match ShipCategory structure
    const newCategory: ShipCategory = { ...data, active: 1 }; // Ensure 'active' is set if not provided by form
    
    this.shipCategoryService.addCategory(newCategory).subscribe({
      next: (addedCategory) => {
        this.toastService.showSuccess('Ship Category added successfully');
        // The service's BehaviorSubject will update the departments$ Observable,
        // which will then update the local 'departments' array via subscription.
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.closeDialog();
      },
      error: (error) => {
        console.error('Error adding ship category:', error);
        this.toastService.showError('Failed to add Ship Category: ' + (error.message || 'Unknown error'));
      },
    });
  }

  viewDeptDetails(dept: ShipCategory): void {
    this.viewdisplayModal = true; // For PrimeNG Dialog
    this.selectedDept = dept;
    // If you're using AddFormComponent for view, you'd do:
    // this.isViewDetailsOpen = true; // Assuming a similar property for ViewDetails
    // this.selectedDept = dept;
  }

  editDetails(details: ShipCategory): void {
    this.selectedDept = { ...details }; // Clone to avoid direct mutation
    this.isEditFormOpen = true; // Open AddFormComponent in edit mode
    this.title = 'Edit Ship Category'; // Change title for edit
    // this.isFormOpen = true; // Open the add-form component
  }

  deleteDeptDetails(dept: ShipCategory): void {
    this.showDeleteDialog = true;
    this.selectedDept = dept;
  }

  confirmDeletion(): void {
    if (this.selectedDept && this.selectedDept.id) {
      this.shipCategoryService.deleteCategory(this.selectedDept.id).subscribe({
        next: () => {
          this.toastService.showSuccess('Ship Category deleted successfully');
          // Service's BehaviorSubject will update and refresh the list
          this.showDeleteDialog = false;
          this.toggleTable = false;
          setTimeout(() => {
            this.toggleTable = true;
          }, 100);
        },
        error: (error) => {
          console.error('Error deleting ship category:', error);
          this.toastService.showError('Failed to delete Ship Category: ' + (error.message || 'Unknown error'));
        },
      });
    } else {
      this.toastService.showError('No ship category selected for deletion.');
    }
  }

  cancelDeletion(): void {
    this.showDeleteDialog = false;
  }

  handleEditSubmit(data: any): void {
    if (this.selectedDept && this.selectedDept.id) {
      // Merge changes from form data into the selectedDept
      const updatedCategory: ShipCategory = { ...this.selectedDept, ...data };
      
      this.shipCategoryService.updateCategory(this.selectedDept.id, updatedCategory).subscribe({
        next: (response) => {
          this.toastService.showSuccess('Ship Category updated successfully');
          // Service's BehaviorSubject will update and refresh the list
          this.toggleTable = false;
          setTimeout(() => {
            this.toggleTable = true;
          }, 100);
          this.closeDialog();
        },
        error: (error) => {
          console.error('Error updating ship category:', error);
          this.toastService.showError('Failed to update Ship Category: ' + (error.message || 'Unknown error'));
        },
      });
    } else {
      this.toastService.showError('No ship category selected for update.');
    }
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

  exportPDF(): void {
    //console.log('Exporting as PDF...');
    this.exportPDFEvent.emit();
    const doc = new jsPDF();
    autoTable(doc, {
      head: [this.cols.map((col) => col.header)],
      body: this.departments.map((row: { [x: string]: any }) =>
        this.cols.map((col) => row[col.field] || '')
      ),
    });
    doc.save(`${this.tableName || 'ship-categories'}.pdf`); // Changed default table name
  }

  @Input() tableName: string = '';

  exportExcel(): void {
    //console.log('Exporting as Excel...');
    this.exportCSVEvent.emit();
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
    link.download = `${this.tableName || 'ship-categories'}.csv`; // Changed default table name
    link.click();
    window.URL.revokeObjectURL(url);
  }
}