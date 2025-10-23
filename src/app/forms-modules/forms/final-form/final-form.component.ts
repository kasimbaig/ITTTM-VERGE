import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DynamicTableComponent } from '../../shared/components/dynamic-table/dynamic-table.component';
import { FinalFormTableComponent } from './final-form-table.component';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { RouteConfigComponent } from '../../../route-config/route-config.component';
import { RouteConfigPopupComponent, RouteConfigData } from '../../../shared/components/route-config-popup/route-config-popup.component';

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
  options?: { value: string; label: string }[];
}

@Component({
  selector: 'app-final-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicTableComponent, FinalFormTableComponent, RouteConfigComponent, RouteConfigPopupComponent],
  templateUrl: './final-form.component.html',
  styleUrls: ['./final-form.component.css']
})
export class FinalFormComponent implements OnInit {
  @Input() formOnlyMode: boolean = false; // Input to control if only form should be shown
  @Input() recordData: any = null; // Input for record data from Commentor Sheet
  @Input() mode: 'add' | 'edit' | 'view' = 'add'; // Input for mode
  @Input() record: any = null; // Input for record
  @Input() formData: any = {}; // Input for form data
  @Input() transactionId: string | number | undefined = undefined; // Input for transaction ID
  @Input() submodule: number = 1; // Input for submodule (Final form submodule)
  @Input() isViewMode: boolean = false; // Input for view mode
  finalForm: FormGroup;
  showTableView = true; // Set to true to show table by default
  ships: Ship[] = [];
  loading = false;
  
  // Route configuration popup properties
  showRouteConfigPopup = false;
  isAddMode = false; // Track if we're in add mode
  pendingAction: 'save' | 'saveDraft' | null = null; // Track which action triggered the popup
  userInitiatedAction = false; // Track if user initiated the action
  showRouteConfigModal = false; // Control route config modal visibility

  // Column configurations for different table types

  inspectorColumns: TableColumn[] = [
    { key: 'srNo', label: 'Sr No.', colSpan: 1 },
    { key: 'name', label: 'Name*', required: true, colSpan: 3 },
    { key: 'rank', label: 'Rank*', required: true, colSpan: 3 },
    { key: 'designation', label: 'Designation*', required: true, colSpan: 3 }
  ];

  defectsColumns: TableColumn[] = [
    { key: 'srNo', label: 'Sr No.', colSpan: 1 },
    { key: 'location', label: 'Location*', required: true, colSpan: 2 },
    { key: 'frame_station_from_id', label: 'From*', required: true, colSpan: 1 },
    { key: 'frame_station_to_id', label: 'To*', required: true, colSpan: 1 },
    { key: 'observation', label: 'Observation*', required: true, colSpan: 3 },
    { key: 'remarks', label: 'Final Remarks*', required: true, colSpan: 2 }
  ];

  simpleColumns: TableColumn[] = [
    { key: 'srNo', label: 'Sr No.', colSpan: 1 },
    { key: 'observation', label: 'Observation*', required: true, colSpan: 9 }
  ];

  fileUploadColumns: TableColumn[] = [
    { key: 'srNo', label: 'Sr No.', colSpan: 1 },
    { key: 'fileUpload', label: 'File Upload*', required: true, type: 'file', colSpan: 3 },
    { key: 'signature', label: 'Signature*', required: true, colSpan: 2 },
    { key: 'name', label: 'Name*', required: true, colSpan: 2 },
    { key: 'rank', label: 'Rank*', required: true, colSpan: 2 },
    { key: 'designation', label: 'Designation*', required: true, colSpan: 2 }
  ];

  constructor(private fb: FormBuilder, private apiService: ApiService, private toastService: ToastService, private router: Router, private cd: ChangeDetectorRef) {
    this.finalForm = this.createForm();
  }

  // Route Config Event Handlers
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
      transaction_id: this.finalForm.get('id')?.value,
      sub_module: 1, // Final form submodule
      vessel: this.finalForm.get('inspectionType')?.value ? Number(this.finalForm.get('inspectionType')?.value) : 0,
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

  onNextStep(event: any): void {
    
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

  ngOnInit(): void {
    // Initialize with 0 rows (empty arrays)
    this.updateInspectorRows(0);
    this.updateDefectsARows(0);
    this.updateDefectsBRows(0);
    this.updateDefectsCRows(0);
    this.updateDefectsIRows(0);
    this.updateDefectsIIRows(0);
    this.updateDefectsDRows(0);
    this.updateDefectsERows(0);
    this.updateFileUploadRows(0);
    
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
        console.log('🔍 RecordData available in ngOnInit:', this.recordData);
        if (this.ships.length === 0) {
          console.log('🔍 Ships not loaded yet, loading ships first...');
          this.loadShips();
        } else {
          console.log('🔍 Ships already loaded, loading form data...');
          this.loadFormData(this.recordData);
        }
        this.isAddMode = false; // Set to edit mode since we have data
      }
    }
  }

  loadShips() {
    console.log('🔍 Loading ships from API...');
    this.loading = true;
    this.apiService.get<any>('master/ship/').subscribe({
      next: (response) => {
        console.log('🔍 Ship API response:', response);
        // Handle the actual API response structure
        this.ships = response.data || response.results || response;
        this.loading = false;
        console.log('🔍 Ships loaded:', this.ships.length);
        console.log('🔍 First few ships:', this.ships.slice(0, 3).map(s => ({id: s.id, name: s.name})));
        
        // If we have recordData and ships are now loaded, retry loading form data
        if (this.recordData && this.ships.length > 0) {
          console.log('🔍 Ships loaded successfully, now loading form data...');
          // Use setTimeout to ensure the DOM is updated with the new options
          setTimeout(() => {
            this.loadFormData(this.recordData);
          }, 50);
        }
        
        // If we have a form with ship_id but ships weren't loaded before, 
        // the dropdown should now show the correct selection
        const currentShipId = this.finalForm.get('ship_id')?.value;
        if (currentShipId) {
          console.log('🔍 Form already has ship_id:', currentShipId);
        }
      },
      error: (error) => {
        console.error('🔍 Error loading ships:', error);
        this.loading = false;
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [''], // For editing existing records
      ship_id: ['', Validators.required],
      dt_inspection: ['', Validators.required],
      auth_inspection: ['', Validators.required],
      ship_not_cleaerd_for_undocking: [false],
      reoffer_date: [''],
      final_observation: [''],
      draft_status: ['draft'],
      inspectors: this.fb.array([]),
      defectsA: this.fb.array([]),
      defectsB: this.fb.array([]),
      defectsC: this.fb.array([]),
      defectsI: this.fb.array([]),
      defectsII: this.fb.array([]),
      defectsD: this.fb.array([]),
      defectsE: this.fb.array([]),
      fileUploads: this.fb.array([]),
      
      // Approval checkbox
      isApprover: [false]
    });
  }

  // FormArray getters
  get inspectors(): FormArray {
    return this.finalForm.get('inspectors') as FormArray;
  }

  get defectsA(): FormArray {
    return this.finalForm.get('defectsA') as FormArray;
  }

  get defectsB(): FormArray {
    return this.finalForm.get('defectsB') as FormArray;
  }

  get defectsC(): FormArray {
    return this.finalForm.get('defectsC') as FormArray;
  }

  get defectsI(): FormArray {
    return this.finalForm.get('defectsI') as FormArray;
  }

  get defectsII(): FormArray {
    return this.finalForm.get('defectsII') as FormArray;
  }

  get defectsD(): FormArray {
    return this.finalForm.get('defectsD') as FormArray;
  }

  get defectsE(): FormArray {
    return this.finalForm.get('defectsE') as FormArray;
  }

  get fileUploads(): FormArray {
    return this.finalForm.get('fileUploads') as FormArray;
  }

  // Row creation methods
  createInspectorRow(): FormGroup {
    return this.fb.group({
      id: [''], // For editing existing inspector records
      name: ['', Validators.required],
      rank: ['', Validators.required],
      designation: ['', Validators.required]
    });
  }

  createDefectsRow(): FormGroup {
    return this.fb.group({
      id: [''], // For editing existing observation records
      location: ['', Validators.required],
      frame_station_from_id: ['', Validators.required],
      frame_station_to_id: ['', Validators.required],
      observation: ['', Validators.required],
      remarks: ['', Validators.required]
    });
  }

  createSimpleRow(): FormGroup {
    return this.fb.group({
      id: [''], // For editing existing observation records
      observation: ['', Validators.required]
    });
  }

  createFileUploadRow(): FormGroup {
    return this.fb.group({
      fileUpload: ['', Validators.required],
      signature: ['', Validators.required],
      name: ['', Validators.required],
      rank: ['', Validators.required],
      designation: ['', Validators.required]
    });
  }

  // Row update methods
  updateInspectorRows(count: number): void {
    const currentCount = this.inspectors.length;
    if (count > currentCount) {
      const rowsToAdd = Array.from({ length: count - currentCount }, () => this.createInspectorRow());
      rowsToAdd.forEach(row => this.inspectors.push(row));
    } else if (count < currentCount) {
      const rowsToRemove = currentCount - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.inspectors.removeAt(this.inspectors.length - 1);
      }
    }
  }

  updateDefectsARows(count: number): void {
    const currentCount = this.defectsA.length;
    if (count > currentCount) {
      const rowsToAdd = Array.from({ length: count - currentCount }, () => this.createDefectsRow());
      rowsToAdd.forEach(row => this.defectsA.push(row));
    } else if (count < currentCount) {
      const rowsToRemove = currentCount - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.defectsA.removeAt(this.defectsA.length - 1);
      }
    }
  }

  updateDefectsBRows(count: number): void {
    const currentCount = this.defectsB.length;
    if (count > currentCount) {
      const rowsToAdd = Array.from({ length: count - currentCount }, () => this.createDefectsRow());
      rowsToAdd.forEach(row => this.defectsB.push(row));
    } else if (count < currentCount) {
      const rowsToRemove = currentCount - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.defectsB.removeAt(this.defectsB.length - 1);
      }
    }
  }

  updateDefectsCRows(count: number): void {
    const currentCount = this.defectsC.length;
    if (count > currentCount) {
      const rowsToAdd = Array.from({ length: count - currentCount }, () => this.createDefectsRow());
      rowsToAdd.forEach(row => this.defectsC.push(row));
    } else if (count < currentCount) {
      const rowsToRemove = currentCount - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.defectsC.removeAt(this.defectsC.length - 1);
      }
    }
  }

  updateDefectsIRows(count: number): void {
    const currentCount = this.defectsI.length;
    if (count > currentCount) {
      const rowsToAdd = Array.from({ length: count - currentCount }, () => this.createDefectsRow());
      rowsToAdd.forEach(row => this.defectsI.push(row));
    } else if (count < currentCount) {
      const rowsToRemove = currentCount - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.defectsI.removeAt(this.defectsI.length - 1);
      }
    }
  }

  updateDefectsIIRows(count: number): void {
    const currentCount = this.defectsII.length;
    if (count > currentCount) {
      const rowsToAdd = Array.from({ length: count - currentCount }, () => this.createDefectsRow());
      rowsToAdd.forEach(row => this.defectsII.push(row));
    } else if (count < currentCount) {
      const rowsToRemove = currentCount - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.defectsII.removeAt(this.defectsII.length - 1);
      }
    }
  }

  updateDefectsDRows(count: number): void {
    const currentCount = this.defectsD.length;
    if (count > currentCount) {
      const rowsToAdd = Array.from({ length: count - currentCount }, () => this.createSimpleRow());
      rowsToAdd.forEach(row => this.defectsD.push(row));
    } else if (count < currentCount) {
      const rowsToRemove = currentCount - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.defectsD.removeAt(this.defectsD.length - 1);
      }
    }
  }

  updateDefectsERows(count: number): void {
    const currentCount = this.defectsE.length;
    if (count > currentCount) {
      const rowsToAdd = Array.from({ length: count - currentCount }, () => this.createSimpleRow());
      rowsToAdd.forEach(row => this.defectsE.push(row));
    } else if (count < currentCount) {
      const rowsToRemove = currentCount - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.defectsE.removeAt(this.defectsE.length - 1);
      }
    }
  }

  updateFileUploadRows(count: number): void {
    const currentCount = this.fileUploads.length;
    if (count > currentCount) {
      const rowsToAdd = Array.from({ length: count - currentCount }, () => this.createFileUploadRow());
      rowsToAdd.forEach(row => this.fileUploads.push(row));
    } else if (count < currentCount) {
      const rowsToRemove = currentCount - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.fileUploads.removeAt(this.fileUploads.length - 1);
      }
    }
  }

  onSubmit(event?: Event): void {
    
    // In edit mode, save directly without showing popup
    if (!this.isAddMode) {

      if (this.finalForm.valid) {
        this.performSave();
      } else {
        this.markFormGroupTouched(this.finalForm);
      }
      return;
    }
    
    // Only show popup in add mode
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    
    // Always show route configuration popup for Save button (regardless of form validity)
    this.pendingAction = 'save';
    this.showRouteConfigPopup = true;
    
    // Log form validation errors for debugging
    if (!this.finalForm.valid) {
      Object.keys(this.finalForm.controls).forEach(key => {
        const control = this.finalForm.get(key);
        if (control && control.invalid) {
        }
      });
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
    
    if (this.finalForm.valid) {
      const formData = this.finalForm.value;
      
      // Prepare payload according to the React implementation
      const payload: any = {
        ...(formData.id && formData.id !== '' ? { id: formData.id } : {}), // Only include ID if it exists and is not empty
        ship_id: parseInt(formData.ship_id) || 0,
        dt_inspection: formData.dt_inspection,
        auth_inspection: formData.auth_inspection,
        ship_not_cleaerd_for_undocking: formData.ship_not_cleaerd_for_undocking,
        reoffer_date: formData.reoffer_date,
        final_observation: formData.final_observation,
        draft_status: 'save', // Set to save for save action
        observations: [
          // Include HITU's Inspectors as observations
          ...(formData.inspectors || []).map((inspector: any, index: number) => ({
            ...(inspector.id && inspector.id !== '' ? { id: inspector.id } : {}), // Only include ID if it exists and is not empty
            section: 'HITU_INSPECTORS',
            sr_no: index + 1,
            location: '',
            frame_station_from: 0,
            frame_station_to: 0,
            observation: '',
            remarks: `${inspector.name} - ${inspector.rank} - ${inspector.designation}`
          })),
          // Include Section (a) - DEFECTS_OBS_A
          ...formData.defectsA.map((obs: any, index: number) => ({
            ...(obs.id && obs.id !== '' ? { id: obs.id } : {}), // Only include ID if it exists and is not empty
            section: 'DEFECTS_OBS_A',
            sr_no: (formData.inspectors?.length || 0) + index + 1,
            location: obs.location,
            frame_station_from: parseInt(obs.frame_station_from_id) || 0,
            frame_station_to: parseInt(obs.frame_station_to_id) || 0,
            observation: obs.observation,
            remarks: obs.remarks
          })),
          // Include Section (b) - DEFECTS_OBS_B
          ...formData.defectsB.map((obs: any, index: number) => ({
            ...(obs.id && obs.id !== '' ? { id: obs.id } : {}), // Only include ID if it exists and is not empty
            section: 'DEFECTS_OBS_B',
            sr_no: (formData.inspectors?.length || 0) + (formData.defectsA?.length || 0) + index + 1,
            location: obs.location,
            frame_station_from: parseInt(obs.frame_station_from_id) || 0,
            frame_station_to: parseInt(obs.frame_station_to_id) || 0,
            observation: obs.observation,
            remarks: obs.remarks
          })),
          // Include Section (c) - DEFECTS_OBS_C
          ...formData.defectsC.map((obs: any, index: number) => ({
            ...(obs.id && obs.id !== '' ? { id: obs.id } : {}), // Only include ID if it exists and is not empty
            section: 'DEFECTS_OBS_C',
            sr_no: (formData.inspectors?.length || 0) + (formData.defectsA?.length || 0) + (formData.defectsB?.length || 0) + index + 1,
            location: obs.location,
            frame_station_from: parseInt(obs.frame_station_from_id) || 0,
            frame_station_to: parseInt(obs.frame_station_to_id) || 0,
            observation: obs.observation,
            remarks: obs.remarks
          })),
          // Include Section (i) - DEFECTS_OBS_I
          ...formData.defectsI.map((obs: any, index: number) => ({
            ...(obs.id && obs.id !== '' ? { id: obs.id } : {}), // Only include ID if it exists and is not empty
            section: 'DEFECTS_OBS_I',
            sr_no: (formData.inspectors?.length || 0) + (formData.defectsA?.length || 0) + (formData.defectsB?.length || 0) + (formData.defectsC?.length || 0) + index + 1,
            location: obs.location,
            frame_station_from: parseInt(obs.frame_station_from_id) || 0,
            frame_station_to: parseInt(obs.frame_station_to_id) || 0,
            observation: obs.observation,
            remarks: obs.remarks
          })),
          // Include Section (ii) - DEFECTS_OBS_II
          ...formData.defectsII.map((obs: any, index: number) => ({
            ...(obs.id && obs.id !== '' ? { id: obs.id } : {}), // Only include ID if it exists and is not empty
            section: 'DEFECTS_OBS_II',
            sr_no: (formData.inspectors?.length || 0) + (formData.defectsA?.length || 0) + (formData.defectsB?.length || 0) + (formData.defectsC?.length || 0) + (formData.defectsI?.length || 0) + index + 1,
            location: obs.location,
            frame_station_from: parseInt(obs.frame_station_from_id) || 0,
            frame_station_to: parseInt(obs.frame_station_to_id) || 0,
            observation: obs.observation,
            remarks: obs.remarks
          })),
          // Include Section (d) - REFIT_AUTHORITY_CONFIRMATION
          ...formData.defectsD.map((obs: any, index: number) => ({
            ...(obs.id && obs.id !== '' ? { id: obs.id } : {}), // Only include ID if it exists and is not empty
            section: 'REFIT_AUTHORITY_CONFIRMATION',
            sr_no: (formData.inspectors?.length || 0) + (formData.defectsA?.length || 0) + (formData.defectsB?.length || 0) + (formData.defectsC?.length || 0) + (formData.defectsI?.length || 0) + (formData.defectsII?.length || 0) + index + 1,
            location: '',
            frame_station_from: 0,
            frame_station_to: 0,
            observation: '',
            remarks: obs.observation
          })),
          // Include Section (e) - DEFECTS_OBS_E
          ...formData.defectsE.map((obs: any, index: number) => ({
            ...(obs.id && obs.id !== '' ? { id: obs.id } : {}), // Only include ID if it exists and is not empty
            section: 'DEFECTS_OBS_E',
            sr_no: (formData.inspectors?.length || 0) + (formData.defectsA?.length || 0) + (formData.defectsB?.length || 0) + (formData.defectsC?.length || 0) + (formData.defectsI?.length || 0) + (formData.defectsII?.length || 0) + (formData.defectsD?.length || 0) + index + 1,
            location: '',
            frame_station_from: 0,
            frame_station_to: 0,
            observation: obs.observation,
            remarks: ''
          }))
        ]
      };

   
      
      // Make API call to the new endpoint
      this.apiService.post('hitu/final-underwater-hull-inspection-reports/', payload).subscribe({
        next: (response) => {
          
          if (isForRouteConfig) {
            const savedId = response.id || response.data?.id;
            if (savedId) {
              this.finalForm.patchValue({ id: savedId });
              
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
        
            // Handle success (show success message, redirect, etc.)
          }
        },
        error: (error) => {
          console.error('Error submitting form:', error);
          // Handle error (show error message)
        }
      });
    } else {
     
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.finalForm);
    }
  }

  // Method to perform actual save draft
  private performSaveDraft(isForRouteConfig: boolean = false, isForModal: boolean = false): void {
     
    const formData = this.finalForm.value;
    
    // Prepare payload according to the React implementation
    const payload: any = {
      ...(formData.id && formData.id !== '' ? { id: formData.id } : {}), // Only include ID if it exists and is not empty
      ship_id: parseInt(formData.ship_id) || 0,
      dt_inspection: formData.dt_inspection,
      auth_inspection: formData.auth_inspection,
      ship_not_cleaerd_for_undocking: formData.ship_not_cleaerd_for_undocking,
      reoffer_date: formData.reoffer_date,
      final_observation: formData.final_observation,
      draft_status: 'draft', // Set to draft for save draft action
      observations: [
        // Include HITU's Inspectors as observations
        ...(formData.inspectors || []).map((inspector: any, index: number) => ({
          ...(inspector.id && inspector.id !== '' ? { id: inspector.id } : {}), // Only include ID if it exists and is not empty
          section: 'HITU_INSPECTORS',
          sr_no: index + 1,
          location: '',
          frame_station_from: 0,
          frame_station_to: 0,
          observation: '',
          remarks: `${inspector.name} - ${inspector.rank} - ${inspector.designation}`
        })),
        // Include Section (a) - DEFECTS_OBS_A
        ...formData.defectsA.map((obs: any, index: number) => ({
          ...(obs.id && obs.id !== '' ? { id: obs.id } : {}), // Only include ID if it exists and is not empty
          section: 'DEFECTS_OBS_A',
          sr_no: (formData.inspectors?.length || 0) + index + 1,
          location: obs.location,
          frame_station_from: parseInt(obs.frame_station_from_id) || 0,
          frame_station_to: parseInt(obs.frame_station_to_id) || 0,
          observation: obs.observation,
          remarks: obs.remarks
        })),
        // Include Section (b) - DEFECTS_OBS_B
        ...formData.defectsB.map((obs: any, index: number) => ({
          ...(obs.id && obs.id !== '' ? { id: obs.id } : {}), // Only include ID if it exists and is not empty
          section: 'DEFECTS_OBS_B',
          sr_no: (formData.inspectors?.length || 0) + (formData.defectsA?.length || 0) + index + 1,
          location: obs.location,
          frame_station_from: parseInt(obs.frame_station_from_id) || 0,
          frame_station_to: parseInt(obs.frame_station_to_id) || 0,
          observation: obs.observation,
          remarks: obs.remarks
        })),
        // Include Section (c) - DEFECTS_OBS_C
        ...formData.defectsC.map((obs: any, index: number) => ({
          ...(obs.id && obs.id !== '' ? { id: obs.id } : {}), // Only include ID if it exists and is not empty
          section: 'DEFECTS_OBS_C',
          sr_no: (formData.inspectors?.length || 0) + (formData.defectsA?.length || 0) + (formData.defectsB?.length || 0) + index + 1,
          location: obs.location,
          frame_station_from: parseInt(obs.frame_station_from_id) || 0,
          frame_station_to: parseInt(obs.frame_station_to_id) || 0,
          observation: obs.observation,
          remarks: obs.remarks
        })),
        // Include Section (i) - DEFECTS_OBS_I
        ...formData.defectsI.map((obs: any, index: number) => ({
          ...(obs.id && obs.id !== '' ? { id: obs.id } : {}), // Only include ID if it exists and is not empty
          section: 'DEFECTS_OBS_I',
          sr_no: (formData.inspectors?.length || 0) + (formData.defectsA?.length || 0) + (formData.defectsB?.length || 0) + (formData.defectsC?.length || 0) + index + 1,
          location: obs.location,
          frame_station_from: parseInt(obs.frame_station_from_id) || 0,
          frame_station_to: parseInt(obs.frame_station_to_id) || 0,
          observation: obs.observation,
          remarks: obs.remarks
        })),
        // Include Section (ii) - DEFECTS_OBS_II
        ...formData.defectsII.map((obs: any, index: number) => ({
          ...(obs.id && obs.id !== '' ? { id: obs.id } : {}), // Only include ID if it exists and is not empty
          section: 'DEFECTS_OBS_II',
          sr_no: (formData.inspectors?.length || 0) + (formData.defectsA?.length || 0) + (formData.defectsB?.length || 0) + (formData.defectsC?.length || 0) + (formData.defectsI?.length || 0) + index + 1,
          location: obs.location,
          frame_station_from: parseInt(obs.frame_station_from_id) || 0,
          frame_station_to: parseInt(obs.frame_station_to_id) || 0,
          observation: obs.observation,
          remarks: obs.remarks
        })),
        // Include Section (d) - REFIT_AUTHORITY_CONFIRMATION
        ...formData.defectsD.map((obs: any, index: number) => ({
          ...(obs.id && obs.id !== '' ? { id: obs.id } : {}), // Only include ID if it exists and is not empty
          section: 'REFIT_AUTHORITY_CONFIRMATION',
          sr_no: (formData.inspectors?.length || 0) + (formData.defectsA?.length || 0) + (formData.defectsB?.length || 0) + (formData.defectsC?.length || 0) + (formData.defectsI?.length || 0) + (formData.defectsII?.length || 0) + index + 1,
          location: '',
          frame_station_from: 0,
          frame_station_to: 0,
          observation: '',
          remarks: obs.observation
        })),
        // Include Section (e) - DEFECTS_OBS_E
        ...formData.defectsE.map((obs: any, index: number) => ({
          ...(obs.id && obs.id !== '' ? { id: obs.id } : {}), // Only include ID if it exists and is not empty
          section: 'DEFECTS_OBS_E',
          sr_no: (formData.inspectors?.length || 0) + (formData.defectsA?.length || 0) + (formData.defectsB?.length || 0) + (formData.defectsC?.length || 0) + (formData.defectsI?.length || 0) + (formData.defectsII?.length || 0) + (formData.defectsD?.length || 0) + index + 1,
          location: '',
          frame_station_from: 0,
          frame_station_to: 0,
          observation: obs.observation,
          remarks: ''
        }))
      ]
    };

    
    // Make API call to the new endpoint
    this.apiService.post('hitu/final-underwater-hull-inspection-reports/', payload).subscribe({
      next: (response) => {
        
        if (isForRouteConfig) {
          const savedId = response.id || response.data?.id;
          if (savedId) {
            this.finalForm.patchValue({ id: savedId });
            
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
          // Handle success (show success message, redirect, etc.)
        }
      },
      error: (error) => {
        console.error('Error saving form draft:', error);
        // Handle error (show error message)
      }
    });
  }

  // Route configuration popup methods
  onConfigureRoute(): void {
    
    if (this.isAddMode && !this.finalForm.get('id')?.value) {
      if (this.pendingAction === 'save') {
        this.performSaveWithRouteConfigForModal();
      } else if (this.pendingAction === 'saveDraft') {
        this.performSaveDraftWithRouteConfigForModal();
      } else {
      }
    } else {
      this.showRouteConfigPopup = true;
      this.showRouteConfigModal = false;
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

  onCloseRouteConfigPopup(): void {
    this.showRouteConfigPopup = false;
  }

  onRefreshTimeline(): void {
    // The timeline refresh will be handled by the route config component
    // This method is here to handle the event from the popup
  }

  onClear(): void {
    this.finalForm.reset();
    // Reset all form arrays
    while (this.inspectors.length !== 0) {
      this.inspectors.removeAt(0);
    }
    while (this.defectsA.length !== 0) {
      this.defectsA.removeAt(0);
    }
    while (this.defectsB.length !== 0) {
      this.defectsB.removeAt(0);
    }
    while (this.defectsC.length !== 0) {
      this.defectsC.removeAt(0);
    }
    while (this.defectsI.length !== 0) {
      this.defectsI.removeAt(0);
    }
    while (this.defectsII.length !== 0) {
      this.defectsII.removeAt(0);
    }
    while (this.defectsD.length !== 0) {
      this.defectsD.removeAt(0);
    }
    while (this.defectsE.length !== 0) {
      this.defectsE.removeAt(0);
    }
    while (this.fileUploads.length !== 0) {
      this.fileUploads.removeAt(0);
    }
  }

  toggleView(): void {
    this.showTableView = !this.showTableView;
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
      this.finalForm.reset();
      
      // Ensure ships are loaded for dropdown
      if (this.ships.length === 0) {
        this.loadShips();
      }
      return;
    }
    
    console.log('🔍 Edit mode - Navigating to Commentor Sheet');

    this.router.navigate(['/final-commentor-sheet'], {
      queryParams: {
        mode: 'edit',
        id: form.id,
        formData: JSON.stringify(form)
      }
    });
  }

  onViewForm(form: any): void {

    // Navigate to Commentor Sheet with view mode and form data
    this.router.navigate(['/final-commentor-sheet'], {
      queryParams: {
        mode: 'view',
        id: form.id,
        formData: JSON.stringify(form)
      }
    });
  }

  goBackToList(): void {
  
    // Navigate back to the main Final Form page
    this.router.navigate(['/forms/hitu/final-form']);
  }

  onDeleteForm(form: any): void {
    // Handle delete logic
  }

  onTabChanged(event: {tabId: string, draftStatus: string, apiUrl: string}): void {
    // The paginated table will automatically reload with the new API URL
  }

  onAddNewForm(): void {
    this.showTableView = false;
    this.isAddMode = true; // Set to add mode
    // Reset form for new entry
    this.finalForm.reset();
  }

  private loadFormData(form: any): void {
    console.log('🔍 loadFormData called with:', form);
    console.log('🔍 Ship object:', form.ship);
    console.log('🔍 Ship ID:', form.ship?.id);
    console.log('🔍 Ship name:', form.ship?.name);
    
    // Create mapped data object - using the actual field names from the data
    const mappedData = {
      id: form.id,
      ship_id: form.ship?.id || form.ship_id || form.vessel_id, // Handle nested ship object
      dt_inspection: form.dt_inspection,
      auth_inspection: form.auth_inspection,
      ship_not_cleaerd_for_undocking: form.ship_not_cleaerd_for_undocking,
      reoffer_date: form.reoffer_date,
      final_observation: form.final_observation,
      draft_status: form.draft_status
    };
    
    console.log('🔍 Mapped data:', mappedData);
    console.log('🔍 Ship ID being set:', mappedData.ship_id);
    console.log('🔍 Available ships in dropdown:', this.ships.map(s => ({id: s.id, name: s.name})));
    
    // Load form data into the form - mapping API fields to form fields
    console.log('🔍 Patching form with mapped data:', mappedData);
    this.finalForm.patchValue(mappedData);
    
    // Specifically set the ship_id field to ensure it's updated
    if (mappedData.ship_id) {
      console.log('🔍 Setting ship_id field specifically:', mappedData.ship_id);
      this.finalForm.get('ship_id')?.setValue(mappedData.ship_id);
    }
    
    // Check current form value after patching
    console.log('🔍 Form ship_id value after patch:', this.finalForm.get('ship_id')?.value);
    
    // Verify the ship exists in the dropdown
    console.log('🔍 Ships available:', this.ships.length);
    const selectedShip = this.ships.find(ship => ship.id === mappedData.ship_id);
    console.log('🔍 Selected ship found:', selectedShip);
    
    // If ship not found, log warning but don't retry (ships should be loaded by now)
    if (!selectedShip && mappedData.ship_id) {
      console.warn('🔍 Ship not found in dropdown! Ship ID:', mappedData.ship_id);
      console.warn('🔍 Available ships:', this.ships.map(s => ({id: s.id, name: s.name})));
    }
    
    // Force change detection to ensure UI updates
    console.log('🔍 Forcing change detection...');
    this.cd.markForCheck();
    
    // Additional debugging - check if the dropdown element exists and has the correct value
    setTimeout(() => {
      const dropdown = document.querySelector('select[formControlName="ship_id"]') as HTMLSelectElement;
      if (dropdown) {
        console.log('🔍 Dropdown element found:', dropdown);
        console.log('🔍 Dropdown value:', dropdown.value);
        console.log('🔍 Dropdown selectedIndex:', dropdown.selectedIndex);
        console.log('🔍 Dropdown options count:', dropdown.options.length);
        console.log('🔍 Selected option text:', dropdown.options[dropdown.selectedIndex]?.text);
        
        // If the dropdown value doesn't match, try to set it manually
        if (dropdown.value !== mappedData.ship_id?.toString()) {
          console.log('🔍 Dropdown value mismatch! Setting manually...');
          dropdown.value = mappedData.ship_id?.toString() || '';
          dropdown.dispatchEvent(new Event('change', { bubbles: true }));
          console.log('🔍 Dropdown value after manual set:', dropdown.value);
          
          // Also update the form control to match
          this.finalForm.get('ship_id')?.setValue(mappedData.ship_id);
          this.cd.markForCheck();
        }
      } else {
        console.warn('🔍 Dropdown element not found!');
      }
    }, 100);
    
    // Additional retry mechanism - if ships are not loaded yet, wait and retry
    if (this.ships.length === 0 && mappedData.ship_id) {
      console.log('🔍 Ships not loaded yet, retrying in 500ms...');
      setTimeout(() => {
        if (this.ships.length > 0) {
          console.log('🔍 Ships now loaded, retrying form data load...');
          this.loadFormData(form);
        }
      }, 500);
    }
    
    // Process observations data and map to appropriate form arrays
    if (form.observations && Array.isArray(form.observations)) {
      
      // Group observations by section
      const inspectors = form.observations.filter((obs: any) => obs.section === 'HITU_INSPECTORS');
      const defectsA = form.observations.filter((obs: any) => obs.section === 'DEFECTS_OBS_A');
      const defectsB = form.observations.filter((obs: any) => obs.section === 'DEFECTS_OBS_B');
      const defectsC = form.observations.filter((obs: any) => obs.section === 'DEFECTS_OBS_C');
      const defectsI = form.observations.filter((obs: any) => obs.section === 'DEFECTS_OBS_I');
      const defectsII = form.observations.filter((obs: any) => obs.section === 'DEFECTS_OBS_II');
      const defectsD = form.observations.filter((obs: any) => obs.section === 'REFIT_AUTHORITY_CONFIRMATION');
      const defectsE = form.observations.filter((obs: any) => obs.section === 'DEFECTS_OBS_E');
      
      
      // Convert HITU_INSPECTORS observations back to inspectors format
      const inspectorsData = inspectors.map((obs: any) => {
        const parts = obs.remarks.split(' - ');
        return {
          name: parts[0] || '',
          rank: parts[1] || '',
          designation: parts[2] || ''
        };
      });
      
      // Load each section into its respective form array
      this.loadFormArray('inspectors', inspectorsData);
      this.loadFormArray('defectsA', defectsA);
      this.loadFormArray('defectsB', defectsB);
      this.loadFormArray('defectsC', defectsC);
      this.loadFormArray('defectsI', defectsI);
      this.loadFormArray('defectsII', defectsII);
      this.loadFormArray('defectsD', defectsD);
      this.loadFormArray('defectsE', defectsE);
      
      // Update row count inputs to reflect loaded data
      this.updateRowCountInputs({
        defectsA: defectsA.length,
        defectsB: defectsB.length,
        defectsC: defectsC.length,
        defectsI: defectsI.length,
        defectsII: defectsII.length,
        defectsD: defectsD.length,
        defectsE: defectsE.length
      });
    } else {
      // Initialize empty arrays if no observations
      this.loadFormArray('inspectors', []);
      this.loadFormArray('defectsA', []);
      this.loadFormArray('defectsB', []);
      this.loadFormArray('defectsC', []);
      this.loadFormArray('defectsI', []);
      this.loadFormArray('defectsII', []);
      this.loadFormArray('defectsD', []);
      this.loadFormArray('defectsE', []);
      
      // Reset row count inputs
      this.updateRowCountInputs({
        defectsA: 0,
        defectsB: 0,
        defectsC: 0,
        defectsI: 0,
        defectsII: 0,
        defectsD: 0,
        defectsE: 0
      });
    }
    
    // Load other form arrays
    this.loadFormArray('fileUploads', form.fileUploads || []);
  }

  private loadFormArray(arrayName: string, data: any[]): void {
    const formArray = this.finalForm.get(arrayName) as FormArray;
    formArray.clear();
    
    if (!data || data.length === 0) {
      return;
    }
    
    data.forEach((item, index) => {
      let formGroup: FormGroup;
      switch (arrayName) {
        case 'inspectors':
          formGroup = this.createInspectorRow();
          break;
        case 'defectsA':
        case 'defectsB':
        case 'defectsC':
        case 'defectsI':
        case 'defectsII':
          formGroup = this.createDefectsRow();
          break;
        case 'defectsD':
        case 'defectsE':
          formGroup = this.createSimpleRow();
          break;
        case 'fileUploads':
          formGroup = this.createFileUploadRow();
          break;
        default:
          formGroup = this.fb.group({});
      }
      
      // Map API data to form structure
      const mappedData = this.mapApiDataToFormData(arrayName, item);
      
      formGroup.patchValue(mappedData);
      formArray.push(formGroup);
    });
    
  }

  private updateRowCountInputs(counts: {defectsA: number, defectsB: number, defectsC: number, defectsI: number, defectsII: number, defectsD: number, defectsE: number}): void {
    // This method will be called to update the row count input fields
    // The dynamic table component should handle updating the input field values
    // We'll trigger the row count change events to sync the UI
    this.updateDefectsARows(counts.defectsA);
    this.updateDefectsBRows(counts.defectsB);
    this.updateDefectsCRows(counts.defectsC);
    this.updateDefectsIRows(counts.defectsI);
    this.updateDefectsIIRows(counts.defectsII);
    this.updateDefectsDRows(counts.defectsD);
    this.updateDefectsERows(counts.defectsE);
  }

  private mapApiDataToFormData(arrayName: string, item: any): any {
    switch (arrayName) {
      case 'defectsA':
      case 'defectsB':
      case 'defectsC':
      case 'defectsI':
      case 'defectsII':
        return {
          id: item.id || undefined, // Preserve observation ID for updates
          location: item.location || '',
          frame_station_from_id: item.frame_station_from || '',
          frame_station_to_id: item.frame_station_to || '',
          observation: item.observation || '',
          remarks: item.remarks || ''
        };
      case 'defectsD':
      case 'defectsE':
        return {
          id: item.id || undefined, // Preserve observation ID for updates
          observation: item.observation || item.remarks || ''
        };
      case 'inspectors':
        return {
          id: item.id || undefined, // Preserve inspector ID for updates
          name: item.name || '',
          rank: item.rank || '',
          designation: item.designation || ''
        };
      case 'fileUploads':
        return {
          id: item.id || undefined, // Preserve file ID for updates
          fileName: item.fileName || '',
          filePath: item.filePath || ''
        };
      default:
        return item;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      }
    });
  }
}
