import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CommentorSheetComponent } from '../../../commentor-sheet/commentor-sheet.component';
import { SegFormComponent } from './seg-form.component';

@Component({
  selector: 'app-seg-form-commentor-sheet',
  standalone: true,
  imports: [
    CommonModule,
    CommentorSheetComponent
  ],
  templateUrl: './seg-form-commentor-sheet.component.html',
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class SegFormCommentorSheetComponent implements OnInit {
  segFormComponent = SegFormComponent;
  
  mode: 'add' | 'edit' | 'view' = 'add';
  record: any = null;
  formData: any = {};
  transactionId: string | number | undefined = undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get query parameters from the route
    this.route.queryParams.subscribe(params => {
      console.log('🔍 SegFormCommentorSheet - Query params:', params);
      
      this.mode = params['mode'] || 'add';
      this.transactionId = params['id'];
      
      // Parse form data if provided
      if (params['formData']) {
        try {
          this.formData = JSON.parse(params['formData']);
          this.record = this.formData;
          console.log('🔍 SegFormCommentorSheet - Parsed form data:', this.formData);
        } catch (error) {
          console.error('Error parsing form data:', error);
          this.formData = {};
        }
      }
      
      console.log('🔍 SegFormCommentorSheet - Final state:', {
        mode: this.mode,
        transactionId: this.transactionId,
        formData: this.formData,
        record: this.record
      });
    });
  }

  onFormSubmit(event: any): void {
    console.log('🔍 SegFormCommentorSheet - Form submitted:', event);
    // Handle form submission if needed
    // The CommentorSheetComponent will handle the actual submission
  }

  onCommentAdded(event: any): void {
    console.log('🔍 SegFormCommentorSheet - Comment added:', event);
    // Handle comment addition if needed
    // The CommentorSheetComponent will handle the actual comment addition
  }
}
