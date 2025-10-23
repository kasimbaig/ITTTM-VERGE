import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { ApiService } from '../../../services/api.service';
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

interface Module {
  id: number;
  name: string;
}

interface Submodule {
  id: number;
  name: string;
  code?: string;
  active: number; // 1 = Active, 2 = Inactive
  module?: Module;
  module_id?: number; // For form handling
}

@Component({
  selector: 'app-submodule',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    TieredMenuModule,
    PaginatedTableComponent,
    AddFormComponent,
    CommonModule,
    ToastComponent,
    DeleteConfirmationModalComponent
  ],
  templateUrl: './submodule.component.html',
  styleUrl: './submodule.component.css'
})
export class SubmoduleComponent implements OnInit {
  searchText: string = '';
  submodules: Submodule[] = [];
  modules: Module[] = [];
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  showDeleteDialog: boolean = false;
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit Submodule Master';
  title: string = 'Add New Submodule Master';
  
  newSubmodule = {
    name: '',
    code: '',
    module_id: null,
    active: 1,
  };
  
  selectedSubmodule: Submodule = {
    id: 0,
    name: '',
    code: '',
    active: 1,
    module: undefined,
    module_id: undefined
  };

  formConfigForNewDetails: any[] = [
    {
      label: 'Module',
      key: 'module_id',
      type: 'select',
      required: true,
      options: []
    },
    {
      label: 'Submodule Name',
      key: 'name',
      type: 'text',
      required: true,
    },
    {
      label: 'Submodule Code',
      key: 'code',
      type: 'text',
      required: false,
    },
    {
      label: 'Status',
      key: 'status',
      type: 'checkbox',
      required: false,
    }
  ];

  filteredSubmodules: Submodule[] = [];
  toggleTable: boolean = true;

  // New properties for pagination
  apiUrl: string = 'master/submodules/';
  totalCount: number = 0;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService, 
    private location: Location, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchModules();
    // Note: Table data will be loaded by the paginated table component
    // No need to call getSubmodules() here
  }

  goBack() {
    this.location.back();
  }

  getSubmodules(): void {
    this.apiService.get<any>('master/submodules/').subscribe({
      next: (response) => {
        if (response && response.results) {
          this.submodules = response.results;
          this.filteredSubmodules = [...this.submodules];
        } else {
          this.submodules = response;
          this.filteredSubmodules = [...this.submodules];
        }
      },
      error: (error) => {
        console.error('Error fetching submodules:', error);
      },
    });
  }

  fetchModules(): void {
    this.apiService.get<any>('master/modules/').subscribe({
      next: (response) => {
        // Handle different response formats
        let modulesData = [];
        if (response && response.data) {
          // Response format: {status: 200, data: [...]}
          modulesData = response.data;
        } else if (response && response.results) {
          // Response format: {count: 6, results: [...]}
          modulesData = response.results;
        } else if (Array.isArray(response)) {
          // Direct array response
          modulesData = response;
        }
        
        this.modules = modulesData;
        
        // Update form config with module options for dropdown
        this.formConfigForNewDetails[0].options = this.modules.map(module => ({
          value: module.id,
          label: module.name
        }));
      },
      error: (error) => {
        console.error('Error fetching modules:', error);
        this.toastService.showError('Failed to load modules');
      },
    });
  }

  // Search function
  filterSubmodules() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.submodules = [...this.filteredSubmodules];
      return;
    }

    this.submodules = this.filteredSubmodules.filter(
      (submodule: Submodule) =>
        submodule.name.toLowerCase().includes(search) ||
        (submodule.code && submodule.code.toLowerCase().includes(search)) ||
        (submodule.module && submodule.module.name.toLowerCase().includes(search))
    );
  }

  openAddSubmodule() {
    this.deptdisplayModal = true;
  }

  closeDialog() {
    this.deptdisplayModal = false;
    this.viewdisplayModal = false;
    this.showDeleteDialog = false;
    this.editdisplayModal = false;
    this.isFormOpen = false;
    this.isEditFormOpen = false;
    this.selectedSubmodule = {
      id: 0,
      name: '',
      code: '',
      active: 1,
      module: undefined,
      module_id: undefined
    };
  }

  handleSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('Submodule name is required');
      return;
    }

    if (!data.module_id) {
      this.toastService.showError('Module is required');
      return;
    }

    const payload = {
      name: data.name,
      code: data.code,
      active: data.status === 'Active' ? 1 : 2,
      module: data.module_id,
    };

    this.apiService.post('master/submodules/', payload).subscribe({
      next: (res: any) => {
        this.toastService.showSuccess(res.message || 'Submodule added successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.closeDialog();
      },
      error: (err) => {
        const errorMsg = err?.error?.error || 'Something went wrong';
        this.toastService.showError(errorMsg);
      },
    });
  }

  toggleForm(open: boolean) {
    this.isFormOpen = open;
  }

  viewSubmoduleDetails(submodule: Submodule) {
    this.viewdisplayModal = true;
    this.selectedSubmodule = submodule;
  }

  editSubmoduleDetails(submodule: Submodule) {
    this.isEditFormOpen = true;
    this.selectedSubmodule = { ...submodule };
    
    // Set module_id for edit form
    if (submodule.module) {
      this.selectedSubmodule.module_id = submodule.module.id;
    }
  }

  deleteSubmoduleDetails(submodule: Submodule): void {
    this.showDeleteDialog = true;
    this.selectedSubmodule = submodule;
  }

  confirmDeletion() {
    const payload = { id: this.selectedSubmodule.id, delete: true };
    this.apiService.post('master/submodules/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Submodule deleted successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.showDeleteDialog = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to delete submodule');
      },
    });
  }

  cancelDeletion() {
    this.showDeleteDialog = false;
  }

  handleEditSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('Submodule name is required');
      return;
    }

    if (!data.module_id) {
      this.toastService.showError('Module is required');
      return;
    }

    const payload = {
      id: this.selectedSubmodule.id,
      name: data.name,
      code: data.code,
      active: data.status === 'Active' ? 1 : 2,
      module: data.module_id,
    };

    this.apiService.post('master/submodules/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Updated Submodule successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.closeDialog();
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to update submodule');
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
    { field: 'module.name', header: 'Module', filterType: 'text' },
    { field: 'name', header: 'Submodule Name', filterType: 'text' },
    { field: 'code', header: 'Code', filterType: 'text' },
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
    this.exportPDFEvent.emit();
    const doc = new jsPDF();
    autoTable(doc, {
      head: [this.cols.map((col) => col.header)],
      body: this.submodules.map((row: { [x: string]: any }) =>
        this.cols.map((col) => {
          if (col.field === 'module.name') {
            return row['module']?.name || '';
          }
          return row[col.field] || '';
        })
      ),
    });
    doc.save(`${this.tableName || 'submodule'}.pdf`);
  }

  @Input() tableName: string = '';

  exportExcel() {
    this.exportCSVEvent.emit();
    const headers = this.cols.map((col) => col.header);
    const rows = this.submodules.map((row: { [x: string]: any }) =>
      this.cols.map((col) => {
        if (col.field === 'module.name') {
          return row['module']?.name || '';
        }
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
    link.download = `${this.tableName || 'submodule'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Handle data loaded from paginated table
  onDataLoaded(data: any[]): void {
    this.submodules = data || [];
    this.filteredSubmodules = [...(data || [])];
    this.cdr.detectChanges();
  }
}
