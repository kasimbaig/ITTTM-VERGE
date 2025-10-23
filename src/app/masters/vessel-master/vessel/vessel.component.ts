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
}

interface VesselType {
  id: number;
  name: string;
}

interface Command {
  id: number;
  name: string;
}

interface Dockyard {
  id: number;
  name: string;
}

interface Vessel {
  id: number;
  name: string;
  code: string;
  classofvessel: VesselClass;
  vesseltype: VesselType;
  yard: Dockyard;
  command: Command;
  year_of_build?: number;
  year_of_delivery?: number;
  active: number;
}

@Component({
  selector: 'app-vessel',
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
  templateUrl: './vessel.component.html',
  styleUrl: './vessel.component.css'
})
export class VesselComponent implements OnInit {
  searchText: string = '';
  vessels: Vessel[] = [];
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  showDeleteDialog: boolean = false;
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit Vessel Master';
  title: string = 'Add New Vessel Master';
  
  newVessel = {
    name: '',
    code: '',
    classofvessel: null,
    vesseltype: null,
    command: null,
    yard: null,
    year_of_build: undefined,
    year_of_delivery: undefined,
    active: 1,
  };
  
  selectedVessel: Vessel = {
    id: 0,
    name: '',
    code: '',
    classofvessel: { id: 0, name: '' },
    vesseltype: { id: 0, name: '' },
    yard: { id: 0, name: '' },
    command: { id: 0, name: '' },
    year_of_build: undefined,
    year_of_delivery: undefined,
    active: 1
  };

  // Store dropdown options
  vesselClasses: VesselClass[] = [];
  vesselTypes: VesselType[] = [];
  commands: Command[] = [];
  dockyards: Dockyard[] = [];

  formConfigForNewDetails: any[] = [
    {
      label: 'Vessel Name',
      key: 'name',
      type: 'text',
      required: true,
    },
    {
      label: 'Vessel Code',
      key: 'code',
      type: 'text',
      required: false,
    },
    {
      label: 'Class of Vessel',
      key: 'classofvessel',
      type: 'select',
      required: true,
      options: []
    },
    {
      label: 'Vessel Type',
      key: 'vesseltype',
      type: 'select',
      required: true,
      options: []
    },
    {
      label: 'Command',
      key: 'command',
      type: 'select',
      required: true,
      options: []
    },
    {
      label: 'Dockyard',
      key: 'yard',
      type: 'select',
      required: false,
      options: []
    },
    {
      label: 'Year of Build',
      key: 'year_of_build',
      type: 'number',
      required: false,
    },
    {
      label: 'Year of Delivery',
      key: 'year_of_delivery',
      type: 'number',
      required: false,
    },
    {
      label: 'Status',
      key: 'status',
      type: 'checkbox',
      required: false,
    }
  ];

  filteredVessels: Vessel[] = [];
  toggleTable: boolean = true;

  // New properties for pagination
  apiUrl: string = 'master/vessels/';
  totalCount: number = 0;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService, 
    private location: Location, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchDropdownData();
  }

  goBack() {
    this.location.back();
  }

  // Fetch dropdown data
  fetchDropdownData(): void {
    // Fetch vessel classes
    this.apiService.get<any>('master/classofvessels/').subscribe({
      next: (response) => {
        const data = response.results || response.data || response;
        this.vesselClasses = data;
        this.updateFormConfigOptions('classofvessel', data);
      },
      error: (error) => {
        console.error('Error fetching vessel classes:', error);
      },
    });

    // Fetch vessel types
    this.apiService.get<any>('master/vesseltypes/').subscribe({
      next: (response) => {
        const data = response.results || response.data || response;
        this.vesselTypes = data;
        this.updateFormConfigOptions('vesseltype', data);
      },
      error: (error) => {
        console.error('Error fetching vessel types:', error);
      },
    });

    // Fetch commands
    this.apiService.get<any>('master/commands/').subscribe({
      next: (response) => {
        const data = response.results || response.data || response;
        this.commands = data;
        this.updateFormConfigOptions('command', data);
      },
      error: (error) => {
        console.error('Error fetching commands:', error);
      },
    });

    // Fetch dockyards
    this.apiService.get<any>('master/dockyards/').subscribe({
      next: (response) => {
        const data = response.results || response.data || response;
        this.dockyards = data;
        this.updateFormConfigOptions('yard', data);
      },
      error: (error) => {
        console.error('Error fetching dockyards:', error);
      },
    });
  }

  updateFormConfigOptions(fieldKey: string, data: any[]): void {
    const fieldIndex = this.formConfigForNewDetails.findIndex(field => field.key === fieldKey);
    if (fieldIndex !== -1) {
      this.formConfigForNewDetails[fieldIndex].options = data.map(item => ({
        label: item.name,
        value: item.id
      }));
    }
  }

  getVessels(): void {
    this.apiService.get<any>('master/vessels/').subscribe({
      next: (response) => {
        if (response && response.results) {
          this.vessels = response.results;
          this.filteredVessels = [...this.vessels];
        } else {
          this.vessels = response;
          this.filteredVessels = [...this.vessels];
        }
      },
      error: (error) => {
        console.error('Error fetching vessels:', error);
      },
    });
  }

  // Search function
  filterVessels() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.vessels = [...this.filteredVessels];
      return;
    }

    this.vessels = this.filteredVessels.filter(
      (vessel: Vessel) =>
        vessel.name.toLowerCase().includes(search) ||
        vessel.code.toLowerCase().includes(search) ||
        vessel.classofvessel?.name?.toLowerCase().includes(search) ||
        vessel.command?.name?.toLowerCase().includes(search)
    );
  }

  openAddVessel() {
    this.deptdisplayModal = true;
  }

  closeDialog() {
    this.deptdisplayModal = false;
    this.viewdisplayModal = false;
    this.showDeleteDialog = false;
    this.editdisplayModal = false;
    this.isFormOpen = false;
    this.isEditFormOpen = false;
    this.selectedVessel = {
      id: 0,
      name: '',
      code: '',
      classofvessel: { id: 0, name: '' },
      vesseltype: { id: 0, name: '' },
      yard: { id: 0, name: '' },
      command: { id: 0, name: '' },
      year_of_build: undefined,
      year_of_delivery: undefined,
      active: 1
    };
  }

  handleSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('Vessel name is required');
      return;
    }

    const payload = {
      name: data.name,
      code: data.code,
      classofvessel: data.classofvessel,
      vesseltype: data.vesseltype,
      command: data.command,
      yard: data.yard,
      year_of_build: data.year_of_build,
      year_of_delivery: data.year_of_delivery,
      active: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/vessels/', payload).subscribe({
      next: (res: any) => {
        this.toastService.showSuccess(res.message || 'Vessel added successfully');
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

  viewVesselDetails(vessel: Vessel) {
    this.viewdisplayModal = true;
    this.selectedVessel = vessel;
  }

  editVesselDetails(vessel: Vessel) {
    this.isEditFormOpen = true;
    this.selectedVessel = { ...vessel };
  }

  deleteVesselDetails(vessel: Vessel): void {
    this.showDeleteDialog = true;
    this.selectedVessel = vessel;
  }

  confirmDeletion() {
    const payload = { id: this.selectedVessel.id, delete: true };
    this.apiService.post('master/vessels/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Vessel deleted successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.showDeleteDialog = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to delete vessel');
      },
    });
  }

  cancelDeletion() {
    this.showDeleteDialog = false;
  }

  handleEditSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('Vessel name is required');
      return;
    }

    const payload = {
      id: this.selectedVessel.id,
      name: data.name,
      code: data.code,
      classofvessel: data.classofvessel,
      vesseltype: data.vesseltype,
      command: data.command,
      yard: data.yard,
      year_of_build: data.year_of_build,
      year_of_delivery: data.year_of_delivery,
      active: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/vessels/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Updated Vessel successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.closeDialog();
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to update vessel');
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
    { field: 'classofvessel', header: 'Class', filterType: 'text' },
    { field: 'vesseltype', header: 'Type', filterType: 'text' },
    { field: 'command', header: 'Command', filterType: 'text' },
    { field: 'yard', header: 'Dockyard', filterType: 'text' },
    { field: 'year_of_build', header: 'Year Built', filterType: 'text' },
    { field: 'year_of_delivery', header: 'Year Delivered', filterType: 'text' },
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
      body: this.vessels.map((row: { [x: string]: any }) =>
        this.cols.map((col) => {
          if (col.field === 'classofvessel') {
            return row['classofvessel']?.name || '';
          }
          if (col.field === 'vesseltype') {
            return row['vesseltype']?.name || '';
          }
          if (col.field === 'command') {
            return row['command']?.name || '';
          }
          if (col.field === 'yard') {
            return row['yard']?.name || '';
          }
          return row[col.field] || '';
        })
      ),
    });
    doc.save(`${this.tableName || 'vessel'}.pdf`);
  }

  @Input() tableName: string = '';

  exportExcel() {
    this.exportCSVEvent.emit();
    const headers = this.cols.map((col) => col.header);
    const rows = this.vessels.map((row: { [x: string]: any }) =>
      this.cols.map((col) => {
        if (col.field === 'classofvessel') {
          return row['classofvessel']?.name || '';
        }
        if (col.field === 'vesseltype') {
          return row['vesseltype']?.name || '';
        }
        if (col.field === 'command') {
          return row['command']?.name || '';
        }
        if (col.field === 'yard') {
          return row['yard']?.name || '';
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
    link.download = `${this.tableName || 'vessel'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Handle data loaded from paginated table
  onDataLoaded(data: any[]): void {
    this.vessels = data || [];
    this.filteredVessels = [...(data || [])];
    this.cdr.detectChanges();
  }
}
