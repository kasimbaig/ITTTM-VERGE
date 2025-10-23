import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { TabNavigationComponent } from '../../../shared/components/tab-navigation/tab-navigation.component';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

export interface FinalFormData {
  id?: number;
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
  dt_inspection?: string;
  auth_inspection?: string;
  report_no?: string;
  ship_not_cleaerd_for_undocking?: boolean;
  final_observation?: string;
  reoffer_date?: string;
  draft_status?: string;
  observations?: any[];
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
  selector: 'app-final-form-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    TieredMenuModule,
    PaginatedTableComponent,
    ToastComponent,
    TabNavigationComponent,
    DeleteConfirmationModalComponent
  ],
  templateUrl: './final-form-table.component.html',
  styleUrl: './final-form-table.component.css'
})
export class FinalFormTableComponent implements OnInit {
  @Input() title: string = 'Final Form Records';
  @Input() apiUrl: string = 'hitu/final-underwater-hull-inspection-reports/';
  @Output() editEvent = new EventEmitter<FinalFormData>();
  @Output() viewEvent = new EventEmitter<FinalFormData>();
  @Output() deleteEvent = new EventEmitter<FinalFormData>();
  @Output() tabChanged = new EventEmitter<{tabId: string, draftStatus: string, apiUrl: string}>();

  searchText: string = '';
  forms: FinalFormData[] = [];
  filteredForms: FinalFormData[] = [];
  showDeleteDialog: boolean = false;
  selectedForm: FinalFormData = {} as FinalFormData;
  totalCount: number = 0;
  activeTab: string = 'draft';
  
  // Dynamic API URL based on selected tab
  get currentApiUrl(): string {
    const baseUrl = this.apiUrl;
    const draftStatus = this.getDraftStatusForTab(this.activeTab);
    return `${baseUrl}?draft_status=${draftStatus}`;
  }

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

  // Get draft status parameter based on selected tab
  private getDraftStatusForTab(tabId: string): string {
    switch (tabId) {
      case 'draft':
        return 'draft';
      case 'work-in-progress':
        return 'save';
      case 'approved':
        return 'approved';
      default:
        return 'draft';
    }
  }

  onDataLoaded(data: any): void {
    
    // Handle the API response structure: { status: 200, data: [...] } or direct array
    if (Array.isArray(data)) {
      // Data is already extracted as an array from paginated table
      this.forms = [...data];
      this.totalCount = data.length;
    } else {
      // Handle object structure with data/results properties
      this.forms = data.data || data.results || [];
      this.totalCount = data.count || this.forms.length;
    }
    
    
    // Keep original observations array intact for editing (no processing needed for display)
    this.filteredForms = [...this.forms];
    
   }

  onTabChange(tabId: string): void {
    this.activeTab = tabId;
    
    // Emit event to parent component to reload data with new API URL
    this.tabChanged.emit({
      tabId: tabId,
      draftStatus: this.getDraftStatusForTab(tabId),
      apiUrl: this.currentApiUrl
    });
  }

  editForm(form: FinalFormData | {}): void {
    console.log('🔍 editForm called with:', form);
    this.editEvent.emit(form as FinalFormData);
  }

  viewForm(form: FinalFormData): void {
    console.log('🔍 viewForm called with:', form);
    this.viewEvent.emit(form);
  }

  deleteForm(form: FinalFormData): void {
    this.selectedForm = form;
    this.showDeleteDialog = true;
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
          this.showDeleteDialog = false;
          
          // Remove the deleted item from the local arrays using stored ID
          this.forms = this.forms.filter(form => form.id !== deletedId);
          this.filteredForms = this.filteredForms.filter(form => form.id !== deletedId);
          
          // Update total count
          this.totalCount = this.forms.length;
          
          // Reset selected form
          this.selectedForm = {} as FinalFormData;
          
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
    this.showDeleteDialog = false;
    this.selectedForm = {} as FinalFormData;
  }

  exportPDF(): void {
    this.toastService.showSuccess('PDF export functionality will be implemented soon');
  }

  exportExcel(): void {
    this.toastService.showSuccess('Excel export functionality will be implemented soon');
  }

  goBack(): void {
    // Navigate back or emit event to parent

  }
}
