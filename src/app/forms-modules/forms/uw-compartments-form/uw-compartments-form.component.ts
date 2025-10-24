import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DynamicTableComponent } from '../../shared/components/dynamic-table/dynamic-table.component';
import { UwCompartmentsFormTableComponent } from './uw-compartments-form-table.component';
import { RouteConfigComponent } from '../../../route-config/route-config.component';
import { RouteConfigPopupComponent } from '../../../shared/components/route-config-popup/route-config-popup.component';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { NgxPrintModule } from 'ngx-print';
import { QRCodeComponent } from 'angularx-qrcode';

interface Ship {
  id: number;
  name: string;
}

interface ShipApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Ship[];
}

interface TableColumn {
  key: string;
  label: string;
  required?: boolean;
  colSpan?: number;
  type?: 'text' | 'number' | 'email' | 'date' | 'select' | 'file';
}

@Component({
  selector: 'app-uw-compartments-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule, DynamicTableComponent, UwCompartmentsFormTableComponent, RouteConfigComponent, RouteConfigPopupComponent,NgxPrintModule,QRCodeComponent],
  templateUrl: './uw-compartments-form.component.html',
  styleUrls: ['./uw-compartments-form.component.css']
})
export class UwCompartmentsFormComponent implements OnInit {
  @Input() formOnlyMode: boolean = false; // Input to control if only form should be shown
  @Input() recordData: any = null; // Input for record data from Commentor Sheet
  @Input() mode: 'add' | 'edit' | 'view' = 'add'; // Input for mode
  @Input() record: any = null; // Input for record
  @Input() formData: any = {}; // Input for form data
  @Input() transactionId: string | number | undefined = undefined; // Input for transaction ID
  @Input() submodule: number = 1; // Input for submodule
  @Input() isViewMode: boolean = false; // Input for view mode
  uwCompartmentsForm: FormGroup;
  showTableView = true; // Set to true to show table by default
  ships: Ship[] = [];
  loading = false;
  isAddMode = false; // Track if we're in add mode
  showRouteConfigPopup = false; // Control route config popup visibility
  showRouteConfigModal = false; // Control full route config modal visibility
  pendingAction: 'save' | 'saveDraft' | null = null; // Track pending action
  userInitiatedAction = false; // Track if user initiated the action
  isLoadingFormData = false; // Track if we're currently loading form data

  // Column configurations for different table types
  inspectionColumns: TableColumn[] = [
    { key: 'srNo', label: 'Sr No.', colSpan: 1 },
    { key: 'tanksCompartment', label: 'Tanks/ Compartment*', required: true, colSpan: 3 },
    { key: 'observation', label: 'Observation*', required: true, colSpan: 3 },
    { key: 'recommendation', label: 'Recommendation*', required: true, colSpan: 3 },
    { key: 'remarks', label: 'Remarks*', required: true, colSpan: 2 }
  ];

  constructor(private fb: FormBuilder, private apiService: ApiService, private toastService: ToastService, private router: Router) {
    this.uwCompartmentsForm = this.createForm();
  }

  // Route Config Event Handlers
  onRouteConfigSaved(event: any): void {
     
    if (event.success) {
      // Handle successful save
      this.handleSuccessfulRouteConfigSave(event);
    } else {
      console.error('Route config save failed:', event.error);
      
      // Show error message
      console.error('Failed to save route configuration');
      
      // Handle error
      this.handleRouteConfigError(event.error);
    }
  }

  onNextStep(event: any): void {
    console.log('🚀 Forward for Review - Next step clicked:', event);
    
    // The existing Forward for Review popup will handle the API call
    // when user clicks Send for Review or Reject buttons
    // No immediate API call here - just show the popup
  }

  onTimelineToggle(isVisible: boolean): void {
    
    // Handle timeline visibility change
    this.saveTimelinePreference(isVisible);
  }

  private handleSuccessfulRouteConfigSave(event: any): void {
    // Handle successful route config save
    // You can update UI, refresh data, etc.
    
    // Example: Refresh timeline data
    if (event.data && event.data.timeline) {
      // Update timeline if returned in response
    }
    
    // Example: Update form status
    this.updateFormStatus('route_configured');
  }

  private handleRouteConfigError(error: any): void {
    // Handle route config error
    console.error('Route config error details:', error);
    
    // Example: Show detailed error message
    if (error.error && error.error.message) {
      console.error(`Error: ${error.error.message}`);
    }
  }

  private saveTimelinePreference(isVisible: boolean): void {
    // Save user preference for timeline visibility
    localStorage.setItem('timelineVisible', isVisible.toString());
  }

  private updateFormStatus(status: string): void {
    // Update form status in your form data
    // This is just an example
    }

  ngOnInit(): void {
    // Initialize with 0 rows (empty arrays)
    this.updateInspectionRows(0);
    
    // Load ships data
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
    this.apiService.get<any>('master/ship/').subscribe({
      next: (response) => {
        // Handle the actual API response structure
        this.ships = response.data || response.results || response;
        this.loading = false;
    },
      error: (error) => {
        console.error('Error loading ships:', error);
        this.loading = false;
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [''], // For editing existing records
      inspectionReport: ['', Validators.required],
      dateOfInspection: ['', Validators.required],
      inspectionObservations: this.fb.array([]),
      // Internal U/W Compartments
      totalUwCompartments: ['', Validators.required],
      offeredUwCompartments: ['', Validators.required],
      inspectedUwCompartments: ['', Validators.required],
      satUwCompartments: [''],
      unsatUwCompartments: ['', Validators.required],
      // Tanks
      totalTanks: ['', Validators.required],
      offeredTanks: ['', Validators.required],
      inspectedTanks: ['', Validators.required],
      satTanks: [''],
      unsatTanks: ['', Validators.required],
      satTanksFinal: [''],
      // Approval checkbox
      isApprover: [false]
    });
  }

  // FormArray getters
  get inspectionObservations(): FormArray {
    return this.uwCompartmentsForm.get('inspectionObservations') as FormArray;
  }

  // Row creation methods
  createInspectionRow(): FormGroup {
    return this.fb.group({
      id: [''], // For editing existing observation records
      tanksCompartment: ['', Validators.required],
      observation: ['', Validators.required],
      recommendation: ['', Validators.required],
      remarks: ['', Validators.required]
    });
  }

  // Row update methods
  updateInspectionRows(count: number): void {
    const currentCount = this.inspectionObservations.length;
    if (count > currentCount) {
      const rowsToAdd = Array.from({ length: count - currentCount }, () => this.createInspectionRow());
      rowsToAdd.forEach(row => this.inspectionObservations.push(row));
    } else if (count < currentCount) {
      const rowsToRemove = currentCount - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.inspectionObservations.removeAt(this.inspectionObservations.length - 1);
      }
    }
  }

  onFormSubmit(event: Event): void {
    console.log('🔍 onFormSubmit called - Event:', event);
    event.preventDefault();
    event.stopPropagation();
    
    // Only proceed if this is a user-initiated form submission
    if (this.userInitiatedAction) {
      this.onSubmit();
    } else {
      console.log('🔍 Form submit prevented - not user initiated');
    }
  }

  onSubmit(event?: Event): void {
    console.log('🔍 onSubmit called - Event:', event, 'Form valid:', this.uwCompartmentsForm.valid, 'isAddMode:', this.isAddMode);
    
    // In edit mode, save directly without showing popup
    if (!this.isAddMode) {
      console.log('🔍 Edit mode - saving directly without popup');
      if (this.uwCompartmentsForm.valid) {
        this.performSave();
      } else {
        this.markFormGroupTouched(this.uwCompartmentsForm);
      }
      return;
    }
    
    // Only show popup in add mode
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    this.userInitiatedAction = true;
    if (this.uwCompartmentsForm.valid) {
      this.pendingAction = 'save';
      this.showRouteConfigPopup = true;
      console.log('🔍 Add mode - showing confirmation popup first');
    } else {
      this.markFormGroupTouched(this.uwCompartmentsForm);
    }
  }

  onSaveDraft(event?: Event): void {
    console.log('🔍 onSaveDraft called', event, 'isAddMode:', this.isAddMode);
    
    // In edit mode, save draft directly without showing popup
    if (!this.isAddMode) {
      console.log('🔍 Edit mode - saving draft directly without popup');
      this.performSaveDraft();
      return;
    }
    
    // Only show popup in add mode
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    this.userInitiatedAction = true;
    this.pendingAction = 'saveDraft';
    this.showRouteConfigPopup = true;
    console.log('🔍 Add mode - showing confirmation popup first');
  }

  private performSave(isForRouteConfig: boolean = false, isForModal: boolean = false): void {
    console.log('🚀 ADD ROUTE CONFIG POPUP - performSave called');
    
    if (this.uwCompartmentsForm.valid) {
      const formData = this.uwCompartmentsForm.value;
      
      // Prepare payload for API
      const payload: any = {
        ...(formData.id && formData.id !== '' ? { id: formData.id } : {}), // Only include ID if it exists and is not empty
        ship_id: parseInt(formData.inspectionReport) || 0,
        dt_inspection: formData.dateOfInspection,
        auth_inspection: "Naval Inspector", // Default value
        docking_version: "v1", // Default value
        nature_of_docking: "Routine Check", // Default value
        
        // U/W Compartments fields
        total_uw_compartments: parseInt(formData.totalUwCompartments) || 0,
        no_of_uw_compartments_offered: parseInt(formData.offeredUwCompartments) || 0,
        no_of_uw_compartments_inspected: parseInt(formData.inspectedUwCompartments) || 0,
        toal_compartment_sat: parseInt(formData.satUwCompartments) || 0,
        total_compartment_unsat: parseInt(formData.unsatUwCompartments) || 0,
        
        // Tanks fields
        total_tanks: parseInt(formData.totalTanks) || 0,
        no_of_tanks_offered: parseInt(formData.offeredTanks) || 0,
        no_of_tanks_inspected: parseInt(formData.inspectedTanks) || 0,
        total_tanks_sat: parseInt(formData.satTanks) || 0,
        total_tanks_unsat: parseInt(formData.unsatTanks) || 0,
        total_tanks_sat_unmapped: parseInt(formData.satTanksFinal) || 0,
        
        draft_status: "save", // For final save
        
        dynamic_fields: {
          extra_notes: "No damages", // Default value
          condition: "better" // Default value
        },
        
        observations: (formData.inspectionObservations || []).map((obs: any, index: number) => ({
          ...(obs.id && obs.id !== '' ? { id: obs.id } : {}), // Only include ID if it exists and is not empty
          section: "UNDERWATER_CLEANING", // Default section
          sr_no: index + 1,
          observation: obs.observation || obs.tanksCompartment,
          remarks: obs.remarks || obs.recommendation,
          tanks_compartment: obs.tanksCompartment || '',
          recommendation: obs.recommendation || ''
        }))
      };
  // Make API call to the new endpoint
      this.apiService.post('hitu/uw-compartments-hull-inspection-reports/', payload).subscribe({
        next: (response) => {
          console.log('🚀 ADD ROUTE CONFIG POPUP - Form saved successfully, response:', response);
          
          if (isForRouteConfig) {
            const savedId = response.id || response.data?.id;
            if (savedId) {
              console.log('🔍 Got saved ID:', savedId, '- updating form');
              this.uwCompartmentsForm.patchValue({ id: savedId });
              
              if (isForModal) {
                console.log('🔍 For modal - showing route config popup (not the placeholder modal)');
                this.showRouteConfigPopup = true;
                this.showRouteConfigModal = false;
              } else {
                console.log('🔍 For popup - showing route config popup');
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
            this.toggleView();
          }
        },
        error: (error) => {
          console.error('Save error:', error);
          this.toastService.showError('Error saving form');
        }
      });
    }
  }

  private performSaveDraft(isForRouteConfig: boolean = false, isForModal: boolean = false): void {
    console.log('🚀 ADD ROUTE CONFIG POPUP - performSaveDraft called');
    const formData = this.uwCompartmentsForm.value;
    
    // Prepare payload for API
    const payload: any = {
      ...(formData.id && formData.id !== '' ? { id: formData.id } : {}), // Only include ID if it exists and is not empty
      ship_id: parseInt(formData.inspectionReport) || 0,
      dt_inspection: formData.dateOfInspection,
      auth_inspection: "Naval Inspector", // Default value
      docking_version: "v1", // Default value
      nature_of_docking: "Routine Check", // Default value
      
      // U/W Compartments fields
      total_uw_compartments: parseInt(formData.totalUwCompartments) || 0,
      no_of_uw_compartments_offered: parseInt(formData.offeredUwCompartments) || 0,
      no_of_uw_compartments_inspected: parseInt(formData.inspectedUwCompartments) || 0,
      toal_compartment_sat: parseInt(formData.satUwCompartments) || 0,
      total_compartment_unsat: parseInt(formData.unsatUwCompartments) || 0,
      
      // Tanks fields
      total_tanks: parseInt(formData.totalTanks) || 0,
      no_of_tanks_offered: parseInt(formData.offeredTanks) || 0,
      no_of_tanks_inspected: parseInt(formData.inspectedTanks) || 0,
      total_tanks_sat: parseInt(formData.satTanks) || 0,
      total_tanks_unsat: parseInt(formData.unsatTanks) || 0,
      total_tanks_sat_unmapped: parseInt(formData.satTanksFinal) || 0,
      
      draft_status: "draft", // For draft save
      
      dynamic_fields: {
        extra_notes: "No damages", // Default value
        condition: "better" // Default value
      },
      
      observations: (formData.inspectionObservations || []).map((obs: any, index: number) => ({
        ...(obs.id && obs.id !== '' ? { id: obs.id } : {}), // Only include ID if it exists and is not empty
        section: "UNDERWATER_CLEANING", // Default section
        sr_no: index + 1,
        observation: obs.observation || obs.tanksCompartment,
        remarks: obs.remarks || obs.recommendation,
        tanks_compartment: obs.tanksCompartment || '',
        recommendation: obs.recommendation || ''
      }))
    };

    // Make API call to the new endpoint
    this.apiService.post('hitu/uw-compartments-hull-inspection-reports/', payload).subscribe({
      next: (response) => {
        console.log('🚀 ADD ROUTE CONFIG POPUP - Draft saved successfully, response:', response);
        
        if (isForRouteConfig) {
          const savedId = response.id || response.data?.id;
          console.log('🚀 ADD ROUTE CONFIG POPUP - isForRouteConfig is true, savedId:', savedId);
          if (savedId) {
            console.log('🔍 Got saved ID:', savedId, '- updating form');
            this.uwCompartmentsForm.patchValue({ id: savedId });
            console.log('🔍 Form updated, new ID value:', this.uwCompartmentsForm.get('id')?.value);
            
            if (isForModal) {
              console.log('🔍 For modal - showing route config popup (not the placeholder modal)');
              console.log('🔍 Setting showRouteConfigPopup = true, showRouteConfigModal = false');
              this.showRouteConfigPopup = true;
              this.showRouteConfigModal = false;
              console.log('🔍 After setting - showRouteConfigPopup:', this.showRouteConfigPopup, 'showRouteConfigModal:', this.showRouteConfigModal);
            } else {
              console.log('🔍 For popup - showing route config popup');
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
          this.toggleView();
        }
      },
      error: (error) => {
        console.error('Draft save error:', error);
        this.toastService.showError('Error saving draft');
      }
    });
  }

  onClear(): void {
    this.uwCompartmentsForm.reset();
    // Reset all form arrays
    while (this.inspectionObservations.length !== 0) {
      this.inspectionObservations.removeAt(0);
    }
  }

  toggleView(): void {
    console.log('🔍 toggleView called - clearing form data');
    
    // If formOnlyMode is enabled, don't allow toggling to table view
    if (this.formOnlyMode) {
      console.log('🔍 FormOnlyMode enabled - preventing toggle to table view');
      return;
    }
    
    this.showTableView = !this.showTableView;
    
    // Clear form data when going back to table view
    if (this.showTableView) {
      this.clearFormData();
      this.isAddMode = false;
      this.userInitiatedAction = false;
      this.showRouteConfigPopup = false;
      this.pendingAction = null;
    }
  }

  onEditForm(form: any): void {
    console.log('🔍 onEditForm called - Form:', form);
    
    // If form is empty (add mode), stay in the same component
    if (!form || !form.id) {
      console.log('🔍 Add mode - staying in same component');
    this.showTableView = false;
      this.isAddMode = true;
      this.userInitiatedAction = false;
      this.showRouteConfigPopup = false;
      this.pendingAction = null;
    this.clearFormData();
    
    // Ensure ships are loaded for dropdown
    if (this.ships.length === 0) {
      this.loadShips();
      }
      return;
    }
    
    // If form has ID (edit mode), navigate to Commentor Sheet
    console.log('🔍 Edit mode - Navigating to Commentor Sheet');
    this.router.navigate(['/uw-compartments-commentor-sheet'], {
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
    this.router.navigate(['/uw-compartments-commentor-sheet'], {
      queryParams: {
        mode: 'view',
        id: form.id,
        formData: JSON.stringify(form)
      }
    });
  }

  goBackToList(): void {
    console.log('🔍 goBackToList called - Navigating back to main U/W Compartments page');
    // Navigate back to the main U/W Compartments page
    this.router.navigate(['/forms/hitu/uw-compartments-form']);
  }

  onDeleteForm(form: any): void {
 
    // Handle delete logic
  }

  onAddForm(): void {
    console.log('🔍 onAddForm called');
    this.showTableView = false;
    this.isAddMode = true; // Set to add mode
    this.userInitiatedAction = false; // Reset user initiated action flag
    this.showRouteConfigPopup = false; // Ensure popup is closed
    this.pendingAction = null; // Reset pending action
    
    // Clear form data to start fresh
    this.clearFormData();
    
    // Ensure ships are loaded for dropdown
    if (this.ships.length === 0) {
      this.loadShips();
    }
  }

  onTabChanged(event: {tabId: string, draftStatus: string, apiUrl: string}): void {
 
    // Handle tab change - the table component will handle the API call
  }

  // Route Config Popup Methods
  onConfigureRoute(): void {
    console.log('🚀 ADD ROUTE CONFIG POPUP - Parent onConfigureRoute called');
    console.log('🚀 ADD ROUTE CONFIG POPUP - Form ID:', this.uwCompartmentsForm.get('id')?.value);
    console.log('🚀 ADD ROUTE CONFIG POPUP - isAddMode:', this.isAddMode);
    console.log('🚀 ADD ROUTE CONFIG POPUP - pendingAction:', this.pendingAction);
    
    if (this.isAddMode && !this.uwCompartmentsForm.get('id')?.value) {
      console.log('🚀 ADD ROUTE CONFIG POPUP - Need to save form first');
      if (this.pendingAction === 'save') {
        console.log('🚀 ADD ROUTE CONFIG POPUP - Calling performSaveWithRouteConfigForModal');
        this.performSaveWithRouteConfigForModal();
      } else if (this.pendingAction === 'saveDraft') {
        console.log('🚀 ADD ROUTE CONFIG POPUP - Calling performSaveDraftWithRouteConfigForModal');
        this.performSaveDraftWithRouteConfigForModal();
      } else {
        console.log('🚀 ADD ROUTE CONFIG POPUP - No pending action found!');
      }
    } else {
      console.log('🚀 ADD ROUTE CONFIG POPUP - Showing route config popup directly');
      this.showRouteConfigPopup = true;
      this.showRouteConfigModal = false;
    }
  }

  private performSaveWithRouteConfigForModal(): void {
    console.log('🚀 ADD ROUTE CONFIG POPUP - Saving form first to get ID');
    this.performSave(true, true);
  }

  private performSaveDraftWithRouteConfigForModal(): void {
    console.log('🚀 ADD ROUTE CONFIG POPUP - Saving draft first to get ID');
    console.log('🚀 ADD ROUTE CONFIG POPUP - About to call performSaveDraft(true, true)');
    this.performSaveDraft(true, true);
  }

  onSaveDirectly(): void {
    this.showRouteConfigPopup = false;
    if (this.pendingAction === 'save') {
      this.performSave();
    } else if (this.pendingAction === 'saveDraft') {
      this.performSaveDraft();
    }
  }

  onCloseRouteConfigPopup(): void {
    this.showRouteConfigPopup = false;
    this.pendingAction = null;
  }

  onRefreshTimeline(): void {
    console.log('🔄 Refreshing timeline from U/W Compartments Form...');
    // The timeline refresh will be handled by the route config component
    // This method is here to handle the event from the popup
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

  private clearFormData(): void {
    console.log('🔍 clearFormData called - resetting form to initial state');
    
    // Reset form to initial values
    this.uwCompartmentsForm.patchValue({
      id: null,
      inspectionReport: '',
      dateOfInspection: '',
      totalUwCompartments: null,
      offeredUwCompartments: null,
      inspectedUwCompartments: null,
      satUwCompartments: null,
      unsatUwCompartments: null,
      totalTanks: null,
      offeredTanks: null,
      inspectedTanks: null,
      satTanks: null,
      unsatTanks: null,
      satTanksFinal: null
    });
    
    // Clear form arrays
    this.inspectionObservations.clear();
    
    // Reset form validation state
    this.uwCompartmentsForm.markAsUntouched();
    this.uwCompartmentsForm.markAsPristine();
  }

  private loadFormData(form: any): void {
    console.log('🔍 Loading form data:', form);
    console.log('🔍 toal_compartment_sat value:', form.toal_compartment_sat);
    console.log('🔍 total_compartment_sat value:', form.total_compartment_sat);
    
    // Load form data into the form - mapping API fields to form fields
    this.uwCompartmentsForm.patchValue({
      id: form.id,
      inspectionReport: form.ship?.id || form.ship_id || form.inspectionReport, // Map ship ID to inspectionReport field
      dateOfInspection: form.dt_inspection || form.dateOfInspection, // Map dt_inspection to dateOfInspection
      // Map the new API fields to form fields
      totalUwCompartments: form.no_of_dock_blocks_wedged || form.total_uw_compartments || form.totalUwCompartments,
      offeredUwCompartments: form.no_of_dock_blocks_crushed || form.no_of_uw_compartments_offered || form.offeredUwCompartments,
      inspectedUwCompartments: form.no_of_uw_compartments_inspected || form.inspectedUwCompartments,
      satUwCompartments: form.toal_compartment_sat || form.total_compartment_sat || form.satUwCompartments,
      unsatUwCompartments: form.total_compartment_unsat || form.unsatUwCompartments,
      totalTanks: form.total_tanks || form.totalTanks,
      offeredTanks: form.no_of_tanks_offered || form.offeredTanks,
      inspectedTanks: form.no_of_tanks_inspected || form.inspectedTanks,
      satTanks: form.total_tanks_sat || form.satTanks,
      unsatTanks: form.total_tanks_unsat || form.unsatTanks,
      satTanksFinal: form.total_tanks_sat_unmapped || form.satTanksFinal
    });
    
    console.log('🔍 Form patched with values:', this.uwCompartmentsForm.value);
    console.log('🔍 satUwCompartments field value:', this.uwCompartmentsForm.get('satUwCompartments')?.value);
    
    // Load form arrays
    this.loadFormArray('inspectionObservations', form.observations || form.inspectionObservations);
  }

  private loadFormArray(arrayName: string, data: any[]): void {
    const formArray = this.uwCompartmentsForm.get(arrayName) as FormArray;
    formArray.clear();
    
    console.log('🔍 Loading form array:', arrayName, 'with data:', data);
    
    if (data && data.length > 0) {
      data.forEach((item, index) => {
        let formGroup: FormGroup;
        switch (arrayName) {
          case 'inspectionObservations':
            formGroup = this.createInspectionRow();
            // Map API observation fields to form fields based on the actual API response structure
            formGroup.patchValue({
              id: item.id || item.code, // Use code as fallback for ID
              tanksCompartment: item.observation || item.tanksCompartment, // Map observation field
              observation: item.observation,
              recommendation: item.recommendation || '', // API doesn't have recommendation field
              remarks: item.remarks
            });
            console.log('🔍 Mapped observation item:', item, 'to form group:', formGroup.value);
            break;
          default:
            formGroup = this.fb.group({});
            formGroup.patchValue(item);
        }
        formArray.push(formGroup);
      });
    }
    
    console.log('🔍 Form array loaded with', formArray.length, 'items');
  }
  
  versionName=''
  onSaveVersion(){
    const printContainer = document.getElementById('printContainer');
    if (!printContainer) {
      this.toastService.showError('Print container not found');
      return;
    }

    const clonedContainer = printContainer.cloneNode(true) as HTMLElement;

    clonedContainer.querySelectorAll('input, textarea, select').forEach((el: any) => {
      if (el.type === 'checkbox' || el.type === 'radio') {
        // For checkboxes and radio buttons, set the checked attribute
        el.setAttribute('checked', el.checked);
      } else if (el.tagName === 'SELECT') {
        // For select elements, set the selected attribute on the correct option
        console.log('Select element found:', el.name || el.id, 'Current value:', el.value);
        el.setAttribute('value', el.value);
        // Remove selected from all options first
        el.querySelectorAll('option').forEach((option: any) => {
          option.removeAttribute('selected');
        });
        // Set selected on the option that matches the current value
        const selectedOption = el.querySelector(`option[value="${el.value}"]`);
        if (selectedOption) {
          selectedOption.setAttribute('selected', 'selected');
          console.log('Selected option set:', selectedOption.textContent);
        } else {
          console.log('No matching option found for value:', el.value);
        }
      } else {
        // For text inputs and textareas, set the value attribute
        el.setAttribute('value', el.value);
      }
    });

    const htmlData = clonedContainer.innerHTML;
    console.log('Captured HTML with values:', htmlData);

    const payload = {
      version: this.versionName,
      data: htmlData,
      sub_module: 1,
      draft_status: "save",
    }

    this.apiService.post('etma/version/', payload).subscribe({
      next: (response: any) => {
        console.log(response);
        this.toastService.showSuccess('Version saved successfully');
        this.showRouteConfigModal = false;
        this.versionName = '';
      },
      error: (error: any) => {
        console.log(error);
        this.toastService.showError('Failed to save version');
      }
    });
  }
}
