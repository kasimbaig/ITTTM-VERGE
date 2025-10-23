import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CommentorSheetComponent } from './commentor-sheet.component';
import { FinalFormComponent } from '../forms-modules/forms/final-form/final-form.component';

@Component({
  selector: 'app-final-commentor-sheet',
  standalone: true,
  imports: [CommonModule, CommentorSheetComponent, FinalFormComponent],
  template: `
    <app-commentor-sheet
      title="Final Underwater Hull Inspection"
      [customFormComponent]="finalFormComponent"
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
export class FinalCommentorSheetComponent implements OnInit {
  finalFormComponent = FinalFormComponent;
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
