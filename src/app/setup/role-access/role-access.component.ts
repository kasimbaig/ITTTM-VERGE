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
import { AddFormComponent } from '../../shared/components/add-form/add-form.component';
import { DeleteConfirmationModalComponent } from '../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from '../../services/api.service';

interface RoleAccess {
  id: number;
  roleName: string;
  accessLevel: string;
  permissions: string[];
  status: string;
}

interface Module {
  id: number;
  name: string;
  url?: string;
  icon?: string;
  hasSubModules: boolean;
  isExpanded: boolean;
  level: number;
  parentId: number | null;
  permissions: {
    add: boolean;
    edit: boolean;
    view: boolean;
    delete: boolean;
    comment: boolean;
    fghn: boolean;
    [key: string]: boolean;
  };
  privileges: any[];
  enabled: boolean;
  subModules: Module[];
  displayLevel?: number;
  isVisible?: boolean;
}

@Component({
  selector: 'app-role-access',
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
    AddFormComponent,
    DeleteConfirmationModalComponent
  ],
  templateUrl: './role-access.component.html',
  styleUrls: ['./role-access.component.scss']
})
export class RoleAccessComponent implements OnInit {
  
  roleAccesses: RoleAccess[] = [
    { id: 1, roleName: 'Super Admin', accessLevel: 'Full', permissions: ['Read', 'Write', 'Delete', 'Admin'], status: 'Active' },
    { id: 2, roleName: 'Project Manager', accessLevel: 'High', permissions: ['Read', 'Write', 'Delete'], status: 'Active' },
    { id: 3, roleName: 'Developer', accessLevel: 'Medium', permissions: ['Read', 'Write'], status: 'Active' },
    { id: 4, roleName: 'Viewer', accessLevel: 'Low', permissions: ['Read'], status: 'Inactive' },
    { id: 5, roleName: 'System Administrator', accessLevel: 'Full', permissions: ['Read', 'Write', 'Delete', 'Admin', 'Configure'], status: 'Active' },
    { id: 6, roleName: 'Technical Lead', accessLevel: 'High', permissions: ['Read', 'Write', 'Delete', 'Review'], status: 'Active' },
    { id: 7, roleName: 'Quality Analyst', accessLevel: 'Medium', permissions: ['Read', 'Write', 'Review'], status: 'Active' },
    { id: 8, roleName: 'Data Analyst', accessLevel: 'Medium', permissions: ['Read', 'Write', 'Export'], status: 'Active' },
    { id: 9, roleName: 'Support Engineer', accessLevel: 'Medium', permissions: ['Read', 'Write', 'Support'], status: 'Active' },
    { id: 10, roleName: 'Guest User', accessLevel: 'Low', permissions: ['Read'], status: 'Inactive' }
  ];

  // Grid columns configuration for ResuableTableComponent
  gridColumns = [
    { field: 'roleName', header: 'Role Name', sortable: true, type: 'text' },
    { field: 'accessLevel', header: 'Access Level', sortable: true, type: 'text' },
    { field: 'permissions', header: 'Permissions', sortable: true, type: 'text' },
    { field: 'status', header: 'Status', sortable: true, type: 'status' }
  ];

  // Data for table
  filteredRoleAccesses: RoleAccess[] = [];

  showAddForm = false;
  showEditForm = false;
  showViewForm = false;
  showDeleteModal = false;
  showSwitchModeDialog = false;
  showAddMenuForm = false; // Add this for the Add Menu modal
  
  selectedRole: RoleAccess | null = null;
  selectedRoleId: number | null = null;
  newRole: RoleAccess = {
    id: 0,
    roleName: '',
    accessLevel: '',
    permissions: [],
    status: ''
  };

  // Add Menu form data
  newMenu = {
    name: '',
    url: '/',
    icon: 'MessageSquare'
  };

  // Role options for dropdown - using the new data structure
  roleOptions = [
    {
      "id": 1,
      "code": "INIT",
      "name": "Initiator",
      "description": "Initiates requests and proposals",
      "active": 1
    },
    {
      "id": 2,
      "code": "REC",
      "name": "Recommender",
      "description": "Recommends approval or rejection",
      "active": 1
    },
    {
      "id": 3,
      "code": "APP",
      "name": "Approver",
      "description": "Final approval authority",
      "active": 1
    },
    {
      "id": 4,
      "code": "REV",
      "name": "Reviewer",
      "description": "Reviews and provides feedback",
      "active": 1
    },
    {
      "id": 5,
      "code": "TREV",
      "name": "Technical Reviewer",
      "description": "Technical review and validation",
      "active": 1
    },
    {
      "id": 6,
      "code": "SCAPT",
      "name": "Ship Captain",
      "description": "Ship captain approval",
      "active": 1
    },
    {
      "id": 7,
      "code": "TOFF",
      "name": "Technical Officer",
      "description": "Technical officer review",
      "active": 1
    }
  ];

  // Process options for dropdown
  processOptions = [
    { id: 1, name: 'Process 1', description: 'First process', active: 1 },
    { id: 2, name: 'Process 2', description: 'Second process', active: 1 }
  ];

  // Selected process ID
  selectedProcessId: number | null = null;

  // Available privileges
  availablePrivileges: any[] = [];

  // Form configurations
  menuFormConfig = [
    { label: 'Name', key: 'name', type: 'text', required: true, placeholder: 'Enter Menu Name' },
    { label: 'URL', key: 'url', type: 'text', required: true, placeholder: 'Enter URL' },
    { label: 'Icon', key: 'icon', type: 'text', required: false, placeholder: 'Enter Icon Class' }
  ];

  subMenuFormConfig = [
    { label: 'Name', key: 'name', type: 'text', required: true, placeholder: 'Enter Sub Menu Name' },
    { label: 'URL', key: 'url', type: 'text', required: true, placeholder: 'Enter URL' },
    { label: 'Icon', key: 'icon', type: 'text', required: false, placeholder: 'Enter Icon Class' },
    { label: 'Parent Menu', key: 'parent_id', type: 'select', required: true, placeholder: 'Select Parent Menu', options: [] }
  ];

  // Module edit form configuration
  moduleEditFormConfig = [
    { label: 'Name', key: 'name', type: 'text', required: true, placeholder: 'Enter Module Name' },
    { label: 'URL', key: 'url', type: 'text', required: false, placeholder: 'Enter URL' },
    { label: 'Icon', key: 'icon', type: 'text', required: false, placeholder: 'Enter Icon Class' },
    { label: 'Enabled', key: 'enabled', type: 'switch', required: false }
  ];

  // Sub menu form data
  newSubMenu = {
    name: '',
    url: '/',
    icon: 'MessageSquare',
    parent_id: null as number | null
  };

  // Module edit form data
  moduleEditData = {
    name: '',
    url: '',
    icon: '',
    enabled: true
  };

  // Show sub menu form flag
  showAddSubMenuForm = false;
  
  // Show edit module form flag
  showEditModuleForm = false;
  
  // Show delete confirmation flag
  showDeleteModuleModal = false;
  
  // Selected module for editing/deleting
  selectedModule: Module | null = null;

  // API endpoint for user roles
  private readonly USER_ROLES_API = 'access/user-roles/';

  // API endpoint for role menu mappings
  private readonly ROLE_MENU_MAPPINGS_API = 'access/role-menu-mappings/';

  // API endpoint for nested menus
  private readonly NESTED_MENUS_API = 'access/nested-menus/';
  private readonly MENUS_API = 'access/menus/'

  // API endpoint for privileges
  private readonly PRIVILEGES_API = 'access/privileges/';

  // API endpoint for role process mappings
  private readonly ROLE_PROCESS_MAPPINGS_API = 'access/role-process-mappings/';

  // Loading state
  isLoadingRoles = false;
  isLoadingMenuMappings = false;
  isLoadingNestedMenus = false;
  isLoadingPrivileges = false;
  isLoadingAddMenu = false; // Add this for Add Menu loading state

  // Menu mappings from API
  menuMappings: any[] = [];

  // Modules with permissions
  modules: Module[] = [
    {
      id: 1,
      name: 'Master',
      hasSubModules: true,
      isExpanded: true,
      level: 0,
      parentId: null,
      permissions: {
        add: true,
        edit: false,
        view: false,
        delete: false,
        comment: true,
        fghn: false
      },
      privileges: [],
      enabled: true,
      subModules: [
        {
          id: 11,
          name: 'Section',
          hasSubModules: true,
          isExpanded: true,
          level: 1,
          parentId: 1,
          permissions: {
            add: true,
            edit: false,
            view: false,
            delete: false,
            comment: true,
            fghn: false
          },
          privileges: [],
          enabled: true,
          subModules: [
            {
              id: 111,
              name: 'System',
              hasSubModules: true,
              isExpanded: true,
              level: 2,
              parentId: 11,
              permissions: {
                add: true,
                edit: false,
                view: false,
                delete: false,
                comment: true,
                fghn: false
              },
              privileges: [],
              enabled: true,
              subModules: [
                {
                  id: 1111,
                  name: 'Equipment',
                  hasSubModules: false,
                  isExpanded: false,
                  level: 3,
                  parentId: 111,
                  permissions: {
                    add: true,
                    edit: false,
                    view: false,
                    delete: false,
                    comment: true,
                    fghn: false
                  },
                  privileges: [],
                  enabled: true,
                  subModules: []
                },
                {
                  id: 1112,
                  name: 'KMP',
                  hasSubModules: false,
                  isExpanded: false,
                  level: 3,
                  parentId: 111,
                  permissions: {
                    add: true,
                    edit: false,
                    view: false,
                    delete: false,
                    comment: true,
                    fghn: false
                  },
                  privileges: [],
                  enabled: true,
                  subModules: []
                }
              ]
            }
          ]
        },
        {
          id: 12,
          name: 'Fund',
          hasSubModules: false,
          isExpanded: false,
          level: 1,
          parentId: 1,
          permissions: {
            add: true,
            edit: false,
            view: false,
            delete: false,
            comment: true,
            fghn: false
          },
          privileges: [],
          enabled: true,
          subModules: []
        },
        {
          id: 13,
          name: 'Unit',
          hasSubModules: false,
          isExpanded: false,
          level: 1,
          parentId: 1,
          permissions: {
            add: true,
            edit: false,
            view: false,
            delete: false,
            comment: true,
            fghn: false
          },
          privileges: [],
          enabled: true,
          subModules: []
        },
        {
          id: 14,
          name: 'Class',
          hasSubModules: false,
          isExpanded: false,
          level: 1,
          parentId: 1,
          permissions: {
            add: true,
            edit: false,
            view: false,
            delete: false,
            comment: true,
            fghn: false
          },
          privileges: [],
          enabled: true,
          subModules: []
        }
      ]
    },
    {
      id: 2,
      name: 'Proposal',
      hasSubModules: false,
      isExpanded: false,
      level: 0,
      parentId: null,
      permissions: {
        add: true,
        edit: true,
        view: true,
        delete: true,
        comment: true,
        fghn: false
      },
      privileges: [],
      enabled: true,
      subModules: []
    },
    {
      id: 3,
      name: 'DMS',
      hasSubModules: false,
      isExpanded: false,
      level: 0,
      parentId: null,
      permissions: {
        add: true,
        edit: true,
        view: true,
        delete: true,
        comment: true,
        fghn: false
      },
      privileges: [],
      enabled: true,
      subModules: []
    },
    {
      id: 4,
      name: 'Setup',
      hasSubModules: false,
      isExpanded: false,
      level: 0,
      parentId: null,
      permissions: {
        add: false,
        edit: false,
        view: false,
        delete: false,
        comment: false,
        fghn: false
      },
      privileges: [],
      enabled: false,
      subModules: []
    },
    {
      id: 5,
      name: 'Home',
      hasSubModules: false,
      isExpanded: false,
      level: 0,
      parentId: null,
      permissions: {
        add: true,
        edit: true,
        view: true,
        delete: true,
        comment: true,
        fghn: false
      },
      privileges: [],
      enabled: true,
      subModules: []
    }
  ];

  // Flattened modules for table display
  flattenedModules: Module[] = [];

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

  roleFormConfig = [
    {
      label: 'Role Name',
      key: 'roleName',
      type: 'text',
      required: true,
      placeholder: 'Enter Role Name'
    },
    {
      label: 'Access Level',
      key: 'accessLevel',
      type: 'select',
      required: true,
      placeholder: 'Select Access Level',
      options: [
        { label: 'Full', value: 'Full' },
        { label: 'High', value: 'High' },
        { label: 'Medium', value: 'Medium' },
        { label: 'Low', value: 'Low' }
      ]
    },
    {
      label: 'Permissions',
      key: 'permissions',
      type: 'multiselect',
      required: true,
      placeholder: 'Select Permissions',
      options: [
        { label: 'Read', value: 'Read' },
        { label: 'Write', value: 'Write' },
        { label: 'Delete', value: 'Delete' },
        { label: 'Admin', value: 'Admin' },
        { label: 'Configure', value: 'Configure' },
        { label: 'Review', value: 'Review' },
        { label: 'Support', value: 'Support' },
        { label: 'Export', value: 'Export' }
      ]
    },
    {
      label: 'Status',
      key: 'status',
      type: 'select',
      required: true,
      placeholder: 'Select Status',
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' }
      ]
    }
  ];

  // Add Menu form configuration
  addMenuFormConfig = [
    {
      label: 'Menu Name',
      key: 'name',
      type: 'text',
      required: true,
      placeholder: 'Enter menu name'
    },
    {
      label: 'URL',
      key: 'url',
      type: 'text',
      required: false,
      placeholder: 'Enter URL path'
    },
    {
      label: 'Icon',
      key: 'icon',
      type: 'text',
      required: false,
      placeholder: 'Enter icon name'
    }
  ];

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.initializeAvailablePrivileges();
    
    // Ensure all existing modules have privileges property
    this.ensureModulesHavePrivileges(this.modules);
    
    this.fetchNestedMenus(); // This will populate the modules with the menu structure
    this.fetchPrivileges();
    this.fetchProcessOptions(); // Add this line to fetch process options on init
  }

  // Flatten hierarchical modules for table display
  flattenModules(): void {
    this.flattenedModules = [];
    this.flattenModulesRecursive(this.modules, 0);
  }

  private flattenModulesRecursive(modules: Module[], level: number): void {
    modules.forEach(module => {
      // Add current module
      this.flattenedModules.push({
        ...module,
        displayLevel: level,
        isVisible: true
      });

      // Add submodules if expanded
      if (module.hasSubModules && module.isExpanded && module.subModules.length > 0) {
        this.flattenModulesRecursive(module.subModules, level + 1);
      }
    });
  }

  // Toggle module expansion
  toggleModuleExpansion(module: any): void {
    // Find the module in the original modules array
    const originalModule = this.findModuleById(this.modules, module.id);
    if (originalModule) {
      originalModule.isExpanded = !originalModule.isExpanded;
      this.flattenModules();
    }
  }

  // Helper method to find module by ID in the hierarchical structure
  private findModuleById(modules: Module[], id: number): Module | null {
    for (const module of modules) {
      if (module.id === id) {
        return module;
      }
      if (module.subModules && module.subModules.length > 0) {
        const found = this.findModuleById(module.subModules, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  // Close all dropdowns
  closeAllDropdowns(): void {
    this.closeAllDropdownsRecursive(this.modules);
    this.flattenModules();
  }

  private closeAllDropdownsRecursive(modules: Module[]): void {
    modules.forEach(module => {
      module.isExpanded = false;
      if (module.subModules && module.subModules.length > 0) {
        this.closeAllDropdownsRecursive(module.subModules);
      }
    });
  }

  // Add new top-level module
  addMenu(): void {
    // Reset form data
    this.newMenu = {
      name: '',
      url: '/',
      icon: 'MessageSquare'
    };
    this.showAddMenuForm = true;
  }

  // Handle Add Menu form submission
  handleAddMenuSubmit(data: any): void {
    // Prevent multiple submissions
    if (this.isLoadingAddMenu) {
      return;
    }
    
    this.isLoadingAddMenu = true;
    
    // Prepare the data for API
    const menuData = {
      name: data.name,
      url: data.url || '/',
      icon: data.icon || 'MessageSquare',
      privileges: [
        { name: 'Add', status: false },
        { name: 'Edit', status: false },
        { name: 'View', status: false },
        { name: 'Delete', status: false },
        { name: 'Comment', status: false },
        { name: 'fghn', status: false }
      ]
    };

    //console.log('Submitting menu data to API:', menuData);

    // Make API call to create menu
    this.apiService.post('access/menus/', menuData).subscribe({
      next: (response: any) => {
        //console.log('Menu created successfully:', response);
        
        // Add the new menu to local modules if API call succeeds
        const newModule = {
          id: response.id || Date.now(),
          name: data.name,
          url: data.url || '/',
          icon: data.icon || 'MessageSquare',
          hasSubModules: false,
          isExpanded: false,
          level: 0,
          parentId: null,
          permissions: {
            add: false,
            edit: false,
            view: false,
            delete: false,
            comment: false,
            fghn: false
          },
          privileges: [],
          enabled: true,
          subModules: []
        };

        this.modules.push(newModule);
        this.flattenModules();
        
        this.messageService.add({
          severity: 'success',
          summary: 'Menu Added',
          detail: `New menu "${newModule.name}" has been created successfully via API`
        });

        this.showAddMenuForm = false;
      },
      error: (error) => {
        console.error('Error creating menu:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create menu. Please try again.'
        });
      },
      complete: () => {
        this.isLoadingAddMenu = false;
      }
    });
  }

  // Close Add Menu form
  closeAddMenuForm(): void {
    this.showAddMenuForm = false;
  }

  // Load fallback data when API fails
  private loadFallbackData(): void {
    //console.log('Loading fallback data due to API failure');
    
    // Create sample modules with permissions for demonstration
    this.modules = [
    {
      id: 1,
      name: 'Master',
        hasSubModules: true,
        isExpanded: false,
        level: 0,
        parentId: null,
        permissions: {
          add: true,
          edit: false,
          view: true,
          delete: false,
          comment: true,
          fghn: false
        },
        privileges: [],
        enabled: true,
        subModules: [
                  {
          id: 11,
          name: 'Section',
          hasSubModules: false,
          isExpanded: false,
          level: 1,
          parentId: 1,
          permissions: {
            add: true,
            edit: false,
            view: true,
            delete: false,
            comment: true,
            fghn: false
          },
          privileges: [],
          enabled: true,
          subModules: []
        },
        {
          id: 12,
          name: 'System',
          hasSubModules: false,
          isExpanded: false,
          level: 1,
          parentId: 1,
          permissions: {
            add: true,
            edit: false,
            view: true,
            delete: false,
            comment: true,
            fghn: false
          },
          privileges: [],
          enabled: true,
          subModules: []
        }
        ]
      },
      {
        id: 2,
        name: 'Proposal',
        hasSubModules: false,
        isExpanded: false,
        level: 0,
        parentId: null,
        permissions: {
          add: true,
          edit: true,
          view: true,
          delete: true,
          comment: true,
          fghn: false
        },
        privileges: [],
        enabled: true,
        subModules: []
      },
      {
        id: 3,
        name: 'DMS',
        hasSubModules: false,
        isExpanded: false,
        level: 0,
        parentId: null,
        permissions: {
          add: true,
          edit: true,
          view: true,
          delete: true,
          comment: true,
          fghn: false
        },
        privileges: [],
        enabled: true,
        subModules: []
      }
    ];
    
    //console.log('Fallback data loaded:', this.modules);
  }

  // Add submodule to existing module
  addSubModule(parentModule: Module): void {
    this.selectedModule = parentModule;
    this.newSubMenu = {
      name: '',
      url: '/',
      icon: 'MessageSquare',
      parent_id: parentModule.id
    };
    this.showAddSubMenuForm = true;
  }

  addNewRole(): void {
    this.newRole = {
      id: 0,
      roleName: '',
      accessLevel: '',
      permissions: [],
      status: ''
    };
    this.showAddForm = true;
  }

  editRole(role: RoleAccess): void {
    this.selectedRole = { ...role };
    this.showEditForm = true;
  }

  viewRole(role: RoleAccess): void {
    this.selectedRole = { ...role };
    this.showViewForm = true;
  }

  deleteRole(role: RoleAccess): void {
    this.selectedRole = role;
    this.showDeleteModal = true;
  }

  handleAddSubmit(data: any): void {
    const newRole: RoleAccess = {
      id: this.roleAccesses.length + 1,
      roleName: data.roleName,
      accessLevel: data.accessLevel,
      permissions: Array.isArray(data.permissions) ? data.permissions : [data.permissions],
      status: data.status
    };
    
    this.roleAccesses.push(newRole);
    this.showAddForm = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Role access added successfully'
    });
  }

  handleEditSubmit(data: any): void {
    if (this.selectedRole) {
      const index = this.roleAccesses.findIndex(r => r.id === this.selectedRole!.id);
      if (index !== -1) {
        this.roleAccesses[index] = {
          ...this.selectedRole,
          roleName: data.roleName,
          accessLevel: data.accessLevel,
          permissions: Array.isArray(data.permissions) ? data.permissions : [data.permissions],
          status: data.status
        };
      }
    }
    
    this.showEditForm = false;
    this.selectedRole = null;
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Role access updated successfully'
    });
  }

  handleViewSubmit(data: any): void {
    this.showViewForm = false;
    this.selectedRole = null;
  }

  confirmDelete(): void {
    if (this.selectedRole) {
      const index = this.roleAccesses.findIndex(r => r.id === this.selectedRole!.id);
      if (index !== -1) {
        this.roleAccesses.splice(index, 1);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Role access deleted successfully'
        });
      }
    }
    this.showDeleteModal = false;
    this.selectedRole = null;
  }

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

  goBack(): void {
    this.router.navigate(['/setup']);
  }

  openSwitchModeDialog(): void {
    this.showSwitchModeDialog = true;
  }

  switchToMode(route: string): void {
    this.showSwitchModeDialog = false;
    // Small delay to ensure dialog closes before navigation
    setTimeout(() => {
      this.router.navigate(['/setup', route]);
    }, 100);
  }

  onRoleSelectionChange(event: any): void {
    if (this.selectedRoleId) {
      // Find the selected role and populate the table
      const selectedRole = this.roleOptions.find(role => role.id === this.selectedRoleId);
      if (selectedRole) {
        // Filter the data based on selected role
        this.filteredRoleAccesses = this.roleAccesses.filter(role => role.id === this.selectedRoleId);
        
        // Try to fetch role-specific permissions, but we already have the menu structure
        this.fetchRoleMenuMappings(this.selectedRoleId);
        
        this.messageService.add({
          severity: 'info',
          summary: 'Role Selected',
          detail: `Viewing privileges for: ${selectedRole.name} - ${selectedRole.description}`
        });
      }
    }
  }

  // Fetch role menu mappings from API - updated to accept both role_id and process_id
  private fetchRoleMenuMappings(roleId?: number): void {
    // If roleId is provided, use it; otherwise use selectedRoleId
    const currentRoleId = roleId || this.selectedRoleId;
    
    if (!currentRoleId) {
      return;
    }

    this.isLoadingMenuMappings = true;
    
    // Build params with both role_id and process_id if available
    let params: any = { role_id: currentRoleId };
    if (this.selectedProcessId) {
      params.process_id = this.selectedProcessId;
    }
    
    //console.log('Fetching role menu mappings with params:', params);
    
    this.apiService.get(this.ROLE_MENU_MAPPINGS_API, params).subscribe({
      next: (response: any) => {
        //console.log('Role Menu Mappings API Response:', response);
        
        if (response && Array.isArray(response) && response.length > 0) {
          // Transform the API response to our modules structure (like User Access does)
          this.modules = this.transformRoleAccessResponseToModules(response);
          //console.log('Transformed modules:', this.modules);
        } else {
          //console.log('No role-specific permissions found, using default permissions');
          // Keep existing modules with default permissions
        }
        
        this.flattenModules();
      },
      error: (error) => {
        console.error('Error fetching role menu mappings:', error);
        
        // Check if it's a database schema error
        let errorMessage = 'Failed to fetch role permissions.';
        if (error.error && error.error.includes('role_menu_mapping_privileges')) {
          errorMessage = 'Database schema issue: role_menu_mapping_privileges table not found. Using default permissions.';
          console.warn('Database schema issue detected, using default permissions');
        }
        
        this.messageService.add({
          severity: 'warn',
          summary: 'API Warning',
          detail: errorMessage
        });
        
        // Keep existing menu structure with default permissions
        this.flattenModules();
      },
      complete: () => {
        this.isLoadingMenuMappings = false;
      }
    });
  }

  // Transform role access API response to modules structure (similar to User Access)
  private transformRoleAccessResponseToModules(roleAccessResponse: any[]): Module[] {
    const modules: Module[] = [];
    const privilegesSet = new Set<string>();
    
    roleAccessResponse.forEach(menuItem => {
      const module: any = {
        id: menuItem.id,
        name: menuItem.name,
        hasSubModules: menuItem.sub_menus && menuItem.sub_menus.length > 0,
        isExpanded: false,
        level: 0,
        parentId: null,
        permissions: {
          add: false,
          edit: false,
          view: false,
          delete: false,
          comment: false,
          fghn: false
        },
        privileges: [] as any[],
        enabled: true,
        subModules: this.transformSubMenusFromRoleAccess(menuItem.sub_menus || [], 1, menuItem.id)
      };

      // Map privileges if they exist
      if (menuItem.privileges && Array.isArray(menuItem.privileges)) {
        menuItem.privileges.forEach((privilege: any) => {
          // Add privilege name to the set for unique privileges
          privilegesSet.add(privilege.name);
          
          // Add privilege to module
          module.privileges.push({
            id: privilege.id,
            name: privilege.name,
            description: privilege.description,
            status: privilege.status
          });
        });
      }
      
      modules.push(module);
    });
    
    // Update available privileges for the table headers
    this.availablePrivileges = Array.from(privilegesSet).map(name => ({
      id: Date.now() + Math.random(), // Generate unique ID
      name: name,
      description: name,
      status: false
    }));
    
    //console.log('Available privileges:', this.availablePrivileges);
    
    return modules;
  }

  // Transform sub-menus from role access response
  private transformSubMenusFromRoleAccess(subMenus: any[], level: number, parentId: number): any[] {
    const subModules: Module[] = [];
    
    subMenus.forEach(subMenu => {
      const subModule: any = {
        id: subMenu.id,
        name: subMenu.name,
        hasSubModules: subMenu.sub_menus && subMenu.sub_menus.length > 0,
        isExpanded: false,
        level: level,
        parentId: parentId,
        permissions: {
          add: false,
          edit: false,
          view: false,
          delete: false,
          comment: false,
          fghn: false
        },
        privileges: [] as any[],
        enabled: true,
        subModules: this.transformSubMenusFromRoleAccess(subMenu.sub_menus || [], level + 1, subMenu.id)
      };

      // Map privileges if they exist
      if (subMenu.privileges && Array.isArray(subMenu.privileges)) {
        subMenu.privileges.forEach((privilege: any) => {
          subModule.privileges.push({
            id: privilege.id,
            name: privilege.name,
            description: privilege.description,
            status: privilege.status
          });
        });
      }
      
      subModules.push(subModule);
    });
    
    return subModules;
  }

  // Handle role-menu mappings data
  private handleRoleMenuMappings(mappings: any[]): void {
    //console.log('handleRoleMenuMappings called with mappings:', mappings);
    
    // Extract unique privileges from the API response
    this.updateAvailablePrivilegesFromAPI(mappings);
    
    // Update the modules with the new data
    this.updateModulesFromAPI();
  }

  // Update available privileges from API response
  private updateAvailablePrivilegesFromAPI(mappings: any[]): void {
    //console.log('updateAvailablePrivilegesFromAPI called with mappings:', mappings);
    
    const privilegesSet = new Set<string>();
    
    // Extract all unique privilege names from the API response
    mappings.forEach(menu => {
      //console.log('Processing menu:', menu);
      if (menu.privileges && Array.isArray(menu.privileges)) {
        menu.privileges.forEach((privilege: any) => {
          //console.log('Processing privilege:', privilege);
          if (privilege.name) {
            privilegesSet.add(privilege.name);
            //console.log('Added privilege to set:', privilege.name);
          }
        });
      }
    });
    
    //console.log('Final privileges set:', privilegesSet);
    
    // Convert to array format for the table headers
    this.availablePrivileges = Array.from(privilegesSet).map((name, index) => ({
      id: index + 1,
      name: name,
      description: `${name} permission`
    }));
    
    //console.log('Updated availablePrivileges:', this.availablePrivileges);
    
    // Force change detection by updating a property that Angular tracks
    this.availablePrivileges = [...this.availablePrivileges];
  }

  // Update modules based on API data
  private updateModulesFromAPI(): void {
    //console.log('updateModulesFromAPI called with menuMappings:', this.menuMappings);
    
    if (this.menuMappings.length > 0) {
      // Transform API data to match our module structure
      this.modules = this.menuMappings.map(menu => {
        const transformedModule = {
          id: menu.id,
          name: menu.name,
          hasSubModules: menu.sub_menus && menu.sub_menus.length > 0,
          isExpanded: false,
          level: 0,
          parentId: null,
          permissions: this.buildPermissionsFromAPI(menu.privileges),
          privileges: [],
          enabled: true,
          subModules: this.transformSubMenus(menu.sub_menus || [], 1, menu.id)
        };
        
        //console.log(`Transformed module ${menu.name}:`, transformedModule);
        return transformedModule;
      });
      
      //console.log('Final modules after transformation:', this.modules);
      
      // Flatten modules after updating
      this.flattenModules();
    } else {
      // Clear modules when API returns empty data
      //console.log('No menu mappings, clearing modules to show empty state');
      this.modules = [];
      this.flattenModules();
    }
  }

  // Build permissions object from API privileges
  private buildPermissionsFromAPI(privileges: any[]): any {
    const permissions: any = {};
    
    if (privileges && Array.isArray(privileges)) {
      privileges.forEach((privilege: any) => {
        if (privilege.name) {
          // Use the exact privilege name from API
          permissions[privilege.name] = privilege.status || false;
        }
      });
    }
    
    //console.log('Built permissions from API:', permissions);
    return permissions;
  }

  // Transform sub-menus recursively
  private transformSubMenus(subMenus: any[], level: number, parentId: number): any[] {
    //console.log(`transformSubMenus called with ${subMenus.length} sub-menus at level ${level} for parent ${parentId}`);
    
    return subMenus.map(subMenu => {
      const transformedSubMenu = {
        id: subMenu.id,
        name: subMenu.name,
        url: subMenu.url,
        icon: subMenu.icon,
        hasSubModules: subMenu.sub_menus && subMenu.sub_menus.length > 0,
        isExpanded: false,
        level: level,
        parentId: parentId,
        permissions: {
          add: false,
          edit: false,
          view: false,
          delete: false,
          comment: false,
          fghn: false
        },
        privileges: [],
        enabled: false,
        subModules: this.transformSubMenus(subMenu.sub_menus || [], level + 1, subMenu.id)
      };
      
      // Map privileges if they exist
      if (subMenu.privileges && Array.isArray(subMenu.privileges)) {
        subMenu.privileges.forEach((privilege: any) => {
          if (privilege.name === 'Add') transformedSubMenu.permissions.add = privilege.status;
          else if (privilege.name === 'Edit') transformedSubMenu.permissions.edit = privilege.status;
          else if (privilege.name === 'View') transformedSubMenu.permissions.view = privilege.status;
          else if (privilege.name === 'Delete') transformedSubMenu.permissions.delete = privilege.status;
          else if (privilege.name === 'Comment') transformedSubMenu.permissions.comment = privilege.status;
          else if (privilege.name === 'fghn') transformedSubMenu.permissions.fghn = privilege.status;
        });
      }
      
      //console.log(`Transformed sub-menu ${subMenu.name} at level ${level}:`, transformedSubMenu);
      return transformedSubMenu;
    });
  }

  // Transform nested menus to modules for the UI
  private transformNestedMenusToModules(nestedMenus: any[]): Module[] {
    //console.log('transformNestedMenusToModules called with', nestedMenus);
    const modules: Module[] = [];

    nestedMenus.forEach(menu => {
      const module = {
        id: menu.id,
        name: menu.name,
        url: menu.url,
        icon: menu.icon,
        hasSubModules: menu.sub_menus && menu.sub_menus.length > 0,
        isExpanded: false,
        level: 0,
        parentId: null,
        permissions: {
          add: false,
          edit: false,
          view: false,
          delete: false,
          comment: false,
          fghn: false
        },
        privileges: [],
        enabled: false,
        subModules: this.transformSubMenus(menu.sub_menus || [], 1, menu.id)
      };
      
      // Map privileges if they exist
      if (menu.privileges && Array.isArray(menu.privileges)) {
        menu.privileges.forEach((privilege: any) => {
          if (privilege.name === 'Add') module.permissions.add = privilege.status;
          else if (privilege.name === 'Edit') module.permissions.edit = privilege.status;
          else if (privilege.name === 'View') module.permissions.view = privilege.status;
          else if (privilege.name === 'Delete') module.permissions.delete = privilege.status;
          else if (privilege.name === 'Comment') module.permissions.comment = privilege.status;
          else if (privilege.name === 'fghn') module.permissions.fghn = privilege.status;
        });
      }
      
      modules.push(module);
    });

    //console.log('Modules transformed from nested menus:', modules);
    return modules;
  }

  // Permission management methods
  onPermissionChange(module: Module, permission: string, value?: boolean): void {
    if (value !== undefined) {
      // 3-parameter version: module, permission, value
      //console.log(`Permission changed for ${module.name}: ${permission} = ${value}`);
      if (module && module.permissions) {
        module.permissions[permission] = value;
      }
    } else {
      // 2-parameter version: module, permission (for backward compatibility)
      //console.log(`Permission changed for ${module.name}: ${permission} = ${module.permissions[permission]}`);
    }
    // Here you would typically save the change to your backend
  }

  onToggleChange(module: Module): void {
    //console.log(`Toggle changed for ${module.name}: enabled = ${module.enabled}`);
    // Here you would typically save the change to your backend
  }

  // Action methods
  saveChanges(): void {
    if (!this.selectedRoleId || !this.selectedProcessId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select both a role and a process before saving.'
      });
      return;
    }

    // Prepare the data to send to the API
    const saveData = {
      role: { id: this.selectedRoleId },
      process: { id: this.selectedProcessId },
      menu_access: this.prepareMenuAccessData()
    };

    //console.log('Saving role menu mappings:', saveData);

    // Show loading state
    this.isLoadingMenuMappings = true;

    // Make API call to save the role-menu mappings
    this.apiService.post('access/role-menu-mappings/', saveData).subscribe({
      next: (response: any) => {
        //console.log('Save API Response:', response);
        this.messageService.add({
          severity: 'success',
          summary: 'Save Changes',
          detail: 'Role access permissions have been saved successfully!'
        });
        
        // Optionally refresh the data after saving
        this.fetchRoleMenuMappings();
      },
      error: (error) => {
        console.error('Error saving role menu mappings:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Save Error',
          detail: 'Failed to save role access permissions. Please try again.'
        });
      },
      complete: () => {
        this.isLoadingMenuMappings = false;
      }
    });
  }

  // Prepare menu access data for the API
  private prepareMenuAccessData(): any[] {
    const menuAccessData: any[] = [];
    
    this.modules.forEach(module => {
      const menuItem = {
        id: module.id,
        name: module.name,
        url: (module as any).url || '/',
        icon: (module as any).icon || 'icon',
        sub_menus: this.prepareSubMenusData(module.subModules || []),
        privileges: this.preparePrivilegesData(module.privileges || [])
      };
      
      menuAccessData.push(menuItem);
    });
    
    return menuAccessData;
  }

  // Prepare sub-menus data recursively
  private prepareSubMenusData(subModules: any[]): any[] {
    return subModules.map(subModule => ({
      id: subModule.id,
      name: subModule.name,
      url: (subModule as any).url || '/',
      icon: (subModule as any).icon || 'icon',
      sub_menus: this.prepareSubMenusData(subModule.subModules || []),
      privileges: this.preparePrivilegesData(subModule.privileges || [])
    }));
  }

  // Prepare privileges data
  private preparePrivilegesData(privileges: any[]): any[] {
    return privileges.map(privilege => ({
      id: privilege.id,
      name: privilege.name,
      description: privilege.description || `${privilege.name} permission`,
      status: privilege.status
    }));
  }

  // editModule(module: Module): void {
  //   this.selectedModule = { ...module };
  //   this.moduleEditData = {
  //     name: module.name,
  //     url: (module as any).url || '',
  //     icon: (module as any).icon || '',
  //     enabled: module.enabled
  //   };
  //   this.showEditModuleForm = true;
  // }
  editModule(module: any): void {
  this.selectedModule = module;
  this.moduleEditData = {
    name: module.name,
    url: module.url,
    icon: module.icon,
    enabled: module.enabled
  };
  this.showEditModuleForm = true;
}

  deleteModule(module: Module): void {
    this.selectedModule = module;
    this.showDeleteModuleModal = true;
  }

  // Handle module edit form submission
  // handleModuleEditSubmit(data: any): void {
  //   if (this.selectedModule) {
  //     // Update the module with new data
  //     this.selectedModule.name = data.name;
  //     (this.selectedModule as any).url = data.url;
  //     (this.selectedModule as any).icon = data.icon;
  //     this.selectedModule.enabled = data.enabled;
      
  //     // Refresh flattened modules
  //     this.flattenModules();
      
  //     this.messageService.add({
  //       severity: 'success',
  //       summary: 'Module Updated',
  //       detail: `Module "${this.selectedModule.name}" has been updated successfully`
  //     });
      
  //     this.closeEditModuleForm();
  //   }
  // }

handleModuleEditSubmit(data: any): void {
  if (this.selectedModule) {
    const updatePayload = {
      id: this.selectedModule.id,
      name: data.name,
      url: data.url,
      icon: data.icon,
      enabled: data.enabled
    };

    this.apiService.put(`${this.MENUS_API}${this.selectedModule.id}/`, updatePayload)
      .subscribe({
        next: (response: any) => {
          // Find the module index in the array
          const index = this.modules.findIndex(m => m.id === this.selectedModule?.id);

          if (index !== -1) {
            // Replace the module object with a new object (immutability)
            this.modules = [
              ...this.modules.slice(0, index),
              { ...this.modules[index], ...response },
              ...this.modules.slice(index + 1)
            ];
          }

          // Refresh flattened structure if you're using it elsewhere
          this.flattenModules();

          // Show success message
          this.messageService.add({
            severity: 'success',
            summary: 'Module Updated',
            detail: `Module "${response.name}" has been updated successfully`
          });

          // Close the edit form
          this.closeEditModuleForm();
          this.fetchRoleMenuMappings();
        },
        error: (error) => {
          console.error('Error updating module:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Update Failed',
            detail: 'Failed to update module. Please try again.'
          });
        }
      });
  }
}





  // Close edit module form
  closeEditModuleForm(): void {
    this.showEditModuleForm = false;
    this.selectedModule = null;
    this.moduleEditData = {
      name: '',
      url: '',
      icon: '',
      enabled: true
    };
  }

  // Confirm module deletion
  // confirmModuleDelete(): void {
  //   if (this.selectedModule) {
  //     // Find and remove the module from the modules array
  //     this.removeModuleFromArray(this.modules, this.selectedModule.id);
      
  //     // Refresh flattened modules
  //     this.flattenModules();
      
  //     this.messageService.add({
  //       severity: 'success',
  //       summary: 'Module Deleted',
  //       detail: `Module "${this.selectedModule.name}" has been deleted successfully`
  //     });
      
  //     this.closeDeleteModuleModal();
      
  //   }
  // }
// confirmModuleDelete(): void {
//   if (this.selectedModule) {
//     const moduleToDelete = this.selectedModule; // Store reference to avoid null issues
    
//     // Call the API to delete from backend
//     this.apiService.delete(`${this.ROLE_MENU_MAPPINGS_API}${moduleToDelete.id}/`).subscribe({
//       next: (response) => {
//         // Only remove from local array after successful API call
//         this.removeModuleFromArray(this.modules, moduleToDelete.id);
        
//         // Refresh flattened modules
//         this.flattenModules();
        
//         this.messageService.add({
//           severity: 'success',
//           summary: 'Module Deleted',
//           detail: `Module "${moduleToDelete.name}" has been deleted successfully`
//         });
        
//         this.closeDeleteModuleModal();
//       },
//       error: (error) => {
//         console.error('Error deleting module:', error);
//         this.messageService.add({
//           severity: 'error',
//           summary: 'Delete Failed',
//           detail: 'Failed to delete module. Please try again.'
//         });
        
//         // Close the modal even when API fails
//         this.closeDeleteModuleModal();
//       }
//     });
//   }
// }
confirmModuleDelete(): void {
  if (this.selectedModule) {
    this.apiService.delete(`${this.MENUS_API}${this.selectedModule.id}/`).subscribe((res: any) => {
      this.messageService.add({severity:'success', summary: 'Success', detail: 'Module Deleted Successfully'});
      //console.log(res);
      
      // Remove from local array and refresh
      this.removeModuleFromArray(this.modules, this.selectedModule!.id);
      this.flattenModules();
      
      this.showDeleteModuleModal = false;
      this.selectedModule = null;
    }, (error) => {
      this.messageService.add({severity:'error', summary: 'Error', detail: 'Failed to delete Module record'});
      console.error('Delete error:', error);
      this.showDeleteModuleModal = false;
      this.selectedModule = null;
    });
  }
}
//   // Close delete module modal
  closeDeleteModuleModal(): void {
    this.showDeleteModuleModal = false;
    this.selectedModule = null;
  }

  // Helper method to remove module from array recursively
  private removeModuleFromArray(modules: Module[], moduleId: number): boolean {
    for (let i = 0; i < modules.length; i++) {
      if (modules[i].id === moduleId) {
        modules.splice(i, 1);
        return true;
      }
      if (modules[i].subModules && modules[i].subModules.length > 0) {
        if (this.removeModuleFromArray(modules[i].subModules, moduleId)) {
          return true;
        }
      }
    }
    return false;
  }

  private fetchUserRoles(): void {
    this.isLoadingRoles = true;
    this.apiService.get(this.USER_ROLES_API).subscribe({
      next: (response: any) => {
        //console.log('User Roles API Response:', response);
        
        // Handle different response structures
        if (response && response.data && Array.isArray(response.data)) {
          this.roleOptions = response.data;
        } else if (response && response.results && Array.isArray(response.results)) {
          this.roleOptions = response.results;
        } else if (Array.isArray(response)) {
          this.roleOptions = response;
        } else {
          // Fallback to dummy data if API doesn't return expected format
          this.roleOptions = [
            {
              "id": 1,
              "code": "INIT",
              "name": "Initiator",
              "description": "Initiates requests and proposals",
              "active": 1
            },
            {
              "id": 2,
              "code": "REC",
              "name": "Recommender",
              "description": "Recommends approval or rejection",
              "active": 1
            },
            {
              "id": 3,
              "code": "APP",
              "name": "Approver",
              "description": "Final approval authority",
              "active": 1
            },
            {
              "id": 4,
              "code": "REV",
              "name": "Reviewer",
              "description": "Reviews and provides feedback",
              "active": 1
            },
            {
              "id": 5,
              "code": "TREV",
              "name": "Technical Reviewer",
              "description": "Technical review and validation",
              "active": 1
            },
            {
              "id": 6,
              "code": "SCAPT",
              "name": "Ship Captain",
              "description": "Ship captain approval",
              "active": 1
            },
            {
              "id": 7,
              "code": "TOFF",
              "name": "Technical Officer",
              "description": "Technical officer review",
              "active": 1
            }
          ];
        }
        
        //console.log('Role Options after API call:', this.roleOptions);
      },
      error: (error) => {
        console.error('Error fetching user roles:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch user roles. Using fallback data.'
        });
        
        // Use fallback data on error
        this.roleOptions = [
          {
            "id": 1,
            "code": "INIT",
            "name": "Initiator",
            "description": "Initiates requests and proposals",
            "active": 1
          },
          {
            "id": 2,
            "code": "REC",
            "name": "Recommender",
            "description": "Recommends approval or rejection",
            "active": 1
          },
          {
            "id": 3,
            "code": "APP",
            "name": "Approver",
            "description": "Final approval authority",
            "active": 1
          },
          {
            "id": 4,
            "code": "REV",
            "name": "Reviewer",
            "description": "Reviews and provides feedback",
            "active": 1
          },
          {
            "id": 5,
            "code": "TREV",
            "name": "Technical Reviewer",
            "description": "Technical review and validation",
            "active": 1
          },
          {
            "id": 6,
            "code": "SCAPT",
            "name": "Ship Captain",
            "description": "Ship captain approval",
            "active": 1
          },
          {
            "id": 7,
            "code": "TOFF",
            "name": "Technical Officer",
            "description": "Technical officer review",
            "active": 1
          }
        ];
      },
      complete: () => {
        this.isLoadingRoles = false;
      }
    });
  }

  private fetchNestedMenus(): void {
    this.isLoadingNestedMenus = true;
    this.apiService.get(this.NESTED_MENUS_API).subscribe({
      next: (response: any) => {
        //console.log('Nested Menus API Response:', response);
        
        if (response && Array.isArray(response) && response.length > 0) {
          // Transform API response to modules structure
          this.modules = this.transformNestedMenusToModules(response);
          //console.log('Modules transformed from nested menus:', this.modules);
          
          // Flatten modules for table display
          this.flattenModules();
        } else {
          //console.log('No nested menus data, using fallback data');
          this.loadFallbackData();
        }
      },
      error: (error) => {
        console.error('Error fetching nested menus:', error);
        this.messageService.add({
          severity: 'warn',
          summary: 'API Warning',
          detail: 'Failed to fetch nested menus. Using fallback data.'
        });
        // Use fallback data on error
        this.loadFallbackData();
      },
      complete: () => {
        this.isLoadingNestedMenus = false;
      }
    });
  }

  private fetchPrivileges(): void {
    this.isLoadingPrivileges = true;
    this.apiService.get(this.PRIVILEGES_API).subscribe({
      next: (response: any) => {
        // Assuming response.data contains the privileges
        //console.log('Privileges:', response.data);
        // You might want to update this.modules or this.flattenedModules
        // based on the response if you want to display privileges in the UI
        this.isLoadingPrivileges = false;
      },
      error: (error) => {
        console.error('Error fetching privileges:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch privileges.'
        });
        this.isLoadingPrivileges = false;
      },
      complete: () => {
        this.isLoadingPrivileges = false;
      }
    });
  }

  // Helper to merge role-specific permissions into the existing module structure
  private mergeRolePermissions(rolePermissions: any[]): void {
    //console.log('Merging role permissions into modules:', rolePermissions);
    rolePermissions.forEach(rolePermission => {
      const module = this.findModuleById(this.modules, rolePermission.menu_id);
      if (module) {
        module.permissions = {
          ...module.permissions,
          add: rolePermission.add || false,
          edit: rolePermission.edit || false,
          view: rolePermission.view || false,
          delete: rolePermission.delete || false,
          comment: rolePermission.comment || false,
          fghn: rolePermission.fghn || false
        };
        //console.log(`Merged permissions for module ${module.name}:`, module.permissions);
      } else {
        console.warn(`Module with ID ${rolePermission.menu_id} not found for merging permissions.`);
      }
    });
  }

  // Process selection change handler
  onProcessSelectionChange(event: any): void {
    //console.log('Process selection changed:', event);
    this.selectedProcessId = event.value;
    
    if (this.selectedProcessId && this.selectedRoleId) {
      // Fetch role-process mappings for the selected process and role
      this.fetchRoleProcessMappings();
      // Also fetch role-menu-mappings with both role_id and process_id
      this.fetchRoleMenuMappings();
    }
  }

  // Fetch role-process mappings for the selected process and role
  private fetchRoleProcessMappings(): void {
    if (!this.selectedProcessId || !this.selectedRoleId) {
      return;
    }

    const params = { process_id: this.selectedProcessId };
    this.apiService.get(this.ROLE_PROCESS_MAPPINGS_API, params).subscribe({
      next: (response: any) => {
        //console.log('Role-process mappings fetched:', response);
        if (response && response.data) {
          // Handle the role-process mappings data
          this.handleRoleProcessMappings(response.data);
        }
      },
      error: (error) => {
        console.error('Error fetching role-process mappings:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch role-process mappings.'
        });
      }
    });
  }

  // Handle role-process mappings data
  private handleRoleProcessMappings(mappings: any[]): void {
    //console.log('Processing role-process mappings:', mappings);
    // Add your logic here to handle the mappings data
    // For example, you might want to update the menu permissions
    // or display additional information based on the mappings
  }

  // Get privilege value for a module - updated to work with privileges array like User Access
  getPrivilegeValue(module: any, privilegeName: string): boolean {
    if (module.privileges && Array.isArray(module.privileges)) {
      const privilege = module.privileges.find((p: any) => p.name === privilegeName);
      return privilege ? privilege.status : false;
    }
    return false;
  }

  // Handle add sub menu submit
  handleAddSubMenuSubmit(event: any): void {
    //console.log('Add sub menu submit:', event);
    
    if (this.selectedModule && event.parent_id) {
      const newSubModule = {
        id: Date.now(), // Generate unique ID
        name: event.name,
        url: event.url,
        icon: event.icon,
        hasSubModules: false,
        isExpanded: false,
        level: this.selectedModule.level + 1,
        parentId: event.parent_id,
        permissions: {
          add: false,
          edit: false,
          view: false,
          delete: false,
          comment: false,
          fghn: false
        },
        privileges: [],
        enabled: true,
        subModules: []
      };

      // Update parent module
      this.selectedModule.hasSubModules = true;
      this.selectedModule.subModules.push(newSubModule);
      
      // Refresh flattened modules
      this.flattenModules();
      
      this.messageService.add({
        severity: 'success',
        summary: 'Sub Module Added',
        detail: `New sub module "${newSubModule.name}" has been added to "${this.selectedModule.name}"`
      });
    }
    
    this.showAddSubMenuForm = false;
    this.selectedModule = null;
  }

  // Close add sub menu form
  closeAddSubMenuForm(): void {
    this.showAddSubMenuForm = false;
    this.selectedModule = null;
    this.newSubMenu = {
      name: '',
      url: '/',
      icon: 'MessageSquare',
      parent_id: null
    };
  }

  // Initialize available privileges
  private initializeAvailablePrivileges(): void {
    this.availablePrivileges = [
      { id: 1, name: 'add', description: 'Add permission' },
      { id: 2, name: 'edit', description: 'Edit permission' },
      { id: 3, name: 'view', description: 'View permission' },
      { id: 4, name: 'delete', description: 'Delete permission' },
      { id: 5, name: 'comment', description: 'Comment permission' },
      { id: 6, name: 'fghn', description: 'FGHN permission' }
    ];
  }

  // Fetch process options from API
  private fetchProcessOptions(): void {
    this.apiService.get('access/processes/').subscribe({
      next: (response: any) => {
        //console.log('Process Options API Response:', response);
        if (response && Array.isArray(response)) {
          this.processOptions = response;
        } else {
          this.processOptions = [
            { id: 1, name: 'Process 1', description: 'First process', active: 1 },
            { id: 2, name: 'Process 2', description: 'Second process', active: 1 }
          ];
        }
        //console.log('Process Options after API call:', this.processOptions);
      },
      error: (error) => {
        console.error('Error fetching process options:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch process options. Using fallback data.'
        });
        this.processOptions = [
          { id: 1, name: 'Process 1', description: 'First process', active: 1 },
          { id: 2, name: 'Process 2', description: 'Second process', active: 1 }
        ];
      },
      complete: () => {
        // No specific complete for process options
      }
    });
  }

  // Also add a helper method to ensure all modules have privileges property
  private ensureModulesHavePrivileges(modulesArray: any[]): void {
    modulesArray.forEach(module => {
      if (!module.privileges) {
        module.privileges = [];
      }
      if (module.subModules && module.subModules.length > 0) {
        this.ensureModulesHavePrivileges(module.subModules);
      }
    });
  }
}
