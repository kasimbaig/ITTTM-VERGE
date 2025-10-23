import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-sfd-approve-request',
  standalone:false,
  templateUrl: './sfd-approve-request.component.html',
  styleUrl: './sfd-approve-request.component.css'
})
export class SfdApproveRequestComponent implements OnInit {

  // Modal properties
  showViewModal: boolean = false;
  selectedItem: any = null;
  maximized: boolean = false;
  
  // Delete confirmation modal properties
  isDeleteConfirmationVisible: boolean = false;
  selectedApproveRequest: any = null;

  tableColumns = [
    { field: 'ship_name', header: 'Ship Name', type: 'text', sortable: true, filterable: true },
    { field: 'equipment_name', header: 'Equipment Code Name', type: 'text', sortable: true, filterable: true },
    { field: 'equipment_serial_number', header: 'Equipment Serial No.', type: 'text', sortable: true, filterable: true },
    { field: 'location_code', header: 'Location Code', type: 'text', sortable: true, filterable: true },
    { field: 'location_onboard', header: 'Location On Board', type: 'text', sortable: true, filterable: true },
    { field: 'auth_inst_date', header: 'Inst Date', type: 'date', sortable: true, filterable: true },
    { field: 'auth_removal', header: 'Auth Removal', type: 'date', sortable: true, filterable: true },
    { field: 'removal_date', header: 'Removal Date', type: 'date', sortable: true, filterable: true },
    { field: 'removal_remark', header: 'Removal Remark', type: 'date', sortable: true, filterable: true },
    { field: 'installation_rh', header: 'Installation RH', type: 'date', sortable: true, filterable: true },
    { field: 'no_of_fits', header: 'No. Of Fits', type: 'number', sortable: true, filterable: true },
    { field: 'request_type', header: 'Request Types', type: 'number', sortable: true, filterable: true },
  ];
  
  
  // Dropdown Options
  departmentOptions: any[] = [];
  shipOptions: any[] = [];
  unitTypeOptions= []
  
  // Selected Values
  selectedUnitType: any = '';
  selectedShip: any = '';
  selectDepartment: any = '';

  // Table Data - Will be populated from API response
  tableData: any[] = [];
  constructor(private apiService: ApiService, private toast: MessageService) {}
  ngOnInit(): void {
    this.apiCall();
    // Don't load all data initially - wait for ship selection
    //console.log('SFD Approve Request Component initialized - waiting for ship selection');
  }
  
  currentPageApi(page: number, pageSize: number){
    // Only load data if ship is selected
    if (this.selectedShip) {
      this.loadTableData(this.selectedShip.id, this.selectDepartment?.id);
    }
  }

  apiCall(){
    // Only load unit types initially - ships will be loaded when unit is selected
    this.apiService.get('master/unit-type/').subscribe((res: any) => {
      this.unitTypeOptions = res.results;
    });
    
    // Load other independent dropdowns
    this.apiService.get('master/department/').subscribe((res: any) => {
      this.departmentOptions = res.results;
    });
  }

  // Event Handlers
  onView(data: any): void {
    //console.log('View SFD:', data);
    this.selectedItem = data;
    this.showViewModal = true;
  }

  onDelete(data: any): void {
    //console.log('Delete SFD Approve Request:', data);
    this.selectedApproveRequest = data;
    this.isDeleteConfirmationVisible = true;
  }

  confirmDelete(): void {
    if (this.selectedApproveRequest) {
      this.apiService.delete(`sfd/sfd-change-requests/${this.selectedApproveRequest.id}/`).subscribe({
        next: () => {
          this.toast.add({severity:'success', summary: 'Success', detail: 'SFD Approve Request Deleted Successfully'});
          // Refresh filtered data instead of all data
          if (this.selectedShip) {
            this.loadTableData(this.selectedShip.id, this.selectDepartment?.id);
          }
          this.isDeleteConfirmationVisible = false;
          this.selectedApproveRequest = null;
        },
        error: (error) => {
          this.toast.add({severity:'error', summary: 'Error', detail: 'Failed to delete SFD Approve Request record'});
          console.error('Delete error:', error);
          this.isDeleteConfirmationVisible = false;
          this.selectedApproveRequest = null;
        }
      });
    }
  }

  cancelDelete(): void {
    this.isDeleteConfirmationVisible = false;
    this.selectedApproveRequest = null;
  }

  // Modal methods
  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedItem = null;
    this.maximized = false;
    this.isDeleteConfirmationVisible = false;
    this.selectedApproveRequest = null;
  }

  toggleMaximize(): void {
    this.maximized = !this.maximized;
  }

  // Format date for display
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }

  // Get status badge class
  getStatusBadgeClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Get permission badge class
  getPermissionBadgeClass(permission: boolean): string {
    return permission ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  onUnitTypeChange(): void {
    //console.log('Unit Type changed to:', this.selectedUnitType);
    let unitId = this.selectedUnitType.id;
    
    // Fetch ships for selected unit
    this.apiService.get(`master/ship/?unit_type=${unitId}`).subscribe((res: any) => {
      this.shipOptions = res.results;
      //console.log('Ships loaded for unit:', this.shipOptions);
    });
    
    // Clear dependent dropdowns and table data when unit changes
    this.selectedShip = null;
    this.tableData = [];
  }
  
  onShipChange(): void {
    //console.log('Ship changed to:', this.selectedShip);
    // Automatically load data when ship is selected
    if (this.selectedShip) {
      this.loadTableData(this.selectedShip.id, this.selectDepartment?.id);
    }
  }

  onDepartmentChange(): void {
    //console.log('Department changed to:', this.selectDepartment);
    // Only load data if ship is selected
    if (this.selectedShip) {
      this.loadTableData(this.selectedShip.id, this.selectDepartment?.id);
    }
  }

  // Load table data for selected Ship + Department
  loadTableData(shipId: number, departmentId?: number) {
    //console.log('Loading table data for Ship ID:', shipId, 'Department ID:', departmentId);
    
    let apiUrl = `sfd/sfd-change-requests/?ship=${shipId}`;
    if (departmentId) {
      apiUrl += `&department=${departmentId}`;
    }
    
    this.apiService.get(apiUrl).subscribe((res: any) => {
      //console.log('API Response:', res);
      if (res.results && res.results.length > 0) {
        this.tableData = res.results;
        //console.log('Table data loaded:', this.tableData.length, 'records');
      } else {
        this.tableData = [];
        this.toast.add({
          severity: 'info',
          summary: 'No Data',
          detail: 'No data found for the selected filters.'
        });
      }
    }, (error) => {
      console.error('Error loading data:', error);
      this.tableData = [];
      this.toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load data. Please try again.'
      });
    });
  }

  approveReference(): void {
    //console.log('Approve Reference:', );
    // Implement approve logic
  }

  rejectReference(): void {
    //console.log('Reject Reference:', );
    // Implement reject logic
  }

}
