import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddFormComponent } from '../shared/components/add-form/add-form.component';
import { ApiService } from '../services/api.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';

interface TimelineItem {
  id: number;
  name: string;
  userType: 'external' | 'internal';
  status: 'completed' | 'working' | 'pending';
  timestamp: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  duration?: string;
  hasInternal?: boolean;
  internalUsers?: InternalUser[];
}

interface InternalUser {
  name: string;
  status: 'completed' | 'working' | 'pending';
  timestamp: string;
  role: string;
  duration?: string;
}

interface Option {
  label: string;
  value: number;
}

interface User {
  id: number;
  loginname: string;
  first_name: string;
  last_name: string;
  email: string;
  status: number;
  unit: number;
  unit_name: string;
  unit_id: number;
}

interface Directorate {
  id: number;
  name: string;
  code?: string;
}

interface RouteConfigFormData {
  id?: number;
  routeType: 'internal' | 'external' | '';
  userId?: number;
  permissionType?: 'edit' | 'comment' | 'view';
  isApprover?: boolean;
  directorateId?: number;
  vesselId?: string | number;
  subModule?: string | number;
  // permissions?: string[];
}

interface RouteConfigApiPayload {
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

// Service classes for managing dropdown data (similar to ShipCategoryService)
class UserService {
  // User data - will be populated from API
  private usersSubject = new BehaviorSubject<User[]>([]);
  private userOptionsSubject = new BehaviorSubject<Option[]>([]);
  private usersLoadingSubject = new BehaviorSubject<boolean>(false);
  private unitId: string | number | null = null;

  constructor(private apiService: ApiService) {}

  getUsers(): Observable<User[]> {
    return this.usersSubject.asObservable();
  }

  getUserOptions(): Observable<Option[]> {
    return this.userOptionsSubject.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.usersLoadingSubject.asObservable();
  }

  setUnitId(unitId: string | number | null | undefined): void {
    this.unitId = unitId || null;
  }

  loadAllUsersData(): void {
    this.usersLoadingSubject.next(true);
    
    // Use provided unitId or fallback to localStorage
    const unit = this.unitId || localStorage.getItem('unit_id');
    const endpoint = unit && String(unit).trim() !== '' ? `api/auth/users/?unit=${unit}` : 'api/auth/users/';
    
    this.apiService.get(endpoint).pipe(
      tap(response => {
        const users = response?.data || response?.results || response || [];
        
        this.usersSubject.next(users);

        const options = users.map((user: User) => ({
          label: user.loginname,
          value: user.id
        }));
        this.userOptionsSubject.next(options);
      })
    ).subscribe({
      next: () => this.usersLoadingSubject.next(false),
      error: (error) => {
        this.usersLoadingSubject.next(false);
        this.userOptionsSubject.next([]);
        console.error('Error loading users:', error);
      }
    });
  }
}

class DirectorateService {
  private directoratesSubject = new BehaviorSubject<Directorate[]>([]);
  private directorateOptionsSubject = new BehaviorSubject<Option[]>([]);
  private directoratesLoadingSubject = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getDirectorates(): Observable<Directorate[]> {
    return this.directoratesSubject.asObservable();
  }

  getDirectorateOptions(): Observable<Option[]> {
    return this.directorateOptionsSubject.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.directoratesLoadingSubject.asObservable();
  }

  loadAllDirectoratesData(): void {
    this.directoratesLoadingSubject.next(true);
    this.apiService.get('master/units/').pipe(
      tap(response => {
        let directorates: Directorate[] = [];
        
        if (response && response.data && Array.isArray(response.data)) {
          directorates = response.data.map((unit: any) => ({
            id: unit.id,
            name: unit.name,
            code: unit.code
          }));
        }
        
        this.directoratesSubject.next(directorates);

        const options = directorates.map((directorate: Directorate) => ({
          label: directorate.name,
          value: directorate.id
        }));
        this.directorateOptionsSubject.next(options);
      })
    ).subscribe({
      next: () => this.directoratesLoadingSubject.next(false),
      error: (error) => {
        this.directoratesLoadingSubject.next(false);
        this.directorateOptionsSubject.next([]);
        console.error('Error loading directorates:', error);
      }
    });
  }
}

@Component({
  selector: 'app-route-config',
  standalone: true,
  imports: [CommonModule, FormsModule, AddFormComponent],
  templateUrl: './route-config.component.html',
  styleUrls: ['./route-config.component.css']
})
export class RouteConfigComponent implements OnInit, OnDestroy, OnChanges {
  // Input properties for reusability
  @Input() transactionId?: string | number;
  @Input() submodule?: string | number;
  @Input() vesselId?: string | number; // Vessel/Ship ID for the form
  @Input() unitId?: string | number; // Unit ID for filtering users
  @Input() useApi: boolean = false; // Toggle between API and dummy data
  @Input() apiEndpoint?: string; // Custom API endpoint
  @Input() formTitle?: string = 'Add Route Config'; // Customizable form title
  @Input() hideButtons: boolean = false; // Hide action buttons (Next Step, Edit Route Config)
  
  // Output events for parent components
  @Output() routeConfigSaved = new EventEmitter<any>();
  @Output() nextStepClicked = new EventEmitter<any>();
  @Output() timelineToggled = new EventEmitter<boolean>();
  
  expandedItems: { [key: number]: boolean } = {};
  animatedNodes: Set<number> = new Set();
  selectedNode: TimelineItem | null = null;
  timelineData: TimelineItem[] = [];
  loading = false;
  error: string | null = null;
  showTimeline = true;
  
  // Form properties
  isFormOpen = false;
  routeConfigFormData: RouteConfigFormData = {
    routeType: '',
    userId: undefined,
    permissionType: undefined,
    directorateId: undefined,
    vesselId: undefined,
    subModule: undefined,
    // permissions: []
  };

  // Next Step Modal properties
  showNextStepModal = false;
  reviewRemarks = '';

  // Add Another Route Configuration Modal properties
  showAddAnotherModal = false;
  
  // Service instances for dropdown management
  private userService: UserService;
  private directorateService: DirectorateService;
  private subscriptions = new Subscription();
  
  // Dropdown data (will be populated by services)
  users: Option[] = [];
  directorates: Option[] = [];
  usersLoading = false;
  directoratesLoading = false;
  
  // Form configuration for the reusable AddFormComponent
  routeConfigFormConfig: any[] = [];
  
  // Get visible fields only
  get visibleFormConfig(): any[] {
    const visible = this.routeConfigFormConfig.filter(field => !field.hide);
    return visible;
  }

  constructor(private apiService: ApiService) {
    // Initialize services
    this.userService = new UserService(this.apiService);
    this.directorateService = new DirectorateService(this.apiService);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['unitId']) {
      this.userService.setUnitId(this.unitId);
    }
    
    // Reload timeline data when transactionId changes
    if (changes['transactionId']) {
      console.log('TransactionId changed:', changes['transactionId'].currentValue);
      this.loadData();
    }
    
    // Reload timeline data when submodule changes
    if (changes['submodule']) {
      console.log('Submodule changed:', changes['submodule'].currentValue);
      this.loadData();
    }
  }

  ngOnInit(): void {
    this.initializeFormConfig();
    this.loadData();
    
    // Set unit ID for user service
    this.userService.setUnitId(this.unitId);
    
    this.loadAllMasterDataAndOptions();
    
    // Set vessel and submodule from inputs
    this.routeConfigFormData.vesselId = this.vesselId;
    this.routeConfigFormData.subModule = this.submodule;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadAllMasterDataAndOptions(): void {
    // Subscribe to user options and set them in formConfig
    this.subscriptions.add(
      this.userService.getUserOptions().subscribe(options => {
        this.users = options;
        this.setFieldOptions('userId', options);
      })
    );

    // Subscribe to directorate options and set them in formConfig
    this.subscriptions.add(
      this.directorateService.getDirectorateOptions().subscribe(options => {
        this.directorates = options;
        this.setFieldOptions('directorateId', options);
      })
    );

    // Subscribe to loading states
    this.subscriptions.add(
      this.userService.getLoading().subscribe(loading => {
        this.usersLoading = loading;
      })
    );

    this.subscriptions.add(
      this.directorateService.getLoading().subscribe(loading => {
        this.directoratesLoading = loading;
      })
    );

    // Load data from services
    this.userService.loadAllUsersData();
    this.directorateService.loadAllDirectoratesData();
  }

  private setFieldOptions(key: string, options: Option[]): void {
    const field = this.routeConfigFormConfig.find((f) => f.key === key);
    if (field) {
      field.options = options;
    }
  }
  
  private initializeFormConfig(): void {
    this.routeConfigFormConfig = this.createFormConfig();
  }

  loadData(): void {
    console.log('RouteConfig loadData called - useApi:', this.useApi, 'transactionId:', this.transactionId, 'submodule:', this.submodule);
    
    if (this.useApi && this.transactionId) {
      console.log('Calling loadApiData with transactionId:', this.transactionId);
      this.loadApiData();
    } else {
      console.log('Using dummy data - useApi:', this.useApi, 'transactionId:', this.transactionId);
      this.loadDummyData();
    }
  }

  loadApiData(): void {
    console.log('RouteConfig loadApiData called - transactionId:', this.transactionId, 'submodule:', this.submodule);
    this.loading = true;
    this.error = null;
    
    // Only make API call if we have a valid transaction ID (not 'new' or empty)
    if (!this.transactionId || this.transactionId === 'new' || this.transactionId === '') {
      console.log('Skipping timeline API call - no valid transaction ID:', this.transactionId);
      this.error = 'No transaction ID available';
      this.loading = false;
      return;
    }
    
    const endpoint = this.apiEndpoint || `config/timeline/?submodule=${this.submodule}&transaction_id=${this.transactionId}`;
    console.log('Making timeline API call to:', endpoint);
    
    this.apiService.get(endpoint).subscribe({
      next: (response: any) => {
        console.log('Timeline API response:', response);
        if (response && response.data && response.data.length > 0) {
          this.timelineData = this.transformApiData(response.data);
          this.loading = false;
          
          // Animate nodes after data is loaded
          this.timelineData.forEach((item: TimelineItem, index: number) => {
            setTimeout(() => {
              this.animatedNodes.add(item.id);
            }, index * 200);
          });
        } else {
          this.error = 'No Routes Available';
          this.loading = false;
        }
      },
      error: (error: any) => {
        console.error('Error fetching timeline data:', error);
        this.handleApiError(error);
        this.loading = false;
      }
    });
  }

  private getDescriptionByStatus(status: string): string {
    switch (status) {
      case 'completed': return 'Stage completed successfully';
      case 'working': return 'Currently in progress';
      case 'pending': return 'Awaiting processing';
      default: return 'Processing stage';
    }
  }

  private getPriorityByIndex(index: number): 'critical' | 'high' | 'medium' | 'low' {
    if (index === 0) return 'high';
    if (index === 1) return 'medium';
    return 'low';
  }

  private transformApiData(apiData: any[]): TimelineItem[] {
    return apiData.map((item: any, index: number) => ({
      id: item.id,
      name: item.name,
      userType: item.userType || 'external',
      status: item.status || 'pending',
      timestamp: item.timestamp,
      description: this.getDescriptionByStatus(item.status),
      priority: this.getPriorityByIndex(index),
      duration: item.duration || undefined,
      hasInternal: item.hasInternal || false,
      internalUsers: item.internalUsers || []
    }));
  }

  private handleApiError(error: any): void {
    if (error.error && error.error.includes('No route configuration found')) {
      this.error = 'No Routes Available';
    } else if (error.error) {
      this.error = error.error;
    } else if (error.message) {
      this.error = error.message;
    } else {
      this.error = 'Failed to load timeline data';
    }
    
    // Don't fallback to dummy data when there's a specific error
    // this.timelineData = this.getDummyData();
  }

  loadDummyData(): void {
    this.loading = true;
    
    // Simulate loading delay
    setTimeout(() => {
      this.timelineData = this.getDummyData();
      this.loading = false;
      
      // Animate nodes after data is loaded
      this.timelineData.forEach((item: TimelineItem, index: number) => {
        setTimeout(() => {
          this.animatedNodes.add(item.id);
        }, index * 200);
      });
    }, 1000);
  }

  getDummyData(): TimelineItem[] {
    return [
      {
        id: 1,
        name: "Document Originator",
        userType: "external",
        status: "completed",
        timestamp: "2024-09-20 09:00",
        description: "File initiated and submitted for processing",
        priority: "high",
        duration: "2h 30m"
      },
      {
        id: 2,
        name: "Primary Reviewer",
        userType: "external",
        status: "completed",
        timestamp: "2024-09-21 14:30",
        description: "Initial review and validation completed",
        priority: "high",
        duration: "1d 5h 30m",
        hasInternal: true,
        internalUsers: [
          { name: "Quality Assurance Analyst", status: "completed", timestamp: "2024-09-21 10:00", role: "QA", duration: "4h 15m" },
          { name: "Data Validation Specialist", status: "completed", timestamp: "2024-09-21 12:15", role: "Validator", duration: "2h 15m" }
        ]
      },
      {
        id: 3,
        name: "Secondary Reviewer",
        userType: "external",
        status: "working",
        timestamp: "2024-09-22 11:00",
        description: "Advanced processing and compliance check in progress",
        priority: "medium",
        duration: "8h 45m",
        hasInternal: true,
        internalUsers: [
          { name: "Compliance Officer", status: "completed", timestamp: "2024-09-22 09:30", role: "Compliance", duration: "1h 30m" },
          { name: "Technical Reviewer", status: "working", timestamp: "2024-09-22 11:00", role: "Technical", duration: "3h 15m" }
        ]
      },
      {
        id: 4,
        name: "Final Approver",
        userType: "internal",
        status: "pending",
        timestamp: "",
        description: "Final approval and sign-off pending",
        priority: "critical",
        duration: undefined,
        hasInternal: false
      },
      {
        id: 5,
        name: "Document Archiver",
        userType: "internal",
        status: "pending",
        timestamp: "",
        description: "Document archiving and storage",
        priority: "low",
        duration: undefined,
        hasInternal: true,
        internalUsers: [
          { name: "Archive Specialist", status: "pending", timestamp: "", role: "Archivist", duration: undefined },
          { name: "Digital Storage Manager", status: "pending", timestamp: "", role: "Storage", duration: undefined }
        ]
      }
    ];
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed':
        return 'pi pi-check-circle';
      case 'working':
        return 'pi pi-spin pi-spinner';
      case 'pending':
        return 'pi pi-clock';
      default:
        return 'pi pi-clock';
    }
  }

  getStatusColor(status: string, userType: string): string {
    if (userType === 'external') {
      switch (status) {
        case 'completed': return 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-200 shadow-lg';
        case 'working': return 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-200 shadow-lg';
        case 'pending': return 'bg-gradient-to-br from-slate-300 to-slate-400 border-slate-200 shadow-lg';
        default: return 'bg-gradient-to-br from-slate-300 to-slate-400 border-slate-200 shadow-lg';
      }
    } else {
      switch (status) {
        case 'completed': return 'bg-gradient-to-br from-violet-500 to-violet-600 border-violet-200 shadow-lg';
        case 'working': return 'bg-gradient-to-br from-indigo-500 to-indigo-600 border-indigo-200 shadow-lg';
        case 'pending': return 'bg-gradient-to-br from-slate-400 to-slate-500 border-slate-300 shadow-lg';
        default: return 'bg-gradient-to-br from-slate-400 to-slate-500 border-slate-300 shadow-lg';
      }
    }
  }

  getStatusBadgeColor(status: string): string {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'working': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending': return 'bg-slate-50 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  getConnectorStyle(currentStatus: string, index: number, total: number): string {
    const isLast = index === total - 1;
    if (isLast) return '';
    
    switch (currentStatus) {
      case 'completed': 
        return 'absolute top-10 left-20 w-12 h-0.5 bg-emerald-300 z-0';
      case 'working': 
        return 'absolute top-10 left-20 w-12 h-0.5 bg-blue-300 z-0';
      default: 
        return 'absolute top-10 left-20 w-12 h-0.5 bg-slate-200 z-0';
    }
  }

  formatTimestamp(timestamp: string): string {
    if (!timestamp) return 'Pending';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: '2-digit'
    }) + ' • ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }

  toggleExpanded(id: number): void {
    this.expandedItems[id] = !this.expandedItems[id];
  }

  handleNodeClick(item: TimelineItem): void {
    this.selectedNode = this.selectedNode?.id === item.id ? null : item;
  }

  closeModal(): void {
    this.selectedNode = null;
  }

  editRouteConfig(): void {
    this.resetFormData();
    this.resetFormVisibility();
    // Force change detection by creating a new reference
    this.routeConfigFormConfig = [...this.routeConfigFormConfig];
    this.isFormOpen = true;
  }
  
  private resetFormData(): void {
    this.routeConfigFormData = {
      routeType: '',
      userId: undefined,
      permissionType: undefined,
      directorateId: undefined,
      vesselId: this.vesselId,
      subModule: this.submodule,
     
    };
  }
  
  private resetFormVisibility(): void {
    // Create a completely new form configuration
    this.routeConfigFormConfig = this.createFormConfig();
  }
  
  private createFormConfig(): any[] {
    return [
      { key: 'routeType', label: 'Route Type', type: 'radio', required: true, options: [
        { value: 'internal', label: 'Internal' },
        { value: 'external', label: 'External' }
      ]},
      { key: 'userId', label: 'User', type: 'select', options: this.users, required: false, placeholder: this.usersLoading ? 'Loading...' : 'Select user', hide: true, loading: this.usersLoading },
      { key: 'permissionType', label: 'Permission Type', type: 'radio', required: false, options: [
        { value: 'edit', label: 'Edit' },
        { value: 'comment', label: 'Comment' },
        { value: 'view', label: 'View' }
      ], hide: true },
      { key: 'isApprover', label: 'Approve', type: 'checkbox', required: false, hide: true },
      { key: 'directorateId', label: 'Directorate', type: 'select', options: this.directorates, required: false, placeholder: this.directoratesLoading ? 'Loading...' : 'Select directorate', hide: true, loading: this.directoratesLoading }
    ];
  }
  
  handleFormSubmit(data: RouteConfigFormData): void {
 
    
    if (this.useApi && this.vesselId && this.submodule) {
      // Create API payload
      const apiPayload: RouteConfigApiPayload = this.createApiPayload(data);
      
      // Make API call
      this.saveRouteConfigToApi(apiPayload);
    } else {
      // Emit the form data to parent component (for dummy data or custom handling)
      this.routeConfigSaved.emit({
        ...data,
        transactionId: this.transactionId,
        submodule: this.submodule,
        vesselId: this.vesselId
      });
    }
    
    this.isFormOpen = false;
  }

  private createApiPayload(data: RouteConfigFormData): RouteConfigApiPayload {
    const payload: RouteConfigApiPayload = {
      route_type: data.routeType as 'external' | 'internal',
      sub_module: Number(this.submodule),
      vessel: Number(this.vesselId),
      transaction_id: this.transactionId ? Number(this.transactionId) : undefined
    };

    if (data.routeType === 'internal') {
      payload.user = data.userId || null;
      // Add directorate from localStorage for internal routes
      payload.directorate = localStorage.getItem('unit_id') ? Number(localStorage.getItem('unit_id')) : undefined;
      if (data.permissionType) {
        payload.permission_type = data.permissionType;
        payload.is_granted = true;
      }
      // Add is_approver field for internal routes
      payload.is_approver = data.isApprover || false;
    } else if (data.routeType === 'external') {
      payload.user = null;
      payload.directorate = data.directorateId;
      if (data.permissionType) {
        payload.permission_type = data.permissionType;
        payload.is_granted = true;
      }
    }

    return payload;
  }

  private saveRouteConfigToApi(payload: RouteConfigApiPayload): void {
    this.loading = true;
    
    this.apiService.post('config/route-configs/', payload).subscribe({
      next: (response: any) => {
        console.log('✅ Route config saved successfully, refreshing timeline...');
        this.loading = false;
        
        // Emit success event to parent
        this.routeConfigSaved.emit({
          success: true,
          data: response,
          payload: payload,
          transactionId: this.transactionId,
          submodule: this.submodule,
          vesselId: this.vesselId
        });
        
        // Call timeline API to refresh the timeline data
        this.refreshTimelineData();
      },
      error: (error: any) => {
        console.error('Error saving route config:', error);
        this.loading = false;
        
        // Emit error event to parent
        this.routeConfigSaved.emit({
          success: false,
          error: error,
          payload: payload,
          transactionId: this.transactionId,
          submodule: this.submodule,
          vesselId: this.vesselId
        });
      }
    });
  }

  private refreshTimelineData(): void {
    if (this.useApi && this.transactionId && this.submodule) {
      console.log('🔄 Refreshing timeline data...');
      this.loadApiData();
    }
  }
  
  handleFormOpenChange(isOpen: boolean): void {
    this.isFormOpen = isOpen;
  }
  
  handleSelectChange(event: { key: string; value: any; selectedOption: any; formData: any }): void { 
    if (event.key === 'routeType') {
      this.updateFormConfigVisibility(event.value);
    }
  }
  
  private updateFormConfigVisibility(routeType: 'internal' | 'external' | ''): void {    
    // Create a completely new array to trigger change detection
    this.routeConfigFormConfig = this.routeConfigFormConfig.map(field => {
      const updatedField = { ...field };
      
      if (field.key === 'userId') {
        // Show User field only when Internal is selected
        updatedField.hide = routeType !== 'internal';
        if (routeType !== 'internal') {
          updatedField.required = false;
        }
      } else if (field.key === 'permissionType') {
        // Show Permission Type field for both Internal and External routes
        updatedField.hide = routeType === '';
        if (routeType === '') {
          updatedField.required = false;
        }
      } else if (field.key === 'isApprover') {
        // Show Approve checkbox only when Internal is selected
        updatedField.hide = routeType !== 'internal';
        if (routeType !== 'internal') {
          updatedField.required = false;
        }
      } else if (field.key === 'directorateId') {
        // Show Directorate field only when External is selected
        updatedField.hide = routeType !== 'external';
        if (routeType !== 'external') {
          updatedField.required = false;
        }
      }
      
      return updatedField;
    });
    
    // Force change detection by creating a new reference
    this.routeConfigFormConfig = [...this.routeConfigFormConfig];
  }

  toggleTimelineVisibility(): void {
    this.showTimeline = !this.showTimeline;
    this.timelineToggled.emit(this.showTimeline);
  }

  goToNextStep(): void {
    
    this.showNextStepModal = true;
    this.nextStepClicked.emit({
      transactionId: this.transactionId,
      submodule: this.submodule
    });
  }

  toggleNextStepModal(): void {
    this.showNextStepModal = !this.showNextStepModal;
  }

  closeNextStepModal(): void {
    this.showNextStepModal = false;
    this.reviewRemarks = ''; // Clear remarks when closing
  }

  sendForReview(): void {
    
    if (!this.reviewRemarks.trim()) {
      alert('Please enter remarks before sending for review.');
      return;
    }
    
    // Create payload for approval API
    const approvalData = {
      message: this.reviewRemarks,
      status: 1,
      sub_module: this.submodule,
      transaction_id: this.transactionId,
      vessel: this.vesselId
    };
    
    // Make API call to config/approval/
    this.apiService.post('config/approval/', approvalData).subscribe({
      next: (response) => {
        console.log('Review sent successfully:', response);
        
        // Close the review modal and show the confirmation modal
        this.showNextStepModal = false;
        this.showAddAnotherModal = true;
      },
      error: (error) => {
        console.error('Error sending for review:', error);
        alert('Failed to send for review. Please try again.');
      }
    });
  }

  rejectReview(): void {
    
    if (!this.reviewRemarks.trim()) {
      alert('Please enter remarks before rejecting.');
      return;
    }
    
    // Create payload for approval API with status 2 (reject)
    const approvalData = {
      message: this.reviewRemarks,
      status: 2,
      sub_module: this.submodule,
      transaction_id: this.transactionId,
      vessel: this.vesselId
    };
    
    // Make API call to config/approval/
    this.apiService.post('config/approval/', approvalData).subscribe({
      next: (response) => {
        console.log('Review rejected successfully:', response);
        this.closeNextStepModal();
      },
      error: (error) => {
        console.error('Error rejecting review:', error);
        alert('Failed to reject review. Please try again.');
      }
    });
  }

  closeAddAnotherModal(): void {
    this.showAddAnotherModal = false;
    this.reviewRemarks = ''; // Clear remarks when closing
  }

  addAnotherRouteConfig(): void {
    
    // TODO: Implement API call to send for review
    
    // Close the confirmation modal
    this.closeAddAnotherModal();
    
    // Open the Add Route Config form (same as Edit Route Config)
    this.editRouteConfig();
  }
}
