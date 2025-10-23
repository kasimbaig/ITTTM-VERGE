import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../../services/api.service';

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

interface ShipActivityDetail {
  id?: number;
  name: string;
  code: string;
  ship_activity_type: number;
  ship_activity_type_name: string;
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

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

@Component({
  selector: 'app-ship-activity-detail',
  standalone:false,
  templateUrl: './ship-activity-detail.component.html',
  styleUrl: './ship-activity-detail.component.css'
})
export class ShipActivityDetailComponent implements OnInit {
  displayDialog: boolean = false;
  isMaximized: boolean = false;
  loading: boolean = false;
  isEdit: boolean = false;
  selectedShipActivityDetailId: number | null = null;
  selectedShipActivityTypeId: number | null = null;
  
  sararMasterForm: FormGroup = new FormGroup({
    ship_activity_detail: new FormControl('', [Validators.required]),
    code: new FormControl('', [Validators.required]),
    ship_activity_type: new FormControl('', [Validators.required]),
    status: new FormControl(false),
  });

  // Ship Activity Type Options for Dropdown
  shipActivityTypeOptions: ShipActivityType[] = [];

  // Table Columns Configuration
  tableColumns = [
    { field: 'name', header: 'Ship Activity Detail', type: 'text', sortable: true, filterable: true },
    { field: 'code', header: 'Code', type: 'text', sortable: true, filterable: true },
    { field: 'ship_activity_type_name', header: 'Ship Activity Type', type: 'text', sortable: true, filterable: true },
    { field: 'active', header: 'Status', type: 'status', sortable: true, filterable: true },
  ];

  // Table Data
  tableData: ShipActivityDetail[] = [];

  // Pagination properties for server-side pagination
  totalRecords: number = 0;
  currentPage: number = 1;
  pageSize: number = 5;

  // Delete confirmation modal properties
  showDeleteModal: boolean = false;
  itemToDelete: ShipActivityDetail | null = null;

  constructor(private apiService: ApiService, private messageService: MessageService) {}

  ngOnInit(): void {
    this.loadShipActivityTypes();
    this.loadShipActivityDetails();
  }

  // Load ship activity types for dropdown
  loadShipActivityTypes(): void {
    this.loading = true;
    this.apiService.get('srar/ship-activity-types/?is_dropdown=true').subscribe({
      next: (response) => {
        // Handle paginated response structure
        this.shipActivityTypeOptions = response.results || response|| [];
        this.loading = false;
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

  // Load ship activity details from API with pagination
  loadShipActivityDetails(page: number = 1, pageSize: number = this.pageSize): void {
    this.loading = true;
    this.currentPage = page;
    this.pageSize = pageSize;
    
    // Build query parameters for pagination
    const params = {
      page: page,
      page_size: pageSize
    };
    
    this.apiService.get('srar/ship-activity-details/', params).subscribe({
      next: (response: ApiResponse) => {
        // Handle paginated response structure
        this.tableData = response.results || [];
        this.totalRecords = response.count || 0;
        this.loading = false;
        //console.log(`Ship activity details loaded: page ${page}, ${this.tableData.length} records, total: ${this.totalRecords}`);
      },
      error: (error) => {
        console.error('Error loading ship activity details:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load ship activity details'
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
    this.loadShipActivityDetails(newPage, newPageSize);
  }

  onRowsPerPageChange(event: any): void {
    //console.log('Rows per page changed:', event);
    const newPageSize = event.rows;
    
    // Reset to first page and fetch new data
    this.currentPage = 1;
    this.loadShipActivityDetails(1, newPageSize);
  }

  // Helper method to get ship activity type ID by name
  getShipActivityTypeId(shipActivityTypeName: string): number | null {
    const shipActivityType = this.shipActivityTypeOptions.find(type => type.name === shipActivityTypeName);
    return shipActivityType ? shipActivityType.id || null : null;
  }

  // Helper method to get ship activity type name by ID
  getShipActivityTypeName(shipActivityTypeId: number): string {
    const shipActivityType = this.shipActivityTypeOptions.find(type => type.id === shipActivityTypeId);
    return shipActivityType ? shipActivityType.name : 'Unknown';
  }

  crudName='Add'
  
  openDialog(): void {
    this.isEdit = false;
    this.selectedShipActivityDetailId = null;
    this.selectedShipActivityTypeId = null;
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
    this.selectedShipActivityDetailId = null;
    this.selectedShipActivityTypeId = null;
  }

  // Event Handlers
  onView(data: ShipActivityDetail): void {
    this.crudName='View';
    this.isEdit = false;
    this.selectedShipActivityDetailId = data.id || null;
    this.selectedShipActivityTypeId = data.ship_activity_type;
    
    // Reset form first, then set values
    this.sararMasterForm.reset();
    this.sararMasterForm.patchValue({
      ship_activity_detail: data.name,
      code: data.code,
      ship_activity_type: data.ship_activity_type_name,
      status: data.active === 1
    });
    this.sararMasterForm.disable();
    this.displayDialog = true;
  }

  onEdit(data: ShipActivityDetail): void {
    this.isEdit = true;
    this.crudName='Edit';
    this.selectedShipActivityDetailId = data.id || null;
    this.selectedShipActivityTypeId = data.ship_activity_type;
    
    // Reset form first, then set values
    this.sararMasterForm.reset();
    this.sararMasterForm.patchValue({
      ship_activity_detail: data.name,
      code: data.code,
      ship_activity_type: data.ship_activity_type_name,
      status: data.active === 1
    });
    this.sararMasterForm.enable();
    this.displayDialog = true;
  }

  onDelete(data: ShipActivityDetail): void {
    //console.log('Delete Ship Activity Detail:', data);
    this.itemToDelete = data;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.itemToDelete && this.itemToDelete.id) {
      this.loading = true;
      this.apiService.delete(`srar/ship-activity-details/${this.itemToDelete.id}/`).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Ship activity detail deleted successfully'
          });
          this.loadShipActivityDetails(this.currentPage, this.pageSize); // Reload data with current pagination
          this.showDeleteModal = false;
          this.itemToDelete = null;
        },
        error: (error) => {
          console.error('Error deleting ship activity detail:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete ship activity detail'
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
      const selectedShipActivityTypeId = this.getShipActivityTypeId(formValue.ship_activity_type);
      
      if (!selectedShipActivityTypeId) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Please select a valid ship activity type'
        });
        return;
      }

      const payload = {
        name: formValue.ship_activity_detail,
        code: formValue.code,
        ship_activity_type: selectedShipActivityTypeId,
        status: formValue.status ? 'active' : 'inactive'
      };

      this.loading = true;

      if (this.isEdit && this.selectedShipActivityDetailId) {
        // Update existing ship activity detail
        this.apiService.put(`srar/ship-activity-details/${this.selectedShipActivityDetailId}/`, payload).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Ship activity detail updated successfully'
            });
            this.closeDialog();
            this.loadShipActivityDetails(this.currentPage, this.pageSize); // Reload data with current pagination
          },
          error: (error) => {
            console.error('Error updating ship activity detail:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update ship activity detail'
            });
            this.loading = false;
          }
        });
      } else {
        // Create new ship activity detail
        this.apiService.post('srar/ship-activity-details/', payload).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Ship activity detail created successfully'
            });
            this.closeDialog();
            this.loadShipActivityDetails(this.currentPage, this.pageSize); // Reload data with current pagination
          },
          error: (error) => {
            console.error('Error creating ship activity detail:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create ship activity detail'
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

