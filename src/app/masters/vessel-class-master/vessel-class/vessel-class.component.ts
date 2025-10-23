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

interface VesselClass {
  id: number;
  name: string;
  code?: string;
  active: number; // 1 = Active, 2 = Inactive
  createdBy: string;
  created_on: string;
}

@Component({
  selector: 'app-vessel-class',
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
  templateUrl: './vessel-class.component.html',
  styleUrl: './vessel-class.component.css'
})
export class VesselClassComponent implements OnInit {
  searchText: string = '';
  vesselClasses: VesselClass[] = [];
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  showDeleteDialog: boolean = false;
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit Vessel Class Master';
  title: string = 'Add New Vessel Class Master';
  
  newVesselClass = {
    name: '',
    code: '',
    active: 1,
  };
  
  selectedVesselClass: VesselClass = {
    id: 0,
    name: '',
    code: '',
    active: 1,
    createdBy: '',
    created_on: ''
  };

  formConfigForNewDetails: any[] = [
    {
      label: 'Vessel Class Name',
      key: 'name',
      type: 'text',
      required: true,
    },
    {
      label: 'Vessel Class Code',
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

  filteredVesselClasses: VesselClass[] = [];
  toggleTable: boolean = true;

  // New properties for pagination
  apiUrl: string = 'master/classofvessels/';
  totalCount: number = 0;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService, 
    private location: Location, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Note: Table data will be loaded by the paginated table component
    // No need to call getVesselClasses() here
  }

  goBack() {
    this.location.back();
  }

  getVesselClasses(): void {
    this.apiService.get<any>('master/classofvessels/').subscribe({
      next: (response) => {
        if (response && response.results) {
          this.vesselClasses = response.results;
          this.filteredVesselClasses = [...this.vesselClasses];
        } else {
          this.vesselClasses = response;
          this.filteredVesselClasses = [...this.vesselClasses];
        }
      },
      error: (error) => {
        console.error('Error fetching vessel classes:', error);
      },
    });
  }

  // Search function
  filterVesselClasses() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.vesselClasses = [...this.filteredVesselClasses];
      return;
    }

    this.vesselClasses = this.filteredVesselClasses.filter(
      (vesselClass: VesselClass) =>
        vesselClass.name.toLowerCase().includes(search) ||
        (vesselClass.code && vesselClass.code.toLowerCase().includes(search))
    );
  }

  openAddVesselClass() {
    this.deptdisplayModal = true;
  }

  closeDialog() {
    this.deptdisplayModal = false;
    this.viewdisplayModal = false;
    this.showDeleteDialog = false;
    this.editdisplayModal = false;
    this.isFormOpen = false;
    this.isEditFormOpen = false;
    this.selectedVesselClass = {
      id: 0,
      name: '',
      code: '',
      active: 1,
      createdBy: '',
      created_on: ''
    };
  }

  handleSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('Vessel class name is required');
      return;
    }

    const payload = {
      name: data.name,
      code: data.code,
      active: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/classofvessels/', payload).subscribe({
      next: (res: any) => {
        this.toastService.showSuccess(res.message || 'Vessel class added successfully');
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

  viewVesselClassDetails(vesselClass: VesselClass) {
    this.viewdisplayModal = true;
    this.selectedVesselClass = vesselClass;
  }

  editVesselClassDetails(vesselClass: VesselClass) {
    this.isEditFormOpen = true;
    this.selectedVesselClass = { ...vesselClass };
  }

  deleteVesselClassDetails(vesselClass: VesselClass): void {
    this.showDeleteDialog = true;
    this.selectedVesselClass = vesselClass;
  }

  confirmDeletion() {
    const payload = { id: this.selectedVesselClass.id, delete: true };
    this.apiService.post('master/classofvessels/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Vessel class deleted successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.showDeleteDialog = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to delete vessel class');
      },
    });
  }

  cancelDeletion() {
    this.showDeleteDialog = false;
  }

  handleEditSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('Vessel class name is required');
      return;
    }

    const payload = {
      id: this.selectedVesselClass.id,
      name: data.name,
      code: data.code,
      active: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/classofvessels/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Updated Vessel Class successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.closeDialog();
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to update vessel class');
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
    { field: 'name', header: 'Vessel Class Name', filterType: 'text' },
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
      body: this.vesselClasses.map((row: { [x: string]: any }) =>
        this.cols.map((col) => row[col.field] || '')
      ),
    });
    doc.save(`${this.tableName || 'vessel-class'}.pdf`);
  }

  @Input() tableName: string = '';

  exportExcel() {
    this.exportCSVEvent.emit();
    const headers = this.cols.map((col) => col.header);
    const rows = this.vesselClasses.map((row: { [x: string]: any }) =>
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
    link.download = `${this.tableName || 'vessel-class'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Handle data loaded from paginated table
  onDataLoaded(data: any[]): void {
    this.vesselClasses = data || [];
    this.filteredVesselClasses = [...(data || [])];
    this.cdr.detectChanges();
  }
}
