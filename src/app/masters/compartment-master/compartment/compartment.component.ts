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

interface Compartment {
  id: number;
  name: string;
  code?: string;
  active: number; // 1 = Active, 2 = Inactive
  created_by?: string;
  created_on?: string;
}

@Component({
  selector: 'app-compartment',
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
  templateUrl: './compartment.component.html',
  styleUrl: './compartment.component.css'
})
export class CompartmentComponent implements OnInit {
  searchText: string = '';
  compartments: Compartment[] = [];
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  showDeleteDialog: boolean = false;
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit Compartment Master';
  title: string = 'Add New Compartment Master';
  
  newCompartment = {
    name: '',
    code: '',
    active: 1,
  };
  
  selectedCompartment: Compartment = {
    id: 0,
    name: '',
    code: '',
    active: 1,
    created_by: '',
    created_on: ''
  };

  formConfigForNewDetails: any[] = [
    {
      label: 'Compartment Name',
      key: 'name',
      type: 'text',
      required: true,
    },
    {
      label: 'Compartment Code',
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

  filteredCompartments: Compartment[] = [];
  toggleTable: boolean = true;

  // New properties for pagination
  apiUrl: string = 'master/compartments/';
  totalCount: number = 0;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService, 
    private location: Location, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Note: Table data will be loaded by the paginated table component
    // No need to call getCompartments() here
  }

  goBack() {
    this.location.back();
  }

  getCompartments(): void {
    this.apiService.get<any>('master/compartments/').subscribe({
      next: (response) => {
        if (response && response.results) {
          this.compartments = response.results;
          this.filteredCompartments = [...this.compartments];
        } else {
          this.compartments = response;
          this.filteredCompartments = [...this.compartments];
        }
      },
      error: (error) => {
        console.error('Error fetching compartments:', error);
      },
    });
  }

  // Search function
  filterCompartments() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.compartments = [...this.filteredCompartments];
      return;
    }

    this.compartments = this.filteredCompartments.filter(
      (compartment: Compartment) =>
        compartment.name.toLowerCase().includes(search) ||
        (compartment.code && compartment.code.toLowerCase().includes(search))
    );
  }

  openAddCompartment() {
    this.deptdisplayModal = true;
  }

  closeDialog() {
    this.deptdisplayModal = false;
    this.viewdisplayModal = false;
    this.showDeleteDialog = false;
    this.editdisplayModal = false;
    this.isFormOpen = false;
    this.isEditFormOpen = false;
    this.selectedCompartment = {
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
      this.toastService.showError('Compartment name is required');
      return;
    }

    const payload = {
      name: data.name,
      code: data.code,
      active: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/compartments/', payload).subscribe({
      next: (res: any) => {
        this.toastService.showSuccess(res.message || 'Compartment added successfully');
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

  viewCompartmentDetails(compartment: Compartment) {
    this.viewdisplayModal = true;
    this.selectedCompartment = compartment;
  }

  editCompartmentDetails(compartment: Compartment) {
    this.isEditFormOpen = true;
    this.selectedCompartment = { ...compartment };
  }

  deleteCompartmentDetails(compartment: Compartment): void {
    this.showDeleteDialog = true;
    this.selectedCompartment = compartment;
  }

  confirmDeletion() {
    const payload = { id: this.selectedCompartment.id, delete: true };
    this.apiService.post('master/compartments/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Compartment deleted successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.showDeleteDialog = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to delete compartment');
      },
    });
  }

  cancelDeletion() {
    this.showDeleteDialog = false;
  }

  handleEditSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('Compartment name is required');
      return;
    }

    const payload = {
      id: this.selectedCompartment.id,
      name: data.name,
      code: data.code,
      active: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/compartments/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Updated Compartment successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.closeDialog();
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to update compartment');
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
    { field: 'name', header: 'Compartment Name', filterType: 'text' },
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
      body: this.compartments.map((row: { [x: string]: any }) =>
        this.cols.map((col) => row[col.field] || '')
      ),
    });
    doc.save(`${this.tableName || 'compartment'}.pdf`);
  }

  @Input() tableName: string = '';

  exportExcel() {
    this.exportCSVEvent.emit();
    const headers = this.cols.map((col) => col.header);
    const rows = this.compartments.map((row: { [x: string]: any }) =>
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
    link.download = `${this.tableName || 'compartment'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Handle data loaded from paginated table
  onDataLoaded(data: any[]): void {
    this.compartments = data || [];
    this.filteredCompartments = [...(data || [])];
    this.cdr.detectChanges();
  }
}
