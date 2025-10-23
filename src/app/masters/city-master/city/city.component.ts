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
  state_name?: string;
  country?: number;
  active: number;
}

interface City {
  id: number;
  name: string;
  code: string;
  state_name?: string;
  country_name?: string;
  state?: number;
  country?: number;
  active: number; // 1 = Active, 2 = Inactive
  created_on: string;
}

@Component({
  selector: 'app-city',
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
  templateUrl: './city.component.html',
  styleUrl: './city.component.css'
})
export class CityComponent implements OnInit {
  searchText: string = '';
  cities: City[] = [];
  countries: Country[] = [];
  states: State[] = [];
  selectedCountryId: number | null = null;
  isLoadingCountries: boolean = false;
  isLoadingStates: boolean = false;
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  showDeleteDialog: boolean = false;
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit City Master';
  title: string = 'Add New City Master';
  
  newCity = {
    name: '',
    code: '',
    country: null,
    state: null,
    active: 1,
  };
  
  selectedCity: City = {
    id: 0,
    name: '',
    code: '',
    active: 1,
    state: undefined,
    country: undefined,
    created_on: ''
  };

  formConfigForNewDetails: any[] = [
    {
      label: 'Country',
      key: 'country',
      type: 'select',
      required: true,
      options: []
    },
    {
      label: 'State',
      key: 'state',
      type: 'select',
      required: true,
      options: []
    },
    {
      label: 'City Name',
      key: 'name',
      type: 'text',
      required: true,
    },
    {
      label: 'City Code',
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

  filteredCities: City[] = [];
  toggleTable: boolean = true;

  // New properties for pagination
  apiUrl: string = 'master/cities/';
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

  getCities(): void {
    this.apiService.get<any>('master/cities/').subscribe({
      next: (response) => {
        if (response && response.results) {
          this.cities = response.results;
          this.filteredCities = [...this.cities];
        } else {
          this.cities = response;
          this.filteredCities = [...this.cities];
        }
      },
      error: (error) => {
        console.error('Error fetching cities:', error);
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

  fetchStates(countryId?: number): void {
    console.log('fetchStates called with countryId:', countryId);
    this.isLoadingStates = true;
    const endpoint = countryId ? `master/states/?country=${countryId}` : 'master/states/';
    console.log('API endpoint:', endpoint);
    
    this.apiService.get<any>(endpoint).subscribe({
      next: (response) => {
        console.log('States API response:', response);
        // Handle different response formats
        let statesData = [];
        if (response && response.data) {
          // Response format: {status: 200, data: [...]}
          statesData = response.data;
        } else if (response && response.results) {
          // Response format: {count: 6, results: [...]}
          statesData = response.results;
        } else if (Array.isArray(response)) {
          // Direct array response
          statesData = response;
        }
        
        console.log('Processed states data:', statesData);
        this.states = statesData;
        
        // Update form config with state options for dropdown
        const stateOptions = this.states.map(state => ({
          value: state.id,
          label: state.name || state.state_name || 'Unknown State' // Fallback to state_name if name is not available
        }));
        
        // Create a new formConfig array to trigger change detection
        this.formConfigForNewDetails = [
          ...this.formConfigForNewDetails.slice(0, 1), // Keep country config
          {
            ...this.formConfigForNewDetails[1], // Keep state config properties
            options: stateOptions // Update with new options
          },
          ...this.formConfigForNewDetails.slice(2) // Keep rest of config
        ];
        
        console.log('Updated state options:', stateOptions);
        console.log('Updated formConfig:', this.formConfigForNewDetails);
        
        // Force change detection
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching states:', error);
        this.toastService.showError('Failed to load states');
        this.states = [];
        
        // Clear state options by creating new formConfig
        this.formConfigForNewDetails = [
          ...this.formConfigForNewDetails.slice(0, 1), // Keep country config
          {
            ...this.formConfigForNewDetails[1], // Keep state config properties
            options: [] // Clear options
          },
          ...this.formConfigForNewDetails.slice(2) // Keep rest of config
        ];
      },
      complete: () => {
        this.isLoadingStates = false;
        console.log('States loading completed');
      }
    });
  }

  handleSelectChange(event: { key: string; value: any; selectedOption: any; formData: any }): void {
    console.log('Select change event:', event);
    
    if (event.key === 'country') {
      const countryId = parseInt(event.value);
      console.log('Country changed to:', countryId);
      this.selectedCountryId = countryId;
      
      // Clear states only if no country selected
      if (!countryId) {
        console.log('No country selected, clearing states');
        this.states = [];
        
        // Clear state options by creating new formConfig
        this.formConfigForNewDetails = [
          ...this.formConfigForNewDetails.slice(0, 1), // Keep country config
          {
            ...this.formConfigForNewDetails[1], // Keep state config properties
            options: [] // Clear options
          },
          ...this.formConfigForNewDetails.slice(2) // Keep rest of config
        ];
      } else {
        console.log('Fetching states for country:', countryId);
        // Fetch states for the selected country
        this.fetchStates(countryId);
      }
    }
  }

  handleCountryChange(countryId: number): void {
    console.log('Country changed to:', countryId);
    this.selectedCountryId = countryId;
    // Clear states only if no country selected
    if (!countryId) {
      console.log('No country selected, clearing states');
      this.states = [];
      
      // Clear state options by creating new formConfig
      this.formConfigForNewDetails = [
        ...this.formConfigForNewDetails.slice(0, 1), // Keep country config
        {
          ...this.formConfigForNewDetails[1], // Keep state config properties
          options: [] // Clear options
        },
        ...this.formConfigForNewDetails.slice(2) // Keep rest of config
      ];
    } else {
      console.log('Fetching states for country:', countryId);
      // Fetch states for the selected country
      this.fetchStates(countryId);
    }
  }

  // Search function
  filterCities() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.cities = [...this.filteredCities];
      return;
    }

    this.cities = this.filteredCities.filter(
      (city: City) =>
        city.name.toLowerCase().includes(search) ||
        (city.code && city.code.toLowerCase().includes(search)) ||
        (city.state_name && city.state_name.toLowerCase().includes(search)) ||
        (city.country_name && city.country_name.toLowerCase().includes(search))
    );
  }

  openAddCity() {
    this.deptdisplayModal = true;
  }

  closeDialog() {
    this.deptdisplayModal = false;
    this.viewdisplayModal = false;
    this.showDeleteDialog = false;
    this.editdisplayModal = false;
    this.isFormOpen = false;
    this.isEditFormOpen = false;
    this.selectedCity = {
      id: 0,
      name: '',
      code: '',
      active: 1,
      state: undefined,
      country: undefined,
      created_on: ''
    };
    this.selectedCountryId = null;
    this.states = [];
  }

  handleSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('City name is required');
      return;
    }

    if (!data.country) {
      this.toastService.showError('Country is required');
      return;
    }

    if (!data.state) {
      this.toastService.showError('State is required');
      return;
    }

    const payload = {
      name: data.name,
      code: data.code,
      country: parseInt(data.country),
      state: parseInt(data.state),
      active: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/cities/', payload).subscribe({
      next: (res: any) => {
        this.toastService.showSuccess(res.message || 'City added successfully');
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

  viewCityDetails(city: City) {
    this.viewdisplayModal = true;
    this.selectedCity = city;
  }

  editCityDetails(city: City) {
    this.isEditFormOpen = true;
    this.selectedCity = { ...city };
    
    // Set country and state for edit form
    if (city.country) {
      this.selectedCity.country = city.country;
      this.selectedCountryId = city.country;
      this.fetchStates(city.country);
    }
    if (city.state) {
      this.selectedCity.state = city.state;
    }
  }

  deleteCityDetails(city: City): void {
    this.showDeleteDialog = true;
    this.selectedCity = city;
  }

  confirmDeletion() {
    const payload = { id: this.selectedCity.id, delete: true };
    this.apiService.post('master/cities/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('City deleted successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.showDeleteDialog = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to delete city');
      },
    });
  }

  cancelDeletion() {
    this.showDeleteDialog = false;
  }

  handleEditSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('City name is required');
      return;
    }

    if (!data.country) {
      this.toastService.showError('Country is required');
      return;
    }

    if (!data.state) {
      this.toastService.showError('State is required');
      return;
    }

    const payload = {
      id: this.selectedCity.id,
      name: data.name,
      code: data.code,
      country: parseInt(data.country),
      state: parseInt(data.state),
      active: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/cities/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Updated City successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.closeDialog();
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to update city');
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
    { field: 'name', header: 'City Name', filterType: 'text' },
    { field: 'code', header: 'Code', filterType: 'text' },
    { field: 'state_name', header: 'State', filterType: 'text' },
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
      body: this.cities.map((row: { [x: string]: any }) =>
        this.cols.map((col) => {
          if (col.field === 'active') {
            return row[col.field] === 1 ? 'Active' : 'Inactive';
          }
          return row[col.field] || '';
        })
      ),
    });
    doc.save(`${this.tableName || 'city'}.pdf`);
  }

  @Input() tableName: string = '';

  exportExcel() {
    this.exportCSVEvent.emit();
    const headers = this.cols.map((col) => col.header);
    const rows = this.cities.map((row: { [x: string]: any }) =>
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
    link.download = `${this.tableName || 'city'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Handle data loaded from paginated table
  onDataLoaded(data: any[]): void {
    this.cities = data || [];
    this.filteredCities = [...(data || [])];
    this.cdr.detectChanges();
  }
}
