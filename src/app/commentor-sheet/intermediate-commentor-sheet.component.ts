import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CommentorSheetComponent } from './commentor-sheet.component';
import { IntermediateFormComponent } from '../forms-modules/forms/intermediate-form/intermediate-form.component';

@Component({
  selector: 'app-intermediate-commentor-sheet',
  standalone: true,
  imports: [CommonModule, CommentorSheetComponent, IntermediateFormComponent],
  template: `
    <app-commentor-sheet
      title="Intermediate Form Records"
      [customFormComponent]="intermediateFormComponent"
      [mode]="mode"
      [record]="record"
      [inputFormData]="formData"
      [transactionId]="transactionId"
      [submodule]="3"
      (onSubmit)="onFormSubmit($event)"
      (onAddComment)="onCommentAdded($event)"
    ></app-commentor-sheet>
  `,
  styles: []
})
export class IntermediateCommentorSheetComponent implements OnInit {
  intermediateFormComponent = IntermediateFormComponent;
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
