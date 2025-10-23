import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

export interface RouteConfigData {
  routeType: 'internal' | 'external' | null;
  user: any;
  permissionType: 'edit' | 'comment' | 'view' | null;
  directorate: any;
  success?: boolean;
  data?: any;
  error?: any;
  payload?: RouteConfigApiPayload;
}

export interface RouteConfigApiPayload {
  directorate?: number;
  permission_type?: string;
  is_granted?: boolean;
  route_type: 'external' | 'internal';
  sub_module: number;
  transaction_id?: number | string;
  user?: number | null;
  vessel: number;
  is_approver?: boolean;
}

@Component({
  selector: 'app-route-config-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './route-config-popup.component.html',
  styleUrls: ['./route-config-popup.component.css']
})
export class RouteConfigPopupComponent implements OnChanges, OnInit {
  // Input properties for configuration
  @Input() isVisible: boolean = false;
  @Input() title: string = 'Route Configuration';
  @Input() subtitle: string = 'Smart Configuration';
  @Input() users: any[] = [];
  @Input() directorates: any[] = [];
  @Input() submodule?: string | number;
  @Input() shipId?: string | number;
  @Input() transactionId?: string | number; // Transaction ID for the form
  @Input() unitId?: string | number; // Unit ID for filtering users
  @Input() useApi: boolean = false;

  // Output events
  @Output() close = new EventEmitter<void>();
  @Output() configureRoute = new EventEmitter<void>();
  @Output() saveDirectly = new EventEmitter<void>();
  @Output() routeConfigSaved = new EventEmitter<RouteConfigData>();
  @Output() refreshTimeline = new EventEmitter<void>();

  // Internal state
  showAddRouteConfigPopup = false;
  selectedRouteType: 'internal' | 'external' | null = null;
  selectedUser: any = null;
  selectedPermissionType: 'edit' | 'comment' | 'view' | null = null;
  isApprover: boolean = false;
  selectedDirectorate: any = null;
  directoratesLoading = false;
  usersLoading = false;
  saving = false;
  userClickedConfigureRoute = false; // Track if user explicitly clicked Configure Route
  
  // Form control properties for dropdowns
  selectedUserId: string | number | null = null;
  selectedDirectorateId: string | number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    console.log('🚀 ADD ROUTE CONFIG POPUP - ngOnChanges called with changes:', Object.keys(changes));
    
    if (changes['isVisible']) {
      console.log('🚀 ADD ROUTE CONFIG POPUP - isVisible changed to:', this.isVisible);
      console.log('🚀 ADD ROUTE CONFIG POPUP - Transaction ID:', this.transactionId);
      
      // If popup becomes visible and we have a transaction_id, automatically show the add route config popup
      if (this.isVisible && this.transactionId) {
        console.log('🚀 ADD ROUTE CONFIG POPUP - Transaction ID available, showing add route config popup');
        setTimeout(() => {
          this.isVisible = false;
          this.showAddRouteConfigPopup = true;
          this.selectedRouteType = null;
          this.resetSelections();
          console.log('🚀 ADD ROUTE CONFIG POPUP - showAddRouteConfigPopup set to true');
        }, 100);
      }
    }
    
    if (changes['transactionId']) {
      console.log('🚀 ADD ROUTE CONFIG POPUP - Transaction ID changed to:', this.transactionId);
      console.log('🚀 ADD ROUTE CONFIG POPUP - isVisible:', this.isVisible);
      console.log('🚀 ADD ROUTE CONFIG POPUP - userClickedConfigureRoute:', this.userClickedConfigureRoute);
      
      // Only show add route config popup if user clicked Configure Route AND transactionId is available
      if (this.transactionId && this.userClickedConfigureRoute) {
        console.log('🚀 ADD ROUTE CONFIG POPUP - User clicked Configure Route and Transaction ID available, showing add route config popup');
        setTimeout(() => {
          this.isVisible = false;
          this.showAddRouteConfigPopup = true;
          this.selectedRouteType = null;
          this.resetSelections();
          this.userClickedConfigureRoute = false; // Reset flag
          console.log('🚀 ADD ROUTE CONFIG POPUP - showAddRouteConfigPopup set to true');
        }, 100);
      }
    }
  }

  // Default data arrays - will be populated from API
  defaultUsers: any[] = [];
  defaultDirectorates: any[] = [];

  // Getter methods for data
  get userList() {
    // Use input users if provided, otherwise use API-loaded users
    return this.users.length > 0 ? this.users : this.defaultUsers;
  }

  get directorateList() {
    // Use input directorates if provided, otherwise use API-loaded directorates
    return this.directorates.length > 0 ? this.directorates : this.defaultDirectorates;
  }

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadDirectorates();
  }

  loadUsers(): void {
    this.usersLoading = true;
    
    // Use provided unitId or fallback to localStorage
    const unit = this.unitId || localStorage.getItem('unit_id');
    const endpoint = unit && String(unit).trim() !== '' ? `api/auth/users/?unit=${unit}` : 'api/auth/users/';
    
    this.apiService.get(endpoint).subscribe({
      next: (response: any) => {
        if (response && response.data && Array.isArray(response.data)) {
          // Transform API response to match expected format
          this.defaultUsers = response.data.map((user: any) => ({
            id: user.id,
            name: user.loginname, // Use loginname as the display name
            label: user.loginname,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            status: user.status
          }));
        } else {
          console.warn('No users data received from API');
          this.defaultUsers = [];
        }
        this.usersLoading = false;
      },
      error: (error: any) => {
        console.error('Error fetching users:', error);
        this.usersLoading = false;
        // Fallback to empty array on error
        this.defaultUsers = [];
      }
    });
  }

  loadDirectorates(): void {
    this.directoratesLoading = true;
    
    this.apiService.get('master/units/').subscribe({
      next: (response: any) => {
        if (response && response.data && Array.isArray(response.data)) {
          // Transform API response to match expected format
          this.defaultDirectorates = response.data.map((unit: any) => ({
            id: unit.id,
            name: unit.name,
            label: unit.name,
            code: unit.code
          }));
        } else {
          console.warn('No directorates data received from API');
          this.defaultDirectorates = [];
        }
        this.directoratesLoading = false;
      },
      error: (error: any) => {
        console.error('Error fetching directorates:', error);
        this.directoratesLoading = false;
        // Fallback to empty array on error
        this.defaultDirectorates = [];
      }
    });
  }

  // Main popup methods
  onClose(): void {
    this.close.emit();
  }

  onConfigureRouteClick(): void {
    console.log('🚀 ADD ROUTE CONFIG POPUP - Configure Route clicked');
    console.log('🚀 ADD ROUTE CONFIG POPUP - transactionId:', this.transactionId);
    console.log('🚀 ADD ROUTE CONFIG POPUP - useApi:', this.useApi);
    this.userClickedConfigureRoute = true; // Set flag to indicate user clicked Configure Route
    this.configureRoute.emit();
    this.isVisible = false;
    
    // Always show the Add Route Config popup when Configure Route is clicked
    console.log('🚀 ADD ROUTE CONFIG POPUP - Showing add route config popup');
    setTimeout(() => {
      this.showAddRouteConfigPopup = true;
      this.selectedRouteType = null;
      this.resetSelections();
      console.log('🚀 ADD ROUTE CONFIG POPUP - showAddRouteConfigPopup set to true');
    }, 100);
  }

  onConfigureRoute(): void {

    this.isVisible = false;
    this.showAddRouteConfigPopup = true;
    this.selectedRouteType = null;
    this.resetSelections();
  }

  onSaveDirectly(): void {

    this.saveDirectly.emit();
    this.isVisible = false;
  }

  // Add Route Config popup methods
  onRouteTypeSelected(routeType: 'internal' | 'external'): void {

    this.selectedRouteType = routeType;
    this.resetSelections();
  }

  onUserSelected(user: any): void {

    this.selectedUser = user;
  }

  onUserDropdownChange(event: any): void {
    const userId = event.target.value;
    if (userId) {
      const user = this.userList.find(u => u.id == userId);
      this.onUserSelected(user);
    } else {
      this.onUserSelected(null);
    }
  }

  onPermissionTypeSelected(permissionType: 'edit' | 'comment' | 'view'): void {

    this.selectedPermissionType = permissionType;
  }

  onDirectorateSelected(directorate: any): void {

    this.selectedDirectorate = directorate;
  }

  onDirectorateDropdownChange(event: any): void {
    const directorateId = event.target.value;
    if (directorateId) {
      const directorate = this.directorateList.find(d => d.id == directorateId);
      this.onDirectorateSelected(directorate);
    } else {
      this.onDirectorateSelected(null);
    }
  }

  onSaveAddRouteConfig(): void {
    if (this.selectedRouteType) {
      // Validate based on route type
      if (this.selectedRouteType === 'internal') {
        if (!this.selectedUser || !this.selectedPermissionType) {
          return;
        }
      } else if (this.selectedRouteType === 'external') {
        if (!this.selectedDirectorate) {
          return;
        }
      }

      if (this.useApi && this.submodule && this.shipId) {
        // Create API payload and make API call
        const apiPayload: RouteConfigApiPayload = this.createApiPayload();
        this.saveRouteConfigToApi(apiPayload);
      } else {
        // Emit the form data to parent component (for dummy data or custom handling)
        const routeConfigData: RouteConfigData = {
          routeType: this.selectedRouteType,
          user: this.selectedUser,
          permissionType: this.selectedPermissionType,
          directorate: this.selectedDirectorate
        };

        this.routeConfigSaved.emit(routeConfigData);
        this.showAddRouteConfigPopup = false;
        this.resetSelections();
      }
    }
  }

  onCancelAddRouteConfig(): void {

    this.showAddRouteConfigPopup = false;
    this.userClickedConfigureRoute = false; // Reset flag
    this.resetSelections();
  }

  closeAddRouteConfigPopup(): void {
    this.showAddRouteConfigPopup = false;
    this.userClickedConfigureRoute = false; // Reset flag
    this.resetSelections();
  }

  private resetSelections(): void {
    this.selectedUser = null;
    this.selectedPermissionType = null;
    this.isApprover = false;
    this.selectedDirectorate = null;
  }

  private createApiPayload(): RouteConfigApiPayload {
    const payload: RouteConfigApiPayload = {
      route_type: this.selectedRouteType as 'external' | 'internal',
      sub_module: Number(this.submodule),
      vessel: Number(this.shipId),
      transaction_id: this.transactionId ? Number(this.transactionId) : undefined
    };

    if (this.selectedRouteType === 'internal') {
      payload.user = this.selectedUser?.id || null;
      // Add directorate from localStorage for internal routes
      payload.directorate = localStorage.getItem('unit_id') ? Number(localStorage.getItem('unit_id')) : undefined;
      // Convert permission type to permissions array with proper structure
      if (this.selectedPermissionType) {
        payload.permission_type = this.selectedPermissionType;
        payload.is_granted = true;
      }
      // Add is_approver field for internal routes
      payload.is_approver = this.isApprover;
    } else if (this.selectedRouteType === 'external') {
      payload.user = null;
      payload.directorate = this.selectedDirectorate?.id;
      // Convert permission type to permissions array with proper structure for external routes too
      if (this.selectedPermissionType) {
        payload.permission_type = this.selectedPermissionType;
        payload.is_granted = true;
      }
    }

    return payload;
  }

  private saveRouteConfigToApi(payload: RouteConfigApiPayload): void {
    this.saving = true;
    
    this.apiService.post('config/route-configs/', payload).subscribe({
      next: (response: any) => {
        console.log('✅ Route config popup saved successfully, refreshing timeline...');
        this.saving = false;
        
        // Emit success event to parent
        this.routeConfigSaved.emit({
          success: true,
          data: response,
          payload: payload,
          routeType: this.selectedRouteType,
          user: this.selectedUser,
          permissionType: this.selectedPermissionType,
          directorate: this.selectedDirectorate
        });
        
        // Emit refresh timeline event to parent
        this.refreshTimeline.emit();
        
        this.showAddRouteConfigPopup = false;
        this.resetSelections();
      },
      error: (error: any) => {
        console.error('Error saving route config:', error);
        this.saving = false;
        
        // Emit error event to parent
        this.routeConfigSaved.emit({
          success: false,
          error: error,
          payload: payload,
          routeType: this.selectedRouteType,
          user: this.selectedUser,
          permissionType: this.selectedPermissionType,
          directorate: this.selectedDirectorate
        });
      }
    });
  }
}
