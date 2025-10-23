import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

import { CommonModule } from '@angular/common';

import { ReactiveFormsModule } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';

import { ApiService } from '../../../../services/api.service';

import { ToastService } from '../../../../services/toast.service';

import { ToastComponent } from '../../../../shared/components/toast/toast.component';

import { RouteConfigComponent } from '../../../../route-config/route-config.component';

import { RouteConfigPopupComponent, RouteConfigData } from '../../../../shared/components/route-config-popup/route-config-popup.component';



@Component({

  selector: 'app-gtg-load-trial-report',

  standalone: true,

  imports: [CommonModule, ReactiveFormsModule, DialogModule, ToastComponent, RouteConfigComponent, RouteConfigPopupComponent],

  templateUrl: './gtg-load-trial-report.component.html',

  styleUrls: ['./gtg-load-trial-report.component.css']

})

export class GtgLoadTrialReportComponent implements OnInit, OnChanges {

  @Input() isEditMode: boolean = false;
  @Input() id: number | undefined = undefined;

  @Input() transactionId: number | undefined = undefined;

  @Input() isViewMode: boolean = false;

  @Input() reportData: any = null;

  @Input() isFormOpen: boolean = false;

  @Output() formSubmit = new EventEmitter<any>();

  @Output() formCancel = new EventEmitter<void>();

  @Output() formDataRequest = new EventEmitter<void>(); // New output for requesting form data

  

  // Track which button was clicked

  private submissionType: 'draft' | 'submit' = 'submit';

  

  gtgForm!: FormGroup;

  ships: any[] = [];

  selectedShipId: number | null = null;

  isLoadingShips: boolean = false;

  

  // Equipment properties

  equipments: any[] = [];

  isLoadingEquipments: boolean = false;



  // Route configuration properties

  showRouteConfigPopup = false;

  isAddMode = false; // Track if we're in add mode

  pendingAction: 'save' | 'saveDraft' | null = null; // Track which action triggered the popup

  showRouteConfigModal = false; // Control route config modal visibility

  userInitiatedAction = false; // Track if user initiated the action

  isLoadingFormData = false; // Track if we're currently loading form data



  constructor(

    private fb: FormBuilder,

    private apiService: ApiService,

    private toastService: ToastService

  ) {}



  ngOnInit() {

    this.initializeForm();

    this.loadShips();

    this.loadEquipments();

    

    // Set isAddMode based on whether reportData exists

    this.isAddMode = !this.reportData || !this.reportData.id;
    console.log('🚀 GTG FORM ID:', this.reportData);

    this.gtgForm.patchValue(this.reportData);

    

    // If reportData is already available (edit mode), populate the form

    if (this.reportData && this.gtgForm) {

      this.populateForm();

    }

    

    // Handle view mode - disable form controls

    if (this.isViewMode) {

      this.gtgForm.disable();

    }

  }



  ngOnChanges(changes: SimpleChanges): void {

    if (changes['reportData']) {

      // Update isAddMode based on reportData

      this.isAddMode = !this.reportData || !this.reportData.id;

      

      if (this.reportData && this.gtgForm) {

        this.populateForm();

      } else if (this.reportData) {

        // Try to populate after a short delay to ensure form is ready

        setTimeout(() => {

          if (this.gtgForm) {

            this.populateForm();

          }

        }, 100);

      }

    }

    

    // Handle view mode changes

    if (changes['isViewMode'] && this.gtgForm) {

      if (this.isViewMode) {

        this.gtgForm.disable();

      } else {

        this.gtgForm.enable();

      }

    }

  }



  private initializeForm() {

    this.gtgForm = this.fb.group({

      // Header Information
      id: [this.id],
      occasionOfTrials: ['', Validators.required], // Maps to occation_of_trial

      trial_date: ['', Validators.required],

      ship: [null, Validators.required], // Maps to shipID

      

      // Trial Details

      presentedBy: ['', Validators.required], // Maps to Presented_by

      trialDate: ['', Validators.required], // Maps to trial_date

      occasionOfCurrentTrial: ['', Validators.required], // Maps to occationOfCurrTrial

      dateOfLastTrial: ['', Validators.required], // Maps to lastTrialDate

      proposalReference: ['', Validators.required], // Maps to proposal_reference

      fileReference: ['', Validators.required], // Maps to file_reference

      referenceDocument: [''],

      

      // Test Equipment Used

      equipmentId: [''],

      

      // Equipment Details - Engine

      engineMake: ['', Validators.required],

      engineModelSerial: ['', Validators.required],

      engineRpm: ['', Validators.required],

      

      // Equipment Details - Governor

      governorMake: ['', Validators.required],

      governorModelSerial: ['', Validators.required],

      governorType: ['', Validators.required],

      

      // Equipment Details - Alternator

      alternatorMakeRating: ['', Validators.required],

      alternatorModelSerial: ['', Validators.required],

      alternatorType: ['', Validators.required], // Added alternator type field

      alternatorRatedVoltage: ['', Validators.required],

      alternatorRatedFrequency: ['', Validators.required],

      alternatorRatedKvaKw: ['', Validators.required],

      alternatorRatedCurrent: ['', Validators.required],

      alternatorBearingNumber: ['', Validators.required],

      

      // Equipment Details - AVR

      avrMakeType: ['', Validators.required],

      avrModelSerial: ['', Validators.required],

      

      // Equipment Details - Supply Breaker

      supplyBreakerMake: ['', Validators.required],

      supplyBreakerModelSerial: ['', Validators.required],

      supplyBreakerRatedCapacity: ['', Validators.required],

      

      // Section 4: Insulation Resistance

      generatorHot1: [''],

      generatorCold1: [''],

      switchboard1: [''],

      generatorCable1: [''],

      insulationBreaker1: [''],

      

      // Section 5: Protection Checks - Breaker Protection

      overVoltageCalibrationDate: [''],

      overVoltageCertificate: [''],

      overVoltageObserved: [''],

      overVoltageStatus: [''],

      underVoltageCalibrationDate: [''],

      underVoltageCertificate: [''],

      underVoltageObserved: [''],

      underVoltageStatus: [''],

      overloadCalibrationDate: [''],

      overloadCertificate: [''],

      overloadObserved: [''],

      overloadStatus: [''],

      

      // Section 5: Protection Checks - Generator/Switchboard Protection

      genOverVoltageCalibrationDate: [''],

      genOverVoltageCertificate: [''],

      genOverVoltageObserved: [''],

      genOverVoltageStatus: [''],

      genUnderVoltageCalibrationDate: [''],

      genUnderVoltageCertificate: [''],

      genUnderVoltageObserved: [''],

      genUnderVoltageStatus: [''],

      reversePowerCalibrationDate: [''],

      reversePowerCertificate: [''],

      reversePowerObserved: [''],

      reversePowerStatus: [''],

      windingTempCalibrationDate: [''],

      windingTempCertificate: [''],

      windingTempObserved: [''],

      windingTempStatus: [''],

      

      // Section 6: Instrumentation

      kwMeterOps: [''],

      kwMeterCalibrationDate: [''],

      kwMeterCertificate: [''],

      kwMeterStatus: [''],

      voltmeterOps: [''],

      voltmeterCalibrationDate: [''],

      voltmeterCertificate: [''],

      voltmeterStatus: [''],

      ammeterOps: [''],

      ammeterCalibrationDate: [''],

      ammeterCertificate: [''],

      ammeterStatus: [''],

      frequencyMeterOps: [''],

      frequencyMeterCalibrationDate: [''],

      frequencyMeterCertificate: [''],

      frequencyMeterStatus: [''],

      powerFactorMeterOps: [''],

      powerFactorMeterCalibrationDate: [''],

      powerFactorMeterCertificate: [''],

      powerFactorMeterStatus: [''],

      

      // Section 7: Miscellaneous Checks - Resistance Checks

      mainStatorResistance: [''],

      mainRotorResistance: [''],

      exciterStatorResistance: [''],

      exciterRotorResistance: [''],

      

      // Section 7: Miscellaneous Checks - Condition/Status Checks

      slipRingCondition: [''],

      zincPlugsCondition: [''],

      antiCondensationHeater: [''],

      gtttTrialStatus: [''],

      internalCommunication: [''],

      lightingCompartment: [''],

      ventilationCompartment: [''],

      terminalBoxSecured: [''],

      looseCablesSecured: [''],

      generatorEarthed: [''],

      supplyBreakerOperates: [''],

      

      // Section 7: Miscellaneous Checks - Temperature/Routine Checks

      ambientTemperatureStart: [''],

      temperatureRiseTwoHours: [''],

      coolerRoutineDate: [''],

      coolerInletTemperature: [''],

      coolerOutletTemperature: [''],

      statorWindingTemperature: [''],

      

      // Section 8: Speed Control Test - WITH PYM (RCHM) 'ON'

      pymOn0InitialSpeed: [''],

      pymOn0FinalSpeed: [''],

      pymOn0FrequencyModulation: [''],

      pymOn25InitialSpeed: [''],

      pymOn25FinalSpeed: [''],

      pymOn25FrequencyModulation: [''],

      pymOn50InitialSpeed: [''],

      pymOn50FinalSpeed: [''],

      pymOn50FrequencyModulation: [''],

      pymOn75InitialSpeed: [''],

      pymOn75FinalSpeed: [''],

      pymOn75FrequencyModulation: [''],

      pymOn110InitialSpeed: [''],

      pymOn110FinalSpeed: [''],

      pymOn110FrequencyModulation: [''],

      

      // Section 8: Speed Control Test - WITH PYM (RCHM) 'OFF'

      pymOff0InitialSpeed: [''],

      pymOff0FinalSpeed: [''],

      pymOff0FrequencyModulation: [''],

      pymOff25InitialSpeed: [''],

      pymOff25FinalSpeed: [''],

      pymOff25FrequencyModulation: [''],

      pymOff50InitialSpeed: [''],

      pymOff50FinalSpeed: [''],

      pymOff50FrequencyModulation: [''],

      pymOff75InitialSpeed: [''],

      pymOff75FinalSpeed: [''],

      pymOff75FrequencyModulation: [''],

      pymOff110InitialSpeed: [''],

      pymOff110FinalSpeed: [''],

      pymOff110FrequencyModulation: [''],

      pymOffGovernorDroopInitialSpeed: [''],

      pymOffGovernorDroopFinalSpeed: [''],

      pymOffGovernorDroopValue: [''],

      pymOffGovernorDroopFrequencyModulation: [''],

      

      // Section 8: Speed Control Test - (b) Transient Test - PЧM (RChM) 'ON'

      transientOn0to25InitialSpeed: [''],

      transientOn0to25MomentarySpeed: [''],

      transientOn0to25FinalSpeed: [''],

      transientOn0to25PeakObserved: [''],

      transientOn0to25RecoveryObserved: [''],

      transientOn25to0InitialSpeed: [''],

      transientOn25to0MomentarySpeed: [''],

      transientOn25to0FinalSpeed: [''],

      transientOn25to0PeakObserved: [''],

      transientOn25to0RecoveryObserved: [''],

      transientOn0to50InitialSpeed: [''],

      transientOn0to50MomentarySpeed: [''],

      transientOn0to50FinalSpeed: [''],

      transientOn0to50PeakObserved: [''],

      transientOn0to50RecoveryObserved: [''],

      transientOn50to0InitialSpeed: [''],

      transientOn50to0MomentarySpeed: [''],

      transientOn50to0FinalSpeed: [''],

      transientOn50to0PeakObserved: [''],

      transientOn50to0RecoveryObserved: [''],

      transientOn0to75InitialSpeed: [''],

      transientOn0to75MomentarySpeed: [''],

      transientOn0to75FinalSpeed: [''],

      transientOn0to75PeakObserved: [''],

      transientOn0to75RecoveryObserved: [''],

      transientOn75to0InitialSpeed: [''],

      transientOn75to0MomentarySpeed: [''],

      transientOn75to0FinalSpeed: [''],

      transientOn75to0PeakObserved: [''],

      transientOn75to0RecoveryObserved: [''],

      transientOn0to100InitialSpeed: [''],

      transientOn0to100MomentarySpeed: [''],

      transientOn0to100FinalSpeed: [''],

      transientOn0to100PeakObserved: [''],

      transientOn0to100RecoveryObserved: [''],

      transientOn100to0InitialSpeed: [''],

      transientOn100to0MomentarySpeed: [''],

      transientOn100to0FinalSpeed: [''],

      transientOn100to0PeakObserved: [''],

      transientOn100to0RecoveryObserved: [''],

      

      // Section 8: Speed Control Test - (b) Transient Test - PЧM (RChM) 'OFF'

      transientOff0to25InitialSpeed: [''],

      transientOff0to25MomentarySpeed: [''],

      transientOff0to25FinalSpeed: [''],

      transientOff0to25PeakObserved: [''],

      transientOff0to25RecoveryObserved: [''],

      transientOff25to0InitialSpeed: [''],

      transientOff25to0MomentarySpeed: [''],

      transientOff25to0FinalSpeed: [''],

      transientOff25to0PeakObserved: [''],

      transientOff25to0RecoveryObserved: [''],

      transientOff0to50InitialSpeed: [''],

      transientOff0to50MomentarySpeed: [''],

      transientOff0to50FinalSpeed: [''],

      transientOff0to50PeakObserved: [''],

      transientOff0to50RecoveryObserved: [''],

      transientOff50to0InitialSpeed: [''],

      transientOff50to0MomentarySpeed: [''],

      transientOff50to0FinalSpeed: [''],

      transientOff50to0PeakObserved: [''],

      transientOff50to0RecoveryObserved: [''],

      transientOff0to75InitialSpeed: [''],

      transientOff0to75MomentarySpeed: [''],

      transientOff0to75FinalSpeed: [''],

      transientOff0to75PeakObserved: [''],

      transientOff0to75RecoveryObserved: [''],

      transientOff75to0InitialSpeed: [''],

      transientOff75to0MomentarySpeed: [''],

      transientOff75to0FinalSpeed: [''],

      transientOff75to0PeakObserved: [''],

      transientOff75to0RecoveryObserved: [''],

      transientOff0to100InitialSpeed: [''],

      transientOff0to100MomentarySpeed: [''],

      transientOff0to100FinalSpeed: [''],

      transientOff0to100PeakObserved: [''],

      transientOff0to100RecoveryObserved: [''],

      transientOff100to0InitialSpeed: [''],

      transientOff100to0MomentarySpeed: [''],

      transientOff100to0FinalSpeed: [''],

      transientOff100to0PeakObserved: [''],

      transientOff100to0RecoveryObserved: [''],

      

      // Section 8: Speed Control Test - (c) Governor Range

      governorRange0Frequency: [''],

      governorRange0Remark: [''],

      governorRange100Frequency: [''],

      governorRange100Remark: [''],

      

      // Section 8: Speed Control Test - (d) Rate Affected by Governor Motor

      governorRate0Up: [''],

      governorRate0Down: [''],

      governorRate100Up: [''],

      governorRate100Down: [''],

      

      // Section 9: Voltage Control Test - (a) Steady State Test

      voltageControl0kW: [''],

      voltageControl0VoltsObserve: [''],

      voltageControl0VoltsPermissible: [''],

      voltageControl0PF: [''],

      voltageControl0Modulation: [''],

      voltageControl25kW: [''],

      voltageControl25VoltsObserve: [''],

      voltageControl25VoltsPermissible: [''],

      voltageControl25PF: [''],

      voltageControl25Modulation: [''],

      voltageControl50kW: [''],

      voltageControl50VoltsObserve: [''],

      voltageControl50VoltsPermissible: [''],

      voltageControl50PF: [''],

      voltageControl50Modulation: [''],

      voltageControl75kW: [''],

      voltageControl75VoltsObserve: [''],

      voltageControl75VoltsPermissible: [''],

      voltageControl75PF: [''],

      voltageControl75Modulation: [''],

      voltageControl100kW: [''],

      voltageControl100VoltsObserve: [''],

      voltageControl100VoltsPermissible: [''],

      voltageControl100PF: [''],

      voltageControl100Modulation: [''],

      

      // Section 9: Voltage Control Test - (b) Transient Test

      voltageTransient0to25InitialVoltage: [''],

      voltageTransient0to25MomentaryVoltage: [''],

      voltageTransient0to25FinalVoltage: [''],

      voltageTransient0to25PeakObserved: [''],

      voltageTransient0to25RecoveryObserved: [''],

      voltageTransient25to0InitialVoltage: [''],

      voltageTransient25to0MomentaryVoltage: [''],

      voltageTransient25to0FinalVoltage: [''],

      voltageTransient25to0PeakObserved: [''],

      voltageTransient25to0RecoveryObserved: [''],

      voltageTransient0to50InitialVoltage: [''],

      voltageTransient0to50MomentaryVoltage: [''],

      voltageTransient0to50FinalVoltage: [''],

      voltageTransient0to50PeakObserved: [''],

      voltageTransient0to50RecoveryObserved: [''],

      voltageTransient50to0InitialVoltage: [''],

      voltageTransient50to0MomentaryVoltage: [''],

      voltageTransient50to0FinalVoltage: [''],

      voltageTransient50to0PeakObserved: [''],

      voltageTransient50to0RecoveryObserved: [''],

      voltageTransient0to75InitialVoltage: [''],

      voltageTransient0to75MomentaryVoltage: [''],

      voltageTransient0to75FinalVoltage: [''],

      voltageTransient0to75PeakObserved: [''],

      voltageTransient0to75RecoveryObserved: [''],

      voltageTransient75to0InitialVoltage: [''],

      voltageTransient75to0MomentaryVoltage: [''],

      voltageTransient75to0FinalVoltage: [''],

      voltageTransient75to0PeakObserved: [''],

      voltageTransient75to0RecoveryObserved: [''],

      voltageTransient0to100InitialVoltage: [''],

      voltageTransient0to100MomentaryVoltage: [''],

      voltageTransient0to100FinalVoltage: [''],

      voltageTransient0to100PeakObserved: [''],

      voltageTransient0to100RecoveryObserved: [''],

      voltageTransient100to0InitialVoltage: [''],

      voltageTransient100to0MomentaryVoltage: [''],

      voltageTransient100to0FinalVoltage: [''],

      voltageTransient100to0PeakObserved: [''],

      voltageTransient100to0RecoveryObserved: [''],

      voltageTransient0plusMInitialVoltage: [''],

      voltageTransient0plusMMomentaryVoltage: [''],

      voltageTransient0plusMFinalVoltage: [''],

      voltageTransient0plusMPeakObserved: [''],

      voltageTransient0plusMRecoveryObserved: [''],

      voltageTransient25plusMInitialVoltage: [''],

      voltageTransient25plusMMomentaryVoltage: [''],

      voltageTransient25plusMFinalVoltage: [''],

      voltageTransient25plusMPeakObserved: [''],

      voltageTransient25plusMRecoveryObserved: [''],

      voltageTransient50plusMInitialVoltage: [''],

      voltageTransient50plusMMomentaryVoltage: [''],

      voltageTransient50plusMFinalVoltage: [''],

      voltageTransient50plusMPeakObserved: [''],

      voltageTransient50plusMRecoveryObserved: [''],

      voltageTransient75plusMInitialVoltage: [''],

      voltageTransient75plusMMomentaryVoltage: [''],

      voltageTransient75plusMFinalVoltage: [''],

      voltageTransient75plusMPeakObserved: [''],

      voltageTransient75plusMRecoveryObserved: [''],

      voltageTransient85plusMInitialVoltage: [''],

      voltageTransient85plusMMomentaryVoltage: [''],

      voltageTransient85plusMFinalVoltage: [''],

      voltageTransient85plusMPeakObserved: [''],

      voltageTransient85plusMRecoveryObserved: [''],

      

      // Section 9: Voltage Control Test - (c) Voltage Balance

      voltageBalance0RY: [''],

      voltageBalance0YB: [''],

      voltageBalance0BR: [''],

      voltageBalance0Difference: [''],

      voltageBalance0PermissibleLimit: [''],

      voltageBalance100RY: [''],

      voltageBalance100YB: [''],

      voltageBalance100BR: [''],

      voltageBalance100Difference: [''],

      voltageBalance100PermissibleLimit: [''],

      

      // Section 9: Voltage Control Test - (d) Voltage Range

      voltageRangeAVR0Lowest: [''],

      voltageRangeAVR0Highest: [''],

      voltageRangeAVR0PermissibleLimit: [''],

      voltageRangeAVR0Status: [''],

      voltageRangeControl100Lowest: [''],

      voltageRangeControl100Highest: [''],

      voltageRangeControl100PermissibleLimit: [''],

      voltageRangeControl100Status: [''],

      voltageRangeHand0Lowest: [''],

      voltageRangeHand0Highest: [''],

      voltageRangeHand0PermissibleLimit: [''],

      voltageRangeHand0Status: [''],

      voltageRangeHandControl100Lowest: [''],

      voltageRangeHandControl100Highest: [''],

      voltageRangeHandControl100PermissibleLimit: [''],

      voltageRangeHandControl100Status: [''],

      voltageRangeAVR0Remarks: [''],

      voltageRangeControl100Remarks: [''],

      voltageRangeHand0Remarks: [''],

      voltageRangeHandControl100Remarks: [''],

      

      // Section 9: Voltage Control Test - (e) Voltage Waveform Harmonic Content

      voltageHarmonicContent: ['']

    });

  }



  private loadShips() {

    this.isLoadingShips = true;

    this.apiService.get('/master/ship/').subscribe({

      next: (response: any) => {

        if (response.status === 200 && response.data) {

          this.ships = response.data;

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



  private loadEquipments() {

    this.isLoadingEquipments = true;

    this.apiService.get('/master/equipments?section__code=ELECTRICAL').subscribe({

      next: (response: any) => {

        if (response.status === 200 && response.data) {

          this.equipments = response.data;

        } else {

          this.toastService.showError('Failed to load equipments');

        }

        this.isLoadingEquipments = false;

      },

      error: (error) => {

        this.toastService.showError('Error loading equipments');

        this.isLoadingEquipments = false;

      }

    });

  }



  onShipChange(event: any) {

    this.selectedShipId = parseInt(event.target.value) || null;

  }



  getSelectedShipName(): string {

    if (this.selectedShipId && this.ships.length > 0) {

      const selectedShip = this.ships.find(ship => ship.id === parseInt(this.selectedShipId!.toString()));

      return selectedShip ? selectedShip.name : '';

    }

    return '';

  }



  // Check if form should be readonly (view mode)

  get isReadonly(): boolean {

    return this.isViewMode;

  }



  // Get dialog title based on mode

  get dialogTitle(): string {

    if (this.isViewMode) {

      return 'View GTG Load Trial Report';

    } else if (this.isEditMode) {

      return 'Edit GTG Load Trial Report';

    } else {

      return 'Add GTG Load Trial Report';

    }

  }



  // Handle Save Draft button click

  onSaveDraft() {

    this.submissionType = 'draft';

    

    if (!this.isAddMode) {

      this.performSaveDraft();

      return;

    }

    

    // Only show popup in add mode

    // Always show route configuration popup for Save Draft button

    this.userInitiatedAction = true;

    this.pendingAction = 'saveDraft';

    this.showRouteConfigPopup = true;

  }



  // Handle Submit Report button click

  onSubmitReport() {

    this.submissionType = 'submit';

    this.onSubmit();

  }



  onSubmit() {

    // In view mode, don't submit the form

    if (this.isViewMode) {

      return;

    }



    // In edit mode, save directly without showing popup

    if (!this.isAddMode) {

      if (this.gtgForm.valid) {

        this.performSave();

      } else {

        this.markFormGroupTouched(this.gtgForm);

      }

      return;

    }

    

    // Only show popup in add mode

    if (this.gtgForm.valid) {

      this.userInitiatedAction = true;

      this.pendingAction = 'save';

      this.showRouteConfigPopup = true;

    } else {

      this.markFormGroupTouched(this.gtgForm);

    }

  }



  // Method to perform actual save

  private performSave(isForRouteConfig: boolean = false, isForModal: boolean = false): void {

    if (this.gtgForm.valid) {

      const formData = this.gtgForm.value;

      

      // Helper function to format date or return null for empty values

      const formatDateOrNull = (dateValue: any): string | null => {

        if (!dateValue || dateValue === '' || dateValue === null || dateValue === undefined) {

          return null;

        }

        // If it's already in YYYY-MM-DD format, return as is

        if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {

          return dateValue;

        }

        // If it's a Date object, format it

        if (dateValue instanceof Date) {

          return dateValue.toISOString().split('T')[0];

        }

        // For any other format, try to parse and format

        try {

          const date = new Date(dateValue);

          if (!isNaN(date.getTime())) {

            return date.toISOString().split('T')[0];

          }

        } catch (e) {

          console.warn('Invalid date format:', dateValue);

        }

        return null;

      };



      // Helper function to return null for empty strings (for required fields)

      const nullIfEmpty = (value: any): string | null => {

        if (!value || value === '' || value === null || value === undefined) {

          return null;

        }

        return value;

      };



      // Helper function to return "No" for empty certificate status fields

      const defaultCertificateStatus = (value: any): string => {

        if (!value || value === '' || value === null || value === undefined) {

          return "No";

        }

        return value;

      };

      

      const payload = {

        // Add draft_status key based on submission type

        "draft_status": this.submissionType === 'draft' ? 'draft' : 'save',

        "Presented_by": formData.presentedBy,

        "trial_date": formatDateOrNull(formData.trial_date),

        "occation_of_trial": formData.occasionOfTrials,

        "occationOfCurrTrial": formData.occasionOfCurrentTrial,

        "lastTrialDate": formatDateOrNull(formData.dateOfLastTrial),

        "ship": this.selectedShipId || formData.ship,

        "proposal_reference": formData.proposalReference,

        "file_reference": formData.fileReference,

        "referanceDocID": formData.referenceDocument,

        "equipment_id": formData.equipmentId,

        // Equipment Details - Engine

        "engn_make": formData.engineMake,

        "engn_model_SrNo": formData.engineModelSerial,

        // Equipment Details - Governor

        "govnr_make": formData.governorMake,

        "govnr_model_SrNo": formData.governorModelSerial,

        "govnr_type": formData.governorType,

        // Equipment Details - Alternator

        "altnr_make": formData.alternatorMakeRating,

        "altnr_model_SrNo": formData.alternatorModelSerial,

        "altnr_type": formData.alternatorType,

        "altnr_RatedVoltage": formData.alternatorRatedVoltage,

        "altnr_RatedFrequency": formData.alternatorRatedFrequency,

        "altnr_RatedVal": formData.alternatorRatedKvaKw,

        "altnr_RatedCurrentVal": formData.alternatorRatedCurrent,

        "altnr_BearingNo": formData.alternatorBearingNumber,

        // Equipment Details - AVR

        "avr_make_type": formData.avrMakeType,

        "avr_model_SrNo": formData.avrModelSerial,

        // Equipment Details - Supply Breaker

        "spplyBrkr_make": formData.supplyBreakerMake,

        "spplyBrkr_model_srno": formData.supplyBreakerModelSerial,

        "spplyBrkr_RatedCpcty": formData.supplyBreakerRatedCapacity,

        // Section 4: Insulation Resistance

        "ir_gnrtr_hot": formData.generatorHot1,

        "ir_gnrtr_cold": formData.generatorCold1,

        "ir_swtchbrd": formData.switchboard1,

        "ir_gnrtr_cbl": formData.generatorCable1,

        "ir_insltn_brkr": formData.insulationBreaker1,

        // Section 5: Protection Checks - Breaker Protection

        "proChck_BP_OV_CDate": formatDateOrNull(formData.overVoltageCalibrationDate),

        "proChck_BP_OV_CertSts": formData.overVoltageCertificate,

        "proChck_BP_OV_ObsVal": formData.overVoltageObserved,

        "proChck_BP_OV_Sts": formData.overVoltageStatus,

        "proChck_BP_UV_CDate": formatDateOrNull(formData.underVoltageCalibrationDate),

        "proChck_BP_UV_CertSts": formData.underVoltageCertificate,

        "proChck_BP_UV_ObsVal": formData.underVoltageObserved,

        "proChck_BP_UV_Sts": formData.underVoltageStatus,

        "proChck_BP_OVLD_CDate": formatDateOrNull(formData.overloadCalibrationDate),

        "proChck_BP_OVLD_CertSts": formData.overloadCertificate,

        "proChck_BP_OVLD_ObsVal": formData.overloadObserved,

        "proChck_BP_OVLD_Sts": formData.overloadStatus,

        // Section 5: Protection Checks - Generator/Switchboard Protection

        "proChck_GSP_OVT_CDate": formatDateOrNull(formData.genOverVoltageCalibrationDate),

        "proChck_GSP_OVT_CertSts": formData.genOverVoltageCertificate,

        "proChck_GSP_OVT_ObsVal": formData.genOverVoltageObserved,

        "proChck_GSP_OVT_Sts": formData.genOverVoltageStatus,

        "proChck_GSP_UVT_CDate": formatDateOrNull(formData.genUnderVoltageCalibrationDate),

        "proChck_GSP_UVT_CertSts": formData.genUnderVoltageCertificate,

        "proChck_GSP_UVT_ObsVal": formData.genUnderVoltageObserved,

        "proChck_GSP_UVT_Sts": formData.genUnderVoltageStatus,

        "proChck_GSP_RPR_CDate": formatDateOrNull(formData.reversePowerCalibrationDate),

        "proChck_GSP_RPR_CertSts": formData.reversePowerCertificate,

        "proChck_GSP_RPR_ObsVal": formData.reversePowerObserved,

        "proChck_GSP_RPR_Sts": formData.reversePowerStatus,

        "proChck_GSP_WTA_CDate": formatDateOrNull(formData.windingTempCalibrationDate),

        "proChck_GSP_WTA_CertSts": formData.windingTempCertificate,

        "proChck_GSP_WTA_ObsVal": formData.windingTempObserved,

        "proChck_GSP_WTA_Sts": formData.windingTempStatus,

        // Section 6: Instrumentation

        "instrmtn_KWM_ops": nullIfEmpty(formData.kwMeterOps),

        "instrmtn_KWM_CDate": formatDateOrNull(formData.kwMeterCalibrationDate),

        "instrmtn_KWM_CCertSts": defaultCertificateStatus(formData.kwMeterCertificate),

        "instrmtn_KWM_Sts": formData.kwMeterStatus,

        "instrmtn_VM_ops": nullIfEmpty(formData.voltmeterOps),

        "instrmtn_VM_CDate": formatDateOrNull(formData.voltmeterCalibrationDate),

        "instrmtn_VM_CCertSts": defaultCertificateStatus(formData.voltmeterCertificate),

        "instrmtn_VM_Sts": formData.voltmeterStatus,

        "instrmtn_AMM_ops": nullIfEmpty(formData.ammeterOps),

        "instrmtn_AMM_CDate": formatDateOrNull(formData.ammeterCalibrationDate),

        "instrmtn_AMM_CCertSts": defaultCertificateStatus(formData.ammeterCertificate),

        "instrmtn_AMM_Sts": formData.ammeterStatus,

        "instrmtn_FM_ops": nullIfEmpty(formData.frequencyMeterOps),

        "instrmtn_FM_CDate": formatDateOrNull(formData.frequencyMeterCalibrationDate),

        "instrmtn_FM_CCertSts": defaultCertificateStatus(formData.frequencyMeterCertificate),

        "instrmtn_FM_Sts": formData.frequencyMeterStatus,

        "instrmtn_PFM_ops": nullIfEmpty(formData.powerFactorMeterOps),

        "instrmtn_PFM_CDate": formatDateOrNull(formData.powerFactorMeterCalibrationDate),

        "instrmtn_PFM_CCertSts": defaultCertificateStatus(formData.powerFactorMeterCertificate),

        "instrmtn_PFM_Sts": formData.powerFactorMeterStatus,

        // Section 7: Miscellaneous Checks - Resistance Checks

        "misc_main_stator": formData.mainStatorResistance,

        "misc_main_rotor": formData.mainRotorResistance,

        "misc_exciter_stator": formData.exciterStatorResistance,

        "misc_exciter_rotor": formData.exciterRotorResistance,

        // Section 7: Miscellaneous Checks - Condition/Status Checks

        "misc_condition_slip": formData.slipRingCondition,

        "misc_condition_zinc": formData.zincPlugsCondition,

        "misc_anti_condensation": formData.antiCondensationHeater,

        "misc_GTTT_trial_status": formData.gtttTrialStatus,

        "internal_communication": formData.internalCommunication,

        "misc_lighting_compartment": formData.lightingCompartment,

        "misc_ventilation": formData.ventilationCompartment,

        "misc_generator": formData.generatorEarthed,

        "misc_loose": formData.looseCablesSecured,

        "misc_generatr_Swbd": formData.terminalBoxSecured,

        "misc_generatr_supply_brkr": formData.supplyBreakerOperates,

        // Section 7: Miscellaneous Checks - Temperature/Routine Checks

        "misc_ambient_temperature": formData.ambientTemperatureStart,

        "misc_temprtre_rise": formData.temperatureRiseTwoHours,

        "misc_routine_cooler_on": formatDateOrNull(formData.coolerRoutineDate),

        "misc_temprtre_cooler_inlet": formData.coolerInletTemperature,

        "misc_temprtre_cooler_outlet": formData.coolerOutletTemperature,

        "misc_stator_winding_temprtr": formData.statorWindingTemperature,

        // Section 8: Speed Control Test - WITH PYM (RCHM) 'ON'

        "sst_PhmON_0_init_speed": formData.pymOn0InitialSpeed,

        "sst_PhmON_0_final_speed": formData.pymOn0FinalSpeed,

        "sst_PhmON_0_freq_Modln": formData.pymOn0FrequencyModulation,

        "sst_PhmON_25_init_speed": formData.pymOn25InitialSpeed,

        "sst_PhmON_25_final_speed": formData.pymOn25FinalSpeed,

        "sst_PhmON_25_freq_Modln": formData.pymOn25FrequencyModulation,

        "sst_PhmON_50_init_speed": formData.pymOn50InitialSpeed,

        "sst_PhmON_50_final_speed": formData.pymOn50FinalSpeed,

        "sst_PhmON_50_freq_Modln": formData.pymOn50FrequencyModulation,

        "sst_PhmON_75_init_speed": formData.pymOn75InitialSpeed,

        "sst_PhmON_75_final_speed": formData.pymOn75FinalSpeed,

        "sst_PhmON_75_freq_Modln": formData.pymOn75FrequencyModulation,

        "sst_PhmON_110_init_speed": formData.pymOn110InitialSpeed,

        "sst_PhmON_110_final_speed": formData.pymOn110FinalSpeed,

        "sst_PhmON_110_freq_Modln": formData.pymOn110FrequencyModulation,

        "sst_PhmOFF_0_init_speed": formData.pymOff0InitialSpeed,

        "sst_PhmOFF_0_final_speed": formData.pymOff0FinalSpeed,

        "sst_PhmOFF_0_freq_Modln": formData.pymOff0FrequencyModulation,

        "sst_PhmOFF_25_init_speed": formData.pymOff25InitialSpeed,

        "sst_PhmOFF_25_final_speed": formData.pymOff25FinalSpeed,

        "sst_PhmOFF_25_freq_Modln": formData.pymOff25FrequencyModulation,

        "sst_PhmOFF_50_init_speed": formData.pymOff50InitialSpeed,

        "sst_PhmOFF_50_final_speed": formData.pymOff50FinalSpeed,

        "sst_PhmOFF_50_freq_Modln": formData.pymOff50FrequencyModulation,

        "sst_PhmOFF_75_init_speed": formData.pymOff75InitialSpeed,

        "sst_PhmOFF_75_final_speed": formData.pymOff75FinalSpeed,

        "sst_PhmOFF_75_freq_Modln": formData.pymOff75FrequencyModulation,

        "sst_PhmOFF_110_init_speed": formData.pymOff110InitialSpeed,

        "sst_PhmOFF_110_final_speed": formData.pymOff110FinalSpeed,

        "sst_PhmOFF_110_freq_Modln": formData.pymOff110FrequencyModulation,

        "sst_PhmOFF_100to0_init_speed": formData.pymOffGovernorDroopInitialSpeed,

        "sst_PhmOFF_100to0_final_speed": formData.pymOffGovernorDroopFinalSpeed,

        "sst_PhmOFF_100to0_governor_droop": formData.pymOffGovernorDroopValue,

        "sst_PhmOFF_100to0_freq_Modln": formData.pymOffGovernorDroopFrequencyModulation,

        // Section 8: Speed Control Test - (b) Transient Test - PYM (RCHM) 'ON'

        "trnsntTstPhmON_0x25_init_speed": formData.transientOn0to25InitialSpeed,

        "trnsntTstPhmON_0x25_mtry_speed": formData.transientOn0to25MomentarySpeed,

        "trnsntTstPhmON_0x25_final_speed": formData.transientOn0to25FinalSpeed,

        "trnsntTstPhmON_0x25_peak_obs": formData.transientOn0to25PeakObserved,

        "trnsntTstPhmON_0x25_recov_Obs": formData.transientOn0to25RecoveryObserved,

        "trnsntTstPhmON_25x0_init_speed": formData.transientOn25to0InitialSpeed,

        "trnsntTstPhmON_25x0_mtry_speed": formData.transientOn25to0MomentarySpeed,

        "trnsntTstPhmON_25x0_final_speed": formData.transientOn25to0FinalSpeed,

        "trnsntTstPhmON_25x0_peak_obs": formData.transientOn25to0PeakObserved,

        "trnsntTstPhmON_25x0_recov_Obs": formData.transientOn25to0RecoveryObserved,

        "trnsntTstPhmON_0x50_init_speed": formData.transientOn0to50InitialSpeed,

        "trnsntTstPhmON_0x50_mtry_speed": formData.transientOn0to50MomentarySpeed,

        "trnsntTstPhmON_0x50_final_speed": formData.transientOn0to50FinalSpeed,

        "trnsntTstPhmON_0x50_peak_obs": formData.transientOn0to50PeakObserved,

        "trnsntTstPhmON_0x50_recov_Obs": formData.transientOn0to50RecoveryObserved,

        "trnsntTstPhmON_50x0_init_speed": formData.transientOn50to0InitialSpeed,

        "trnsntTstPhmON_50x0_mtry_speed": formData.transientOn50to0MomentarySpeed,

        "trnsntTstPhmON_50x0_final_speed": formData.transientOn50to0FinalSpeed,

        "trnsntTstPhmON_50x0_peak_obs": formData.transientOn50to0PeakObserved,

        "trnsntTstPhmON_50x0_recov_Obs": formData.transientOn50to0RecoveryObserved,

        "trnsntTstPhmON_0x75_init_speed": formData.transientOn0to75InitialSpeed,

        "trnsntTstPhmON_0x75_mtry_speed": formData.transientOn0to75MomentarySpeed,

        "trnsntTstPhmON_0x75_final_speed": formData.transientOn0to75FinalSpeed,

        "trnsntTstPhmON_0x75_peak_obs": formData.transientOn0to75PeakObserved,

        "trnsntTstPhmON_0x75_recov_Obs": formData.transientOn0to75RecoveryObserved,

        "trnsntTstPhmON_75x0_init_speed": formData.transientOn75to0InitialSpeed,

        "trnsntTstPhmON_75x0_mtry_speed": formData.transientOn75to0MomentarySpeed,

        "trnsntTstPhmON_75x0_final_speed": formData.transientOn75to0FinalSpeed,

        "trnsntTstPhmON_75x0_peak_obs": formData.transientOn75to0PeakObserved,

        "trnsntTstPhmON_75x0_recov_Obs": formData.transientOn75to0RecoveryObserved,

        "trnsntTstPhmON_0x100_init_speed": formData.transientOn0to100InitialSpeed,

        "trnsntTstPhmON_0x100_mtry_speed": formData.transientOn0to100MomentarySpeed,

        "trnsntTstPhmON_0x100_final_speed": formData.transientOn0to100FinalSpeed,

        "trnsntTstPhmON_0x100_peak_obs": formData.transientOn0to100PeakObserved,

        "trnsntTstPhmON_0x100_recov_Obs": formData.transientOn0to100RecoveryObserved,

        "trnsntTstPhmON_100x0_init_speed": formData.transientOn100to0InitialSpeed,

        "trnsntTstPhmON_100x0_mtry_speed": formData.transientOn100to0MomentarySpeed,

        "trnsntTstPhmON_100x0_final_speed": formData.transientOn100to0FinalSpeed,

        "trnsntTstPhmON_100x0_peak_obs": formData.transientOn100to0PeakObserved,

        "trnsntTstPhmON_100x0_recov_Obs": formData.transientOn100to0RecoveryObserved,

        // Section 8: Speed Control Test - (b) Transient Test - PYM (RCHM) 'OFF'

        "trnsntTstPhmOFF_0x25_init_speed": formData.transientOff0to25InitialSpeed,

        "trnsntTstPhmOFF_0x25_mtry_speed": formData.transientOff0to25MomentarySpeed,

        "trnsntTstPhmOFF_0x25_final_speed": formData.transientOff0to25FinalSpeed,

        "trnsntTstPhmOFF_0x25_peak_obs": formData.transientOff0to25PeakObserved,

        "trnsntTstPhmOFF_0x25_recov_Obs": formData.transientOff0to25RecoveryObserved,

        "trnsntTstPhmOFF_25x0_init_speed": formData.transientOff25to0InitialSpeed,

        "trnsntTstPhmOFF_25x0_mtry_speed": formData.transientOff25to0MomentarySpeed,

        "trnsntTstPhmOFF_25x0_final_speed": formData.transientOff25to0FinalSpeed,

        "trnsntTstPhmOFF_25x0_peak_obs": formData.transientOff25to0PeakObserved,

        "trnsntTstPhmOFF_25x0_recov_Obs": formData.transientOff25to0RecoveryObserved,

        "trnsntTstPhmOFF_0x50_init_speed": formData.transientOff0to50InitialSpeed,

        "trnsntTstPhmOFF_0x50_mtry_speed": formData.transientOff0to50MomentarySpeed,

        "trnsntTstPhmOFF_0x50_final_speed": formData.transientOff0to50FinalSpeed,

        "trnsntTstPhmOFF_0x50_peak_obs": formData.transientOff0to50PeakObserved,

        "trnsntTstPhmOFF_0x50_recov_Obs": formData.transientOff0to50RecoveryObserved,

        "trnsntTstPhmOFF_50x0_init_speed": formData.transientOff50to0InitialSpeed,

        "trnsntTstPhmOFF_50x0_mtry_speed": formData.transientOff50to0MomentarySpeed,

        "trnsntTstPhmOFF_50x0_final_speed": formData.transientOff50to0FinalSpeed,

        "trnsntTstPhmOFF_50x0_peak_obs": formData.transientOff50to0PeakObserved,

        "trnsntTstPhmOFF_50x0_recov_Obs": formData.transientOff50to0RecoveryObserved,

        "trnsntTstPhmOFF_0x75_init_speed": formData.transientOff0to75InitialSpeed,

        "trnsntTstPhmOFF_0x75_mtry_speed": formData.transientOff0to75MomentarySpeed,

        "trnsntTstPhmOFF_0x75_final_speed": formData.transientOff0to75FinalSpeed,

        "trnsntTstPhmOFF_0x75_peak_obs": formData.transientOff0to75PeakObserved,

        "trnsntTstPhmOFF_0x75_recov_Obs": formData.transientOff0to75RecoveryObserved,

        "trnsntTstPhmOFF_75x0_init_speed": formData.transientOff75to0InitialSpeed,

        "trnsntTstPhmOFF_75x0_mtry_speed": formData.transientOff75to0MomentarySpeed,

        "trnsntTstPhmOFF_75x0_final_speed": formData.transientOff75to0FinalSpeed,

        "trnsntTstPhmOFF_75x0_peak_obs": formData.transientOff75to0PeakObserved,

        "trnsntTstPhmOFF_75x0_recov_Obs": formData.transientOff75to0RecoveryObserved,

        "trnsntTstPhmOFF_0x100_init_speed": formData.transientOff0to100InitialSpeed,

        "trnsntTstPhmOFF_0x100_mtry_speed": formData.transientOff0to100MomentarySpeed,

        "trnsntTstPhmOFF_0x100_final_speed": formData.transientOff0to100FinalSpeed,

        "trnsntTstPhmOFF_0x100_peak_obs": formData.transientOff0to100PeakObserved,

        "trnsntTstPhmOFF_0x100_recov_Obs": formData.transientOff0to100RecoveryObserved,

        "trnsntTstPhmOFF_100x0_init_speed": formData.transientOff100to0InitialSpeed,

        "trnsntTstPhmOFF_100x0_mtry_speed": formData.transientOff100to0MomentarySpeed,

        "trnsntTstPhmOFF_100x0_final_speed": formData.transientOff100to0FinalSpeed,

        "trnsntTstPhmOFF_100x0_peak_obs": formData.transientOff100to0PeakObserved,

        "trnsntTstPhmOFF_100x0_recov_Obs": formData.transientOff100to0RecoveryObserved,

        // Section 8: Speed Control Test - (c) Governor Range

        "govrnr_range_0_measured": formData.governorRange0Frequency,

        "govrnr_range_0_remark": formData.governorRange0Remark,

        "govrnr_range_100_measured": formData.governorRange100Frequency,

        "govrnr_range_100_remark": formData.governorRange100Remark,

        // Section 8: Speed Control Test - (d) Rate Affected by Governor Motor

        "govrnr_motor_0_up": formData.governorRate0Up,

        "govrnr_motor_0_down": formData.governorRate0Down,

        "govrnr_motor_100_up": formData.governorRate100Up,

        "govrnr_motor_100_down": formData.governorRate100Down,

        // Section 9: Voltage Control Test - (a) Steady State Test

        "vsst_0_val": formData.voltageControl0kW,

        "vsst_0_ObsVolt": formData.voltageControl0VoltsObserve,

        "vsst_0_PF": formData.voltageControl0PF,

        "vsst_0_Volt_Modln": formData.voltageControl0Modulation,

        "vsst_25_val": formData.voltageControl25kW,

        "vsst_25_ObsVolt": formData.voltageControl25VoltsObserve,

        "vsst_25_PF": formData.voltageControl25PF,

        "vsst_25_Volt_Modln": formData.voltageControl25Modulation,

        "vsst_50_val": formData.voltageControl50kW,

        "vsst_50_ObsVolt": formData.voltageControl50VoltsObserve,

        "vsst_50_PF": formData.voltageControl50PF,

        "vsst_50_Volt_Modln": formData.voltageControl50Modulation,

        "vsst_75_val": formData.voltageControl75kW,

        "vsst_75_ObsVolt": formData.voltageControl75VoltsObserve,

        "vsst_75_PF": formData.voltageControl75PF,

        "vsst_75_Volt_Modln": formData.voltageControl75Modulation,

        "vsst_100_val": formData.voltageControl100kW,

        "vsst_100_ObsVolt": formData.voltageControl100VoltsObserve,

        "vsst_100_PF": formData.voltageControl100PF,

        "vsst_100_Volt_Modln": formData.voltageControl100Modulation,

        // Section 9: Voltage Control Test - (b) Transient Test

        "vtrt_0x25_init_volt": formData.voltageTransient0to25InitialVoltage,

        "vtrt_0x25_memtry_volt": formData.voltageTransient0to25MomentaryVoltage,

        "vtrt_0x25_final_volt": formData.voltageTransient0to25FinalVoltage,

        "vtrt_0x25_peak_obs": formData.voltageTransient0to25PeakObserved,

        "vtrt_0x25_recov_Obs": formData.voltageTransient0to25RecoveryObserved,

        "vtrt_25x0_init_volt": formData.voltageTransient25to0InitialVoltage,

        "vtrt_25x0_memtry_volt": formData.voltageTransient25to0MomentaryVoltage,

        "vtrt_25x0_final_volt": formData.voltageTransient25to0FinalVoltage,

        "vtrt_25x0_peak_obs": formData.voltageTransient25to0PeakObserved,

        "vtrt_25x0_recov_Obs": formData.voltageTransient25to0RecoveryObserved,

        "vtrt_0x50_init_volt": formData.voltageTransient0to50InitialVoltage,

        "vtrt_0x50_memtry_volt": formData.voltageTransient0to50MomentaryVoltage,

        "vtrt_0x50_final_volt": formData.voltageTransient0to50FinalVoltage,

        "vtrt_0x50_peak_obs": formData.voltageTransient0to50PeakObserved,

        "vtrt_0x50_recov_Obs": formData.voltageTransient0to50RecoveryObserved,

        "vtrt_50x0_init_volt": formData.voltageTransient50to0InitialVoltage,

        "vtrt_50x0_memtry_volt": formData.voltageTransient50to0MomentaryVoltage,

        "vtrt_50x0_final_volt": formData.voltageTransient50to0FinalVoltage,

        "vtrt_50x0_peak_obs": formData.voltageTransient50to0PeakObserved,

        "vtrt_50x0_recov_Obs": formData.voltageTransient50to0RecoveryObserved,

        "vtrt_0x75_init_volt": formData.voltageTransient0to75InitialVoltage,

        "vtrt_0x75_memtry_volt": formData.voltageTransient0to75MomentaryVoltage,

        "vtrt_0x75_final_volt": formData.voltageTransient0to75FinalVoltage,

        "vtrt_0x75_peak_obs": formData.voltageTransient0to75PeakObserved,

        "vtrt_0x75_recov_Obs": formData.voltageTransient0to75RecoveryObserved,

        "vtrt_75x0_init_volt": formData.voltageTransient75to0InitialVoltage,

        "vtrt_75x0_memtry_volt": formData.voltageTransient75to0MomentaryVoltage,

        "vtrt_75x0_final_volt": formData.voltageTransient75to0FinalVoltage,

        "vtrt_75x0_peak_obs": formData.voltageTransient75to0PeakObserved,

        "vtrt_75x0_recov_Obs": formData.voltageTransient75to0RecoveryObserved,

        "vtrt_0x100_init_volt": formData.voltageTransient0to100InitialVoltage,

        "vtrt_0x100_memtry_volt": formData.voltageTransient0to100MomentaryVoltage,

        "vtrt_0x100_final_volt": formData.voltageTransient0to100FinalVoltage,

        "vtrt_0x100_peak_obs": formData.voltageTransient0to100PeakObserved,

        "vtrt_0x100_recov_Obs": formData.voltageTransient0to100RecoveryObserved,

        "vtrt_100x0_init_volt": formData.voltageTransient100to0InitialVoltage,

        "vtrt_100x0_memtry_volt": formData.voltageTransient100to0MomentaryVoltage,

        "vtrt_100x0_final_volt": formData.voltageTransient100to0FinalVoltage,

        "vtrt_100x0_peak_obs": formData.voltageTransient100to0PeakObserved,

        "vtrt_100x0_recov_Obs": formData.voltageTransient100to0RecoveryObserved,

        // Section 9: Voltage Control Test - (b) Transient Test - Plus M (Motor) Tests

        "vtrt_0M_init_volt": formData.voltageTransient0plusMInitialVoltage,

        "vtrt_0M_memtry_volt": formData.voltageTransient0plusMMomentaryVoltage,

        "vtrt_0M_final_volt": formData.voltageTransient0plusMFinalVoltage,

        "vtrt_0M_peak_obs": formData.voltageTransient0plusMPeakObserved,

        "vtrt_0M_recov_Obs": formData.voltageTransient0plusMRecoveryObserved,

        "vtrt_25M_init_volt": formData.voltageTransient25plusMInitialVoltage,

        "vtrt_25M_memtry_volt": formData.voltageTransient25plusMMomentaryVoltage,

        "vtrt_25M_final_volt": formData.voltageTransient25plusMFinalVoltage,

        "vtrt_25M_peak_obs": formData.voltageTransient25plusMPeakObserved,

        "vtrt_25M_recov_Obs": formData.voltageTransient25plusMRecoveryObserved,

        "vtrt_50M_init_volt": formData.voltageTransient50plusMInitialVoltage,

        "vtrt_50M_memtry_volt": formData.voltageTransient50plusMMomentaryVoltage,

        "vtrt_50M_final_volt": formData.voltageTransient50plusMFinalVoltage,

        "vtrt_50M_peak_obs": formData.voltageTransient50plusMPeakObserved,

        "vtrt_50M_recov_Obs": formData.voltageTransient50plusMRecoveryObserved,

        "vtrt_75M_init_volt": formData.voltageTransient75plusMInitialVoltage,

        "vtrt_75M_memtry_volt": formData.voltageTransient75plusMMomentaryVoltage,

        "vtrt_75M_final_volt": formData.voltageTransient75plusMFinalVoltage,

        "vtrt_75M_peak_obs": formData.voltageTransient75plusMPeakObserved,

        "vtrt_75M_recov_Obs": formData.voltageTransient75plusMRecoveryObserved,

        "vtrt_85M_init_volt": formData.voltageTransient85plusMInitialVoltage,

        "vtrt_85M_memtry_volt": formData.voltageTransient85plusMMomentaryVoltage,

        "vtrt_85M_final_volt": formData.voltageTransient85plusMFinalVoltage,

        "vtrt_85M_peak_obs": formData.voltageTransient85plusMPeakObserved,

        "vtrt_85M_recov_Obs": formData.voltageTransient85plusMRecoveryObserved,

        // Section 9: Voltage Control Test - (c) Voltage Balance

        "voltBalTst_0_RY": formData.voltageBalance0RY,

        "voltBalTst_0_YB": formData.voltageBalance0YB,

        "voltBalTst_0_BR": formData.voltageBalance0BR,

        "voltBalTst_100_RY": formData.voltageBalance100RY,

        "voltBalTst_100_YB": formData.voltageBalance100YB,

        "voltBalTst_100_BR": formData.voltageBalance100BR,

        // Section 9: Voltage Control Test - (d) Voltage Range

        "voltRangeAVR_0_swtchbrd_lowest_limit": formData.voltageRangeAVR0Lowest,

        "voltRangeAVR_0_swtchbrd_highest_limit": formData.voltageRangeAVR0Highest,

        "voltRangeAVR_0_status": formData.voltageRangeAVR0Status,

        "voltRangeAVR_0_Remarks": formData.voltageRangeAVR0Remarks,

        "voltRangeAVR_100_swtchbrd_lowest_limit": formData.voltageRangeControl100Lowest,

        "voltRangeAVR_100_swtchbrd_highest_limit": formData.voltageRangeControl100Highest,

        "voltRangeAVR_100_status": formData.voltageRangeControl100Status,

        "voltRangeAVR_100_Remarks": formData.voltageRangeControl100Remarks,

        "voltRangeHC_0_swtchbrd_lowest_limit": formData.voltageRangeHand0Lowest,

        "voltRangeHC_0_swtchbrd_highest_limit": formData.voltageRangeHand0Highest,

        "voltRangeHC_0_status": formData.voltageRangeHand0Status,

        "voltRangeHC_0_Remarks": formData.voltageRangeHand0Remarks,

        "voltRangeHC_100_swtchbrd_lowest_limit": formData.voltageRangeHandControl100Lowest,

        "voltRangeHC_100_swtchbrd_highest_limit": formData.voltageRangeHandControl100Highest,

        "voltRangeHC_100_status": formData.voltageRangeHandControl100Status,

        "voltRangeHC_100_Remarks": formData.voltageRangeHandControl100Remarks,

        // Section 9: Voltage Control Test - (e) Voltage Waveform Harmonic Content

        "voltwavHorCont_max": formData.voltageHarmonicContent

      };

      

      // Make API call directly to get the ID for route config

      this.apiService.post('etma/loadtrial/', payload).subscribe({

        next: (response: any) => {

          console.log('🚀 GTG FORM SAVE - API Response:', response);

          

          if (response.status === 200 || response.status === 201) {

            // Update reportData with the new ID

            if (response.data && response.data.id) {

              this.reportData = { ...this.reportData, id: response.data.id };

              console.log('🚀 GTG FORM SAVE - Updated reportData.id:', this.reportData.id);

            }

            

            // Show success message

            this.toastService.showSuccess('GTG Load Trial Report saved successfully');

            

            // Emit the response data to parent component

            this.formSubmit.emit(response.data);

            

            // If this was for route config, show the popup now

            if (isForRouteConfig) {

              console.log('🚀 GTG FORM SAVE - Showing route config popup after save');

              console.log('🚀 GTG FORM SAVE - Updated reportData.id:', this.reportData.id);

              console.log('🚀 GTG FORM SAVE - isForModal:', isForModal);
              
              // Add a small delay to ensure the reportData.id is properly set
              setTimeout(() => {
                console.log('🚀 GTG FORM SAVE - Delayed showing route config popup, reportData.id:', this.reportData.id);
                // Show the route config popup directly without toggling
                this.showRouteConfigPopup = true;

                if (isForModal) {
                  console.log('🚀 GTG FORM SAVE - Setting showRouteConfigModal to true');
                  this.showRouteConfigModal = true;
                }
              }, 100); // 100ms delay
            }

          } else {

            this.toastService.showError('Failed to save GTG Load Trial Report');

          }

        },

        error: (error) => {

          console.error('🚀 GTG FORM SAVE - API Error:', error);

          this.toastService.showError('Error saving GTG Load Trial Report');

        }

      });

    } else {

      this.markFormGroupTouched(this.gtgForm);

      this.toastService.showError('Please fill in all required fields');

    }

  }



  // Method to perform actual save draft

  private performSaveDraft(isForRouteConfig: boolean = false, isForModal: boolean = false): void {

    const formData = this.gtgForm.value;

    

    // Helper function to format date or return null for empty values

    const formatDateOrNull = (dateValue: any): string | null => {

      if (!dateValue || dateValue === '' || dateValue === null || dateValue === undefined) {

        return null;

      }

      // If it's already in YYYY-MM-DD format, return as is

      if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {

        return dateValue;

      }

      // If it's a Date object, format it

      if (dateValue instanceof Date) {

        return dateValue.toISOString().split('T')[0];

      }

      // For any other format, try to parse and format

      try {

        const date = new Date(dateValue);

        if (!isNaN(date.getTime())) {

          return date.toISOString().split('T')[0];

        }

      } catch (e) {

        console.warn('Invalid date format:', dateValue);

      }

      return null;

    };

    

    // Helper function to return null for empty strings (for required fields)

    const nullIfEmpty = (value: any): string | null => {

      if (!value || value === '' || value === null || value === undefined) {

        return null;

      }

      return value;

    };



    // Helper function to return "No" for empty certificate status fields

    const defaultCertificateStatus = (value: any): string => {

      if (!value || value === '' || value === null || value === undefined) {

        return "No";

      }

      return value;

    };



    

    const payload = {

      // Add draft_status key based on submission type
      "id": this.gtgForm.get('id')?.value,

      "draft_status": 'draft',

      "Presented_by": formData.presentedBy,

      "trial_date": formatDateOrNull(formData.trial_date),

      "occation_of_trial": formData.occasionOfTrials,

      "occationOfCurrTrial": formData.occasionOfCurrentTrial,

      "lastTrialDate": formatDateOrNull(formData.dateOfLastTrial),

      "ship": this.selectedShipId || formData.ship,

      "proposal_reference": formData.proposalReference,

      "file_reference": formData.fileReference,

      "referanceDocID": formData.referenceDocument,

      "equipment_id": formData.equipmentId,

      // Equipment Details - Engine

      "engn_make": formData.engineMake,

      "engn_model_SrNo": formData.engineModelSerial,

      "engn_rpm_val": formData.engineRpm,

      // Equipment Details - Governor

      "govnr_make": formData.governorMake,

      "govnr_model_SrNo": formData.governorModelSerial,

      "govnr_type": formData.governorType,

      // Equipment Details - Alternator

      "altnr_make": formData.alternatorMakeRating,

      "altnr_model_SrNo": formData.alternatorModelSerial,

      "altnr_type": formData.alternatorType,

      "altnr_RatedVoltage": formData.alternatorRatedVoltage,

      "altnr_RatedFrequency": formData.alternatorRatedFrequency,

      "altnr_RatedVal": formData.alternatorRatedKvaKw,

      "altnr_RatedCurrentVal": formData.alternatorRatedCurrent,

      "altnr_BearingNo": formData.alternatorBearingNumber,

      // Equipment Details - AVR

      "avr_make_type": formData.avrMakeType,

      "avr_model_SrNo": formData.avrModelSerial,

      // Equipment Details - Supply Breaker

      "spplyBrkr_make": formData.supplyBreakerMake,

      "spplyBrkr_model_srno": formData.supplyBreakerModelSerial,

      "spplyBrkr_RatedCpcty": formData.supplyBreakerRatedCapacity,

      // Section 4: Insulation Resistance

      "ir_gnrtr_hot": formData.generatorHot1,

      "ir_gnrtr_cold": formData.generatorCold1,

      "ir_swtchbrd": formData.switchboard1,

      "ir_gnrtr_cbl": formData.generatorCable1,

      "ir_insltn_brkr": formData.insulationBreaker1,

      // Section 5: Protection Checks - Breaker Protection

      "proChck_BP_OV_CDate": formatDateOrNull(formData.overVoltageCalibrationDate),

      "proChck_BP_OV_CertSts": formData.overVoltageCertificate,

      "proChck_BP_OV_ObsVal": formData.overVoltageObserved,

      "proChck_BP_OV_Sts": formData.overVoltageStatus,

      "proChck_BP_UV_CDate": formatDateOrNull(formData.underVoltageCalibrationDate),

      "proChck_BP_UV_CertSts": formData.underVoltageCertificate,

      "proChck_BP_UV_ObsVal": formData.underVoltageObserved,

      "proChck_BP_UV_Sts": formData.underVoltageStatus,

      "proChck_BP_OVLD_CDate": formatDateOrNull(formData.overloadCalibrationDate),

      "proChck_BP_OVLD_CertSts": formData.overloadCertificate,

      "proChck_BP_OVLD_ObsVal": formData.overloadObserved,

      "proChck_BP_OVLD_Sts": formData.overloadStatus,

      // Section 5: Protection Checks - Generator/Switchboard Protection

      "proChck_GSP_OVT_CDate": formatDateOrNull(formData.genOverVoltageCalibrationDate),

      "proChck_GSP_OVT_CertSts": formData.genOverVoltageCertificate,

      "proChck_GSP_OVT_ObsVal": formData.genOverVoltageObserved,

      "proChck_GSP_OVT_Sts": formData.genOverVoltageStatus,

      "proChck_GSP_UVT_CDate": formatDateOrNull(formData.genUnderVoltageCalibrationDate),

      "proChck_GSP_UVT_CertSts": formData.genUnderVoltageCertificate,

      "proChck_GSP_UVT_ObsVal": formData.genUnderVoltageObserved,

      "proChck_GSP_UVT_Sts": formData.genUnderVoltageStatus,

      "proChck_GSP_RPR_CDate": formatDateOrNull(formData.reversePowerCalibrationDate),

      "proChck_GSP_RPR_CertSts": formData.reversePowerCertificate,

      "proChck_GSP_RPR_ObsVal": formData.reversePowerObserved,

      "proChck_GSP_RPR_Sts": formData.reversePowerStatus,

      "proChck_GSP_WTA_CDate": formatDateOrNull(formData.windingTempCalibrationDate),

      "proChck_GSP_WTA_CertSts": formData.windingTempCertificate,

      "proChck_GSP_WTA_ObsVal": formData.windingTempObserved,

      "proChck_GSP_WTA_Sts": formData.windingTempStatus,

      // Section 6: Instrumentation

      "instrmtn_KWM_ops": nullIfEmpty(formData.kwMeterOps),

      "instrmtn_KWM_CDate": formatDateOrNull(formData.kwMeterCalibrationDate),

      "instrmtn_KWM_CCertSts": defaultCertificateStatus(formData.kwMeterCertificate),

      "instrmtn_KWM_Sts": formData.kwMeterStatus,

      "instrmtn_VM_ops": nullIfEmpty(formData.voltmeterOps),

      "instrmtn_VM_CDate": formatDateOrNull(formData.voltmeterCalibrationDate),

      "instrmtn_VM_CCertSts": defaultCertificateStatus(formData.voltmeterCertificate),

      "instrmtn_VM_Sts": formData.voltmeterStatus,

      "instrmtn_AMM_ops": nullIfEmpty(formData.ammeterOps),

      "instrmtn_AMM_CDate": formatDateOrNull(formData.ammeterCalibrationDate),

      "instrmtn_AMM_CCertSts": defaultCertificateStatus(formData.ammeterCertificate),

      "instrmtn_AMM_Sts": formData.ammeterStatus,

      "instrmtn_FM_ops": nullIfEmpty(formData.frequencyMeterOps),

      "instrmtn_FM_CDate": formatDateOrNull(formData.frequencyMeterCalibrationDate),

      "instrmtn_FM_CCertSts": defaultCertificateStatus(formData.frequencyMeterCertificate),

      "instrmtn_FM_Sts": formData.frequencyMeterStatus,

      "instrmtn_PFM_ops": nullIfEmpty(formData.powerFactorMeterOps),

      "instrmtn_PFM_CDate": formatDateOrNull(formData.powerFactorMeterCalibrationDate),

      "instrmtn_PFM_CCertSts": defaultCertificateStatus(formData.powerFactorMeterCertificate),

      "instrmtn_PFM_Sts": formData.powerFactorMeterStatus,

      // Section 7: Miscellaneous Checks - Generator/Switchboard

      "misc_generatr_Swbd": formData.terminalBoxSecured,

      "misc_generatr_supply_brkr": formData.supplyBreakerOperates,

      // Section 7: Miscellaneous Checks - Temperature/Routine Checks

      "misc_ambient_temperature": formData.ambientTemperatureStart,

      "misc_temprtre_rise": formData.temperatureRiseTwoHours,

      "misc_routine_cooler_on": formatDateOrNull(formData.coolerRoutineDate),

      "misc_temprtre_cooler_inlet": formData.coolerInletTemperature,

      "misc_temprtre_cooler_outlet": formData.coolerOutletTemperature,

      "misc_stator_winding_temprtr": formData.statorWindingTemperature,

      // Section 8: Speed Control Test - WITH PYM (RCHM) 'ON'

      "sst_PhmON_0_init_speed": formData.pymOn0InitialSpeed,

      "sst_PhmON_0_final_speed": formData.pymOn0FinalSpeed,

      "sst_PhmON_0_freq_Modln": formData.pymOn0FrequencyModulation,

      "sst_PhmON_25_init_speed": formData.pymOn25InitialSpeed,

      "sst_PhmON_25_final_speed": formData.pymOn25FinalSpeed,

      "sst_PhmON_25_freq_Modln": formData.pymOn25FrequencyModulation,

      "sst_PhmON_50_init_speed": formData.pymOn50InitialSpeed,

      "sst_PhmON_50_final_speed": formData.pymOn50FinalSpeed,

      "sst_PhmON_50_freq_Modln": formData.pymOn50FrequencyModulation,

      "sst_PhmON_75_init_speed": formData.pymOn75InitialSpeed,

      "sst_PhmON_75_final_speed": formData.pymOn75FinalSpeed,

      "sst_PhmON_75_freq_Modln": formData.pymOn75FrequencyModulation,

      "sst_PhmON_110_init_speed": formData.pymOn110InitialSpeed,

      "sst_PhmON_110_final_speed": formData.pymOn110FinalSpeed,

      "sst_PhmON_110_freq_Modln": formData.pymOn110FrequencyModulation,

      "sst_PhmOFF_0_init_speed": formData.pymOff0InitialSpeed,

      "sst_PhmOFF_0_final_speed": formData.pymOff0FinalSpeed,

      "sst_PhmOFF_0_freq_Modln": formData.pymOff0FrequencyModulation,

      "sst_PhmOFF_25_init_speed": formData.pymOff25InitialSpeed,

      "sst_PhmOFF_25_final_speed": formData.pymOff25FinalSpeed,

      "sst_PhmOFF_25_freq_Modln": formData.pymOff25FrequencyModulation,

      "sst_PhmOFF_50_init_speed": formData.pymOff50InitialSpeed,

      "sst_PhmOFF_50_final_speed": formData.pymOff50FinalSpeed,

      "sst_PhmOFF_50_freq_Modln": formData.pymOff50FrequencyModulation,

      "sst_PhmOFF_75_init_speed": formData.pymOff75InitialSpeed,

      "sst_PhmOFF_75_final_speed": formData.pymOff75FinalSpeed,

      "sst_PhmOFF_75_freq_Modln": formData.pymOff75FrequencyModulation,

      "sst_PhmOFF_110_init_speed": formData.pymOff110InitialSpeed,

      "sst_PhmOFF_110_final_speed": formData.pymOff110FinalSpeed,

      "sst_PhmOFF_110_freq_Modln": formData.pymOff110FrequencyModulation,

      "sst_PhmOFF_100to0_init_speed": formData.pymOffGovernorDroopInitialSpeed,

      "sst_PhmOFF_100to0_final_speed": formData.pymOffGovernorDroopFinalSpeed,

      "sst_PhmOFF_100to0_governor_droop": formData.pymOffGovernorDroopValue,

      "sst_PhmOFF_100to0_freq_Modln": formData.pymOffGovernorDroopFrequencyModulation,

      // Section 8: Speed Control Test - (b) Transient Test - PYM (RCHM) 'ON'

      "trnsntTstPhmON_0x25_init_speed": formData.transientOn0to25InitialSpeed,

      "trnsntTstPhmON_0x25_mtry_speed": formData.transientOn0to25MomentarySpeed,

      "trnsntTstPhmON_0x25_final_speed": formData.transientOn0to25FinalSpeed,

      "trnsntTstPhmON_0x25_peak_obs": formData.transientOn0to25PeakObserved,

      "trnsntTstPhmON_0x25_recov_Obs": formData.transientOn0to25RecoveryObserved,

      "trnsntTstPhmON_25x50_init_speed": formData.transientOn25to50InitialSpeed,

      "trnsntTstPhmON_25x50_mtry_speed": formData.transientOn25to50MomentarySpeed,

      "trnsntTstPhmON_25x50_final_speed": formData.transientOn25to50FinalSpeed,

      "trnsntTstPhmON_25x50_peak_obs": formData.transientOn25to50PeakObserved,

      "trnsntTstPhmON_25x50_recov_Obs": formData.transientOn25to50RecoveryObserved,

      "trnsntTstPhmON_50x75_init_speed": formData.transientOn50to75InitialSpeed,

      "trnsntTstPhmON_50x75_mtry_speed": formData.transientOn50to75MomentarySpeed,

      "trnsntTstPhmON_50x75_final_speed": formData.transientOn50to75FinalSpeed,

      "trnsntTstPhmON_50x75_peak_obs": formData.transientOn50to75PeakObserved,

      "trnsntTstPhmON_50x75_recov_Obs": formData.transientOn50to75RecoveryObserved,

      "trnsntTstPhmON_75x100_init_speed": formData.transientOn75to100InitialSpeed,

      "trnsntTstPhmON_75x100_mtry_speed": formData.transientOn75to100MomentarySpeed,

      "trnsntTstPhmON_75x100_final_speed": formData.transientOn75to100FinalSpeed,

      "trnsntTstPhmON_75x100_peak_obs": formData.transientOn75to100PeakObserved,

      "trnsntTstPhmON_75x100_recov_Obs": formData.transientOn75to100RecoveryObserved,

      "trnsntTstPhmON_100x0_init_speed": formData.transientOn100to0InitialSpeed,

      "trnsntTstPhmON_100x0_mtry_speed": formData.transientOn100to0MomentarySpeed,

      "trnsntTstPhmON_100x0_final_speed": formData.transientOn100to0FinalSpeed,

      "trnsntTstPhmON_100x0_peak_obs": formData.transientOn100to0PeakObserved,

      "trnsntTstPhmON_100x0_recov_Obs": formData.transientOn100to0RecoveryObserved,

      // Section 8: Speed Control Test - (c) Transient Test - PYM (RCHM) 'OFF'

      "trnsntTstPhmOFF_0x25_init_speed": formData.transientOff0to25InitialSpeed,

      "trnsntTstPhmOFF_0x25_mtry_speed": formData.transientOff0to25MomentarySpeed,

      "trnsntTstPhmOFF_0x25_final_speed": formData.transientOff0to25FinalSpeed,

      "trnsntTstPhmOFF_0x25_peak_obs": formData.transientOff0to25PeakObserved,

      "trnsntTstPhmOFF_0x25_recov_Obs": formData.transientOff0to25RecoveryObserved,

      "trnsntTstPhmOFF_25x50_init_speed": formData.transientOff25to50InitialSpeed,

      "trnsntTstPhmOFF_25x50_mtry_speed": formData.transientOff25to50MomentarySpeed,

      "trnsntTstPhmOFF_25x50_final_speed": formData.transientOff25to50FinalSpeed,

      "trnsntTstPhmOFF_25x50_peak_obs": formData.transientOff25to50PeakObserved,

      "trnsntTstPhmOFF_25x50_recov_Obs": formData.transientOff25to50RecoveryObserved,

      "trnsntTstPhmOFF_50x75_init_speed": formData.transientOff50to75InitialSpeed,

      "trnsntTstPhmOFF_50x75_mtry_speed": formData.transientOff50to75MomentarySpeed,

      "trnsntTstPhmOFF_50x75_final_speed": formData.transientOff50to75FinalSpeed,

      "trnsntTstPhmOFF_50x75_peak_obs": formData.transientOff50to75PeakObserved,

      "trnsntTstPhmOFF_50x75_recov_Obs": formData.transientOff50to75RecoveryObserved,

      "trnsntTstPhmOFF_75x100_init_speed": formData.transientOff75to100InitialSpeed,

      "trnsntTstPhmOFF_75x100_mtry_speed": formData.transientOff75to100MomentarySpeed,

      "trnsntTstPhmOFF_75x100_final_speed": formData.transientOff75to100FinalSpeed,

      "trnsntTstPhmOFF_75x100_peak_obs": formData.transientOff75to100PeakObserved,

      "trnsntTstPhmOFF_75x100_recov_Obs": formData.transientOff75to100RecoveryObserved,

      "trnsntTstPhmOFF_100x0_init_speed": formData.transientOff100to0InitialSpeed,

      "trnsntTstPhmOFF_100x0_mtry_speed": formData.transientOff100to0MomentarySpeed,

      "trnsntTstPhmOFF_100x0_final_speed": formData.transientOff100to0FinalSpeed,

      "trnsntTstPhmOFF_100x0_peak_obs": formData.transientOff100to0PeakObserved,

      "trnsntTstPhmOFF_100x0_recov_Obs": formData.transientOff100to0RecoveryObserved,

      // Section 9: Voltage Control Test - (a) Voltage Control Range Test

      "voltRangeAVR_0_swtchbrd_lowest_limit": formData.voltageRangeAVR0Lowest,

      "voltRangeAVR_0_swtchbrd_highest_limit": formData.voltageRangeAVR0Highest,

      "voltRangeAVR_0_status": formData.voltageRangeAVR0Status,

      "voltRangeAVR_0_Remarks": formData.voltageRangeAVR0Remarks,

      "voltRangeAVR_100_swtchbrd_lowest_limit": formData.voltageRangeControl100Lowest,

      "voltRangeAVR_100_swtchbrd_highest_limit": formData.voltageRangeControl100Highest,

      "voltRangeAVR_100_status": formData.voltageRangeControl100Status,

      "voltRangeAVR_100_Remarks": formData.voltageRangeControl100Remarks,

      "voltRangeHC_0_swtchbrd_lowest_limit": formData.voltageRangeHand0Lowest,

      "voltRangeHC_0_swtchbrd_highest_limit": formData.voltageRangeHand0Highest,

      "voltRangeHC_0_status": formData.voltageRangeHand0Status,

      "voltRangeHC_0_Remarks": formData.voltageRangeHand0Remarks,

      "voltRangeHC_100_swtchbrd_lowest_limit": formData.voltageRangeHandControl100Lowest,

      "voltRangeHC_100_swtchbrd_highest_limit": formData.voltageRangeHandControl100Highest,

      "voltRangeHC_100_status": formData.voltageRangeHandControl100Status,

      "voltRangeHC_100_Remarks": formData.voltageRangeHandControl100Remarks,

      // Section 9: Voltage Control Test - (e) Voltage Waveform Harmonic Content

      "voltwavHorCont_max": formData.voltageHarmonicContent

    };

    

    // Make API call directly to get the ID for route config

    this.apiService.post('etma/loadtrial/', payload).subscribe({

      next: (response: any) => {

        console.log('🚀 GTG FORM SAVE DRAFT - API Response:', response);
        this.transactionId = response.data.id;

        console.log('🚀 GTG FORM SAVE DRAFT - Transaction ID:', this.transactionId);

        

        if (response.status === 200 || response.status === 201) {

          // Update reportData with the new ID

          if (response.data && response.data.id) {

            this.reportData = { ...this.reportData, id: response.data.id };

            console.log('🚀 GTG FORM SAVE DRAFT - Updated reportData.id:', this.reportData.id);

          }

          

          // Show success message

          this.toastService.showSuccess('GTG Load Trial Report draft saved successfully');

          

          // Emit the response data to parent component

          this.formSubmit.emit(response.data);

          

          // If this was for route config, show the popup now

          if (isForRouteConfig) {

            console.log('🚀 GTG LOAD TRIAL SAVE - Showing route config popup after save');
            console.log('🚀 GTG LOAD TRIAL SAVE - Updated reportData.id:', this.reportData.id);
            console.log('🚀 GTG LOAD TRIAL SAVE - isForModal:', isForModal);
            
            // Add a small delay to ensure the reportData.id is properly set
            setTimeout(() => {
              console.log('🚀 GTG FORM SAVE DRAFT - Delayed showing route config popup, reportData.id:', this.reportData.id);
              // Show the route config popup directly without toggling
              this.showRouteConfigPopup = true;

              if (isForModal) {
                console.log('🚀 GTG LOAD TRIAL SAVE - Setting showRouteConfigModal to true');
                this.showRouteConfigModal = true;
              }
            }, 100); // 100ms delay
          }

        } else {

          this.toastService.showError('Failed to save GTG Load Trial Report draft');

        }

      },

      error: (error) => {

        console.error('🚀 GTG FORM SAVE DRAFT - API Error:', error);

        this.toastService.showError('Error saving GTG Load Trial Report draft');

      }

    });

  }



  // Route configuration popup methods

  onConfigureRoute(): void {

    console.log('🚀 GTG LOAD TRIAL - Parent onConfigureRoute called');
    console.log('🚀 GTG LOAD TRIAL - Form ID:', this.reportData?.id);
    console.log('🚀 GTG LOAD TRIAL - isAddMode:', this.isAddMode);
    console.log('🚀 GTG LOAD TRIAL - pendingAction:', this.pendingAction);
    console.log('🚀 GTG LOAD TRIAL - showRouteConfigPopup:', this.showRouteConfigPopup);
    console.log('🚀 GTG LOAD TRIAL - showRouteConfigModal:', this.showRouteConfigModal);
    

    if (this.isAddMode && !this.reportData?.id) {

      console.log('🚀 GTG LOAD TRIAL - Need to save form first');
      if (this.pendingAction === 'save') {

        console.log('🚀 GTG LOAD TRIAL - Calling performSaveWithRouteConfigForModal');
        this.performSaveWithRouteConfigForModal();

      } else if (this.pendingAction === 'saveDraft') {

        console.log('🚀 GTG LOAD TRIAL - Calling performSaveDraftWithRouteConfigForModal');
        this.performSaveDraftWithRouteConfigForModal();

      } else {

        console.log('🚀 GTG LOAD TRIAL - No pending action found!');
      }

    } else {

      console.log('🚀 GTG LOAD TRIAL - Showing route config popup directly');
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



  onCloseRouteConfigPopup() {

    this.showRouteConfigPopup = false;

  }



  onRefreshTimeline(): void {

    // Handle timeline refresh logic

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
    console.log('🚀 GTG LOAD TRIAL - callRouteConfigApi called with:', routeConfigData);
    console.log('🚀 GTG LOAD TRIAL - reportData:', this.reportData);
    console.log('🚀 GTG LOAD TRIAL - reportData.id:', this.reportData?.id);
    
    // Create the payload directly in the flat format requested
    const payload = {
      route_type: routeConfigData.routeType,
      sub_module: 5, // GTG Load Trial Report submodule
      vessel: this.gtgForm.get('ship')?.value ? Number(this.gtgForm.get('ship')?.value) : 0,
      transaction_id: this.transactionId,
      user: routeConfigData.user?.id || null,
      directorate: routeConfigData.directorate?.id || routeConfigData.directorateId,
      permission_type: routeConfigData.permissionType,
      is_granted: true,
      is_approver: false
    };
    console.log('🚀 GTG LOAD TRIAL - reportData.id:', this.reportData?.id);
    console.log('🚀 GTG LOAD TRIAL - Route config API payload:', payload);
    console.log('🚀 GTG LOAD TRIAL - transaction_id value:', payload.transaction_id);
    
    // Check if transaction_id is available before making the API call
    if (!payload.transaction_id) {
      console.error('🚀 GTG LOAD TRIAL - transaction_id is not available, cannot proceed with route config API call');
      this.onRouteConfigSaved({ success: false, error: 'Transaction ID is not available' });
      return;
    }
    
    this.apiService.post('config/route-configs/', payload).subscribe({
      next: (response) => {
        console.log('🚀 GTG LOAD TRIAL - Route config API success:', response);
        this.onRouteConfigSaved({ success: true, data: response });
      },
      error: (error) => {
        console.error('🚀 GTG LOAD TRIAL - Route config API error:', error);
        this.onRouteConfigSaved({ success: false, error: error });
      }
    });
  }



  private handleSuccessfulRouteConfigSave(event: any): void {

    this.toastService.showSuccess('Route configuration saved successfully');

    this.showRouteConfigPopup = false;

    this.showRouteConfigModal = false;

    this.pendingAction = null;

    this.onCancel(); // Close the form

  }



  private handleRouteConfigError(error: any): void {

    console.error('Route config save error:', error);

    this.toastService.showError('Failed to save route configuration');

    this.showRouteConfigPopup = false;

    this.showRouteConfigModal = false;

    this.pendingAction = null;

  }



  onNextStep(event: any): void {

    // Handle next step logic

  }



  onTimelineToggle(event: boolean): void {

    // Handle timeline toggle logic

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



  onClear() {

    this.gtgForm.reset();

    this.initializeForm();

  }



  onCancel() {

    this.formCancel.emit();

  }



  private populateForm() {

    if (this.reportData && this.gtgForm) {

      

      // Map API data back to form fields

      const formData = {

        // Header Information

        occasionOfTrials: this.reportData.occation_of_trial || '',

        trialsDate: this.reportData.trial_date || '',

        ship: this.reportData.ship.id || null,

        

        // Trial Details

        presentedBy: this.reportData.Presented_by || '',

        trial_date: this.reportData.trial_date || '',

        occasionOfCurrentTrial: this.reportData.occationOfCurrTrial || '',

        dateOfLastTrial: this.reportData.lastTrialDate || '',

        proposalReference: this.reportData.proposal_reference || '',

        fileReference: this.reportData.file_reference || '',

        referenceDocument: this.reportData.referanceDocID || '',

        equipmentId: this.reportData.equipment_id || '',

        

        // Equipment Details - Engine

        engineMake: this.reportData.engn_make || '',

        engineModelSerial: this.reportData.engn_model_SrNo || '',

        engineRpm: this.reportData.engn_rpm_val || '',

        

        // Equipment Details - Governor

        governorMake: this.reportData.govnr_make || '',

        governorModelSerial: this.reportData.govnr_model_SrNo || '',

        governorType: this.reportData.govnr_type || '',

        

        // Equipment Details - Alternator

        alternatorMakeRating: this.reportData.altnr_make || '',

        alternatorModelSerial: this.reportData.altnr_model_SrNo || '',

        alternatorType: this.reportData.altnr_type || '',

        alternatorRatedVoltage: this.reportData.altnr_RatedVoltage || '',

        alternatorRatedFrequency: this.reportData.altnr_RatedFrequency || '',

        alternatorRatedKvaKw: this.reportData.altnr_RatedVal || '',

        alternatorRatedCurrent: this.reportData.altnr_RatedCurrentVal || '',

        alternatorBearingNumber: this.reportData.altnr_BearingNo || '',

        

        // Equipment Details - AVR

        avrMakeType: this.reportData.avr_make_type || '',

        avrModelSerial: this.reportData.avr_model_SrNo || '',

        

        // Equipment Details - Supply Breaker

        supplyBreakerMake: this.reportData.spplyBrkr_make || '',

        supplyBreakerModelSerial: this.reportData.spplyBrkr_model_srno || '',

        supplyBreakerRatedCapacity: this.reportData.spplyBrkr_RatedCpcty || '',

        

        // Section 4: Insulation Resistance

        generatorHot1: this.reportData.ir_gnrtr_hot || '',

        generatorCold1: this.reportData.ir_gnrtr_cold || '',

        switchboard1: this.reportData.ir_swtchbrd || '',

        generatorCable1: this.reportData.ir_gnrtr_cbl || '',

        insulationBreaker1: this.reportData.ir_insltn_brkr || '',

        

        // Section 5: Protection Checks - Breaker Protection

        overVoltageCalibrationDate: this.reportData.proChck_BP_OV_CDate || '',

        overVoltageCertificate: this.reportData.proChck_BP_OV_CertSts || '',

        overVoltageObserved: this.reportData.proChck_BP_OV_ObsVal || '',

        overVoltageStatus: this.reportData.proChck_BP_OV_Sts || '',

        underVoltageCalibrationDate: this.reportData.proChck_BP_UV_CDate || '',

        underVoltageCertificate: this.reportData.proChck_BP_UV_CertSts || '',

        underVoltageObserved: this.reportData.proChck_BP_UV_ObsVal || '',

        underVoltageStatus: this.reportData.proChck_BP_UV_Sts || '',

        overloadCalibrationDate: this.reportData.proChck_BP_OVLD_CDate || '',

        overloadCertificate: this.reportData.proChck_BP_OVLD_CertSts || '',

        overloadObserved: this.reportData.proChck_BP_OVLD_ObsVal || '',

        overloadStatus: this.reportData.proChck_BP_OVLD_Sts || '',

        

        // Section 5: Protection Checks - Generator/Switchboard Protection

        genOverVoltageCalibrationDate: this.reportData.proChck_GSP_OVT_CDate || '',

        genOverVoltageCertificate: this.reportData.proChck_GSP_OVT_CertSts || '',

        genOverVoltageObserved: this.reportData.proChck_GSP_OVT_ObsVal || '',

        genOverVoltageStatus: this.reportData.proChck_GSP_OVT_Sts || '',

        genUnderVoltageCalibrationDate: this.reportData.proChck_GSP_UVT_CDate || '',

        genUnderVoltageCertificate: this.reportData.proChck_GSP_UVT_CertSts || '',

        genUnderVoltageObserved: this.reportData.proChck_GSP_UVT_ObsVal || '',

        genUnderVoltageStatus: this.reportData.proChck_GSP_UVT_Sts || '',

        reversePowerCalibrationDate: this.reportData.proChck_GSP_RPR_CDate || '',

        reversePowerCertificate: this.reportData.proChck_GSP_RPR_CertSts || '',

        reversePowerObserved: this.reportData.proChck_GSP_RPR_ObsVal || '',

        reversePowerStatus: this.reportData.proChck_GSP_RPR_Sts || '',

        windingTempCalibrationDate: this.reportData.proChck_GSP_WTA_CDate || '',

        windingTempCertificate: this.reportData.proChck_GSP_WTA_CertSts || '',

        windingTempObserved: this.reportData.proChck_GSP_WTA_ObsVal || '',

        windingTempStatus: this.reportData.proChck_GSP_WTA_Sts || '',

        

        // Section 6: Instrumentation

        kwMeterOps: this.reportData.instrmtn_KWM_ops || '',

        kwMeterCalibrationDate: this.reportData.instrmtn_KWM_CDate || '',

        kwMeterCertificate: this.reportData.instrmtn_KWM_CCertSts || '',

        kwMeterStatus: this.reportData.instrmtn_KWM_Sts || '',

        voltmeterOps: this.reportData.instrmtn_VM_ops || '',

        voltmeterCalibrationDate: this.reportData.instrmtn_VM_CDate || '',

        voltmeterCertificate: this.reportData.instrmtn_VM_CCertSts || '',

        voltmeterStatus: this.reportData.instrmtn_VM_Sts || '',

        ammeterOps: this.reportData.instrmtn_AMM_ops || '',

        ammeterCalibrationDate: this.reportData.instrmtn_AMM_CDate || '',

        ammeterCertificate: this.reportData.instrmtn_AMM_CCertSts || '',

        ammeterStatus: this.reportData.instrmtn_AMM_Sts || '',

        frequencyMeterOps: this.reportData.instrmtn_FM_ops || '',

        frequencyMeterCalibrationDate: this.reportData.instrmtn_FM_CDate || '',

        frequencyMeterCertificate: this.reportData.instrmtn_FM_CCertSts || '',

        frequencyMeterStatus: this.reportData.instrmtn_FM_Sts || '',

        powerFactorMeterOps: this.reportData.instrmtn_PFM_ops || '',

        powerFactorMeterCalibrationDate: this.reportData.instrmtn_PFM_CDate || '',

        powerFactorMeterCertificate: this.reportData.instrmtn_PFM_CCertSts || '',

        powerFactorMeterStatus: this.reportData.instrmtn_PFM_Sts || '',

        

        // Section 7: Miscellaneous Checks - Resistance Checks

        mainStatorResistance: this.reportData.misc_main_stator || '',

        mainRotorResistance: this.reportData.misc_main_rotor || '',

        exciterStatorResistance: this.reportData.misc_exciter_stator || '',

        exciterRotorResistance: this.reportData.misc_exciter_rotor || '',

        

        // Section 7: Miscellaneous Checks - Condition/Status Checks

        slipRingCondition: this.reportData.misc_condition_slip || '',

        zincPlugsCondition: this.reportData.misc_condition_zinc || '',

        antiCondensationHeater: this.reportData.misc_anti_condensation || '',

        gtttTrialStatus: this.reportData.misc_GTTT_trial_status || '',

        internalCommunication: this.reportData.internal_communication || '',

        lightingCompartment: this.reportData.misc_lighting_compartment || '',

        ventilationCompartment: this.reportData.misc_ventilation || '',

        terminalBoxSecured: this.reportData.misc_generatr_Swbd || '',

        looseCablesSecured: this.reportData.misc_loose || '',

        generatorEarthed: this.reportData.misc_generator || '',

        supplyBreakerOperates: this.reportData.misc_generatr_supply_brkr || '',

        

        // Section 7: Miscellaneous Checks - Temperature/Routine Checks

        ambientTemperatureStart: this.reportData.misc_ambient_temperature || '',

        temperatureRiseTwoHours: this.reportData.misc_temprtre_rise || '',

        coolerRoutineDate: this.reportData.misc_routine_cooler_on || '',

        coolerInletTemperature: this.reportData.misc_temprtre_cooler_inlet || '',

        coolerOutletTemperature: this.reportData.misc_temprtre_cooler_outlet || '',

        statorWindingTemperature: this.reportData.misc_stator_winding_temprtr || '',

        

        // Section 8: Speed Control Test - WITH PYM (RCHM) 'ON'

        pymOn0InitialSpeed: this.reportData.sst_PhmON_0_init_speed || '',

        pymOn0FinalSpeed: this.reportData.sst_PhmON_0_final_speed || '',

        pymOn0FrequencyModulation: this.reportData.sst_PhmON_0_freq_Modln || '',

        pymOn25InitialSpeed: this.reportData.sst_PhmON_25_init_speed || '',

        pymOn25FinalSpeed: this.reportData.sst_PhmON_25_final_speed || '',

        pymOn25FrequencyModulation: this.reportData.sst_PhmON_25_freq_Modln || '',

        pymOn50InitialSpeed: this.reportData.sst_PhmON_50_init_speed || '',

        pymOn50FinalSpeed: this.reportData.sst_PhmON_50_final_speed || '',

        pymOn50FrequencyModulation: this.reportData.sst_PhmON_50_freq_Modln || '',

        pymOn75InitialSpeed: this.reportData.sst_PhmON_75_init_speed || '',

        pymOn75FinalSpeed: this.reportData.sst_PhmON_75_final_speed || '',

        pymOn75FrequencyModulation: this.reportData.sst_PhmON_75_freq_Modln || '',

        pymOn110InitialSpeed: this.reportData.sst_PhmON_110_init_speed || '',

        pymOn110FinalSpeed: this.reportData.sst_PhmON_110_final_speed || '',

        pymOn110FrequencyModulation: this.reportData.sst_PhmON_110_freq_Modln || '',

        

        // Section 8: Speed Control Test - WITH PYM (RCHM) 'OFF'

        pymOff0InitialSpeed: this.reportData.sst_PhmOFF_0_init_speed || '',

        pymOff0FinalSpeed: this.reportData.sst_PhmOFF_0_final_speed || '',

        pymOff0FrequencyModulation: this.reportData.sst_PhmOFF_0_freq_Modln || '',

        pymOff25InitialSpeed: this.reportData.sst_PhmOFF_25_init_speed || '',

        pymOff25FinalSpeed: this.reportData.sst_PhmOFF_25_final_speed || '',

        pymOff25FrequencyModulation: this.reportData.sst_PhmOFF_25_freq_Modln || '',

        pymOff50InitialSpeed: this.reportData.sst_PhmOFF_50_init_speed || '',

        pymOff50FinalSpeed: this.reportData.sst_PhmOFF_50_final_speed || '',

        pymOff50FrequencyModulation: this.reportData.sst_PhmOFF_50_freq_Modln || '',

        pymOff75InitialSpeed: this.reportData.sst_PhmOFF_75_init_speed || '',

        pymOff75FinalSpeed: this.reportData.sst_PhmOFF_75_final_speed || '',

        pymOff75FrequencyModulation: this.reportData.sst_PhmOFF_75_freq_Modln || '',

        pymOff110InitialSpeed: this.reportData.sst_PhmOFF_110_init_speed || '',

        pymOff110FinalSpeed: this.reportData.sst_PhmOFF_110_final_speed || '',

        pymOff110FrequencyModulation: this.reportData.sst_PhmOFF_110_freq_Modln || '',

        pymOffGovernorDroopInitialSpeed: this.reportData.sst_PhmOFF_100to0_init_speed || '',

        pymOffGovernorDroopFinalSpeed: this.reportData.sst_PhmOFF_100to0_final_speed || '',

        pymOffGovernorDroopValue: this.reportData.sst_PhmOFF_100to0_governor_droop || '',

        pymOffGovernorDroopFrequencyModulation: this.reportData.sst_PhmOFF_100to0_freq_Modln || '',

        

        // Section 8: Speed Control Test - (b) Transient Test - PYM (RCHM) 'ON'

        transientOn0to25InitialSpeed: this.reportData.trnsntTstPhmON_0x25_init_speed || '',

        transientOn0to25MomentarySpeed: this.reportData.trnsntTstPhmON_0x25_mtry_speed || '',

        transientOn0to25FinalSpeed: this.reportData.trnsntTstPhmON_0x25_final_speed || '',

        transientOn0to25PeakObserved: this.reportData.trnsntTstPhmON_0x25_peak_obs || '',

        transientOn0to25RecoveryObserved: this.reportData.trnsntTstPhmON_0x25_recov_Obs || '',

        transientOn25to0InitialSpeed: this.reportData.trnsntTstPhmON_25x0_init_speed || '',

        transientOn25to0MomentarySpeed: this.reportData.trnsntTstPhmON_25x0_mtry_speed || '',

        transientOn25to0FinalSpeed: this.reportData.trnsntTstPhmON_25x0_final_speed || '',

        transientOn25to0PeakObserved: this.reportData.trnsntTstPhmON_25x0_peak_obs || '',

        transientOn25to0RecoveryObserved: this.reportData.trnsntTstPhmON_25x0_recov_Obs || '',

        transientOn0to50InitialSpeed: this.reportData.trnsntTstPhmON_0x50_init_speed || '',

        transientOn0to50MomentarySpeed: this.reportData.trnsntTstPhmON_0x50_mtry_speed || '',

        transientOn0to50FinalSpeed: this.reportData.trnsntTstPhmON_0x50_final_speed || '',

        transientOn0to50PeakObserved: this.reportData.trnsntTstPhmON_0x50_peak_obs || '',

        transientOn0to50RecoveryObserved: this.reportData.trnsntTstPhmON_0x50_recov_Obs || '',

        transientOn50to0InitialSpeed: this.reportData.trnsntTstPhmON_50x0_init_speed || '',

        transientOn50to0MomentarySpeed: this.reportData.trnsntTstPhmON_50x0_mtry_speed || '',

        transientOn50to0FinalSpeed: this.reportData.trnsntTstPhmON_50x0_final_speed || '',

        transientOn50to0PeakObserved: this.reportData.trnsntTstPhmON_50x0_peak_obs || '',

        transientOn50to0RecoveryObserved: this.reportData.trnsntTstPhmON_50x0_recov_Obs || '',

        transientOn0to75InitialSpeed: this.reportData.trnsntTstPhmON_0x75_init_speed || '',

        transientOn0to75MomentarySpeed: this.reportData.trnsntTstPhmON_0x75_mtry_speed || '',

        transientOn0to75FinalSpeed: this.reportData.trnsntTstPhmON_0x75_final_speed || '',

        transientOn0to75PeakObserved: this.reportData.trnsntTstPhmON_0x75_peak_obs || '',

        transientOn0to75RecoveryObserved: this.reportData.trnsntTstPhmON_0x75_recov_Obs || '',

        transientOn75to0InitialSpeed: this.reportData.trnsntTstPhmON_75x0_init_speed || '',

        transientOn75to0MomentarySpeed: this.reportData.trnsntTstPhmON_75x0_mtry_speed || '',

        transientOn75to0FinalSpeed: this.reportData.trnsntTstPhmON_75x0_final_speed || '',

        transientOn75to0PeakObserved: this.reportData.trnsntTstPhmON_75x0_peak_obs || '',

        transientOn75to0RecoveryObserved: this.reportData.trnsntTstPhmON_75x0_recov_Obs || '',

        transientOn0to100InitialSpeed: this.reportData.trnsntTstPhmON_0x100_init_speed || '',

        transientOn0to100MomentarySpeed: this.reportData.trnsntTstPhmON_0x100_mtry_speed || '',

        transientOn0to100FinalSpeed: this.reportData.trnsntTstPhmON_0x100_final_speed || '',

        transientOn0to100PeakObserved: this.reportData.trnsntTstPhmON_0x100_peak_obs || '',

        transientOn0to100RecoveryObserved: this.reportData.trnsntTstPhmON_0x100_recov_Obs || '',

        transientOn100to0InitialSpeed: this.reportData.trnsntTstPhmON_100x0_init_speed || '',

        transientOn100to0MomentarySpeed: this.reportData.trnsntTstPhmON_100x0_mtry_speed || '',

        transientOn100to0FinalSpeed: this.reportData.trnsntTstPhmON_100x0_final_speed || '',

        transientOn100to0PeakObserved: this.reportData.trnsntTstPhmON_100x0_peak_obs || '',

        transientOn100to0RecoveryObserved: this.reportData.trnsntTstPhmON_100x0_recov_Obs || '',

        

        // Section 8: Speed Control Test - (b) Transient Test - PYM (RCHM) 'OFF'

        transientOff0to25InitialSpeed: this.reportData.trnsntTstPhmOFF_0x25_init_speed || '',

        transientOff0to25MomentarySpeed: this.reportData.trnsntTstPhmOFF_0x25_mtry_speed || '',

        transientOff0to25FinalSpeed: this.reportData.trnsntTstPhmOFF_0x25_final_speed || '',

        transientOff0to25PeakObserved: this.reportData.trnsntTstPhmOFF_0x25_peak_obs || '',

        transientOff0to25RecoveryObserved: this.reportData.trnsntTstPhmOFF_0x25_recov_Obs || '',

        transientOff25to0InitialSpeed: this.reportData.trnsntTstPhmOFF_25x0_init_speed || '',

        transientOff25to0MomentarySpeed: this.reportData.trnsntTstPhmOFF_25x0_mtry_speed || '',

        transientOff25to0FinalSpeed: this.reportData.trnsntTstPhmOFF_25x0_final_speed || '',

        transientOff25to0PeakObserved: this.reportData.trnsntTstPhmOFF_25x0_peak_obs || '',

        transientOff25to0RecoveryObserved: this.reportData.trnsntTstPhmOFF_25x0_recov_Obs || '',

        transientOff0to50InitialSpeed: this.reportData.trnsntTstPhmOFF_0x50_init_speed || '',

        transientOff0to50MomentarySpeed: this.reportData.trnsntTstPhmOFF_0x50_mtry_speed || '',

        transientOff0to50FinalSpeed: this.reportData.trnsntTstPhmOFF_0x50_final_speed || '',

        transientOff0to50PeakObserved: this.reportData.trnsntTstPhmOFF_0x50_peak_obs || '',

        transientOff0to50RecoveryObserved: this.reportData.trnsntTstPhmOFF_0x50_recov_Obs || '',

        transientOff50to0InitialSpeed: this.reportData.trnsntTstPhmOFF_50x0_init_speed || '',

        transientOff50to0MomentarySpeed: this.reportData.trnsntTstPhmOFF_50x0_mtry_speed || '',

        transientOff50to0FinalSpeed: this.reportData.trnsntTstPhmOFF_50x0_final_speed || '',

        transientOff50to0PeakObserved: this.reportData.trnsntTstPhmOFF_50x0_peak_obs || '',

        transientOff50to0RecoveryObserved: this.reportData.trnsntTstPhmOFF_50x0_recov_Obs || '',

        transientOff0to75InitialSpeed: this.reportData.trnsntTstPhmOFF_0x75_init_speed || '',

        transientOff0to75MomentarySpeed: this.reportData.trnsntTstPhmOFF_0x75_mtry_speed || '',

        transientOff0to75FinalSpeed: this.reportData.trnsntTstPhmOFF_0x75_final_speed || '',

        transientOff0to75PeakObserved: this.reportData.trnsntTstPhmOFF_0x75_peak_obs || '',

        transientOff0to75RecoveryObserved: this.reportData.trnsntTstPhmOFF_0x75_recov_Obs || '',

        transientOff75to0InitialSpeed: this.reportData.trnsntTstPhmOFF_75x0_init_speed || '',

        transientOff75to0MomentarySpeed: this.reportData.trnsntTstPhmOFF_75x0_mtry_speed || '',

        transientOff75to0FinalSpeed: this.reportData.trnsntTstPhmOFF_75x0_final_speed || '',

        transientOff75to0PeakObserved: this.reportData.trnsntTstPhmOFF_75x0_peak_obs || '',

        transientOff75to0RecoveryObserved: this.reportData.trnsntTstPhmOFF_75x0_recov_Obs || '',

        transientOff0to100InitialSpeed: this.reportData.trnsntTstPhmOFF_0x100_init_speed || '',

        transientOff0to100MomentarySpeed: this.reportData.trnsntTstPhmOFF_0x100_mtry_speed || '',

        transientOff0to100FinalSpeed: this.reportData.trnsntTstPhmOFF_0x100_final_speed || '',

        transientOff0to100PeakObserved: this.reportData.trnsntTstPhmOFF_0x100_peak_obs || '',

        transientOff0to100RecoveryObserved: this.reportData.trnsntTstPhmOFF_0x100_recov_Obs || '',

        transientOff100to0InitialSpeed: this.reportData.trnsntTstPhmOFF_100x0_init_speed || '',

        transientOff100to0MomentarySpeed: this.reportData.trnsntTstPhmOFF_100x0_mtry_speed || '',

        transientOff100to0FinalSpeed: this.reportData.trnsntTstPhmOFF_100x0_final_speed || '',

        transientOff100to0PeakObserved: this.reportData.trnsntTstPhmOFF_100x0_peak_obs || '',

        transientOff100to0RecoveryObserved: this.reportData.trnsntTstPhmOFF_100x0_recov_Obs || '',

        

        // Section 8: Speed Control Test - (c) Governor Range

        governorRange0Frequency: this.reportData.govrnr_range_0_measured || '',

        governorRange0Remark: this.reportData.govrnr_range_0_remark || '',

        governorRange100Frequency: this.reportData.govrnr_range_100_measured || '',

        governorRange100Remark: this.reportData.govrnr_range_100_remark || '',

        

        // Section 8: Speed Control Test - (d) Rate Affected by Governor Motor

        governorRate0Up: this.reportData.govrnr_motor_0_up || '',

        governorRate0Down: this.reportData.govrnr_motor_0_down || '',

        governorRate100Up: this.reportData.govrnr_motor_100_up || '',

        governorRate100Down: this.reportData.govrnr_motor_100_down || '',

        

        // Section 9: Voltage Control Test - (a) Steady State Test

        voltageControl0kW: this.reportData.vsst_0_val || '',

        voltageControl0VoltsObserve: this.reportData.vsst_0_ObsVolt || '',

        voltageControl0PF: this.reportData.vsst_0_PF || '',

        voltageControl0Modulation: this.reportData.vsst_0_Volt_Modln || '',

        voltageControl25kW: this.reportData.vsst_25_val || '',

        voltageControl25VoltsObserve: this.reportData.vsst_25_ObsVolt || '',

        voltageControl25PF: this.reportData.vsst_25_PF || '',

        voltageControl25Modulation: this.reportData.vsst_25_Volt_Modln || '',

        voltageControl50kW: this.reportData.vsst_50_val || '',

        voltageControl50VoltsObserve: this.reportData.vsst_50_ObsVolt || '',

        voltageControl50PF: this.reportData.vsst_50_PF || '',

        voltageControl50Modulation: this.reportData.vsst_50_Volt_Modln || '',

        voltageControl75kW: this.reportData.vsst_75_val || '',

        voltageControl75VoltsObserve: this.reportData.vsst_75_ObsVolt || '',

        voltageControl75PF: this.reportData.vsst_75_PF || '',

        voltageControl75Modulation: this.reportData.vsst_75_Volt_Modln || '',

        voltageControl100kW: this.reportData.vsst_100_val || '',

        voltageControl100VoltsObserve: this.reportData.vsst_100_ObsVolt || '',

        voltageControl100PF: this.reportData.vsst_100_PF || '',

        voltageControl100Modulation: this.reportData.vsst_100_Volt_Modln || '',

        

        // Section 9: Voltage Control Test - (b) Transient Test

        voltageTransient0to25InitialVoltage: this.reportData.vtrt_0x25_init_volt || '',

        voltageTransient0to25MomentaryVoltage: this.reportData.vtrt_0x25_memtry_volt || '',

        voltageTransient0to25FinalVoltage: this.reportData.vtrt_0x25_final_volt || '',

        voltageTransient0to25PeakObserved: this.reportData.vtrt_0x25_peak_obs || '',

        voltageTransient0to25RecoveryObserved: this.reportData.vtrt_0x25_recov_Obs || '',

        voltageTransient25to0InitialVoltage: this.reportData.vtrt_25x0_init_volt || '',

        voltageTransient25to0MomentaryVoltage: this.reportData.vtrt_25x0_memtry_volt || '',

        voltageTransient25to0FinalVoltage: this.reportData.vtrt_25x0_final_volt || '',

        voltageTransient25to0PeakObserved: this.reportData.vtrt_25x0_peak_obs || '',

        voltageTransient25to0RecoveryObserved: this.reportData.vtrt_25x0_recov_Obs || '',

        voltageTransient0to50InitialVoltage: this.reportData.vtrt_0x50_init_volt || '',

        voltageTransient0to50MomentaryVoltage: this.reportData.vtrt_0x50_memtry_volt || '',

        voltageTransient0to50FinalVoltage: this.reportData.vtrt_0x50_final_volt || '',

        voltageTransient0to50PeakObserved: this.reportData.vtrt_0x50_peak_obs || '',

        voltageTransient0to50RecoveryObserved: this.reportData.vtrt_0x50_recov_Obs || '',

        voltageTransient50to0InitialVoltage: this.reportData.vtrt_50x0_init_volt || '',

        voltageTransient50to0MomentaryVoltage: this.reportData.vtrt_50x0_memtry_volt || '',

        voltageTransient50to0FinalVoltage: this.reportData.vtrt_50x0_final_volt || '',

        voltageTransient50to0PeakObserved: this.reportData.vtrt_50x0_peak_obs || '',

        voltageTransient50to0RecoveryObserved: this.reportData.vtrt_50x0_recov_Obs || '',

        voltageTransient0to75InitialVoltage: this.reportData.vtrt_0x75_init_volt || '',

        voltageTransient0to75MomentaryVoltage: this.reportData.vtrt_0x75_memtry_volt || '',

        voltageTransient0to75FinalVoltage: this.reportData.vtrt_0x75_final_volt || '',

        voltageTransient0to75PeakObserved: this.reportData.vtrt_0x75_peak_obs || '',

        voltageTransient0to75RecoveryObserved: this.reportData.vtrt_0x75_recov_Obs || '',

        voltageTransient75to0InitialVoltage: this.reportData.vtrt_75x0_init_volt || '',

        voltageTransient75to0MomentaryVoltage: this.reportData.vtrt_75x0_memtry_volt || '',

        voltageTransient75to0FinalVoltage: this.reportData.vtrt_75x0_final_volt || '',

        voltageTransient75to0PeakObserved: this.reportData.vtrt_75x0_peak_obs || '',

        voltageTransient75to0RecoveryObserved: this.reportData.vtrt_75x0_recov_Obs || '',

        voltageTransient0to100InitialVoltage: this.reportData.vtrt_0x100_init_volt || '',

        voltageTransient0to100MomentaryVoltage: this.reportData.vtrt_0x100_memtry_volt || '',

        voltageTransient0to100FinalVoltage: this.reportData.vtrt_0x100_final_volt || '',

        voltageTransient0to100PeakObserved: this.reportData.vtrt_0x100_peak_obs || '',

        voltageTransient0to100RecoveryObserved: this.reportData.vtrt_0x100_recov_Obs || '',

        voltageTransient100to0InitialVoltage: this.reportData.vtrt_100x0_init_volt || '',

        voltageTransient100to0MomentaryVoltage: this.reportData.vtrt_100x0_memtry_volt || '',

        voltageTransient100to0FinalVoltage: this.reportData.vtrt_100x0_final_volt || '',

        voltageTransient100to0PeakObserved: this.reportData.vtrt_100x0_peak_obs || '',

        voltageTransient100to0RecoveryObserved: this.reportData.vtrt_100x0_recov_Obs || '',

        

        // Section 9: Voltage Control Test - (b) Transient Test - Plus M (Motor) Tests

        voltageTransient0plusMInitialVoltage: this.reportData.vtrt_0M_init_volt || '',

        voltageTransient0plusMMomentaryVoltage: this.reportData.vtrt_0M_memtry_volt || '',

        voltageTransient0plusMFinalVoltage: this.reportData.vtrt_0M_final_volt || '',

        voltageTransient0plusMPeakObserved: this.reportData.vtrt_0M_peak_obs || '',

        voltageTransient0plusMRecoveryObserved: this.reportData.vtrt_0M_recov_Obs || '',

        voltageTransient25plusMInitialVoltage: this.reportData.vtrt_25M_init_volt || '',

        voltageTransient25plusMMomentaryVoltage: this.reportData.vtrt_25M_memtry_volt || '',

        voltageTransient25plusMFinalVoltage: this.reportData.vtrt_25M_final_volt || '',

        voltageTransient25plusMPeakObserved: this.reportData.vtrt_25M_peak_obs || '',

        voltageTransient25plusMRecoveryObserved: this.reportData.vtrt_25M_recov_Obs || '',

        voltageTransient50plusMInitialVoltage: this.reportData.vtrt_50M_init_volt || '',

        voltageTransient50plusMMomentaryVoltage: this.reportData.vtrt_50M_memtry_volt || '',

        voltageTransient50plusMFinalVoltage: this.reportData.vtrt_50M_final_volt || '',

        voltageTransient50plusMPeakObserved: this.reportData.vtrt_50M_peak_obs || '',

        voltageTransient50plusMRecoveryObserved: this.reportData.vtrt_50M_recov_Obs || '',

        voltageTransient75plusMInitialVoltage: this.reportData.vtrt_75M_init_volt || '',

        voltageTransient75plusMMomentaryVoltage: this.reportData.vtrt_75M_memtry_volt || '',

        voltageTransient75plusMFinalVoltage: this.reportData.vtrt_75M_final_volt || '',

        voltageTransient75plusMPeakObserved: this.reportData.vtrt_75M_peak_obs || '',

        voltageTransient75plusMRecoveryObserved: this.reportData.vtrt_75M_recov_Obs || '',

        voltageTransient85plusMInitialVoltage: this.reportData.vtrt_85M_init_volt || '',

        voltageTransient85plusMMomentaryVoltage: this.reportData.vtrt_85M_memtry_volt || '',

        voltageTransient85plusMFinalVoltage: this.reportData.vtrt_85M_final_volt || '',

        voltageTransient85plusMPeakObserved: this.reportData.vtrt_85M_peak_obs || '',

        voltageTransient85plusMRecoveryObserved: this.reportData.vtrt_85M_recov_Obs || '',

        

        // Section 9: Voltage Control Test - (c) Voltage Balance

        voltageBalance0RY: this.reportData.voltBalTst_0_RY || '',

        voltageBalance0YB: this.reportData.voltBalTst_0_YB || '',

        voltageBalance0BR: this.reportData.voltBalTst_0_BR || '',

        voltageBalance100RY: this.reportData.voltBalTst_100_RY || '',

        voltageBalance100YB: this.reportData.voltBalTst_100_YB || '',

        voltageBalance100BR: this.reportData.voltBalTst_100_BR || '',

        

        // Section 9: Voltage Control Test - (d) Voltage Range

        voltageRangeAVR0Lowest: this.reportData.voltRangeAVR_0_swtchbrd_lowest_limit || '',

        voltageRangeAVR0Highest: this.reportData.voltRangeAVR_0_swtchbrd_highest_limit || '',

        voltageRangeAVR0Status: this.reportData.voltRangeAVR_0_status || '',

        voltageRangeAVR0Remarks: this.reportData.voltRangeAVR_0_Remarks || '',

        voltageRangeControl100Lowest: this.reportData.voltRangeAVR_100_swtchbrd_lowest_limit || '',

        voltageRangeControl100Highest: this.reportData.voltRangeAVR_100_swtchbrd_highest_limit || '',

        voltageRangeControl100Status: this.reportData.voltRangeAVR_100_status || '',

        voltageRangeControl100Remarks: this.reportData.voltRangeAVR_100_Remarks || '',

        voltageRangeHand0Lowest: this.reportData.voltRangeHC_0_swtchbrd_lowest_limit || '',

        voltageRangeHand0Highest: this.reportData.voltRangeHC_0_swtchbrd_highest_limit || '',

        voltageRangeHand0Status: this.reportData.voltRangeHC_0_status || '',

        voltageRangeHand0Remarks: this.reportData.voltRangeHC_0_Remarks || '',

        voltageRangeHandControl100Lowest: this.reportData.voltRangeHC_100_swtchbrd_lowest_limit || '',

        voltageRangeHandControl100Highest: this.reportData.voltRangeHC_100_swtchbrd_highest_limit || '',

        voltageRangeHandControl100Status: this.reportData.voltRangeHC_100_status || '',

        voltageRangeHandControl100Remarks: this.reportData.voltRangeHC_100_Remarks || '',

        

        // Section 9: Voltage Control Test - (e) Voltage Waveform Harmonic Content

        voltageHarmonicContent: this.reportData.voltwavHorCont_max || ''

      };

      

      this.gtgForm.patchValue(formData);

      

      // Set the selected ship ID for editing mode

      if (formData.ship) {

        this.selectedShipId = formData.ship;

      }

    }

  }



  // Check if any field has a value (for draft save)

  private hasAnyFieldValue(): boolean {

    const formData = this.gtgForm.value;

    return Object.values(formData).some(value => 

      value !== null && value !== undefined && value !== '' && value.toString().trim() !== ''

    );

  }



  // Submit draft without validation

  private submitDraft() {

    // In view mode, don't submit the form

    if (this.isViewMode) {

      return;

    }



    // Prepare payload for API call (bypass validation)

    const formData = this.gtgForm.value;

    

    // Helper function to process form data for draft submission

    const processDraftData = (value: any, isDateField: boolean = false, allowEmptyString: boolean = false): any => {

      if (value === '' || value === null || value === undefined) {

        if (allowEmptyString) {

          return '';

        }

        return null;

      }

      

      // Handle date formatting for date fields

      if (isDateField) {

        // If it's already in YYYY-MM-DD format, return as is

        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {

          return value;

        }

        // If it's a Date object, format it

        if (value instanceof Date) {

          return value.toISOString().split('T')[0];

        }

        // For any other format, try to parse and format

        try {

          const date = new Date(value);

          if (!isNaN(date.getTime())) {

            return date.toISOString().split('T')[0];

          }

        } catch (e) {

          console.warn('Invalid date format:', value);

        }

        return null;

      }

      

      return value;

    };

    

    const payload = {

      // Add draft_status key based on submission type

      "draft_status": this.submissionType === 'draft' ? 'draft' : 'save',

      "Presented_by": processDraftData(formData.presentedBy),

      "trial_date": processDraftData(formData.trial_date, true),

      "occation_of_trial": processDraftData(formData.occasionOfTrials),

      "occationOfCurrTrial": processDraftData(formData.occasionOfCurrentTrial),

      "lastTrialDate": processDraftData(formData.dateOfLastTrial, true),

      "ship": this.selectedShipId || formData.ship,

      "proposal_reference": processDraftData(formData.proposalReference),

      "file_reference": processDraftData(formData.fileReference),

      "referanceDocID": processDraftData(formData.referenceDocument),

      "equipment_id": processDraftData(formData.equipmentId),

      // Equipment Details - Engine

      "engn_make": formData.engineMake,

      "engn_model_SrNo": formData.engineModelSerial,

      "engn_rpm_val": formData.engineRpm,

      // Equipment Details - Governor

      "govnr_make": formData.governorMake,

      "govnr_model_SrNo": formData.governorModelSerial,

      "govnr_type": formData.governorType,

      // Equipment Details - Alternator

      "altnr_make": formData.alternatorMakeRating,

      "altnr_model_SrNo": formData.alternatorModelSerial,

      "altnr_type": formData.alternatorType,

      "altnr_RatedVoltage": formData.alternatorRatedVoltage,

      "altnr_RatedFrequency": formData.alternatorRatedFrequency,

      "altnr_RatedVal": formData.alternatorRatedKvaKw,

      "altnr_RatedCurrentVal": formData.alternatorRatedCurrent,

      "altnr_BearingNo": formData.alternatorBearingNumber,

      // Equipment Details - AVR

      "avr_make_type": formData.avrMakeType,

      "avr_model_SrNo": formData.avrModelSerial,

      // Equipment Details - Supply Breaker

      "spplyBrkr_make": formData.supplyBreakerMake,

      "spplyBrkr_model_srno": formData.supplyBreakerModelSerial,

      "spplyBrkr_RatedCpcty": formData.supplyBreakerRatedCapacity,

      // Section 4: Insulation Resistance

      "ir_gnrtr_hot": formData.generatorHot1,

      "ir_gnrtr_cold": formData.generatorCold1,

      "ir_swtchbrd": formData.switchboard1,

      "ir_gnrtr_cbl": formData.generatorCable1,

      "ir_insltn_brkr": formData.insulationBreaker1,

      // Section 5: Protection Checks - Breaker Protection

      "proChck_BP_OV_CDate": processDraftData(formData.overVoltageCalibrationDate, true),

      "proChck_BP_OV_CertSts": processDraftData(formData.overVoltageCertificate),

      "proChck_BP_OV_ObsVal": processDraftData(formData.overVoltageObserved),

      "proChck_BP_OV_Sts": processDraftData(formData.overVoltageStatus),

      "proChck_BP_UV_CDate": processDraftData(formData.underVoltageCalibrationDate, true),

      "proChck_BP_UV_CertSts": processDraftData(formData.underVoltageCertificate),

      "proChck_BP_UV_ObsVal": processDraftData(formData.underVoltageObserved),

      "proChck_BP_UV_Sts": processDraftData(formData.underVoltageStatus),

      "proChck_BP_OVLD_CDate": processDraftData(formData.overloadCalibrationDate, true),

      "proChck_BP_OVLD_CertSts": processDraftData(formData.overloadCertificate),

      "proChck_BP_OVLD_ObsVal": processDraftData(formData.overloadObserved),

      "proChck_BP_OVLD_Sts": processDraftData(formData.overloadStatus),

      // Section 5: Protection Checks - Generator/Switchboard Protection

      "proChck_GSP_OVT_CDate": processDraftData(formData.genOverVoltageCalibrationDate, true),

      "proChck_GSP_OVT_CertSts": processDraftData(formData.genOverVoltageCertificate),

      "proChck_GSP_OVT_ObsVal": processDraftData(formData.genOverVoltageObserved),

      "proChck_GSP_OVT_Sts": processDraftData(formData.genOverVoltageStatus),

      "proChck_GSP_UVT_CDate": processDraftData(formData.genUnderVoltageCalibrationDate, true),

      "proChck_GSP_UVT_CertSts": processDraftData(formData.genUnderVoltageCertificate),

      "proChck_GSP_UVT_ObsVal": processDraftData(formData.genUnderVoltageObserved),

      "proChck_GSP_UVT_Sts": processDraftData(formData.genUnderVoltageStatus),

      "proChck_GSP_RPR_CDate": processDraftData(formData.reversePowerCalibrationDate, true),

      "proChck_GSP_RPR_CertSts": processDraftData(formData.reversePowerCertificate),

      "proChck_GSP_RPR_ObsVal": processDraftData(formData.reversePowerObserved),

      "proChck_GSP_RPR_Sts": processDraftData(formData.reversePowerStatus),

      "proChck_GSP_WTA_CDate": processDraftData(formData.windingTempCalibrationDate, true),

      "proChck_GSP_WTA_CertSts": processDraftData(formData.windingTempCertificate),

      "proChck_GSP_WTA_ObsVal": processDraftData(formData.windingTempObserved),

      "proChck_GSP_WTA_Sts": processDraftData(formData.windingTempStatus),

      // Section 6: Instrumentation

      "instrmtn_KWM_ops": processDraftData(formData.kwMeterOps),

      "instrmtn_KWM_CDate": processDraftData(formData.kwMeterCalibrationDate, true),

      "instrmtn_KWM_CCertSts": formData.kwMeterCertificate || "No",

      "instrmtn_KWM_Sts": processDraftData(formData.kwMeterStatus),

      "instrmtn_VM_ops": processDraftData(formData.voltmeterOps),

      "instrmtn_VM_CDate": processDraftData(formData.voltmeterCalibrationDate, true),

      "instrmtn_VM_CCertSts": formData.voltmeterCertificate || "No",

      "instrmtn_VM_Sts": processDraftData(formData.voltmeterStatus),

      "instrmtn_AMM_ops": processDraftData(formData.ammeterOps),

      "instrmtn_AMM_CDate": processDraftData(formData.ammeterCalibrationDate, true),

      "instrmtn_AMM_CCertSts": formData.ammeterCertificate || "No",

      "instrmtn_AMM_Sts": processDraftData(formData.ammeterStatus),

      "instrmtn_FM_ops": processDraftData(formData.frequencyMeterOps),

      "instrmtn_FM_CDate": processDraftData(formData.frequencyMeterCalibrationDate, true),

      "instrmtn_FM_CCertSts": formData.frequencyMeterCertificate || "No",

      "instrmtn_FM_Sts": processDraftData(formData.frequencyMeterStatus),

      "instrmtn_PFM_ops": processDraftData(formData.powerFactorMeterOps),

      "instrmtn_PFM_CDate": processDraftData(formData.powerFactorMeterCalibrationDate, true),

      "instrmtn_PFM_CCertSts": formData.powerFactorMeterCertificate || "No",

      "instrmtn_PFM_Sts": processDraftData(formData.powerFactorMeterStatus),

      // Section 7: Miscellaneous Checks - Resistance Checks

      "misc_main_stator": processDraftData(formData.mainStatorResistance),

      "misc_main_rotor": processDraftData(formData.mainRotorResistance),

      "misc_exciter_stator": processDraftData(formData.exciterStatorResistance),

      "misc_exciter_rotor": processDraftData(formData.exciterRotorResistance),

      // Section 7: Miscellaneous Checks - Condition/Status Checks

      "misc_condition_slip": formData.slipRingCondition,

      "misc_condition_zinc": formData.zincPlugsCondition,

      "misc_anti_condensation": formData.antiCondensationHeater,

      "misc_GTTT_trial_status": formData.gtttTrialStatus,

      "internal_communication": formData.internalCommunication,

      "misc_lighting_compartment": formData.lightingCompartment,

      "misc_ventilation": formData.ventilationCompartment,

      "misc_generator": formData.generatorEarthed,

      "misc_loose": formData.looseCablesSecured,

      "misc_generatr_Swbd": formData.terminalBoxSecured,

      "misc_generatr_supply_brkr": formData.supplyBreakerOperates,

      // Section 7: Miscellaneous Checks - Temperature/Routine Checks

      "misc_ambient_temperature": processDraftData(formData.ambientTemperatureStart),

      "misc_temprtre_rise": processDraftData(formData.temperatureRiseTwoHours),

      "misc_routine_cooler_on": processDraftData(formData.coolerRoutineDate, true),

      "misc_temprtre_cooler_inlet": processDraftData(formData.coolerInletTemperature),

      "misc_temprtre_cooler_outlet": processDraftData(formData.coolerOutletTemperature),

      "misc_stator_winding_temprtr": processDraftData(formData.statorWindingTemperature),

      // Section 8: Speed Control Test - WITH PYM (RCHM) 'ON'

      "sst_PhmON_0_init_speed": formData.pymOn0InitialSpeed,

      "sst_PhmON_0_final_speed": formData.pymOn0FinalSpeed,

      "sst_PhmON_0_freq_Modln": formData.pymOn0FrequencyModulation,

      "sst_PhmON_25_init_speed": formData.pymOn25InitialSpeed,

      "sst_PhmON_25_final_speed": formData.pymOn25FinalSpeed,

      "sst_PhmON_25_freq_Modln": formData.pymOn25FrequencyModulation,

      "sst_PhmON_50_init_speed": formData.pymOn50InitialSpeed,

      "sst_PhmON_50_final_speed": formData.pymOn50FinalSpeed,

      "sst_PhmON_50_freq_Modln": formData.pymOn50FrequencyModulation,

      "sst_PhmON_75_init_speed": formData.pymOn75InitialSpeed,

      "sst_PhmON_75_final_speed": formData.pymOn75FinalSpeed,

      "sst_PhmON_75_freq_Modln": formData.pymOn75FrequencyModulation,

      "sst_PhmON_110_init_speed": formData.pymOn110InitialSpeed,

      "sst_PhmON_110_final_speed": formData.pymOn110FinalSpeed,

      "sst_PhmON_110_freq_Modln": formData.pymOn110FrequencyModulation,

      "sst_PhmOFF_0_init_speed": formData.pymOff0InitialSpeed,

      "sst_PhmOFF_0_final_speed": formData.pymOff0FinalSpeed,

      "sst_PhmOFF_0_freq_Modln": formData.pymOff0FrequencyModulation,

      "sst_PhmOFF_25_init_speed": formData.pymOff25InitialSpeed,

      "sst_PhmOFF_25_final_speed": formData.pymOff25FinalSpeed,

      "sst_PhmOFF_25_freq_Modln": formData.pymOff25FrequencyModulation,

      "sst_PhmOFF_50_init_speed": formData.pymOff50InitialSpeed,

      "sst_PhmOFF_50_final_speed": formData.pymOff50FinalSpeed,

      "sst_PhmOFF_50_freq_Modln": formData.pymOff50FrequencyModulation,

      "sst_PhmOFF_75_init_speed": formData.pymOff75InitialSpeed,

      "sst_PhmOFF_75_final_speed": formData.pymOff75FinalSpeed,

      "sst_PhmOFF_75_freq_Modln": formData.pymOff75FrequencyModulation,

      "sst_PhmOFF_110_init_speed": formData.pymOff110InitialSpeed,

      "sst_PhmOFF_110_final_speed": formData.pymOff110FinalSpeed,

      "sst_PhmOFF_110_freq_Modln": formData.pymOff110FrequencyModulation,

      "sst_PhmOFF_100to0_init_speed": formData.pymOffGovernorDroopInitialSpeed,

      "sst_PhmOFF_100to0_final_speed": formData.pymOffGovernorDroopFinalSpeed,

      "sst_PhmOFF_100to0_governor_droop": formData.pymOffGovernorDroopValue,

      "sst_PhmOFF_100to0_freq_Modln": formData.pymOffGovernorDroopFrequencyModulation,

      // Section 8: Speed Control Test - (b) Transient Test - PYM (RCHM) 'ON'

      "trnsntTstPhmON_0x25_init_speed": formData.transientOn0to25InitialSpeed,

      "trnsntTstPhmON_0x25_mtry_speed": formData.transientOn0to25MomentarySpeed,

      "trnsntTstPhmON_0x25_final_speed": formData.transientOn0to25FinalSpeed,

      "trnsntTstPhmON_0x25_peak_obs": formData.transientOn0to25PeakObserved,

      "trnsntTstPhmON_0x25_recov_Obs": formData.transientOn0to25RecoveryObserved,

      "trnsntTstPhmON_25x0_init_speed": formData.transientOn25to0InitialSpeed,

      "trnsntTstPhmON_25x0_mtry_speed": formData.transientOn25to0MomentarySpeed,

      "trnsntTstPhmON_25x0_final_speed": formData.transientOn25to0FinalSpeed,

      "trnsntTstPhmON_25x0_peak_obs": formData.transientOn25to0PeakObserved,

      "trnsntTstPhmON_25x0_recov_Obs": formData.transientOn25to0RecoveryObserved,

      "trnsntTstPhmON_0x50_init_speed": formData.transientOn0to50InitialSpeed,

      "trnsntTstPhmON_0x50_mtry_speed": formData.transientOn0to50MomentarySpeed,

      "trnsntTstPhmON_0x50_final_speed": formData.transientOn0to50FinalSpeed,

      "trnsntTstPhmON_0x50_peak_obs": formData.transientOn0to50PeakObserved,

      "trnsntTstPhmON_0x50_recov_Obs": formData.transientOn0to50RecoveryObserved,

      "trnsntTstPhmON_50x0_init_speed": formData.transientOn50to0InitialSpeed,

      "trnsntTstPhmON_50x0_mtry_speed": formData.transientOn50to0MomentarySpeed,

      "trnsntTstPhmON_50x0_final_speed": formData.transientOn50to0FinalSpeed,

      "trnsntTstPhmON_50x0_peak_obs": formData.transientOn50to0PeakObserved,

      "trnsntTstPhmON_50x0_recov_Obs": formData.transientOn50to0RecoveryObserved,

      "trnsntTstPhmON_0x75_init_speed": formData.transientOn0to75InitialSpeed,

      "trnsntTstPhmON_0x75_mtry_speed": formData.transientOn0to75MomentarySpeed,

      "trnsntTstPhmON_0x75_final_speed": formData.transientOn0to75FinalSpeed,

      "trnsntTstPhmON_0x75_peak_obs": formData.transientOn0to75PeakObserved,

      "trnsntTstPhmON_0x75_recov_Obs": formData.transientOn0to75RecoveryObserved,

      "trnsntTstPhmON_75x0_init_speed": formData.transientOn75to0InitialSpeed,

      "trnsntTstPhmON_75x0_mtry_speed": formData.transientOn75to0MomentarySpeed,

      "trnsntTstPhmON_75x0_final_speed": formData.transientOn75to0FinalSpeed,

      "trnsntTstPhmON_75x0_peak_obs": formData.transientOn75to0PeakObserved,

      "trnsntTstPhmON_75x0_recov_Obs": formData.transientOn75to0RecoveryObserved,

      "trnsntTstPhmON_0x100_init_speed": formData.transientOn0to100InitialSpeed,

      "trnsntTstPhmON_0x100_mtry_speed": formData.transientOn0to100MomentarySpeed,

      "trnsntTstPhmON_0x100_final_speed": formData.transientOn0to100FinalSpeed,

      "trnsntTstPhmON_0x100_peak_obs": formData.transientOn0to100PeakObserved,

      "trnsntTstPhmON_0x100_recov_Obs": formData.transientOn0to100RecoveryObserved,

      "trnsntTstPhmON_100x0_init_speed": formData.transientOn100to0InitialSpeed,

      "trnsntTstPhmON_100x0_mtry_speed": formData.transientOn100to0MomentarySpeed,

      "trnsntTstPhmON_100x0_final_speed": formData.transientOn100to0FinalSpeed,

      "trnsntTstPhmON_100x0_peak_obs": formData.transientOn100to0PeakObserved,

      "trnsntTstPhmON_100x0_recov_Obs": formData.transientOn100to0RecoveryObserved,

      // Section 8: Speed Control Test - (b) Transient Test - PYM (RCHM) 'OFF'

      "trnsntTstPhmOFF_0x25_init_speed": formData.transientOff0to25InitialSpeed,

      "trnsntTstPhmOFF_0x25_mtry_speed": formData.transientOff0to25MomentarySpeed,

      "trnsntTstPhmOFF_0x25_final_speed": formData.transientOff0to25FinalSpeed,

      "trnsntTstPhmOFF_0x25_peak_obs": formData.transientOff0to25PeakObserved,

      "trnsntTstPhmOFF_0x25_recov_Obs": formData.transientOff0to25RecoveryObserved,

      "trnsntTstPhmOFF_25x0_init_speed": formData.transientOff25to0InitialSpeed,

      "trnsntTstPhmOFF_25x0_mtry_speed": formData.transientOff25to0MomentarySpeed,

      "trnsntTstPhmOFF_25x0_final_speed": formData.transientOff25to0FinalSpeed,

      "trnsntTstPhmOFF_25x0_peak_obs": formData.transientOff25to0PeakObserved,

      "trnsntTstPhmOFF_25x0_recov_Obs": formData.transientOff25to0RecoveryObserved,

      "trnsntTstPhmOFF_0x50_init_speed": formData.transientOff0to50InitialSpeed,

      "trnsntTstPhmOFF_0x50_mtry_speed": formData.transientOff0to50MomentarySpeed,

      "trnsntTstPhmOFF_0x50_final_speed": formData.transientOff0to50FinalSpeed,

      "trnsntTstPhmOFF_0x50_peak_obs": formData.transientOff0to50PeakObserved,

      "trnsntTstPhmOFF_0x50_recov_Obs": formData.transientOff0to50RecoveryObserved,

      "trnsntTstPhmOFF_50x0_init_speed": formData.transientOff50to0InitialSpeed,

      "trnsntTstPhmOFF_50x0_mtry_speed": formData.transientOff50to0MomentarySpeed,

      "trnsntTstPhmOFF_50x0_final_speed": formData.transientOff50to0FinalSpeed,

      "trnsntTstPhmOFF_50x0_peak_obs": formData.transientOff50to0PeakObserved,

      "trnsntTstPhmOFF_50x0_recov_Obs": formData.transientOff50to0RecoveryObserved,

      "trnsntTstPhmOFF_0x75_init_speed": formData.transientOff0to75InitialSpeed,

      "trnsntTstPhmOFF_0x75_mtry_speed": formData.transientOff0to75MomentarySpeed,

      "trnsntTstPhmOFF_0x75_final_speed": formData.transientOff0to75FinalSpeed,

      "trnsntTstPhmOFF_0x75_peak_obs": formData.transientOff0to75PeakObserved,

      "trnsntTstPhmOFF_0x75_recov_Obs": formData.transientOff0to75RecoveryObserved,

      "trnsntTstPhmOFF_75x0_init_speed": formData.transientOff75to0InitialSpeed,

      "trnsntTstPhmOFF_75x0_mtry_speed": formData.transientOff75to0MomentarySpeed,

      "trnsntTstPhmOFF_75x0_final_speed": formData.transientOff75to0FinalSpeed,

      "trnsntTstPhmOFF_75x0_peak_obs": formData.transientOff75to0PeakObserved,

      "trnsntTstPhmOFF_75x0_recov_Obs": formData.transientOff75to0RecoveryObserved,

      "trnsntTstPhmOFF_0x100_init_speed": formData.transientOff0to100InitialSpeed,

      "trnsntTstPhmOFF_0x100_mtry_speed": formData.transientOff0to100MomentarySpeed,

      "trnsntTstPhmOFF_0x100_final_speed": formData.transientOff0to100FinalSpeed,

      "trnsntTstPhmOFF_0x100_peak_obs": formData.transientOff0to100PeakObserved,

      "trnsntTstPhmOFF_0x100_recov_Obs": formData.transientOff0to100RecoveryObserved,

      "trnsntTstPhmOFF_100x0_init_speed": formData.transientOff100to0InitialSpeed,

      "trnsntTstPhmOFF_100x0_mtry_speed": formData.transientOff100to0MomentarySpeed,

      "trnsntTstPhmOFF_100x0_final_speed": formData.transientOff100to0FinalSpeed,

      "trnsntTstPhmOFF_100x0_peak_obs": formData.transientOff100to0PeakObserved,

      "trnsntTstPhmOFF_100x0_recov_Obs": formData.transientOff100to0RecoveryObserved,

      // Section 8: Speed Control Test - (c) Governor Range

      "govrnr_range_0_measured": formData.governorRange0Frequency,

      "govrnr_range_0_remark": formData.governorRange0Remark,

      "govrnr_range_100_measured": formData.governorRange100Frequency,

      "govrnr_range_100_remark": formData.governorRange100Remark,

      // Section 8: Speed Control Test - (d) Rate Affected by Governor Motor

      "govrnr_motor_0_up": formData.governorRate0Up,

      "govrnr_motor_0_down": formData.governorRate0Down,

      "govrnr_motor_100_up": formData.governorRate100Up,

      "govrnr_motor_100_down": formData.governorRate100Down,

      // Section 9: Voltage Control Test - (a) Steady State Test

      "vsst_0_val": formData.voltageControl0kW,

      "vsst_0_ObsVolt": formData.voltageControl0VoltsObserve,

      "vsst_0_PF": formData.voltageControl0PF,

      "vsst_0_Volt_Modln": formData.voltageControl0Modulation,

      "vsst_25_val": formData.voltageControl25kW,

      "vsst_25_ObsVolt": formData.voltageControl25VoltsObserve,

      "vsst_25_PF": formData.voltageControl25PF,

      "vsst_25_Volt_Modln": formData.voltageControl25Modulation,

      "vsst_50_val": formData.voltageControl50kW,

      "vsst_50_ObsVolt": formData.voltageControl50VoltsObserve,

      "vsst_50_PF": formData.voltageControl50PF,

      "vsst_50_Volt_Modln": formData.voltageControl50Modulation,

      "vsst_75_val": formData.voltageControl75kW,

      "vsst_75_ObsVolt": formData.voltageControl75VoltsObserve,

      "vsst_75_PF": formData.voltageControl75PF,

      "vsst_75_Volt_Modln": formData.voltageControl75Modulation,

      "vsst_100_val": formData.voltageControl100kW,

      "vsst_100_ObsVolt": formData.voltageControl100VoltsObserve,

      "vsst_100_PF": formData.voltageControl100PF,

      "vsst_100_Volt_Modln": formData.voltageControl100Modulation,

      // Section 9: Voltage Control Test - (b) Transient Test

      "vtrt_0x25_init_volt": formData.voltageTransient0to25InitialVoltage,

      "vtrt_0x25_memtry_volt": formData.voltageTransient0to25MomentaryVoltage,

      "vtrt_0x25_final_volt": formData.voltageTransient0to25FinalVoltage,

      "vtrt_0x25_peak_obs": formData.voltageTransient0to25PeakObserved,

      "vtrt_0x25_recov_Obs": formData.voltageTransient0to25RecoveryObserved,

      "vtrt_25x0_init_volt": formData.voltageTransient25to0InitialVoltage,

      "vtrt_25x0_memtry_volt": formData.voltageTransient25to0MomentaryVoltage,

      "vtrt_25x0_final_volt": formData.voltageTransient25to0FinalVoltage,

      "vtrt_25x0_peak_obs": formData.voltageTransient25to0PeakObserved,

      "vtrt_25x0_recov_Obs": formData.voltageTransient25to0RecoveryObserved,

      "vtrt_0x50_init_volt": formData.voltageTransient0to50InitialVoltage,

      "vtrt_0x50_memtry_volt": formData.voltageTransient0to50MomentaryVoltage,

      "vtrt_0x50_final_volt": formData.voltageTransient0to50FinalVoltage,

      "vtrt_0x50_peak_obs": formData.voltageTransient0to50PeakObserved,

      "vtrt_0x50_recov_Obs": formData.voltageTransient0to50RecoveryObserved,

      "vtrt_50x0_init_volt": formData.voltageTransient50to0InitialVoltage,

      "vtrt_50x0_memtry_volt": formData.voltageTransient50to0MomentaryVoltage,

      "vtrt_50x0_final_volt": formData.voltageTransient50to0FinalVoltage,

      "vtrt_50x0_peak_obs": formData.voltageTransient50to0PeakObserved,

      "vtrt_50x0_recov_Obs": formData.voltageTransient50to0RecoveryObserved,

      "vtrt_0x75_init_volt": formData.voltageTransient0to75InitialVoltage,

      "vtrt_0x75_memtry_volt": formData.voltageTransient0to75MomentaryVoltage,

      "vtrt_0x75_final_volt": formData.voltageTransient0to75FinalVoltage,

      "vtrt_0x75_peak_obs": formData.voltageTransient0to75PeakObserved,

      "vtrt_0x75_recov_Obs": formData.voltageTransient0to75RecoveryObserved,

      "vtrt_75x0_init_volt": formData.voltageTransient75to0InitialVoltage,

      "vtrt_75x0_memtry_volt": formData.voltageTransient75to0MomentaryVoltage,

      "vtrt_75x0_final_volt": formData.voltageTransient75to0FinalVoltage,

      "vtrt_75x0_peak_obs": formData.voltageTransient75to0PeakObserved,

      "vtrt_75x0_recov_Obs": formData.voltageTransient75to0RecoveryObserved,

      "vtrt_0x100_init_volt": formData.voltageTransient0to100InitialVoltage,

      "vtrt_0x100_memtry_volt": formData.voltageTransient0to100MomentaryVoltage,

      "vtrt_0x100_final_volt": formData.voltageTransient0to100FinalVoltage,

      "vtrt_0x100_peak_obs": formData.voltageTransient0to100PeakObserved,

      "vtrt_0x100_recov_Obs": formData.voltageTransient0to100RecoveryObserved,

      "vtrt_100x0_init_volt": formData.voltageTransient100to0InitialVoltage,

      "vtrt_100x0_memtry_volt": formData.voltageTransient100to0MomentaryVoltage,

      "vtrt_100x0_final_volt": formData.voltageTransient100to0FinalVoltage,

      "vtrt_100x0_peak_obs": formData.voltageTransient100to0PeakObserved,

      "vtrt_100x0_recov_Obs": formData.voltageTransient100to0RecoveryObserved,

      // Section 9: Voltage Control Test - (b) Transient Test - Plus M (Motor) Tests

      "vtrt_0M_init_volt": formData.voltageTransient0plusMInitialVoltage,

      "vtrt_0M_memtry_volt": formData.voltageTransient0plusMMomentaryVoltage,

      "vtrt_0M_final_volt": formData.voltageTransient0plusMFinalVoltage,

      "vtrt_0M_peak_obs": formData.voltageTransient0plusMPeakObserved,

      "vtrt_0M_recov_Obs": formData.voltageTransient0plusMRecoveryObserved,

      "vtrt_25M_init_volt": formData.voltageTransient25plusMInitialVoltage,

      "vtrt_25M_memtry_volt": formData.voltageTransient25plusMMomentaryVoltage,

      "vtrt_25M_final_volt": formData.voltageTransient25plusMFinalVoltage,

      "vtrt_25M_peak_obs": formData.voltageTransient25plusMPeakObserved,

      "vtrt_25M_recov_Obs": formData.voltageTransient25plusMRecoveryObserved,

      "vtrt_50M_init_volt": formData.voltageTransient50plusMInitialVoltage,

      "vtrt_50M_memtry_volt": formData.voltageTransient50plusMMomentaryVoltage,

      "vtrt_50M_final_volt": formData.voltageTransient50plusMFinalVoltage,

      "vtrt_50M_peak_obs": formData.voltageTransient50plusMPeakObserved,

      "vtrt_50M_recov_Obs": formData.voltageTransient50plusMRecoveryObserved,

      "vtrt_75M_init_volt": formData.voltageTransient75plusMInitialVoltage,

      "vtrt_75M_memtry_volt": formData.voltageTransient75plusMMomentaryVoltage,

      "vtrt_75M_final_volt": formData.voltageTransient75plusMFinalVoltage,

      "vtrt_75M_peak_obs": formData.voltageTransient75plusMPeakObserved,

      "vtrt_75M_recov_Obs": formData.voltageTransient75plusMRecoveryObserved,

      "vtrt_85M_init_volt": formData.voltageTransient85plusMInitialVoltage,

      "vtrt_85M_memtry_volt": formData.voltageTransient85plusMMomentaryVoltage,

      "vtrt_85M_final_volt": formData.voltageTransient85plusMFinalVoltage,

      "vtrt_85M_peak_obs": formData.voltageTransient85plusMPeakObserved,

      "vtrt_85M_recov_Obs": formData.voltageTransient85plusMRecoveryObserved,

      // Section 9: Voltage Control Test - (c) Voltage Balance

      "voltBalTst_0_RY": processDraftData(formData.voltageBalance0RY),

      "voltBalTst_0_YB": processDraftData(formData.voltageBalance0YB),

      "voltBalTst_0_BR": processDraftData(formData.voltageBalance0BR),

      "voltBalTst_100_RY": processDraftData(formData.voltageBalance100RY),

      "voltBalTst_100_YB": processDraftData(formData.voltageBalance100YB),

      "voltBalTst_100_BR": processDraftData(formData.voltageBalance100BR),

      // Section 9: Voltage Control Test - (d) Voltage Range

      "voltRangeAVR_0_swtchbrd_lowest_limit": formData.voltageRangeAVR0Lowest,

      "voltRangeAVR_0_swtchbrd_highest_limit": formData.voltageRangeAVR0Highest,

      "voltRangeAVR_0_status": formData.voltageRangeAVR0Status,

      "voltRangeAVR_0_Remarks": formData.voltageRangeAVR0Remarks,

      "voltRangeAVR_100_swtchbrd_lowest_limit": formData.voltageRangeControl100Lowest,

      "voltRangeAVR_100_swtchbrd_highest_limit": formData.voltageRangeControl100Highest,

      "voltRangeAVR_100_status": formData.voltageRangeControl100Status,

      "voltRangeAVR_100_Remarks": formData.voltageRangeControl100Remarks,

      "voltRangeHC_0_swtchbrd_lowest_limit": formData.voltageRangeHand0Lowest,

      "voltRangeHC_0_swtchbrd_highest_limit": formData.voltageRangeHand0Highest,

      "voltRangeHC_0_status": formData.voltageRangeHand0Status,

      "voltRangeHC_0_Remarks": formData.voltageRangeHand0Remarks,

      "voltRangeHC_100_swtchbrd_lowest_limit": formData.voltageRangeHandControl100Lowest,

      "voltRangeHC_100_swtchbrd_highest_limit": formData.voltageRangeHandControl100Highest,

      "voltRangeHC_100_status": formData.voltageRangeHandControl100Status,

      "voltRangeHC_100_Remarks": formData.voltageRangeHandControl100Remarks,

      // Section 9: Voltage Control Test - (e) Voltage Waveform Harmonic Content

      "voltwavHorCont_max": formData.voltageHarmonicContent

    };

    

    // Emit the form data to parent component instead of making API call directly

    this.formSubmit.emit(payload);

  }



  isFieldInvalid(fieldName: string): boolean {

    const field = this.gtgForm.get(fieldName);

    return !!(field && field.invalid && field.touched);

  }



  // Method to get current form data for route config

  getCurrentFormData(): any {

    if (!this.gtgForm) {

      return {};

    }

    

    const formData = this.gtgForm.value;

    

    // Helper function to format date or return null for empty values

    const formatDateOrNull = (dateValue: any): string | null => {

      if (!dateValue || dateValue === '' || dateValue === null || dateValue === undefined) {

        return null;

      }

      // If it's already in YYYY-MM-DD format, return as is

      if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {

        return dateValue;

      }

      // If it's a Date object, format it

      if (dateValue instanceof Date) {

        return dateValue.toISOString().split('T')[0];

      }

      // For any other format, try to parse and format

      try {

        const date = new Date(dateValue);

        if (!isNaN(date.getTime())) {

          return date.toISOString().split('T')[0];

        }

      } catch (e) {

        console.warn('Invalid date format:', dateValue);

      }

      return null;

    };

    

    const payload = {

      // Add draft_status key based on submission type

      "draft_status": this.submissionType === 'draft' ? 'draft' : 'save',

      "Presented_by": formData.presentedBy,

      "trial_date": formatDateOrNull(formData.trial_date),

      "occation_of_trial": formData.occasionOfTrials,

      "occationOfCurrTrial": formData.occasionOfCurrentTrial,

      "lastTrialDate": formatDateOrNull(formData.dateOfLastTrial),

      "ship": formData.ship,

      "proposal_reference": formData.proposalReference,

      "file_reference": formData.fileReference,

      "referanceDocID": formData.referenceDocument,

      "engn_make": formData.engineMake,

      "engn_model_SrNo": formData.engineModelSerialNo,

      "engn_rpm_val": formData.engineRpmValue,

      "govnr_make": formData.governorMake,

      "govnr_model_SrNo": formData.governorModelSerialNo,

      "govnr_type": formData.governorType,

      "altnr_make": formData.alternatorMake,

      "altnr_model_SrNo": formData.alternatorModelSerialNo,

      "altnr_type": formData.alternatorType,

      "altnr_RatedVoltage": formData.alternatorRatedVoltage,

      "altnr_RatedFrequency": formData.alternatorRatedFrequency,

      "altnr_RatedVal": formData.alternatorRatedValue,

      "altnr_RatedCurrentVal": formData.alternatorRatedCurrentValue,

      "altnr_BearingNo": formData.alternatorBearingNo,

      "avr_make_type": formData.avrMakeType,

      "avr_model_SrNo": formData.avrModelSerialNo,

      "spplyBrkr_make": formData.supplyBreakerMake,

      "spplyBrkr_model_srno": formData.supplyBreakerModelSerialNo,

      "spplyBrkr_RatedCpcty": formData.supplyBreakerRatedCapacity

    };

    

    return payload;

  }



  // Voltage Balance Test calculation methods

  calculateVoltageDifference(ry: string, yb: string, br: string): string {

    const voltages = [parseFloat(ry || '0'), parseFloat(yb || '0'), parseFloat(br || '0')];

    const max = Math.max(...voltages);

    const min = Math.min(...voltages);

    const difference = max - min;

    return difference.toFixed(2);

  }



  calculatePermissibleLimit(ry: string, yb: string, br: string): string {

    const voltages = [parseFloat(ry || '0'), parseFloat(yb || '0'), parseFloat(br || '0')];

    const average = voltages.reduce((sum, voltage) => sum + voltage, 0) / 3;

    const permissibleLimit = average * 0.01; // 1% of average

    return permissibleLimit.toFixed(2);

  }

}

