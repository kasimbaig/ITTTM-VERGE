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
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ApiService } from '../../services/api.service';
import { ResuableTableComponent } from '../../sfd/sfd-transaction/resuable-table/resuable-table.component';
import { AddFormComponent } from '../../shared/components/add-form/add-form.component';
import { DeleteConfirmationModalComponent } from '../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { forkJoin } from 'rxjs';

interface SetupTile {
  title: string;
  description: string;
  icon: string;
  borderColor: string;
  route: string;
}

@Component({
  selector: 'app-root-config',
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
  templateUrl: './root-config.component.html',
  styleUrls: ['./root-config.component.scss']
})
export class RootConfigComponent implements OnInit {
  
  // Switch Mode Dialog
  showSwitchModeDialog = false;

  // Table + CRUD state
  rootConfigs: any[] = [];
  filteredRootConfigs: any[] = [];
  selectedConfig: any | null = null;
  showAddForm = false;
  showEditForm = false;
  showViewForm = false;
  showDeleteModal = false;

  // Pagination properties
  totalRecords: number = 0;
  currentPage: number = 1;
  rowsPerPage: number = 10;
  rowsPerPageOptions: number[] = [5, 10, 20, 50, 100];
  isLoading: boolean = false;

  // API endpoint for root configs
  private readonly ROOT_CONFIG_API = 'config/root-configs/';

  gridColumns = [
    { field: 'sub_module_name', header: 'Sub Module', sortable: true, type: 'text' },
    { field: 'ship_name', header: 'Ship', sortable: true, type: 'text' },
    { field: 'user_name', header: 'User', sortable: true, type: 'text' },
    { field: 'role_name', header: 'Role', sortable: true, type: 'text' },
    { field: 'level', header: 'Level', sortable: true, type: 'number' },
    { field: 'status', header: 'Active', sortable: true, type: 'status' }
  ];


  formConfig = [
    { label: 'User Type', key: 'process', type: 'select', required: true, placeholder: 'Select User Type', options: [] },
    { label: 'Role', key: 'role', type: 'select', required: true, placeholder: 'Select Role', options: [] },
    { label: 'Ship', key: 'ship', type: 'select', required: false, placeholder: 'Select Ship', options: [] },
    { label: 'User', key: 'user', type: 'select', required: false, placeholder: 'Select User', options: [] },
    { label: 'Level', key: 'level', type: 'number', required: false, placeholder: 'Enter Level' },
    { label: 'Sub Module', key: 'sub_module', type: 'select', required: false, placeholder: 'Select Sub Module', options: [] },

  
    
  ];
  
  setupTiles: SetupTile[] = [
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

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchRootConfigs(1, this.rowsPerPage);
    this.getRequiredData();
  }

  getRequiredData(){
    forkJoin({
      ship: this.apiService.get('master/ship/?is_dropdown=true'),
      subModule: this.apiService.get('config/sub-modules/'),
      userType: this.apiService.get('access/processes/?is_dropdown=true')
    }).subscribe((data: any) => {
      //console.log('API Responses:', data);
      this.setResponse(data.ship?.data || data.ship || [],'ship');
      this.setResponse(data.subModule?.results || data.subModule || [],'sub_module');
      this.setResponse(data.userType?.data || data.userType || [],'process');
      
      //console.log('Updated form config:', this.formConfig);
    }, (error) => {
      console.error('Error fetching dropdown data:', error);
    })
  
  }
  setResponse(data: any, key: string): void {
  
    
    const res = data.map((item: any) => ({
      label: item.name || item.title || item.label || `${key} ${item.id}`,
      value: item.id || item.value
    }));

  
    this.formConfig.forEach((item: any) => {
      if (item.key === key) {
        item.options = res;
        //console.log(`Updated ${key} options:`, item.options);
      }
    });
    this.formConfig=[...this.formConfig]
    this.selectedConfig={...this.selectedConfig}

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

  // Navigation
  goBack(): void {
    window.history.back();
  }

  // Fetch root configs from API with pagination
  fetchRootConfigs(page: number = 1, pageSize: number = this.rowsPerPage): void {
    this.isLoading = true;
    
    // Construct URL with pagination parameters
    // const url = `${this.ROOT_CONFIG_API}?page=${page}&page_size=${pageSize}`;
    const url = `${this.ROOT_CONFIG_API}`;
    
    this.apiService.get(url).subscribe({
      next: (response: any) => {
        this.rootConfigs = response.results;
        
        this.totalRecords = response.count;
      },     
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // Dummy data loader (replace with API integration when ready)
  private loadDummyData(): void {
    this.rootConfigs = [
      {
        id: 1,
        key: 'system.theme',
        value: 'light',
        description: 'Default UI theme',
        status: 1,
        created_on: '2024-01-10',
        is_active: true
      },
      {
        id: 2,
        key: 'auth.maxLoginAttempts',
        value: '5',
        description: 'Maximum allowed login attempts',
        status: 1,
        created_on: '2024-01-12',
        is_active: true
      },
      {
        id: 3,
        key: 'reports.defaultFormat',
        value: 'pdf',
        description: 'Default export format for reports',
        status: 0,
        created_on: '2024-02-01',
        is_active: false
      }
    ];
  }

  // Table actions
  addNewConfig(): void {
    this.selectedConfig = {
      id: 0,
      process: '',
      role: '',
      ship: '',
      user: '',
      level: 0,
      sub_module: '',
      status: 1
    };
    this.showAddForm = true;
  }

  viewConfig(item: any): void {
    this.selectedConfig = { ...item };
    this.showViewForm = true;
  }

  editConfig(item: any): void {
    this.apiService.get('api/auth/users/?is_dropdown=true&ship='+item.ship).subscribe((data: any) => {
      const newdata= data.data.map((item: any) => {
        return {
          label:item.loginname,
          value:item.id,
        }
      });
      this.setResponse(newdata,'user');
      this.selectedConfig={...item}
    });
    this.apiService.get('access/role-process-mappings/?process_id='+item.process).subscribe((data: any) => {
      const newdata= data.map((item: any) => {
        return {
          label:item.role_name,
          value:item.user_role,
        }
      });
      this.setResponse(newdata,'role');
      this.selectedConfig={...item}
    });
   
    this.showEditForm = true;
  }

  deleteConfig(item: any): void {
    this.selectedConfig = item;
    this.showDeleteModal = true;
  }

  // Form submit handlers
  handleAddSubmit(data: any): void {
    data.status=1;
    this.apiService.post('config/root-configs/',data).subscribe((data: any) => {
      // this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Configuration added successfully' });
      this.fetchRootConfigs();
      this.closeAddForm();
    });
    }

  handleEditSubmit(data: any): void {
    if (!this.selectedConfig) return;
    data.status=1;
    this.apiService.put('config/root-configs/'+this.selectedConfig.id+'/',data).subscribe((data: any) => {
      // this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Configuration added successfully' });
      this.fetchRootConfigs();
      this.closeEditForm();
    });
  }

  handleViewSubmit(_: any): void {
    this.showViewForm = false;
    this.selectedConfig = null;
  }

  confirmDelete(): void {
    if (!this.selectedConfig) return;
    const index = this.rootConfigs.findIndex(i => i.id === this.selectedConfig!.id);
    if (index !== -1) {
      this.rootConfigs.splice(index, 1);
      this.filteredRootConfigs = [...this.rootConfigs];
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Configuration deleted successfully' });
    }
    this.showDeleteModal = false;
    this.selectedConfig = null;
  }

  // Form close handlers
  closeAddForm(): void {
    this.showAddForm = false;
    this.selectedConfig = null;
  }

  closeEditForm(): void {
    this.showEditForm = false;
    this.selectedConfig = null;
  }

  closeViewForm(): void {
    this.showViewForm = false;
    this.selectedConfig = null;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedConfig = null;
  }

  // Pagination event handlers
  onPageChange(event: any): void {
    //console.log('Page change event:', event);
    const newPage = event.page + 1; // PrimeNG uses 0-based indexing
    const newPageSize = event.rows;
    
    this.currentPage = newPage;
    this.rowsPerPage = newPageSize;
    
    // Fetch data for the new page
    this.fetchRootConfigs(newPage, newPageSize);
  }

  onRowsPerPageChange(event: any): void {
    //console.log('Rows per page change event:', event);
    this.rowsPerPage = event.value;
    this.currentPage = 1; // Reset to first page when changing page size
    
    // Fetch data with new page size
    this.fetchRootConfigs(1, this.rowsPerPage);
  }


  onSelectChange(event: any): void {
    //console.log(event)
    if(event.key==='process'){
    this.apiService.get('access/role-process-mappings/?process_id='+event.value).subscribe((data: any) => {
      const newdata= data.map((item: any) => {
        return {
          label:item.role_name,
          value:item.user_role,
        }
      });
      this.setResponse(newdata,'role');
      this.selectedConfig[event.key]=event.value;
      this.selectedConfig={...event.formData}
    });
  } else if(event.key==='ship'){
    this.apiService.get('api/auth/users/?is_dropdown=true&ship='+event.value).subscribe((data: any) => {
      const newdata= data.data.map((item: any) => {
        return {
          label:item.loginname,
          value:item.id,
        }
      });
      this.setResponse(newdata,'user');
      this.selectedConfig[event.key]=event.value;
      this.selectedConfig={...event.formData}
    });
  }
    
  
    
  }
}
