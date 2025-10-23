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

interface Equipment {
  id: number;
  name: string;
  code?: string;
  active: number; // 1 = Active, 2 = Inactive
  createdBy: string;
  created_on: string;
}

@Component({
  selector: 'app-equipment',
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
  templateUrl: './equipment.component.html',
  styleUrl: './equipment.component.css'
})
export class EquipmentComponent implements OnInit {
  searchText: string = '';
  equipments: Equipment[] = [];
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  showDeleteDialog: boolean = false;
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit Equipment Master';
  title: string = 'Add New Equipment Master';
  
  newEquipment = {
    name: '',
    code: '',
    active: 1,
  };
  
  selectedEquipment: Equipment = {
    id: 0,
    name: '',
    code: '',
    active: 1,
    createdBy: '',
    created_on: ''
  };

  formConfigForNewDetails: any[] = [
    {
      label: 'Equipment Name',
      key: 'name',
      type: 'text',
      required: true,
    },
    {
      label: 'Equipment Code',
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

  filteredEquipments: Equipment[] = [];
  toggleTable: boolean = true;

  // New properties for pagination
  apiUrl: string = 'master/equipments/';
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

  getEquipments(): void {
    this.apiService.get<any>('master/equipments/').subscribe({
      next: (response) => {
        if (response && response.results) {
          this.equipments = response.results;
          this.filteredEquipments = [...this.equipments];
        } else {
          this.equipments = response;
          this.filteredEquipments = [...this.equipments];
        }
      },
      error: (error) => {
        console.error('Error fetching equipments:', error);
      },
    });
  }

  // Search function
  filterEquipments() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.equipments = [...this.filteredEquipments];
      return;
    }

    this.equipments = this.filteredEquipments.filter(
      (equipment: Equipment) =>
        equipment.name.toLowerCase().includes(search) ||
        (equipment.code && equipment.code.toLowerCase().includes(search))
    );
  }

  openAddEquipment() {
    this.deptdisplayModal = true;
  }

  closeDialog() {
    this.deptdisplayModal = false;
    this.viewdisplayModal = false;
    this.showDeleteDialog = false;
    this.editdisplayModal = false;
    this.isFormOpen = false;
    this.isEditFormOpen = false;
    this.selectedEquipment = {
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
      this.toastService.showError('Equipment name is required');
      return;
    }

    const payload = {
      name: data.name,
      code: data.code,
      active: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/equipments/', payload).subscribe({
      next: (res: any) => {
        this.toastService.showSuccess(res.message || 'Equipment added successfully');
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

  viewEquipmentDetails(equipment: Equipment) {
    this.viewdisplayModal = true;
    this.selectedEquipment = equipment;
  }

  editEquipmentDetails(equipment: Equipment) {
    this.isEditFormOpen = true;
    this.selectedEquipment = { ...equipment };
  }

  deleteEquipmentDetails(equipment: Equipment): void {
    this.showDeleteDialog = true;
    this.selectedEquipment = equipment;
  }

  confirmDeletion() {
    const payload = { id: this.selectedEquipment.id, delete: true };
    this.apiService.post('master/equipments/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Equipment deleted successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.showDeleteDialog = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to delete equipment');
      },
    });
  }

  cancelDeletion() {
    this.showDeleteDialog = false;
  }

  handleEditSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('Equipment name is required');
      return;
    }

    const payload = {
      id: this.selectedEquipment.id,
      name: data.name,
      code: data.code,
      active: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/equipments/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Updated Equipment successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.closeDialog();
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to update equipment');
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
    { field: 'name', header: 'Equipment Name', filterType: 'text' },
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
      body: this.equipments.map((row: { [x: string]: any }) =>
        this.cols.map((col) => {
          if (col.field === 'active') {
            return row[col.field] === 1 ? 'Active' : 'Inactive';
          }
          return row[col.field] || '';
        })
      ),
    });
    doc.save(`${this.tableName || 'equipment'}.pdf`);
  }

  @Input() tableName: string = '';

  exportExcel() {
    this.exportCSVEvent.emit();
    const headers = this.cols.map((col) => col.header);
    const rows = this.equipments.map((row: { [x: string]: any }) =>
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
    link.download = `${this.tableName || 'equipment'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Handle data loaded from paginated table
  onDataLoaded(data: any[]): void {
    this.equipments = data || [];
    this.filteredEquipments = [...(data || [])];
    this.cdr.detectChanges();
  }
}
