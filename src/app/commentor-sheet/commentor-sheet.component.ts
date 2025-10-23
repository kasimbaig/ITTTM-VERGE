import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export interface Comment {
  id: number;
  avatar: string;
  author: string;
  date: string;
  text: string;
  likes: number;
  replies: number;
  _apiData?: any;
}

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  employeeId: string;
  hireDate: string;
  project: string;
  comments: string;
  file: File | null;
}

export interface CommentorSheetProps {
  title?: string;
  comments?: Comment[];
  formFields?: {
    showFirstName?: boolean;
    showLastName?: boolean;
    showEmail?: boolean;
    showDepartment?: boolean;
    showEmployeeId?: boolean;
    showHireDate?: boolean;
    showProject?: boolean;
    showComments?: boolean;
    showFile?: boolean;
  };
  departments?: string[];
  onSubmit?: (formData: FormData) => void;
  onAddComment?: (comment: Comment) => void;
  onEditRouteConfig?: () => void;
  mode?: 'add' | 'edit' | 'view';
  record?: any;
  className?: string;
  customForm?: any;
  transactionId?: string | number;
  submodule?: number;
}

@Component({
  selector: 'app-commentor-sheet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './commentor-sheet.component.html',
  styleUrls: ['./commentor-sheet.component.css']
})
export class CommentorSheetComponent implements OnInit {
  @Input() title: string = "Commentor Sheet";
  @Input() comments: Comment[] = [];
  @Input() formFields: any = {
    showFirstName: true,
    showLastName: true,
    showEmail: true,
    showDepartment: true,
    showEmployeeId: true,
    showHireDate: true,
    showProject: true,
    showComments: true,
    showFile: true,
  };
  @Input() departments: string[] = ["Sales", "Marketing", "Information Technology", "Human Resources", "Finance"];
  @Input() mode: 'add' | 'edit' | 'view' = 'add';
  @Input() record: any;
  @Input() className: string = "";
  @Input() customForm: any;
  @Input() customFormComponent: any | null = null; // New input for dynamic form components
  @Input() inputFormData: any = {}; // Input for form data (renamed to avoid conflict)
  @Input() transactionId?: string | number;
  @Input() submodule?: number;

  @Output() onSubmit = new EventEmitter<FormData>();
  @Output() onAddComment = new EventEmitter<Comment>();
  @Output() onEditRouteConfig = new EventEmitter<void>();

  @ViewChild('commentsSection', { static: false }) commentsSectionRef!: ElementRef;

  viewMode: 'form' | 'comments' = 'form';
  qrCodes: {[key: number]: string} = {};
  commentsList: Comment[] = [];
  newComment = {
    author: '',
    text: ''
  };
  showCommentForm = false;
  loading = false;
  commentsLoading = false;
  
  formData: FormData = {
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    employeeId: '',
    hireDate: '',
    project: '',
    comments: '',
    file: null
  };

  commentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastService: ToastService
  ) {
    this.commentForm = this.fb.group({
      text: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Initialize with empty comments list - will be populated from API
    this.commentsList = [];
    
    this.currentTransactionId = this.transactionId || this.record?.id;
    
    // Fetch comments from API if we have transaction ID and submodule
    if (this.transactionId && this.submodule) {
    
      this.fetchComments();
    } else {
    }
  }

  get currentTransactionId(): string | number | undefined {
    return this.transactionId || this.record?.id;
  }

  set currentTransactionId(value: string | number | undefined) {
    this.transactionId = value;
  }

  handleInputChange(event: any): void {
    const { name, value, type } = event.target;
    const target = event.target as HTMLInputElement;
    
    // Use input formData if available, otherwise use local formData
    const currentFormData = this.formData || this.formData;
    this.formData = {
      ...currentFormData,
      [name]: type === 'file' ? target.files?.[0] : value
    };
  }

  handleSubmit(event: Event): void {
    event.preventDefault();
    this.onSubmit.emit(this.formData);
  }

  handleCommentInputChange(event: any): void {
    const { name, value } = event.target;
    this.newComment = {
      ...this.newComment,
      [name]: value
    };
  }

  async handleAddComment(event: Event): Promise<void> {
    event.preventDefault();
    
    // Don't allow adding comments in view mode
    if (this.mode === 'view') {
      this.toastService.showError('Cannot add comments in view mode.');
      return;
    }
    
    if (!this.commentForm.get('text')?.value?.trim()) {
      this.toastService.showError('Please fill in the comment text.');
      return;
    }

    if (!this.transactionId || !this.submodule) {
      this.toastService.showError('Missing transaction ID or submodule information.');
      return;
    }

    this.loading = true;
    try {
      const commentPayload = {
        comment: this.commentForm.get('text')?.value?.trim(),
        submodule: this.submodule,
        transaction_id: Number(this.transactionId)
      };

      const response = await this.apiService.post('hitu/comments/', commentPayload).toPromise();
    
      const newCommentData: Comment = {
        id: response.id || Math.max(...this.commentsList.map(c => c.id), 0) + 1,
        avatar: 'U',
        author: 'You',
        date: new Date().toLocaleString(),
        text: this.commentForm.get('text')?.value?.trim() || '',
        likes: 0,
        replies: 0
      };

      this.commentsList = [newCommentData, ...this.commentsList];

      const qrCode = await this.generateQRCode(newCommentData.id, newCommentData);
      if (qrCode) {
        this.qrCodes = {
          ...this.qrCodes,
          [newCommentData.id]: qrCode
        };
      }

      this.commentForm.reset();
      this.showCommentForm = false;
      
      this.fetchComments();
      
      this.onAddComment.emit(newCommentData);
      this.toastService.showSuccess('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      this.toastService.showError('Failed to add comment. Please try again.');
    } finally {
      this.loading = false;
    }
  }

  async fetchComments(): Promise<void> {
    if (!this.transactionId || !this.submodule) return;
    
    this.commentsLoading = true;
    try {
      const apiUrl = `hitu/comments/?submodule=${this.submodule}&transaction_id=${Number(this.transactionId)}`;
      
      const response = await this.apiService.get(apiUrl).toPromise();
      
      const apiComments: Comment[] = (response.results || response.data || []).map((comment: any) => {
        const authorName = comment.created_by 
          ? `${comment.created_by.first_name || ''} ${comment.created_by.last_name || ''}`.trim()
          : 'Unknown User';
        
        return {
          id: comment.id,
          avatar: authorName ? authorName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U',
          author: authorName,
          date: comment.created_on ? new Date(comment.created_on).toLocaleString() : new Date().toLocaleString(),
          text: comment.comment || comment.text || '',
          likes: 0,
          replies: 0,
          _apiData: comment
        };
      });
      
      this.commentsList = apiComments;      
      // Generate QR codes for the loaded comments
      await this.generateAllQRCodes();
    } catch (error) {
      console.error('❌ Error fetching comments:', error);
    } finally {
      this.commentsLoading = false;
    }
  }

  handleAddCommentClick(): void {
    // Don't show comment form in view mode
    if (this.mode === 'view') {
      return;
    }
    this.showCommentForm = true;
  }

  async generateQRCode(commentId: number, commentData: any): Promise<string | null> {
    try {
      const simpleData = `Comment ID: ${commentId}\nAuthor: ${commentData.author}\nDate: ${commentData.date}\nText: ${commentData.text}`;
      
      const qrCodeDataURL = await QRCode.toDataURL(simpleData, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'L',
        type: 'image/png'
      });
      
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  }

  async generateAllQRCodes(): Promise<void> {
    const qrCodePromises = this.commentsList.map(async (comment) => {
      const qrCode = await this.generateQRCode(comment.id, comment);
      return { id: comment.id, qrCode };
    });
    
    const qrCodeResults = await Promise.all(qrCodePromises);
    const qrCodeMap: {[key: number]: string} = {};
    
    qrCodeResults.forEach(({ id, qrCode }) => {
      if (qrCode) {
        qrCodeMap[id] = qrCode;
      }
    });
    
    this.qrCodes = qrCodeMap;
  }

  async downloadCommentsPDF(): Promise<void> {
    const doc = new jsPDF();
    
    doc.setFont('helvetica');
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(`${this.title} - Comments Report`, 20, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40);
    
    doc.setDrawColor(78, 205, 196);
    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45);
    
    let yPosition = 60;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    
    for (let index = 0; index < this.commentsList.length; index++) {
      const comment = this.commentsList[index];
      
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 30;
      }
      
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text(`${index + 1}. ${comment.author}`, margin, yPosition);
      
      yPosition += 8;
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(comment.date, margin, yPosition);
      
      yPosition += 12;
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      
      const commentText = comment.text;
      const isHindiText = /[\u0900-\u097F]/.test(commentText);
      
      if (isHindiText) {
        const transliteratedText = `[Hindi Comment: ${commentText}]`;
        const splitText = doc.splitTextToSize(transliteratedText, 120);
        doc.text(splitText, margin, yPosition);
        yPosition += splitText.length * 5;
        
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text('Note: Original Hindi text preserved in QR code', margin, yPosition);
        yPosition += 5;
      } else {
        const splitText = doc.splitTextToSize(commentText, 120);
        doc.text(splitText, margin, yPosition);
        yPosition += splitText.length * 5;
      }
      
      if (this.qrCodes[comment.id]) {
        try {
          const qrCodeImg = this.qrCodes[comment.id];
          const qrY = Math.max(yPosition - 30, 60);
          doc.addImage(qrCodeImg, 'PNG', 130, qrY, 50, 50);
          
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text('Digital Signature', 130, qrY + 55);
        } catch (error) {
          console.error('Error adding QR code to PDF:', error);
        }
      }
      
      yPosition += 35;
      
      if (index < this.commentsList.length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.line(margin, yPosition - 5, 190, yPosition - 5);
        yPosition += 10;
      }
    }
    
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${totalPages}`, 20, pageHeight - 10);
      doc.text('Generated by Hull Insight System', 150, pageHeight - 10);
    }
    
    doc.save(`${this.title.toLowerCase().replace(/\s+/g, '-')}-comments-report.pdf`);
  }

  setViewMode(mode: 'form' | 'comments'): void {
    this.viewMode = mode;
  }

  onEditRouteConfigClick(): void {
    this.onEditRouteConfig.emit();
  }

  onMouseEnter(event: Event): void {
    const target = event.target as HTMLElement;
    if (target) {
      target.style.backgroundColor = '#2563eb';
    }
  }

  onMouseLeave(event: Event): void {
    const target = event.target as HTMLElement;
    if (target) {
      target.style.backgroundColor = '#3b82f6';
    }
  }

  getDepartmentValue(dept: string): string {
    return dept.toLowerCase().replace(/\s+/g, '-');
  }

  getFormInputs(): any {
    return {
      mode: this.mode,
      record: this.record,
      formData: this.inputFormData || this.formData,
      transactionId: this.transactionId,
      submodule: this.submodule,
      isViewMode: this.mode === 'view',
      isEditMode: this.mode === 'edit',
      formOnlyMode: true, // Force form-only mode for Commentor Sheet
      // Pass the record data for edit/view modes
      ...(this.record && { recordData: this.record })
    };
  }
}
