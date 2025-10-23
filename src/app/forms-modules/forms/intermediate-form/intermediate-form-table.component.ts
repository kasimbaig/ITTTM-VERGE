import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { TabNavigationComponent } from '../../../shared/components/tab-navigation/tab-navigation.component';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

export interface IntermediateFormData {
  id?: number;
  inspectionType: string;
  inspectionDate: string;
  inspectionAuthority: string;
  typeOfSurvey: string;
  pressureTestingTanks: string;
  pressureTestingSeaTubes: string;
  ndtUndertaken: string;
  status?: string; // Added status field
  inspectors: any[];
  hullSurveyObservations: any[];
  defectRectificationObservations: any[];
  newObservations: any[];
  otherObservationsFinal: any[];
  created_at?: string;
  updated_at?: string;
  // Additional fields that might come from the API
  ship_name?: string;
  ship_id?: number;
  ship?: { id: number; name: string }; // Added ship object
  inspection_reference?: string;
  authority_for_inspection?: string;
  date_of_inspection?: string;
  created_by?: string;
  modified_by?: string;
  // Direct fields for table display
  dt_inspection?: string;
  draft_status?: string;
  // ✅ CRITICAL: Add observations array
  observations?: any[];
}

@Component({
  selector: 'app-intermediate-form-table',
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
    DeleteConfirmationModalComponent,
    TabNavigationComponent
  ],
  templateUrl: './intermediate-form-table.component.html',
  styleUrl: './intermediate-form-table.component.css'
})
export class IntermediateFormTableComponent implements OnInit {
  @Input() title: string = 'Intermediate Form Records';
  @Input() apiUrl: string = 'hitu/intermediate-underwater-hull-inspection-reports/';
  @Output() editEvent = new EventEmitter<IntermediateFormData>();
  @Output() viewEvent = new EventEmitter<IntermediateFormData>();
  @Output() deleteEvent = new EventEmitter<IntermediateFormData>();
  @Output() tabChanged = new EventEmitter<{tabId: string, draftStatus: string, apiUrl: string}>();

  searchText: string = '';
  forms: IntermediateFormData[] = [];
  filteredForms: IntermediateFormData[] = [];
  showDeleteDialog: boolean = false;
  selectedForm: IntermediateFormData = {} as IntermediateFormData;
  totalCount: number = 0;
  activeTab: string = 'draft';
  loading: boolean = false;
  error: string | null = null;
  currentApiUrl: string = ''; // Dynamic API URL with draft_status parameter

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

  exportOptions = [
    {
      label: 'Export as PDF',
      icon: 'pi pi-file-pdf',
      command: () => this.exportPDF(),
    },
    {
      label: 'Export as Excel',
      icon: 'pi pi-file-excel',
      command: () => this.exportExcel(),
    },
  ];

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
  
    this.buildApiUrl();
    // Paginated table will handle data loading via API
  }

  private buildApiUrl(): void {
    const draftStatus = this.getDraftStatusForTab(this.activeTab);
    this.currentApiUrl = `${this.apiUrl}?draft_status=${draftStatus}`;
    }

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
       this.loading = false;
    this.error = null;
    
    try {
      // Transform API response if needed
      if (data.results) {
        this.forms = data.results.map((item: any) => this.transformApiData(item));
      } else if (Array.isArray(data)) {
        this.forms = data.map((item: any) => this.transformApiData(item));
      } else {
        this.forms = [];
      }
      
      this.totalCount = data.count || data.length || 0;
      this.filteredForms = [...this.forms];
      
    } catch (error) {
      console.error('Error processing API response:', error);
      this.error = 'Error processing data from server';
      this.forms = [];
      this.filteredForms = [];
      this.totalCount = 0;
    }
  }

  onDataLoadError(error: any): void {
    console.error('API Error:', error);
    this.loading = false;
    this.error = 'Failed to load intermediate form records';
    this.forms = [];
    this.filteredForms = [];
    this.totalCount = 0;
    this.toastService.showError('Failed to load intermediate form records');
  }

  private transformApiData(apiItem: any): IntermediateFormData {
    
    const transformedData = {
      id: apiItem.id,
      inspectionType: apiItem.inspectionType || apiItem.ship_name || '',
      inspectionDate: apiItem.dt_inspection || apiItem.inspectionDate || apiItem.date_of_inspection || '', // Prioritize dt_inspection
      inspectionAuthority: apiItem.inspectionAuthority || apiItem.authority_for_inspection || '',
      typeOfSurvey: apiItem.type_of_survey || apiItem.typeOfSurvey || '',
      pressureTestingTanks: apiItem.pt_of_tanks || apiItem.pressureTestingTanks || '',
      pressureTestingSeaTubes: apiItem.pt_of_sea_tubes || apiItem.pressureTestingSeaTubes || '',
      ndtUndertaken: apiItem.ndt_undertaken || apiItem.ndtUndertaken || '',
      status: apiItem.draft_status || apiItem.status || 'Draft',
      inspectors: apiItem.inspectors || [],
      hullSurveyObservations: apiItem.hullSurveyObservations || [],
      defectRectificationObservations: apiItem.defectRectificationObservations || [],
      newObservations: apiItem.newObservations || [],
      otherObservationsFinal: apiItem.otherObservationsFinal || [],
      created_at: apiItem.created_on,
      updated_at: apiItem.modified_on,
      ship_name: apiItem.ship?.name || apiItem.ship_name || '',
      ship_id: apiItem.ship?.id || apiItem.ship_id,
      inspection_reference: apiItem.inspection_reference,
      authority_for_inspection: apiItem.authority_for_inspection,
      date_of_inspection: apiItem.dt_inspection || apiItem.date_of_inspection,
      created_by: apiItem.created_by,
      modified_by: apiItem.modified_by,
      // Add ship object for table display
      ship: apiItem.ship || { id: apiItem.ship_id, name: apiItem.ship_name },
      // Add direct fields for table display
      dt_inspection: apiItem.dt_inspection,
      draft_status: apiItem.draft_status,
      // ✅ CRITICAL: Add observations array from API response
      observations: apiItem.observations || []
    };
    
   
    
    return transformedData;
  }

  onTabChange(tabId: string): void {
    this.activeTab = tabId;
   
    this.buildApiUrl();
  
    this.tabChanged.emit({
      tabId: tabId,
      draftStatus: this.getDraftStatusForTab(tabId),
      apiUrl: this.currentApiUrl
    });
    // Trigger data refresh with new API URL
    this.refreshData();
  }

  editForm(form: IntermediateFormData | {}): void {
    this.editEvent.emit(form as IntermediateFormData);
  }

  viewForm(form: IntermediateFormData): void {
    this.viewEvent.emit(form);
  }

  deleteForm(form: IntermediateFormData): void {
    this.selectedForm = form;
    this.showDeleteDialog = true;
  }

  confirmDeletion(): void {
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
          this.selectedForm = {} as IntermediateFormData;
          
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

  cancelDeletion(): void {
    this.showDeleteDialog = false;
    this.selectedForm = {} as IntermediateFormData;
  }

  refreshData(): void {
    // This will trigger the paginated table to refresh its data
    // The paginated table component handles the actual API call
  
    // Simply rebuild the URL to trigger change detection
    this.buildApiUrl();
  }

  exportPDF(): void {
    // Implement PDF export logic
   
    this.toastService.showSuccess('PDF export functionality will be implemented');
  }

  exportExcel(): void {
    // Implement Excel export logic
  
    this.toastService.showSuccess('Excel export functionality will be implemented');
  }

  goBack(): void {
    // Implement back navigation
    window.history.back();
  }
}
