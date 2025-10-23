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

interface Country {
  id: number;
  name: string;
  code: string;
  active: number;
}

interface State {
  id: number;
  name: string;
  code: string;
  country_name?: string;
  country?: number;
  active: number; // 1 = Active, 2 = Inactive
  created_on: string;
}

@Component({
  selector: 'app-state',
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
  templateUrl: './state.component.html',
  styleUrl: './state.component.css'
})
export class StateComponent implements OnInit {
  searchText: string = '';
  states: State[] = [];
  countries: Country[] = [];
  selectedCountryId: number | null = null;
  isLoadingCountries: boolean = false;
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  showDeleteDialog: boolean = false;
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit State Master';
  title: string = 'Add New State Master';
  
  newState = {
    name: '',
    code: '',
    country: null,
    active: 1,
  };
  
  selectedState: State = {
    id: 0,
    name: '',
    code: '',
    active: 1,
    country: undefined,
    created_on: ''
  };

  formConfigForNewDetails: any[] = [
    {
      label: 'Country',
      key: 'country',
      type: 'select',
      required: true,
      options: [],
      onChange: (value: any) => this.handleCountryChange(value)
    },
    {
      label: 'State Name',
      key: 'name',
      type: 'text',
      required: true,
    },
    {
      label: 'State Code',
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

  filteredStates: State[] = [];
  toggleTable: boolean = true;

  // New properties for pagination
  apiUrl: string = 'master/states/';
  totalCount: number = 0;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService, 
    private location: Location, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchCountries();
    // Note: Table data will be loaded by the paginated table component
  }

  goBack() {
    this.location.back();
  }

  getStates(): void {
    this.apiService.get<any>('master/states/').subscribe({
      next: (response) => {
        if (response && response.results) {
          this.states = response.results;
          this.filteredStates = [...this.states];
        } else {
          this.states = response;
          this.filteredStates = [...this.states];
        }
      },
      error: (error) => {
        console.error('Error fetching states:', error);
      },
    });
  }

  fetchCountries(): void {
    this.isLoadingCountries = true;
    this.apiService.get<any>('master/countries/').subscribe({
      next: (response) => {
        // Handle different response formats
        let countriesData = [];
        if (response && response.data) {
          // Response format: {status: 200, data: [...]}
          countriesData = response.data;
        } else if (response && response.results) {
          // Response format: {count: 6, results: [...]}
          countriesData = response.results;
        } else if (Array.isArray(response)) {
          // Direct array response
          countriesData = response;
        }
        
        this.countries = countriesData;
        
        // Update form config with country options for dropdown
        this.formConfigForNewDetails[0].options = this.countries.map(country => ({
          value: country.id,
          label: country.name
        }));
      },
      error: (error) => {
        console.error('Error fetching countries:', error);
        this.toastService.showError('Failed to load countries');
        this.countries = [];
      },
      complete: () => {
        this.isLoadingCountries = false;
      }
    });
  }

  handleCountryChange(countryId: number): void {
    this.selectedCountryId = countryId;
  }

  // Search function
  filterStates() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.states = [...this.filteredStates];
      return;
    }

    this.states = this.filteredStates.filter(
      (state: State) =>
        state.name.toLowerCase().includes(search) ||
        (state.code && state.code.toLowerCase().includes(search)) ||
        (state.country_name && state.country_name.toLowerCase().includes(search))
    );
  }

  openAddState() {
    this.deptdisplayModal = true;
  }

  closeDialog() {
    this.deptdisplayModal = false;
    this.viewdisplayModal = false;
    this.showDeleteDialog = false;
    this.editdisplayModal = false;
    this.isFormOpen = false;
    this.isEditFormOpen = false;
    this.selectedState = {
      id: 0,
      name: '',
      code: '',
      active: 1,
      country: undefined,
      created_on: ''
    };
    this.selectedCountryId = null;
  }

  handleSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('State name is required');
      return;
    }

    if (!data.country) {
      this.toastService.showError('Country is required');
      return;
    }

    const payload = {
      name: data.name,
      code: data.code,
      country: parseInt(data.country),
      active: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/states/', payload).subscribe({
      next: (res: any) => {
        this.toastService.showSuccess(res.message || 'State added successfully');
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

  viewStateDetails(state: State) {
    this.viewdisplayModal = true;
    this.selectedState = state;
  }

  editStateDetails(state: State) {
    this.isEditFormOpen = true;
    this.selectedState = { ...state };
    
    // Set country for edit form
    if (state.country) {
      this.selectedState.country = state.country;
      this.selectedCountryId = state.country;
    }
  }

  deleteStateDetails(state: State): void {
    this.showDeleteDialog = true;
    this.selectedState = state;
  }

  confirmDeletion() {
    const payload = { id: this.selectedState.id, delete: true };
    this.apiService.post('master/states/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('State deleted successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.showDeleteDialog = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to delete state');
      },
    });
  }

  cancelDeletion() {
    this.showDeleteDialog = false;
  }

  handleEditSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('State name is required');
      return;
    }

    if (!data.country) {
      this.toastService.showError('Country is required');
      return;
    }

    const payload = {
      id: this.selectedState.id,
      name: data.name,
      code: data.code,
      country: parseInt(data.country),
      active: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/states/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Updated State successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.closeDialog();
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to update state');
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
    { field: 'name', header: 'State Name', filterType: 'text' },
    { field: 'code', header: 'Code', filterType: 'text' },
    { field: 'country_name', header: 'Country', filterType: 'text' },
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
      body: this.states.map((row: { [x: string]: any }) =>
        this.cols.map((col) => {
          if (col.field === 'active') {
            return row[col.field] === 1 ? 'Active' : 'Inactive';
          }
          return row[col.field] || '';
        })
      ),
    });
    doc.save(`${this.tableName || 'state'}.pdf`);
  }

  @Input() tableName: string = '';

  exportExcel() {
    this.exportCSVEvent.emit();
    const headers = this.cols.map((col) => col.header);
    const rows = this.states.map((row: { [x: string]: any }) =>
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
    link.download = `${this.tableName || 'state'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Handle data loaded from paginated table
  onDataLoaded(data: any[]): void {
    this.states = data || [];
    this.filteredStates = [...(data || [])];
    this.cdr.detectChanges();
  }
}
