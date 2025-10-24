import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { RouteConfigComponent } from '../../../route-config/route-config.component';
import { RouteConfigPopupComponent } from '../../../shared/components/route-config-popup/route-config-popup.component';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { NgxPrintModule } from 'ngx-print';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-seg-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule,FormsModule, RouteConfigComponent, RouteConfigPopupComponent, NgxPrintModule, QRCodeComponent],
  templateUrl: './seg-form.component.html',
  styleUrls: ['./seg-form.component.css']
})
export class SegFormComponent implements OnInit, OnChanges {
  @Input() isEditMode: boolean = false;
  @Input() isViewMode: boolean = false;
  @Input() reportData: any = null;
  @Input() isFormOpen: boolean = false;
  @Input() formOnlyMode: boolean = false; // Input to control if only form should be shown
  @Input() mode: 'add' | 'edit' | 'view' = 'add'; // Input for mode
  @Input() record: any = null; // Input for record
  @Input() formData: any = {}; // Input for form data
  @Input() transactionId: string | number | undefined = undefined; // Input for transaction ID
  @Input() submodule: number = 6; // Input for submodule
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>();
  @Output() refreshData = new EventEmitter<void>();
  
  // Track which button was clicked
  private submissionType: 'draft' | 'submit' = 'submit';
  
  // Route Config Properties
  showRouteConfigPopup = false; // Control route config popup visibility
  showRouteConfigModal = false; // Control full route config modal visibility
  pendingAction: 'save' | 'saveDraft' | null = null; // Track pending action
  userInitiatedAction = false; // Track if user initiated the action
  isLoadingFormData = false; // Track if we're currently loading form data
  isAddMode = false; // Track if we're in add mode
  
  // Track form data for each step
  private step1Data: any = {};
  private step2Data: any = {};
  private step3Data: any = {};
  
  segForm!: FormGroup;
  ships: any[] = [];
  selectedShipId: number | null = null;
  isLoadingShips: boolean = false;
  systems: any[] = [];
  selectedSystemId: number | null = null;
  isLoadingSystems: boolean = false;
  
  // File upload properties
  defectFileName: string = '';
  segFileName: string = '';
  defectFilePreview: string = '';
  segFilePreview: string = '';
  defectFileObject: File | null = null;
  segFileObject: File | null = null;
  
  // ES Repair/Restoration file upload properties
  hashValueFileName: string = '';
  diskInfoFileName: string = '';
  hashValueStoredFileName: string = '';
  hashValueFilePreview: string = '';
  diskInfoFilePreview: string = '';
  hashValueStoredFilePreview: string = '';
  hashValueFileObject: File | null = null;
  diskInfoFileObject: File | null = null;
  hashValueStoredFileObject: File | null = null;
  
  // ES Extraction file upload properties (separate from ES Repair)
  esbHashValueFileName: string = '';
  esbDiskInfoFileName: string = '';
  esbHashValueStoredFileName: string = '';
  esbHashValueFilePreview: string = '';
  esbDiskInfoFilePreview: string = '';
  esbHashValueStoredFilePreview: string = '';
  esbHashValueFileObject: File | null = null;
  esbDiskInfoFileObject: File | null = null;
  esbHashValueStoredFileObject: File | null = null;
  
  // Track created Di/Dr ID for ES Repair section
  createdDiOrDrId: number | null = null;
  
  // Track created ES Repair ID for ES Extraction section
  createdESRepairId: number | null = null;
  
  // Form visibility states for sequential display - Updated for sequential form flow
  showDiDrForm: boolean = true;
  showESRepairForm: boolean = false;
  showESExtractionForm: boolean = false;
  
  // Multi-step form navigation properties
  currentStep: number = 1; // 1 = DI/DR, 2 = ES Repair, 3 = ES Extraction
  currentMode: 'edit' | 'view' = 'edit'; // Current mode for the active step
  totalSteps: number = 3;
  
  // Step completion tracking
  stepCompleted: { [key: number]: boolean } = {
    1: false, // DI/DR step
    2: false, // ES Repair step  
    3: false  // ES Extraction step
  };

  // Method to check if disk info is captured
  isDiskInfoCaptured(): boolean {
    return this.segForm.get('esr_disk_info_captured')?.value === 'Yes';
  }

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadShips();
    this.loadSystems();
    
    // Set add mode based on whether we have reportData or record
    this.isAddMode = !this.reportData?.id && !this.record?.id;
    
    // Initialize multi-step form
    this.initializeMultiStepForm();
    
    // Handle view mode - disable form controls
    if (this.isViewMode) {
      this.segForm.disable();
    }
  }

  private initializeMultiStepForm() {
    // Always start with step 1 for both edit and view modes
    this.currentStep = 1;
    
    // Set initial mode based on isViewMode input
    this.currentMode = this.isViewMode ? 'view' : 'edit';
    
    // Reset step completion tracking
    this.stepCompleted = {
      1: false,
      2: false,
      3: false
    };
    
    // Always show the first form initially
    this.showDiDrForm = true;
    this.showESRepairForm = false;
    this.showESExtractionForm = false;
    
    // Update form visibility
    this.updateFormVisibility();
    
    console.log('Multi-step form initialized:', {
      currentStep: this.currentStep,
      currentMode: this.currentMode,
      isViewMode: this.isViewMode,
      showDiDrForm: this.showDiDrForm,
      showESRepairForm: this.showESRepairForm,
      showESExtractionForm: this.showESExtractionForm
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges called with changes:', changes);
    console.log('Current reportData:', this.reportData);
    console.log('Current record:', this.record);
    console.log('Current segForm exists:', !!this.segForm);
    
    // Handle changes to reportData or record
    const hasReportDataChange = changes['reportData'] && this.reportData;
    const hasRecordChange = changes['record'] && this.record;
    
    if ((hasReportDataChange || hasRecordChange) && this.segForm) {
      console.log('Calling populateForm from ngOnChanges - direct path');
      this.populateForm();
    } else if (hasReportDataChange || hasRecordChange) {
      console.log('Calling populateForm from ngOnChanges - delayed path');
      // Try to populate after a short delay to ensure form is ready
      setTimeout(() => {
        console.log('Delayed populateForm - segForm exists:', !!this.segForm);
        if (this.segForm) {
          this.populateForm();
        }
      }, 100);
    }
    
    // Handle view mode changes
    if (changes['isViewMode'] && this.segForm) {
      this.currentMode = this.isViewMode ? 'view' : 'edit';
      this.updateFormVisibility();
      
      if (this.isViewMode) {
        this.segForm.disable();
      } else {
        this.segForm.enable();
      }
    }
  }

  private initializeForm() {
    this.segForm = this.fb.group({
      // Common Fields - Required for all steps
      ship: ['', Validators.required],
      sd_system: ['', Validators.required],
      sd_sub_system: ['', Validators.required],
      sd_sub_sub_system: ['', Validators.required],
      
      // Processing Element Details - Common
      ped_sr_no: [''],
      ped_make_or_oem_module: [''],
      ped_oem_part_no_motherboard_or_sbd: [''],
      ped_patt_no: [''],
      
      // Memory Media Details - Common
      mmd_media_type: [''],
      mmd_size: [''],
      mmd_interface: [''],
      mmd_scsi: [''],
      mmd_os: [''],
      
      // Application Details - Common
      mmd_ap_application_name: [''],
      mmd_ap_application_version: [''],
      
      // DI/DR Specific Fields (prefix: didr_)
      ds_file: [null],
      didr_ds_submitted_by: [''],
      didr_ds_status: ['Pending'],
      didr_ds_verified_by: [''],
      didr_ds_request_no: [''],
      didr_ess_repair_or_restoration_job_ref_no: [''],
      didr_ess_repair_or_restoration_job_assign_to: [''],
      didr_ess_repair_or_restoration_remarks: [''],
      didr_ess_repair_or_restoration_status: [''],
      didr_remarks_from_seg_file: [null],
      didr_remarks_from_seg_status: [''],
      didr_handed_over_to: [''],
      didr_ship_feedback: [''],
      
      // ES Repair Specific Fields (prefix: esr_)
      esr_ro_submitted_by: [''],
      esr_ro_status: ['Pending'],
      esr_ro_verified_by: [''],
      esr_ro_request_no: [''],
      esr_ess_repair_or_restoration_job_ref_no: [''],
      esr_ess_repair_or_restoration_job_assign_to: [''],
      esr_ess_repair_or_restoration_remarks: [''],
      esr_ess_repair_or_restoration_status: [''],
      esr_disk_info_captured: [''],
      esr_mmd_health_prediction: [''],
      esr_dc_tool_used: [''],
      esr_dc_clone_disk_name: [''],
      esr_dc_hash_value_file: [null],
      esr_dm_verification_of_partion_structre: [''],
      esr_dm_verification_of_file_system: [''],
      esr_boot_trial_remarks: [''],
      esr_rd_nomenclature_of_root_folder: [''],
      esr_rd_stored_in: [''],
      esr_rd_disk_info_file: [null],
      esr_rd_cloned_disk_or_image: [''],
      esr_rd_hash_value_stored_in_file: [null],
      esr_image_or_clone_restored_from: [''],
      esr_remarks_by_seg: [''],
      esr_handed_over_to: [''],
      esr_feedback_of_ss: [''],
      
      // ES Extraction Specific Fields (prefix: esb_)
      esb_ess_extraction_job_ref_no: [''],
      esb_ess_extraction_job_assign_to: [''],
      esb_ess_extraction_remarks: [''],
      esb_ess_extraction_status: [''],
      esb_disk_info_captured: [''],
      esb_mmd_health_prediction: [''],
      esb_dc_tool_used: [''],
      esb_dc_clone_disk_name: [''],
      esb_dc_hash_value_file: [null],
      esb_dm_verification_of_partion_structre: [''],
      esb_dm_verification_of_file_system: [''],
      esb_rd_nomenclature_of_root_folder: [''],
      esb_rd_stored_in: [''],
      esb_rd_disk_info_file: [null],
      esb_rd_cloned_disk_or_image: [''],
      esb_rd_hash_value_stored_in_file: [null],
      esb_status_of_job: [''],
      esb_handed_over_to: ['']
    });
  }

  private loadShips() {
    this.isLoadingShips = true;
    this.apiService.get('/master/ship/').subscribe({
      next: (response: any) => {
        if (response.status === 200 && response.data) {
          this.ships = response.data;
          console.log('Ships loaded:', this.ships);
          // After ships are loaded, try to auto-fill if we have data
          this.attemptAutoFillAfterDataLoad();
          // Also try to populate form if we have reportData/record
          this.attemptFormPopulationAfterDataLoad();
        } else {
          this.toastService.showError('Failed to load ships');
        }
        this.isLoadingShips = false;
      },
      error: (error) => {
        this.toastService.showError('Error loading ships');
        this.isLoadingShips = false;
      }
    });
  }

  private loadSystems() {
    this.isLoadingSystems = true;
    this.apiService.get('master/systems/').subscribe({
      next: (response: any) => {
        if (response.status === 200 && response.data) {
          this.systems = response.data;
          console.log('Systems loaded:', this.systems);
          // After systems are loaded, try to auto-fill if we have data
          this.attemptAutoFillAfterDataLoad();
          // Also try to populate form if we have reportData/record
          this.attemptFormPopulationAfterDataLoad();
        } else {
          this.toastService.showError('Failed to load systems');
        }
        this.isLoadingSystems = false;
      },
      error: (error) => {
        this.toastService.showError('Error loading systems');
        this.isLoadingSystems = false;
      }
    });
  }

  private attemptAutoFillAfterDataLoad() {
    // Only attempt auto-fill if we're not on step 1 and we have previous step data
    if (this.currentStep > 1 && (this.step1Data || this.step2Data)) {
      console.log('Attempting auto-fill after data load for step:', this.currentStep);
      this.populateFormFromPreviousStep();
    }
  }

  private attemptFormPopulationAfterDataLoad() {
    // Try to populate form if we have reportData or record and both ships and systems are loaded
    if ((this.reportData || this.record) && this.segForm && this.ships.length > 0 && this.systems.length > 0) {
      console.log('Attempting form population after data load');
      this.populateForm();
    }
  }

  onShipChange(event: any) {
    const selectedShipId = event.target.value;
    this.selectedShipId = selectedShipId ? parseInt(selectedShipId) : null;
    // Also update the form control value
    this.segForm.patchValue({ ship: this.selectedShipId });
    console.log('Ship changed to:', this.selectedShipId);
  }

  onSystemChange(event: any) {
    const selectedSystemId = event.target.value;
    this.selectedSystemId = selectedSystemId ? parseInt(selectedSystemId) : null;
    // Also update the form control value
    this.segForm.patchValue({ sd_system: this.selectedSystemId });
    console.log('System changed to:', this.selectedSystemId);
  }

  getSelectedShipName(): string {
    if (this.selectedShipId && this.ships.length > 0) {
      const selectedShip = this.ships.find(ship => ship.id === parseInt(this.selectedShipId!.toString()));
      return selectedShip ? selectedShip.name : '';
    }
    return '';
  }

  getSelectedSystemName(): string {
    if (this.selectedSystemId && this.systems.length > 0) {
      const selectedSystem = this.systems.find(system => system.id === parseInt(this.selectedSystemId!.toString()));
      return selectedSystem ? selectedSystem.name : '';
    }
    return '';
  }

  // Handle Save Draft button click
  onSaveDraft() {
    this.submissionType = 'draft';
    
    // In edit mode, save draft directly without showing popup
    if (this.isEditMode) {
      this.submitDraft();
      return;
    }
    
    // Only show popup in add mode
    this.userInitiatedAction = true;
    this.pendingAction = 'saveDraft';
    this.showRouteConfigPopup = true;
  }

  // Handle Submit Report button click (only available on Step 3)
  onSubmitReport() {
    this.submissionType = 'submit';
    
    // In edit mode, save directly without showing popup
    if (this.isEditMode) {
      this.submitFinalForm();
      return;
    }
    
    // Only show popup in add mode
    this.userInitiatedAction = true;
    this.pendingAction = 'save';
    this.showRouteConfigPopup = true;
  }

  // Submit draft for current step
  private submitDraft() {
    // Store current step data
    this.storeCurrentStepData();
    
    // Create FormData for file uploads
    const formDataToSend = new FormData();
    
    // Add action and type with validation
    const action = this.isEditMode ? 'update' : 'create';
    
    // Validation: For draft_status, only allow 'draft' status
    formDataToSend.append('action', action);
    formDataToSend.append('draft_status', 'draft');
    
    // Add record ID for update operations
    if (this.isEditMode && this.reportData) {
      const recordId = this.reportData.id || this.reportData.di_or_dr_id || this.reportData.di_or_dr_data?.id;
      if (recordId) {
        formDataToSend.append('id', recordId.toString());
      }
    }
    
    // Add all form data with proper prefixes
    this.addFormDataToPayload(formDataToSend);
    
    console.log('Submitting Draft FormData for step:', this.currentStep);
    
    // Make API call with FormData
    this.apiService.postFormData('seg/segform/', formDataToSend).subscribe({
      next: (response: any) => {
        console.log('Draft API Response:', response);
        if (response.data && response.data.id) {
          this.toastService.showSuccess('Draft saved successfully');
          
          // Mark current step as completed
          this.stepCompleted[this.currentStep] = true;
          
          // Emit refresh data event to refresh parent component
          this.refreshData.emit();
          
          // Close the form after successful draft submission
          this.onCancel();
        } else {
          this.toastService.showError('Failed to save draft');
        }
      },
      error: (error) => {
        this.toastService.showError('Error saving draft');
        console.error('Draft API Error:', error);
      }
    });
  }

  // Submit final form with all data (only from Step 3)
  private submitFinalForm() {
    if (this.currentStep !== 3) {
      this.toastService.showError('Submit is only available on the final step');
      return;
    }
    
    // Store current step data
    this.storeCurrentStepData();
    
    // Create FormData for file uploads
    const formDataToSend = new FormData();
    
    // Add action and type with validation
    const action = this.isEditMode ? 'update' : 'create';
    
    // Validation: For action 'create', only allow 'pass' status
    if (action === 'create') {
      formDataToSend.append('action', action);
      formDataToSend.append('draft_status', 'pass');
    } else {
      formDataToSend.append('action', action);
      formDataToSend.append('draft_status', 'draft');
    }
    
    // Add record ID for update operations
    if (this.isEditMode && this.reportData) {
      const recordId = this.reportData.id || this.reportData.di_or_dr_id || this.reportData.di_or_dr_data?.id;
      if (recordId) {
        formDataToSend.append('id', recordId.toString());
      }
    }
    
    // Add all form data with proper prefixes
    this.addFormDataToPayload(formDataToSend);
    
    console.log('Submitting Final FormData with all steps');
    
    // Make API call with FormData
    this.apiService.postFormData('seg/segform/', formDataToSend).subscribe({
      next: (response: any) => {
        console.log('Final API Response:', response);
        if (response.data && response.data.id) {
          this.toastService.showSuccess('Form submitted successfully');
          
          // Mark all steps as completed
          this.stepCompleted[1] = true;
          this.stepCompleted[2] = true;
          this.stepCompleted[3] = true;
          
          // Emit the updated data to refresh parent component
          this.formSubmit.emit(response.data);
          
          // Emit refresh data event to refresh parent component
          this.refreshData.emit();
          
          // Close the form after successful submission
          this.onCancel();
        } else {
          this.toastService.showError('Failed to submit form');
        }
      },
      error: (error) => {
        this.toastService.showError('Error submitting form');
        console.error('Final API Error:', error);
      }
    });
  }

  // Add form data to payload with proper prefixes
  private addFormDataToPayload(formDataToSend: FormData) {
    const formData = this.segForm.value;

    // Add form status - set to "Submitted" when submitting from third form
    if (this.currentStep === 3 && this.submissionType === 'submit') {
      formDataToSend.append('draft_status', 'Submitted');
    }

    // Add common fields
    formDataToSend.append('ship', this.selectedShipId ? this.selectedShipId.toString() : '');
    formDataToSend.append('sd_system', this.selectedSystemId ? this.selectedSystemId.toString() : '');
    formDataToSend.append('sd_sub_system', formData.sd_sub_system || '');
    formDataToSend.append('sd_sub_sub_system', formData.sd_sub_sub_system || '');
    formDataToSend.append('ped_sr_no', formData.ped_sr_no || '');
    formDataToSend.append('ped_make_or_oem_module', formData.ped_make_or_oem_module || '');
    formDataToSend.append('ped_oem_part_no_motherboard_or_sbd', formData.ped_oem_part_no_motherboard_or_sbd || '');
    formDataToSend.append('ped_patt_no', formData.ped_patt_no || '');
    formDataToSend.append('mmd_media_type', formData.mmd_media_type || '');
    formDataToSend.append('mmd_size', formData.mmd_size || '');
    formDataToSend.append('mmd_interface', formData.mmd_interface || '');
    formDataToSend.append('mmd_scsi', formData.mmd_scsi || '');
    formDataToSend.append('mmd_os', formData.mmd_os || '');
    formDataToSend.append('mmd_ap_application_name', formData.mmd_ap_application_name || '');
    formDataToSend.append('mmd_ap_application_version', formData.mmd_ap_application_version || '');
    
    // Add DI/DR specific fields
    formDataToSend.append('didr_ds_submitted_by', formData.didr_ds_submitted_by || '');
    formDataToSend.append('didr_ds_status', formData.didr_ds_status || 'Pending');
    formDataToSend.append('didr_ds_verified_by', formData.didr_ds_verified_by || '');
    formDataToSend.append('didr_ds_request_no', formData.didr_ds_request_no || '');
    formDataToSend.append('didr_ess_repair_or_restoration_job_ref_no', formData.didr_ess_repair_or_restoration_job_ref_no || '');
    formDataToSend.append('didr_ess_repair_or_restoration_job_assign_to', formData.didr_ess_repair_or_restoration_job_assign_to || '');
    formDataToSend.append('didr_ess_repair_or_restoration_remarks', formData.didr_ess_repair_or_restoration_remarks || '');
    formDataToSend.append('didr_ess_repair_or_restoration_status', formData.didr_ess_repair_or_restoration_status || '');
    formDataToSend.append('didr_remarks_from_seg_status', formData.didr_remarks_from_seg_status || '');
    formDataToSend.append('didr_handed_over_to', formData.didr_handed_over_to || '');
    formDataToSend.append('didr_ship_feedback', formData.didr_ship_feedback || '');
    
    // Add ES Repair specific fields (only fields present in the second form HTML)
    formDataToSend.append('esr_ro_submitted_by', formData.esr_ro_submitted_by || '');
    formDataToSend.append('esr_ro_status', formData.esr_ro_status || 'Pending');
    formDataToSend.append('esr_ro_verified_by', formData.esr_ro_verified_by || '');
    formDataToSend.append('esr_ro_request_no', formData.esr_ro_request_no || '');
    formDataToSend.append('esr_ess_repair_or_restoration_job_ref_no', formData.esr_ess_repair_or_restoration_job_ref_no || '');
    formDataToSend.append('esr_ess_repair_or_restoration_job_assign_to', formData.esr_ess_repair_or_restoration_job_assign_to || '');
    formDataToSend.append('esr_ess_repair_or_restoration_remarks', formData.esr_ess_repair_or_restoration_remarks || '');
    formDataToSend.append('esr_ess_repair_or_restoration_status', formData.esr_ess_repair_or_restoration_status || '');
    formDataToSend.append('esr_disk_info_captured', formData.esr_disk_info_captured || '');
    formDataToSend.append('esr_mmd_health_prediction', formData.esr_mmd_health_prediction || '');
    formDataToSend.append('esr_dc_tool_used', formData.esr_dc_tool_used || '');
    formDataToSend.append('esr_dc_clone_disk_name', formData.esr_dc_clone_disk_name || '');
    formDataToSend.append('esr_dm_verification_of_partion_structre', formData.esr_dm_verification_of_partion_structre || '');
    formDataToSend.append('esr_dm_verification_of_file_system', formData.esr_dm_verification_of_file_system || '');
    formDataToSend.append('esr_boot_trial_remarks', formData.esr_boot_trial_remarks || '');
    formDataToSend.append('esr_rd_nomenclature_of_root_folder', formData.esr_rd_nomenclature_of_root_folder || '');
    formDataToSend.append('esr_rd_stored_in', formData.esr_rd_stored_in || '');
    formDataToSend.append('esr_rd_cloned_disk_or_image', formData.esr_rd_cloned_disk_or_image || '');
    formDataToSend.append('esr_image_or_clone_restored_from', formData.esr_image_or_clone_restored_from || '');
    formDataToSend.append('esr_remarks_by_seg', formData.esr_remarks_by_seg || '');
    formDataToSend.append('esr_handed_over_to', formData.esr_handed_over_to || '');
    formDataToSend.append('esr_feedback_of_ss', formData.esr_feedback_of_ss || '');
    
    // Add ES Extraction specific fields (only fields present in the third form HTML)
    formDataToSend.append('esb_ess_extraction_job_ref_no', formData.esb_ess_extraction_job_ref_no || '');
    formDataToSend.append('esb_ess_extraction_job_assign_to', formData.esb_ess_extraction_job_assign_to || '');
    formDataToSend.append('esb_ess_extraction_remarks', formData.esb_ess_extraction_remarks || '');
    formDataToSend.append('esb_ess_extraction_status', formData.esb_ess_extraction_status || '');
    formDataToSend.append('esb_disk_info_captured', formData.esb_disk_info_captured || '');
    formDataToSend.append('esb_mmd_health_prediction', formData.esb_mmd_health_prediction || '');
    formDataToSend.append('esb_dc_tool_used', formData.esb_dc_tool_used || '');
    formDataToSend.append('esb_dc_clone_disk_name', formData.esb_dc_clone_disk_name || '');
    formDataToSend.append('esb_dm_verification_of_partion_structre', formData.esb_dm_verification_of_partion_structre || '');
    formDataToSend.append('esb_dm_verification_of_file_system', formData.esb_dm_verification_of_file_system || '');
    formDataToSend.append('esb_rd_nomenclature_of_root_folder', formData.esb_rd_nomenclature_of_root_folder || '');
    formDataToSend.append('esb_rd_stored_in', formData.esb_rd_stored_in || '');
    formDataToSend.append('esb_rd_cloned_disk_or_image', formData.esb_rd_cloned_disk_or_image || '');
    formDataToSend.append('esb_status_of_job', formData.esb_status_of_job || '');
    formDataToSend.append('esb_handed_over_to', formData.esb_handed_over_to || '');
    
    // Add files if they exist
    if (this.defectFileObject) {
      formDataToSend.append('ds_file', this.defectFileObject);
    }
    if (this.segFileObject) {
      formDataToSend.append('didr_remarks_from_seg_file', this.segFileObject);
    }
    if (this.hashValueFileObject) {
      formDataToSend.append('esr_dc_hash_value_file', this.hashValueFileObject);
    }
    if (this.diskInfoFileObject) {
      formDataToSend.append('esr_rd_disk_info_file', this.diskInfoFileObject);
    }
    if (this.hashValueStoredFileObject) {
      formDataToSend.append('esr_rd_hash_value_stored_in_file', this.hashValueStoredFileObject);
    }
    
    // Add ES Extraction files if they exist (separate from ES Repair files)
    if (this.esbHashValueFileObject) {
      formDataToSend.append('esb_dc_hash_value_file', this.esbHashValueFileObject);
    }
    if (this.esbDiskInfoFileObject) {
      formDataToSend.append('esb_rd_disk_info_file', this.esbDiskInfoFileObject);
    }
    if (this.esbHashValueStoredFileObject) {
      formDataToSend.append('esb_rd_hash_value_stored_in_file', this.esbHashValueStoredFileObject);
    }
  }

  // Multi-step navigation methods
  nextStep() {
    if (this.currentStep < this.totalSteps) {
      // Validate current step before proceeding
      if (!this.canProceedToNext()) {
        this.markFormGroupTouched();
        this.toastService.showError('Please fill in all required fields before proceeding to next step');
        return;
      }
      
      // Store current step data
      this.storeCurrentStepData();
      
      // Mark current step as completed
      this.stepCompleted[this.currentStep] = true;
      
      // Move to next step
      this.currentStep++;
      this.currentMode = 'edit'; // Start next step in edit mode
      
      // Update form visibility
      this.updateFormVisibility();
      
      // Populate form with data from previous step
      // Use setTimeout to ensure the form is ready and data is loaded
      setTimeout(() => {
        this.populateFormFromPreviousStep();
      }, 100);
      
      console.log(`Moved to step ${this.currentStep} in ${this.currentMode} mode`);
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      // Move to previous step
      this.currentStep--;
      this.currentMode = 'view'; // Show previous step in view mode
      
      // Update form visibility
      this.updateFormVisibility();
      
      // Populate form with data from stored step data
      // Use setTimeout to ensure the form is ready
      setTimeout(() => {
        this.populateFormFromStoredStepData();
      }, 100);
      
      console.log(`Moved to step ${this.currentStep} in ${this.currentMode} mode`);
    }
  }

  private updateFormVisibility() {
    // Reset all form visibility
    this.showDiDrForm = false;
    this.showESRepairForm = false;
    this.showESExtractionForm = false;
    
    // Show the appropriate form based on current step
    switch (this.currentStep) {
      case 1:
        this.showDiDrForm = true;
        break;
      case 2:
        this.showESRepairForm = true;
        break;
      case 3:
        this.showESExtractionForm = true;
        break;
    }
    
    // Enable/disable form based on current mode
    if (this.currentMode === 'view') {
      this.segForm.disable();
    } else {
      this.segForm.enable();
    }
  }

  // Check if current step can proceed to next step
  canProceedToNext(): boolean {
    // In view mode, always allow navigation
    if (this.currentMode === 'view') {
      return true;
    }
    
    // For step 1 (DI/DR), check if basic required fields are filled
    if (this.currentStep === 1) {
      const formData = this.segForm.value;
      return !!(formData.ship && formData.sd_system && formData.sd_sub_system && formData.sd_sub_sub_system);
    }
    
    // For step 2 (ES Repair), check if step 1 was completed
    if (this.currentStep === 2) {
      return this.stepCompleted[1];
    }
    
    // For step 3 (ES Extraction), check if step 2 was completed
    if (this.currentStep === 3) {
      return this.stepCompleted[2];
    }
    
    return false;
  }

  // Store current step data
  private storeCurrentStepData() {
    const formData = this.segForm.value;
    
    // Ensure ship and system IDs are properly stored
    const stepData = {
      ...formData,
      ship: this.selectedShipId || formData.ship,
      sd_system: this.selectedSystemId || formData.sd_system
    };
    
    if (this.currentStep === 1) {
      this.step1Data = { ...stepData };
    } else if (this.currentStep === 2) {
      this.step2Data = { ...stepData };
    } else if (this.currentStep === 3) {
      this.step3Data = { ...stepData };
    }
    
    console.log(`Stored step ${this.currentStep} data:`, stepData);
  }

  // Populate form with data from previous step
  private populateFormFromPreviousStep() {
    let previousStepData: any = {};
    
    // Get data from the previous step
    if (this.currentStep === 2) {
      previousStepData = this.step1Data;
    } else if (this.currentStep === 3) {
      previousStepData = this.step2Data;
    }
    
    console.log(`Populating step ${this.currentStep} with previous step data:`, previousStepData);
    
    if (previousStepData && Object.keys(previousStepData).length > 0) {
      // Auto-fill common fields from previous step
      const commonFields = [
        'ship', 'sd_system', 'sd_sub_system', 'sd_sub_sub_system',
        'ped_sr_no', 'ped_make_or_oem_module', 'ped_oem_part_no_motherboard_or_sbd', 'ped_patt_no',
        'mmd_media_type', 'mmd_size', 'mmd_interface', 'mmd_scsi', 'mmd_os',
        'mmd_ap_application_name', 'mmd_ap_application_version'
      ];
      
      const updateData: any = {};
      
      commonFields.forEach(field => {
        if (previousStepData[field] !== undefined && previousStepData[field] !== '') {
          updateData[field] = previousStepData[field];
        }
      });
      
      console.log('Auto-filling with data:', updateData);
      
      // Update form with common fields
      this.segForm.patchValue(updateData);
      
      // Update selectedShipId and selectedSystemId for proper display
      if (previousStepData.ship || previousStepData.ship) {
        this.selectedShipId = this.extractId(previousStepData.ship) || this.extractId(previousStepData.ship);
        // Also update the form control value to match the selected ID
        this.segForm.patchValue({ ship: this.selectedShipId });
        console.log('Set ship ID:', this.selectedShipId);
      }
      if (previousStepData.sd_system) {
        this.selectedSystemId = this.extractId(previousStepData.sd_system);
        // Also update the form control value to match the selected ID
        this.segForm.patchValue({ sd_system: this.selectedSystemId });
        console.log('Set system ID:', this.selectedSystemId);
      }
      
      console.log('Final form values after auto-fill:', this.segForm.value);
      console.log('Selected Ship ID:', this.selectedShipId);
      console.log('Selected System ID:', this.selectedSystemId);
    } else {
      console.log('No previous step data available for auto-fill');
    }
  }

  // Populate form with data from stored step data (when going back)
  private populateFormFromStoredStepData() {
    let storedStepData: any = {};
    
    // Get data from the current step's stored data
    if (this.currentStep === 1) {
      storedStepData = this.step1Data;
    } else if (this.currentStep === 2) {
      storedStepData = this.step2Data;
    }
    
    if (storedStepData && Object.keys(storedStepData).length > 0) {
      // Update form with stored data
      this.segForm.patchValue(storedStepData);
      
      // Update selectedShipId and selectedSystemId for proper display
      if (storedStepData.ship || storedStepData.ship) {
        this.selectedShipId = this.extractId(storedStepData.ship) || this.extractId(storedStepData.ship);
        // Also update the form control value to match the selected ID
        this.segForm.patchValue({ ship: this.selectedShipId });
      }
      if (storedStepData.sd_system) {
        this.selectedSystemId = this.extractId(storedStepData.sd_system);
        // Also update the form control value to match the selected ID
        this.segForm.patchValue({ sd_system: this.selectedSystemId });
      }
      
      console.log('Restored form with stored step data:', storedStepData);
      console.log('Selected Ship ID:', this.selectedShipId);
      console.log('Selected System ID:', this.selectedSystemId);
    }
  }

  // Debug method to check current state
  getCurrentState() {
    return {
      isViewMode: this.isViewMode,
      currentMode: this.currentMode,
      currentStep: this.currentStep,
      totalSteps: this.totalSteps,
      showDiDrForm: this.showDiDrForm,
      showESRepairForm: this.showESRepairForm,
      showESExtractionForm: this.showESExtractionForm,
      canProceedToNext: this.canProceedToNext()
    };
  }

  // Helper method to extract ID from ship/system data (handles both old and new API structures)
  private extractId(data: any): number | null {
    if (!data) return null;
    
    // Handle new API structure where data is an object with id, name, code
    if (typeof data === 'object' && data.id) {
      return data.id;
    }
    
    // Handle old API structure where data is just an ID
    if (typeof data === 'number') {
      return data;
    }
    
    // Handle string IDs
    if (typeof data === 'string' && !isNaN(Number(data))) {
      return Number(data);
    }
    
    return null;
  }

  // Get step title
  getStepTitle(): string {
    switch (this.currentStep) {
      case 1:
        return 'REQUEST FOR DI/ DR';
      case 2:
        return 'REQUEST FOR ES REPAIR/ RESTORATION';
      case 3:
        return 'REQUEST FOR ES EXTRACTION FOR BACKUP';
      default:
        return '';
    }
  }

  onClear() {
    this.segForm.reset();
    this.defectFileName = '';
    this.segFileName = '';
    this.defectFilePreview = '';
    this.segFilePreview = '';
    this.defectFileObject = null;
    this.segFileObject = null;
    this.hashValueFileName = '';
    this.diskInfoFileName = '';
    this.hashValueStoredFileName = '';
    this.hashValueFilePreview = '';
    this.diskInfoFilePreview = '';
    this.hashValueStoredFilePreview = '';
    this.hashValueFileObject = null;
    this.diskInfoFileObject = null;
    this.hashValueStoredFileObject = null;
    
    // Clear ES Extraction file properties
    this.esbHashValueFileName = '';
    this.esbDiskInfoFileName = '';
    this.esbHashValueStoredFileName = '';
    this.esbHashValueFilePreview = '';
    this.esbDiskInfoFilePreview = '';
    this.esbHashValueStoredFilePreview = '';
    this.esbHashValueFileObject = null;
    this.esbDiskInfoFileObject = null;
    this.esbHashValueStoredFileObject = null;
    
    this.createdDiOrDrId = null;
    this.createdESRepairId = null;
    this.selectedShipId = null;
    this.selectedSystemId = null;
    
    // Reset form visibility states to default (always start with step 1)
    this.showDiDrForm = true;
    this.showESRepairForm = false;
    this.showESExtractionForm = false;
    
    // Clear report data to prevent auto-population
    this.reportData = null;
    
    // Reset multi-step form (will set currentStep = 1)
    this.initializeMultiStepForm();
    
    this.initializeForm();
  }

  onCancel() {
    this.formCancel.emit();
  }

  // Navigation methods for full page layout
  goBackToList(): void {
    console.log('🔍 goBackToList called - going back to table view');
    // Navigate back to the main SEG page (which will show the table view)
    this.router.navigate(['/forms/seg/seg-form']);
  }

  toggleView(): void {
    console.log('🔍 toggleView called - clearing form data');
    
    // If formOnlyMode is enabled, don't allow toggling to table view
    if (this.formOnlyMode) {
      console.log('🔍 FormOnlyMode enabled - preventing toggle to table view');
      return;
    }
    
    // Emit cancel event to parent component
    this.formCancel.emit();
  }

  // Handle Update operation
  onUpdate() {
    if (this.segForm.valid && this.reportData && this.reportData.id) {
      const formData = this.segForm.value;
      
      const payload = {
        "id": this.reportData.id,
        "action": "update",
        "draft_status": this.submissionType === 'draft' ? 'update' : 'update',
        "ship": this.selectedShipId ? this.selectedShipId.toString() : '',
        "sd_system": this.selectedSystemId ? this.selectedSystemId.toString() : '',
        "sd_sub_system": formData.sd_sub_system,
        "sd_sub_sub_system": formData.sd_sub_sub_system,
        "ped_sr_no": formData.ped_sr_no,
        "ped_make_or_oem_module": formData.ped_make_or_oem_module,
        "ped_oem_part_no_motherboard_or_sbd": formData.ped_oem_part_no_motherboard_or_sbd,
        "ped_patt_no": formData.ped_patt_no,
        "mmd_media_type": formData.mmd_media_type,
        "mmd_size": formData.mmd_size,
        "mmd_interface": formData.mmd_interface,
        "mmd_scsi": formData.mmd_scsi,
        "mmd_os": formData.mmd_os,
        "ds_file": formData.ds_file,
        "ds_submitted_by": formData.ds_submitted_by,
        "ds_status": formData.ds_status,
        "ds_verified_by": formData.ds_verified_by,
        "ds_request_no": formData.ds_request_no,
        "ess_repair_or_restoration_job_ref_no": formData.ess_repair_or_restoration_job_ref_no,
        "ess_repair_or_restoration_job_assign_to": formData.ess_repair_or_restoration_job_assign_to,
        "ess_repair_or_restoration_remarks": formData.ess_repair_or_restoration_remarks,
        "ess_repair_or_restoration_status": formData.ess_repair_or_restoration_status,
        "remarks_from_seg_file": formData.remarks_from_seg_file,
        "remarks_from_seg_status": formData.remarks_from_seg_status,
        "handed_over_to": formData.handed_over_to,
        "ship_feedback": formData.ship_feedback
      };
      
      this.apiService.post('seg/segform/', payload).subscribe({
        next: (response: any) => {
          if (response.status === 200 || response.status === 201) {
            this.toastService.showSuccess('Form updated successfully');
            this.formSubmit.emit(response.data);
          } else {
            this.toastService.showError('Failed to update form');
          }
        },
        error: (error) => {
          this.toastService.showError('Error updating form');
          console.error('API Error:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
      this.toastService.showError('Please fill in all required fields');
    }
  }

  // Handle Delete operation
  onDelete() {
    if (this.reportData && this.reportData.id) {
      const payload = {
        di_or_dr_id: this.reportData.id,
        action: "delete"
      };
      
      this.apiService.post('seg/segform/delete/', payload).subscribe({
        next: (response: any) => {
          if (response.status === 200 || response.status === 201) {
            this.toastService.showSuccess('Form deleted successfully');
            this.formCancel.emit();
          } else {
            this.toastService.showError('Failed to delete form');
          }
        },
        error: (error) => {
          this.toastService.showError('Error deleting form');
          console.error('API Error:', error);
        }
      });
    }
  }

  private populateForm() {
    // Use reportData or record, whichever is available
    const dataSource = this.reportData || this.record;
    console.log('populateForm called with dataSource:', dataSource);
    console.log('segForm exists:', !!this.segForm);
    
    if (dataSource && this.segForm) {
      // Map API data directly to form fields (new flat structure)
      const formData = {
        // System Details - Handle API structure where ship is a number and system is an object
        ship: this.extractId(dataSource.ship) || this.extractId(dataSource.ship) || '',
        sd_system: this.extractId(dataSource.sd_system) || '',
        sd_sub_system: dataSource.sd_sub_system || '',
        sd_sub_sub_system: dataSource.sd_sub_sub_system || '',
        
        // Processing Element Details
        ped_sr_no: dataSource.ped_sr_no || '',
        ped_make_or_oem_module: dataSource.ped_make_or_oem_module || '',
        ped_oem_part_no_motherboard_or_sbd: dataSource.ped_oem_part_no_motherboard_or_sbd || '',
        ped_patt_no: dataSource.ped_patt_no || '',
        
        // Memory Media Details
        mmd_media_type: dataSource.mmd_media_type || '',
        mmd_size: dataSource.mmd_size || '',
        mmd_interface: dataSource.mmd_interface || '',
        mmd_scsi: dataSource.mmd_scsi || '',
        mmd_os: dataSource.mmd_os || '',
        
        // Application Details
        mmd_ap_application_name: dataSource.mmd_ap_application_name || '',
        mmd_ap_application_version: dataSource.mmd_ap_application_version || '',
        
        // DI/DR Specific Fields
        ds_file: dataSource.ds_file || null,
        didr_ds_submitted_by: dataSource.didr_ds_submitted_by || '',
        didr_ds_status: dataSource.didr_ds_status || 'Pending',
        didr_ds_verified_by: dataSource.didr_ds_verified_by || '',
        didr_ds_request_no: dataSource.didr_ds_request_no || '',
        didr_ess_repair_or_restoration_job_ref_no: dataSource.didr_ess_repair_or_restoration_job_ref_no || '',
        didr_ess_repair_or_restoration_job_assign_to: dataSource.didr_ess_repair_or_restoration_job_assign_to || '',
        didr_ess_repair_or_restoration_remarks: dataSource.didr_ess_repair_or_restoration_remarks || '',
        didr_ess_repair_or_restoration_status: dataSource.didr_ess_repair_or_restoration_status || '',
        didr_remarks_from_seg_file: dataSource.didr_remarks_from_seg_file || null,
        didr_remarks_from_seg_status: dataSource.didr_remarks_from_seg_status || '',
        didr_handed_over_to: dataSource.didr_handed_over_to || '',
        didr_ship_feedback: dataSource.didr_ship_feedback || '',
        
        // ES Repair Specific Fields (only fields present in the second form HTML)
        esr_ro_submitted_by: dataSource.esr_ro_submitted_by || '',
        esr_ro_status: dataSource.esr_ro_status || 'Pending',
        esr_ro_verified_by: dataSource.esr_ro_verified_by || '',
        esr_ro_request_no: dataSource.esr_ro_request_no || '',
        esr_ess_repair_or_restoration_job_ref_no: dataSource.esr_ess_repair_or_restoration_job_ref_no || '',
        esr_ess_repair_or_restoration_job_assign_to: dataSource.esr_ess_repair_or_restoration_job_assign_to || '',
        esr_ess_repair_or_restoration_remarks: dataSource.esr_ess_repair_or_restoration_remarks || '',
        esr_ess_repair_or_restoration_status: dataSource.esr_ess_repair_or_restoration_status || '',
        esr_disk_info_captured: dataSource.esr_disk_info_captured || '',
        esr_mmd_health_prediction: dataSource.esr_mmd_health_prediction || '',
        esr_dc_tool_used: dataSource.esr_dc_tool_used || '',
        esr_dc_clone_disk_name: dataSource.esr_dc_clone_disk_name || '',
        esr_dc_hash_value_file: dataSource.esr_dc_hash_value_file || null,
        esr_dm_verification_of_partion_structre: dataSource.esr_dm_verification_of_partion_structre || '',
        esr_dm_verification_of_file_system: dataSource.esr_dm_verification_of_file_system || '',
        esr_boot_trial_remarks: dataSource.esr_boot_trial_remarks || '',
        esr_rd_nomenclature_of_root_folder: dataSource.esr_rd_nomenclature_of_root_folder || '',
        esr_rd_stored_in: dataSource.esr_rd_stored_in || '',
        esr_rd_disk_info_file: dataSource.esr_rd_disk_info_file || null,
        esr_rd_cloned_disk_or_image: dataSource.esr_rd_cloned_disk_or_image || '',
        esr_rd_hash_value_stored_in_file: dataSource.esr_rd_hash_value_stored_in_file || null,
        esr_image_or_clone_restored_from: dataSource.esr_image_or_clone_restored_from || '',
        esr_remarks_by_seg: dataSource.esr_remarks_by_seg || '',
        esr_handed_over_to: dataSource.esr_handed_over_to || '',
        esr_feedback_of_ss: dataSource.esr_feedback_of_ss || '',
        
        // ES Extraction Specific Fields (only fields present in the third form HTML)
        esb_ess_extraction_job_ref_no: dataSource.esb_ess_extraction_job_ref_no || '',
        esb_ess_extraction_job_assign_to: dataSource.esb_ess_extraction_job_assign_to || '',
        esb_ess_extraction_remarks: dataSource.esb_ess_extraction_remarks || '',
        esb_ess_extraction_status: dataSource.esb_ess_extraction_status || '',
        esb_disk_info_captured: dataSource.esb_disk_info_captured || '',
        esb_mmd_health_prediction: dataSource.esb_mmd_health_prediction || '',
        esb_dc_tool_used: dataSource.esb_dc_tool_used || '',
        esb_dc_clone_disk_name: dataSource.esb_dc_clone_disk_name || '',
        esb_dc_hash_value_file: dataSource.esb_dc_hash_value_file || null,
        esb_dm_verification_of_partion_structre: dataSource.esb_dm_verification_of_partion_structre || '',
        esb_dm_verification_of_file_system: dataSource.esb_dm_verification_of_file_system || '',
        esb_rd_nomenclature_of_root_folder: dataSource.esb_rd_nomenclature_of_root_folder || '',
        esb_rd_stored_in: dataSource.esb_rd_stored_in || '',
        esb_rd_disk_info_file: dataSource.esb_rd_disk_info_file || null,
        esb_rd_cloned_disk_or_image: dataSource.esb_rd_cloned_disk_or_image || '',
        esb_rd_hash_value_stored_in_file: dataSource.esb_rd_hash_value_stored_in_file || null,
        esb_status_of_job: dataSource.esb_status_of_job || '',
        esb_handed_over_to: dataSource.esb_handed_over_to || ''
      };
      
      console.log('Form data to be patched:', formData);
      console.log('Form controls before patch:', Object.keys(this.segForm.controls));
      console.log('API data source:', dataSource);
      
      this.segForm.patchValue(formData);
      
      console.log('Form values after patch:', this.segForm.value);
      console.log('Selected Ship ID after patch:', this.selectedShipId);
      console.log('Selected System ID after patch:', this.selectedSystemId);
      
            // Set file names for display
            if (dataSource.ds_file) {
              this.defectFileName = dataSource.ds_file.split('/').pop() || 'File uploaded';
            }
            if (dataSource.didr_remarks_from_seg_file) {
              this.segFileName = dataSource.didr_remarks_from_seg_file.split('/').pop() || 'File uploaded';
            }
            if (dataSource.esr_dc_hash_value_file) {
              this.hashValueFileName = dataSource.esr_dc_hash_value_file.split('/').pop() || 'File uploaded';
            }
            if (dataSource.esr_rd_disk_info_file) {
              this.diskInfoFileName = dataSource.esr_rd_disk_info_file.split('/').pop() || 'File uploaded';
            }
            if (dataSource.esr_rd_hash_value_stored_in_file) {
              this.hashValueStoredFileName = dataSource.esr_rd_hash_value_stored_in_file.split('/').pop() || 'File uploaded';
            }

            // Set ES Extraction file names for display
            if (dataSource.esb_dc_hash_value_file) {
              this.esbHashValueFileName = dataSource.esb_dc_hash_value_file.split('/').pop() || 'File uploaded';
            }
            if (dataSource.esb_rd_disk_info_file) {
              this.esbDiskInfoFileName = dataSource.esb_rd_disk_info_file.split('/').pop() || 'File uploaded';
            }
            if (dataSource.esb_rd_hash_value_stored_in_file) {
              this.esbHashValueStoredFileName = dataSource.esb_rd_hash_value_stored_in_file.split('/').pop() || 'File uploaded';
            }
      
      // Set the selected ship ID for editing mode - Handle API structure where ship is a number
      const shipId = this.extractId(dataSource.ship) || this.extractId(dataSource.ship);
      if (shipId) {
        this.selectedShipId = shipId;
        // Also update the form control value to match the selected ID
        this.segForm.patchValue({ ship: shipId });
      }
      
      // Set the selected system ID for editing mode - Handle new API structure
      const systemId = this.extractId(dataSource.sd_system);
      if (systemId) {
        this.selectedSystemId = systemId;
        // Also update the form control value to match the selected ID
        this.segForm.patchValue({ sd_system: systemId });
      }
      
      // Determine which form section should be visible based on existing data
      this.determineFormVisibility();
    } else {
      console.log('populateForm: dataSource or segForm is missing');
      console.log('dataSource:', dataSource);
      console.log('segForm:', this.segForm);
    }
  }

  private determineFormVisibility() {
    const dataSource = this.reportData || this.record;
    if (!dataSource) return;
    
    // Check if DI/DR data exists (using API structure where ship is a number)
    const hasDiDrData = !!(dataSource.ship || dataSource.ship || dataSource.sd_system || dataSource.ped_sr_no || dataSource.didr_ds_submitted_by);
    
    // Check if ES Repair data exists (using new flat structure)
    const hasEsRepairData = !!(dataSource.esr_ro_submitted_by || dataSource.esr_ro_status || dataSource.esr_ess_repair_or_restoration_job_ref_no);
    
    // Check if ES Extraction data exists (using new flat structure)
    const hasEsExtractionData = !!(dataSource.esb_ess_extraction_job_ref_no || dataSource.esb_ess_extraction_job_assign_to || dataSource.esb_status_of_job);
    
    // Both view mode and edit mode should always start with step 1 (first form)
    this.currentStep = 1;
    this.showDiDrForm = true;
    this.showESRepairForm = false;
    this.showESExtractionForm = false;
    
    console.log('Form visibility determined:', {
      currentStep: this.currentStep,
      isViewMode: this.isViewMode,
      showDiDrForm: this.showDiDrForm,
      showESRepairForm: this.showESRepairForm,
      showESExtractionForm: this.showESExtractionForm,
      hasDiDrData,
      hasEsRepairData,
      hasEsExtractionData,
      reportData: this.reportData
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.segForm.controls).forEach(key => {
      const control = this.segForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.segForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // File upload handlers
  onDefectFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.defectFileName = file.name;
      this.defectFileObject = file;
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.defectFilePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.defectFilePreview = '';
      }
      
      this.toastService.showSuccess('Defect summary file selected: ' + file.name);
    }
  }

  onSegFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.segFileName = file.name;
      this.segFileObject = file;
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.segFilePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.segFilePreview = '';
      }
      
      this.toastService.showSuccess('SEG remarks file selected: ' + file.name);
    }
  }

  // Remove file methods
  removeDefectFile() {
    this.defectFileName = '';
    this.defectFilePreview = '';
    this.defectFileObject = null;
    this.toastService.showSuccess('Defect summary file removed');
  }

  removeSegFile() {
    this.segFileName = '';
    this.segFilePreview = '';
    this.segFileObject = null;
    this.toastService.showSuccess('SEG remarks file removed');
  }

  // ES Repair/Restoration file upload handlers
  onHashValueFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.hashValueFileName = file.name;
      this.hashValueFileObject = file;
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.hashValueFilePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.hashValueFilePreview = '';
      }
      
      this.toastService.showSuccess('Hash value file selected: ' + file.name);
    }
  }

  onDiskInfoFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.diskInfoFileName = file.name;
      this.diskInfoFileObject = file;
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.diskInfoFilePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.diskInfoFilePreview = '';
      }
      
      this.toastService.showSuccess('Disk info file selected: ' + file.name);
    }
  }

  // Remove ES Repair files methods
  removeHashValueFile() {
    this.hashValueFileName = '';
    this.hashValueFilePreview = '';
    this.hashValueFileObject = null;
    this.toastService.showSuccess('Hash value file removed');
  }

  removeDiskInfoFile() {
    this.diskInfoFileName = '';
    this.diskInfoFilePreview = '';
    this.diskInfoFileObject = null;
    this.toastService.showSuccess('Disk info file removed');
  }

  // Hash Value Stored file upload handler
  onHashValueStoredFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.hashValueStoredFileName = file.name;
      this.hashValueStoredFileObject = file;
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.hashValueStoredFilePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.hashValueStoredFilePreview = '';
      }
      
      this.toastService.showSuccess('Hash value stored file selected: ' + file.name);
    }
  }

  // Remove Hash Value Stored file method
  removeHashValueStoredFile() {
    this.hashValueStoredFileName = '';
    this.hashValueStoredFilePreview = '';
    this.hashValueStoredFileObject = null;
    this.toastService.showSuccess('Hash value stored file removed');
  }

  // ES Extraction file upload handlers (separate from ES Repair)
  onEsbHashValueFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.esbHashValueFileName = file.name;
      this.esbHashValueFileObject = file;
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.esbHashValueFilePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.esbHashValueFilePreview = '';
      }
      
      this.toastService.showSuccess('ES Extraction Hash value file selected: ' + file.name);
    }
  }

  onEsbDiskInfoFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.esbDiskInfoFileName = file.name;
      this.esbDiskInfoFileObject = file;
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.esbDiskInfoFilePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.esbDiskInfoFilePreview = '';
      }
      
      this.toastService.showSuccess('ES Extraction Disk info file selected: ' + file.name);
    }
  }

  onEsbHashValueStoredFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.esbHashValueStoredFileName = file.name;
      this.esbHashValueStoredFileObject = file;
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.esbHashValueStoredFilePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.esbHashValueStoredFilePreview = '';
      }
      
      this.toastService.showSuccess('ES Extraction Hash value stored file selected: ' + file.name);
    }
  }

  // Remove ES Extraction files methods
  removeEsbHashValueFile() {
    this.esbHashValueFileName = '';
    this.esbHashValueFilePreview = '';
    this.esbHashValueFileObject = null;
    this.toastService.showSuccess('ES Extraction Hash value file removed');
  }

  removeEsbDiskInfoFile() {
    this.esbDiskInfoFileName = '';
    this.esbDiskInfoFilePreview = '';
    this.esbDiskInfoFileObject = null;
    this.toastService.showSuccess('ES Extraction Disk info file removed');
  }

  removeEsbHashValueStoredFile() {
    this.esbHashValueStoredFileName = '';
    this.esbHashValueStoredFilePreview = '';
    this.esbHashValueStoredFileObject = null;
    this.toastService.showSuccess('ES Extraction Hash value stored file removed');
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

  // Route Config Popup Methods
  onConfigureRoute(): void {
    console.log('🚀 ADD ROUTE CONFIG POPUP - Parent onConfigureRoute called');
    console.log('🚀 ADD ROUTE CONFIG POPUP - Form ID:', this.reportData?.id);
    console.log('🚀 ADD ROUTE CONFIG POPUP - isAddMode:', this.isAddMode);
    console.log('🚀 ADD ROUTE CONFIG POPUP - pendingAction:', this.pendingAction);
    
    if (this.isAddMode && !this.reportData?.id) {
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

  private performSave(isForRouteConfig: boolean = false, isForModal: boolean = false): void {
    console.log('🚀 ADD ROUTE CONFIG POPUP - performSave called');
    
    if (this.segForm.valid) {
      // Store current step data
      this.storeCurrentStepData();
      
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add action and type with validation
      const action = this.isEditMode ? 'update' : 'create';
      
      // Validation: For action 'create', only allow 'pass' status
      if (action === 'create') {
        formDataToSend.append('action', action);
        formDataToSend.append('draft_status', 'pass');
      } else {
        formDataToSend.append('action', action);
        formDataToSend.append('draft_status', 'draft');
      }
      
      // Add record ID for update operations
      if (this.isEditMode && this.reportData) {
        const recordId = this.reportData.id || this.reportData.di_or_dr_id || this.reportData.di_or_dr_data?.id;
        if (recordId) {
          formDataToSend.append('id', recordId.toString());
        }
      }
      
      // Add all form data with proper prefixes
      this.addFormDataToPayload(formDataToSend);
      
      console.log('Submitting Final FormData with all steps');
      
      // Make API call with FormData
      this.apiService.postFormData('seg/segform/', formDataToSend).subscribe({
        next: (response: any) => {
          console.log('🚀 ADD ROUTE CONFIG POPUP - Form saved successfully, response:', response);
          
          if (isForRouteConfig) {
            const savedId = response.id || response.data?.id;
            if (savedId) {
              console.log('🔍 Got saved ID:', savedId, '- updating form');
              this.reportData = { ...this.reportData, id: savedId };
              
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
            this.onCancel();
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
    
    // Store current step data
    this.storeCurrentStepData();
    
    // Create FormData for file uploads
    const formDataToSend = new FormData();
    
    // Add action and type with validation
    const action = this.isEditMode ? 'update' : 'create';
    
    // Validation: For draft_status, only allow 'draft' status
    formDataToSend.append('action', action);
    formDataToSend.append('draft_status', 'draft');
    
    // Add record ID for update operations
    if (this.isEditMode && this.reportData) {
      const recordId = this.reportData.id || this.reportData.di_or_dr_id || this.reportData.di_or_dr_data?.id;
      if (recordId) {
        formDataToSend.append('id', recordId.toString());
      }
    }
    
    // Add all form data with proper prefixes
    this.addFormDataToPayload(formDataToSend);
    
    console.log('Submitting Draft FormData for step:', this.currentStep);
    
    // Make API call with FormData
    this.apiService.postFormData('seg/segform/', formDataToSend).subscribe({
      next: (response: any) => {
        console.log('🚀 ADD ROUTE CONFIG POPUP - Draft saved successfully, response:', response);
        
        if (isForRouteConfig) {
          const savedId = response.id || response.data?.id;
          console.log('🚀 ADD ROUTE CONFIG POPUP - isForRouteConfig is true, savedId:', savedId);
          if (savedId) {
            console.log('🔍 Got saved ID:', savedId, '- updating form');
            this.reportData = { ...this.reportData, id: savedId };
            console.log('🔍 Form updated, new ID value:', this.reportData?.id);
            
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
          this.onCancel();
        }
      },
      error: (error) => {
        console.error('Draft save error:', error);
        this.toastService.showError('Error saving draft');
      }
    });
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
    console.log('🔄 Refreshing timeline from SEG Form...');
    // The timeline refresh will be handled by the route config component
    // This method is here to handle the event from the popup
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
      sub_module: 6,
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