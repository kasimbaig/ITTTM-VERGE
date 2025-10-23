import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';
import { AddFormComponent } from '../../shared/components/add-form/add-form.component';
import { ResuableTableComponent } from '../../sfd/sfd-transaction/resuable-table/resuable-table.component';
import { DeleteConfirmationModalComponent } from '../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from '../../services/api.service';

interface Privilege {
  id: number;
  name: string;
  code: string;
  description: string;
  active?: number;
  created_by?: number;
}

@Component({
  selector: 'app-privileges',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    ToastModule,
    MultiSelectModule,
    DialogModule,
    AddFormComponent,
    ResuableTableComponent,
    DeleteConfirmationModalComponent
  ],
  templateUrl: './privileges.component.html',
  styleUrls: ['./privileges.component.scss']
})
export class PrivilegesComponent implements OnInit {
  
  // API endpoint for privileges
  private readonly PRIVILEGES_API = '/access/privileges/';
  
  // Loading state
  isLoadingPrivileges = false;

  // Pagination properties for ResuableTableComponent
  totalRecords: number = 0;
  currentPage: number = 1;
  rowsPerPage: number = 10;
  rowsPerPageOptions: number[] = [5, 10, 20, 50, 100];

  privileges: Privilege[] = [];
  filteredPrivileges: Privilege[] = [];

  // Grid columns configuration for ResuableTableComponent
  gridColumns = [
    { field: 'name', header: 'Name', sortable: true, type: 'text' },
    { field: 'code', header: 'Code', sortable: true, type: 'text' },
    { field: 'description', header: 'Description', sortable: true, type: 'text' },
    { field: 'active', header: 'Status', sortable: true, type: 'status' }
  ];

  showAddForm = false;
  showEditForm = false;
  showViewForm = false;
  showDeleteModal = false;
  showSwitchModeDialog = false;
  
  selectedPrivilege: Privilege | null = null;
  newPrivilege: Privilege = {
    id: 0,
    name: '',
    code: '',
    description: ''
  };

  // Setup tiles for Switch Mode dialog
  setupTiles = [
    {
      title: 'Users',
      description: 'Manage user accounts and profiles',
      icon: 'pi pi-users',
      borderColor: 'border-blue-500',
      route: 'users'
    },
    {
      title: 'Role',
      description: 'Add Roles',
      icon: 'pi pi-key',
      borderColor: 'border-orange-500',
      route: 'role'
    },
    {
      title: 'Root Config',
      description: 'Manage root configuration settings',
      icon: 'pi pi-cog',
      borderColor: 'border-yellow-500',
      route: 'root-config'
    },
    {
      title: 'Role Access',
      description: 'Configure roles access levels',
      icon: 'pi pi-lock',
      borderColor: 'border-green-500',
      route: 'role-access'
    },
    {
      title: 'User Access',
      description: 'Configure user access levels',
      icon: 'pi pi-user',
      borderColor: 'border-purple-500',
      route: 'user-access'
    },
    {
      title: 'Privileges',
      description: 'Manage system-wide privileges',
      icon: 'pi pi-cog',
      borderColor: 'border-red-500',
      route: 'privileges'
    }
  ];

  privilegeFormConfig = [
    {
      label: 'Name',
      key: 'name',
      type: 'text',
      required: true,
      placeholder: 'Enter Privilege Name'
    },
    {
      label: 'Code',
      key: 'code',
      type: 'text',
      required: true,
      placeholder: 'Enter Privilege Code'
    },
    {
      label: 'Description',
      key: 'description',
      type: 'text',
      required: true,
      placeholder: 'Enter Description'
    }
  ];

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchPrivileges(1, this.rowsPerPage);
  }

  // Fetch privileges from API with pagination
  fetchPrivileges(page: number = 1, pageSize: number = this.rowsPerPage): void {
    this.isLoadingPrivileges = true;
    
    // Construct URL with pagination parameters
    // const params = new URLSearchParams();
    // params.append('page', page.toString());
    // params.append('page_size', pageSize.toString());
    
    const apiUrl = `${this.PRIVILEGES_API}`;
    //console.log('Fetching privileges from:', apiUrl);
    
    this.apiService.get(apiUrl).subscribe({
      next: (response: any) => {
        //console.log('Privileges response:', response);
        if (response && response.results && Array.isArray(response.results)) {
          this.privileges = response.results;
          this.totalRecords = response.count || 0;
          this.currentPage = page;
        } else if (response && response.data) {
          this.privileges = response.data;
          this.totalRecords = response.count || 0;
          this.currentPage = page;
        } else if (Array.isArray(response)) {
          this.privileges = response;
          this.totalRecords = response.length;
          this.currentPage = page;
        } else {
          this.privileges = [];
          this.totalRecords = 0;
          this.currentPage = page;
        }
        this.filteredPrivileges = [...this.privileges];
     
        // Force change detection
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching privileges:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch privileges.'
        });
        this.privileges = [];
        this.filteredPrivileges = [];
        this.totalRecords = 0;
        this.currentPage = page;
      },
      complete: () => {
        this.isLoadingPrivileges = false;
      }
    });
  }

  // Handle page change event from ResuableTableComponent
  onPageChange(event: any): void {
    //console.log('Page change event:', event);
    this.currentPage = event.page + 1; // ResuableTableComponent uses 0-based indexing
    this.rowsPerPage = event.rows;
    this.fetchPrivileges(this.currentPage, this.rowsPerPage);
  }

  // Handle rows per page change event from ResuableTableComponent
  onRowsPerPageChange(event: any): void {
    //console.log('Rows per page change event:', event);
    this.rowsPerPage = event.rows;
    this.currentPage = 1; // Reset to first page when changing rows per page
    this.fetchPrivileges(this.currentPage, this.rowsPerPage);
  }

  addNewPrivilege(): void {
    this.newPrivilege = {
      id: 0,
      name: '',
      code: '',
      description: ''
    };
    this.showAddForm = true;
  }

  editPrivilege(privilege: Privilege): void {
    this.selectedPrivilege = { ...privilege };
    this.showEditForm = true;
  }

  viewPrivilege(privilege: Privilege): void {
    this.selectedPrivilege = { ...privilege };
    this.showViewForm = true;
  }

  deletePrivilege(privilege: Privilege): void {
    this.selectedPrivilege = privilege;
    this.showDeleteModal = true;
  }

  handleAddSubmit(data: any): void {
    // Prepare privilege data for API
    const privilegeData = {
      name: data.name,
      code: data.code,
      description: data.description
    };

    // Show loading state
    this.isLoadingPrivileges = true;

    // Make API call to create privilege
    this.apiService.post(this.PRIVILEGES_API, privilegeData).subscribe({
      next: (response: any) => {
        //console.log('Privilege created successfully:', response);
        
        this.showAddForm = false;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Privilege created successfully'
        });
        
        // Refresh the table data from API with current pagination
        this.fetchPrivileges(this.currentPage, this.rowsPerPage);
      },
      error: (error) => {
        console.error('Error creating privilege:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create privilege. Please try again.'
        });
      },
      complete: () => {
        this.isLoadingPrivileges = false;
      }
    });
  }

  handleEditSubmit(data: any): void {
    if (this.selectedPrivilege) {
      // Prepare privilege data for API update
      const privilegeData = {
        id: this.selectedPrivilege.id,
        name: data.name,
        code: data.code,
        description: data.description
      };

      // Show loading state
      this.isLoadingPrivileges = true;

      // Make API call to update privilege
      this.apiService.put(`${this.PRIVILEGES_API}${this.selectedPrivilege.id}/`, privilegeData).subscribe({
        next: (response: any) => {
          //console.log('Privilege updated successfully:', response);
          
          this.showEditForm = false;
          this.selectedPrivilege = null;
          
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Privilege updated successfully'
          });
          
          // Refresh the table data from API with current pagination
          this.fetchPrivileges(this.currentPage, this.rowsPerPage);
        },
        error: (error) => {
          console.error('Error updating privilege:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update privilege. Please try again.'
          });
        },
        complete: () => {
          this.isLoadingPrivileges = false;
        }
      });
    }
  }

  handleViewSubmit(data: any): void {
    this.showViewForm = false;
    this.selectedPrivilege = null;
  }

  confirmDelete(): void {
    if (this.selectedPrivilege) {
      // Show loading state
      this.isLoadingPrivileges = true;

      // Make API call to delete privilege
      this.apiService.delete(`${this.PRIVILEGES_API}${this.selectedPrivilege.id}/`).subscribe({
        next: (response: any) => {
          //console.log('Privilege deleted successfully:', response);
          
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Privilege deleted successfully'
          });
          
          this.showDeleteModal = false;
          this.selectedPrivilege = null;
          
          // Refresh the table data from API with current pagination
          this.fetchPrivileges(this.currentPage, this.rowsPerPage);
        },
        error: (error) => {
          console.error('Error deleting privilege:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete privilege. Please try again.'
          });
        },
        complete: () => {
          this.isLoadingPrivileges = false;
        }
      });
    }
  }

  closeAddForm(): void {
    this.showAddForm = false;
  }

  closeEditForm(): void {
    this.showEditForm = false;
    this.selectedPrivilege = null;
  }

  closeViewForm(): void {
    this.showViewForm = false;
    this.selectedPrivilege = null;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedPrivilege = null;
  }

  goBack(): void {
    this.router.navigate(['/setup']);
  }

  openSwitchModeDialog(): void {
    this.showSwitchModeDialog = true;
  }

  switchToMode(route: string): void {
    this.showSwitchModeDialog = false;
    // Small delay to ensure dialog closes properly before navigation
    setTimeout(() => {
      this.router.navigate(['/setup', route]);
    }, 100);
  }
}
