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

interface Dockyard {
  id: number;
  name: string;
  code: string;
  active: number; // 1 = Active, 2 = Inactive
  created_on: string;
  created_by: number;
}

@Component({
  selector: 'app-dockyard',
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
  templateUrl: './dockyard.component.html',
  styleUrl: './dockyard.component.css'
})
export class DockyardComponent implements OnInit {
  searchText: string = '';
  dockyards: Dockyard[] = [];
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  showDeleteDialog: boolean = false;
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit Dockyard Master';
  title: string = 'Add New Dockyard Master';
  
  newDockyard = {
    name: '',
    code: '',
    active: 1,
  };
  
  selectedDockyard: Dockyard = {
    id: 0,
    name: '',
    code: '',
    active: 1,
    created_on: '',
    created_by: 0
  };

  formConfigForNewDetails: any[] = [
    {
      label: 'Dockyard Name',
      key: 'name',
      type: 'text',
      required: true,
    },
    {
      label: 'Dockyard Code',
      key: 'code',
      type: 'text',
      required: true,
    },
    {
      label: 'Status',
      key: 'status',
      type: 'checkbox',
      required: false,
    }
  ];

  filteredDockyards: Dockyard[] = [];
  toggleTable: boolean = true;

  // New properties for pagination
  apiUrl: string = 'master/dockyards/';
  totalCount: number = 0;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService, 
    private location: Location, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Note: Table data will be loaded by the paginated table component
    // No need to call getDockyards() here
  }

  goBack() {
    this.location.back();
  }

  getDockyards(): void {
    this.apiService.get<any>('master/dockyards/').subscribe({
      next: (response) => {
        if (response && response.results) {
          this.dockyards = response.results;
          this.filteredDockyards = [...this.dockyards];
        } else {
          this.dockyards = response;
          this.filteredDockyards = [...this.dockyards];
        }
      },
      error: (error) => {
        console.error('Error fetching dockyards:', error);
      },
    });
  }

  // Search function
  filterDockyards() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.dockyards = [...this.filteredDockyards];
      return;
    }

    this.dockyards = this.filteredDockyards.filter(
      (dockyard: Dockyard) =>
        dockyard.name.toLowerCase().includes(search) ||
        dockyard.code.toLowerCase().includes(search)
    );
  }

  openAddDockyard() {
    this.deptdisplayModal = true;
  }

  closeDialog() {
    this.deptdisplayModal = false;
    this.viewdisplayModal = false;
    this.showDeleteDialog = false;
    this.editdisplayModal = false;
    this.isFormOpen = false;
    this.isEditFormOpen = false;
    this.selectedDockyard = {
      id: 0,
      name: '',
      code: '',
      active: 1,
      created_on: '',
      created_by: 0
    };
  }

  handleSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('Dockyard name is required');
      return;
    }

    if (!data.code?.trim()) {
      this.toastService.showError('Dockyard code is required');
      return;
    }

    const payload = {
      name: data.name,
      code: data.code,
      active: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/dockyards/', payload).subscribe({
      next: (res: any) => {
        this.toastService.showSuccess(res.message || 'Dockyard added successfully');
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

  viewDockyardDetails(dockyard: Dockyard) {
    this.viewdisplayModal = true;
    this.selectedDockyard = dockyard;
  }

  editDockyardDetails(dockyard: Dockyard) {
    this.isEditFormOpen = true;
    this.selectedDockyard = { ...dockyard };
  }

  deleteDockyardDetails(dockyard: Dockyard): void {
    this.showDeleteDialog = true;
    this.selectedDockyard = dockyard;
  }

  confirmDeletion() {
    const payload = { id: this.selectedDockyard.id, delete: true };
    this.apiService.post('master/dockyards/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Dockyard deleted successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.showDeleteDialog = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to delete dockyard');
      },
    });
  }

  cancelDeletion() {
    this.showDeleteDialog = false;
  }

  handleEditSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('Dockyard name is required');
      return;
    }

    if (!data.code?.trim()) {
      this.toastService.showError('Dockyard code is required');
      return;
    }

    const payload = {
      id: this.selectedDockyard.id,
      name: data.name,
      code: data.code,
      active: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/dockyards/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Updated Dockyard successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.closeDialog();
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to update dockyard');
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
    { field: 'name', header: 'Name', filterType: 'text' },
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
      body: this.dockyards.map((row: { [x: string]: any }) =>
        this.cols.map((col) => row[col.field] || '')
      ),
    });
    doc.save(`${this.tableName || 'dockyard'}.pdf`);
  }

  @Input() tableName: string = '';

  exportExcel() {
    this.exportCSVEvent.emit();
    const headers = this.cols.map((col) => col.header);
    const rows = this.dockyards.map((row: { [x: string]: any }) =>
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
    link.download = `${this.tableName || 'dockyard'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Handle data loaded from paginated table
  onDataLoaded(data: any[]): void {
    this.dockyards = data || [];
    this.filteredDockyards = [...(data || [])];
    this.cdr.detectChanges();
  }
}
