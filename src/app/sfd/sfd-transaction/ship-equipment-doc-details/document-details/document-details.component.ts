import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { FormControl, FormGroup } from '@angular/forms';
import { DeleteConfirmationModalComponent } from '../../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-document-details',
  standalone: false,
  templateUrl: './document-details.component.html',
})
export class DocumentDetailsComponent implements OnInit {
  showEditDialog = false;
  isEdit = false;
  
  // Delete confirmation modal properties
  isDeleteConfirmationVisible: boolean = false;
  selectedDocument: any = null;
  documentForm=new FormGroup({
    document_type: new FormControl(''),
    reference_no: new FormControl(''),
    category: new FormControl(''),
    location: new FormControl(''),
    description: new FormControl(''),
  });
  documentTypeOptions: any[] = [
    { label: 'Technical Documentation', value: 'technical_documentation' },
    { label: 'Operation Manual', value: 'operation_manual' },
    { label: 'Maintenance Manual', value: 'maintenance_manual' },
    { label: 'Safety Procedures', value: 'safety_procedures' },
    { label: 'Installation Guide', value: 'installation_guide' }
  ];
  locationOptions: any[] = [];

  // Table Columns Configuration
  tableColumns = [
    { field: 'document_type', header: 'Document Type', type: 'text', sortable: true, filterable: true },
    { field: 'description', header: 'Description', type: 'text', sortable: true, filterable: true },
    { field: 'category', header: 'Category', type: 'number', sortable: true, filterable: true },
    { field: 'location_name', header: 'Location', type: 'text', sortable: true, filterable: true },
    { field: 'reference_no', header: 'Reference No', type: 'text', sortable: true, filterable: true },
    { field: 'active', header: 'Status', type: 'status', sortable: true, filterable: true },
  ];

  rowData: any;
  
  // Table Data
  tableData: any[]  = [];
  constructor(private apiService: ApiService, private route: ActivatedRoute, private router: Router, private toast: MessageService) {}
  ngOnInit(): void {
    this.rowData = this.apiService.getData();
    this.apiCall();
    this.currentPageApi(0 ,0)
    //console.log('SFD Component initialized with', this.tableData.length, 'records');
  }
  currentPageApi(page: number, pageSize: number){
    this.apiService.get(`sfd/equipment-document-details/?equipment=${this.rowData.id}`).subscribe((res: any) => {
      // Set the table data from the results array of the API response
      if (res && res.results && Array.isArray(res.results)) {
        this.tableData = res.results;
        //console.log('Table data updated with', this.tableData.length, 'records');
      } else {
        //console.log('No results found in API response');
        this.tableData = [];
      }
    });
  }

  apiCall(){
    this.apiService.get(`master/locations/?is_dropdown=true`).subscribe((res: any) => {
      this.locationOptions = res.data;
    });
  }

  onView(data: any): void {
    this.documentForm.patchValue(data);
    this.showEditDialog = true;
    this.isEdit = false;
    this.documentForm.disable()
    //console.log('View SFD:', data);
    this.selectedDocument = data;
  }
  onEdit(data: any): void {
    this.documentForm.patchValue(data);
    //console.log('Edit SFD:', data);
    this.selectedDocument = data;
    this.showEditDialog = true;
    this.isEdit = true;
  }
  onAdd(data: any): void {
    this.showEditDialog = true;
    this.isEdit = false;
  }
  onDelete(data: any): void {
    //console.log('Delete Document Details:', data);
    this.selectedDocument = data;
    this.isDeleteConfirmationVisible = true;
  }

  confirmDelete(): void {
    if (this.selectedDocument) {
      this.apiService.delete(`sfd/equipment-document-details/${this.selectedDocument.id}/`).subscribe({
        next: () => {
          this.toast.add({severity:'success', summary: 'Success', detail: 'Document Details Deleted Successfully'});
          this.currentPageApi(0, 0); // Refresh the table data
          this.isDeleteConfirmationVisible = false;
          this.selectedDocument = null;
        },
        error: (error) => {
          this.toast.add({severity:'error', summary: 'Error', detail: 'Failed to delete Document Details record'});
          console.error('Delete error:', error);
          this.isDeleteConfirmationVisible = false;
          this.selectedDocument = null;
        }
      });
    }
  }

  cancelDelete(): void {
    this.isDeleteConfirmationVisible = false;
    this.selectedDocument = null;
  }
  onSaveDocument(): void {
    //console.log('Save Document:', this.documentForm.value);
    
    // Prepare the payload with form data and row data
    const payload = {
      equipment: this.rowData?.id,
      location: this.documentForm.value.location || '',
      reference_no: this.documentForm.value.reference_no || '',
      category: this.documentForm.value.category || '',
      description: this.documentForm.value.description || '',
      manufacturer: this.rowData?.manufacturer ,
      supplier: this.rowData?.supplier,
      document_type: this.documentForm.value.document_type || ''
    };

    //console.log('Sending payload:', payload);

    // Make POST API call
    if(this.selectedDocument){
      this.apiService.put(`sfd/equipment-document-details/${this.selectedDocument.id}/`, payload).subscribe({
        next: (response: any) => {
          //console.log('Document saved successfully:', response);
          this.showEditDialog = false;
          this.documentForm.reset();
         this.selectedDocument=null;
          this.currentPageApi(0, 0);
        },
        error: (error: any) => {
          console.error('Error saving document:', error);
        }
      });
    }
    else{
      this.apiService.post('sfd/equipment-document-details/', payload).subscribe({
      next: (response: any) => {
        //console.log('Document saved successfully:', response);
        this.showEditDialog = false;
        this.documentForm.reset();
        // Refresh the table data
        this.currentPageApi(0, 0);
      },
      error: (error: any) => {
        console.error('Error saving document:', error);
      }
    });
  }
    
  }
  onCancelEdit(): void {
    this.showEditDialog = false;
    this.documentForm.reset();
    this.documentForm.enable();
    this.isDeleteConfirmationVisible = false;
    this.selectedDocument = null;
  }

  }