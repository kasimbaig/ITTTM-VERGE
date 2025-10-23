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

interface System {
  id: number;
  name: string;
  code?: string;
  active: number; // 1 = Active, 2 = Inactive
  created_by?: string;
  created_on?: string;
}

@Component({
  selector: 'app-system',
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
  templateUrl: './system.component.html',
  styleUrl: './system.component.css'
})
export class SystemComponent implements OnInit {
  searchText: string = '';
  systems: System[] = [];
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  showDeleteDialog: boolean = false;
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit System Master';
  title: string = 'Add New System Master';
  
  newSystem = {
    name: '',
    code: '',
    active: 1,
  };
  
  selectedSystem: System = {
    id: 0,
    name: '',
    code: '',
    active: 1,
    created_by: '',
    created_on: ''
  };

  formConfigForNewDetails: any[] = [
    {
      label: 'System Name',
      key: 'name',
      type: 'text',
      required: true,
    },
    {
      label: 'System Code',
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

  filteredSystems: System[] = [];
  toggleTable: boolean = true;

  // New properties for pagination
  apiUrl: string = 'master/systems/';
  totalCount: number = 0;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService, 
    private location: Location, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Note: Table data will be loaded by the paginated table component
    // No need to call getSystems() here
  }

  goBack() {
    this.location.back();
  }

  getSystems(): void {
    this.apiService.get<any>('master/systems/').subscribe({
      next: (response) => {
        if (response && response.results) {
          this.systems = response.results;
          this.filteredSystems = [...this.systems];
        } else {
          this.systems = response;
          this.filteredSystems = [...this.systems];
        }
      },
      error: (error) => {
        console.error('Error fetching systems:', error);
      },
    });
  }

  // Search function
  filterSystems() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.systems = [...this.filteredSystems];
      return;
    }

    this.systems = this.filteredSystems.filter(
      (system: System) =>
        system.name.toLowerCase().includes(search) ||
        (system.code && system.code.toLowerCase().includes(search))
    );
  }

  openAddSystem() {
    this.deptdisplayModal = true;
  }

  closeDialog() {
    this.deptdisplayModal = false;
    this.viewdisplayModal = false;
    this.showDeleteDialog = false;
    this.editdisplayModal = false;
    this.isFormOpen = false;
    this.isEditFormOpen = false;
    this.selectedSystem = {
      id: 0,
      name: '',
      code: '',
      active: 1,
      created_by: '',
      created_on: ''
    };
  }

  handleSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('System name is required');
      return;
    }

    const payload = {
      name: data.name,
      code: data.code,
      active: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/systems/', payload).subscribe({
      next: (res: any) => {
        this.toastService.showSuccess(res.message || 'System added successfully');
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

  viewSystemDetails(system: System) {
    this.viewdisplayModal = true;
    this.selectedSystem = system;
  }

  editSystemDetails(system: System) {
    this.isEditFormOpen = true;
    this.selectedSystem = { ...system };
  }

  deleteSystemDetails(system: System): void {
    this.showDeleteDialog = true;
    this.selectedSystem = system;
  }

  confirmDeletion() {
    const payload = { id: this.selectedSystem.id, delete: true };
    this.apiService.post('master/systems/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('System deleted successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.showDeleteDialog = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to delete system');
      },
    });
  }

  cancelDeletion() {
    this.showDeleteDialog = false;
  }

  handleEditSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('System name is required');
      return;
    }

    const payload = {
      id: this.selectedSystem.id,
      name: data.name,
      code: data.code,
      active: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/systems/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Updated System successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.closeDialog();
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to update system');
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
    { field: 'name', header: 'System Name', filterType: 'text' },
    { field: 'code', header: 'Code', filterType: 'text' },
    { field: 'active', header: 'Status', filterType: 'text' },
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
      body: this.systems.map((row: { [x: string]: any }) =>
        this.cols.map((col) => row[col.field] || '')
      ),
    });
    doc.save(`${this.tableName || 'system'}.pdf`);
  }

  @Input() tableName: string = '';

  exportExcel() {
    this.exportCSVEvent.emit();
    const headers = this.cols.map((col) => col.header);
    const rows = this.systems.map((row: { [x: string]: any }) =>
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
    link.download = `${this.tableName || 'system'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Handle data loaded from paginated table
  onDataLoaded(data: any[]): void {
    this.systems = data || [];
    this.filteredSystems = [...(data || [])];
    this.cdr.detectChanges();
  }
}
