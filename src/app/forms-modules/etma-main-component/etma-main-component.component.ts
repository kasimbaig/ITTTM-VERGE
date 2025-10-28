import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ToastService } from '../../services/toast.service';
import { ApiService } from '../../services/api.service';
import { PaginatedTableComponent } from '../../shared/components/paginated-table/paginated-table.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { DeleteConfirmationModalComponent } from '../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { GtgLoadTrialReportComponent } from '../forms/transaction/etma/gtg-load-trial-report.component';
import { StatusTabsComponent } from '../../shared/components/status-tabs/status-tabs.component';
import { EtmaDashboardComponent } from '../etma-dashboard/etma-dashboard.component';

import { NgxPrintModule } from 'ngx-print';
import { DynmicFromComponent } from '../forms/dynmic-from/dynmic-from.component';
import { WordDownloadService } from '../../shared/services/word-download.service';
interface GtgLoadTrialReport {
  id?: number;
  Presented_by: string;
  trial_date: string;
  occation_of_trial: string;
  occationOfCurrTrial: string;
  lastTrialDate: string;
  ship: number;
  proposal_reference: string;
  file_reference: string;
  referanceDocID: string;
  engn_make: string;
  engn_model_SrNo: string;
  engn_rpm_val: string;
  govnr_make: string;
  govnr_model_SrNo: string;
  govnr_type: string;
  altnr_make: string;
  altnr_model_SrNo: string;
  altnr_type: string;
  altnr_RatedVoltage: string;
  altnr_RatedFrequency: string;
  altnr_RatedVal: string;
  altnr_RatedCurrentVal: string;
  altnr_BearingNo: string;
  avr_make_type: string;
  avr_model_SrNo: string;
  spplyBrkr_make: string;
  spplyBrkr_model_srno: string;
  spplyBrkr_RatedCpcty: string;
  draft_status?: string;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-etma-main-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TieredMenuModule,
    PaginatedTableComponent,
    ToastComponent,
    DeleteConfirmationModalComponent,
    GtgLoadTrialReportComponent,
    StatusTabsComponent,

    EtmaDashboardComponent,
    NgxPrintModule,
    DynmicFromComponent
  ],
  providers: [WordDownloadService],
  templateUrl: './etma-main-component.component.html',
  styleUrls: ['./etma-main-component.component.css'],
})
export class EtmaMainComponentComponent implements OnInit, OnDestroy {
  @ViewChild('gtgFormComponent') gtgFormComponent!: GtgLoadTrialReportComponent;
  
  activeSubPath: string = 'dashboard';
  searchText: string = '';
  
  // Tab management
  activeTab: string = 'draft';
  tabCounts = {
    draft: 0,
    'work-in-progress': 0,
    approved: 0
  };
  
  // Table and form states
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  isViewFormOpen: boolean = false;
  showDeleteDialog: boolean = false;
  selectedReport: GtgLoadTrialReport | null = null;
  selectedReportVersion: any | null = null;
  openFullPopup=false;
  // Table configuration
  apiUrl: string = 'etma/loadtrial/';
  totalCount: number = 0;
  toggleTable: boolean = true;
  
  // Get API URL based on active tab
  get currentApiUrl(): string {
    const statusMap = {
      'draft': 'draft',
      'work-in-progress': 'save', 
      'approved': 'approved'
    };
    return `etma/loadtrial/?draft_status=${statusMap[this.activeTab as keyof typeof statusMap]}`;
  }
  
  // Table columns configuration
  cols = [
    { field: 'ship.name', header: 'Ship', filterType: 'text' },
    { field: 'Presented_by', header: 'Presented By', filterType: 'text' },
    { field: 'trial_date', header: 'Trial Date', filterType: 'date' },
    { field: 'occation_of_trial', header: 'Occasion of Trial', filterType: 'text' },
    { field: 'occationOfCurrTrial', header: 'Current Trial Occasion', filterType: 'text' },
    { field: 'proposal_reference', header: 'Proposal Reference', filterType: 'text' },
    { field: 'file_reference', header: 'File Reference', filterType: 'text' },
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

  navigateToEtma(subPath: string): void {
    this.activeSubPath = subPath;
    if(subPath === 'report'){
      this.reportApicall();
    }
   
  }
  reportVersions: any[] = [];
  colReportVersions=[
    { field: 'version', header: 'Version', filterType: 'text' },
    { field: 'created_on', header: 'Created At', filterType: 'date' },
  ];
  reportApicall(){
    this.apiService.get(`etma/version/?sub_module_id=5`).subscribe({
      next: (response: any) => {
        this.reportVersions = response;
      },
      error: (error: any) => {
        console.error('Error fetching report versions:', error);
        this.toastService.showError('Failed to fetch report versions');
      }
    });
  }
  // Table event handlers
  onDataLoaded(data: any[]): void {
    // Data loaded from paginated table
  }

  // CRUD Operations
  openAddReport(): void {
    this.isFormOpen = true;
    this.isEditFormOpen = false;
    this.isViewFormOpen = false;
    this.selectedReport = null;
  }

  viewDetails(report: GtgLoadTrialReport): void {
    this.selectedReport = report;
    this.isViewFormOpen = true;
    this.isFormOpen = false;
    this.isEditFormOpen = false;
  }

  editDetails(report: GtgLoadTrialReport): void {
    this.selectedReport = report;
    this.isEditFormOpen = true;
    this.isFormOpen = false;
    this.isViewFormOpen = false;
  }

  deleteReportDetails(report: GtgLoadTrialReport): void {
    this.selectedReport = report;
    this.showDeleteDialog = true;
  }

  confirmDeletion(): void {
    if (!this.selectedReport?.id) {
      this.toastService.showError('Report ID is missing for deletion.');
      this.closeDialog();
      return;
    }

    const payload = {
      id: this.selectedReport.id,
      delete: true
    };

    this.apiService.post('etma/loadtrial/', payload).subscribe({
      next: () => {
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.loadTabCounts(); // Refresh tab counts
        this.toastService.showSuccess('GTG Load Trial Report deleted successfully');
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
    this.showDeleteDialog = false;
    this.selectedReport = null;
  }

  // Form submission handlers
  onFormSubmit(formData: any): void {
    // Simple form submission - delegate to the form component
    this.toggleTable = false;
    setTimeout(() => {
      this.toggleTable = true;
    }, 100);
    this.loadTabCounts(); // Refresh tab counts
    this.toastService.showSuccess('GTG Load Trial Report saved successfully');
    this.closeDialog();
  }

  // Export functionality
  exportPDF(): void {
    // Implementation for PDF export
  }

  exportExcel(): void {
    // Implementation for Excel export
  }


  // Tab management methods
  editAndDeleteAction=true;
  onTabChange(tabKey: string): void {
    this.activeTab = tabKey;
    if(tabKey === 'approved'){
      this.editAndDeleteAction = false;
    }else{
      this.editAndDeleteAction = true;
    }
    this.toggleTable = false;
    setTimeout(() => {
      this.toggleTable = true;
    }, 100);
  }

  loadTabCounts(): void {
    // Load counts for each tab status using draft_status parameter
    const statusMap = {
      'draft': 'draft',
      'work-in-progress': 'save', 
      'approved': 'approved'
    };
    
    Object.entries(statusMap).forEach(([tabKey, apiValue]) => {
      this.apiService.get(`etma/loadtrial/?draft_status=${apiValue}&count_only=true`).subscribe({
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
        // Dynamically import the library
        const { asBlob } = await import('html-docx-js-typescript');
        
        let string = this.removeNgContentAttributes(htmlContent as HTMLElement);
        const data: Blob = await asBlob(string) as Blob;
        const url = URL.createObjectURL(data);
        
        // Generate filename
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `ETMA_${timestamp}.docx`;
        
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