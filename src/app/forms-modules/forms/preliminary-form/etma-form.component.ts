import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DynamicTableComponent, TableColumn } from '../../shared/components/dynamic-table/dynamic-table.component';
import { PreliminaryFormTableComponent } from './preliminary-form-table.component';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { RouteConfigComponent } from '../../../route-config/route-config.component';
import { RouteConfigPopupComponent } from '../../../shared/components/route-config-popup/route-config-popup.component';

@Component({
  selector: 'app-etma-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DynamicTableComponent, PreliminaryFormTableComponent, RouteConfigComponent, RouteConfigPopupComponent],
  templateUrl: './etma-form.component.html',
  styleUrl: './etma-form.component.css'
})
export class EtmaFormComponent implements OnInit {
  @Input() formOnlyMode: boolean = false; // Input to control if only form should be shown
  @Input() recordData: any = null; // Input for record data from Commentor Sheet
  @Input() mode: 'add' | 'edit' | 'view' = 'add'; // Input for mode
  @Input() record: any = null; // Input for record
  @Input() formData: any = {}; // Input for form data
  @Input() transactionId: string | number | undefined = undefined; // Input for transaction ID
  @Input() submodule: number = 4; // Input for submodule (Preliminary form submodule)
  @Input() isViewMode: boolean = false; // Input for view mode
  etmaForm: FormGroup;
  showTableView: boolean = true; // Default to table view
  ships: any[] = [];
  loading: boolean = false;
  isAddMode = false; // Track if we're in add mode
  showRouteConfigPopup = false; // Control route config popup visibility
  showRouteConfigModal = false; // Control full route config modal visibility
  pendingAction: 'save' | 'saveDraft' | null = null; // Track pending action
  userInitiatedAction = false; // Track if user initiated the action
  isLoadingFormData = false; // Track if we're currently loading form data

  // Table column configurations
  inspectorColumns: TableColumn[] = [
    { key: 'srNo', label: 'Sr No.', colSpan: 1 },
    { key: 'name', label: 'Name', required: true, colSpan: 4 },
    { key: 'rank', label: 'Rank', required: true, colSpan: 3 },
    { key: 'designation', label: 'Designation', required: true, colSpan: 4 }
  ];

  observationColumns: TableColumn[] = [
    { key: 'srNo', label: 'Sr No.', colSpan: 1 },
    { key: 'observation', label: 'Observation', required: true, colSpan: 6 },
    { key: 'remarks', label: 'Remarks', required: true, colSpan: 5 }
  ];

  simpleObservationColumns: TableColumn[] = [
    { key: 'observation', label: 'Observation', colSpan: 6 },
    { key: 'remarks', label: 'Remarks', colSpan: 6 }
  ];

  dropdownObservationColumns: TableColumn[] = [
    { key: 'observation', label: 'Observation', colSpan: 6, type: 'select' },
    { key: 'remarks', label: 'Remarks', colSpan: 6 }
  ];

  fileUploadColumns: TableColumn[] = [
    { key: 'srNo', label: 'Sr No.', colSpan: 1 },
    { key: 'fileUpload', label: 'Observation*', colSpan: 3, type: 'file' },
    { key: 'signature', label: 'Remarks*', colSpan: 2 },
    { key: 'name', label: 'Name*', colSpan: 2 },
    { key: 'rank', label: 'Rank*', colSpan: 2 },
    { key: 'designation', label: 'Designation*', colSpan: 2 }
  ];

  constructor(private fb: FormBuilder, private apiService: ApiService, private toastService: ToastService, private router: Router, private cd: ChangeDetectorRef) {
    this.etmaForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // Record ID for edit mode
      id: [''],
      // Preliminary Underwater Hull Inspection
      inspectionType: ['', Validators.required],
      inspectionDate: ['', Validators.required],
      inspectionAuthority: ['', Validators.required],
      inspectors: this.fb.array([]),

      // Docking
      dockingVersion: ['', Validators.required],
      natureOfDocking: ['', Validators.required],
      dockBlocksWedged: ['', Validators.required],
      dockBlocksCrushed: ['', Validators.required],
      uwOpeningsClear: ['', Validators.required],
      dockingDuration: ['', Validators.required],

      // Underwater Cleaning
      marineGrowthObservations: this.fb.array([]),
      propellerCleaningObservations: this.fb.array([]),
      foreignObjectsObservations: this.fb.array([]),

      // Painting
      conditionOfAFObservations: this.fb.array([]),
      outerBottomObservations: this.fb.array([]),
      sternAftCutupObservations: this.fb.array([]),
      bootTopObservations: this.fb.array([]),
      ruddersObservations: this.fb.array([]),
      stabilizersObservations: this.fb.array([]),

      // Additional Painting sections
      oldDockBlockAreasObservations: this.fb.array([]),
      otherObservations: this.fb.array([]),
      paintSchemeObservations: this.fb.array([]),

      // Rusting & Corrosion
      areasHavingRustObservations: this.fb.array([]),
      generalOuterBottomObservations: this.fb.array([]),
      bootTopRustObservations: this.fb.array([]),
      sternAftCutupRustObservations: this.fb.array([]),
      bilgeKeelObservations: this.fb.array([]),
      oldDockBlockRustObservations: this.fb.array([]),
      otherRustObservations: this.fb.array([]),
      ruddersRustObservations: this.fb.array([]),

      // Structure
      extentOfHullSurvey: ['', Validators.required],
      dentsAtObservations: this.fb.array([]),
      suspectCracksObservations: this.fb.array([]),
      deepScratchObservations: this.fb.array([]),
      holesDoublersObservations: this.fb.array([]),
      otherStructureObservations: this.fb.array([]),
      structuralDefectsObservations: this.fb.array([]),
      stabilizersSurveyObservations: this.fb.array([]),

      // Sonar Dome
      cleanShipObservations: this.fb.array([]),
      cracksDentsFoulingObservations: this.fb.array([]),
      grpDomeObservations: this.fb.array([]),
      fairingSkirtObservations: this.fb.array([]),

      // Rudder
      rudderCracksObservations: this.fb.array([]),
      rudderMisalignmentObservations: this.fb.array([]),

      // Cathodic Protection System
      iccpSystemObservations: this.fb.array([]),
      sacrificialAnodesObservations: this.fb.array([]),
      iccpAnodesObservations: this.fb.array([]),
      iccpReferenceElectrodeObservations: this.fb.array([]),
      dielectricShieldsObservations: this.fb.array([]),
      preDockingChecksObservations: this.fb.array([]),

      // Propellers
      propellerCleaningObservations2: this.fb.array([]),
      propellerBladeEdgesObservations: this.fb.array([]),
      propellerHubsObservations: this.fb.array([]),
      propellerPittingObservations: this.fb.array([]),
      propellerShaftCoatingObservations: this.fb.array([]),

      // Miscellaneous
      eddyConeObservations: this.fb.array([]),
      waterSeepageObservations: this.fb.array([]),
      missingPartsObservations: this.fb.array([]),
      blankingPartsObservations: this.fb.array([]),
      scupperLipsObservations: this.fb.array([]),
      aralditeFairingObservations: this.fb.array([]),
      angleOfListObservations: this.fb.array([]),

      // Other observations
      // Approval checkbox
      isApprover: [false]
    });
  }

  createInspectorRow(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      rank: ['', Validators.required],
      designation: ['', Validators.required]
    });
  }

  createObservationRow(): FormGroup {

    const row = this.fb.group({
      id: [''],
      observation: [''], // Remove required validation
      remarks: [''] // Remove required validation
    });
    return row;
  }

  createSimpleObservationRow(): FormGroup {
    return this.fb.group({
      observation: [''],
      remarks: ['']
    });
  }

  createDropdownObservationRow(): FormGroup {
    return this.fb.group({
      observation: [''],
      remarks: ['']
    });
  }

  createFileUploadRow(): FormGroup {
    return this.fb.group({
      fileUpload: [''],
      signature: [''],
      name: ['', Validators.required],
      rank: ['', Validators.required],
      designation: ['', Validators.required]
    });
  }

  // Getters for form arrays
  get inspectors(): FormArray {
    return this.etmaForm.get('inspectors') as FormArray;
  }

  get marineGrowthObservations(): FormArray {
    return this.etmaForm.get('marineGrowthObservations') as FormArray;
  }

  get propellerCleaningObservations(): FormArray {
    return this.etmaForm.get('propellerCleaningObservations') as FormArray;
  }

  get foreignObjectsObservations(): FormArray {
    return this.etmaForm.get('foreignObjectsObservations') as FormArray;
  }

  // Painting form arrays
  get conditionOfAFObservations(): FormArray {
    return this.etmaForm.get('conditionOfAFObservations') as FormArray;
  }

  get outerBottomObservations(): FormArray {
    return this.etmaForm.get('outerBottomObservations') as FormArray;
  }

  get sternAftCutupObservations(): FormArray {
    return this.etmaForm.get('sternAftCutupObservations') as FormArray;
  }

  get bootTopObservations(): FormArray {
    return this.etmaForm.get('bootTopObservations') as FormArray;
  }

  get ruddersObservations(): FormArray {
    return this.etmaForm.get('ruddersObservations') as FormArray;
  }

  get stabilizersObservations(): FormArray {
    return this.etmaForm.get('stabilizersObservations') as FormArray;
  }

  // Additional Painting form arrays
  get oldDockBlockAreasObservations(): FormArray {
    return this.etmaForm.get('oldDockBlockAreasObservations') as FormArray;
  }

  get otherObservations(): FormArray {
    return this.etmaForm.get('otherObservations') as FormArray;
  }

  get paintSchemeObservations(): FormArray {
    return this.etmaForm.get('paintSchemeObservations') as FormArray;
  }

  // Rusting & Corrosion form arrays
  get areasHavingRustObservations(): FormArray {
    return this.etmaForm.get('areasHavingRustObservations') as FormArray;
  }

  get generalOuterBottomObservations(): FormArray {
    return this.etmaForm.get('generalOuterBottomObservations') as FormArray;
  }

  get bootTopRustObservations(): FormArray {
    return this.etmaForm.get('bootTopRustObservations') as FormArray;
  }

  get sternAftCutupRustObservations(): FormArray {
    return this.etmaForm.get('sternAftCutupRustObservations') as FormArray;
  }

  get bilgeKeelObservations(): FormArray {
    return this.etmaForm.get('bilgeKeelObservations') as FormArray;
  }

  get oldDockBlockRustObservations(): FormArray {
    return this.etmaForm.get('oldDockBlockRustObservations') as FormArray;
  }

  get otherRustObservations(): FormArray {
    return this.etmaForm.get('otherRustObservations') as FormArray;
  }

  get ruddersRustObservations(): FormArray {
    return this.etmaForm.get('ruddersRustObservations') as FormArray;
  }

  // Structure form arrays
  get dentsAtObservations(): FormArray {
    return this.etmaForm.get('dentsAtObservations') as FormArray;
  }

  get suspectCracksObservations(): FormArray {
    return this.etmaForm.get('suspectCracksObservations') as FormArray;
  }

  get deepScratchObservations(): FormArray {
    return this.etmaForm.get('deepScratchObservations') as FormArray;
  }

  get holesDoublersObservations(): FormArray {
    return this.etmaForm.get('holesDoublersObservations') as FormArray;
  }

  get otherStructureObservations(): FormArray {
    return this.etmaForm.get('otherStructureObservations') as FormArray;
  }

  get structuralDefectsObservations(): FormArray {
    return this.etmaForm.get('structuralDefectsObservations') as FormArray;
  }

  get stabilizersSurveyObservations(): FormArray {
    return this.etmaForm.get('stabilizersSurveyObservations') as FormArray;
  }

  // Sonar Dome form arrays
  get cleanShipObservations(): FormArray {
    return this.etmaForm.get('cleanShipObservations') as FormArray;
  }

  get cracksDentsFoulingObservations(): FormArray {
    return this.etmaForm.get('cracksDentsFoulingObservations') as FormArray;
  }

  get grpDomeObservations(): FormArray {
    return this.etmaForm.get('grpDomeObservations') as FormArray;
  }

  get fairingSkirtObservations(): FormArray {
    return this.etmaForm.get('fairingSkirtObservations') as FormArray;
  }

  // Rudder form arrays
  get rudderCracksObservations(): FormArray {
    return this.etmaForm.get('rudderCracksObservations') as FormArray;
  }

  get rudderMisalignmentObservations(): FormArray {
    return this.etmaForm.get('rudderMisalignmentObservations') as FormArray;
  }

  // Cathodic Protection System form arrays
  get iccpSystemObservations(): FormArray {
    return this.etmaForm.get('iccpSystemObservations') as FormArray;
  }

  get sacrificialAnodesObservations(): FormArray {
    return this.etmaForm.get('sacrificialAnodesObservations') as FormArray;
  }

  get iccpAnodesObservations(): FormArray {
    return this.etmaForm.get('iccpAnodesObservations') as FormArray;
  }

  get iccpReferenceElectrodeObservations(): FormArray {
    return this.etmaForm.get('iccpReferenceElectrodeObservations') as FormArray;
  }

  get dielectricShieldsObservations(): FormArray {
    return this.etmaForm.get('dielectricShieldsObservations') as FormArray;
  }

  get preDockingChecksObservations(): FormArray {
    return this.etmaForm.get('preDockingChecksObservations') as FormArray;
  }

  // Propellers form arrays
  get propellerCleaningObservations2(): FormArray {
    return this.etmaForm.get('propellerCleaningObservations2') as FormArray;
  }

  get propellerBladeEdgesObservations(): FormArray {
    return this.etmaForm.get('propellerBladeEdgesObservations') as FormArray;
  }

  get propellerHubsObservations(): FormArray {
    return this.etmaForm.get('propellerHubsObservations') as FormArray;
  }

  get propellerPittingObservations(): FormArray {
    return this.etmaForm.get('propellerPittingObservations') as FormArray;
  }

  get propellerShaftCoatingObservations(): FormArray {
    return this.etmaForm.get('propellerShaftCoatingObservations') as FormArray;
  }

  // Miscellaneous form arrays
  get eddyConeObservations(): FormArray {
    return this.etmaForm.get('eddyConeObservations') as FormArray;
  }

  get waterSeepageObservations(): FormArray {
    return this.etmaForm.get('waterSeepageObservations') as FormArray;
  }

  get missingPartsObservations(): FormArray {
    return this.etmaForm.get('missingPartsObservations') as FormArray;
  }

  get blankingPartsObservations(): FormArray {
    return this.etmaForm.get('blankingPartsObservations') as FormArray;
  }

  get scupperLipsObservations(): FormArray {
    return this.etmaForm.get('scupperLipsObservations') as FormArray;
  }

  get aralditeFairingObservations(): FormArray {
    return this.etmaForm.get('aralditeFairingObservations') as FormArray;
  }

  get angleOfListObservations(): FormArray {
    return this.etmaForm.get('angleOfListObservations') as FormArray;
  }

  // Other observations form array

  // Methods to add/remove rows
  addInspectorRow() {
    this.inspectors.push(this.createInspectorRow());
  }

  removeInspectorRow(index: number) {
    if (this.inspectors.length > 1) {
      this.inspectors.removeAt(index);
    }
  }

  addMarineGrowthRow() {
    this.marineGrowthObservations.push(this.createObservationRow());
  }

  removeMarineGrowthRow(index: number) {
    if (this.marineGrowthObservations.length > 1) {
      this.marineGrowthObservations.removeAt(index);
    }
  }

  addPropellerCleaningRow() {
    this.propellerCleaningObservations.push(this.createObservationRow());
  }

  removePropellerCleaningRow(index: number) {
    if (this.propellerCleaningObservations.length > 1) {
      this.propellerCleaningObservations.removeAt(index);
    }
  }

  addForeignObjectsRow() {
    this.foreignObjectsObservations.push(this.createObservationRow());
  }

  removeForeignObjectsRow(index: number) {
    if (this.foreignObjectsObservations.length > 1) {
      this.foreignObjectsObservations.removeAt(index);
    }
  }

  // Update row counts
  updateInspectorRows(count: number) {
    const currentLength = this.inspectors.length;
    if (count > currentLength) {
      // Add all rows at once for better performance
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createInspectorRow());
      newRows.forEach(row => this.inspectors.push(row));
    } else if (count < currentLength && count > 0) {
      // Remove rows from the end
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.inspectors.removeAt(this.inspectors.length - 1);
      }
    }
  }

  updateMarineGrowthRows(count: number) {
    const currentLength = this.marineGrowthObservations.length;
    
    if (count > currentLength) {
      // Add all rows at once for better performance
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.marineGrowthObservations.push(row));
    } else if (count < currentLength && count > 0) {
      // Remove rows from the end
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.marineGrowthObservations.removeAt(this.marineGrowthObservations.length - 1);
      }
    }
  }

  updatePropellerCleaningRows(count: number) {
    const currentLength = this.propellerCleaningObservations.length;
    
    if (count > currentLength) {
      // Add all rows at once for better performance
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.propellerCleaningObservations.push(row));
    } else if (count < currentLength && count > 0) {
      // Remove rows from the end
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.propellerCleaningObservations.removeAt(this.propellerCleaningObservations.length - 1);
      }
    }
  }

  updateForeignObjectsRows(count: number) {
    const currentLength = this.foreignObjectsObservations.length;
    
    if (count > currentLength) {
      // Add all rows at once for better performance
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.foreignObjectsObservations.push(row));
    } else if (count < currentLength && count > 0) {
      // Remove rows from the end
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.foreignObjectsObservations.removeAt(this.foreignObjectsObservations.length - 1);
      }
    }
  }

  // Painting section update methods
  updateConditionOfAFRows(count: number) {
    const currentLength = this.conditionOfAFObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.conditionOfAFObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.conditionOfAFObservations.removeAt(this.conditionOfAFObservations.length - 1);
      }
    }
  }

  updateOuterBottomRows(count: number) {
    const currentLength = this.outerBottomObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.outerBottomObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.outerBottomObservations.removeAt(this.outerBottomObservations.length - 1);
      }
    }
  }

  updateSternAftCutupRows(count: number) {
    const currentLength = this.sternAftCutupObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.sternAftCutupObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.sternAftCutupObservations.removeAt(this.sternAftCutupObservations.length - 1);
      }
    }
  }

  updateBootTopRows(count: number) {
    const currentLength = this.bootTopObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.bootTopObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.bootTopObservations.removeAt(this.bootTopObservations.length - 1);
      }
    }
  }

  updateRuddersRows(count: number) {
    const currentLength = this.ruddersObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.ruddersObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.ruddersObservations.removeAt(this.ruddersObservations.length - 1);
      }
    }
  }

  updateStabilizersRows(count: number) {
    const currentLength = this.stabilizersObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.stabilizersObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.stabilizersObservations.removeAt(this.stabilizersObservations.length - 1);
      }
    }
  }

  // Additional Painting section update methods
  updateOldDockBlockAreasRows(count: number) {
    const currentLength = this.oldDockBlockAreasObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.oldDockBlockAreasObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.oldDockBlockAreasObservations.removeAt(this.oldDockBlockAreasObservations.length - 1);
      }
    }
  }

  updateOtherObservationsRows(count: number) {
    const currentLength = this.otherObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.otherObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.otherObservations.removeAt(this.otherObservations.length - 1);
      }
    }
  }

  updatePaintSchemeRows(count: number) {
    const currentLength = this.paintSchemeObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.paintSchemeObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.paintSchemeObservations.removeAt(this.paintSchemeObservations.length - 1);
      }
    }
  }

  // Rusting & Corrosion section update methods
  updateAreasHavingRustRows(count: number) {
    const currentLength = this.areasHavingRustObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.areasHavingRustObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.areasHavingRustObservations.removeAt(this.areasHavingRustObservations.length - 1);
      }
    }
  }

  updateGeneralOuterBottomRows(count: number) {
    const currentLength = this.generalOuterBottomObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.generalOuterBottomObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.generalOuterBottomObservations.removeAt(this.generalOuterBottomObservations.length - 1);
      }
    }
  }

  updateBootTopRustRows(count: number) {
    const currentLength = this.bootTopRustObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.bootTopRustObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.bootTopRustObservations.removeAt(this.bootTopRustObservations.length - 1);
      }
    }
  }

  updateSternAftCutupRustRows(count: number) {
    const currentLength = this.sternAftCutupRustObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.sternAftCutupRustObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.sternAftCutupRustObservations.removeAt(this.sternAftCutupRustObservations.length - 1);
      }
    }
  }

  updateBilgeKeelRows(count: number) {
    const currentLength = this.bilgeKeelObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.bilgeKeelObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.bilgeKeelObservations.removeAt(this.bilgeKeelObservations.length - 1);
      }
    }
  }

  updateOldDockBlockRustRows(count: number) {
    const currentLength = this.oldDockBlockRustObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.oldDockBlockRustObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.oldDockBlockRustObservations.removeAt(this.oldDockBlockRustObservations.length - 1);
      }
    }
  }

  updateOtherRustRows(count: number) {
    const currentLength = this.otherRustObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.otherRustObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.otherRustObservations.removeAt(this.otherRustObservations.length - 1);
      }
    }
  }

  updateRuddersRustRows(count: number) {
    const currentLength = this.ruddersRustObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.ruddersRustObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.ruddersRustObservations.removeAt(this.ruddersRustObservations.length - 1);
      }
    }
  }

  // Structure section update methods
  updateDentsAtRows(count: number) {
    const currentLength = this.dentsAtObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.dentsAtObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.dentsAtObservations.removeAt(this.dentsAtObservations.length - 1);
      }
    }
  }

  updateSuspectCracksRows(count: number) {
    const currentLength = this.suspectCracksObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.suspectCracksObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.suspectCracksObservations.removeAt(this.suspectCracksObservations.length - 1);
      }
    }
  }

  updateDeepScratchRows(count: number) {
    const currentLength = this.deepScratchObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.deepScratchObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.deepScratchObservations.removeAt(this.deepScratchObservations.length - 1);
      }
    }
  }

  updateHolesDoublersRows(count: number) {
    const currentLength = this.holesDoublersObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.holesDoublersObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.holesDoublersObservations.removeAt(this.holesDoublersObservations.length - 1);
      }
    }
  }

  updateOtherStructureRows(count: number) {
    const currentLength = this.otherStructureObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.otherStructureObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.otherStructureObservations.removeAt(this.otherStructureObservations.length - 1);
      }
    }
  }

  updateStructuralDefectsRows(count: number) {
    const currentLength = this.structuralDefectsObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.structuralDefectsObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.structuralDefectsObservations.removeAt(this.structuralDefectsObservations.length - 1);
      }
    }
  }

  updateStabilizersSurveyRows(count: number) {
    const currentLength = this.stabilizersSurveyObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.stabilizersSurveyObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.stabilizersSurveyObservations.removeAt(this.stabilizersSurveyObservations.length - 1);
      }
    }
  }

  // Sonar Dome section update methods
  updateCleanShipRows(count: number) {
    const currentLength = this.cleanShipObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createSimpleObservationRow());
      newRows.forEach(row => this.cleanShipObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.cleanShipObservations.removeAt(this.cleanShipObservations.length - 1);
      }
    }
  }

  updateCracksDentsFoulingRows(count: number) {
    const currentLength = this.cracksDentsFoulingObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createSimpleObservationRow());
      newRows.forEach(row => this.cracksDentsFoulingObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.cracksDentsFoulingObservations.removeAt(this.cracksDentsFoulingObservations.length - 1);
      }
    }
  }

  updateGrpDomeRows(count: number) {
    const currentLength = this.grpDomeObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createSimpleObservationRow());
      newRows.forEach(row => this.grpDomeObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.grpDomeObservations.removeAt(this.grpDomeObservations.length - 1);
      }
    }
  }

  updateFairingSkirtRows(count: number) {
    const currentLength = this.fairingSkirtObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createSimpleObservationRow());
      newRows.forEach(row => this.fairingSkirtObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.fairingSkirtObservations.removeAt(this.fairingSkirtObservations.length - 1);
      }
    }
  }

  // Rudder section update methods
  updateRudderCracksRows(count: number) {
    const currentLength = this.rudderCracksObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.rudderCracksObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.rudderCracksObservations.removeAt(this.rudderCracksObservations.length - 1);
      }
    }
  }

  updateRudderMisalignmentRows(count: number) {
    const currentLength = this.rudderMisalignmentObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.rudderMisalignmentObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.rudderMisalignmentObservations.removeAt(this.rudderMisalignmentObservations.length - 1);
      }
    }
  }

  // Cathodic Protection System section update methods
  updateIccpSystemRows(count: number) {
    const currentLength = this.iccpSystemObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createDropdownObservationRow());
      newRows.forEach(row => this.iccpSystemObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.iccpSystemObservations.removeAt(this.iccpSystemObservations.length - 1);
      }
    }
  }

  updateSacrificialAnodesRows(count: number) {
    const currentLength = this.sacrificialAnodesObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createDropdownObservationRow());
      newRows.forEach(row => this.sacrificialAnodesObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.sacrificialAnodesObservations.removeAt(this.sacrificialAnodesObservations.length - 1);
      }
    }
  }

  updateIccpAnodesRows(count: number) {
    const currentLength = this.iccpAnodesObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createDropdownObservationRow());
      newRows.forEach(row => this.iccpAnodesObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.iccpAnodesObservations.removeAt(this.iccpAnodesObservations.length - 1);
      }
    }
  }

  updateIccpReferenceElectrodeRows(count: number) {
    const currentLength = this.iccpReferenceElectrodeObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createDropdownObservationRow());
      newRows.forEach(row => this.iccpReferenceElectrodeObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.iccpReferenceElectrodeObservations.removeAt(this.iccpReferenceElectrodeObservations.length - 1);
      }
    }
  }

  updateDielectricShieldsRows(count: number) {
    const currentLength = this.dielectricShieldsObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createDropdownObservationRow());
      newRows.forEach(row => this.dielectricShieldsObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.dielectricShieldsObservations.removeAt(this.dielectricShieldsObservations.length - 1);
      }
    }
  }

  updatePreDockingChecksRows(count: number) {
    const currentLength = this.preDockingChecksObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createDropdownObservationRow());
      newRows.forEach(row => this.preDockingChecksObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.preDockingChecksObservations.removeAt(this.preDockingChecksObservations.length - 1);
      }
    }
  }

  // Propellers section update methods
  updatePropellerCleaning2Rows(count: number) {
    const currentLength = this.propellerCleaningObservations2.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.propellerCleaningObservations2.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.propellerCleaningObservations2.removeAt(this.propellerCleaningObservations2.length - 1);
      }
    }
  }

  updatePropellerBladeEdgesRows(count: number) {
    const currentLength = this.propellerBladeEdgesObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.propellerBladeEdgesObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.propellerBladeEdgesObservations.removeAt(this.propellerBladeEdgesObservations.length - 1);
      }
    }
  }

  updatePropellerHubsRows(count: number) {
    const currentLength = this.propellerHubsObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.propellerHubsObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.propellerHubsObservations.removeAt(this.propellerHubsObservations.length - 1);
      }
    }
  }

  updatePropellerPittingRows(count: number) {
    const currentLength = this.propellerPittingObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.propellerPittingObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.propellerPittingObservations.removeAt(this.propellerPittingObservations.length - 1);
      }
    }
  }

  updatePropellerShaftCoatingRows(count: number) {
    const currentLength = this.propellerShaftCoatingObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.propellerShaftCoatingObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.propellerShaftCoatingObservations.removeAt(this.propellerShaftCoatingObservations.length - 1);
      }
    }
  }

  // Miscellaneous section update methods
  updateEddyConeRows(count: number) {
    const currentLength = this.eddyConeObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.eddyConeObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.eddyConeObservations.removeAt(this.eddyConeObservations.length - 1);
      }
    }
  }

  updateWaterSeepageRows(count: number) {
    const currentLength = this.waterSeepageObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.waterSeepageObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.waterSeepageObservations.removeAt(this.waterSeepageObservations.length - 1);
      }
    }
  }

  updateMissingPartsRows(count: number) {
    const currentLength = this.missingPartsObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.missingPartsObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.missingPartsObservations.removeAt(this.missingPartsObservations.length - 1);
      }
    }
  }

  updateBlankingPartsRows(count: number) {
    const currentLength = this.blankingPartsObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.blankingPartsObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.blankingPartsObservations.removeAt(this.blankingPartsObservations.length - 1);
      }
    }
  }

  updateScupperLipsRows(count: number) {
    const currentLength = this.scupperLipsObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.scupperLipsObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.scupperLipsObservations.removeAt(this.scupperLipsObservations.length - 1);
      }
    }
  }

  updateAralditeFairingRows(count: number) {
    const currentLength = this.aralditeFairingObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.aralditeFairingObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.aralditeFairingObservations.removeAt(this.aralditeFairingObservations.length - 1);
      }
    }
  }

  updateAngleOfListRows(count: number) {
    const currentLength = this.angleOfListObservations.length;
    
    if (count > currentLength) {
      const rowsToAdd = count - currentLength;
      const newRows = Array.from({ length: rowsToAdd }, () => this.createObservationRow());
      newRows.forEach(row => this.angleOfListObservations.push(row));
    } else if (count < currentLength && count > 0) {
      const rowsToRemove = currentLength - count;
      for (let i = 0; i < rowsToRemove; i++) {
        this.angleOfListObservations.removeAt(this.angleOfListObservations.length - 1);
      }
    }
  }


  ngOnInit(): void {
    console.log('🔍 ngOnInit called');
    console.log('🔍 formOnlyMode:', this.formOnlyMode);
    console.log('🔍 mode:', this.mode);
    console.log('🔍 recordData:', this.recordData);
    console.log('🔍 formData:', this.formData);
    console.log('🔍 Form initialized:', this.etmaForm.value);
    
    // Add value change subscription for debugging
    this.etmaForm.valueChanges.subscribe(value => {
      if (value.inspectionType) {
        console.log('🔍 Form inspectionType changed to:', value.inspectionType);
      }
    });
    
    // Add subscription to specific observation arrays
    this.marineGrowthObservations.valueChanges.subscribe(value => {
      console.log('🔍 Marine growth observations changed:', value);
    });
    
    this.propellerCleaningObservations.valueChanges.subscribe(value => {
      console.log('🔍 Propeller cleaning observations changed:', value);
    });
    
    // Initialize with 0 rows (empty arrays)
    this.updateInspectorRows(0);
    this.updateMarineGrowthRows(0);
    this.updatePropellerCleaningRows(0);
    this.updateForeignObjectsRows(0);
    this.updateConditionOfAFRows(0);
    this.updateOuterBottomRows(0);
    this.updateSternAftCutupRows(0);
    this.updateBootTopRows(0);
    this.updateRuddersRows(0);
    this.updateStabilizersRows(0);
    this.updateOldDockBlockAreasRows(0);
    this.updateOtherObservationsRows(0);
    this.updatePaintSchemeRows(0);
    this.updateAreasHavingRustRows(0);
    this.updateGeneralOuterBottomRows(0);
    this.updateBootTopRustRows(0);
    this.updateSternAftCutupRustRows(0);
    this.updateBilgeKeelRows(0);
    this.updateOldDockBlockRustRows(0);
    this.updateOtherRustRows(0);
    this.updateRuddersRustRows(0);
    this.updateDentsAtRows(0);
    this.updateSuspectCracksRows(0);
    this.updateDeepScratchRows(0);
    this.updateHolesDoublersRows(0);
    this.updateOtherStructureRows(0);
    this.updateStructuralDefectsRows(0);
    this.updateStabilizersSurveyRows(0);
    this.updateCleanShipRows(0);
    this.updateCracksDentsFoulingRows(0);
    this.updateGrpDomeRows(0);
    this.updateFairingSkirtRows(0);
    this.updateRudderCracksRows(0);
    this.updateRudderMisalignmentRows(0);
    this.updateIccpSystemRows(0);
    this.updateSacrificialAnodesRows(0);
    this.updateIccpAnodesRows(0);
    this.updateIccpReferenceElectrodeRows(0);
    this.updateDielectricShieldsRows(0);
    this.updatePreDockingChecksRows(0);
    this.updatePropellerCleaning2Rows(0);
    this.updatePropellerBladeEdgesRows(0);
    this.updatePropellerHubsRows(0);
    this.updatePropellerPittingRows(0);
    this.updatePropellerShaftCoatingRows(0);
    this.updateEddyConeRows(0);
    this.updateWaterSeepageRows(0);
    this.updateMissingPartsRows(0);
    this.updateBlankingPartsRows(0);
    this.updateScupperLipsRows(0);
    this.updateAralditeFairingRows(0);
    this.updateAngleOfListRows(0);
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
        // Ensure ships are loaded first, then load form data
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

  // Ship API integration
  loadShips(): void {
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
      },
      error: (error) => {
        console.error('🔍 Error loading ships:', error);
        this.loading = false;
      }
    });
  }

  // Route Config Event Handlers
  // Enhanced Form Event Handlers
  onEditForm(formData: any): void {
    console.log('🔍 onEditForm called - Form:', formData);
    
    // If form is empty (add mode), stay in the same component
    if (!formData || !formData.id) {
      console.log('🔍 Add mode - staying in same component');
      this.showTableView = false;
      this.isAddMode = true;
      this.userInitiatedAction = false;
      this.showRouteConfigPopup = false;
      this.showRouteConfigModal = false;
      this.pendingAction = null;
      this.etmaForm.reset();
      
      // Ensure ships are loaded for dropdown
      if (this.ships.length === 0) {
        this.loadShips();
      }
      return;
    }
    
    // If form has ID (edit mode), navigate to Commentor Sheet
    console.log('🔍 Edit mode - Navigating to Commentor Sheet');
    this.router.navigate(['/preliminary-commentor-sheet'], {
      queryParams: {
        mode: 'edit',
        id: formData.id,
        formData: JSON.stringify(formData)
      }
    });
  }

  onViewForm(formData: any): void {
    console.log('🔍 onViewForm called - Navigating to Commentor Sheet');
    // Navigate to Commentor Sheet with view mode and form data
    this.router.navigate(['/preliminary-commentor-sheet'], {
      queryParams: {
        mode: 'view',
        id: formData.id,
        formData: JSON.stringify(formData)
      }
    });
  }

  goBackToList(): void {
    console.log('🔍 goBackToList called - Navigating back to main Preliminary Form page');
    // Navigate back to the main Preliminary Form page
    this.router.navigate(['/forms/hitu/preliminary-form']);
  }

  onAddForm(): void {
    console.log('🔍 onAddForm called');
    
    this.isAddMode = true;
    this.isLoadingFormData = true;
    this.userInitiatedAction = true;
    this.showTableView = false;
    
    // Prevent automatic popup triggers
    setTimeout(() => {
      this.userInitiatedAction = false;
      this.isLoadingFormData = false;
    }, 100);
    
    // Reset form for new entry
    this.resetForm();
    this.etmaForm.enable();
  }

  onDeleteForm(formData: any): void {
    // Handle delete confirmation and API call
    if (formData.id) {
      this.apiService.delete(`/hitu/preliminary-underwater-hull-inspection-reports/${formData.id}/`).subscribe({
        next: () => {
          this.toastService.showSuccess('Form deleted successfully');
          // Refresh table or handle UI update
        },
        error: (error) => {
          console.error('Error deleting form:', error);
          this.toastService.showError('Error deleting form');
        }
      });
    }
  }

  onTabChanged(event: {tabId: string, draftStatus: string, apiUrl: string}): void {

    // Handle tab change - the table component will handle the API call
  }

  private loadFormData(formData: any): void {
    console.log('🔍 loadFormData called with:', formData);
    console.log('🔍 Ship object:', formData.ship);
    console.log('🔍 Ship ID:', formData.ship?.id);
    console.log('🔍 Ship name:', formData.ship?.name);
    
    // Create mapped data object - using the actual field names from the data
    const mappedData = {
      id: formData.id,
      inspectionType: formData.ship?.id || formData.ship_id || formData.inspectionType, // Map ship ID to inspectionType field
      inspectionDate: formData.dt_inspection || formData.inspectionDate, // Try both field names
      inspectionAuthority: formData.authority_for_inspection || formData.inspectionAuthority || formData.auth_inspection, // Try multiple field names
      dockingVersion: formData.docking_version || formData.dockingVersion, // Try both field names
      natureOfDocking: formData.nature_of_docking || formData.natureOfDocking, // Try both field names
      dockBlocksWedged: formData.no_of_dock_blocks_wedged || formData.dockBlocksWedged, // Try both field names
      dockBlocksCrushed: formData.no_of_dock_blocks_crushed || formData.dockBlocksCrushed, // Try both field names
      uwOpeningsClear: formData.uw_openings_clear || formData.uwOpeningsClear, // Try both field names
      dockingDuration: formData.duration_of_docking || formData.dockingDuration, // Try both field names
      extentOfHullSurvey: formData.extent_of_survey || formData.extentOfHullSurvey // Try both field names
    };
    
    console.log('🔍 Mapped data:', mappedData);
    console.log('🔍 Ship ID being set:', mappedData.inspectionType);
    console.log('🔍 Available ships in dropdown:', this.ships.map(s => ({id: s.id, name: s.name})));
    
    // Load form data into the form - mapping API fields to form fields
    console.log('🔍 Patching form with mapped data:', mappedData);
    this.etmaForm.patchValue(mappedData);
    
    // Specifically set the inspectionType field to ensure it's updated
    if (mappedData.inspectionType) {
      console.log('🔍 Setting inspectionType field specifically:', mappedData.inspectionType);
      this.etmaForm.get('inspectionType')?.setValue(mappedData.inspectionType);
    }
    
    // Check current form value after patching
    console.log('🔍 Form inspectionType value after patch:', this.etmaForm.get('inspectionType')?.value);
    
    // Verify the ship exists in the dropdown
    console.log('🔍 Ships available:', this.ships.length);
    const selectedShip = this.ships.find(ship => ship.id === mappedData.inspectionType);
    console.log('🔍 Selected ship found:', selectedShip);
    
    // If ship not found, log warning but don't retry (ships should be loaded by now)
    if (!selectedShip && mappedData.inspectionType) {
      console.warn('🔍 Ship not found in dropdown! Ship ID:', mappedData.inspectionType);
      console.warn('🔍 Available ships:', this.ships.map(s => ({id: s.id, name: s.name})));
    }
    
    // Force change detection to ensure UI updates
    console.log('🔍 Forcing change detection...');
    this.cd.markForCheck();
    
    // Additional debugging - check if the dropdown element exists and has the correct value
    setTimeout(() => {
      const dropdown = document.querySelector('select[formControlName="inspectionType"]') as HTMLSelectElement;
      if (dropdown) {
        console.log('🔍 Dropdown element found:', dropdown);
        console.log('🔍 Dropdown value:', dropdown.value);
        console.log('🔍 Dropdown selectedIndex:', dropdown.selectedIndex);
        console.log('🔍 Dropdown options count:', dropdown.options.length);
        console.log('🔍 Selected option text:', dropdown.options[dropdown.selectedIndex]?.text);
        
        // If the dropdown value doesn't match, try to set it manually
        if (dropdown.value !== mappedData.inspectionType?.toString()) {
          console.log('🔍 Dropdown value mismatch! Setting manually...');
          dropdown.value = mappedData.inspectionType?.toString() || '';
          dropdown.dispatchEvent(new Event('change', { bubbles: true }));
          console.log('🔍 Dropdown value after manual set:', dropdown.value);
          
          // Also update the form control to match
          this.etmaForm.get('inspectionType')?.setValue(mappedData.inspectionType);
          this.cd.markForCheck();
        }
      } else {
        console.warn('🔍 Dropdown element not found!');
      }
    }, 100);
    
    // Additional retry mechanism - if ships are not loaded yet, wait and retry
    if (this.ships.length === 0 && mappedData.inspectionType) {
      console.log('🔍 Ships not loaded yet, retrying in 500ms...');
      setTimeout(() => {
        if (this.ships.length > 0) {
          console.log('🔍 Ships now loaded, retrying form data load...');
          this.loadFormData(formData);
        }
      }, 500);
    }
    
    if (formData.observations && Array.isArray(formData.observations)) {

      
      console.log('🔍 Loading observations from API response:', formData.observations);
      console.log('🔍 Total observations found:', formData.observations.length);
      
      // Group observations by section based on the actual API response
      const underwaterCleaning = formData.observations.filter((obs: any) => obs.section === 'UNDERWATER_CLEANING');
      const marineGrowth = formData.observations.filter((obs: any) => obs.section === 'MARINE_GROWTH');
      const propellerCleaning = formData.observations.filter((obs: any) => obs.section === 'PROPELLER_CLEANING');
      const foreignObjects = formData.observations.filter((obs: any) => obs.section === 'FOREIGN_OBJECTS');
      const conditionOfAF = formData.observations.filter((obs: any) => obs.section === 'CONDITION_OF_AF');
      const outerBottom = formData.observations.filter((obs: any) => obs.section === 'OUTER_BOTTOM');
      const sternAftCutup = formData.observations.filter((obs: any) => obs.section === 'STERN_AFT_CUTUP');
      const bootTop = formData.observations.filter((obs: any) => obs.section === 'BOOT_TOP');
      const rudders = formData.observations.filter((obs: any) => obs.section === 'RUDDERS');
      const stabilizers = formData.observations.filter((obs: any) => obs.section === 'STABILIZERS');
      
      
      // Load each section into its respective form array
      // Since the current API only has UNDERWATER_CLEANING observations, 
      // we'll distribute them to the Marine Growth table as the primary underwater cleaning table
      this.loadFormArray('marineGrowthObservations', underwaterCleaning.length > 0 ? underwaterCleaning : marineGrowth);
      this.loadFormArray('propellerCleaningObservations', propellerCleaning);
      this.loadFormArray('foreignObjectsObservations', foreignObjects);
      this.loadFormArray('conditionOfAFObservations', conditionOfAF);
      this.loadFormArray('outerBottomObservations', outerBottom);
      this.loadFormArray('sternAftCutupObservations', sternAftCutup);
      this.loadFormArray('bootTopObservations', bootTop);
      this.loadFormArray('ruddersObservations', rudders);
      this.loadFormArray('stabilizersObservations', stabilizers);
      
      // Add all the missing observation sections
      const oldDockBlockAreas = formData.observations.filter((obs: any) => obs.section === 'OLD_DOCK_BLOCK_AREAS');
      const otherObservations = formData.observations.filter((obs: any) => obs.section === 'OTHER_OBSERVATIONS');
      const paintScheme = formData.observations.filter((obs: any) => obs.section === 'PAINT_SCHEME');
      const areasHavingRust = formData.observations.filter((obs: any) => obs.section === 'AREAS_HAVING_RUST');
      const generalOuterBottom = formData.observations.filter((obs: any) => obs.section === 'GENERAL_OUTER_BOTTOM');
      const bootTopRust = formData.observations.filter((obs: any) => obs.section === 'BOOT_TOP_RUST');
      const sternAftCutupRust = formData.observations.filter((obs: any) => obs.section === 'STERN_AFT_CUTUP_RUST');
      const bilgeKeel = formData.observations.filter((obs: any) => obs.section === 'BILGE_KEEL');
      const oldDockBlockRust = formData.observations.filter((obs: any) => obs.section === 'OLD_DOCK_BLOCK_RUST');
      const otherRust = formData.observations.filter((obs: any) => obs.section === 'OTHER_RUST');
      const ruddersRust = formData.observations.filter((obs: any) => obs.section === 'RUDDERS_RUST');
      const dentsAt = formData.observations.filter((obs: any) => obs.section === 'DENTS_AT');
      const suspectCracks = formData.observations.filter((obs: any) => obs.section === 'SUSPECT_CRACKS');
      const deepScratch = formData.observations.filter((obs: any) => obs.section === 'DEEP_SCRATCH');
      const holesDoublers = formData.observations.filter((obs: any) => obs.section === 'HOLES_DOUBLERS');
      const otherStructure = formData.observations.filter((obs: any) => obs.section === 'OTHER_STRUCTURE');
      const structuralDefects = formData.observations.filter((obs: any) => obs.section === 'STRUCTURAL_DEFECTS');
      const stabilizersSurvey = formData.observations.filter((obs: any) => obs.section === 'STABILIZERS_SURVEY');
      const cleanShip = formData.observations.filter((obs: any) => obs.section === 'CLEAN_SHIP');
      const cracksDentsFouling = formData.observations.filter((obs: any) => obs.section === 'CRACKS_DENTS_FOULING');
      const grpDome = formData.observations.filter((obs: any) => obs.section === 'GRP_DOME');
      const fairingSkirt = formData.observations.filter((obs: any) => obs.section === 'FAIRING_SKIRT');
      const rudderCracks = formData.observations.filter((obs: any) => obs.section === 'RUDDER_CRACKS');
      const rudderMisalignment = formData.observations.filter((obs: any) => obs.section === 'RUDDER_MISALIGNMENT');
      const iccpSystem = formData.observations.filter((obs: any) => obs.section === 'ICCP_SYSTEM');
      const sacrificialAnodes = formData.observations.filter((obs: any) => obs.section === 'SACRIFICIAL_ANODES');
      const iccpAnodes = formData.observations.filter((obs: any) => obs.section === 'ICCP_ANODES');
      const iccpReferenceElectrode = formData.observations.filter((obs: any) => obs.section === 'ICCP_REFERENCE_ELECTRODE');
      const dielectricShields = formData.observations.filter((obs: any) => obs.section === 'DIELECTRIC_SHIELDS');
      const preDockingChecks = formData.observations.filter((obs: any) => obs.section === 'PRE_DOCKING_CHECKS');
      const propellerCleaning2 = formData.observations.filter((obs: any) => obs.section === 'PROPELLER_CLEANING_2');
      const propellerBladeEdges = formData.observations.filter((obs: any) => obs.section === 'PROPELLER_BLADE_EDGES');
      const propellerHubs = formData.observations.filter((obs: any) => obs.section === 'PROPELLER_HUBS');
      const propellerPitting = formData.observations.filter((obs: any) => obs.section === 'PROPELLER_PITTING');
      const propellerShaftCoating = formData.observations.filter((obs: any) => obs.section === 'PROPELLER_SHAFT_COATING');
      const eddyCone = formData.observations.filter((obs: any) => obs.section === 'EDDY_CONE');
      const waterSeepage = formData.observations.filter((obs: any) => obs.section === 'WATER_SEEPAGE');
      const missingParts = formData.observations.filter((obs: any) => obs.section === 'MISSING_PARTS');
      const blankingParts = formData.observations.filter((obs: any) => obs.section === 'BLANKING_PARTS');
      const scupperLips = formData.observations.filter((obs: any) => obs.section === 'SCUPPER_LIPS');
      const aralditeFairing = formData.observations.filter((obs: any) => obs.section === 'ARALDITE_FAIRING');
      const angleOfList = formData.observations.filter((obs: any) => obs.section === 'ANGLE_OF_LIST');
      
      // Log filtered observations for debugging
      console.log('🔍 Filtered observations by section:');
      console.log('🔍 UNDERWATER_CLEANING:', underwaterCleaning.length);
      console.log('🔍 PROPELLER_CLEANING:', propellerCleaning.length);
      console.log('🔍 FOREIGN_OBJECTS:', foreignObjects.length);
      console.log('🔍 CONDITION_OF_AF:', conditionOfAF.length);
      console.log('🔍 OUTER_BOTTOM:', outerBottom.length);
      console.log('🔍 STERN_AFT_CUTUP:', sternAftCutup.length);
      console.log('🔍 BOOT_TOP:', bootTop.length);
      console.log('🔍 RUDDERS:', rudders.length);
      console.log('🔍 STABILIZERS:', stabilizers.length);
      console.log('🔍 DENTS_AT:', dentsAt.length);
      console.log('🔍 SUSPECT_CRACKS:', suspectCracks.length);
      console.log('🔍 DEEP_SCRATCH:', deepScratch.length);
      console.log('🔍 HOLES_DOUBLERS:', holesDoublers.length);
      console.log('🔍 OTHER_STRUCTURE:', otherStructure.length);
      console.log('🔍 STRUCTURAL_DEFECTS:', structuralDefects.length);
      console.log('🔍 STABILIZERS_SURVEY:', stabilizersSurvey.length);
      
      // Load all observation sections
      this.loadFormArray('oldDockBlockAreasObservations', oldDockBlockAreas);
      this.loadFormArray('otherObservations', otherObservations);
      this.loadFormArray('paintSchemeObservations', paintScheme);
      this.loadFormArray('areasHavingRustObservations', areasHavingRust);
      this.loadFormArray('generalOuterBottomObservations', generalOuterBottom);
      this.loadFormArray('bootTopRustObservations', bootTopRust);
      this.loadFormArray('sternAftCutupRustObservations', sternAftCutupRust);
      this.loadFormArray('bilgeKeelObservations', bilgeKeel);
      this.loadFormArray('oldDockBlockRustObservations', oldDockBlockRust);
      this.loadFormArray('otherRustObservations', otherRust);
      this.loadFormArray('ruddersRustObservations', ruddersRust);
      this.loadFormArray('dentsAtObservations', dentsAt);
      this.loadFormArray('suspectCracksObservations', suspectCracks);
      this.loadFormArray('deepScratchObservations', deepScratch);
      this.loadFormArray('holesDoublersObservations', holesDoublers);
      this.loadFormArray('otherStructureObservations', otherStructure);
      this.loadFormArray('structuralDefectsObservations', structuralDefects);
      this.loadFormArray('stabilizersSurveyObservations', stabilizersSurvey);
      this.loadFormArray('cleanShipObservations', cleanShip);
      this.loadFormArray('cracksDentsFoulingObservations', cracksDentsFouling);
      this.loadFormArray('grpDomeObservations', grpDome);
      this.loadFormArray('fairingSkirtObservations', fairingSkirt);
      this.loadFormArray('rudderCracksObservations', rudderCracks);
      this.loadFormArray('rudderMisalignmentObservations', rudderMisalignment);
      this.loadFormArray('iccpSystemObservations', iccpSystem);
      this.loadFormArray('sacrificialAnodesObservations', sacrificialAnodes);
      this.loadFormArray('iccpAnodesObservations', iccpAnodes);
      this.loadFormArray('iccpReferenceElectrodeObservations', iccpReferenceElectrode);
      this.loadFormArray('dielectricShieldsObservations', dielectricShields);
      this.loadFormArray('preDockingChecksObservations', preDockingChecks);
      this.loadFormArray('propellerCleaningObservations2', propellerCleaning2);
      this.loadFormArray('propellerBladeEdgesObservations', propellerBladeEdges);
      this.loadFormArray('propellerHubsObservations', propellerHubs);
      this.loadFormArray('propellerPittingObservations', propellerPitting);
      this.loadFormArray('propellerShaftCoatingObservations', propellerShaftCoating);
      this.loadFormArray('eddyConeObservations', eddyCone);
      this.loadFormArray('waterSeepageObservations', waterSeepage);
      this.loadFormArray('missingPartsObservations', missingParts);
      this.loadFormArray('blankingPartsObservations', blankingParts);
      this.loadFormArray('scupperLipsObservations', scupperLips);
      this.loadFormArray('aralditeFairingObservations', aralditeFairing);
      this.loadFormArray('angleOfListObservations', angleOfList);
      
    } else {
      
      // Check if observations are already in individual arrays
      if (formData.marineGrowthObservations || formData.propellerCleaningObservations || formData.foreignObjectsObservations) {
        
        // Load each observation array directly
        this.loadFormArray('marineGrowthObservations', formData.marineGrowthObservations || []);
        this.loadFormArray('propellerCleaningObservations', formData.propellerCleaningObservations || []);
        this.loadFormArray('foreignObjectsObservations', formData.foreignObjectsObservations || []);
        this.loadFormArray('conditionOfAFObservations', formData.conditionOfAFObservations || []);
        this.loadFormArray('outerBottomObservations', formData.outerBottomObservations || []);
        this.loadFormArray('sternAftCutupObservations', formData.sternAftCutupObservations || []);
        this.loadFormArray('bootTopObservations', formData.bootTopObservations || []);
        this.loadFormArray('ruddersObservations', formData.ruddersObservations || []);
        this.loadFormArray('stabilizersObservations', formData.stabilizersObservations || []);
      } else {
       
        // Initialize empty arrays if no observations
        this.loadFormArray('marineGrowthObservations', []);
        this.loadFormArray('propellerCleaningObservations', []);
        this.loadFormArray('foreignObjectsObservations', []);
        this.loadFormArray('conditionOfAFObservations', []);
        this.loadFormArray('outerBottomObservations', []);
        this.loadFormArray('sternAftCutupObservations', []);
        this.loadFormArray('bootTopObservations', []);
        this.loadFormArray('ruddersObservations', []);
        this.loadFormArray('stabilizersObservations', []);
      }
    }
  }

  private loadFormArray(arrayName: string, data: any[]): void {
   
    
    const formArray = this.etmaForm.get(arrayName) as FormArray;

    
    formArray.clear();

    
    if (!data || data.length === 0) {

      return;
    }
    
    data.forEach((item, index) => {

      let formGroup: FormGroup;
      
      switch (arrayName) {
        case 'inspectors':
          formGroup = this.createInspectorRow();
          formGroup.patchValue({
            id: item.id,
            name: item.name || '',
            rank: item.rank || '',
            designation: item.designation || ''
          });
          break;
        case 'marineGrowthObservations':
        case 'propellerCleaningObservations':
        case 'foreignObjectsObservations':
        case 'conditionOfAFObservations':
        case 'outerBottomObservations':
        case 'sternAftCutupObservations':
        case 'bootTopObservations':
        case 'ruddersObservations':
        case 'stabilizersObservations':
        case 'oldDockBlockAreasObservations':
        case 'otherObservations':
        case 'paintSchemeObservations':
        case 'areasHavingRustObservations':
        case 'generalOuterBottomObservations':
        case 'bootTopRustObservations':
        case 'sternAftCutupRustObservations':
        case 'bilgeKeelObservations':
        case 'oldDockBlockRustObservations':
        case 'otherRustObservations':
        case 'ruddersRustObservations':
        case 'dentsAtObservations':
        case 'suspectCracksObservations':
        case 'deepScratchObservations':
        case 'holesDoublersObservations':
        case 'otherStructureObservations':
        case 'structuralDefectsObservations':
        case 'stabilizersSurveyObservations':
        case 'cleanShipObservations':
        case 'cracksDentsFoulingObservations':
        case 'grpDomeObservations':
        case 'fairingSkirtObservations':
        case 'rudderCracksObservations':
        case 'rudderMisalignmentObservations':
        case 'iccpSystemObservations':
        case 'sacrificialAnodesObservations':
        case 'iccpAnodesObservations':
        case 'iccpReferenceElectrodeObservations':
        case 'dielectricShieldsObservations':
        case 'preDockingChecksObservations':
        case 'propellerCleaningObservations2':
        case 'propellerBladeEdgesObservations':
        case 'propellerHubsObservations':
        case 'propellerPittingObservations':
        case 'propellerShaftCoatingObservations':
        case 'eddyConeObservations':
        case 'waterSeepageObservations':
        case 'missingPartsObservations':
        case 'blankingPartsObservations':
        case 'scupperLipsObservations':
        case 'aralditeFairingObservations':
        case 'angleOfListObservations':
          formGroup = this.createObservationRow();
          formGroup.patchValue({
            id: item.id, // Use id field for edit operations
            observation: item.observation || '',
            remarks: item.remarks || ''
          });
          break;
        default:
          formGroup = this.createObservationRow();
          formGroup.patchValue({
            id: item.id, // Use id field for edit operations
            observation: item.observation || '',
            remarks: item.remarks || ''
          });
      }
      
      formArray.push(formGroup);
    
    });
    
  
  }

  private resetForm(): void {
    this.etmaForm.reset();
    this.isAddMode = true;
    // Reset all form arrays to empty
    this.clearAllFormArrays();
  }

  private clearAllFormArrays(): void {
    // Clear all form arrays
    const arrayControls = [
      'inspectors', 'marineGrowthObservations', 'propellerCleaningObservations',
      'foreignObjectsObservations', 'conditionOfAFObservations', 'outerBottomObservations',
      'sternAftCutupObservations', 'bootTopObservations', 'ruddersObservations',
      'stabilizersObservations', 'oldDockBlockAreasObservations', 'otherObservations',
      'paintSchemeObservations', 'areasHavingRustObservations', 'generalOuterBottomObservations',
      'bootTopRustObservations', 'sternAftCutupRustObservations', 'bilgeKeelObservations',
      'oldDockBlockRustObservations', 'otherRustObservations', 'ruddersRustObservations',
      'dentsAtObservations', 'suspectCracksObservations', 'deepScratchObservations',
      'holesDoublersObservations', 'otherStructureObservations', 'structuralDefectsObservations',
      'stabilizersSurveyObservations', 'cleanShipObservations', 'cracksDentsFoulingObservations',
      'grpDomeObservations', 'fairingSkirtObservations', 'rudderCracksObservations',
      'rudderMisalignmentObservations', 'iccpSystemObservations', 'sacrificialAnodesObservations',
      'iccpAnodesObservations', 'iccpReferenceElectrodeObservations', 'dielectricShieldsObservations',
      'preDockingChecksObservations', 'propellerCleaningObservations2', 'propellerBladeEdgesObservations',
      'propellerHubsObservations', 'propellerPittingObservations', 'propellerShaftCoatingObservations',
      'eddyConeObservations', 'waterSeepageObservations', 'missingPartsObservations',
      'blankingPartsObservations', 'scupperLipsObservations', 'aralditeFairingObservations',
      'angleOfListObservations'
    ];

    arrayControls.forEach(controlName => {
      const control = this.etmaForm.get(controlName) as FormArray;
      if (control) {
        while (control.length !== 0) {
          control.removeAt(0);
        }
      }
    });
  }

  // Route Config Event Handlers
  onRouteConfigSaved(event: any): void {
    console.log('🚀 ADD ROUTE CONFIG POPUP - Route config saved event:', event);
    
    // Check if this is a direct API response or data from the popup
    if (event.success !== undefined) {
      // This is a direct API response
      console.log('🚀 ADD ROUTE CONFIG POPUP - Direct API response received');
    if (event.success) {
      this.handleSuccessfulRouteConfigSave(event);
    } else {
      console.error('Route config save failed:', event.error);
        this.handleRouteConfigError(event.error);
      }
    } else {
      // This is data from the popup component
      console.log('🚀 ADD ROUTE CONFIG POPUP - Data from popup component, calling API');
      this.callRouteConfigApi(event);
    }
  }

  private callRouteConfigApi(routeConfigData: any): void {
    console.log('🚀 ADD ROUTE CONFIG POPUP - Calling route config API with data:', routeConfigData);
    
    const payload = {
      transaction_id: this.etmaForm.get('id')?.value,
      submodule: 4, // Preliminary form submodule
      vessel: this.etmaForm.get('inspectionType')?.value ? Number(this.etmaForm.get('inspectionType')?.value) : 0,
      route_config: routeConfigData
    };
    
    console.log('🚀 ADD ROUTE CONFIG POPUP - Route config API payload:', payload);
    
    this.apiService.post('config/route-configs/', payload).subscribe({
      next: (response) => {
        console.log('🚀 ADD ROUTE CONFIG POPUP - Route config API success:', response);
        this.onRouteConfigSaved({ success: true, data: response });
      },
      error: (error) => {
        console.error('🚀 ADD ROUTE CONFIG POPUP - Route config API error:', error);
        this.onRouteConfigSaved({ success: false, error: error });
      }
    });
  }

  onNextStep(event: any): void {
    console.log('🚀 Forward for Review - Next step clicked:', event);
    
    // The existing Forward for Review popup will handle the API call
    // when user clicks Send for Review or Reject buttons
    // No immediate API call here - just show the popup
  }

  onTimelineToggle(isVisible: boolean): void {
    console.log('🔍 Timeline toggle:', isVisible);
    
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
    
    // Show user-friendly error message
    this.toastService.showError('Failed to configure route. Please try again.');
  }

  private forwardForReview(reviewData: any): void {
    console.log('🔍 Forwarding for review:', reviewData);
    
    // Implement API call to forward for review
    // this.apiService.post('api/forward-for-review', reviewData).subscribe({
    //   next: (response) => {
    //     this.toastService.showSuccess('Successfully forwarded for review');
    //   },
    //   error: (error) => {
    //     this.toastService.showError('Failed to forward for review');
    //   }
    // });
  }

  private saveTimelinePreference(isVisible: boolean): void {
    console.log('🔍 Saving timeline preference:', isVisible);
    
    // Save user preference for timeline visibility
    localStorage.setItem('timeline_visible', isVisible.toString());
  }

  private updateFormStatus(status: string): void {
    console.log('🔍 Updating form status:', status);
    
    // Update form status based on route configuration
    // This could be used to show different UI states
  }

  onConfigureRoute(): void {
    console.log('🚀 ADD ROUTE CONFIG POPUP - Parent onConfigureRoute called');
    console.log('🚀 ADD ROUTE CONFIG POPUP - Form ID:', this.etmaForm.get('id')?.value);
    console.log('🚀 ADD ROUTE CONFIG POPUP - isAddMode:', this.isAddMode);
    console.log('🚀 ADD ROUTE CONFIG POPUP - pendingAction:', this.pendingAction);
    
    if (this.isAddMode && !this.etmaForm.get('id')?.value) {
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

  onSaveDirectly(): void {
    console.log('🚀 ADD ROUTE CONFIG POPUP - Save Directly clicked');
    this.showRouteConfigPopup = false;
    if (this.pendingAction === 'save') {
      this.performSaveWithRouteConfig();
    } else if (this.pendingAction === 'saveDraft') {
      this.performSaveDraftWithRouteConfig();
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

  private performSaveWithRouteConfig(): void {
    console.log('🚀 ADD ROUTE CONFIG POPUP - Saving form for route config');
    this.performSave(true);
  }

  private performSaveDraftWithRouteConfig(): void {
    console.log('🚀 ADD ROUTE CONFIG POPUP - Saving draft for route config');
    this.performSaveDraft(true);
  }

  onCloseRouteConfigPopup(): void {
    this.showRouteConfigPopup = false;
    this.pendingAction = null;
  }

  onRefreshTimeline(): void {
    console.log('🔄 Refreshing timeline from Preliminary Form...');
    // The timeline refresh will be handled by the route config component
    // This method is here to handle the event from the popup
  }

  onCloseForm(): void {
    this.showRouteConfigPopup = false;
    this.showRouteConfigModal = false;
    this.pendingAction = null;
    this.userInitiatedAction = false;
    this.isLoadingFormData = false;
    this.toggleView();
  }

  toggleView(): void {
    this.showTableView = !this.showTableView;
    if (this.showTableView) {
      this.etmaForm.enable();
    }
  }

  onSubmit(event?: Event): void {
    console.log('🔍 onSubmit called', event, 'isAddMode:', this.isAddMode);
    
    // In edit mode, save directly without showing popup
    if (!this.isAddMode) {
      console.log('🔍 Edit mode - saving directly without popup');
      this.performSave();
      return;
    }
    
    // Only show popup in add mode
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    this.userInitiatedAction = true;
    this.pendingAction = 'save';
    this.showRouteConfigPopup = true;
    console.log('🔍 showRouteConfigPopup set to true in onSubmit (add mode)');
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
    console.log('🔍 showRouteConfigPopup set to true in onSaveDraft (add mode)');
  }

  private performSave(isForRouteConfig: boolean = false, isForModal: boolean = false): void {
    console.log('🚀 ADD ROUTE CONFIG POPUP - performSave called');
    if (this.etmaForm.valid) {
      const formData = this.etmaForm.value;
      
      // Prepare payload for API
      const payload: any = {
        ...(formData.id && formData.id !== '' ? { id: formData.id } : {}),
        ship_id: parseInt(formData.inspectionType) || 0,
        dt_inspection: formData.inspectionDate,
        auth_inspection: formData.inspectionAuthority || "Naval Inspector",
        docking_version: formData.dockingVersion || "v1",
        nature_of_docking: formData.natureOfDocking || "Routine Check",
        no_of_dock_blocks_wedged: parseInt(formData.dockBlocksWedged) || 0,
        no_of_dock_blocks_crushed: parseInt(formData.dockBlocksCrushed) || 0,
        uw_openings_clear: formData.uwOpeningsClear === 'true' || formData.uwOpeningsClear === true,
        duration_of_docking: formData.dockingDuration || "5 days",
        extent_of_survey: formData.extentOfHullSurvey || "Full Hull Survey",
        draft_status: "save", // For final save
        
        dynamic_fields: {
          extra_notes: "No damages",
          condition: "better"
        },
        
        observations: this.buildObservationsPayload()
      };
      
      console.log('🔍 Save payload:', payload);
      console.log('🔍 Observations in save payload:', payload.observations);
      console.log('🔍 Observations length in save:', payload.observations.length);
      
      this.apiService.post('hitu/preliminary-underwater-hull-inspection-reports/', payload).subscribe({
        next: (response) => {
          console.log('🚀 ADD ROUTE CONFIG POPUP - Form saved successfully, response:', response);
          
          if (isForRouteConfig) {
            const savedId = response.id || response.data?.id;
            console.log('🚀 ADD ROUTE CONFIG POPUP - isForRouteConfig is true, savedId:', savedId);
            if (savedId) {
              console.log('🔍 Got saved ID:', savedId, '- updating form');
              this.etmaForm.patchValue({ id: savedId });
              console.log('🔍 Form updated, new ID value:', this.etmaForm.get('id')?.value);
              
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
          this.toastService.showSuccess('Form saved successfully');
            this.showRouteConfigPopup = false;
            this.showRouteConfigModal = false;
            this.pendingAction = null;
          this.toggleView();
          }
        },
        error: (error) => {
          console.error('🔍 Save error:', error);
          this.toastService.showError('Error saving form');
        }
      });
    } else {
      this.etmaForm.markAllAsTouched();
    }
  }

  private performSaveDraft(isForRouteConfig: boolean = false, isForModal: boolean = false): void {
    console.log('🚀 ADD ROUTE CONFIG POPUP - performSaveDraft called');
    const formData = this.etmaForm.value;
    
    // Prepare payload for API
    const payload: any = {
      ...(formData.id && formData.id !== '' ? { id: formData.id } : {}),
      ship_id: parseInt(formData.inspectionType) || 0,
      dt_inspection: formData.inspectionDate,
      auth_inspection: formData.inspectionAuthority || "Naval Inspector",
      docking_version: formData.dockingVersion || "v1",
      nature_of_docking: formData.natureOfDocking || "Routine Check",
      no_of_dock_blocks_wedged: parseInt(formData.dockBlocksWedged) || 0,
      no_of_dock_blocks_crushed: parseInt(formData.dockBlocksCrushed) || 0,
      uw_openings_clear: formData.uwOpeningsClear === 'true' || formData.uwOpeningsClear === true,
      duration_of_docking: formData.dockingDuration || "5 days",
      extent_of_survey: formData.extentOfHullSurvey || "Full Hull Survey",
      draft_status: "draft", // For draft save
      
      dynamic_fields: {
        extra_notes: "No damages",
        condition: "better"
      },
      
      observations: this.buildObservationsPayload()
    };
    
    console.log('🔍 Draft save payload:', payload);
    console.log('🔍 Observations in draft payload:', payload.observations);
    console.log('🔍 Observations length in draft:', payload.observations.length);
    
    this.apiService.post('hitu/preliminary-underwater-hull-inspection-reports/', payload).subscribe({
      next: (response) => {
        console.log('🚀 ADD ROUTE CONFIG POPUP - Draft saved successfully, response:', response);
        
        if (isForRouteConfig) {
          const savedId = response.id || response.data?.id;
          console.log('🚀 ADD ROUTE CONFIG POPUP - isForRouteConfig is true, savedId:', savedId);
          if (savedId) {
            console.log('🔍 Got saved ID:', savedId, '- updating form');
            this.etmaForm.patchValue({ id: savedId });
            console.log('🔍 Form updated, new ID value:', this.etmaForm.get('id')?.value);
            
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
        console.error('🔍 Draft save error:', error);
        this.toastService.showError('Error saving draft');
      }
    });
  }

  private buildObservationsPayload(): any[] {
    const observations: any[] = [];
    
    console.log('🔍 Starting buildObservationsPayload...');
    
    // Add observations from ALL observation arrays
    const observationArrays = [
      { array: this.marineGrowthObservations, section: 'UNDERWATER_CLEANING' },
      { array: this.propellerCleaningObservations, section: 'PROPELLER_CLEANING' },
      { array: this.foreignObjectsObservations, section: 'FOREIGN_OBJECTS' },
      { array: this.conditionOfAFObservations, section: 'CONDITION_OF_AF' },
      { array: this.outerBottomObservations, section: 'OUTER_BOTTOM' },
      { array: this.sternAftCutupObservations, section: 'STERN_AFT_CUTUP' },
      { array: this.bootTopObservations, section: 'BOOT_TOP' },
      { array: this.ruddersObservations, section: 'RUDDERS' },
      { array: this.stabilizersObservations, section: 'STABILIZERS' },
      { array: this.oldDockBlockAreasObservations, section: 'OLD_DOCK_BLOCK_AREAS' },
      { array: this.otherObservations, section: 'OTHER_OBSERVATIONS' },
      { array: this.paintSchemeObservations, section: 'PAINT_SCHEME' },
      { array: this.areasHavingRustObservations, section: 'AREAS_HAVING_RUST' },
      { array: this.generalOuterBottomObservations, section: 'GENERAL_OUTER_BOTTOM' },
      { array: this.bootTopRustObservations, section: 'BOOT_TOP_RUST' },
      { array: this.sternAftCutupRustObservations, section: 'STERN_AFT_CUTUP_RUST' },
      { array: this.bilgeKeelObservations, section: 'BILGE_KEEL' },
      { array: this.oldDockBlockRustObservations, section: 'OLD_DOCK_BLOCK_RUST' },
      { array: this.otherRustObservations, section: 'OTHER_RUST' },
      { array: this.ruddersRustObservations, section: 'RUDDERS_RUST' },
      { array: this.dentsAtObservations, section: 'DENTS_AT' },
      { array: this.suspectCracksObservations, section: 'SUSPECT_CRACKS' },
      { array: this.deepScratchObservations, section: 'DEEP_SCRATCH' },
      { array: this.holesDoublersObservations, section: 'HOLES_DOUBLERS' },
      { array: this.otherStructureObservations, section: 'OTHER_STRUCTURE' },
      { array: this.structuralDefectsObservations, section: 'STRUCTURAL_DEFECTS' },
      { array: this.stabilizersSurveyObservations, section: 'STABILIZERS_SURVEY' },
      { array: this.cleanShipObservations, section: 'CLEAN_SHIP' },
      { array: this.cracksDentsFoulingObservations, section: 'CRACKS_DENTS_FOULING' },
      { array: this.grpDomeObservations, section: 'GRP_DOME' },
      { array: this.fairingSkirtObservations, section: 'FAIRING_SKIRT' },
      { array: this.rudderCracksObservations, section: 'RUDDER_CRACKS' },
      { array: this.rudderMisalignmentObservations, section: 'RUDDER_MISALIGNMENT' },
      { array: this.iccpSystemObservations, section: 'ICCP_SYSTEM' },
      { array: this.sacrificialAnodesObservations, section: 'SACRIFICIAL_ANODES' },
      { array: this.iccpAnodesObservations, section: 'ICCP_ANODES' },
      { array: this.iccpReferenceElectrodeObservations, section: 'ICCP_REFERENCE_ELECTRODE' },
      { array: this.dielectricShieldsObservations, section: 'DIELECTRIC_SHIELDS' },
      { array: this.preDockingChecksObservations, section: 'PRE_DOCKING_CHECKS' },
      { array: this.propellerCleaningObservations2, section: 'PROPELLER_CLEANING_2' },
      { array: this.propellerBladeEdgesObservations, section: 'PROPELLER_BLADE_EDGES' },
      { array: this.propellerHubsObservations, section: 'PROPELLER_HUBS' },
      { array: this.propellerPittingObservations, section: 'PROPELLER_PITTING' },
      { array: this.propellerShaftCoatingObservations, section: 'PROPELLER_SHAFT_COATING' },
      { array: this.eddyConeObservations, section: 'EDDY_CONE' },
      { array: this.waterSeepageObservations, section: 'WATER_SEEPAGE' },
      { array: this.missingPartsObservations, section: 'MISSING_PARTS' },
      { array: this.blankingPartsObservations, section: 'BLANKING_PARTS' },
      { array: this.scupperLipsObservations, section: 'SCUPPER_LIPS' },
      { array: this.aralditeFairingObservations, section: 'ARALDITE_FAIRING' },
      { array: this.angleOfListObservations, section: 'ANGLE_OF_LIST' }
    ];
    
    console.log('🔍 Total observation arrays to process:', observationArrays.length);
    
    observationArrays.forEach(({ array, section }, arrayIndex) => {
      console.log(`🔍 Processing array ${arrayIndex + 1}: ${section}`);
      console.log(`🔍 Array controls length:`, array.controls.length);
      console.log(`🔍 Array value:`, array.value);
      
      array.controls.forEach((control: any, index: number) => {
        const value = control.value;
        console.log(`🔍 Control ${index} in ${section}:`, value);
        
        if (value.observation && value.observation.trim() !== '') {
          const observation = {
            ...(value.id && value.id !== '' ? { id: value.id } : {}),
            section: section,
            sr_no: observations.length + 1,
            observation: value.observation,
            remarks: value.remarks || ''
          };
          
          console.log(`✅ Adding observation for ${section}:`, observation);
          observations.push(observation);
        } else {
          console.log(`❌ Skipping empty observation in ${section}:`, value);
        }
      });
    });
    
    console.log('🔍 Built observations payload:', observations);
    console.log('🔍 Total observations found:', observations.length);
    
    // Additional debugging - check if form arrays are actually populated
    console.log('🔍 Form arrays status:');
    console.log('🔍 marineGrowthObservations.length:', this.marineGrowthObservations.length);
    console.log('🔍 marineGrowthObservations.value:', this.marineGrowthObservations.value);
    console.log('🔍 propellerCleaningObservations.length:', this.propellerCleaningObservations.length);
    console.log('🔍 propellerCleaningObservations.value:', this.propellerCleaningObservations.value);
    
    return observations;
  }
}
