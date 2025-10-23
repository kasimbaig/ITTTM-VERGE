import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-ship-equipment-details',
  standalone:false,
  templateUrl: './ship-equipment-details.component.html',
  styleUrl: './ship-equipment-details.component.css'
})
export class ShipEquipmentDetailsComponent implements OnInit {
  isEdit = 'Add';
  // Dialog properties
  displayDialog: boolean = false;
  isMaximized: boolean = false;
  
  // Form for view/edit
  equipmentForm: FormGroup = new FormGroup({
    id: new FormControl(''),
    equipment_code: new FormControl(''),
    equipment_name: new FormControl(''),
    equipment_model: new FormControl(''),
  });
  
  // Delete confirmation modal properties
  isDeleteConfirmationVisible: boolean = false;
  selectedEquipmentDoc: any = null;

  // Table Columns Configuration - Updated to match API response
  tableColumns = [
    { field: 'code', header: 'Equipment Code', type: 'text', sortable: true, filterable: true },
    { field: 'name', header: 'Equipment Name', type: 'text', sortable: true, filterable: true },
    { field: 'model', header: 'Equipment Model', type: 'number', sortable: true, filterable: true },
  ];
  
  
  // Table Data - Will be populated from API response
  tableData: any[] = [];
  rowData: any[] = []
  
  constructor(private apiService: ApiService, private route: ActivatedRoute, private router: Router, private toast: MessageService) {}
  
  ngOnInit(): void {
    this.currentPageApi(0, 0)
    //console.log('SFD Component initialized with', this.tableData.length, 'records');
  }
  
  currentPageApi(page: number, pageSize: number){
    this.apiService.get(`master/equipment/`).subscribe((res: any) => {
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

  // Dialog methods
  openDialog(): void {
    this.displayDialog = true;
  }

  closeDialog(): void {
    this.displayDialog = false;
    this.equipmentForm.reset();
    this.equipmentForm.enable();
    this.isEdit = 'Add';
  }

  onView(event: any): void {
    this.isEdit = 'View';
    //console.log('View SFD:', event);
    this.rowData = event;
    
    // Map API data to form fields
    const formData = {
      id: event.id,
      equipment_code: event.equipment_code,
      equipment_name: event.equipment_name,
      equipment_model: event.equipment_model,
    };
    this.equipmentForm.patchValue(formData);
    
    // Disable form for view mode
    this.equipmentForm.disable();
    this.openDialog();
  }
  
  onEdit(event: any): void {
    this.isEdit = 'Edit';
    //console.log('Edit SFD:', event);
    this.rowData = event;
    this.apiService.setData(event);
    this.router.navigate(['/sfd/sfd-transactions/document-details']);
  }

    onDelete(event: any): void {
    //console.log('Delete Equipment Document Details:', event);
    this.selectedEquipmentDoc = event;
    this.isDeleteConfirmationVisible = true;
  }

  confirmDelete(): void {
    if (this.selectedEquipmentDoc) {
      this.apiService.delete(`sfd/equipment-document-details/${this.selectedEquipmentDoc.id}/`).subscribe({
        next: () => {
          this.toast.add({severity:'success', summary: 'Success', detail: 'Equipment Document Details Deleted Successfully'});
          this.currentPageApi(0, 0); // Refresh the table data
          this.isDeleteConfirmationVisible = false;
          this.selectedEquipmentDoc = null;
        },
        error: (error) => {
          this.toast.add({severity:'error', summary: 'Error', detail: 'Failed to delete Equipment Document Details record'});
          console.error('Delete error:', error);
          this.isDeleteConfirmationVisible = false;
          this.selectedEquipmentDoc = null;
        }
      });
    }
  }

  cancelDelete(): void {
    this.isDeleteConfirmationVisible = false;
    this.selectedEquipmentDoc = null;
  }

  
}
