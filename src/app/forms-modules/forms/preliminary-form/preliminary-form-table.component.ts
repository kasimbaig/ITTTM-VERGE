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

export interface PreliminaryFormData {
  id?: number;
  inspectionType: string;
  inspectionDate: string;
  inspectionAuthority: string;
  dockingVersion: string;
  natureOfDocking: string;
  dockBlocksWedged: string;
  dockBlocksCrushed: string;
  uwOpeningsClear: string;
  dockingDuration: string;
  extentOfHullSurvey: string;
  status?: string; // Added status field
  inspectors: any[];
  marineGrowthObservations: any[];
  propellerCleaningObservations: any[];
  foreignObjectsObservations: any[];
  conditionOfAFObservations: any[];
  outerBottomObservations: any[];
  sternAftCutupObservations: any[];
  bootTopObservations: any[];
  ruddersObservations: any[];
  stabilizersObservations: any[];
  oldDockBlockAreasObservations: any[];
  otherObservations: any[];
  paintSchemeObservations: any[];
  areasHavingRustObservations: any[];
  generalOuterBottomObservations: any[];
  bootTopRustObservations: any[];
  sternAftCutupRustObservations: any[];
  bilgeKeelObservations: any[];
  oldDockBlockRustObservations: any[];
  otherRustObservations: any[];
  ruddersRustObservations: any[];
  dentsAtObservations: any[];
  suspectCracksObservations: any[];
  deepScratchObservations: any[];
  holesDoublersObservations: any[];
  otherStructureObservations: any[];
  structuralDefectsObservations: any[];
  stabilizersSurveyObservations: any[];
  cleanShipObservations: any[];
  cracksDentsFoulingObservations: any[];
  grpDomeObservations: any[];
  fairingSkirtObservations: any[];
  rudderCracksObservations: any[];
  rudderMisalignmentObservations: any[];
  iccpSystemObservations: any[];
  sacrificialAnodesObservations: any[];
  iccpAnodesObservations: any[];
  iccpReferenceElectrodeObservations: any[];
  dielectricShieldsObservations: any[];
  preDockingChecksObservations: any[];
  propellerCleaningObservations2: any[];
  propellerBladeEdgesObservations: any[];
  propellerHubsObservations: any[];
  propellerPittingObservations: any[];
  propellerShaftCoatingObservations: any[];
  eddyConeObservations: any[];
  waterSeepageObservations: any[];
  missingPartsObservations: any[];
  blankingPartsObservations: any[];
  scupperLipsObservations: any[];
  aralditeFairingObservations: any[];
  angleOfListObservations: any[];
  otherObservationsFinal: any[];
  created_at?: string;
  updated_at?: string;
  // Additional fields that might come from the API
  ship_name?: string;
  ship_id?: number;
  inspection_reference?: string;
  authority_for_inspection?: string;
  date_of_inspection?: string;
  created_by?: string;
  modified_by?: string;
  // Fields needed for table display
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
  draft_status?: string;
  // Add observations array from API response
  observations?: any[];
}

@Component({
  selector: 'app-preliminary-form-table',
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
  templateUrl: './preliminary-form-table.component.html',
  styleUrl: './preliminary-form-table.component.css'
})
export class PreliminaryFormTableComponent implements OnInit {
  @Input() title: string = 'Preliminary Form Records';
  @Input() apiUrl: string = '/hitu/preliminary-underwater-hull-inspection-reports/'; // API URL for preliminary forms
  @Output() editEvent = new EventEmitter<PreliminaryFormData>();
  @Output() viewEvent = new EventEmitter<PreliminaryFormData>();
  @Output() deleteEvent = new EventEmitter<PreliminaryFormData>();
  @Output() tabChanged = new EventEmitter<{tabId: string, draftStatus: string, apiUrl: string}>();

  searchText: string = '';
  forms: PreliminaryFormData[] = [];
  filteredForms: PreliminaryFormData[] = [];
  showDeleteDialog: boolean = false;
  selectedForm: PreliminaryFormData = {} as PreliminaryFormData;
  totalCount: number = 0;
  activeTab: string = 'draft';
  loading: boolean = false;
  error: string | null = null;

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
    // Paginated table will handle data loading via API
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
    this.error = 'Failed to load preliminary form records';
    this.forms = [];
    this.filteredForms = [];
    this.totalCount = 0;
    this.toastService.showError('Failed to load preliminary form records');
  }

  private transformApiData(apiItem: any): PreliminaryFormData {
    console.log('🔍 Transforming API data:', apiItem);
    console.log('🔍 Ship object in API data:', apiItem.ship);
    console.log('🔍 Ship ID:', apiItem.ship?.id);
    
    return {
      id: apiItem.id,
      inspectionType: apiItem.ship?.id || apiItem.ship_id, // Map ship ID for dropdown
      inspectionDate: apiItem.dt_inspection || apiItem.inspectionDate || apiItem.date_of_inspection || '',
      inspectionAuthority: apiItem.auth_inspection || apiItem.authority_for_inspection || apiItem.inspectionAuthority || '',
      dockingVersion: apiItem.docking_version || apiItem.dockingVersion || '',
      natureOfDocking: apiItem.nature_of_docking || apiItem.natureOfDocking || '',
      dockBlocksWedged: apiItem.no_of_dock_blocks_wedged || apiItem.dockBlocksWedged || '',
      dockBlocksCrushed: apiItem.no_of_dock_blocks_crushed || apiItem.dockBlocksCrushed || '',
      uwOpeningsClear: apiItem.uw_openings_clear || apiItem.uwOpeningsClear || '',
      dockingDuration: apiItem.duration_of_docking || apiItem.dockingDuration || '',
      extentOfHullSurvey: apiItem.extent_of_survey || apiItem.extentOfHullSurvey || '',
      status: apiItem.draft_status || apiItem.status || 'Draft',
      inspectors: apiItem.inspectors || [],
      marineGrowthObservations: apiItem.marineGrowthObservations || [],
      propellerCleaningObservations: apiItem.propellerCleaningObservations || [],
      foreignObjectsObservations: apiItem.foreignObjectsObservations || [],
      conditionOfAFObservations: apiItem.conditionOfAFObservations || [],
      outerBottomObservations: apiItem.outerBottomObservations || [],
      sternAftCutupObservations: apiItem.sternAftCutupObservations || [],
      bootTopObservations: apiItem.bootTopObservations || [],
      ruddersObservations: apiItem.ruddersObservations || [],
      stabilizersObservations: apiItem.stabilizersObservations || [],
      oldDockBlockAreasObservations: apiItem.oldDockBlockAreasObservations || [],
      otherObservations: apiItem.otherObservations || [],
      paintSchemeObservations: apiItem.paintSchemeObservations || [],
      areasHavingRustObservations: apiItem.areasHavingRustObservations || [],
      generalOuterBottomObservations: apiItem.generalOuterBottomObservations || [],
      bootTopRustObservations: apiItem.bootTopRustObservations || [],
      sternAftCutupRustObservations: apiItem.sternAftCutupRustObservations || [],
      bilgeKeelObservations: apiItem.bilgeKeelObservations || [],
      oldDockBlockRustObservations: apiItem.oldDockBlockRustObservations || [],
      otherRustObservations: apiItem.otherRustObservations || [],
      ruddersRustObservations: apiItem.ruddersRustObservations || [],
      dentsAtObservations: apiItem.dentsAtObservations || [],
      suspectCracksObservations: apiItem.suspectCracksObservations || [],
      deepScratchObservations: apiItem.deepScratchObservations || [],
      holesDoublersObservations: apiItem.holesDoublersObservations || [],
      otherStructureObservations: apiItem.otherStructureObservations || [],
      structuralDefectsObservations: apiItem.structuralDefectsObservations || [],
      stabilizersSurveyObservations: apiItem.stabilizersSurveyObservations || [],
      cleanShipObservations: apiItem.cleanShipObservations || [],
      cracksDentsFoulingObservations: apiItem.cracksDentsFoulingObservations || [],
      grpDomeObservations: apiItem.grpDomeObservations || [],
      fairingSkirtObservations: apiItem.fairingSkirtObservations || [],
      rudderCracksObservations: apiItem.rudderCracksObservations || [],
      rudderMisalignmentObservations: apiItem.rudderMisalignmentObservations || [],
      iccpSystemObservations: apiItem.iccpSystemObservations || [],
      sacrificialAnodesObservations: apiItem.sacrificialAnodesObservations || [],
      iccpAnodesObservations: apiItem.iccpAnodesObservations || [],
      iccpReferenceElectrodeObservations: apiItem.iccpReferenceElectrodeObservations || [],
      dielectricShieldsObservations: apiItem.dielectricShieldsObservations || [],
      preDockingChecksObservations: apiItem.preDockingChecksObservations || [],
      propellerCleaningObservations2: apiItem.propellerCleaningObservations2 || [],
      propellerBladeEdgesObservations: apiItem.propellerBladeEdgesObservations || [],
      propellerHubsObservations: apiItem.propellerHubsObservations || [],
      propellerPittingObservations: apiItem.propellerPittingObservations || [],
      propellerShaftCoatingObservations: apiItem.propellerShaftCoatingObservations || [],
      eddyConeObservations: apiItem.eddyConeObservations || [],
      waterSeepageObservations: apiItem.waterSeepageObservations || [],
      missingPartsObservations: apiItem.missingPartsObservations || [],
      blankingPartsObservations: apiItem.blankingPartsObservations || [],
      scupperLipsObservations: apiItem.scupperLipsObservations || [],
      aralditeFairingObservations: apiItem.aralditeFairingObservations || [],
      angleOfListObservations: apiItem.angleOfListObservations || [],
      otherObservationsFinal: apiItem.otherObservationsFinal || [],
      created_at: apiItem.created_at,
      updated_at: apiItem.updated_at,
      ship_name: apiItem.ship?.name || apiItem.ship_name,
      ship_id: apiItem.ship?.id || apiItem.ship_id,
      inspection_reference: apiItem.inspection_reference,
      authority_for_inspection: apiItem.authority_for_inspection,
      date_of_inspection: apiItem.dt_inspection || apiItem.date_of_inspection,
      created_by: apiItem.created_by,
      modified_by: apiItem.modified_by,
      // Add the fields needed for table display
      ship: apiItem.ship,
      dt_inspection: apiItem.dt_inspection,
      draft_status: apiItem.draft_status,
      // Add the observations array from API response
      observations: apiItem.observations || []
    };
  }

  // Dynamic API URL based on selected tab
  get currentApiUrl(): string {
    const baseUrl = this.apiUrl;
    const draftStatus = this.getDraftStatusForTab(this.activeTab);
    const fullUrl = `${baseUrl}?draft_status=${draftStatus}`;
    return fullUrl;
  }

  // Method to map tab ID to draft status
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

  onTabChange(tabId: string): void {
    this.activeTab = tabId;
   
    this.tabChanged.emit({
      tabId: tabId,
      draftStatus: this.getDraftStatusForTab(tabId),
      apiUrl: this.currentApiUrl
    });
  }

  editForm(form: PreliminaryFormData | {}): void {
    console.log('🔍 editForm called with:', form);
    this.editEvent.emit(form as PreliminaryFormData);
  }

  viewForm(form: PreliminaryFormData): void {
    console.log('🔍 viewForm called with:', form);
    this.viewEvent.emit(form);
  }

  deleteForm(form: PreliminaryFormData): void {
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
          this.selectedForm = {} as PreliminaryFormData;
          
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
    this.selectedForm = {} as PreliminaryFormData;
  }

  refreshData(): void {
    // This will trigger the paginated table to refresh its data
    // The paginated table component handles the actual API call
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
