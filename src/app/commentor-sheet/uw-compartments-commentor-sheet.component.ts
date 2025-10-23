import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CommentorSheetComponent } from './commentor-sheet.component';
import { UwCompartmentsFormComponent } from '../forms-modules/forms/uw-compartments-form/uw-compartments-form.component';

@Component({
  selector: 'app-uw-compartments-commentor-sheet',
  standalone: true,
  imports: [CommonModule, CommentorSheetComponent, UwCompartmentsFormComponent],
  template: `
    <app-commentor-sheet
      title="U/W Compartments Form Records"
      [customFormComponent]="uwCompartmentsFormComponent"
      [mode]="mode"
      [record]="record"
      [inputFormData]="formData"
      [transactionId]="transactionId"
      [submodule]="1"
      (onSubmit)="onFormSubmit($event)"
      (onAddComment)="onCommentAdded($event)"
    ></app-commentor-sheet>
  `,
  styles: []
})
export class UwCompartmentsCommentorSheetComponent implements OnInit {
  uwCompartmentsFormComponent = UwCompartmentsFormComponent;
  transactionId: string | number | undefined = undefined;
  mode: 'add' | 'edit' | 'view' = 'add';
  record: any = null;
  formData: any = {};

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Get query parameters
    this.route.queryParams.subscribe(params => {
      this.mode = params['mode'] || 'add';
      this.transactionId = params['id'];
      
      if (params['formData']) {
        try {
          this.formData = JSON.parse(params['formData']);
          this.record = this.formData;
        } catch (error) {
          console.error('Error parsing form data:', error);
          this.formData = {};
        }
      }
    });
  }

  onFormSubmit(formData: any): void {
    // Handle form submission
  }

  onCommentAdded(comment: any): void {
    // Handle comment addition
  }
}
