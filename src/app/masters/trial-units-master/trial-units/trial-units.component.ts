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

interface TrialUnit {
  id: number;
  name: string;
  code: string;
  description?: string;
  sequence?: number;
  active: number; // 1 = Active, 2 = Inactive
  created_on?: string;
}

interface TrialUnitFormData {
  id?: number;
  name: string;
  code: string;
  description: string;
  sequence: string;
  active: number;
  status?: string;
}

@Component({
  selector: 'app-trial-units',
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
  templateUrl: './trial-units.component.html',
  styleUrl: './trial-units.component.css'
})
export class TrialUnitsComponent implements OnInit {
  searchText: string = '';
  trialUnits: TrialUnit[] = [];
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  showDeleteDialog: boolean = false;
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit Trial Unit Master';
  title: string = 'Add New Trial Unit Master';
  
  newTrialUnit: TrialUnitFormData = {
    name: '',
    code: '',
    description: '',
    sequence: '',
    active: 1,
  };
  
  selectedTrialUnit: TrialUnit = {
    id: 0,
    name: '',
    code: '',
    description: '',
    sequence: undefined,
    active: 1,
    created_on: ''
  };

  selectedTrialUnitFormData: TrialUnitFormData = {
    name: '',
    code: '',
    description: '',
    sequence: '',
    active: 1,
  };

  formConfigForNewDetails: any[] = [
    {
      label: 'Trial Unit Name',
      key: 'name',
      type: 'text',
      required: true,
    },
    {
      label: 'Trial Unit Code',
      key: 'code',
      type: 'text',
      required: true,
    },
    {
      label: 'Description',
      key: 'description',
      type: 'textarea',
      required: false,
      placeholder: 'Enter description'
    },
    {
      label: 'Sequence',
      key: 'sequence',
      type: 'number',
      required: false,
      placeholder: 'Enter sequence number'
    },
    {
      label: 'Status',
      key: 'status',
      type: 'checkbox',
      required: false,
    }
  ];

  filteredTrialUnits: TrialUnit[] = [];
  toggleTable: boolean = true;

  // New properties for pagination
  apiUrl: string = 'master/trial-units/';
  totalCount: number = 0;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService, 
    private location: Location, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Note: Table data will be loaded by the paginated table component
  }

  goBack() {
    this.location.back();
  }

  getTrialUnits(): void {
    this.apiService.get<any>('master/trial-units/').subscribe({
      next: (response) => {
        if (response && response.results) {
          this.trialUnits = response.results;
          this.filteredTrialUnits = [...this.trialUnits];
        } else {
          this.trialUnits = response;
          this.filteredTrialUnits = [...this.trialUnits];
        }
      },
      error: (error) => {
        console.error('Error fetching trial units:', error);
      },
    });
  }

  // Search function
  filterTrialUnits() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.trialUnits = [...this.filteredTrialUnits];
      return;
    }

    this.trialUnits = this.filteredTrialUnits.filter(
      (trialUnit: TrialUnit) =>
        trialUnit.name.toLowerCase().includes(search) ||
        trialUnit.code.toLowerCase().includes(search) ||
        (trialUnit.description && trialUnit.description.toLowerCase().includes(search)) ||
        (trialUnit.sequence && trialUnit.sequence.toString().includes(search))
    );
  }

  openAddTrialUnit() {
    this.deptdisplayModal = true;
  }

  closeDialog() {
    this.deptdisplayModal = false;
    this.viewdisplayModal = false;
    this.showDeleteDialog = false;
    this.editdisplayModal = false;
    this.isFormOpen = false;
    this.isEditFormOpen = false;
    this.selectedTrialUnit = {
      id: 0,
      name: '',
      code: '',
      description: '',
      sequence: undefined,
      active: 1,
      created_on: ''
    };
    this.selectedTrialUnitFormData = {
      name: '',
      code: '',
      description: '',
      sequence: '',
      active: 1,
    };
  }

  handleSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('Trial Unit name is required');
      return;
    }

    if (!data.code?.trim()) {
      this.toastService.showError('Trial Unit code is required');
      return;
    }

    const payload = {
      name: data.name,
      code: data.code,
      description: data.description || null,
      sequence: data.sequence ? parseInt(data.sequence) : null,
      active: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/trial-units/', payload).subscribe({
      next: (res: any) => {
        this.toastService.showSuccess(res.message || 'Trial Unit added successfully');
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

  viewTrialUnitDetails(trialUnit: TrialUnit) {
    this.viewdisplayModal = true;
    this.selectedTrialUnit = trialUnit;
  }

  editTrialUnitDetails(trialUnit: TrialUnit) {
    this.isEditFormOpen = true;
    this.selectedTrialUnit = trialUnit;
    this.selectedTrialUnitFormData = {
      id: trialUnit.id,
      name: trialUnit.name,
      code: trialUnit.code,
      description: trialUnit.description || '',
      sequence: trialUnit.sequence ? trialUnit.sequence.toString() : '',
      active: trialUnit.active,
      status: trialUnit.active === 1 ? 'Active' : 'Inactive'
    };
  }

  deleteTrialUnitDetails(trialUnit: TrialUnit): void {
    this.showDeleteDialog = true;
    this.selectedTrialUnit = trialUnit;
  }

  confirmDeletion() {
    const payload = { id: this.selectedTrialUnit.id, delete: true };
    this.apiService.post('master/trial-units/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Trial Unit deleted successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.showDeleteDialog = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to delete trial unit');
      },
    });
  }

  cancelDeletion() {
    this.showDeleteDialog = false;
  }

  handleEditSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('Trial Unit name is required');
      return;
    }

    if (!data.code?.trim()) {
      this.toastService.showError('Trial Unit code is required');
      return;
    }

    const payload = {
      id: this.selectedTrialUnit.id,
      name: data.name,
      code: data.code,
      description: data.description || null,
      sequence: data.sequence ? parseInt(data.sequence) : null,
      active: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/trial-units/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Updated Trial Unit successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.closeDialog();
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to update trial unit');
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
    { field: 'name', header: 'Trial Unit Name', filterType: 'text' },
    { field: 'code', header: 'Code', filterType: 'text' },
    { field: 'description', header: 'Description', filterType: 'text' },
    { field: 'sequence', header: 'Sequence', filterType: 'text' },
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
      body: this.trialUnits.map((row: { [x: string]: any }) =>
        this.cols.map((col) => {
          if (col.field === 'active') {
            return row[col.field] === 1 ? 'Active' : 'Inactive';
          }
          return row[col.field] || '';
        })
      ),
    });
    doc.save(`${this.tableName || 'trial-units'}.pdf`);
  }

  @Input() tableName: string = '';

  exportExcel() {
    this.exportCSVEvent.emit();
    const headers = this.cols.map((col) => col.header);
    const rows = this.trialUnits.map((row: { [x: string]: any }) =>
      this.cols.map((col) => {
        if (col.field === 'active') {
          return row[col.field] === 1 ? 'Active' : 'Inactive';
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
    link.download = `${this.tableName || 'trial-units'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Handle data loaded from paginated table
  onDataLoaded(data: any[]): void {
    this.trialUnits = data || [];
    this.filteredTrialUnits = [...(data || [])];
    this.cdr.detectChanges();
  }
}
