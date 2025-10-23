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
import { AddFormComponent } from '../../shared/components/add-form/add-form.component';
import { DeleteConfirmationModalComponent } from '../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
}

interface Module {
  id: number;
  name: string;
  url?: string;
  icon?: string;
  permissions: {
    add: boolean;
    edit: boolean;
    view: boolean;
    delete: boolean;
    comment: boolean;
    fghn: boolean;
  };
  privileges?: Array<{
    id?: number;
    name: string;
    description?: string;
    status: boolean;
  }>;
  enabled: boolean;
  isExpanded: boolean;
  subModules: Module[];
  level: number;
  parentId: number | null;
}

interface SetupTile {
  title: string;
  description: string;
  icon: string;
  borderColor: string;
  route: string;
}

@Component({
  selector: 'app-user-access',
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
    DeleteConfirmationModalComponent,
  ],
  templateUrl: './user-access.component.html',
  styleUrls: ['./user-access.component.scss']
})
export class UserAccessComponent implements OnInit {
  
  // Switch Mode Dialog
  showSwitchModeDialog = false;
  
  // Add Menu Form
  showAddMenuForm = false;
  newMenu = {
    name: '',
    url: '',
    icon: '',
    parent_id: null as number | null
  };

  // Sub Module Form
  showSubModuleForm = false;
  newSubModule = {
    name: '',
    url: '',
    icon: '',
    parent_id: null as number | null
  };

  // Edit Module Form
  showEditModuleForm = false;
  selectedModule: any = null;
  moduleEditData = {
    name: '',
    url: '',
    icon: '',
    enabled: true
  };

  // Delete Module Confirmation
  showDeleteModuleModal = false;
  
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

  // Component properties
  selectedUser: any = null;
  selectedUserId: number | null = null;
  users: any[] = [];
  userOptions: any[] = [];
  modules: any[] = [];
  flattenedModules: any[] = [];
  
  // Privileges from API - will be populated dynamically
  availablePrivileges: any[] = [];
  
  // Loading states
  isLoadingUsers = false;
  isLoadingNestedMenus = false;
  isLoadingPrivileges = false;
  isLoadingUserAccess = false;
  isLoadingAddMenu = false;
  isLoadingAddSubModule = false;
  
  // API endpoints
  private readonly USERS_API = 'api/auth/users/';
  private readonly USER_ACCESS_API = 'access/user-menu-mappings/';
  private readonly NESTED_MENUS_API = 'access/nested-menus/';
  private readonly PRIVILEGES_API = 'access/privileges/';
  private readonly MENUS_API = 'access/menus/';
  
  // Dropdown options for forms
  parentMenuOptions: { label: string; value: number | null }[] = [];
  parentModuleOptions: { label: string; value: number }[] = [];

  // Form configurations for reusable AddFormComponent
  menuFormConfig = [
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
      required: true,
      placeholder: 'Enter URL path'
    },
    {
      label: 'Icon',
      key: 'icon',
      type: 'text',
      required: false,
      placeholder: 'Enter icon name'
    },
    {
      label: 'Parent Menu',
      key: 'parent_id',
      type: 'select',
      required: false,
      placeholder: 'Select parent menu',
      options: [] as any[]
    }
  ];

  subModuleFormConfig = [
    {
      label: 'Sub Module Name',
      key: 'name',
      type: 'text',
      required: true,
      placeholder: 'Enter sub module name'
    },
    {
      label: 'URL',
      key: 'url',
      type: 'text',
      required: true,
      placeholder: 'Enter URL path'
    },
    {
      label: 'Icon',
      key: 'icon',
      type: 'text',
      required: false,
      placeholder: 'Enter icon name'
    },
    {
      label: 'Parent Module',
      key: 'parent_id',
      type: 'select',
      required: true,
      placeholder: 'Select parent module',
      options: [] as any[]
    }
  ];

  // Module edit form configuration
  moduleEditFormConfig = [
    {
      label: 'Module Name',
      key: 'name',
      type: 'text',
      required: true,
      placeholder: 'Enter module name'
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
    },
    {
      label: 'Enabled',
      key: 'enabled',
      type: 'switch',
      required: false
    }
  ];

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Make API calls on component initialization
    this.fetchUsers();
    this.fetchNestedMenus();
    this.fetchPrivileges();
    
    // Don't load dummy data by default - let API data take precedence
    // this.loadDummyData();
    // this.flattenModules();
  }

  // Load dummy data for modules (matching User Access exactly)
  private loadDummyData(): void {
    this.modules = [
      {
        id: 1,
        name: 'Master',
        permissions: { add: false, edit: false, view: false, delete: false, comment: false, fghn: false },
        enabled: false,
        isExpanded: false,
        subModules: [
          {
            id: 11,
            name: 'New Sub Module',
            permissions: { add: false, edit: false, view: false, delete: false, comment: false, fghn: false },
            enabled: false,
            isExpanded: false,
            subModules: [],
            level: 2,
            parentId: 1
          },
          {
            id: 12,
            name: 'New Sub Module',
            permissions: { add: false, edit: false, view: false, delete: false, comment: false, fghn: false },
            enabled: false,
            isExpanded: false,
            subModules: [],
            level: 2,
            parentId: 1
          }
        ],
        level: 1,
        parentId: null
      },
      {
        id: 2,
        name: 'Proposal',
        permissions: { add: false, edit: false, view: false, delete: false, comment: false, fghn: false },
        enabled: false,
        isExpanded: false,
        subModules: [],
        level: 1,
        parentId: null
      },
      {
        id: 3,
        name: 'DMS',
        permissions: { add: false, edit: false, view: false, delete: false, comment: false, fghn: false },
        enabled: false,
        isExpanded: false,
        subModules: [],
        level: 1,
        parentId: null
      },
      {
        id: 4,
        name: 'Setup',
        permissions: { add: false, edit: false, view: false, delete: false, comment: false, fghn: false },
        enabled: false,
        isExpanded: false,
        subModules: [],
        level: 1,
        parentId: null
      },
      {
        id: 5,
        name: 'Home',
        permissions: { add: false, edit: false, view: false, delete: false, comment: false, fghn: false },
        enabled: false,
        isExpanded: false,
        subModules: [],
        level: 1,
        parentId: null
      },
      {
        id: 6,
        name: 'Schemes',
        permissions: { add: false, edit: false, view: false, delete: false, comment: false, fghn: false },
        enabled: false,
        isExpanded: false,
        subModules: [],
        level: 1,
        parentId: null
      }
    ];
  }

  // Fetch users from API
  private fetchUsers(): void {
    this.isLoadingUsers = true;
    //console.log('Fetching users from:', this.USERS_API);
    
    this.apiService.get(this.USERS_API).subscribe({
      next: (response: any) => {
        //console.log('Users API Response:', response);
        
        if (response && response.results && response.results.data) {
          // Handle nested response structure
          this.userOptions = response.results.data.map((user: any) => ({
            id: user.id,
            label: `${user.first_name} ${user.last_name} (${user.loginname})`,
            value: user.id,
            ...user
          }));
        } else if (response && Array.isArray(response)) {
          // Handle direct array response
          this.userOptions = response.map((user: any) => ({
            id: user.id,
            label: `${user.first_name} ${user.last_name} (${user.loginname})`,
            value: user.id,
            ...user
          }));
        } else {
          console.warn('Unexpected users API response format:', response);
          this.userOptions = [];
        }
        
        // Update users array for template binding
        this.users = this.userOptions;
        
        //console.log('Processed user options:', this.userOptions);
        this.isLoadingUsers = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching users:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch users'
        });
        this.isLoadingUsers = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Fetch nested menus from API
  private fetchNestedMenus(): void {
    this.isLoadingNestedMenus = true;
    this.apiService.get(this.NESTED_MENUS_API).subscribe({
      next: (response: any) => {
        
        if (response && Array.isArray(response) && response.length > 0) {
          // Transform API response to modules structure
          this.modules = this.transformNestedMenusToModules(response);
          // Flatten modules for table display
          this.flattenModules();
        } else {
          //console.log('No nested menus data, using fallback data');
          this.loadDummyData();
          this.flattenModules();
        }
      },
      error: (error) => {
        console.error('Error fetching nested menus:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch nested menus. Using fallback data.'
        });
        // Use fallback data on error
        this.loadDummyData();
        this.flattenModules();
      },
      complete: () => {
        this.isLoadingNestedMenus = false;
      }
    });
  }

  // Fetch privileges from API
  private fetchPrivileges(): void {
    this.isLoadingPrivileges = true;
    this.apiService.get(this.PRIVILEGES_API).subscribe({
      next: (response: any) => {
        // Assuming response is an array of modules
        this.modules.forEach(module => {
          const privilege = response.find((p: any) => p.module_id === module.id);
          if (privilege) {
            module.permissions = privilege.permissions;
            module.enabled = privilege.enabled;
          }
        });
        this.isLoadingPrivileges = false;
      },
      error: (error) => {
        console.error('Error fetching privileges:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch privileges. Using fallback data.'
        });
        // Fallback to dummy data
        this.modules.forEach(module => {
          module.permissions = { add: false, edit: false, view: false, delete: false, comment: false, fghn: false };
          module.enabled = false;
        });
        this.isLoadingPrivileges = false;
      },
      complete: () => {
        this.isLoadingPrivileges = false;
      }
    });
  }

  // Flatten modules for table display
  private flattenModules(): void {
    this.flattenedModules = this.flattenModulesRecursive(this.modules);
  }

  private flattenModulesRecursive(modules: Module[]): Module[] {
    let result: Module[] = [];
    
    for (const module of modules) {
      result.push(module);
      // Only show sub-modules if the parent module is expanded
      if (module.subModules && module.subModules.length > 0 && module.isExpanded) {
        result = result.concat(this.flattenModulesRecursive(module.subModules));
      }
    }
    
    return result;
  }

  // Toggle module expansion
  toggleModuleExpansion(moduleId: number): void {
    const module = this.findModuleById(moduleId);
    if (module) {
      module.isExpanded = !module.isExpanded;
      this.flattenModules();
      this.cdr.detectChanges(); // Force change detection
    }
  }

  // Find module by ID
  private findModuleById(moduleId: number): Module | null {
    return this.findModuleByIdRecursive(this.modules, moduleId);
  }

  private findModuleByIdRecursive(modules: Module[], moduleId: number): Module | null {
    for (const module of modules) {
      if (module.id === moduleId) {
        return module;
      }
      if (module.subModules && module.subModules.length > 0) {
        const found = this.findModuleByIdRecursive(module.subModules, moduleId);
        if (found) return found;
      }
    }
    return null;
  }

  // Reset expansion states
  private resetExpansionStates(): void {
    this.modules.forEach(module => {
      module.isExpanded = false;
      if (module.subModules && module.subModules.length > 0) {
        module.subModules.forEach((subModule: any) => {
          subModule.isExpanded = false;
        });
      }
    });
  }

  // Handle user selection change
  onUserSelectionChange(): void {
    if (this.selectedUserId) {
      // Find the selected user
      const selectedUser = this.userOptions.find(user => user.id === this.selectedUserId);
      if (selectedUser) {
        // Fetch user-specific access permissions
        this.fetchUserAccess(this.selectedUserId);
        
        this.messageService.add({
          severity: 'info',
          summary: 'User Selected',
          detail: `Viewing permissions for: ${selectedUser.first_name} ${selectedUser.last_name}`
        });
      }
    }
  }

  // Fetch user access permissions from API
  private fetchUserAccess(userId: number): void {
    this.isLoadingUserAccess = true;
    const apiUrl = `${this.USER_ACCESS_API}?user_id=${userId}`;
    
    //console.log('Fetching user access from:', apiUrl);
    
    this.apiService.get(apiUrl).subscribe({
      next: (response: any) => {
        //console.log('User access API response:', response);
        
        if (response && Array.isArray(response) && response.length > 0) {
          // Transform the API response to our modules structure
          this.modules = this.transformUserAccessResponseToModules(response);
          //console.log('Transformed modules:', this.modules);
        } else {
          //console.log('No user-specific permissions found, using default permissions');
          // Keep existing modules with default permissions
        }
        
        this.flattenModules();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching user access:', error);
        this.messageService.add({
          severity: 'warn',
          summary: 'API Warning',
          detail: 'Failed to fetch user permissions. Using default permissions.'
        });
        
        // Keep existing module structure with default permissions
        this.flattenModules();
        this.cdr.detectChanges();
      },
      complete: () => {
        this.isLoadingUserAccess = false;
      }
    });
  }

  // Transform user access API response to modules structure
  private transformUserAccessResponseToModules(userAccessResponse: any[]): any[] {
    const modules: any[] = [];
    const privilegesSet = new Set<string>();
    
    userAccessResponse.forEach(menuItem => {
      const module = {
        id: menuItem.id,
        name: menuItem.name,
        url: menuItem.url,
        icon: menuItem.icon,
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
        enabled: false,
        subModules: this.transformSubMenusFromUserAccess(menuItem.sub_menus || [], 1, menuItem.id)
      };

      // Map privileges if they exist
      if (menuItem.privileges && Array.isArray(menuItem.privileges)) {
        menuItem.privileges.forEach((privilege: any) => {
          // Add privilege name to the set for unique privileges
          privilegesSet.add(privilege.name);
          
          // Add privilege to module
          module.privileges!.push({
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
    
    // Update CSS custom properties for table column sizing
    this.updateTableColumnSizing();
    
    return modules;
  }

  // Transform sub-menus from user access response
  private transformSubMenusFromUserAccess(subMenus: any[], level: number, parentId: number): any[] {
    const subModules: any[] = [];
    
    subMenus.forEach(subMenu => {
      const subModule = {
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
        privileges: [] as any[],
        enabled: false,
        subModules: this.transformSubMenusFromUserAccess(subMenu.sub_menus || [], level + 1, subMenu.id)
      };

      // Map privileges if they exist
      if (subMenu.privileges && Array.isArray(subMenu.privileges)) {
        subMenu.privileges.forEach((privilege: any) => {
          subModule.privileges!.push({
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

  // Reset permissions
  private resetPermissions(): void {
    this.modules.forEach(module => {
      module.permissions = { add: false, edit: false, view: false, delete: false, comment: false, fghn: false };
      module.enabled = false;
    });
    this.resetExpansionStates();
    this.flattenModules();
  }

  // Handle permission change
  onPermissionChange(moduleId: number, permission: string, value: boolean): void {
    const module = this.findModuleById(moduleId);
    if (module) {
      (module.permissions as any)[permission] = value;
    }
  }

  // Handle toggle change
  onToggleChange(moduleId: number, value: boolean): void {
    const module = this.findModuleById(moduleId);
    if (module) {
      module.enabled = value;
    }
  }

  // Get privilege value for a module
  getPrivilegeValue(module: any, privilegeName: string): boolean {
    if (module.privileges && Array.isArray(module.privileges)) {
      const privilege = module.privileges.find((p: any) => p.name === privilegeName);
      return privilege ? privilege.status : false;
    }
    return false;
  }

  // Handle privilege change
  onPrivilegeChange(moduleId: number, privilegeName: string, value: boolean): void {
    const module = this.findModuleById(moduleId);
    if (module) {
      if (!module.privileges) {
        module.privileges = [];
      }
      
      let privilege = module.privileges.find((p: any) => p.name === privilegeName);
      if (!privilege) {
        privilege = { 
          id: Date.now(), // Generate a temporary ID
          name: privilegeName, 
          description: privilegeName, // Use name as description
          status: value 
        };
        module.privileges.push(privilege);
      } else {
        privilege.status = value;
      }
    }
  }

  // Edit module
  editModule(module: any): void {
    //console.log('Editing module:', module);
    this.selectedModule = { ...module };
    this.moduleEditData = {
      name: module.name,
      url: module.url || '',
      icon: module.icon || '',
      enabled: module.enabled
    };
    this.showEditModuleForm = true;
  }

  // Delete module
  deleteModule(module: any): void {
    //console.log('Deleting module:', module);
    this.selectedModule = module;
    this.showDeleteModuleModal = true;
  }

  // Handle module edit form submission
  handleModuleEditSubmit(data: any): void {
    if (this.selectedModule) {
      // Update the module with new data
      this.selectedModule.name = data.name;
      this.selectedModule.url = data.url;
      this.selectedModule.icon = data.icon;
      this.selectedModule.enabled = data.enabled;
      
      // Refresh flattened modules
      this.flattenModules();
      
      this.messageService.add({
        severity: 'success',
        summary: 'Module Updated',
        detail: `Module "${this.selectedModule.name}" has been updated successfully`
      });
      
      this.closeEditModuleForm();
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
  confirmModuleDelete(): void {
    if (this.selectedModule) {
      // Find and remove the module from the modules array
      this.removeModuleRecursively(this.modules, this.selectedModule.id);
      
      // Refresh flattened modules
      this.flattenModules();
      
      this.messageService.add({
        severity: 'success',
        summary: 'Module Deleted',
        detail: `Module "${this.selectedModule.name}" has been deleted successfully`
      });
      
      this.closeDeleteModuleModal();
    }
  }

  // Close delete module modal
  closeDeleteModuleModal(): void {
    this.showDeleteModuleModal = false;
    this.selectedModule = null;
  }

  // Helper method to remove module from array recursively
  private removeModuleRecursively(modules: any[], moduleId: number): boolean {
    for (let i = 0; i < modules.length; i++) {
      if (modules[i].id === moduleId) {
        modules.splice(i, 1);
        return true;
      }
      if (modules[i].subModules && modules[i].subModules.length > 0) {
        if (this.removeModuleRecursively(modules[i].subModules, moduleId)) {
          return true;
        }
      }
    }
    return false;
  }

  // Add Menu Form Methods
  addModule(): void {
    //console.log('=== ADD MODULE METHOD CALLED ===');
    //console.log('Current showAddMenuForm:', this.showAddMenuForm);
    //console.log('Current addMenuFormConfig:', this.menuFormConfig);
    
    this.showAddMenuForm = true;
    //console.log('After setting showAddMenuForm to true:', this.showAddMenuForm);
    
    this.populateParentMenuOptions();
    //console.log('Parent menu options populated');
    
    // Force change detection
    this.cdr.detectChanges();
    //console.log('Change detection forced');
    
    //console.log('=== END ADD MODULE METHOD ===');
  }

  // Test method for debugging
  testFormOpen(): void {
    //console.log('=== TEST FORM OPEN METHOD ===');
    //console.log('Current showAddMenuForm:', this.showAddMenuForm);
    
    // Try different approaches
    this.showAddMenuForm = true;
    //console.log('Set showAddMenuForm to true');
    
    setTimeout(() => {
      //console.log('After timeout - showAddMenuForm:', this.showAddMenuForm);
      this.cdr.detectChanges();
      //console.log('Change detection after timeout');
    }, 100);
    
    //console.log('=== END TEST FORM OPEN ===');
  }

  // ===== CRUD OPERATIONS FOR MENUS =====

  // CREATE - POST new menu
  createMenu(menuData: any): void {
    //console.log('Creating new menu:', menuData);
    
    this.apiService.post(this.MENUS_API, menuData).subscribe({
      next: (response: any) => {
        //console.log('Menu created successfully:', response);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'New menu created successfully!'
        });

        // Add the new menu to the modules array
        const newModule = this.transformMenuToModule(response);
        this.modules.push(newModule);
        this.flattenModules();
        this.cdr.detectChanges();

        // Close the form
        this.closeAddMenuForm();
      },
      error: (error) => {
        console.error('Error creating menu:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create new menu. Please try again.'
        });
      }
    });
  }

  // UPDATE - PUT existing menu
  updateMenu(menuId: number, menuData: any): void {
    //console.log('Updating menu:', menuId, menuData);
    
    const updateUrl = `${this.MENUS_API}${menuId}/`;
    
    this.apiService.put(updateUrl, menuData).subscribe({
      next: (response: any) => {
        //console.log('Menu updated successfully:', response);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Menu updated successfully!'
        });

        // Update the existing module in the modules array
        this.updateModuleInArray(menuId, response);
        this.flattenModules();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating menu:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update menu. Please try again.'
        });
      }
    });
  }

  // DELETE - DELETE existing menu
  deleteMenu(menuId: number): void {
    //console.log('Deleting menu:', menuId);
    
    const deleteUrl = `${this.MENUS_API}${menuId}/`;
    
    this.apiService.delete(deleteUrl).subscribe({
      next: (response: any) => {
        //console.log('Menu deleted successfully:', response);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Menu deleted successfully!'
        });

        // Remove the module from the modules array
        this.removeModuleFromArray(menuId);
        this.flattenModules();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error deleting menu:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete menu. Please try again.'
        });
      }
    });
  }

  // Helper method to transform API response to module structure
  private transformMenuToModule(menuResponse: any): any {
    return {
      id: menuResponse.id || Date.now(),
      name: menuResponse.name,
      url: menuResponse.url,
      icon: menuResponse.icon || 'pi pi-file',
      permissions: {
        add: false, edit: false, view: false, delete: false, comment: false, fghn: false
      },
      enabled: false,
      isExpanded: false,
      subModules: [],
      level: menuResponse.parent_id ? 1 : 0,
      parentId: menuResponse.parent_id
    };
  }

  // Helper method to update existing module in array
  private updateModuleInArray(menuId: number, updatedData: any): void {
    const moduleIndex = this.modules.findIndex(module => module.id === menuId);
    if (moduleIndex !== -1) {
      this.modules[moduleIndex] = {
        ...this.modules[moduleIndex],
        name: updatedData.name,
        url: updatedData.url,
        icon: updatedData.icon || this.modules[moduleIndex].icon
      };
    }
  }

  // Helper method to remove module from array
  private removeModuleFromArray(menuId: number): void {
    this.modules = this.modules.filter(module => module.id !== menuId);
  }

  // Edit menu - opens edit form
  editMenu(module: Module): void {
    //console.log('Editing module:', module);
    
    // Populate the form with existing data
    this.newMenu = {
      name: module.name,
      url: module.url || '',
      icon: module.icon || '',
      parent_id: module.parentId
    };
    
    // Update form configuration for edit mode
    this.menuFormConfig = this.menuFormConfig.map(field => {
      if (field.key === 'name') {
        return { ...field, label: 'Menu Name (Edit)', placeholder: 'Enter updated menu name' };
      }
      return field;
    });
    
    // Show the form in edit mode
    this.showAddMenuForm = true;
    this.populateParentMenuOptions();
    
    // Store the module being edited
    this.editingModuleId = module.id;
  }

  // Handle edit form submission
  handleEditMenuSubmit(formData: any): void {
    if (this.editingModuleId) {
      this.updateMenu(this.editingModuleId, formData);
      this.editingModuleId = null;
      this.closeAddMenuForm();
    }
  }

  // Property to track which module is being edited
  editingModuleId: number | null = null;

  // ===== SUB MODULE OPERATIONS =====

  // Add sub module
  addSubModule(parentModule: any): void {
    //console.log('=== ADD SUB MODULE METHOD CALLED ===');
    //console.log('Parent module:', parentModule);
    
    // Set the parent_id in the form
    this.newSubModule.parent_id = parentModule.id;
    
    // Populate parent module options
    this.populateSubModuleParentOptions();
    
    // Show the sub-module form
    this.showSubModuleForm = true;
    
    //console.log('Sub-module form opened for parent:', parentModule.id);
    //console.log('=== END ADD SUB MODULE METHOD ===');
  }

  // Add sub module from table actions
  addSubModuleFromTable(module: any): void {
    //console.log('Adding sub module from table for module:', module);
    
    // Check if this module can have sub modules
    if (module.level === 0 || module.level === 1) {
      this.addSubModule(module);
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Cannot add sub modules to this level'
      });
    }
  }

  // Close sub-module form
  // This method is now defined later in the class

  // Handle sub-module form submission
  handleSubModuleSubmit(formData: any): void {
    if (this.isLoadingAddSubModule) {
      return;
    }

    this.isLoadingAddSubModule = true;
    //console.log('Submitting sub-module form:', formData);

    if (this.editingSubModuleId) {
      // Edit mode - update existing sub-module
      //console.log('Updating existing sub-module:', this.editingSubModuleId);
      this.updateSubModule(this.editingSubModuleId, formData);
      this.editingSubModuleId = null;
    } else {
      // Create mode - create new sub-module
      //console.log('Creating new sub-module');
      this.createSubModule(formData);
    }
    
    // Reset loading state
    this.isLoadingAddSubModule = false;
  }

  // Create sub-module via API
  createSubModule(subModuleData: any): void {
    //console.log('Creating new sub-module:', subModuleData);
    
    // Use the parent_id from the form data
    const dataToSend = {
      ...subModuleData,
      parent_id: subModuleData.parent_id || this.newSubModule.parent_id
    };
    
    //console.log('Data to send to API:', dataToSend);
    
    this.apiService.post(this.MENUS_API, dataToSend).subscribe({
      next: (response: any) => {
        //console.log('Sub-module created successfully:', response);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'New sub-module created successfully!'
        });

        // Add the new sub-module to the modules array
        const newSubModule = this.transformSubModuleToModule(response);
        this.addSubModuleToParent(newSubModule);
        this.flattenModules();
        this.cdr.detectChanges();

        // Close the form
        this.closeSubModuleForm();
      },
      error: (error) => {
        console.error('Error creating sub-module:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create new sub-module. Please try again.'
        });
      }
    });
  }

  // Update sub-module
  updateSubModule(subModuleId: number, subModuleData: any): void {
    //console.log('Updating sub-module:', subModuleId, subModuleData);
    
    const updateUrl = `${this.MENUS_API}${subModuleId}/`;
    
    this.apiService.put(updateUrl, subModuleData).subscribe({
      next: (response: any) => {
        //console.log('Sub-module updated successfully:', response);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Sub-module updated successfully!'
        });

        // Update the existing sub-module in the modules array
        this.updateSubModuleInArray(subModuleId, response);
        this.flattenModules();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating sub-module:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update sub-module. Please try again.'
        });
      }
    });
  }

  // Delete sub-module
  deleteSubModule(subModuleId: number): void {
    //console.log('Deleting sub-module:', subModuleId);
    
    const deleteUrl = `${this.MENUS_API}${subModuleId}/`;
    
    this.apiService.delete(deleteUrl).subscribe({
      next: (response: any) => {
        //console.log('Sub-module deleted successfully:', response);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Sub-module deleted successfully!'
        });

        // Remove the sub-module from the modules array
        this.removeSubModuleFromArray(subModuleId);
        this.flattenModules();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error deleting sub-module:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete sub-module. Please try again.'
        });
      }
    });
  }

  // Helper method to transform sub-module API response to module structure
  private transformSubModuleToModule(subModuleResponse: any): any {
    return {
      id: subModuleResponse.id || Date.now(),
      name: subModuleResponse.name,
      url: subModuleResponse.url,
      icon: subModuleResponse.icon || 'pi pi-file',
      permissions: {
        add: false, edit: false, view: false, delete: false, comment: false, fghn: false
      },
      enabled: false,
      isExpanded: false,
      subModules: [],
      level: 2, // Sub-modules are level 2
      parentId: subModuleResponse.parent_id
    };
  }

  // Helper method to add sub-module to parent module
  private addSubModuleToParent(newSubModule: any): void {
    const parentModule = this.findModuleById(newSubModule.parentId);
    if (parentModule) {
      if (!parentModule.subModules) {
        parentModule.subModules = [];
      }
      parentModule.subModules.push(newSubModule);
      //console.log('Sub-module added to parent:', parentModule.name);
    } else {
      console.warn('Parent module not found for sub-module:', newSubModule.parentId);
    }
  }

  // Helper method to update sub-module in array
  private updateSubModuleInArray(subModuleId: number, updatedData: any): void {
    // Find and update the sub-module in the modules array
    this.modules.forEach(module => {
      if (module.subModules) {
        const subModuleIndex = module.subModules.findIndex((sub: any) => sub.id === subModuleId);
        if (subModuleIndex !== -1) {
          module.subModules[subModuleIndex] = {
            ...module.subModules[subModuleIndex],
            name: updatedData.name,
            url: updatedData.url,
            icon: updatedData.icon || module.subModules[subModuleIndex].icon
          };
        }
      }
    });
  }

  // Helper method to remove sub-module from array
  private removeSubModuleFromArray(subModuleId: number): void {
    this.modules.forEach(module => {
      if (module.subModules) {
        module.subModules = module.subModules.filter((sub: any) => sub.id !== subModuleId);
      }
    });
  }

  // Reset sub-module form
  private resetSubModuleForm(): void {
    this.newSubModule = {
      name: '',
      url: '',
      icon: '',
      parent_id: null
    };
  }

  // Populate parent dropdown options for sub-modules
  // This method is now public and defined later in the class

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

  // Getter for selected user details (safe for template)
  get selectedUserDetails(): any {
    return this.userOptions.find(u => u.id === this.selectedUserId) || null;
  }

  // Refresh users list
  refreshUsers(): void {
    //console.log('Refreshing users...');
    this.fetchUsers();
  }

  // Transform nested menus to modules for the UI
  private transformNestedMenusToModules(nestedMenus: any[]): any[] {
    const modules: any[] = [];

    nestedMenus.forEach(menu => {
      const module = {
        id: menu.id,
        name: menu.name,
        url: menu.url,
        icon: menu.icon,
        hasSubModules: menu.sub_menus && menu.sub_menus.length > 0,
        isExpanded: false,
        level: 1, // Changed from 0 to 1 for main modules
        parentId: null,
        permissions: {
          add: false,
          edit: false,
          view: false,
          delete: false,
          comment: false,
          fghn: false
        },
        enabled: false,
        subModules: this.transformSubMenus(menu.sub_menus || [], 2, menu.id) // Changed from 1 to 2 for sub-modules
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

    return modules;
  }

  private transformSubMenus(subMenus: any[], level: number, parentId: number): any[] {
    const transformedSubMenus: any[] = [];
    subMenus.forEach(subMenu => {
      const subModule = {
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
        enabled: false,
        subModules: this.transformSubMenus(subMenu.sub_menus || [], level + 1, subMenu.id)
      };

      // Map privileges if they exist
      if (subMenu.privileges && Array.isArray(subMenu.privileges)) {
        subMenu.privileges.forEach((privilege: any) => {
          if (privilege.name === 'Add') subModule.permissions.add = privilege.status;
          else if (privilege.name === 'Edit') subModule.permissions.edit = privilege.status;
          else if (privilege.name === 'View') subModule.permissions.view = privilege.status;
          else if (privilege.name === 'Delete') subModule.permissions.delete = privilege.status;
          else if (privilege.name === 'Comment') subModule.permissions.comment = privilege.status;
          else if (privilege.name === 'fghn') subModule.permissions.fghn = privilege.status;
        });
      }

      transformedSubMenus.push(subModule);
    });
    return transformedSubMenus;
  }

  // Edit sub-module - opens edit form
  editSubModule(subModule: Module): void {
    //console.log('Editing sub-module:', subModule);
    
    // Populate the form with existing data
    this.newSubModule = {
      name: subModule.name,
      url: subModule.url || '',
      icon: subModule.icon || '',
      parent_id: subModule.parentId
    };
    
    // Update form configuration for edit mode
    this.subModuleFormConfig = this.subModuleFormConfig.map(field => {
      if (field.key === 'name') {
        return { ...field, label: 'Sub Module Name (Edit)', placeholder: 'Enter updated sub module name' };
      }
      return field;
    });
    
    // Populate parent dropdown options
    this.populateSubModuleParentOptions();
    
    // Show the form in edit mode
    this.showSubModuleForm = true;
    
    // Store the sub-module being edited
    this.editingSubModuleId = subModule.id;
  }

  // Handle edit sub-module form submission
  handleEditSubModuleSubmit(formData: any): void {
    if (this.editingSubModuleId) {
      this.updateSubModule(this.editingSubModuleId, formData);
      this.editingSubModuleId = null;
      this.closeSubModuleForm();
    }
  }

  // Property to track which sub-module is being edited
  editingSubModuleId: number | null = null;

  // Navigation
  goBack(): void {
    window.history.back();
  }

  // Add missing methods for template
  addNewMenu(): void {
    this.showAddMenuForm = true;
    this.populateParentMenuOptions();
  }

  onUserSelect(event: any): void {
    //console.log('User selection event:', event);
    
    if (event && event.value) {
      // When using ngModel, event.value contains the selected user object
      this.selectedUser = event.value;
      this.selectedUserId = event.value.id;
      
      //console.log('Selected user:', this.selectedUser);
      //console.log('Selected user ID:', this.selectedUserId);
      
      if (this.selectedUserId) {
        this.fetchUserAccess(this.selectedUserId);
      }
    } else if (event && event.id) {
      // Fallback for direct object selection
      this.selectedUser = event;
      this.selectedUserId = event.id;
      
      //console.log('Selected user (fallback):', this.selectedUser);
      //console.log('Selected user ID (fallback):', this.selectedUserId);
      
      if (this.selectedUserId) {
        this.fetchUserAccess(this.selectedUserId);
      }
    }
  }

  closeAllMenus(): void {
    // Implementation for closing all menus
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'All menus closed'
    });
  }

  addSubMenu(): void {
    this.showSubModuleForm = true;
    this.populateSubModuleParentOptions();
  }

  testForm(): void {
    // Implementation for testing form
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Form test completed'
    });
  }

  // Form handling methods
  handleAddMenuSubmit(formData: any): void {
    //console.log('Submitting menu form:', formData);
    
    // Call API to create menu
    this.apiService.post(this.MENUS_API, formData).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Menu created successfully'
        });
        this.closeAddMenuForm();
        this.refreshData();
      },
      error: (error) => {
        console.error('Error creating menu:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create menu'
        });
      }
    });
  }

  handleAddSubModuleSubmit(formData: any): void {
    //console.log('Submitting sub module form:', formData);
    
    // Call API to create sub module
    this.apiService.post(this.MENUS_API, formData).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Sub module created successfully'
        });
        this.closeSubModuleForm();
        this.refreshData();
      },
      error: (error) => {
        console.error('Error creating sub module:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create sub module'
        });
      }
    });
  }

  closeAddMenuForm(): void {
    this.showAddMenuForm = false;
    // Reset the newMenu object
    this.newMenu = {
      name: '',
      url: '',
      icon: '',
      parent_id: null
    };
  }

  closeSubModuleForm(): void {
    this.showSubModuleForm = false;
    // Reset the newSubModule object
    this.newSubModule = {
      name: '',
      url: '',
      icon: '',
      parent_id: null
    };
  }

  refreshData(): void {
    // Refresh the data after creating new items
    this.fetchNestedMenus();
    if (this.selectedUserId) {
      this.fetchUserAccess(this.selectedUserId);
    } else {
      // If no user is selected, still refresh the modules structure
      this.flattenModules();
      this.cdr.detectChanges();
    }
  }

  // Public wrapper methods for private populate methods
  public populateParentMenuOptions(): void {
    // Create options for parent menu selection
    this.parentMenuOptions = [
      { label: 'No Parent (Top Level)', value: null }
    ];

    // Add existing modules as parent options
    this.modules.forEach(module => {
      this.parentMenuOptions.push({
        label: module.name,
        value: module.id
      });
    });

    // Update the form configuration with parent options
    this.menuFormConfig = this.menuFormConfig.map(field => {
      if (field.key === 'parent_id') {
        return { ...field, options: this.parentMenuOptions };
      }
      return field;
    });
  }

  public populateSubModuleParentOptions(): void {
    // Create options for parent module selection (only level 1 modules)
    this.parentModuleOptions = [];

    // Add existing level 1 modules as parent options
    this.modules.forEach(module => {
      if (module.level === 1) {
        this.parentModuleOptions.push({
          label: module.name,
          value: module.id
        });
      }
    });

    // Update the form configuration with parent options
    this.subModuleFormConfig = this.subModuleFormConfig.map(field => {
      if (field.key === 'parent_id') {
        return { ...field, options: this.parentModuleOptions };
      }
      return field;
    });
  }

  // Save changes
  saveChanges(): void {
    if (!this.selectedUserId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a user first'
      });
      return;
    }

    if (!this.selectedUser) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a user first'
      });
      return;
    }

    // Show loading state
    this.isLoadingUserAccess = true;

    // Prepare the data to send to the API
    const saveData = {
      user: { id: this.selectedUserId },
      menu_access: this.prepareMenuAccessData()
    };

    //console.log('Saving user menu mappings:', saveData);

    // Make API call to save the user-menu mappings
    this.apiService.post(this.USER_ACCESS_API, saveData).subscribe({
      next: (response: any) => {
        //console.log('User access permissions saved successfully:', response);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User access permissions saved successfully'
        });

        // Refresh the data to ensure consistency
        this.refreshData();
      },
      error: (error) => {
        console.error('Error saving user access permissions:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Save Error',
          detail: 'Failed to save user access permissions. Please try again.'
        });
      },
      complete: () => {
        this.isLoadingUserAccess = false;
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
        url: module.url || '/',
        icon: module.icon || 'icon',
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
      url: subModule.url || '/',
      icon: subModule.icon || 'icon',
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

  // Close all dropdowns
  closeAllDropdowns(): void {
    this.resetExpansionStates();
    this.flattenModules();
  }

  // Update CSS custom properties for table column sizing
  private updateTableColumnSizing(): void {
    // Set CSS custom property for privilege column count
    document.documentElement.style.setProperty('--privilege-count', this.availablePrivileges.length.toString());
  }
}
