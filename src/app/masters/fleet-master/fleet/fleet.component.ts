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

interface Fleet {
  id: number;
  name: string;
  code: string;
  command?: string;
  vesselCount?: number;
  active: number; // 1 = Active, 2 = Inactive
  description?: string;
  created_on?: string;
  created_by?: number;
}

@Component({
  selector: 'app-fleet',
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
  templateUrl: './fleet.component.html',
  styleUrl: './fleet.component.css'
})
export class FleetComponent implements OnInit {
  searchText: string = '';
  fleets: Fleet[] = [];
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  showDeleteDialog: boolean = false;
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit Fleet Master';
  title: string = 'Add New Fleet Master';
  
  newFleet = {
    name: '',
    code: '',
    command: '',
    description: '',
    active: 1,
  };
  
  selectedFleet: Fleet = {
    id: 0,
    name: '',
    code: '',
    command: '',
    vesselCount: 0,
    active: 1,
    description: '',
    created_on: '',
    created_by: 0
  };

  formConfigForNewDetails: any[] = [
    {
      label: 'Fleet Name',
      key: 'name',
      type: 'text',
      required: true,
    },
    {
      label: 'Fleet Code',
      key: 'code',
      type: 'text',
      required: true,
    },
    {
      label: 'Command',
      key: 'command',
      type: 'select',
      required: false,
      options: [
        { id: 'Eastern Naval Command', name: 'Eastern Naval Command' },
        { id: 'Western Naval Command', name: 'Western Naval Command' },
        { id: 'Southern Naval Command', name: 'Southern Naval Command' },
        { id: 'Naval Headquarters', name: 'Naval Headquarters' }
      ]
    },
    {
      label: 'Description',
      key: 'description',
      type: 'textarea',
      required: false,
    },
    {
      label: 'Status',
      key: 'status',
      type: 'checkbox',
      required: false,
    }
  ];

  filteredFleets: Fleet[] = [];
  toggleTable: boolean = true;

  // New properties for pagination
  apiUrl: string = 'master/fleets/';
  totalCount: number = 0;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService, 
    private location: Location, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Note: Table data will be loaded by the paginated table component
    // No need to call getFleets() here
  }

  goBack() {
    this.location.back();
  }

  getFleets(): void {
    this.apiService.get<any>('master/fleets/').subscribe({
      next: (response) => {
        if (response && response.results) {
          this.fleets = response.results;
          this.filteredFleets = [...this.fleets];
        } else {
          this.fleets = response;
          this.filteredFleets = [...this.fleets];
        }
      },
      error: (error) => {
        console.error('Error fetching fleets:', error);
      },
    });
  }

  // Search function
  filterFleets() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.fleets = [...this.filteredFleets];
      return;
    }

    this.fleets = this.filteredFleets.filter(
      (fleet: Fleet) =>
        fleet.name.toLowerCase().includes(search) ||
        fleet.code.toLowerCase().includes(search) ||
        (fleet.command && fleet.command.toLowerCase().includes(search))
    );
  }

  openAddFleet() {
    this.deptdisplayModal = true;
  }

  closeDialog() {
    this.deptdisplayModal = false;
    this.viewdisplayModal = false;
    this.showDeleteDialog = false;
    this.editdisplayModal = false;
    this.isFormOpen = false;
    this.isEditFormOpen = false;
    this.selectedFleet = {
      id: 0,
      name: '',
      code: '',
      command: '',
      vesselCount: 0,
      active: 1,
      description: '',
      created_on: '',
      created_by: 0
    };
  }

  handleSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('Fleet name is required');
      return;
    }

    if (!data.code?.trim()) {
      this.toastService.showError('Fleet code is required');
      return;
    }

    const payload = {
      name: data.name,
      code: data.code,
      command: data.command,
      description: data.description,
      active: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/fleets/', payload).subscribe({
      next: (res: any) => {
        this.toastService.showSuccess(res.message || 'Fleet added successfully');
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

  viewFleetDetails(fleet: Fleet) {
    this.viewdisplayModal = true;
    this.selectedFleet = fleet;
  }

  editFleetDetails(fleet: Fleet) {
    this.isEditFormOpen = true;
    this.selectedFleet = { ...fleet };
  }

  deleteFleetDetails(fleet: Fleet): void {
    this.showDeleteDialog = true;
    this.selectedFleet = fleet;
  }

  confirmDeletion() {
    const payload = { id: this.selectedFleet.id, delete: true };
    this.apiService.post('master/fleets/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Fleet deleted successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.showDeleteDialog = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to delete fleet');
      },
    });
  }

  cancelDeletion() {
    this.showDeleteDialog = false;
  }

  handleEditSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('Fleet name is required');
      return;
    }

    if (!data.code?.trim()) {
      this.toastService.showError('Fleet code is required');
      return;
    }

    const payload = {
      id: this.selectedFleet.id,
      name: data.name,
      code: data.code,
      command: data.command,
      description: data.description,
      active: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/fleets/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Updated Fleet successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.closeDialog();
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to update fleet');
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
    { field: 'name', header: 'Fleet Name', filterType: 'text' },
    { field: 'code', header: 'Code', filterType: 'text' },
    { field: 'command', header: 'Command', filterType: 'text' },
    { field: 'vesselCount', header: 'Vessels', filterType: 'text' },
    { field: 'active', header: 'Status', filterType: 'text' },
    { field: 'created_on', header: 'Created', filterType: 'text' },
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
      body: this.fleets.map((row: { [x: string]: any }) =>
        this.cols.map((col) => row[col.field] || '')
      ),
    });
    doc.save(`${this.tableName || 'fleet'}.pdf`);
  }

  @Input() tableName: string = '';

  exportExcel() {
    this.exportCSVEvent.emit();
    const headers = this.cols.map((col) => col.header);
    const rows = this.fleets.map((row: { [x: string]: any }) =>
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
    link.download = `${this.tableName || 'fleet'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Handle data loaded from paginated table
  onDataLoaded(data: any[]): void {
    this.fleets = data || [];
    this.filteredFleets = [...(data || [])];
    this.cdr.detectChanges();
  }
}
