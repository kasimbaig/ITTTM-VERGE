import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { CommonModule, Location } from '@angular/common';
import { forkJoin } from 'rxjs';
import { PaginatedTableComponent } from '../../shared/components/paginated-table/paginated-table.component';
import { AddFormComponent } from '../../shared/components/add-form/add-form.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { DeleteConfirmationModalComponent } from '../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';

export interface FormFieldConfig {
  label: string;
  key: string;
  type: 'text' | 'select' | 'checkbox' | 'file' | 'textarea';
  required: boolean;
  options?: { label: string; value: any }[];
  fullWidth?: boolean;
}

@Component({
  selector: 'app-establishment-master',
  standalone: true,
  imports: [
    TableModule,
    DialogModule,
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
  templateUrl: './establishment-master.component.html',
  styleUrl: './establishment-master.component.css',
})
export class EstablishmentComponent implements OnInit {
  searchText: string = '';
  establishments: any = [];
  showDeleteDialog: boolean = false;
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit Establishment Master';
  title: string = 'Add New Establishment';

  newEstablishment: any = {};
  selectedEstablishment: any = {};
  filteredEstablishments: any = [];

  formConfig: FormFieldConfig[] = [
    {
      label: 'Establishment Name',
      key: 'name',
      type: 'text',
      required: true,
    },
    {
      label: 'Establishment Category',
      key: 'establishment_category',
      type: 'select',
      options: [
        { label: 'Military', value: 'military' },
        { label: 'Civilian', value: 'civilian' },
        { label: 'Joint Operations', value: 'joint' },
      ],
      required: true,
    },
    {
      label: 'Command',
      key: 'command',
      type: 'select',
      options: [],
      required: true,
    },
    {
      label: 'Ops Authority',
      key: 'ops_authority',
      type: 'select',
      options: [],
      required: true,
    },
  ];

  // New properties for pagination
  apiUrl: string = 'master/establishments/';
  totalCount: number = 0;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    //console.log('🚢 Establishment Component Initializing...');
    //console.log('API URL:', this.apiUrl);
    //console.log('Total Count:', this.totalCount);
    //console.log('Enable URL Fetching: true');
    
    // Load master data for dropdowns (but not establishments data - paginated table will handle that)
    this.loadInitialData();
    
    // Note: Table data will be loaded by the paginated table component
    // No need to call getEstablishments() here
  }

  goBack() {
    this.location.back();
  }

  loadInitialData(): void {
    forkJoin({
      establishments: this.apiService.get<any>('master/establishments/'),
      commands: this.apiService.get<any[]>('master/command/?is_dropdown=true'),
      opsAuthorities: this.apiService.get<any[]>('master/ops-authority/?is_dropdown=true'),
    }).subscribe({
      next: (response) => {
        // Handle paginated response structure for establishments
        if (response.establishments && response.establishments.results) {
          this.establishments = response.establishments.results;
        } else {
          this.establishments = response.establishments?.data || [];
        }
        this.filteredEstablishments = [...this.establishments];

        const commandConfig = this.formConfig.find((c) => c.key === 'command');
        if (commandConfig) {
          commandConfig.options = response.commands.map((item) => ({
            label: item.name,
            value: item.id,
          }));
        }

        const opsAuthorityConfig = this.formConfig.find(
          (c) => c.key === 'ops_authority'
        );
        if (opsAuthorityConfig) {
          opsAuthorityConfig.options = response.opsAuthorities.map((item) => ({
            label: item.authority,
            value: item.id,
          }));
        }
      },
      error: (error) => {
        console.error('Error fetching initial data:', error);
        this.toastService.showError('Error fetching initial data');
      },
    });
  }

  getEstablishments(): void {
    this.apiService.get<any>('master/establishments/').subscribe({
      next: (response) => {
        // Handle paginated response structure
        if (response && response.results) {
          this.establishments = response.results;
        } else {
          this.establishments = response?.data || [];
        }
        this.filteredEstablishments = [...this.establishments];
      },
      error: (error) => {
        console.error('Error fetching establishments:', error);
        this.toastService.showError('Error fetching establishments');
      },
    });
  }

  filterEstablishments() {
    const search = this.searchText.toLowerCase().trim();
    if (!search) {
      this.establishments = [...this.filteredEstablishments];
      return;
    }

    this.establishments = this.filteredEstablishments.filter(
      (establishment: {
        name: string;
        establishment_category: string;
        command_name?: string;
        ops_authority_name?: string;
      }) =>
        establishment.name.toLowerCase().includes(search) ||
        establishment.establishment_category.toLowerCase().includes(search) ||
        establishment.command_name?.toLowerCase().includes(search) ||
        establishment.ops_authority_name?.toLowerCase().includes(search)
    );
  }

  toggleForm(open: boolean) {
    this.isFormOpen = open;
    this.newEstablishment = {};
  }

  handleSubmit(data: any) {
    this.apiService.post(`master/establishments/`, data).subscribe({
      next: (res: any) => {
        this.toastService.showSuccess(
          res.message || 'Establishment added successfully'
        );
        // Refresh the data after successful addition
        this.getEstablishments();
        this.closeDialog();
      },
      error: (err) => {
        const errorMsg = err?.error?.error || 'Something went wrong';
        this.toastService.showError(errorMsg);
      },
    });
  }
rowdata:any
  editEstablishmentDetails(establishment: any) {
    this.isEditFormOpen = true;
    this.rowdata = establishment;
    
    // Map the establishment_category from display value to form value
    let categoryValue = establishment.establishment_category;
    if (establishment.establishment_category === 'Military') {
      categoryValue = 'military';
    } else if (establishment.establishment_category === 'Civilian') {
      categoryValue = 'civilian';
    } else if (establishment.establishment_category === 'Joint Operations') {
      categoryValue = 'joint';
    }
    
    this.selectedEstablishment = {
      ...establishment,
      name: establishment.name,
      establishment_category: categoryValue,
      command: establishment.command,
      ops_authority: establishment.ops_authority,
    };
    //console.log('Edit Data:', this.selectedEstablishment); // For debugging
  }

  handleEditSubmit(data: any) {
    this.apiService.put(`master/establishments/${this.rowdata.id}/`, data).subscribe({
      next: (res: any) => {
        this.toastService.showSuccess(
          res.message || 'Updated Establishment successfully'
        );
        // Refresh the data after successful edit
        this.getEstablishments();
        this.closeDialog();
      },
      error: (err) => {
        const errorMsg = err?.error?.error || 'Error updating establishment';
        this.toastService.showError(errorMsg);
      },
    });
  }

  deleteEstablishmentDetails(establishment: any): void {
    this.showDeleteDialog = true;
    this.selectedEstablishment = establishment;
  }

  confirmDeletion() {
    this.apiService
      .delete(`master/establishments/${this.selectedEstablishment.id}/`)
      .subscribe({
        next: (data: any) => {
          this.toastService.showSuccess('Establishment deleted successfully');
          // Refresh the data after successful deletion
          this.getEstablishments();
          this.showDeleteDialog = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.toastService.showError('Error deleting establishment');
        },
      });
  }

  cancelDeletion() {
    this.showDeleteDialog = false;
  }

  closeDialog() {
    this.showDeleteDialog = false;
    this.isFormOpen = false;
    this.isEditFormOpen = false;
    this.selectedEstablishment = {};
    this.newEstablishment = {};
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

  // Handle data loaded from paginated table
  onDataLoaded(data: any[]): void {
    //console.log('🚢 Data loaded from paginated table:', data);
    //console.log('🚢 Data length:', data?.length);
    //console.log('🚢 Data type:', typeof data);
    //console.log('🚢 First record:', data?.[0]);
    
    this.establishments = data || [];
    this.filteredEstablishments = [...(data || [])];
    
    //console.log('🚢 Establishments array updated:', this.establishments);
    //console.log('🚢 Filtered establishments updated:', this.filteredEstablishments);
    
    // Force change detection
    this.cdr.detectChanges();
  }

  // Updated columns to match the API response structure
  cols = [
    { field: 'name', header: 'Establishment Name', filterType: 'text' },
    // { field: 'establishment_category', header: 'Establishment Category' },
    { field: 'command_name', header: 'Command Name', filterType: 'text' },
    { field: 'ops_authority.authority', header: 'Ops Authority ', filterType: 'text' },
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
  @Input() tableName: string = '';

  exportPDF() {
    this.exportPDFEvent.emit();
    const doc = new jsPDF();
    autoTable(doc, {
      head: [this.cols.map((col) => col.header)],
      body: this.establishments.map((row: { [x: string]: any }) =>
        this.cols.map((col) => row[col.field] || '')
      ),
    });
    doc.save(`${this.tableName || 'establishments'}.pdf`);
  }

  exportExcel() {
    this.exportCSVEvent.emit();
    const headers = this.cols.map((col) => col.header);
    const rows = this.establishments.map((row: { [x: string]: any }) =>
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
    link.download = `${this.tableName || 'establishments'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}