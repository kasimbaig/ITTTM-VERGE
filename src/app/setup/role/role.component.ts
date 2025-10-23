import { Component, OnInit } from '@angular/core';
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
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ResuableTableComponent } from '../../sfd/sfd-transaction/resuable-table/resuable-table.component';
import { AddFormComponent } from '../../shared/components/add-form/add-form.component';
import { DeleteConfirmationModalComponent } from '../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from '../../services/api.service';

interface Role {
  id: number;
  name: string;
  description: string;
  status: number;
  created_on: string;
  created_by: number;
  modified_on: string | null;
  modified_by: number | null;
  is_active: boolean;
}

interface SetupTile {
  title: string;
  description: string;
  icon: string;
  borderColor: string;
  route: string;
}

@Component({
  selector: 'app-role',
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
    DropdownModule,
    CheckboxModule,
    InputSwitchModule,
    ResuableTableComponent,
    AddFormComponent,
    DeleteConfirmationModalComponent
  ],
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class RoleComponent implements OnInit {
  // Switch Mode Dialog
  showSwitchModeDialog = false;
  
  setupTiles: SetupTile[] = [
    {
      title: 'Users',
      description: 'Manage user accounts and profiles',
      icon: 'pi pi-user',
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

  // API endpoints
  private readonly USER_ROLES_API = 'access/user-roles/';

  // Data
  roles: Role[] = [];
  filteredRoles: Role[] = [];
  selectedRole: Role | null = null;
  newRole: Role = {
    id: 0,
    name: '',
    description: '',
    status: 1,
    created_on: '',
    created_by: 0,
    modified_on: null,
    modified_by: null,
    is_active: true
  };

  // Form states
  showAddForm = false;
  showEditForm = false;
  showViewForm = false;
  showDeleteModal = false;

  // Loading & pagination state
  isLoading = false;
  currentPage = 1;
  totalCount = 0;
  pageSize = 10;
  
  // Additional pagination properties for ResuableTableComponent
  totalRecords: number = 0;
  rowsPerPage: number = 10;
  rowsPerPageOptions: number[] = [5, 10, 20, 50, 100];

  // Grid columns configuration for ResuableTableComponent
  gridColumns = [
    { field: 'name', header: 'Role Name', sortable: true, type: 'text' },
    { field: 'description', header: 'Description', sortable: true, type: 'text' },
    { field: 'status', header: 'Active', sortable: true, type: 'status' },
    // { field: 'created_on', header: 'Created On', sortable: true, type: 'date' },
    // { field: 'is_active', header: 'Active', sortable: true, type: 'boolean' }
  ];

  // Form configuration
  roleFormConfig = [
    {
      label: 'Role Name',
      key: 'name',
      type: 'text',
      required: true,
      placeholder: 'Enter Role Name'
    },
    {
      label: 'Description',
      key: 'description',
      type: 'textarea',
      required: true,
      placeholder: 'Enter Role Description'
    },
    {
      label: 'Status',
      key: 'status',
      type: 'select',
      required: true,
      placeholder: 'Select Status',
      options: [
        { label: 'Active', value: 1 },
        { label: 'Inactive', value: 0 }
      ]
    },
    {
      label: 'Active',
      key: 'is_active',
      type: 'checkbox',
      required: false
    }
  ];

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.fetchRoles(1);
  }

  // Normalize API role item to local Role interface
  private mapApiRoleToRole(item: any): Role {
    const active =
      typeof item.active !== 'undefined' ? Number(item.active) :
      typeof item.is_active !== 'undefined' ? Number(item.is_active) :
      typeof item.status !== 'undefined' ? Number(item.status) : 1;
    return {
      id: item.id,
      name: item.name || item.roleName || item.title || '',
      description: item.description || item.remark || '',
      status: active,
      created_on: item.created_on || item.created_at || '',
      created_by: item.created_by || 0,
      modified_on: item.modified_on || item.updated_at || null,
      modified_by: item.modified_by || null,
      is_active: Boolean(active)
    } as Role;
  }

  // Fetch roles with pagination support
  fetchRoles(page: number = 1): void {
    this.isLoading = true;
    this.currentPage = page;
    
    // Construct URL with pagination parameters
    const url = `${this.USER_ROLES_API}?page=${page}&page_size=${this.rowsPerPage}`;
    
    this.apiService.get<any>(url).subscribe({
      next: (res) => {
        let items: any[] = [];
        // Handle common shapes: {results: []}, {data: []}, []
        if (Array.isArray(res)) {
          items = res;
          this.totalCount = res.length;
          this.totalRecords = res.length;
        } else if (res && Array.isArray(res.results)) {
          items = res.results;
          this.totalCount = res.count ?? items.length;
          this.totalRecords = res.count ?? items.length;
        } else if (res && Array.isArray(res.data)) {
          items = res.data;
          this.totalCount = res.count ?? items.length;
          this.totalRecords = res.count ?? items.length;
        }

        this.roles = items.map((it) => this.mapApiRoleToRole(it));
        this.filteredRoles = [...this.roles];
        
        //console.log('Roles loaded:', this.roles);
        //console.log('Total records:', this.totalRecords);
        //console.log('Current page:', this.currentPage);
      },
      error: () => {
        // On error, show toast and keep current data (possibly empty)
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load roles'
        });
      },
      complete: () => (this.isLoading = false)
    });
  }

  // Navigation
  goBack(): void {
    window.history.back();
  }

  // Form operations
  addNewRole(): void {
    this.newRole = {
      id: 0,
      name: '',
      description: '',
      status: 1,
      created_on: new Date().toISOString().split('T')[0],
      created_by: 1,
      modified_on: null,
      modified_by: null,
      is_active: true
    };
    this.showAddForm = true;
  }

  editRole(role: Role): void {
    this.selectedRole = { ...role };
    this.showEditForm = true;
  }

  viewRole(role: Role): void {
    this.selectedRole = { ...role };
    this.showViewForm = true;
  }

  deleteRole(role: Role): void {
    this.selectedRole = role;
    //console.log("delete role",this.selectedRole)
    this.showDeleteModal = true;
  }

  // Form submissions
  handleAddSubmit(data: any): void {
    // Map form data to API payload
    const payload: any = {
      name: data.name,
      description: data.description,
      active: typeof data.status !== 'undefined' ? Number(data.status) : data.is_active ? 1 : 0
    };

    this.isLoading = true;
    this.apiService.post(this.USER_ROLES_API, payload).subscribe({
      next: (res: any) => {
        const created = this.mapApiRoleToRole(res);
        // Prepend to list for quick feedback
        this.roles = [created, ...this.roles];
        this.filteredRoles = [...this.roles];
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role added successfully' });
        this.showAddForm = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: (err?.message || 'Failed to add role') });
      },
      complete: () => {
        this.isLoading = false;
        // Optionally refresh current page to sync server-side data
        this.fetchRoles(this.currentPage);
      }
    });
  }

  handleEditSubmit(data: any): void {
    if (!this.selectedRole) {
      return;
    }
    const id = this.selectedRole.id;
    const payload: any = {
      name: data.name,
      description: data.description,
      active: typeof data.status !== 'undefined' ? Number(data.status) : data.is_active ? 1 : 0
    };

    this.isLoading = true;
    this.apiService.put(`${this.USER_ROLES_API}${id}/`, payload).subscribe({
      next: (res: any) => {
        const updated = this.mapApiRoleToRole(res);
        const index = this.roles.findIndex((r) => r.id === id);
        if (index !== -1) {
          this.roles[index] = updated;
          this.filteredRoles = [...this.roles];
        }
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role updated successfully' });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: (err?.message || 'Failed to update role') });
      },
      complete: () => {
        this.isLoading = false;
        this.showEditForm = false;
        this.selectedRole = null;
        // Refresh view
        this.fetchRoles(this.currentPage);
      }
    });
  }

  handleViewSubmit(data: any): void {
    this.showViewForm = false;
    this.selectedRole = null;
  }

  confirmDelete(): void {
    if (!this.selectedRole) {
      this.showDeleteModal = false;
      return;
    }
    const id = this.selectedRole.id;
    //console.log("from confirm",id)
    this.isLoading = true;
    this.apiService.delete(`${this.USER_ROLES_API}${id}/`).subscribe({
      next: () => {
        this.roles = this.roles.filter((r) => r.id !== id);
        this.filteredRoles = [...this.roles];
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Role deleted successfully' });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: (err?.message || 'Failed to delete role') });
      },
      complete: () => {
        this.isLoading = false;
        this.showDeleteModal = false;
        this.selectedRole = null;
        // Refresh current page data
        this.fetchRoles(this.currentPage);
      }
    });
  }

  // Form close handlers
  closeAddForm(): void {
    this.showAddForm = false;
  }

  closeEditForm(): void {
    this.showEditForm = false;
    this.selectedRole = null;
  }

  closeViewForm(): void {
    this.showViewForm = false;
    this.selectedRole = null;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedRole = null;
  }

  // Switch Mode Dialog
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

  // Pagination event handlers
  onPageChange(event: any): void {
    //console.log('Page change event:', event);
    const newPage = event.page + 1; // PrimeNG uses 0-based indexing
    const newPageSize = event.rows;
    
    this.currentPage = newPage;
    this.rowsPerPage = newPageSize;
    
    // Fetch data for the new page
    this.fetchRoles(newPage);
  }

  onRowsPerPageChange(event: any): void {
    //console.log('Rows per page change event:', event);
    this.rowsPerPage = event.value;
    this.currentPage = 1; // Reset to first page when changing page size
    
    // Fetch data with new page size
    this.fetchRoles(1);
  }
}
