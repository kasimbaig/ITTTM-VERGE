import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastService } from '../../../services/toast.service';

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea' | 'boolean';
  required: boolean;
  placeholder?: string;
  options?: any[];
  fullWidth?: boolean;
}

@Component({
  selector: 'app-ship-category-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    CheckboxModule
  ],
  templateUrl: './ship-category-form.component.html',
  styleUrls: ['./ship-category-form.component.css']
})
export class ShipCategoryFormComponent implements OnInit {
  @Input() open: boolean = false;
  @Input() formConfig: FormField[] = [];
  @Input() formData: any = {};
  @Input() formTitle: string = 'Add Ship Category';
  @Input() isEditMode: boolean = false;
  
  @Output() onOpenChange = new EventEmitter<boolean>();
  @Output() onSubmit = new EventEmitter<any>();

  categoryForm!: FormGroup;
  visible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(): void {
    if (this.open !== this.visible) {
      this.visible = this.open;
      if (this.open) {
        this.initializeForm();
      }
    }
  }

  private initializeForm(): void {
    const formGroup: any = {};
    
    this.formConfig.forEach(field => {
      const validators = [];
      if (field.required) {
        validators.push(Validators.required);
      }
      
      if (field.type === 'email') {
        validators.push(Validators.email);
      }

      formGroup[field.key] = [this.formData[field.key] || '', validators];
    });

    this.categoryForm = this.fb.group(formGroup);
  }

  onHide(): void {
    this.visible = false;
    this.onOpenChange.emit(false);
  }

  handleSubmit(): void {
    if (this.categoryForm.valid) {
      const formValue = this.categoryForm.value;
      
      // Convert boolean values
      if (formValue.active !== undefined) {
        formValue.active = Boolean(formValue.active);
      }

      // Convert date values to string format
      Object.keys(formValue).forEach(key => {
        if (formValue[key] instanceof Date) {
          formValue[key] = this.formatDate(formValue[key]);
        }
      });

      this.onSubmit.emit(formValue);
      this.onHide();
    } else {
      this.markFormGroupTouched();
      this.toastService.showError('Please fill all required fields');
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private markFormGroupTouched(): void {
    Object.keys(this.categoryForm.controls).forEach(key => {
      const control = this.categoryForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.categoryForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.categoryForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const fieldConfig = this.formConfig.find(f => f.key === fieldName);
    return fieldConfig?.label || fieldName;
  }
} 