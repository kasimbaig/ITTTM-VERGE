import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CommentorSheetComponent } from './commentor-sheet.component';
import { EtmaFormComponent } from '../forms-modules/forms/preliminary-form/etma-form.component';

@Component({
  selector: 'app-preliminary-commentor-sheet',
  standalone: true,
  imports: [CommonModule, CommentorSheetComponent, EtmaFormComponent],
  template: `
    <app-commentor-sheet
      title="Preliminary Form Records"
      [customFormComponent]="etmaFormComponent"
      [mode]="mode"
      [record]="record"
      [inputFormData]="formData"
      [transactionId]="transactionId"
      [submodule]="4"
      (onSubmit)="onFormSubmit($event)"
      (onAddComment)="onCommentAdded($event)"
    ></app-commentor-sheet>
  `,
  styles: []
})
export class PreliminaryCommentorSheetComponent implements OnInit {
  etmaFormComponent = EtmaFormComponent;
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
