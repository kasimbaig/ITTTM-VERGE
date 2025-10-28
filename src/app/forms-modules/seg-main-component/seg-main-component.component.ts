import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ToastService } from '../../services/toast.service';
import { ApiService } from '../../services/api.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { DeleteConfirmationModalComponent } from '../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { SegFormComponent } from '../forms/seg-form/seg-form.component';
import { SegFormTableComponent } from '../forms/seg-form/seg-form-table.component';
import { SegDashboardComponent } from '../seg-dashboard/seg-dashboard.component';
import { PaginatedTableComponent } from '../../shared/components/paginated-table/paginated-table.component';
import { NgxPrintModule } from 'ngx-print';
import { WordDownloadService } from '../../shared/services/word-download.service';

interface SegFormReport {
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
  es_repair_or_restoration_data?: {
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
    ro_submitted_by: string;
    ro_status: string;
    ro_verified_by: string;
    ro_request_no: string;
    ess_repair_or_restoration_job_ref_no: string;
    ess_repair_or_restoration_job_assign_to: string;
    ess_repair_or_restoration_remarks: string;
    ess_repair_or_restoration_status: string;
    disk_info_captured: string;
    mmd_health_prediction: string;
    dc_tool_used: string;
    dc_clone_disk_name: string;
    dc_hash_value_file: string;
    dm_verification_of_partion_structre: string;
    dm_verification_of_file_system: string;
    boot_trial_remarks: string;
    rd_nomenclature_of_root_folder: string;
    rd_stored_in: string;
    rd_disk_info_file: string;
    rd_cloned_disk_or_image: string;
    rd_hash_value_stored_in_file: string;
    image_or_clone_restored_from: string;
    remarks_by_seg: string;
    handed_over_to: string;
    feedback_of_ss: string;
    draft_status: string;
    created_on: string;
    created_ip: string;
    modified_on: string;
    modified_ip: string;
    di_or_dr: number;
    sd_ship: number;
    sd_system: number;
    created_by: number;
    modified_by: number;
  };
  es_extraction_for_backup_data?: {
    id: number;
    sd_sub_system: string;
    sd_sub_sub_system: string;
    ped_sr_no: string;
    ped_make_or_oem_module: string;
    ped_oem_part_no_motherboard_or_sbd: string;
    ped_patt_no: string;
    mmd_ap_media_type: string;
    mmd_ap_size: string;
    mmd_ap_interface: string;
    mmd_ap_scsi: string;
    mmd_ap_os: string;
    mmd_ap_application_name: string;
    mmd_ap_application_version: string;
    mmd_ap_submitted_by: string;
    mmd_ap_status: string;
    mmd_ap_verified_by: string;
    ess_extraction_job_ref_no: string;
    ess_extraction_job_assign_to: string;
    ess_extraction_remarks: string;
    ess_extraction_status: string;
    status_of_job: string;
    handed_over_to: string;
    draft_status: string;
    created_on: string;
    created_ip: string;
    modified_on: string;
    modified_ip: string;
    es_repair_or_es_restoration: number;
    sd_ship: number;
    sd_system: number;
    created_by: number;
    modified_by: number;
  };
}

@Component({
  selector: 'app-seg-main-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TieredMenuModule,
    ToastComponent,
    DeleteConfirmationModalComponent,
    SegFormComponent,
    SegFormTableComponent,
    SegDashboardComponent,
    PaginatedTableComponent,
    NgxPrintModule
  ],
  providers: [WordDownloadService],
  templateUrl: './seg-main-component.component.html',
  styleUrls: ['./seg-main-component.component.css'],
})
export class SegMainComponentComponent implements OnInit, OnDestroy {
  activeSubPath: string = 'dashboard';
  searchText: string = '';
  
  // Dual-view architecture properties
  showTableView = true; // Controls which view is shown
  formOnlyMode = false; // Input property to force form-only mode
  isAddMode = false; // Track if we're in add mode
  
  // Tab management
  activeTab: string = 'draft';
  tabCounts = {
    draft: 0,
    'work-in-progress': 0,
    approved: 0
  };
  
  // Table and form states (legacy - will be removed)
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  isViewFormOpen: boolean = false;
  isViewDetailsOpen: boolean = false;
  showDeleteDialog: boolean = false;
  selectedReport: SegFormReport | null = null;
  
  // Table configuration
  apiUrl: string = 'seg/segform/';
  totalCount: number = 0;
  toggleTable: boolean = true;
  
  // Get API URL based on active tab
  get currentApiUrl(): string {
    const statusMap = {
      'draft': 'Draft',
      'work-in-progress': 'Submitted', 
      'approved': 'Approved'
    };
    return `seg/segform/?draft_status=${statusMap[this.activeTab as keyof typeof statusMap]}`;
  }
  
  // Table columns configuration
  cols = [
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


  // Loading states for Word download
  isDocLoading: boolean = false;
  docProgress: number = 0;
  docProgressInterval: any;

  constructor(
    private router: Router, 
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private toastService: ToastService,
    public elementRef: ElementRef,
    private wordDownloadService: WordDownloadService
  ) {}

  ngOnInit(): void {
    // Initialize with Dashboard view
    this.activeSubPath = 'dashboard';
    // Load initial tab counts
    this.loadTabCounts();
  }

  navigateToSeg(subPath: string): void {
    this.activeSubPath = subPath;
    if(subPath === 'Report'){
      this.reportApicall();
    }
    // For now, we only have one sub-path, so no navigation needed
  }

  // Table event handlers
  onDataLoaded(data: any[]): void {
    // Map the data to ensure proper ID field for table actions
    this.mappedData = data.map(item => ({
      ...item,
      id: item.id // Use the direct id field from the new API response
    }));
  }
  
  // Store mapped data for table display
  mappedData: any[] = [];
  
  // Reference to paginated table for refresh
  @ViewChild('paginatedTable') paginatedTable: any;

  // Method to refresh table data after form submission
  refreshTableData(): void {
    if (this.paginatedTable) {
      // Trigger a page change to refresh the data
      this.paginatedTable.onPageChange({ first: 0, rows: this.paginatedTable.rowsPerPage });
    }
  }

  // Dual-view architecture methods
  toggleView(): void {
    if (this.formOnlyMode) {
      return; // Don't allow toggling in form-only mode
    }
    
    this.showTableView = !this.showTableView;
    
    if (this.showTableView) {
      this.clearFormData();
      this.isAddMode = false;
    }
  }

  onEditForm(form: any): void {
    console.log('🔍 onEditForm called - Form:', form);
    
    // If form is empty (add mode), stay in the same component
    if (!form || !form.id) {
      console.log('🔍 Add mode - staying in same component');
      this.showTableView = false;
      this.isAddMode = true;
      this.clearFormData();
      return;
    }
    
    // If form has ID (edit mode), navigate to Commentor Sheet
    console.log('🔍 Edit mode - Navigating to Commentor Sheet');
    this.router.navigate(['/seg-form-commentor-sheet'], {
      queryParams: {
        mode: 'edit',
        id: form.id,
        formData: JSON.stringify(form)
      }
    });
  }

  onViewForm(form: any): void {
    console.log('🔍 onViewForm called - Navigating to Commentor Sheet');
    // Navigate to Commentor Sheet with view mode and form data
    this.router.navigate(['/seg-form-commentor-sheet'], {
      queryParams: {
        mode: 'view',
        id: form.id,
        formData: JSON.stringify(form)
      }
    });
  }

  onAddForm(): void {
    console.log('🔍 onAddForm called');
    this.showTableView = false;
    this.isAddMode = true;
    this.clearFormData();
  }

  goBackToList(): void {
    console.log('🔍 goBackToList called - Navigating back to main SEG page');
    // Navigate back to the main SEG page
    this.router.navigate(['/forms/seg/seg-form']);
  }

  private clearFormData(): void {
    console.log('🔍 clearFormData called - resetting form to initial state');
    this.selectedReport = null;
  }

  // Legacy CRUD Operations (will be removed)
  openAddReport(): void {
    this.isFormOpen = true;
    this.isEditFormOpen = false;
    this.selectedReport = null;
  }

  viewDetails(report: SegFormReport): void {
    this.selectedReport = report;
    this.isViewFormOpen = true;
  }

  editDetails(report: SegFormReport): void {
    this.selectedReport = report;
    this.isEditFormOpen = true;
    this.isFormOpen = false;
  }

  deleteReportDetails(report: SegFormReport): void {
    this.selectedReport = report;
    this.showDeleteDialog = true;
  }

  confirmDeletion(): void {
    const reportId = this.selectedReport?.id || this.selectedReport?.di_or_dr_id || this.selectedReport?.di_or_dr_data?.id;
    if (!reportId) {
      this.toastService.showError('Report ID is missing for deletion.');
      this.closeDialog();
      return;
    }

    const payload = {
      di_or_dr_id: reportId
    };

    this.apiService.post('seg/segform/delete/', payload).subscribe({
      next: () => {
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.loadTabCounts(); // Refresh tab counts
        this.toastService.showSuccess('SEG Form Report deleted successfully');
        this.showDeleteDialog = false;
      },
      error: (error) => {
        console.error('Delete report failed:', error);
        this.toastService.showError(error.error?.message || 'Failed to delete report.');
      },
    });
  }

  cancelDeletion(): void {
    this.showDeleteDialog = false;
  }

  closeDialog(): void {
    this.isFormOpen = false;
    this.isEditFormOpen = false;
    this.isViewFormOpen = false;
    this.isViewDetailsOpen = false;
    this.showDeleteDialog = false;
    this.selectedReport = null;
  }


  // Export functionality
  exportPDF(): void {
    // Implementation for PDF export
  }

  exportExcel(): void {
    // Implementation for Excel export
  }


  // Tab management methods
  onTabChange(event: {tabId: string, draftStatus: string, apiUrl: string} | string): void {
    // Handle both object and string parameters for backward compatibility
    if (typeof event === 'string') {
      this.activeTab = event;
    } else {
      this.activeTab = event.tabId;
    }
    
    // Refresh table data when tab changes
    this.toggleTable = false;
    setTimeout(() => {
      this.toggleTable = true;
    }, 100);
  }

  loadTabCounts(): void {
    // Load counts for each tab status using draft_status parameter
    const statusMap = {
      'draft': 'Draft',
      'work-in-progress': 'Submitted', 
      'approved': 'Approved'
    };
    
    Object.entries(statusMap).forEach(([tabKey, apiValue]) => {
      this.apiService.get(`seg/segform/?draft_status=${apiValue}&count_only=true`).subscribe({
        next: (response: any) => {
          this.tabCounts[tabKey as keyof typeof this.tabCounts] = response.count || 0;
        },
        error: (error) => {
          console.error(`Failed to load count for ${tabKey}:`, error);
        }
      });
    });
  }

  // Navigation methods
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
  reportVersions: any[] = [];
  colReportVersions=[
    { field: 'version', header: 'Version', filterType: 'text' },
    { field: 'created_on', header: 'Created At', filterType: 'date' },
  ];
  reportApicall(){
    this.apiService.get(`etma/version/?sub_module_id=6`).subscribe({
      next: (response: any) => {
        this.reportVersions = response;
      },
      error: (error: any) => {
        console.error('Error fetching report versions:', error);
        this.toastService.showError('Failed to fetch report versions');
      }
    });
  }

  viewReportVersion(version: any): void {
    this.openFullPopup = true;
    this.selectedReportVersion = version;
    setTimeout(() => {
      this.renderSavedHtml();
    }, 100);
  }

  private renderSavedHtml(): void {
    const container = document.querySelector('.report-version-container');
    if (container && this.selectedReportVersion?.data) {
      container.innerHTML = '';
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.selectedReportVersion.data;
      while (tempDiv.firstChild) {
        container.appendChild(tempDiv.firstChild);
      }
      
      // Handle different form elements
      container.querySelectorAll('input, textarea, select').forEach((element: any) => {
        if (element.tagName === 'SELECT') {
          // For select elements, restore the selected value
          const savedValue = element.getAttribute('value');
          console.log('Rendering select element:', element.name || element.id, 'Saved value:', savedValue);
          if (savedValue) {
            element.value = savedValue;
            // Also ensure the selected option is marked as selected
            element.querySelectorAll('option').forEach((option: any) => {
              option.removeAttribute('selected');
              if (option.value === savedValue) {
                option.setAttribute('selected', 'selected');
                console.log('Option selected:', option.textContent);
              }
            });
          }
          element.disabled = true;
          element.style.cursor = 'not-allowed';
        } else if (element.type === 'checkbox' || element.type === 'radio') {
          // For checkboxes and radio buttons, restore checked state
          const isChecked = element.getAttribute('checked') === 'true' || element.hasAttribute('checked');
          element.checked = isChecked;
          element.disabled = true;
          element.style.cursor = 'not-allowed';
        } else {
          // For text inputs and textareas, restore value and make read-only
          const savedValue = element.getAttribute('value');
          if (savedValue) {
            element.value = savedValue;
          }
          element.readOnly = true;
          element.style.cursor = 'not-allowed';
        }
      });
    }
  }
  selectedReportVersion: any | null = null;
  openFullPopup=false;
  closeReportVersionPopup(): void {
    this.openFullPopup = false;
    this.selectedReportVersion = null;
    
    // Clear the container content
    const container = document.querySelector('.report-version-container');
    if (container) {
      container.innerHTML = '';
    }
  }

  // Word Download Functions
  async downloadWord() {
    this.isDocLoading = true;
    this.startProgress('doc');
    
    const htmlContent = document.querySelector('.report-version-container');
    
    if (htmlContent) {
      try {
        const { asBlob } = await import('html-docx-js-typescript');
        
        let string = this.removeNgContentAttributes(htmlContent as HTMLElement);
        const data: Blob = await asBlob(string) as Blob;
        const url = URL.createObjectURL(data);
        
        // Generate filename
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `SEG_${timestamp}.docx`;
        
        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object after a short delay
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        this.completeProgress('doc');
        setTimeout(() => {
          this.isDocLoading = false;
          this.docProgress = 0;
        }, 1000);
        this.toastService.showSuccess('Word document generated successfully');
      } catch (error) {
        this.completeProgress('doc');
        setTimeout(() => {
          this.isDocLoading = false;
          this.docProgress = 0;
        }, 1000);
        this.toastService.showError('Failed to generate Word document');
      }
    } else {
      this.completeProgress('doc');
      setTimeout(() => {
        this.isDocLoading = false;
        this.docProgress = 0;
      }, 1000);
      this.toastService.showError('HTML content not found');
    }
  }

  removeNgContentAttributes(element: HTMLElement): string {
    if (element.attributes) {
      for (let i = 0; i < element.attributes.length; i++) {
        const attribute = element.attributes[i];
        if (attribute.name.startsWith('_ngcontent')) {
          element.removeAttribute(attribute.name);
        }
      }
    }
    if (element.children) {
      for (let i = 0; i < element.children.length; i++) {
        this.removeNgContentAttributes(element.children[i] as HTMLElement);
      }
    }
    return element.outerHTML;
  }

  startProgress(type: 'doc') {
    if (type === 'doc') {
      this.docProgress = 0;
      this.docProgressInterval = setInterval(() => {
        if (this.docProgress < 90) {
          this.docProgress += Math.random() * 15;
        }
      }, 500);
    }
  }

  completeProgress(type: 'doc') {
    if (type === 'doc') {
      this.docProgress = 100;
      if (this.docProgressInterval) {
        clearInterval(this.docProgressInterval);
        this.docProgressInterval = null;
      }
    }
  }

  clearProgressIntervals() {
    if (this.docProgressInterval) {
      clearInterval(this.docProgressInterval);
      this.docProgressInterval = null;
    }
  }

  resetProgress() {
    this.docProgress = 0;
    this.clearProgressIntervals();
  }

  cancelLoading() {
    this.isDocLoading = false;
    this.resetProgress();
    this.toastService.showError('Loading cancelled by user');
  }

  ngOnDestroy(): void {
    this.clearProgressIntervals();
  }
}
