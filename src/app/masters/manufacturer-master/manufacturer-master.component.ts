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
import { ViewDetailsComponent } from '../../shared/components/view-details/view-details.component';

// Interface for form field configuration
export interface FormFieldConfig {
  label: string;
  key: string;
  type: 'text' | 'select' | 'checkbox' | 'file' | 'textarea' | 'email' | 'tel'; // Added email and tel types
  required: boolean;
  options?: { label: string; value: any }[];
  fullWidth?: boolean;
}

@Component({
  selector: 'app-manufacturer-master', // Updated selector
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
    DeleteConfirmationModalComponent,
    ViewDetailsComponent
  ],
  templateUrl: './manufacturer-master.component.html', // Updated template URL
  styleUrl: './manufacturer-master.component.css', // Updated style URL
})
export class ManufacturerMasterComponent implements OnInit { // Renamed component class
  searchText: string = '';
  manufacturers: any = []; // Changed establishments to manufacturers
  showDeleteDialog: boolean = false;
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  isViewFormOpen: boolean = false; // New: State for view details dialog
  editTitle: string = 'Edit Manufacturer Master';
  title: string = 'Add New Manufacturer';
  viewTitle: string = 'Manufacturer Details'; // New: Title for view dialog

  newManufacturer: any = {}; // Changed newEstablishment
  selectedManufacturer: any = {}; // Changed selectedEstablishment
  filteredManufacturers: any = []; // Changed filteredEstablishments

  // Form configuration for Manufacturer details
  formConfig: FormFieldConfig[] = [
    {
      label: 'Manufacturer Name',
      key: 'name',
      type: 'text',
      required: true,
    },
    {
      label: 'Manufacturer Code',
      key: 'code',
      type: 'text',
      required: true,
    },
    {
      label: 'Country',
      key: 'country',
      type: 'select',
      options: [], // Options will be populated from API
      required: true,
    },
    {
      label: 'Address',
      key: 'address',
      type: 'textarea',
      required: true,
      fullWidth: true,
    },
    {
      label: 'Area Street',
      key: 'area',
      type: 'text',
      required: false, // Assuming not strictly required based on image
    },
    {
      label: 'City',
      key: 'city',
      type: 'text',
      required: true,
    },
    {
      label: 'Contact Person',
      key: 'contact_person',
      type: 'text',
      required: false, // Assuming not strictly required
    },
    {
      label: 'Contact Number',
      key: 'contact_number',
      type: 'tel', // Changed type to tel
      required: false, // Assuming not strictly required
    },
    {
      label: 'Email Id',
      key: 'email',
      type: 'email', // Changed type to email
      required: true,
    },
    
  ];

  // New properties for pagination
  apiUrl: string = 'master/manufacturers/';
  totalCount: number = 0;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    //console.log('🚢 Manufacturer Component Initializing...');
    //console.log('API URL:', this.apiUrl);
    //console.log('Total Count:', this.totalCount);
    //console.log('Enable URL Fetching: true');
    
    // Load master data for dropdowns (but not manufacturers data - paginated table will handle that)
    this.loadInitialData();
    
    // Note: Table data will be loaded by the paginated table component
    // No need to call getManufacturers() here
  }

  goBack(): void {
    this.location.back();
  }

  /**
   * Loads initial data for manufacturers and populates dropdowns (e.g., countries).
   */
  loadInitialData(): void {
    forkJoin({
      manufacturers: this.apiService.get<any>('master/manufacturers/'), // Updated API endpoint
      countries: this.apiService.get<any[]>('master/country/?is_dropdown=true'), // Assuming this endpoint for countries
    }).subscribe({
      next: (response) => {
        // Handle paginated response structure
        if (response.manufacturers && response.manufacturers.results) {
          this.manufacturers = response.manufacturers.results;
        } else {
          this.manufacturers = response.manufacturers?.data || [];
        }
        this.filteredManufacturers = [...this.manufacturers];

        // Populate Country dropdown options
        const countryConfig = this.formConfig.find((c) => c.key === 'country');
        if (countryConfig) {
          countryConfig.options = response.countries.map((item) => ({
            label: item.name, // Assuming country object has a 'name' property
            value: item.id,   // Assuming country object has an 'id' property
          }));
        }
      },
      error: (error) => {
        console.error('Error fetching initial data:', error);
        this.toastService.showError('Error fetching initial data');
      },
    });
  }

  viewdisplayModal: boolean = false;

  /**
   * Fetches the list of manufacturers from the API.
   */
  getManufacturers(): void { // Renamed method
    this.apiService.get<any>('master/manufacturers/').subscribe({ // Updated API endpoint
      next: (response) => {
        // Handle paginated response structure
        if (response && response.results) {
          this.manufacturers = response.results;
        } else {
          this.manufacturers = response?.data || [];
        }
        this.filteredManufacturers = [...this.manufacturers];
      },
      error: (error) => {
        console.error('Error fetching manufacturers:', error);
        this.toastService.showError('Error fetching manufacturers');
      },
    });
  }

  /**
   * Filters the list of manufacturers based on the search text.
   */
  filterManufacturers(): void { // Renamed method
    const search = this.searchText.toLowerCase().trim();
    if (!search) {
      this.manufacturers = [...this.filteredManufacturers];
      return;
    }

    this.manufacturers = this.filteredManufacturers.filter(
      (manufacturer: { // Updated type to manufacturer
        name: string;
        code: string;
        country_name: string; // Updated to match API response
        address: string;
        area: string;
        city: string;
        contact_person: string;
        contact_number: string;
        email: string;
      }) =>
        manufacturer.name.toLowerCase().includes(search) ||
        manufacturer.code.toLowerCase().includes(search) ||
        manufacturer.country_name.toLowerCase().includes(search) ||
        manufacturer.address.toLowerCase().includes(search) ||
        manufacturer.area.toLowerCase().includes(search) ||
        manufacturer.city.toLowerCase().includes(search) ||
        manufacturer.contact_person.toLowerCase().includes(search) ||
        manufacturer.contact_number.toLowerCase().includes(search) ||
        manufacturer.email.toLowerCase().includes(search)
    );
  }

  /**
   * Toggles the visibility of the add manufacturer form.
   * @param open - True to open the form, false to close.
   */
  toggleForm(open: boolean): void {
    this.isFormOpen = open;
    this.newManufacturer = {}; // Reset new manufacturer data
  }

  /**
   * Handles the submission of the add manufacturer form.
   * @param data - The data from the form.
   */
  handleSubmit(data: any): void {
    //console.log("data", data);
    this.apiService.post(`master/manufacturers/`, data).subscribe({ // Updated API endpoint
      next: (res: any) => {
        this.toastService.showSuccess(
          res.message || 'Manufacturer added successfully'
        );
        // Refresh the data after successful addition
        this.getManufacturers();
        this.closeDialog();
      },
      error: (err) => {
        const errorMsg = err?.error?.error || 'Something went wrong';
        this.toastService.showError(errorMsg);
      },
    });
  }

  /**
   * Opens the edit form and populates it with the selected manufacturer's details.
   * @param manufacturer - The manufacturer object to edit.
   */
  editManufacturerDetails(manufacturer: any): void { // 
    this.rowdata = manufacturer;
    this.isEditFormOpen = true;
    this.selectedManufacturer = {
      ...manufacturer,
      country: manufacturer.country, // Country is already the ID in the new API response
    };
  }

  /**
   * Handles the submission of the edit manufacturer form.
   * @param data - The updated data from the form.
   */
  rowdata:any
  handleEditSubmit(data: any): void {
    // this.rowdata = data;
    this.apiService.put(`master/manufacturers/${this.rowdata.id}/`, data).subscribe({ // Updated API endpoint
      next: (res: any) => {
        this.toastService.showSuccess(
          res.message || 'Updated Manufacturer successfully'
        );
        // Refresh the data after successful edit
        this.getManufacturers();
        this.closeDialog();
      },
      error: (err) => {
        const errorMsg = err?.error?.error || 'Error updating manufacturer';
        this.toastService.showError(errorMsg);
      },
    });
  }

  /**
   * Opens the view details dialog for the selected manufacturer.
   * @param manufacturer - The manufacturer object to view.
   */
  viewManufacturerDetails(manufacturer: any): void {
    this.viewdisplayModal = true;
    this.selectedManufacturer = { ...manufacturer };
  }

  /**
   * Helper method to get the label for a select option in the view dialog.
   * @param field The form field configuration.
   * @param value The current value of the field.
   * @returns The label of the selected option, or 'N/A' if not found.
   */
  getSelectOptionLabel(field: FormFieldConfig, value: any): string {
    if (field.type === 'select' && field.options) {
      const foundOption = field.options.find(option => option.value === value);
      return foundOption ? foundOption.label : 'N/A';
    }
    return 'N/A';
  }

  /**
   * Opens the delete confirmation modal for the selected manufacturer.
   * @param manufacturer - The manufacturer object to delete.
   */
  deleteManufacturerDetails(manufacturer: any): void { // Renamed method
    this.showDeleteDialog = true;
    this.selectedManufacturer = manufacturer;
  }

  /**
   * Confirms and performs the deletion of the selected manufacturer.
   */
  confirmDeletion(): void {
    this.apiService
      .delete(`master/manufacturers/${this.selectedManufacturer.id}/`) // Updated API endpoint
      .subscribe({
        next: (data: any) => {
          this.toastService.showSuccess('Manufacturer deleted successfully');
          // Refresh the data after successful deletion
          this.getManufacturers();
          this.showDeleteDialog = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.toastService.showError('Error deleting manufacturer');
        },
      });
  }

  /**
   * Closes all dialogs and modals and refreshes the manufacturer list.
   */
  cancelDeletion() {
    this.showDeleteDialog = false;
  }

  closeDialog(): void {
    this.showDeleteDialog = false;
    this.isFormOpen = false;
    this.isEditFormOpen = false;
    this.isViewFormOpen = false; // New: Close view dialog
    this.selectedManufacturer = {};
    this.newManufacturer = {};
  }

  // Handle data loaded from paginated table
  onDataLoaded(data: any[]): void {
    //console.log('🚢 Data loaded from paginated table:', data);
    //console.log('🚢 Data length:', data?.length);
    //console.log('🚢 Data type:', typeof data);
    //console.log('🚢 First record:', data?.[0]);
    
    this.manufacturers = data || [];
    this.filteredManufacturers = [...(data || [])];
    
    //console.log('🚢 Manufacturers array updated:', this.manufacturers);
    //console.log('🚢 Filtered manufacturers updated:', this.filteredManufacturers);
    
    // Force change detection
    this.cdr.detectChanges();
  }

  // Options for export menu
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

  // Table columns configuration for PrimeNG table - Updated to match API response
  cols = [
    { field: 'code', header: 'Manufacturer Code', filterType: 'text' },
    { field: 'name', header: 'Manufacturer Name', filterType: 'text' },
    { field: 'contact_person', header: 'Contact Person', filterType: 'text' },
    { field: 'contact_number', header: 'Contact Number', filterType: 'text' },
    { field: 'email', header: 'Email ID', filterType: 'text' },
    { field: 'country_name', header: 'Country Name', filterType: 'text' }, // Updated to match API response
    { field: 'city', header: 'City', filterType: 'text' },
    { field: 'area', header: 'Area Street', filterType: 'text' },
    { field: 'address', header: 'Address', filterType: 'text' },
    { field: 'active', header: 'Active', filterType: 'text' }, // Added status column
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

  /**
   * Exports the current table data to a PDF file.
   */
  exportPDF(): void {
    this.exportPDFEvent.emit();
    const doc = new jsPDF();
    autoTable(doc, {
      head: [this.cols.map((col) => col.header)],
      body: this.manufacturers.map((row: { [x: string]: any }) =>
        this.cols.map((col) => row[col.field] || '')
      ),
    });
    doc.save(`${this.tableName || 'manufacturers'}.pdf`);
  }

  /**
   * Exports the current table data to an Excel (CSV) file.
   */
  exportExcel(): void {
    this.exportCSVEvent.emit();
    const headers = this.cols.map((col) => col.header);
    const rows = this.manufacturers.map((row: { [x: string]: any }) =>
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
    link.download = `${this.tableName || 'manufacturers'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
