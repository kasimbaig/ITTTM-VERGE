import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { TabNavigationComponent } from '../../../shared/components/tab-navigation/tab-navigation.component';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

export interface UwCompartmentsFormData {
  id?: number;
  ship_id?: number; // New field for ship_id
  ship?: {
    id: number;
    name: string;
    code: string;
    classofship?: any;
    shiptype?: any;
    yard?: any;
    command?: any;
    year_of_build?: number;
    year_of_delivery?: number;
  };
  inspectionReport?: string;
  dateOfInspection?: string;
  dt_inspection?: string; // New field for API response
  totalUwCompartments?: number;
  offeredUwCompartments?: number;
  inspectedUwCompartments?: number;
  satUwCompartments?: number;
  unsatUwCompartments?: number;
  totalTanks?: number;
  offeredTanks?: number;
  inspectedTanks?: number;
  satTanks?: number;
  unsatTanks?: number;
  satTanksFinal?: number;
  draft_status?: string;
  inspectionObservations?: any[];
  signatures?: any[];
  created_on?: string;
  modified_on?: string;
  created_by?: number;
  modified_by?: number;
  user_permissions?: {
    has_access: boolean;
    permissions: {
      edit: boolean;
      comment: boolean;
      view: boolean;
    };
  };
}

@Component({
  selector: 'app-uw-compartments-form-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    TieredMenuModule,
    ConfirmDialogModule,
    PaginatedTableComponent,
    ToastComponent,
    TabNavigationComponent,
    DeleteConfirmationModalComponent
  ],
  templateUrl: './uw-compartments-form-table.component.html',
  styleUrl: './uw-compartments-form-table.component.css'
})
export class UwCompartmentsFormTableComponent implements OnInit {
  @Input() title: string = 'U/W Compartments Form Records';
  @Input() apiUrl: string = 'hitu/uw-compartments-hull-inspection-reports/';
  @Output() editEvent = new EventEmitter<UwCompartmentsFormData>();
  @Output() viewEvent = new EventEmitter<UwCompartmentsFormData>();
  @Output() deleteEvent = new EventEmitter<UwCompartmentsFormData>();
  @Output() tabChanged = new EventEmitter<{tabId: string, draftStatus: string, apiUrl: string}>();

  searchText: string = '';
  forms: UwCompartmentsFormData[] = [];
  filteredForms: UwCompartmentsFormData[] = [];
  showDeleteModal: boolean = false;
  selectedForm: UwCompartmentsFormData = {} as UwCompartmentsFormData;
  totalCount: number = 0;
  activeTab: string = 'draft';

  // Tab configuration
  tabs = [
    { id: 'draft', label: 'Draft', count: 0 },
    { id: 'work-in-progress', label: 'Work-in-Progress', count: 0 },
    { id: 'approved', label: 'Approved', count: 0 }
  ];

  // Table columns configuration
  cols = [
    { field: 'ship.name', header: 'Ship', filterType: 'text' },
    { field: 'dt_inspection', header: 'Date of Inspection', filterType: 'date' },
    { field: 'draft_status', header: 'Status', filterType: 'text' }
  ];

  // Export options
  exportOptions = [
    {
      label: 'Export PDF',
      icon: 'pi pi-file-pdf',
      command: () => this.exportPDF()
    },
    {
      label: 'Export Excel',
      icon: 'pi pi-file-excel',
      command: () => this.exportExcel()
    }
  ];

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {

    // Paginated table will handle data loading via API
  }

  // Dynamic API URL based on selected tab
  get currentApiUrl(): string {
    const baseUrl = this.apiUrl;
    const draftStatus = this.getDraftStatusForTab(this.activeTab);
    return `${baseUrl}?draft_status=${draftStatus}`;
  }

  // Method to map tab ID to draft status
  private getDraftStatusForTab(tabId: string): string {
    switch (tabId) {
      case 'draft':
        return 'draft';
      case 'work-in-progress':
        return 'save'; // Changed from 'submitted' to 'save'
      case 'approved':
        return 'approved';
      default:
        return 'draft';
    }
  }

  onDataLoaded(data: any): void {
    console.log('🔍 U/W COMPARTMENTS TABLE - onDataLoaded called with data:', data);
    console.log('🔍 U/W COMPARTMENTS TABLE - data.data:', data.data);
    console.log('🔍 U/W COMPARTMENTS TABLE - data.results:', data.results);
    console.log('🔍 U/W COMPARTMENTS TABLE - data.count:', data.count);
    console.log('🔍 U/W COMPARTMENTS TABLE - Array.isArray(data):', Array.isArray(data));
    
    // Handle the API response structure: { status: 200, data: [...] } or direct array
    if (Array.isArray(data)) {
      // Data is already extracted as an array from paginated table
      this.forms = [...data];
      this.totalCount = data.length;
      console.log('🔍 U/W COMPARTMENTS TABLE - Data is array, using directly');
    } else {
      // Handle object structure with data/results properties
      this.forms = data.data || data.results || [];
      this.totalCount = data.count || this.forms.length;
      console.log('🔍 U/W COMPARTMENTS TABLE - Data is object, extracting from properties');
    }
    
    console.log('🔍 U/W COMPARTMENTS TABLE - this.forms after processing:', this.forms);
    console.log('🔍 U/W COMPARTMENTS TABLE - this.totalCount:', this.totalCount);
    
    this.filteredForms = [...this.forms];
    
    // The API response already includes complete ship objects, so no transformation needed
    // Just ensure we have the required fields for table display
    this.forms = this.forms.map((form: any) => {
      const transformedForm = {
        ...form,
        // Ensure date field is properly mapped (API already has dt_inspection)
        dt_inspection: form.dt_inspection || form.dateOfInspection || form.date_of_inspection,
        // Ensure status field is properly mapped (API already has draft_status)
        draft_status: form.draft_status || form.status || 'draft'
      };
      
      console.log('🔍 U/W COMPARTMENTS TABLE - Individual form:', transformedForm);
      return transformedForm;
    });
    
    console.log('🔍 U/W COMPARTMENTS TABLE - Final forms data:', this.forms);
  }


  onTabChange(tabId: string): void {
    this.activeTab = tabId;
   
    this.tabChanged.emit({
      tabId: tabId,
      draftStatus: this.getDraftStatusForTab(tabId),
      apiUrl: this.currentApiUrl
    });
  }

  editForm(form: UwCompartmentsFormData | {}): void {
    this.editEvent.emit(form as UwCompartmentsFormData);
  }

  viewForm(form: UwCompartmentsFormData): void {
    this.viewEvent.emit(form);
  }

  deleteForm(form: UwCompartmentsFormData): void {
    this.selectedForm = form;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.selectedForm.id) {
      const deletedId = this.selectedForm.id; // Store the ID before resetting
      const payload = {
        id: this.selectedForm.id,
        delete: true
      };
      
      this.apiService.post(this.apiUrl, payload).subscribe({
        next: () => {
          this.toastService.showSuccess('Form deleted successfully');
          this.showDeleteModal = false;
          
          // Remove the deleted item from the local arrays using stored ID
          this.forms = this.forms.filter(form => form.id !== deletedId);
          this.filteredForms = this.filteredForms.filter(form => form.id !== deletedId);
          
          // Update total count
          this.totalCount = this.forms.length;
          
          // Reset selected form
          this.selectedForm = {} as UwCompartmentsFormData;
          
          // Emit event to parent to refresh table data
          this.tabChanged.emit({
            tabId: this.activeTab,
            draftStatus: this.getDraftStatusForTab(this.activeTab),
            apiUrl: this.currentApiUrl
          });
        },
        error: (error) => {
          console.error('Error deleting form:', error);
          this.toastService.showError('Error deleting form');
        }
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.selectedForm = {} as UwCompartmentsFormData;
  }

  exportPDF(): void {
    this.toastService.showSuccess('PDF export functionality will be implemented soon');
  }

  exportExcel(): void {
    this.toastService.showSuccess('Excel export functionality will be implemented soon');
  }

  goBack(): void {

  }
}
