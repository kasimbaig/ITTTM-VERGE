import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea' | 'checkbox' | 'file';
  required: boolean;
  defaultValue: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
}

@Component({
  selector: 'app-form-building',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    CheckboxModule,
    TooltipModule,
    ReactiveFormsModule
  ],
  templateUrl: './form-building.component.html',
  styleUrl: './form-building.component.scss'
})
export class FormBuildingComponent implements OnInit {
  fields: FormField[] = [];
  columns: TableColumn[] = [];
  selectedField: FormField | null = null;
  showFieldDialog = false;
  isEditMode = false;

  fieldTypes = [
    { label: 'Text', value: 'text' },
    { label: 'Number', value: 'number' },
    { label: 'Email', value: 'email' },
    { label: 'Date', value: 'date' },
    { label: 'Select', value: 'select' },
    { label: 'Textarea', value: 'textarea' },
    { label: 'Checkbox', value: 'checkbox' },
    { label: 'File', value: 'file' }
  ];

  constructor(private apiService: ApiService, private fb: FormBuilder, private toastService: ToastService) {}

  ngOnInit() {
    this.initializeForm();
    this.initializeColumns();
    this.loadFields();
  }

  private initializeColumns() {
    this.columns = [
      { field: 'name', header: 'Field Name', sortable: true, filterable: true },
      { field: 'type', header: 'Type', sortable: true, filterable: true },
      { field: 'required', header: 'Required', sortable: true },
      { field: 'defaultValue', header: 'Default Value', sortable: true },
      { field: 'actions', header: 'Actions', sortable: false }
    ];
  }

  private loadFields() {
    // Load fields from API or local storage
    // For now, using sample data
    this.fields = [
      {
        id: '1',
        name: 'firstName',
        type: 'text',
        required: true,
        defaultValue: '',
        placeholder: 'Enter first name'
      },
      {
        id: '2',
        name: 'email',
        type: 'email',
        required: true,
        defaultValue: '',
        placeholder: 'Enter email address'
      }
    ];
  }

  addField() {
    this.selectedField = {
      id: '',
      name: '',
      type: 'text',
      required: false,
      defaultValue: '',
      placeholder: ''
    };
    this.isEditMode = false;
    this.showFieldDialog = true;
  }

  editField(field: FormField) {
    this.selectedField = { ...field };
    this.isEditMode = true;
    this.showFieldDialog = true;
  }

  deleteField(field: FormField) {
    const index = this.fields.findIndex(f => f.id === field.id);
    if (index > -1) {
      this.fields.splice(index, 1);
    }
  }

  saveField() {
    if (this.selectedField) {
      if (this.isEditMode) {
        const index = this.fields.findIndex(f => f.id === this.selectedField!.id);
        if (index > -1) {
          this.fields[index] = { ...this.selectedField };
        }
      } else {
        this.selectedField.id = Date.now().toString();
        this.fields.push({ ...this.selectedField });
      }
    }
    this.showFieldDialog = false;
    this.selectedField = null;
  }

  cancelEdit() {
    this.showFieldDialog = false;
    this.selectedField = null;
  }

  getFieldTypeLabel(type: string): string {
    const fieldType = this.fieldTypes.find(ft => ft.value === type);
    return fieldType ? fieldType.label : type;
  }

  generateFormPreview() {
    // This would generate a preview of the form based on the fields
    console.log('Form Preview:', this.fields);
    
    // Create a preview window or modal
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    if (previewWindow) {
      previewWindow.document.write(this.generatePreviewHTML());
      previewWindow.document.close();
    }
  }

  private generatePreviewHTML(): string {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Form Preview</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
          .form-container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; }
          .form-title { color: #333; margin-bottom: 30px; text-align: center; }
          .form-group { margin-bottom: 20px; }
          .form-label { display: block; margin-bottom: 5px; font-weight: bold; color: #555; }
          .required { color: red; }
          .form-input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
          .form-textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; min-height: 100px; }
          .form-select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
          .form-checkbox { margin-right: 10px; }
          .submit-btn { background: #007bff; color: white; padding: 12px 30px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
          .submit-btn:hover { background: #0056b3; }
        </style>
      </head>
      <body>
        <div class="form-container">
          <h1 class="form-title">Form Preview</h1>
           <div style="display: flex; gap: 10px; margin-bottom: 10px;">
          <div style="cursor:pointer; padding:4px 10px; background:#e9ecef; border-radius:4px;" onclick="alert('ETMA clicked')">ETMA</div>
        </div>
          <!-- Header Section -->
          <div style="background: linear-gradient(to right, #dbeafe, #e0e7ff); box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; margin-bottom: 16px;">
            <div style="padding: 16px;">
              <!-- Top Title -->
              <div style="text-align: center; margin-bottom: 16px;">
                <h1 style="font-size: 24px; font-weight: bold; color: #374151; text-transform: uppercase; margin: 0;">LOAD TRIALS - GTG</h1>
              </div>

              <!-- Trial Information Fields -->
              <div style="margin-bottom: 16px; display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 18px; font-weight: 600; color: #374151;">SHIP</span>
                  <div style="border-bottom: 2px solid #9ca3af; margin: 0 8px;">
                    <select style="width: 128px; padding: 4px 8px; border: 1px solid #000; outline: none; text-align: center; background: transparent;">
                      <option value="">Select Ship</option>
                    </select>
                  </div>
                </div>
                <div style="display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 16px; font-weight: 500; color: #374151; margin-right: 16px;">OCCASION OF TRIALS -</span>
                  <div style="border-bottom: 2px solid #9ca3af; flex: 1; max-width: 384px;">
                    <input type="text" style="width: 100%; padding: 4px 8px; border: 1px solid #000; outline: none;" placeholder="Enter occasion of trials">
                  </div>
                </div>
                
                <div style="display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 16px; font-weight: 500; color: #374151; margin-right: 16px;">TRIAL DATE -</span>
                  <div style="border-bottom: 2px solid #9ca3af; flex: 1; max-width: 384px;">
                    <input type="date" style="width: 100%; padding: 4px 8px; border: 1px solid #000; outline: none;">
                  </div>
                </div>
              </div>

              <!-- Main Report Header -->
              <div style="text-align: center; margin-bottom: 16px;">
                <h2 style="font-size: 20px; font-weight: bold; color: #374151; text-transform: uppercase; margin-bottom: 8px;">GAS TURBINE GENERATOR</h2>
                <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
                  <span style="font-size: 18px; font-weight: 600; color: #374151;">LOAD TRIAL REPORT - GTG</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 1: Trial Details -->
          <div style="background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; margin-bottom: 16px;">
            <div style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; background: #1e40af;">
              <h2 style="font-size: 18px; font-weight: 600; color: white; margin: 0;">1. Trial Details</h2>
            </div>
            
            <div style="padding: 16px; background: #fef3c7;">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
                
                <!-- Presented By -->
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <label style="display: block; font-size: 16px; font-weight: 500; color: #374151;">
                    (a) Presented by<span style="color: #ef4444;">*</span>
                  </label>
                  <input type="text" style="width: 100%; padding: 12px; border: 1px solid #000; box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none;" placeholder="Enter presenter name">
                </div>

                <!-- Trial Date -->
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <label style="display: block; font-size: 16px; font-weight: 500; color: #374151;">
                    (b) Trial date<span style="color: #ef4444;">*</span>
                  </label>
                  <input type="date" style="width: 100%; padding: 12px; border: 1px solid #000; box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none;">
                </div>

                <!-- Occasion of Current Trial -->
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <label style="display: block; font-size: 16px; font-weight: 500; color: #374151;">
                    (c) Occasion of current trial<span style="color: #ef4444;">*</span>
                  </label>
                  <input type="text" style="width: 100%; padding: 12px; border: 1px solid #000; box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none;" placeholder="Enter occasion">
                </div>

                <!-- Date of Last Trial -->
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <label style="display: block; font-size: 16px; font-weight: 500; color: #374151;">
                    (d) Date of last trial carried out on<span style="color: #ef4444;">*</span>
                  </label>
                  <input type="date" style="width: 100%; padding: 12px; border: 1px solid #000; box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none;">
                </div>

                <!-- Proposal Reference -->
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <label style="display: block; font-size: 16px; font-weight: 500; color: #374151;">
                    (e) Proposal reference<span style="color: #ef4444;">*</span>
                  </label>
                  <input type="text" style="width: 100%; padding: 12px; border: 1px solid #000; box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none;" placeholder="Enter proposal reference">
                </div>

                <!-- File Reference -->
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <label style="display: block; font-size: 16px; font-weight: 500; color: #374151;">
                    (f) File reference<span style="color: #ef4444;">*</span>
                  </label>
                  <input type="text" style="width: 100%; padding: 12px; border: 1px solid #000; box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none;" placeholder="Enter file reference">
                </div>

                <!-- Reference Document -->
                <div style="grid-column: 1 / -1; display: flex; flex-direction: column; gap: 4px;">
                  <label style="display: block; font-size: 16px; font-weight: 500; color: #374151;">
                    (g) Reference document for trial:
                  </label>
                  <input type="text" style="width: 100%; padding: 12px; border: 1px solid #000; box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none;" placeholder="Enter reference document">
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Test Equipment Used -->
          <div style="background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; margin-bottom: 16px;">
            <div style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; background: #1e40af;">
              <h2 style="font-size: 18px; font-weight: 600; color: white; margin: 0;">2. Test Equipment Used</h2>
            </div>
            
            <div style="padding: 16px; background: #fef3c7;">
              <select style="width: 100%; padding: 12px; border: 1px solid #000; box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none;">
                <option value="">Select Equipment</option>
              </select>
            </div>
          </div>

          <!-- Section 3: Equipment Details -->
          <div style="background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; margin-bottom: 16px;">
            <div style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; background: #1e40af;">
              <h2 style="font-size: 18px; font-weight: 600; color: white; margin: 0;">3. Equipment Details</h2>
            </div>
            
            <div style="padding: 16px; display: flex; flex-direction: column; gap: 24px;">
              
              <!-- Engine Subsection -->
              <div style="border: 1px solid #d1d5db; background: #fef3c7; border-radius: 8px; padding: 16px;">
                <h3 style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 12px; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">Engine</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="display: block; font-size: 16px; font-weight: 500; color: #374151;">
                      (a) Make<span style="color: #ef4444;">**</span>
                    </label>
                    <input type="text" style="width: 100%; padding: 12px; border: 1px solid #000; box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none;" placeholder="Enter engine make">
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="display: block; font-size: 16px; font-weight: 500; color: #374151;">
                      (b) Model & serial no.<span style="color: #ef4444;">**</span>
                    </label>
                    <input type="text" style="width: 100%; padding: 12px; border: 1px solid #000; box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none;" placeholder="Enter model and serial number">
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="display: block; font-size: 16px; font-weight: 500; color: #374151;">
                      (c) RPM<span style="color: #ef4444;">**</span>
                    </label>
                    <input type="text" style="width: 100%; padding: 12px; border: 1px solid #000; box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none;" placeholder="Enter RPM">
                  </div>
                </div>
              </div>

              <!-- Governor Subsection -->
              <div style="border: 1px solid #d1d5db; background: #fef3c7; border-radius: 8px; padding: 16px;">
                <h3 style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 12px; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">Governor</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="display: block; font-size: 16px; font-weight: 500; color: #374151;">
                      (a) Make<span style="color: #ef4444;">**</span>
                    </label>
                    <input type="text" style="width: 100%; padding: 12px; border: 1px solid #000; box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none;" placeholder="Enter governor make">
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="display: block; font-size: 16px; font-weight: 500; color: #374151;">
                      (b) Model & serial no.<span style="color: #ef4444;">**</span>
                    </label>
                    <input type="text" style="width: 100%; padding: 12px; border: 1px solid #000; box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none;" placeholder="Enter model and serial number">
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="display: block; font-size: 16px; font-weight: 500; color: #374151;">
                      (c) Type<span style="color: #ef4444;">**</span>
                    </label>
                    <input type="text" style="width: 100%; padding: 12px; border: 1px solid #000; box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none;" placeholder="Enter type">
                  </div>
                </div>
              </div>

              <!-- Generator Subsection -->
              <div style="border: 1px solid #d1d5db; background: #fef3c7; border-radius: 8px; padding: 16px;">
                <h3 style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 12px; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">Generator</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="display: block; font-size: 16px; font-weight: 500; color: #374151;">
                      (a) Make<span style="color: #ef4444;">**</span>
                    </label>
                    <input type="text" style="width: 100%; padding: 12px; border: 1px solid #000; box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none;" placeholder="Enter generator make">
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="display: block; font-size: 16px; font-weight: 500; color: #374151;">
                      (b) Model & serial no.<span style="color: #ef4444;">**</span>
                    </label>
                    <input type="text" style="width: 100%; padding: 12px; border: 1px solid #000; box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none;" placeholder="Enter model and serial number">
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="display: block; font-size: 16px; font-weight: 500; color: #374151;">
                      (c) Rating (kW)<span style="color: #ef4444;">**</span>
                    </label>
                    <input type="text" style="width: 100%; padding: 12px; border: 1px solid #000; box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none;" placeholder="Enter rating">
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="display: block; font-size: 16px; font-weight: 500; color: #374151;">
                      (d) Voltage (V)<span style="color: #ef4444;">**</span>
                    </label>
                    <input type="text" style="width: 100%; padding: 12px; border: 1px solid #000; box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none;" placeholder="Enter voltage">
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="display: block; font-size: 16px; font-weight: 500; color: #374151;">
                      (e) Frequency (Hz)<span style="color: #ef4444;">**</span>
                    </label>
                    <input type="text" style="width: 100%; padding: 12px; border: 1px solid #000; box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none;" placeholder="Enter frequency">
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="display: block; font-size: 16px; font-weight: 500; color: #374151;">
                      (f) RPM<span style="color: #ef4444;">**</span>
                    </label>
                    <input type="text" style="width: 100%; padding: 12px; border: 1px solid #000; box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none;" placeholder="Enter RPM">
                  </div>
                </div>
              </div>

              <!-- AVR Subsection -->
              <div style="border: 1px solid #d1d5db; background: #fef3c7; border-radius: 8px; padding: 16px;">
                <h3 style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 12px; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">A.V.R.</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="display: block; font-size: 16px; font-weight: 500; color: #374151;">
                      (a) Make<span style="color: #ef4444;">**</span>
                    </label>
                    <input type="text" style="width: 100%; padding: 12px; border: 1px solid #000; box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none;" placeholder="Enter AVR make">
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="display: block; font-size: 16px; font-weight: 500; color: #374151;">
                      (b) Model & serial no.<span style="color: #ef4444;">**</span>
                    </label>
                    <input type="text" style="width: 100%; padding: 12px; border: 1px solid #000; box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none;" placeholder="Enter model and serial number">
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="display: block; font-size: 16px; font-weight: 500; color: #374151;">
                      (c) Type<span style="color: #ef4444;">**</span>
                    </label>
                    <input type="text" style="width: 100%; padding: 12px; border: 1px solid #000; box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none;" placeholder="Enter type">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 4: Performance Test -->
          <div style="background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; margin-bottom: 16px;">
            <div style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; background: #1e40af;">
              <h2 style="font-size: 18px; font-weight: 600; color: white; margin: 0;">4. Performance Test</h2>
            </div>
            
            <div style="padding: 16px;">
              
              <!-- Sub-section: (a) Frequency Regulation -->
              <h3 style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 16px;">(a) Frequency Regulation</h3>
              <div style="overflow-x: auto; margin-bottom: 32px;">
                <table style="width: 100%; border-collapse: collapse; border: 1px solid #9ca3af; background: #fef3c7;">
                  <thead>
                    <tr style="background: #f3f4f6;">
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">Load %</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">Frequency (Hz)</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">Permissible Limit (±2.5% of Rated Frequency)</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">Status (Sat/Unsat)</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 500;">0</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter frequency">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; color: #6b7280;">Hz</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <select style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;">
                          <option value="">Select</option>
                          <option value="Sat">Sat</option>
                          <option value="Unsat">Unsat</option>
                        </select>
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter remarks">
                      </td>
                    </tr>
                    <tr>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 500;">25</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter frequency">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; color: #6b7280;">Hz</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <select style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;">
                          <option value="">Select</option>
                          <option value="Sat">Sat</option>
                          <option value="Unsat">Unsat</option>
                        </select>
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter remarks">
                      </td>
                    </tr>
                    <tr>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 500;">50</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter frequency">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; color: #6b7280;">Hz</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <select style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;">
                          <option value="">Select</option>
                          <option value="Sat">Sat</option>
                          <option value="Unsat">Unsat</option>
                        </select>
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter remarks">
                      </td>
                    </tr>
                    <tr>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 500;">75</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter frequency">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; color: #6b7280;">Hz</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <select style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;">
                          <option value="">Select</option>
                          <option value="Sat">Sat</option>
                          <option value="Unsat">Unsat</option>
                        </select>
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter remarks">
                      </td>
                    </tr>
                    <tr>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 500;">100</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter frequency">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; color: #6b7280;">Hz</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <select style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;">
                          <option value="">Select</option>
                          <option value="Sat">Sat</option>
                          <option value="Unsat">Unsat</option>
                        </select>
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter remarks">
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Sub-section: (b) Voltage Regulation -->
              <h3 style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 16px; margin-top: 32px;">(b) Voltage Regulation</h3>
              <div style="overflow-x: auto; margin-bottom: 32px;">
                <table style="width: 100%; border-collapse: collapse; border: 1px solid #9ca3af; background: #fef3c7;">
                  <thead>
                    <tr style="background: #f3f4f6;">
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">Load %</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;" colspan="3">Voltage Measured on Switchboard (Volts)</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">Permissible Limit (±5% of Rated Voltage)</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">Status (Sat/Unsat)</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">Remarks</th>
                    </tr>
                    <tr style="background: #f3f4f6;">
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;"></th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">R-Y</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">Y-B</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">B-R</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">V</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;"></th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 500;">0</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="R-Y">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Y-B">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="B-R">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; color: #6b7280;">V</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <select style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;">
                          <option value="">Select</option>
                          <option value="Sat">Sat</option>
                          <option value="Unsat">Unsat</option>
                        </select>
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter remarks">
                      </td>
                    </tr>
                    <tr>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 500;">25</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="R-Y">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Y-B">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="B-R">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; color: #6b7280;">V</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <select style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;">
                          <option value="">Select</option>
                          <option value="Sat">Sat</option>
                          <option value="Unsat">Unsat</option>
                        </select>
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter remarks">
                      </td>
                    </tr>
                    <tr>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 500;">50</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="R-Y">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Y-B">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="B-R">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; color: #6b7280;">V</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <select style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;">
                          <option value="">Select</option>
                          <option value="Sat">Sat</option>
                          <option value="Unsat">Unsat</option>
                        </select>
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter remarks">
                      </td>
                    </tr>
                    <tr>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 500;">75</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="R-Y">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Y-B">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="B-R">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; color: #6b7280;">V</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <select style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;">
                          <option value="">Select</option>
                          <option value="Sat">Sat</option>
                          <option value="Unsat">Unsat</option>
                        </select>
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter remarks">
                      </td>
                    </tr>
                    <tr>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 500;">100</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="R-Y">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Y-B">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="B-R">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; color: #6b7280;">V</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <select style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;">
                          <option value="">Select</option>
                          <option value="Sat">Sat</option>
                          <option value="Unsat">Unsat</option>
                        </select>
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter remarks">
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Sub-section: (c) Voltage Balance -->
              <h3 style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 16px; margin-top: 32px;">(c) Voltage Balance</h3>
              <div style="overflow-x: auto; margin-bottom: 32px;">
                <table style="width: 100%; border-collapse: collapse; border: 1px solid #9ca3af; background: #fef3c7;">
                  <thead>
                    <tr style="background: #f3f4f6;">
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">Load %</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;" colspan="3">Voltage Measured on Switchboard (Volts)</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">Permissible Limit (1% of Rated Voltage)</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">Status (Sat/Unsat)</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">Remarks</th>
                    </tr>
                    <tr style="background: #f3f4f6;">
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;"></th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">R-Y</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">Y-B</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">B-R</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">V</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;"></th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 500;">0</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="R-Y">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Y-B">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="B-R">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; color: #6b7280;">V</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <select style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;">
                          <option value="">Select</option>
                          <option value="Sat">Sat</option>
                          <option value="Unsat">Unsat</option>
                        </select>
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter remarks">
                      </td>
                    </tr>
                    <tr>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 500;">100</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="R-Y">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Y-B">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="B-R">
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; color: #6b7280;">V</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <select style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;">
                          <option value="">Select</option>
                          <option value="Sat">Sat</option>
                          <option value="Unsat">Unsat</option>
                        </select>
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter remarks">
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Sub-section: (d) Voltage Range -->
              <h3 style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 16px; margin-top: 32px;">(d) Voltage Range</h3>
              <div style="overflow-x: auto; margin-bottom: 32px;">
                <table style="width: 100%; border-collapse: collapse; border: 1px solid #9ca3af; background: #fef3c7;">
                  <thead>
                    <tr style="background: #f3f4f6;">
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;"></th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">Load %</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;" colspan="2">Voltage Measured on Switchboard (Volts)</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">Permissible Limit (5% of Rated Voltage)</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">Status (Sat/Unsat)</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">Remarks</th>
                    </tr>
                    <tr style="background: #f3f4f6;">
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;"></th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;"></th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">At Lowest Limit of Trimmer</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">At Highest Limit of Trimmer</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;">V</th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;"></th>
                      <th style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 600;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 500;">A.V.R.<br>Control</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 500;">
                        <div style="border-bottom: 1px solid #9ca3af; padding-bottom: 4px;">0</div>
                        <div style="padding-top: 4px;">100</div>
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <div style="border-bottom: 1px solid #9ca3af; padding-bottom: 4px;">
                          <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter voltage">
                        </div>
                        <div style="padding-top: 4px;">
                          <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter voltage">
                        </div>
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <div style="border-bottom: 1px solid #9ca3af; padding-bottom: 4px;">
                          <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter voltage">
                        </div>
                        <div style="padding-top: 4px;">
                          <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter voltage">
                        </div>
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; color: #6b7280;">V</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <div style="border-bottom: 1px solid #9ca3af; padding-bottom: 4px;">
                          <select style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;">
                            <option value="">Select</option>
                            <option value="Sat">Sat</option>
                            <option value="Unsat">Unsat</option>
                          </select>
                        </div>
                        <div style="padding-top: 4px;">
                          <select style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;">
                            <option value="">Select</option>
                            <option value="Sat">Sat</option>
                            <option value="Unsat">Unsat</option>
                          </select>
                        </div>
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <div style="border-bottom: 1px solid #9ca3af; padding-bottom: 4px;">
                          <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter remarks">
                        </div>
                        <div style="padding-top: 4px;">
                          <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter remarks">
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 500;">Hand<br>Control</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; font-weight: 500;">
                        <div style="border-bottom: 1px solid #9ca3af; padding-bottom: 4px;">0</div>
                        <div style="padding-top: 4px;">100</div>
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <div style="border-bottom: 1px solid #9ca3af; padding-bottom: 4px;">
                          <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter voltage">
                        </div>
                        <div style="padding-top: 4px;">
                          <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter voltage">
                        </div>
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <div style="border-bottom: 1px solid #9ca3af; padding-bottom: 4px;">
                          <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter voltage">
                        </div>
                        <div style="padding-top: 4px;">
                          <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter voltage">
                        </div>
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px; text-align: center; color: #6b7280;">V</td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <div style="border-bottom: 1px solid #9ca3af; padding-bottom: 4px;">
                          <select style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;">
                            <option value="">Select</option>
                            <option value="Sat">Sat</option>
                            <option value="Unsat">Unsat</option>
                          </select>
                        </div>
                        <div style="padding-top: 4px;">
                          <select style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;">
                            <option value="">Select</option>
                            <option value="Sat">Sat</option>
                            <option value="Unsat">Unsat</option>
                          </select>
                        </div>
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 16px;">
                        <div style="border-bottom: 1px solid #9ca3af; padding-bottom: 4px;">
                          <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter remarks">
                        </div>
                        <div style="padding-top: 4px;">
                          <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter remarks">
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Voltage Range Notes Section -->
              <div style="margin-top: 24px; padding: 16px; background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; margin-bottom: 32px;">
                <h3 style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 12px;">Note:</h3>
                <p style="font-size: 14px; color: #374151;">This test is undertaken by varying the voltage trimmer (Hand/Auto as applicable) from lowest limit to the highest limit.</p>
              </div>

              <!-- Sub-section: (e) Voltage Waveform Harmonic Content -->
              <h3 style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 16px; margin-top: 32px;">(e) Voltage Waveform Harmonic Content</h3>
              <div style="overflow-x: auto; margin-bottom: 32px;">
                <table style="width: 100%; border-collapse: collapse; border: 1px solid #9ca3af; background: #fef3c7;">
                  <tbody>
                    <tr>
                      <td style="border: 1px solid #9ca3af; padding: 12px; background: #fef3c7; font-size: 14px; color: #374151; width: 75%;">
                        Maximum total harmonic content of waveform at no load (not to exceed 2 % of the amplitude of fundamental)
                      </td>
                      <td style="border: 1px solid #9ca3af; padding: 12px; width: 25%;">
                        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #000; outline: none;" placeholder="Enter value">
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- QR Code and Signature Section -->
          <div style="padding: 8px;">
            <div style="padding: 16px; width: 100%; background: #f9fafb; display: flex; justify-content: flex-end; align-items: center; gap: 8px;">
              <div style="width: 100px; height: 100px; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #6b7280;">QR Code</div>
              <div style="text-align: left;">
                <span style="font-size: 14px; font-weight: 500; color: #6b7280;">Rank</span>-<span style="font-size: 14px; font-weight: 500; color: #374151;">Name</span>
                <br>
                <span style="font-size: 12px; color: #6b7280; margin-top: 8px;">Unit</span> <br>
                <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">Timestamp</div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
            <div style="padding: 24px;">
              <div style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: center;">
                <button type="button" style="padding: 12px 24px; background: #6b7280; color: white; font-weight: 500; border: none; border-radius: 6px; cursor: pointer; transition: background-color 0.2s;">
                  Close
                </button>
                <button type="button" style="padding: 12px 24px; background: #dc2626; color: white; font-weight: 500; border: none; border-radius: 6px; cursor: pointer; transition: background-color 0.2s; display: flex; align-items: center; gap: 8px;">
                  <span>📄</span> PDF
                </button>
                <button type="button" style="padding: 12px 24px; background: #dc2626; color: white; font-weight: 500; border: none; border-radius: 6px; cursor: pointer; transition: background-color 0.2s; display: flex; align-items: center; gap: 8px;">
                  <span>💾</span> Save Version
                </button>
              </div>
            </div>
          </div>
          <form>
    `;

    this.fields.forEach(field => {
      // Add 3 clickable divs for ETMA, SEG, HITU before each field
      
      html += `<div class="form-group">`;
      html += `<label class="form-label">${field.name}${field.required ? ' <span class="required">*</span>' : ''}</label>`;
      
      switch (field.type) {
        case 'textarea':
          html += `<textarea class="form-textarea" placeholder="${field.placeholder || ''}">${field.defaultValue}</textarea>`;
          break;
        case 'select':
          html += `<select class="form-select">`;
          if (field.options) {
            field.options.forEach(option => {
              html += `<option value="${option.value}">${option.label}</option>`;
            });
          }
          html += `</select>`;
          break;
        case 'checkbox':
          html += `<input type="checkbox" class="form-checkbox" ${field.defaultValue ? 'checked' : ''}> ${field.name}`;
          break;
        case 'file':
          html += `<input type="file" class="form-input">`;
          break;
        default:
          html += `<input type="${field.type}" class="form-input" placeholder="${field.placeholder || ''}" value="${field.defaultValue}">`;
      }
      
      html += `</div>`;
    });

    html += `
          <div class="form-group">
            <button type="submit" class="submit-btn">Submit Form</button>
          </div>
        </form>
      </div>
    </body>
    </html>
    `;

    return html;
  }

  exportFormConfig() {
    // Export form configuration as JSON
    const config = {
      fields: this.fields,
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0'
      }
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'form-config.json';
    a.click();
    URL.revokeObjectURL(url);
  }
  gtgForm!: FormGroup;



  private initializeForm(): void {
    this.gtgForm = this.fb.group({

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
openBox=false
view: any={
  trialDetails: false,
  testEquipmentUsed: false,
  equipmentDetails: false,
  insulationResistance: false,
  protectionChecks: false,
  instrumentation: false,
  miscellaneousChecks: false,
  speedControlTest: false,
  voltageControlTest: false,
  ship: false,
}

onSectionCheckboxClick(section: string, event: Event) {
  event.stopPropagation();
  this.view[section] = !this.view[section];
  console.log(this.view);
}
}
