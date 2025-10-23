import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ApiService } from '../../../services/api.service';
import { DropdownModule } from 'primeng/dropdown';
import { TieredMenuModule } from 'primeng/tieredmenu';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AddFormComponent } from '../../../shared/components/add-form/add-form.component';
import { CommonModule, Location } from '@angular/common';
import { forkJoin } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';

import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { ViewDetailsComponent } from '../../../shared/components/view-details/view-details.component';

@Component({
  selector: 'app-supplier',
  imports: [
    TableModule,
    AddFormComponent,
    ButtonModule,
    InputTextModule,
    FormsModule,
    DropdownModule,
    TieredMenuModule,
    PaginatedTableComponent,
    CommonModule,
    DialogModule,
    FileUploadModule,
    TieredMenuModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    ToastModule,
    ProgressBarModule,
    DeleteConfirmationModalComponent,
    ViewDetailsComponent
  ],
  templateUrl: './supplier.component.html',
  styleUrl: './supplier.component.css',
})
export class SupplierComponent implements OnInit {
  searchText: string = '';
  supplier: any = [];
  title: string = 'Add new Supplier';
  isFormOpen: boolean = false;
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  showDeleteDialog: boolean = false;
  filteredCountry: any[] = [];
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit Supplier';
  countryCodes: string[] = ['+1', '+91', '+44', '+61', '+81']; // Add more country codes as needed
  isBulkUploadPopup = false;

  openBulkUpload() {
    this.isBulkUploadPopup = true;
  }

  handleBulkUpload(event: any) {
    //console.log('Uploaded suppliers file:', event.files);
    // Add API integration logic here
  }
  newSupplier = {
    code: '',
    name: '',
    address: '',
    area_street: '',
    city: '',
    country: '',
    supplier_manufacture: '',
    contact_person: '',
    country_code: null,
    contact_number: '',
    email_id: '',
    active: 1,
  };
  selectedDetails: any = {
    active: 1,
  };
  formConfigForNewDetails = [
    {
      label: 'Code',
      key: 'code',
      type: 'text',
      required: true,
    },
    {
      label: 'Name',
      key: 'name',
      type: 'text',
      required: true,
    },

    {
      label: 'Address',
      key: 'address',
      type: 'text',
      required: true,
    },

    {
      label: 'Area Street',
      key: 'area_street',
      type: 'text',
      required: true,
    },
    {
      label: 'Country',
      key: 'country',
      type: 'select',
      options: this.filteredCountry,
      required: true,
    },
    {
      label: 'City',
      key: 'city',
      type: 'text',
      required: true,
    },
    {
      label: 'Manufacture Supplier',
      key: 'supplier_manufacture',
      type: 'text',
      required: true,
    },
    {
      label: 'Contact Person',
      key: 'contact_person',
      type: 'text',
      required: true,
    },
    {
      label: 'Country Code',
      key: 'country_code',
      type: 'text',
      required: true,
    },
    {
      label: 'Contact Number',
      key: 'contact_number',
      type: 'number',
      required: true,
    },
    {
      label: 'Email ID',
      key: 'email_id',
      type: 'text',
      required: true,
    },
  ];
  toggleForm(open: boolean) {
    this.isFormOpen = open;
  }
  filteredsupplier: any = [];

  // New properties for pagination
  apiUrl: string = 'master/supplier/';
  totalCount: number = 0;

  constructor(private apiService: ApiService, private location: Location, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    //console.log('🚢 Supplier Component Initializing...');
    //console.log('API URL:', this.apiUrl);
    //console.log('Total Count:', this.totalCount);
    //console.log('Enable URL Fetching: true');
    
    // Load master data for dropdowns (but not suppliers data - paginated table will handle that)
    this.fetchInitialData();
    
    // Note: Table data will be loaded by the paginated table component
    // No need to call getDepartments() here
  }
  goBack(){
    this.location.back();
  }
  fetchInitialData(): void {
    forkJoin({
      suppliers: this.apiService.get<{count: number, next: string | null, previous: string | null, results: any[]} >('master/supplier/'),
      countries: this.apiService.get<{count: number, next: string | null, previous: string | null, results: any[]} >('master/country/'),
    }).subscribe({
      next: ({ suppliers, countries }) => {
        //console.log(suppliers);
        // Handle suppliers
        this.supplier = suppliers.results;
        this.filteredsupplier = [...this.supplier];

        // Handle countries
        this.filteredCountry = countries.results.map((details: any) => ({
          label: details.name,
          value: details.id,
        }));

        const countryField = this.formConfigForNewDetails.find(
          (field) => field.key === 'country'
        );

        if (countryField) {
          countryField.options = this.filteredCountry;
        }
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      },
    });
  }
  // Search function
  filterSuppliers() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.supplier = [...this.filteredsupplier]; // Reset to original list if search is empty
      return;
    }

    this.supplier = this.filteredsupplier.filter(
      (dept: { name: string; code: string }) =>
        dept.name.toLowerCase().includes(search) ||
        dept.code.toLowerCase().includes(search)
    );
  }
  openAddDept() {
    this.deptdisplayModal = true;
  }

  closeDialog() {
    this.deptdisplayModal = false;
    this.viewdisplayModal = false;
    this.showDeleteDialog = false;
    this.editdisplayModal = false;
    this.isFormOpen = false;
    this.isEditFormOpen = false;
    this.selectedDetails = {};
  }
  handleSubmit(data: any) {
    this.newSupplier = data;
    this.apiService.post(`master/supplier/`, this.newSupplier).subscribe({
      next: (data: any) => {
        //console.log(data);
        // Refresh the data after successful addition
        this.fetchInitialData();
        this.closeDialog();
      },
      error: (error) => {
        console.error('Login failed:', error);
        // alert('Invalid login credentials');
      },
    });
  }
  viewDetails(dept: any) {
    this.viewdisplayModal = true;
    this.selectedDetails = dept;
  }
  editDetails(details: any, open: boolean) {
    this.isEditFormOpen = open;
    this.selectedDetails = { ...this.selectedDetails, ...details };
  }
  deleteDetails(dept: any) {
    this.showDeleteDialog = true;
    this.selectedDetails = dept;
  }
  confirmDeletion() {
    this.apiService
      .delete(`master/supplier/${this.selectedDetails.id}/`)
      .subscribe({
        next: (data: any) => {
          //console.log(data);
          // Refresh the data after successful deletion
          this.fetchInitialData();
          this.showDeleteDialog = false;
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }
  cancelDeletion() {
    this.showDeleteDialog = false;
  }
  handleEditSubmit(data: any) {
    this.selectedDetails = { ...this.selectedDetails, ...data };
    this.apiService
      .put(`master/supplier/${this.selectedDetails.id}/`, this.selectedDetails)
      .subscribe({
        next: (data: any) => {
          //console.log(data);
          // Refresh the data after successful edit
          this.fetchInitialData();
          this.closeDialog();
        },
        error: (error) => {
          console.error('Error:', error);
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
    { field: 'code', header: 'Supplier Code', filterType: 'text' },
    { field: 'name', header: 'Supplier Name', filterType: 'text' },
    { field: 'contact_person', header: 'Contact Person', filterType: 'text' },
    { field: 'contact_number', header: 'Contact Number', filterType: 'text' },
    { field: 'email_id', header: 'Email Id', filterType: 'text' },
    { field: 'country_name', header: 'Country Name', filterType: 'text' },
    { field: 'city', header: 'City', filterType: 'text' },
    { field: 'area_street', header: 'Area Street', filterType: 'text' },
    { field: 'address', header: 'Address', filterType: 'text' },
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
    //console.log('Exporting as PDF...');
    // Your PDF export logic here
    this.exportPDFEvent.emit(); // Emit event instead of direct call
    const doc = new jsPDF();
    autoTable(doc, {
      head: [this.cols.map((col) => col.header)],
      body: this.supplier.map((row: { [x: string]: any }) =>
        this.cols.map((col) => row[col.field] || '')
      ),
    });
    doc.save(`${this.tableName || 'supplier'}.pdf`); // ✅ Use backticks
  }
  @Input() tableName: string = '';
  exportExcel() {
    //console.log('Exporting as Excel...');
    // Your Excel export logic here
    this.exportCSVEvent.emit(); // Emit event instead of direct call
    const headers = this.cols.map((col) => col.header);
    const rows = this.supplier.map((row: { [x: string]: any }) =>
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
    link.download = `${this.tableName || 'supplier'}.csv`; // ✅ Use backticks
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Handle data loaded from paginated table
  onDataLoaded(data: any[]): void {
    //console.log('🚢 Data loaded from paginated table:', data);
    //console.log('🚢 Data length:', data?.length);
    //console.log('🚢 Data type:', typeof data);
    //console.log('🚢 First record:', data?.[0]);
    
    this.supplier = data || [];
    this.filteredsupplier = [...(data || [])];
    
    //console.log('🚢 Supplier array updated:', this.supplier);
    //console.log('🚢 Filtered suppliers updated:', this.filteredsupplier);
    
    // Force change detection
    this.cdr.detectChanges();
  }
}
