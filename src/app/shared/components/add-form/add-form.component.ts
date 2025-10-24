import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Observable, Subscription } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
@Component({
  selector: 'app-add-form',
  standalone: true, // Ensure standalone is true if it's a standalone component
  imports: [ReactiveFormsModule, CommonModule, FormsModule, DialogModule, MultiSelectModule,CheckboxModule], // Add FormsModule for ngModel if used elsewhere
  templateUrl: './add-form.component.html',
  styleUrls: ['./add-form.component.css'],
})
export class AddFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() open = false;
  @Input() submitLabel: string = 'Save';
  @Input() fromTitle: string = '';
  @Input() isEditMode: boolean = false;
  @Input() formData: any = {};
  @Input() formConfig: any[] = [];
  @Input() context: 'maintop' | null | 'sfd' = null;
  @Input() isSingleColumn: boolean = false;

  @Output() onGroupChange = new EventEmitter<number>();
  @Output() onOpenChange = new EventEmitter<boolean>();
  @Output() onSubmit = new EventEmitter<any>();
  @Output() fileSelected = new EventEmitter<{ key: string; file: File }>();
  @Output() fileDeleted: EventEmitter<number> = new EventEmitter<number>();
  @Output() documentFileDeleted: EventEmitter<number> = new EventEmitter<number>();
  @Output() onSelectChange = new EventEmitter<{ key: string; value: any; selectedOption: any ;formData:any}>();

  form!: FormGroup;
  isFullScreen: boolean = true;
  isDragging: boolean = false;

  maintopHeaderList: any[] = [];
  maintopDetailList: any[] = [];

  mediaFiles: { id: number; file: string }[] = [];
  documentFiles: { id: number; file: string }[] = [];

  // New property to store resolved options for each field
  resolvedOptions: { [key: string]: any[] } = {};
  private optionsSubscriptions: Subscription[] = [];

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private fb: FormBuilder, private apiService: ApiService) {}

  ngOnInit() {
 
    console.log("formConfig", this.formConfig);
    // Delay form building to ensure formData is properly set
    setTimeout(() => {
      this.buildForm();
      this.resolveOptions();
    }, 0);

    this.initializeFiles();

    if (this.context === 'maintop' && this.isEditMode) {
      this.loadMaintopDataForEditMode();
    }
    this.setupMaintopListeners();

    if (this.context === 'sfd') {
      this.form.get('group')?.valueChanges.subscribe((groupId) => {
        this.onGroupChange.emit(groupId);
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    
    
    // Rebuild form if formConfig changes (e.g., dynamic forms)
    if (changes['formConfig'] && this.formConfig.length) {
    
      this.buildForm();
      this.resolveOptions();
    }

    // Rebuild form when open state changes to true to ensure fresh initialization
    if (changes['open'] && changes['open'].currentValue === true) {
     
      this.buildForm();
      this.resolveOptions();
    }

    // Patch values when formData changes, ensuring form is built first
    if (changes['formData'] && this.form && this.formConfig.length) {
     
      this.patchFormValues();
      this.initializeFiles();
    }
  }

  ngOnDestroy(): void {
    // Clean up all option subscriptions
    this.optionsSubscriptions.forEach(sub => sub.unsubscribe());
  }

  onFormControlChange(fieldKey: string): void {
    const value = this.form.get(fieldKey)?.value;
    
    // Emit the change event for parent components
    this.onSelectChange.emit({
      key: fieldKey,
      value: value,
      selectedOption: { value: value },
      formData: this.form.value
    });
    
   }

  onRadioChange(fieldKey: string, value: any): void {    
    // Set the form control value
    this.form.get(fieldKey)?.setValue(value);
    
    // Trigger change detection
    this.form.get(fieldKey)?.markAsTouched();
    this.form.get(fieldKey)?.markAsDirty();
    
    
    // Force change detection
    this.form.updateValueAndValidity();
    
    // Emit the change event for parent components
    this.onSelectChange.emit({
      
      key: fieldKey,
      value: value,
      selectedOption: { value: value },
      formData: this.form.value
    });
    
   }

  // New method to resolve observable options
  private resolveOptions(): void {
    // Clear existing subscriptions
    this.optionsSubscriptions.forEach(sub => sub.unsubscribe());
    this.optionsSubscriptions = [];
    this.resolvedOptions = {};

    this.formConfig.forEach(field => {
      // Handle both 'select' and 'select-multiple' types
      if ((field.type === 'select' || field.type === 'select-multiple') && field.options) {
        if (field.options && typeof field.options.subscribe === 'function') {
          // It's an Observable
          const subscription = field.options.subscribe((options: any[]) => {
            this.resolvedOptions[field.key] = options || [];
           
          });
          this.optionsSubscriptions.push(subscription);
        } else if (Array.isArray(field.options)) {
          // It's already an array
          this.resolvedOptions[field.key] = field.options;
        } else {
          // Fallback to empty array
          this.resolvedOptions[field.key] = [];
        }
      }
    });
  }

  // Method to get resolved options for a field
  getOptionsForField(fieldKey: string): any[] {
   
    return this.resolvedOptions[fieldKey] || [];
  }

  // Handle select dropdown changes
  handleSelectChange(event: Event, fieldKey: string): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    
    // Find the selected option object from resolved options
    const options = this.resolvedOptions[fieldKey];
    const selectedOption = options?.find(opt => String(opt.value) === String(selectedValue));
   
    // Update form value
    this.form.get(fieldKey)?.setValue(selectedValue);
    console.log("Selected Value:", selectedValue, this.formData, this.formConfig);
    // Emit the change event to parent component
    this.onSelectChange.emit({
      key: fieldKey,
      value: selectedValue,
      selectedOption: selectedOption || null,
      formData: this.form.value
    });
  }

  // Helper method to clean field values and prevent 'undefined' strings
  private cleanFieldValue(value: any, fieldType: string): any {
    // Handle null, undefined, or 'undefined' string
    if (value === undefined || value === null || value === 'undefined' || value === '') {
      // Return null to indicate no value provided, let buildForm handle defaults
      return null;
    }

    // Type-specific cleaning
    if (fieldType === 'checkbox') {
      return Boolean(value);
    } else if (fieldType === 'text' || fieldType === 'textarea') {
      return String(value || '');
    } else if (fieldType === 'number') {
      // For number fields, ensure we get a valid number
      const numValue = parseInt(value);
      return isNaN(numValue) ? 0 : numValue;
    } else if (fieldType === 'select-multiple') {
      // Handle select-multiple values
      if (Array.isArray(value)) {
        return value;
      } else if (typeof value === 'string' && value) {
        // If it's a comma-separated string, split it
        return value.split(',').map(v => v.trim());
      } else {
        return []; // Default to empty array
      }
    } else if (fieldType === 'date' && value) {
      return new Date(value).toISOString().substring(0, 10);
    } else if (fieldType === 'select') {
      if (typeof value === 'object' && value !== null) {
        
        return value.id ?? value.value ?? '';
      
      }
      return value || '';
    }

    return value;
  }

  getFileName(pathOrFile: string | File): string {
    if (typeof pathOrFile === 'string') {
      const parts = pathOrFile.split('/');
      return parts[parts.length - 1];
    } else if (pathOrFile instanceof File) {
      return pathOrFile.name;
    }
    return '';
  }

  deleteFile(fileId: number): void {
    
    this.fileDeleted.emit(fileId);
  }

  deleteDocumentFile(fileId: number): void {
    
    this.documentFileDeleted.emit(fileId);
  }

  private initializeFiles(): void {
    const mediaField = this.formConfig.find(f => f.key === 'file');
    const documentField = this.formConfig.find(f => f.key === 'document');

    this.mediaFiles = [];
    if (this.isEditMode && mediaField) {
      const mediaData = this.formData[mediaField.key];
      if (Array.isArray(mediaData)) {
        this.mediaFiles = mediaData;
      } else if (typeof mediaData === 'string' && mediaData) {
        this.mediaFiles = [{ id: Date.now(), file: mediaData }];
      }
    }

    this.documentFiles = [];
    if (this.isEditMode && documentField) {
      const documentData = this.formData[documentField.key];
      if (Array.isArray(documentData)) {
        this.documentFiles = documentData;
      } else if (typeof documentData === 'string' && documentData) {
        this.documentFiles = [{ id: Date.now(), file: documentData }];
      }
    }
  }

  handleCheckboxChange(event: Event, fieldKey: string): void {
    const inputElement = event.target as HTMLInputElement;
    const isChecked = !inputElement.checked;
    this.form.get(fieldKey)?.setValue(isChecked);
  }
  patchFormValues() {
    const patchObj: { [key: string]: any } = {};

    this.formConfig.forEach((field) => {
      const rawValue = this.formData?.[field.key];
      const cleanValue = this.cleanFieldValue(rawValue, field.type);
      
      // Ensure we never set undefined values
      if (cleanValue === undefined || cleanValue === null) {
        if (field.type === 'number') {
          patchObj[field.key] = 0;
        } else if (field.type === 'checkbox') {
          patchObj[field.key] = false;
        } else if (field.type === 'select-multiple') {
          patchObj[field.key] = []; // Empty array for multi-select
        } else if (field.type === 'text') {
          patchObj[field.key] = '';
        } else {
          patchObj[field.key] = '';
        }
      } else {
        patchObj[field.key] = cleanValue;
      }
    });

    this.form.patchValue(patchObj, { emitEvent: false });
    this.form.markAsTouched(); // Mark as touched to show validation errors if any
    this.form.updateValueAndValidity();
  }

  buildForm() {

    const group: { [key: string]: any } = {};

    // Store current form values before rebuilding
    const currentFormValues = this.form ? this.form.value : {};

    this.formConfig.forEach((field) => {

      // Get raw value from formData and clean it
      const rawValue = this.formData?.[field.key];
      let initialValue = this.cleanFieldValue(rawValue, field.type);

      // If we have a current form value for this field, use it instead of the default
      if (currentFormValues[field.key] !== undefined && currentFormValues[field.key] !== null && currentFormValues[field.key] !== '') {
        initialValue = currentFormValues[field.key];
        }

      // Set default values based on field type if no value provided
      if (initialValue === undefined || initialValue === null) {
        if (field.type === 'number') {
          initialValue = 0;
        } else if (field.type === 'checkbox') {
          // Use provided value or default to false
          initialValue = this.formData?.[field.key] !== undefined ? Boolean(this.formData[field.key]) : false;
        } else if (field.type === 'select-multiple') {
          // Use provided value or default to empty array
          initialValue = this.formData?.[field.key] || [];
        } else if (field.type === 'select') {
          initialValue = ''; // Empty string for single select
        } else if (field.type === 'date') {
          initialValue = ''; // Empty string for date
        } else if (field.type === 'radio') {
          initialValue = ''; // Empty string for radio buttons
        } else {
          initialValue = ''; // Empty string for text inputs
        }
      }

      // Additional check to prevent 'undefined' strings
      if (initialValue === 'undefined') {
        if (field.type === 'select-multiple') {
          initialValue = [];
        } else {
          initialValue = '';
        }
      }

      const validators = field.required ? [Validators.required] : [];
      group[field.key] = new FormControl(initialValue, validators);
     });

    this.form = this.fb.group(group);
 
  }

  private loadMaintopDataForEditMode(): void {
    const equipmentId = this.formData?.equipment;
    const headerId = this.formData?.maintop_header;
    const detailId = this.formData?.maintop_detail;

    if (equipmentId) {
      this.apiService
        .get(`maintop/maintop-header/?equipment=${equipmentId}&dropdown=true`)
        .subscribe((headerData: any) => {
          const headerField = this.formConfig.find(
            (f) => f.key === 'maintop_header'
          );
          if (headerField) {
            headerField.options = headerData.map((h: any) => ({
              label: h.code,
              value: h.id,
            }));
          }

          if (headerId) {
            const match = headerField?.options?.find(
              (opt: any) => opt.value === headerId
            );
            if (match) {
              this.form.get('maintop_header')?.setValue(match.value, { emitEvent: false });
            }

            this.apiService
              .get(
                `maintop/maintop-detail?maintop_header=${headerId}&dropdown=true`
              )
              .subscribe((detailData: any) => {
                const detailField = this.formConfig.find(
                  (f) => f.key === 'maintop_detail'
                );
                if (detailField) {
                  detailField.options = detailData.map((d: any) => ({
                    label: d.no,
                    value: d.id,
                  }));
                }

                if (detailId) {
                  const matchDetail = detailField?.options?.find(
                    (opt: any) => opt.value === detailId
                  );
                  if (matchDetail) {
                    this.form
                      .get('maintop_detail')
                      ?.setValue(matchDetail.value, { emitEvent: false });
                  }
                }
              });
          }
        });
    }
  }

  setupMaintopListeners() { 
    this.form.get('equipment')?.valueChanges.subscribe((equipmentId) => {
      if (equipmentId) {
        this.apiService
          .get(
            `maintop/maintop-header/?equipment=${equipmentId}&dropdown=${true}`
          )
          .subscribe((data: any) => {
           
            const headerField = this.formConfig.find(
              (f) => f.key === 'maintop_header'
            );
            if (headerField) {
              headerField.options = data.map((h: any) => ({
                label: h.title,
                value: h.id,
              }));
            }
            this.form.get('maintop_header')?.setValue('');
            this.form.get('maintop_detail')?.setValue('');
          });
      }
    });

    this.form.get('maintop_header')?.valueChanges.subscribe((headerId) => {
      if (headerId) {

        this.apiService
          .get(
            `maintop/maintop-detail?maintop_header=${headerId}&dropdown=${true}`
          )
          .subscribe((data: any) => {
        
            const detailField = this.formConfig.find(
              (f) => f.key === 'maintop_detail'
            );
            if (detailField) {
              detailField.options = data.map((d: any) => ({
                label: d.no,
                value: d.id,
              }));
            }
            this.form.get('maintop_detail')?.setValue('');
          });
      }
    });
  }

  closeSidebar() {
    this.onOpenChange.emit(false);
    this.isFullScreen = false;
  }

  toggleFullScreen() {
    this.isFullScreen = !this.isFullScreen;
  }

  triggerFileInputClick(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  handleFileInput(event: Event, key: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.emitFile(key, file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onFileDrop(event: DragEvent, key: string) {
    event.preventDefault();
    this.isDragging = false;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.emitFile(key, file);
    }
  }

  private emitFile(key: string, file: File) {
    this.fileSelected.emit({ key, file });
    this.form.get(key)?.setValue(file);
    this.form.get(key)?.updateValueAndValidity();
  }

  handleSubmit(event: Event) {
    event.preventDefault();

    if (this.form.invalid) {

      alert('Please fill all required fields.'); // Consider a PrimeNG Toast for better UX
      this.markAllAsTouched(this.form);
      return;
    }

    this.onSubmit.emit(this.form.value);
    this.onOpenChange.emit(false);

    if (!this.isEditMode) {
      this.form.reset();
      this.formConfig.filter(f => f.type === 'file').forEach(f => {
        this.form.get(f.key)?.setValue(null);
      });
    }
  }

  private markAllAsTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markAllAsTouched(control);
      }
    });
  }

  /**
   * Get fields for the left column
   * This creates exactly equal field distribution between left and right columns
   */
  getLeftColumnFields() {
    if (!this.formConfig || this.formConfig.length === 0) return [];
    
    // Calculate exactly half the fields for left column
    const halfIndex = Math.ceil(this.formConfig.length / 2);
    return this.formConfig.slice(0, halfIndex);
  }

  /**
   * Get fields for the right column
   * This creates exactly equal field distribution between left and right columns
   */
  getRightColumnFields() {
    if (!this.formConfig || this.formConfig.length === 0) return [];
    
    // Calculate exactly half the fields for right column
    const halfIndex = Math.ceil(this.formConfig.length / 2);
    return this.formConfig.slice(halfIndex);
  }

  isSelectMultiple(fieldKey: string): boolean {
    return this.formConfig.find(f => f.key === fieldKey)?.type === 'select-multiple';
  }
}