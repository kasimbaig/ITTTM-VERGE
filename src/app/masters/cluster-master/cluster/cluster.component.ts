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

interface Vessel {
  id: number;
  name: string;
  code: string;
  active: number;
}

interface Compartment {
  id: number;
  name: string;
  code: string;
  active: number;
}

interface Cluster {
  id: number;
  name: string;
  code: string;
  vessel_name?: string;
  compartment_name?: string;
  project_name?: string;
  vessel?: number;
  compartment?: number;
  active: number; // 1 = Active, 2 = Inactive
  created_on: string;
}

@Component({
  selector: 'app-cluster',
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
  templateUrl: './cluster.component.html',
  styleUrl: './cluster.component.css'
})
export class ClusterComponent implements OnInit {
  searchText: string = '';
  clusters: Cluster[] = [];
  vessels: Vessel[] = [];
  compartments: Compartment[] = [];
  isLoadingVessels: boolean = false;
  isLoadingCompartments: boolean = false;
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  showDeleteDialog: boolean = false;
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit Cluster Master';
  title: string = 'Add New Cluster Master';
  
  newCluster = {
    name: '',
    code: '',
    vessel: '',
    compartment: '',
    project_name: '',
    active: 1,
  };
  
  selectedCluster: Cluster = {
    id: 0,
    name: '',
    code: '',
    vessel_name: '',
    compartment_name: '',
    project_name: '',
    vessel: 0,
    compartment: 0,
    active: 1,
    created_on: ''
  };

  formConfigForNewDetails: any[] = [
    {
      label: 'Cluster Name',
      key: 'name',
      type: 'text',
      required: true,
    },
    {
      label: 'Cluster Code',
      key: 'code',
      type: 'text',
      required: false,
    },
    {
      label: 'Vessel',
      key: 'vessel',
      type: 'select',
      required: true,
      options: []
    },
    {
      label: 'Compartment',
      key: 'compartment',
      type: 'select',
      required: true,
      options: []
    },
    {
      label: 'Project Name',
      key: 'project_name',
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

  filteredClusters: Cluster[] = [];
  toggleTable: boolean = true;

  // New properties for pagination
  apiUrl: string = 'master/clusters/';
  totalCount: number = 0;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService, 
    private location: Location, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchVessels();
    this.fetchCompartments();
  }

  goBack() {
    this.location.back();
  }

  // Fetch vessels from API
  fetchVessels(): void {
    this.isLoadingVessels = true;
    this.apiService.get<any>('master/vessels/').subscribe({
      next: (response) => {
        const vesselsData = response.results || response.data || [];
        this.vessels = vesselsData;
        this.updateVesselOptions();
      },
      error: (error) => {
        console.error('Failed to fetch vessels:', error);
        this.toastService.showError('Failed to fetch vessels');
        this.vessels = [];
        this.updateVesselOptions();
      },
      complete: () => {
        this.isLoadingVessels = false;
      }
    });
  }

  // Fetch compartments from API
  fetchCompartments(): void {
    this.isLoadingCompartments = true;
    this.apiService.get<any>('master/compartments/').subscribe({
      next: (response) => {
        const compartmentsData = response.results || response.data || [];
        this.compartments = compartmentsData;
        this.updateCompartmentOptions();
      },
      error: (error) => {
        console.error('Failed to fetch compartments:', error);
        this.toastService.showError('Failed to fetch compartments');
        this.compartments = [];
        this.updateCompartmentOptions();
      },
      complete: () => {
        this.isLoadingCompartments = false;
      }
    });
  }

  // Update vessel dropdown options
  updateVesselOptions(): void {
    const vesselField = this.formConfigForNewDetails.find(field => field.key === 'vessel');
    if (vesselField) {
      if (this.isLoadingVessels) {
        vesselField.options = [{ value: 'loading', label: 'Loading vessels...' }];
      } else if (this.vessels.length === 0) {
        vesselField.options = [{ value: 'no-vessels', label: 'No vessels available' }];
      } else {
        vesselField.options = this.vessels.map(vessel => ({
          value: vessel.id,
          label: vessel.name
        }));
      }
    }
  }

  // Update compartment dropdown options
  updateCompartmentOptions(): void {
    const compartmentField = this.formConfigForNewDetails.find(field => field.key === 'compartment');
    if (compartmentField) {
      if (this.isLoadingCompartments) {
        compartmentField.options = [{ value: 'loading', label: 'Loading compartments...' }];
      } else if (this.compartments.length === 0) {
        compartmentField.options = [{ value: 'no-compartments', label: 'No compartments available' }];
      } else {
        compartmentField.options = this.compartments.map(compartment => ({
          value: compartment.id,
          label: compartment.name
        }));
      }
    }
  }

  getClusters(): void {
    this.apiService.get<any>('master/clusters/').subscribe({
      next: (response) => {
        if (response && response.results) {
          this.clusters = response.results;
          this.filteredClusters = [...this.clusters];
        } else {
          this.clusters = response;
          this.filteredClusters = [...this.clusters];
        }
      },
      error: (error) => {
        console.error('Error fetching clusters:', error);
      },
    });
  }

  // Search function
  filterClusters() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.clusters = [...this.filteredClusters];
      return;
    }

    this.clusters = this.filteredClusters.filter(
      (cluster: Cluster) =>
        cluster.name.toLowerCase().includes(search) ||
        cluster.code.toLowerCase().includes(search) ||
        (cluster.vessel_name && cluster.vessel_name.toLowerCase().includes(search)) ||
        (cluster.compartment_name && cluster.compartment_name.toLowerCase().includes(search)) ||
        (cluster.project_name && cluster.project_name.toLowerCase().includes(search))
    );
  }

  openAddCluster() {
    this.deptdisplayModal = true;
  }

  closeDialog() {
    this.deptdisplayModal = false;
    this.viewdisplayModal = false;
    this.showDeleteDialog = false;
    this.editdisplayModal = false;
    this.isFormOpen = false;
    this.isEditFormOpen = false;
    this.selectedCluster = {
      id: 0,
      name: '',
      code: '',
      vessel_name: '',
      compartment_name: '',
      project_name: '',
      vessel: 0,
      compartment: 0,
      active: 1,
      created_on: ''
    };
  }

  handleSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('Cluster name is required');
      return;
    }

    if (!data.vessel) {
      this.toastService.showError('Vessel selection is required');
      return;
    }

    if (!data.compartment) {
      this.toastService.showError('Compartment selection is required');
      return;
    }

    const payload = {
      name: data.name,
      code: data.code,
      vessel: parseInt(data.vessel),
      compartment: parseInt(data.compartment),
      project_name: data.project_name,
      active: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/clusters/', payload).subscribe({
      next: (res: any) => {
        this.toastService.showSuccess(res.message || 'Cluster added successfully');
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

  viewClusterDetails(cluster: Cluster) {
    this.viewdisplayModal = true;
    this.selectedCluster = cluster;
  }

  editClusterDetails(cluster: Cluster) {
    this.isEditFormOpen = true;
    this.selectedCluster = { ...cluster };
  }

  deleteClusterDetails(cluster: Cluster): void {
    this.showDeleteDialog = true;
    this.selectedCluster = cluster;
  }

  confirmDeletion() {
    const payload = { id: this.selectedCluster.id, delete: true };
    this.apiService.post('master/clusters/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Cluster deleted successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.showDeleteDialog = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to delete cluster');
      },
    });
  }

  cancelDeletion() {
    this.showDeleteDialog = false;
  }

  handleEditSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('Cluster name is required');
      return;
    }

    if (!data.vessel) {
      this.toastService.showError('Vessel selection is required');
      return;
    }

    if (!data.compartment) {
      this.toastService.showError('Compartment selection is required');
      return;
    }

    const payload = {
      id: this.selectedCluster.id,
      name: data.name,
      code: data.code,
      vessel: parseInt(data.vessel),
      compartment: parseInt(data.compartment),
      project_name: data.project_name,
      active: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/clusters/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Updated Cluster successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.closeDialog();
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to update cluster');
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
    { field: 'vessel_name', header: 'Vessel', filterType: 'text' },
    { field: 'compartment_name', header: 'Compartment', filterType: 'text' },
    { field: 'project_name', header: 'Project', filterType: 'text' },
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
      body: this.clusters.map((row: { [x: string]: any }) =>
        this.cols.map((col) => row[col.field] || '')
      ),
    });
    doc.save(`${this.tableName || 'cluster'}.pdf`);
  }

  @Input() tableName: string = '';

  exportExcel() {
    this.exportCSVEvent.emit();
    const headers = this.cols.map((col) => col.header);
    const rows = this.clusters.map((row: { [x: string]: any }) =>
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
    link.download = `${this.tableName || 'cluster'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Handle data loaded from paginated table
  onDataLoaded(data: any[]): void {
    this.clusters = data || [];
    this.filteredClusters = [...(data || [])];
    this.cdr.detectChanges();
  }
}
