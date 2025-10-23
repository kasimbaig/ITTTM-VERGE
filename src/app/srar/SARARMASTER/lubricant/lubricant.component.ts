import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../../services/api.service';

interface Lubricant {
  id?: number;
  name: string;
  code: string;
  description: string;
  type: string;
  type_display?: string;
  active: number;
  active_display?: string;
  created_by?: number;
  modified_by?: number;
  created_on?: string;
  modified_on?: string;
  created_ip?: string;
  modified_ip?: string;
}

interface ApiResponse {
  success: boolean;
  data: Lubricant[];
  count: number;
  message: string;
  filters?: any;
}

@Component({
  selector: 'app-lubricant',
  standalone:false,
  templateUrl: './lubricant.component.html',
  styleUrl: './lubricant.component.css'
})
export class LubricantComponent implements OnInit {
  displayDialog: boolean = false;
  isMaximized: boolean = false;
  loading: boolean = false;
  sararMasterForm: FormGroup = new FormGroup({
    name: new FormControl(''),
    code: new FormControl(''),
    unit: new FormControl(''),
    type: new FormControl(''),
    active: new FormControl(true),
  });
 // Table Columns Configuration
 tableColumns = [
  { field: 'name', header: 'Lubricant Name', type: 'text', sortable: true, filterable: true },
  { field: 'code', header: 'Lubricant Code', type: 'text', sortable: true, filterable: true },
  { field: 'unit', header: 'Unit', type: 'text', sortable: true, filterable: true },
  { field: 'type_display', header: 'Type', type: 'text', sortable: true, filterable: true },
  { field: 'active', header: 'Status', type: 'status', sortable: true, filterable: true },
];

  // Table Data
  tableData: any[] = [];

  // Pagination properties for server-side pagination
  totalRecords: number = 0;
  currentPage: number = 1;
  pageSize: number = 5;
  
  // Delete confirmation modal properties
  showDeleteModal: boolean = false;
  itemToDelete: Lubricant | null = null;
  
  constructor(private apiService: ApiService, private toast: MessageService) {}
  
  ngOnInit(): void {
    this.loadLubricants();
    //console.log('Lubricant Component initialized');
  }
  
  loadLubricants(page: number = 1, pageSize: number = this.pageSize): void {
    this.loading = true;
    this.currentPage = page;
    this.pageSize = pageSize;
    
    // Build query parameters for pagination
    const params = {
      page: page,
      page_size: pageSize
    };
    
    this.apiService.get('master/lubricant/', params).subscribe({
      next: (response) => {
        this.tableData = response.data || response.results || response;
        this.totalRecords = response.count || 0;
        this.loading = false;
        //console.log(`Lubricants loaded: page ${page}, ${this.tableData.length} records, total: ${this.totalRecords}`);
      },
      error: (error) => {
        console.error('Error loading lubricants:', error);
        this.toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load lubricants'
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
    this.loadLubricants(newPage, newPageSize);
  }

  onRowsPerPageChange(event: any): void {
    //console.log('Rows per page changed:', event);
    const newPageSize = event.rows;
    
    // Reset to first page and fetch new data
    this.currentPage = 1;
    this.loadLubricants(1, newPageSize);
  }

  crudName='Add'
  openDialog(): void {
    this.displayDialog = true;
  }

  closeDialog(): void {
    this.displayDialog = false;
    this.sararMasterForm.reset();
    this.sararMasterForm.enable();
    this.crudName='Add'
    this.isEdit = false;
    this.selectedLubricantId = null;
  }

  // Event Handlers
  onView(data: Lubricant): void {
    this.crudName='View'
    this.sararMasterForm.patchValue(data);
    this.sararMasterForm.get('active')?.setValue(data.active == 1 ? true : false);
    this.sararMasterForm.disable();
    this.openDialog();
  }
  
  isEdit: boolean = false;
  selectedLubricantId: number | null = null;
  
  onEdit(data: Lubricant): void {
    this.isEdit = true;
    this.selectedLubricantId = data.id || null;
    this.crudName='Edit'
    this.sararMasterForm.get('active')?.setValue(data.active === 1 ? true : false);
    this.sararMasterForm.patchValue(data);
    this.openDialog();
  }

  onDelete(data: Lubricant): void {
    //console.log('Delete Lubricant:', data);
    this.itemToDelete = data;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.itemToDelete && this.itemToDelete.id) {
      this.apiService.delete(`master/lubricant/${this.itemToDelete.id}/`).subscribe({
        next: (response) => {
          //console.log('Lubricant deleted successfully:', response);
          this.toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Lubricant deleted successfully'
          });
          // Refresh the data
          this.loadLubricants(this.currentPage, this.pageSize);
          this.showDeleteModal = false;
          this.itemToDelete = null;
        },
        error: (error) => {
          console.error('Error deleting lubricant:', error);
          this.toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete lubricant'
          });
          this.showDeleteModal = false;
          this.itemToDelete = null;
        }
      });
    } else {
      this.toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid lubricant ID for deletion'
      });
      this.showDeleteModal = false;
      this.itemToDelete = null;
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.itemToDelete = null;
  }

  save(){
    if (this.sararMasterForm.valid) {
      const formData = this.sararMasterForm.value;
      
      // Convert active boolean to number for API
      const payload = {
        name: formData.name,
        code: formData.code,
        unit: formData.unit,
        active: formData.active ? 1 : 0,
        type: formData.type
      };

      if (this.isEdit && this.selectedLubricantId) {
        // Handle edit
        this.apiService.put(`master/lubricant/${this.selectedLubricantId}/`, payload).subscribe({
          next: (response) => {
            //console.log('Lubricant updated successfully:', response);
            this.toast.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Lubricant updated successfully'
            });
            this.closeDialog();
            // Refresh the data
            this.loadLubricants(this.currentPage, this.pageSize);
          },
          error: (error) => {
            console.error('Error updating lubricant:', error);
            this.toast.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update lubricant'
            });
          }
        });
      } else {
        // Handle add
        this.apiService.post('master/lubricant/', payload).subscribe({
          next: (response) => {
            //console.log('Lubricant created successfully:', response);
            this.toast.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Lubricant created successfully'
            });
            this.closeDialog();
            // Refresh the data
            this.loadLubricants(this.currentPage, this.pageSize);
          },
          error: (error) => {
            console.error('Error creating lubricant:', error);
            this.toast.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create lubricant'
            });
          }
        });
      }
    } else {
      this.toast.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill all required fields'
      });
    }
  }

 
}

