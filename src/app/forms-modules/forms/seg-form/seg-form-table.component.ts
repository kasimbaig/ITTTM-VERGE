import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
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

export interface SegFormData {
  id?: number;
  di_or_dr_id?: number;
  di_or_dr_data?: {
    id: number;
    sd_sub_system: string;
    sd_sub_sub_system: string;
    ped_sr_no: string;
    ped_make_or_oem_module: string;
    ped_oem_part_no_motherboard_or_sbd: string;
    ped_patt_no: string;
    mmd_media_type: string;
    mmd_size: string;
    mmd_interface: string;
    mmd_scsi: string;
    mmd_os: string;
    ds_file: string;
    ds_submitted_by: string;
    ds_status: string;
    ds_verified_by: string;
    ds_request_no: string;
    ess_repair_or_restoration_job_ref_no: string;
    ess_repair_or_restoration_job_assign_to: string;
    ess_repair_or_restoration_remarks: string;
    ess_repair_or_restoration_status: string;
    remarks_from_seg_file: string;
    remarks_from_seg_status: string;
    handed_over_to: string;
    ship_feedback: string;
    draft_status: string;
    created_on: string;
    created_ip: string;
    modified_on: string;
    modified_ip: string;
    sd_ship: number;
    sd_system: number;
    created_by: number;
    modified_by: number;
  };
  // Add ship property for API response
  ship?: {
    id: number;
    name: string;
    code: string;
  };
  // Add flat properties for table display
  sd_sub_system?: string;
  sd_sub_sub_system?: string;
  ped_sr_no?: string;
  ped_make_or_oem_module?: string;
  mmd_media_type?: string;
  mmd_size?: string;
  didr_ds_submitted_by?: string;
  didr_ds_status?: string;
  ship_name?: string; // Add ship name for table display
  draft_status?: string;
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
  selector: 'app-seg-form-table',
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
  templateUrl: './seg-form-table.component.html',
  styleUrl: './seg-form-table.component.css'
})
export class SegFormTableComponent implements OnInit {
  @Input() title: string = 'SEG Form Records';
  @Input() apiUrl: string = 'seg/segform/';
  @Output() editEvent = new EventEmitter<SegFormData>();
  @Output() viewEvent = new EventEmitter<SegFormData>();
  @Output() deleteEvent = new EventEmitter<SegFormData>();
  @Output() tabChanged = new EventEmitter<{tabId: string, draftStatus: string, apiUrl: string}>();

  searchText: string = '';
  forms: SegFormData[] = [];
  filteredForms: SegFormData[] = [];
  showDeleteModal: boolean = false;
  selectedForm: SegFormData = {} as SegFormData;
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
    { field: 'ship_name', header: 'Ship', filterType: 'text' },
    { field: 'sd_sub_system', header: 'Sub System', filterType: 'text' },
    { field: 'sd_sub_sub_system', header: 'Sub Sub System', filterType: 'text' },
    { field: 'ped_sr_no', header: 'Serial No', filterType: 'text' },
    { field: 'ped_make_or_oem_module', header: 'Make/OEM Module', filterType: 'text' },
    { field: 'mmd_media_type', header: 'Media Type', filterType: 'text' },
    { field: 'mmd_size', header: 'Size', filterType: 'text' },
    { field: 'didr_ds_submitted_by', header: 'Submitted By', filterType: 'text' },
    { field: 'didr_ds_status', header: 'Status', filterType: 'text' },
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
    const statusMap = {
      'draft': 'Draft',
      'work-in-progress': 'Submitted', 
      'approved': 'Approved'
    };
    return `seg/segform/?draft_status=${statusMap[this.activeTab as keyof typeof statusMap]}`;
  }

  // Method to map tab ID to draft status
  private getDraftStatusForTab(tabId: string): string {
    switch (tabId) {
      case 'draft':
        return 'Draft';
      case 'work-in-progress':
        return 'Submitted';
      case 'approved':
        return 'Approved';
      default:
        return 'Draft';
    }
  }

  onDataLoaded(data: any): void {
    console.log('🔍 SEG TABLE - onDataLoaded called with data:', data);
    
    // Handle the API response structure
    if (Array.isArray(data)) {
      this.forms = [...data];
      this.totalCount = data.length;
    } else {
      this.forms = data.data || data.results || [];
      this.totalCount = data.count || this.forms.length;
    }
    
    this.filteredForms = [...this.forms];
    
    // Transform data for table display - API response has flat structure
    this.forms = this.forms.map((form: any) => {
      const transformedForm = {
        ...form,
        // Map flat API response data to table display fields
        sd_sub_system: form.sd_sub_system || '',
        sd_sub_sub_system: form.sd_sub_sub_system || '',
        ped_sr_no: form.ped_sr_no || '',
        ped_make_or_oem_module: form.ped_make_or_oem_module || '',
        mmd_media_type: form.mmd_media_type || '',
        mmd_size: form.mmd_size || '',
        didr_ds_submitted_by: form.didr_ds_submitted_by || '',
        didr_ds_status: form.didr_ds_status || '',
        ship_name: form.ship?.name || '', // Extract ship name from nested ship object
        draft_status: form.draft_status || 'Draft'
      };
      
      return transformedForm;
    });
    
    console.log('🔍 SEG TABLE - Final forms data:', this.forms);
  }

  onTabChange(tabId: string): void {
    this.activeTab = tabId;
   
    this.tabChanged.emit({
      tabId: tabId,
      draftStatus: this.getDraftStatusForTab(tabId),
      apiUrl: this.currentApiUrl
    });
  }

  editForm(form: SegFormData | {}): void {
    this.editEvent.emit(form as SegFormData);
  }

  viewForm(form: SegFormData): void {
    this.viewEvent.emit(form);
  }

  deleteForm(form: SegFormData): void {
    this.selectedForm = form;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.selectedForm.id) {
      const deletedId = this.selectedForm.id;
      const payload = {
        di_or_dr_id: this.selectedForm.id
      };
      
      this.apiService.post('seg/segform/delete/', payload).subscribe({
        next: () => {
          this.toastService.showSuccess('SEG Form deleted successfully');
          this.showDeleteModal = false;
          
          // Remove the deleted item from the local arrays
          this.forms = this.forms.filter(form => form.id !== deletedId);
          this.filteredForms = this.filteredForms.filter(form => form.id !== deletedId);
          
          // Update total count
          this.totalCount = this.forms.length;
          
          // Reset selected form
          this.selectedForm = {} as SegFormData;
          
          // Emit event to parent to refresh table data
          this.tabChanged.emit({
            tabId: this.activeTab,
            draftStatus: this.getDraftStatusForTab(this.activeTab),
            apiUrl: this.currentApiUrl
          });
        },
        error: (error) => {
          console.error('Error deleting SEG form:', error);
          this.toastService.showError('Error deleting SEG form');
        }
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.selectedForm = {} as SegFormData;
  }

  exportPDF(): void {
    this.toastService.showSuccess('PDF export functionality will be implemented soon');
  }

  exportExcel(): void {
    this.toastService.showSuccess('Excel export functionality will be implemented soon');
  }
}
