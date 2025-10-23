import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DynamicTableComponent, TableColumn } from '../../shared/components/dynamic-table/dynamic-table.component';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { IntermediateFormTableComponent } from './intermediate-form-table.component';
import { RouteConfigComponent } from '../../../route-config/route-config.component';
import { RouteConfigPopupComponent, RouteConfigData } from '../../../shared/components/route-config-popup/route-config-popup.component';

interface Ship {
  id: number;
  name: string;
  code: string;
  active: number;
  created_on: string;
  created_ip: string;
  modified_on: string;
  modified_ip: string | null;
  year_of_build: number;
  year_of_delivery: number;
  created_by: number;
  modified_by: number;
  classofship: {
    id: number;
    code: string;
    active: number;
    created_on: string;
    created_ip: string;
    modified_on: string;
    modified_ip: string | null;
    name: string;
    created_by: number;
    modified_by: number | null;
  };
  shiptype: {
    id: number;
    code: string;
    active: number;
    created_on: string;
    created_ip: string;
    modified_on: string;
    modified_ip: string;
    name: string;
    created_by: number;
    modified_by: number | null;
  };
  yard: {
    id: number;
    code: string;
    active: number;
    created_on: string;
    created_ip: string;
    modified_on: string;
    modified_ip: string;
    name: string;
    created_by: number;
    modified_by: number;
  };
  command: {
    id: number;
    code: string;
    active: number;
    created_on: string;
    created_ip: string;
    modified_on: string;
    modified_ip: string;
    name: string;
    created_by: number;
    modified_by: number | null;
  };
}

interface ShipApiResponse {
  status: number;
  data: Ship[];
}

@Component({
  selector: 'app-intermediate-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DynamicTableComponent, IntermediateFormTableComponent, RouteConfigComponent, RouteConfigPopupComponent],
  templateUrl: './intermediate-form.component.html',
  styleUrl: './intermediate-form.component.css'
})
export class IntermediateFormComponent implements OnInit {
  @Input() formOnlyMode: boolean = false; // Input to control if only form should be shown
  @Input() recordData: any = null; // Input for record data from Commentor Sheet
  @Input() mode: 'add' | 'edit' | 'view' = 'add'; // Input for mode
  @Input() record: any = null; // Input for record
  @Input() formData: any = {}; // Input for form data
  @Input() transactionId: string | number | undefined = undefined; // Input for transaction ID
  @Input() submodule: number = 3; // Input for submodule (Intermediate form submodule)
  @Input() isViewMode: boolean = false; // Input for view mode
  intermediateForm: FormGroup;
  ships: Ship[] = [];
  loading = false;
  showTableView = true; // Set to true to show table by default
  
  // Route configuration popup properties
  showRouteConfigPopup = false;
  isAddMode = false; // Track if we're in add mode
  pendingAction: 'save' | 'saveDraft' | null = null; // Track which action triggered the popup
  userInitiatedAction = false; // Track if user initiated the action
  showRouteConfigModal = false; // Control route config modal visibility

  // Table column configurations

  hullSurveyColumns: TableColumn[] = [
    { key: 'srNo', label: 'Sr No.', colSpan: 1 },
    { key: 'location', label: 'Location*', required: true, colSpan: 2 },
    { key: 'from', label: 'From*', required: true, colSpan: 1 },
    { key: 'to', label: 'To*', required: true, colSpan: 1 },
    { key: 'observation', label: 'Observation*', required: true, colSpan: 3 },
    { key: 'remarks', label: 'Remarks*', required: true, colSpan: 2 }
  ];

  constructor(private fb: FormBuilder, private apiService: ApiService, private toastService: ToastService, private router: Router) {
    this.intermediateForm = this.createForm();
  }





  private forwardForReview(data: any): void {
    // Implement API call to forward for review
    this.apiService.post('config/approval/', data).subscribe({
      next: (response) => {
       
      },
      error: (error) => {
        console.error('Error forwarding for review:', error);
        console.error('Failed to forward for review');
      }
    });
  }

  private saveTimelinePreference(isVisible: boolean): void {
    // Save user preference for timeline visibility
    localStorage.setItem('timelineVisible', isVisible.toString());
  }

  private updateFormStatus(status: string): void {
    // Update form status in your form data
    // This is just an example

  }

  ngOnInit() {
    this.loadShips();
    
    // If formOnlyMode is enabled, force form view
    if (this.formOnlyMode) {
      this.showTableView = false;
      
      // Set mode based on input
      if (this.mode === 'view') {
        this.isAddMode = false;
        // isViewMode is already set via @Input()
      } else if (this.mode === 'edit') {
        this.isAddMode = false;
        // isViewMode is already set via @Input()
      } else {
        this.isAddMode = true;
        // isViewMode is already set via @Input()
      }
      
      // If recordData is provided, load it into the form
      if (this.recordData) {
        this.loadFormData(this.recordData);
        this.isAddMode = false; // Set to edit mode since we have data
      }
    }
  }

  loadShips() {
    this.loading = true;
    this.apiService.get<ShipApiResponse>('master/ship/').subscribe({
      next: (response) => {
        // Handle the actual API response structure
        this.ships = response.data || [];
        this.loading = false;
   
      },
      error: (error) => {
        console.error('Error loading ships:', error);
        this.loading = false;
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      id: [''], // For editing existing records
      ship_id: ['', Validators.required], // Ship selection
      // Header section
      inspectionType: ['', Validators.required],
      inspectionDate: ['', Validators.required],
      inspectionAuthority: ['', Validators.required],

      // Hull Survey & Repairs
      typeOfSurvey: ['', Validators.required],
      hullSurveyObservations: this.fb.array([]),

      // Tests Undertaken
      pressureTestingTanks: ['', Validators.required],
      pressureTestingSeaTubes: ['', Validators.required],
      ndtUndertaken: ['', Validators.required],

      // Defect Rectification
      defectRectificationObservations: this.fb.array([]),

      // New Observations
      newObservations: this.fb.array([]),
      
      // Approval checkbox
      isApprover: [false]
    });
  }

  createHullSurveyRow(): FormGroup {
    return this.fb.group({
      id: [''], // For editing existing hull survey records
      location: ['', Validators.required],
      from: ['', Validators.required],
      to: ['', Validators.required],
      observation: ['', Validators.required],
      remarks: ['', Validators.required]
    });
  }

  // Getters for form arrays
  get hullSurveyObservations(): FormArray {
    return this.intermediateForm.get('hullSurveyObservations') as FormArray;
  }

  get defectRectificationObservations(): FormArray {
    return this.intermediateForm.get('defectRectificationObservations') as FormArray;
  }

  get newObservations(): FormArray {
    return this.intermediateForm.get('newObservations') as FormArray;
  }

  // Update methods
  updateHullSurveyRows(count: number) {
    const currentLength = this.hullSurveyObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createHullSurveyRow());
      newRows.forEach(row => this.hullSurveyObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.hullSurveyObservations.removeAt(this.hullSurveyObservations.length - 1);
      }
    }
  }

  updateDefectRectificationRows(count: number) {
    const currentLength = this.defectRectificationObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createHullSurveyRow());
      newRows.forEach(row => this.defectRectificationObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.defectRectificationObservations.removeAt(this.defectRectificationObservations.length - 1);
      }
    }
  }

  updateNewObservationsRows(count: number) {
    const currentLength = this.newObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createHullSurveyRow());
      newRows.forEach(row => this.newObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.newObservations.removeAt(this.newObservations.length - 1);
      }
    }
  }

  onSubmit(event?: Event): void {
    
    // In edit mode, save directly without showing popup
    if (!this.isAddMode) {
      if (this.intermediateForm.valid) {
        this.performSave();
      } else {
        this.markFormGroupTouched(this.intermediateForm);
      }
      return;
    }
    
    // Only show popup in add mode
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    
    // Only show popup if form is valid (same logic as U/W Compartments)
    if (this.intermediateForm.valid) {
    this.pendingAction = 'save';
    this.showRouteConfigPopup = true;
    } else {
      this.markFormGroupTouched(this.intermediateForm);
    }
  }

  // New method for save draft functionality
  onSaveDraft(event?: Event): void {
    
    // In edit mode, save draft directly without showing popup
    if (!this.isAddMode) {
      this.performSaveDraft();
      return;
    }
    
    // Only show popup in add mode
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    
    // Always show route configuration popup for Save Draft button
    this.pendingAction = 'saveDraft';
    this.showRouteConfigPopup = true;
  }

  // Method to perform actual save
  private performSave(isForRouteConfig: boolean = false, isForModal: boolean = false): void {
    
    if (this.intermediateForm.valid) {
      const formData = this.intermediateForm.value;
      
      // Prepare payload for API
      const payload: any = {
        ...(formData.id && formData.id !== '' ? { id: formData.id } : {}), // Only include ID if it exists and is not empty
        ship_id: parseInt(formData.ship_id) || 0, // Convert to number
        inspection_type: formData.inspectionType,
        dt_inspection: formData.inspectionDate, // Changed from inspection_date to dt_inspection
        auth_inspection: formData.inspectionAuthority, // Updated field name
        type_of_survey: formData.typeOfSurvey,
        pt_of_tanks: formData.pressureTestingTanks, // Updated field name
        pt_of_sea_tubes: formData.pressureTestingSeaTubes, // Updated field name
        ndt_undertaken: formData.ndtUndertaken,
        draft_status: 'save', // Set to save for save action
        
        // Observations array
        observations: [
          // Add Hull Survey Observations
          ...(formData.hullSurveyObservations || []).map((obs: any, index: number) => ({
            ...(obs.id && obs.id !== '' ? { id: obs.id } : {}),
            sr_no: index + 1,
            section: 'HULL_SURVEY',
            location: obs.location,
            frame_station_from: obs.from,
            frame_station_to: obs.to,
            observation: obs.observation,
            remarks: obs.remarks
          })),
          
          // Add Defect Rectification Observations
          ...(formData.defectRectificationObservations || []).map((obs: any, index: number) => ({
            ...(obs.id && obs.id !== '' ? { id: obs.id } : {}),
            sr_no: (formData.hullSurveyObservations?.length || 0) + index + 1,
            section: 'DEFECT_RECTIFICATION',
            location: obs.location,
            frame_station_from: obs.from,
            frame_station_to: obs.to,
            observation: obs.observation,
            remarks: obs.remarks
          })),
          
          // Add New Observations
          ...(formData.newObservations || []).map((obs: any, index: number) => ({
            ...(obs.id && obs.id !== '' ? { id: obs.id } : {}),
            sr_no: (formData.hullSurveyObservations?.length || 0) + (formData.defectRectificationObservations?.length || 0) + index + 1,
            section: 'NEW_OBSERVATIONS',
            location: obs.location,
            frame_station_from: obs.from,
            frame_station_to: obs.to,
            observation: obs.observation,
            remarks: obs.remarks
          }))
        ]
      };

      
      // Make API call to the intermediate form endpoint
      this.apiService.post('hitu/intermediate-underwater-hull-inspection-reports/', payload).subscribe({
        next: (response) => {
          
          if (isForRouteConfig) {
            const savedId = response.id || response.data?.id;
            if (savedId) {
              this.intermediateForm.patchValue({ id: savedId });
              
              if (isForModal) {
                this.showRouteConfigPopup = true;
                this.showRouteConfigModal = false;
              } else {
                this.showRouteConfigPopup = true;
              }
            } else {
              console.error('❌ No ID returned from save API');
              this.toastService.showError('Error: No ID returned from save');
              this.pendingAction = null;
            }
          } else {
          this.toastService.showSuccess('Form saved successfully');
          this.showRouteConfigPopup = false;
          this.showRouteConfigModal = false;
          this.pendingAction = null;
          this.toggleView(); // Go back to table view
          }
        },
        error: (error) => {
          console.error('Save error:', error);
          this.toastService.showError('Error saving form');
        }
      });
    }
  }

  // Method to perform actual save draft
  private performSaveDraft(isForRouteConfig: boolean = false, isForModal: boolean = false): void {
    
    const formData = this.intermediateForm.value;
    
    // Prepare payload for API
    const payload: any = {
      ...(formData.id && formData.id !== '' ? { id: formData.id } : {}), // Only include ID if it exists and is not empty
      ship_id: parseInt(formData.ship_id) || 0, // Convert to number
      inspection_type: formData.inspectionType,
      dt_inspection: formData.inspectionDate, // Changed from inspection_date to dt_inspection
      auth_inspection: formData.inspectionAuthority, // Updated field name
      type_of_survey: formData.typeOfSurvey,
      pt_of_tanks: formData.pressureTestingTanks, // Updated field name
      pt_of_sea_tubes: formData.pressureTestingSeaTubes, // Updated field name
      ndt_undertaken: formData.ndtUndertaken,
      draft_status: 'draft', // Set to draft for save draft action
      
      // Observations array
      observations: [
        // Add Hull Survey Observations
        ...(formData.hullSurveyObservations || []).map((obs: any, index: number) => ({
          ...(obs.id && obs.id !== '' ? { id: obs.id } : {}),
          sr_no: index + 1,
          section: 'HULL_SURVEY',
          location: obs.location,
          frame_station_from: obs.from,
          frame_station_to: obs.to,
          observation: obs.observation,
          remarks: obs.remarks
        })),
        
        // Add Defect Rectification Observations
        ...(formData.defectRectificationObservations || []).map((obs: any, index: number) => ({
          ...(obs.id && obs.id !== '' ? { id: obs.id } : {}),
          sr_no: (formData.hullSurveyObservations?.length || 0) + index + 1,
          section: 'DEFECT_RECTIFICATION',
          location: obs.location,
          frame_station_from: obs.from,
          frame_station_to: obs.to,
          observation: obs.observation,
          remarks: obs.remarks
        })),
        
        // Add New Observations
        ...(formData.newObservations || []).map((obs: any, index: number) => ({
          ...(obs.id && obs.id !== '' ? { id: obs.id } : {}),
          sr_no: (formData.hullSurveyObservations?.length || 0) + (formData.defectRectificationObservations?.length || 0) + index + 1,
          section: 'NEW_OBSERVATIONS',
          location: obs.location,
          frame_station_from: obs.from,
          frame_station_to: obs.to,
          observation: obs.observation,
          remarks: obs.remarks
        }))
      ]
    };

    
    // Make API call to the intermediate form endpoint
    this.apiService.post('hitu/intermediate-underwater-hull-inspection-reports/', payload).subscribe({
      next: (response) => {
        
        if (isForRouteConfig) {
          const savedId = response.id || response.data?.id;
          if (savedId) {
            this.intermediateForm.patchValue({ id: savedId });
            
            if (isForModal) {
              this.showRouteConfigPopup = true;
              this.showRouteConfigModal = false;
            } else {
              this.showRouteConfigPopup = true;
            }
          } else {
            console.error('❌ No ID returned from save API');
            this.toastService.showError('Error: No ID returned from save');
            this.pendingAction = null;
          }
        } else {
        this.toastService.showSuccess('Draft saved successfully');
        this.showRouteConfigPopup = false;
        this.showRouteConfigModal = false;
        this.pendingAction = null;
        this.toggleView(); // Go back to table view
        }
      },
      error: (error) => {
        console.error('Draft save error:', error);
        this.toastService.showError('Error saving draft');
      }
    });
  }

  // Route configuration popup methods
  onConfigureRoute(): void {
    
    if (this.isAddMode && !this.intermediateForm.get('id')?.value) {
      if (this.pendingAction === 'save') {
        this.performSaveWithRouteConfigForModal();
      } else if (this.pendingAction === 'saveDraft') {
        this.performSaveDraftWithRouteConfigForModal();
      } else {
      }
    } else {
      // For edit mode or when form has ID, directly show the Add Route Config popup
    this.showRouteConfigPopup = false;
      this.showRouteConfigModal = false;
      // Trigger the route config popup component's onConfigureRoute method
      // This will be handled by the component itself when transactionId is available
    }
  }

  onSaveDirectly(): void {
    this.showRouteConfigPopup = false;
      if (this.pendingAction === 'save') {
      this.performSaveWithRouteConfig();
      } else if (this.pendingAction === 'saveDraft') {
      this.performSaveDraftWithRouteConfig();
    }
  }

  private performSaveWithRouteConfigForModal(): void {
    this.performSave(true, true);
  }

  private performSaveDraftWithRouteConfigForModal(): void {
    this.performSaveDraft(true, true);
  }

  private performSaveWithRouteConfig(): void {
    this.performSave(true);
  }

  private performSaveDraftWithRouteConfig(): void {
    this.performSaveDraft(true);
  }

  onCloseRouteConfigPopup() {
    this.showRouteConfigPopup = false;
  }

  onRefreshTimeline(): void {
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      }
    });
  }

  onRouteConfigSaved(event: any): void {
    
    // Check if this is a direct API response or data from the popup
    if (event.success !== undefined) {
      // This is a direct API response
      if (event.success) {
        this.handleSuccessfulRouteConfigSave(event);
      } else {
        console.error('Route config save failed:', event.error);
        this.handleRouteConfigError(event.error);
      }
    } else {
      // This is data from the popup component
      this.callRouteConfigApi(event);
    }
  }

  private callRouteConfigApi(routeConfigData: any): void {
    
    const payload = {
      transaction_id: this.intermediateForm.get('id')?.value,
      sub_module: 3, // Intermediate form submodule
      vessel: this.intermediateForm.get('inspectionType')?.value ? Number(this.intermediateForm.get('inspectionType')?.value) : 0,
      route_config: routeConfigData
    };
    
    
    this.apiService.post('config/route-configs/', payload).subscribe({
      next: (response) => {
        this.onRouteConfigSaved({ success: true, data: response });
      },
      error: (error) => {
        console.error('🚀 ADD ROUTE CONFIG POPUP - Route config API error:', error);
        this.onRouteConfigSaved({ success: false, error: error });
      }
    });
  }

  private handleSuccessfulRouteConfigSave(event: any): void {
    this.toastService.showSuccess('Route configuration saved successfully');
    this.showRouteConfigPopup = false;
    this.showRouteConfigModal = false;
    this.pendingAction = null;
    this.toggleView();
  }

  private handleRouteConfigError(error: any): void {
    console.error('🚀 ADD ROUTE CONFIG POPUP - Route config save error:', error);
    this.toastService.showError('Failed to save route configuration');
    this.showRouteConfigPopup = false;
    this.showRouteConfigModal = false;
    this.pendingAction = null;
  }

  onNextStep(event: any): void {
    
    // The existing Forward for Review popup will handle the API call
    // when user clicks Send for Review or Reject buttons
    // No immediate API call here - just show the popup
  }

  onTimelineToggle(event: boolean): void {
    // Handle timeline toggle logic
  }

  // Table view methods
  toggleView() {
    this.showTableView = !this.showTableView;
  }

  onAddNewForm() {
    this.showTableView = false;
    this.isAddMode = true; // Set to add mode
    
    // Reset popup states
    this.showRouteConfigPopup = false;
    this.showRouteConfigModal = false;
    this.pendingAction = null;
    
    // Reset form for new entry
    this.intermediateForm.reset();
  }

  onEditForm(formData: any) {
    
    // If form is empty (add mode), stay in the same component
    if (!formData || !formData.id) {
         this.showTableView = false;
      this.isAddMode = true;
      this.userInitiatedAction = false;
      this.showRouteConfigPopup = false;
      this.showRouteConfigModal = false;
      this.pendingAction = null;
      this.intermediateForm.reset();
      
      // Ensure ships are loaded for dropdown
      if (this.ships.length === 0) {
        this.loadShips();
      }
      return;
    }
    
    // If form has ID (edit mode), navigate to Commentor Sheet
 
    this.router.navigate(['/intermediate-commentor-sheet'], {
      queryParams: {
        mode: 'edit',
        id: formData.id,
        formData: JSON.stringify(formData)
      }
    });
  }

  onViewForm(formData: any) {
 
    // Navigate to Commentor Sheet with view mode and form data
    this.router.navigate(['/intermediate-commentor-sheet'], {
      queryParams: {
        mode: 'view',
        id: formData.id,
        formData: JSON.stringify(formData)
      }
    });
  }

  goBackToList(): void {

    // Navigate back to the main Intermediate Form page
    this.router.navigate(['/forms/hitu/intermediate-form']);
  }

  onDeleteForm(formData: any) {
    // Delete functionality is handled in the table component
  }

  onTabChanged(event: {tabId: string, draftStatus: string, apiUrl: string}): void {
    // Handle tab change - the table component will handle the API call
  }

  private loadFormData(formData: any) {
    // Load form data for editing - mapping API fields to form fields
    this.intermediateForm.patchValue({
      id: formData.id,
      ship_id: formData.ship?.id || formData.ship_id || formData.vessel_id || '', // Handle different API response structures
      inspectionType: formData.inspection_type || formData.inspectionType || '',
      inspectionDate: formData.dt_inspection || formData.inspection_date || formData.inspectionDate || '', // Updated field mapping
      inspectionAuthority: formData.auth_inspection || formData.inspection_authority || formData.inspectionAuthority || 'Intermediate Underwater Hull Inspection', // Default value if not found
      typeOfSurvey: formData.type_of_survey || formData.typeOfSurvey || '',
      pressureTestingTanks: formData.pt_of_tanks || formData.pressureTestingTanks || '', // Updated field mapping
      pressureTestingSeaTubes: formData.pt_of_sea_tubes || formData.pressureTestingSeaTubes || '', // Updated field mapping
      ndtUndertaken: formData.ndt_undertaken || formData.ndtUndertaken || ''
    });


    // Load arrays if they exist - handle observations array structure
    if (formData.observations && Array.isArray(formData.observations)) {
      
      // Separate observations by section
      const hullSurveyObs = formData.observations.filter((obs: any) => obs.section === 'HULL_SURVEY');
      const defectRectObs = formData.observations.filter((obs: any) => obs.section === 'DEFECT_RECTIFICATION');
      const newObs = formData.observations.filter((obs: any) => obs.section === 'NEW_OBSERVATIONS');
      
      // Load each section - always load even if empty to show the structure
      this.loadFormArray('hullSurveyObservations', hullSurveyObs);
      this.loadFormArray('defectRectificationObservations', defectRectObs);
      this.loadFormArray('newObservations', newObs);
      
      // Update row counts for dynamic tables
      this.updateHullSurveyRows(hullSurveyObs.length);
      this.updateDefectRectificationRows(defectRectObs.length);
      this.updateNewObservationsRows(newObs.length);
      
      
    } else {
      // Fallback to old structure if observations array doesn't exist
      if (formData.hull_survey_observations || formData.hullSurveyObservations) {
        this.loadFormArray('hullSurveyObservations', formData.hull_survey_observations || formData.hullSurveyObservations);
      }
      if (formData.defect_rectification_observations || formData.defectRectificationObservations) {
        this.loadFormArray('defectRectificationObservations', formData.defect_rectification_observations || formData.defectRectificationObservations);
      }
      if (formData.new_observations || formData.newObservations) {
        this.loadFormArray('newObservations', formData.new_observations || formData.newObservations);
      }
    }
    
  }

  private loadFormArray(arrayName: string, data: any[]) {
    
    const formArray = this.intermediateForm.get(arrayName) as FormArray;
    
    formArray.clear();
    
    
    if (data && data.length > 0) {
      
      data.forEach((item, index) => {
        
        let formGroup: FormGroup;
        switch (arrayName) {
          case 'hullSurveyObservations':
          case 'defectRectificationObservations':
          case 'newObservations':
            formGroup = this.createHullSurveyRow();
            
            const observationData = {
              id: item.id || '',
              location: item.location || '',
              from: item.frame_station_from || item.from || '',
              to: item.frame_station_to || item.to || '',
              observation: item.observation || '',
              remarks: item.remarks || ''
            };
            formGroup.patchValue(observationData);
            break;
            
          default:
           
            formGroup = this.fb.group({});
            formGroup.patchValue(item);
        }
        
     
        formArray.push(formGroup);
      
      });
    } else {
 
    }
    
    
  }

}
