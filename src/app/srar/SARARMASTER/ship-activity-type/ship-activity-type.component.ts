import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../../services/api.service';

interface ShipLocation {
  id?: number;
  name: string;
  status: string;
  ship_state: number;
  ship_state_name: string;
  active: number;
  created_by_name?: string;
  modified_by_name?: string;
  active_display?: string;
  created_on?: string;
  modified_on?: string;
  created_ip?: string;
  modified_ip?: string;
  created_by?: number;
  modified_by?: number;
}

interface ShipActivityType {
  id?: number;
  name: string;
  status: string;
  ship_location: number;
  ship_location_name: string;
  active: number;
  code?: string;
  created_by_name?: string;
  modified_by_name?: string;
  active_display?: string;
  created_on?: string;
  modified_on?: string;
  created_ip?: string;
  modified_ip?: string;
  created_by?: number;
  modified_by?: number;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

@Component({
  selector: 'app-ship-activity-type',
  standalone:false,
  templateUrl: './ship-activity-type.component.html',
  styleUrl: './ship-activity-type.component.css'
})
export class ShipActivityTypeComponent  implements OnInit {
  displayDialog: boolean = false;
  isMaximized: boolean = false;
  loading: boolean = false;
  isEdit: boolean = false;
  selectedShipActivityTypeId: number | null = null;
  selectedShipLocationId: number | null = null;
  
  sararMasterForm: FormGroup = new FormGroup({
    ship_location: new FormControl('', [Validators.required]),
    ship_activity_type: new FormControl('', [Validators.required]),
    code: new FormControl('', [Validators.required]),
    status: new FormControl(false),
  });

  // Ship Location Options for Dropdown
  shipLocationOptions: ShipLocation[] = [];

  // Table Columns Configuration
  tableColumns = [
    { field: 'name', header: 'Ship Activity Type', type: 'text', sortable: true, filterable: true },
    { field: 'code', header: 'Code', type: 'text', sortable: true, filterable: true },
    { field: 'ship_location_name', header: 'Ship Location', type: 'text', sortable: true, filterable: true },
    { field: 'active', header: 'Status', type: 'status', sortable: true, filterable: true },
  ];

  // Table Data
  tableData: ShipActivityType[] = [];

  // Pagination properties for server-side pagination
  totalRecords: number = 0;
  currentPage: number = 1;
  pageSize: number = 5;

  // Delete confirmation modal properties
  showDeleteModal: boolean = false;
  itemToDelete: ShipActivityType | null = null;

  constructor(private apiService: ApiService, private messageService: MessageService) {}

  ngOnInit(): void {
    this.loadShipLocations();
    this.loadShipActivityTypes();
  }

  // Load ship locations for dropdown
  loadShipLocations(): void {
    this.loading = true;
    this.apiService.get('srar/ship-locations/?is_dropdown=true').subscribe({
      next: (response) => {
        // Handle paginated response structure
        this.shipLocationOptions = response.results || response|| [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading ship locations:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load ship locations'
        });
        this.loading = false;
      }
    });
  }

  // Load ship activity types from API with pagination
  loadShipActivityTypes(page: number = 1, pageSize: number = this.pageSize): void {
    this.loading = true;
    this.currentPage = page;
    this.pageSize = pageSize;
    
    // Build query parameters for pagination
    const params = {
      page: page,
      page_size: pageSize
    };
    
    this.apiService.get('srar/ship-activity-types/', params).subscribe({
      next: (response: ApiResponse) => {
        // Handle paginated response structure
        this.tableData = response.results || [];
        this.totalRecords = response.count || 0;
        this.loading = false;
        //console.log(`Ship activity types loaded: page ${page}, ${this.tableData.length} records, total: ${this.totalRecords}`);
      },
      error: (error) => {
        console.error('Error loading ship activity types:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load ship activity types'
        });
        this.loading = false;
      }
    });
  }

  // Pagination event handlers
  onPageChange(event: any): void {
    //console.log('Page changed:', event);
    const newPage = event.page + 1; // PrimeNG uses 0-based indexing
    const newPageSize = event.rows;
    
    // Hit the API again with new page parameters
    this.loadShipActivityTypes(newPage, newPageSize);
  }

  onRowsPerPageChange(event: any): void {
    //console.log('Rows per page changed:', event);
    const newPageSize = event.rows;
    
    // Reset to first page and fetch new data
    this.currentPage = 1;
    this.loadShipActivityTypes(1, newPageSize);
  }

  // Helper method to get ship location ID by name
  getShipLocationId(shipLocationName: string): number | null {
    const shipLocation = this.shipLocationOptions.find(location => location.name === shipLocationName);
    return shipLocation ? shipLocation.id || null : null;
  }

  // Helper method to get ship location name by ID
  getShipLocationName(shipLocationId: number): string {
    const shipLocation = this.shipLocationOptions.find(location => location.id === shipLocationId);
    return shipLocation ? shipLocation.name : 'Unknown';
  }

  crudName='Add'
  
  openDialog(): void {
    this.isEdit = false;
    this.selectedShipActivityTypeId = null;
    this.selectedShipLocationId = null;
    this.sararMasterForm.reset();
    this.sararMasterForm.enable();
    this.crudName = 'Add';
    this.displayDialog = true;
  }

  closeDialog(): void {
    this.displayDialog = false;
    this.sararMasterForm.reset();
    this.sararMasterForm.enable();
    this.crudName='Add';
    this.isEdit = false;
    this.selectedShipActivityTypeId = null;
    this.selectedShipLocationId = null;
  }

  // Event Handlers
  onView(data: ShipActivityType): void {
    this.crudName='View';
    this.isEdit = false;
    this.selectedShipActivityTypeId = data.id || null;
    this.selectedShipLocationId = data.ship_location;
    
    // Reset form first, then set values
    this.sararMasterForm.reset();
    this.sararMasterForm.patchValue({
      ship_activity_type: data.name,
      ship_location: data.ship_location_name,
      code: data.code,
      status: data.active === 1
    });
    this.sararMasterForm.disable();
    this.displayDialog = true;
  }

  onEdit(data: ShipActivityType): void {
    this.isEdit = true;
    this.crudName='Edit';
    this.selectedShipActivityTypeId = data.id || null;
    this.selectedShipLocationId = data.ship_location;
    
    // Reset form first, then set values
    this.sararMasterForm.reset();
    this.sararMasterForm.patchValue({
      ship_activity_type: data.name,
      ship_location: data.ship_location_name,
      code: data.code,
      status: data.active === 1
    });
    this.sararMasterForm.enable();
    this.displayDialog = true;
  }

  onDelete(data: ShipActivityType): void {
    //console.log('Delete Ship Activity Type:', data);
    this.itemToDelete = data;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.itemToDelete && this.itemToDelete.id) {
      this.loading = true;
      this.apiService.delete(`srar/ship-activity-types/${this.itemToDelete.id}/`).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Ship activity type deleted successfully'
          });
          this.loadShipActivityTypes(this.currentPage, this.pageSize); // Reload data with current pagination
          this.showDeleteModal = false;
          this.itemToDelete = null;
        },
        error: (error) => {
          console.error('Error deleting ship activity type:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete ship activity type'
          });
          this.loading = false;
          this.showDeleteModal = false;
          this.itemToDelete = null;
        }
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.itemToDelete = null;
  }

  save(): void {
    if (this.sararMasterForm.valid) {
      const formValue = this.sararMasterForm.value;
      const selectedShipLocationId = this.getShipLocationId(formValue.ship_location);
      
      if (!selectedShipLocationId) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Please select a valid ship location'
        });
        return;
      }

      const payload = {
        name: formValue.ship_activity_type,
        status: formValue.status ? 'active' : 'inactive',
        ship_location: selectedShipLocationId,
        code: formValue.code
      };

      this.loading = true;

      if (this.isEdit && this.selectedShipActivityTypeId) {
        // Update existing ship activity type
        this.apiService.put(`srar/ship-activity-types/${this.selectedShipActivityTypeId}/`, payload).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Ship activity type updated successfully'
            });
            this.closeDialog();
            this.loadShipActivityTypes(this.currentPage, this.pageSize); // Reload data with current pagination
          },
          error: (error) => {
            console.error('Error updating ship activity type:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update ship activity type'
            });
            this.loading = false;
          }
        });
      } else {
        // Create new ship activity type
        this.apiService.post('srar/ship-activity-types/', payload).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Ship activity type created successfully'
            });
            this.closeDialog();
            this.loadShipActivityTypes(this.currentPage, this.pageSize); // Reload data with current pagination
          },
          error: (error) => {
            console.error('Error creating ship activity type:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create ship activity type'
            });
            this.loading = false;
          }
        });
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields'
      });
    }
  }
}
