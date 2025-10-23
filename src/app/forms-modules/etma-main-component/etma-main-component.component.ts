import { Component, OnInit, ViewChild } from '@angular/core';
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
    StatusTabsComponent
  ],
  templateUrl: './etma-main-component.component.html',
  styleUrls: ['./etma-main-component.component.css'],
})
export class EtmaMainComponentComponent implements OnInit {
  @ViewChild('gtgFormComponent') gtgFormComponent!: GtgLoadTrialReportComponent;
  
  activeSubPath: string = 'transaction';
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

  constructor(
    private router: Router, 
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Initialize with Transaction view
    this.activeSubPath = 'transaction';
    // Load initial tab counts
    this.loadTabCounts();
  }

  navigateToEtma(subPath: string): void {
    this.activeSubPath = subPath;
    // For now, we only have one sub-path, so no navigation needed
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
  onTabChange(tabKey: string): void {
    this.activeTab = tabKey;
    // Refresh table data when tab changes
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
}