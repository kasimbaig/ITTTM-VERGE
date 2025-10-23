import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../../../../services/api.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-lubricant-consumption',
  standalone: false,
  templateUrl: './lubricant-consumption.component.html',
  styleUrl: './lubricant-consumption.component.css'
})
export class LubricantConsumptionComponent implements OnInit {

  lubricantForm!: FormGroup;
  isEditMode: boolean = false;
  displayDialog: boolean = false;
  lubricantOptions: any[] = [];
  lubricantData: any[] = [];
  isEdit: boolean = true;
  headerData:any;
  constructor(private apiService: ApiService, private messageService: MessageService) {
    this.lubricantForm = new FormGroup({
      lubricant: new FormControl('', [Validators.required]),
      quantity: new FormControl('', [Validators.required, Validators.min(0)]),
      unit: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() {
    this.headerData=this.apiService.getData();
    this.loadLubricantData();
    this.loadLubricantOptions();
  }

  loadLubricantData() {
    this.apiService.get('srar/srar-monthly-lubricants/?srar_monthly_header='+this.headerData.id).subscribe((data) => {
      this.lubricantData = data.results;
    });
  }

  loadLubricantOptions() {
    this.apiService.get('master/lubricant/?is_dropdown=true').subscribe((response: any) => {
      if (response && response.data) {
        this.lubricantOptions = response.data.map((item: any) => ({
          label: item.name,
          value: item.id,
          ...item
        }));
      }
    });
  }

  onLubricantSelect(event: any) {
    // When lubricant is selected, we'll use the lubricant name for the name field
    // and lubricant ID for the lubricant field
    //console.log('Lubricant selected:', event.value);
  }

  addLubricant() {
    this.isEdit = false;
    this.isEditMode = false;
    this.lubricantForm.reset();
    this.displayDialog = true;
  }

  editLubricant() {
    this.isEdit = false;
    //console.log('editLubricant - Entered edit mode');
  }

  saveLubricant() {
    this.isEdit = true;
    
    // Filter out rows that have been filled with data
    const dataToSave = this.lubricantData.filter(item => 
      item.name && item.lubricant && item.quantity && item.unit
    );

    if (dataToSave.length === 0) {
      //console.log('No lubricant data to save');
      return;
    }

    // Process each item individually - new records get POST, existing records get PUT
    dataToSave.forEach(item => {
      // Create payload with only the fields that should be sent to API
      const payload = {
        srar_monthly_header:this.headerData.id,
        name: item.name,
        lubricant: item.lubricant,
        quantity: item.quantity,
        unit: item.unit
      };

      if (item.id) {
        // Update existing record with PUT
        //console.log('PUT API call for existing lubricant record:', payload);
        this.apiService.put(`srar/srar-monthly-lubricants/${item.id}/`, payload).subscribe({
          next: (response) => {
            //console.log('Updated lubricant data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Lubricant data updated successfully'
            });
          },
          error: (error) => {
            console.error('Error updating lubricant data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update lubricant data'
            });
          }
        });
      } else {
        // Create new record with POST
        //console.log('POST API call for new lubricant record:', payload);
        this.apiService.post('srar/srar-monthly-lubricants/', payload).subscribe({
          next: (response) => {
            //console.log('Saved lubricant data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Lubricant data saved successfully'
            });
            // Reload data after successful save
            this.loadLubricantData();
          },
          error: (error) => {
            console.error('Error saving lubricant data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to save lubricant data'
            });
          }
        });
      }
    });

    //console.log('saveLubricant', { dataToSave });
  }

  saveLubricantForm() {
    if (this.lubricantForm.valid) {
      const formValue = this.lubricantForm.value;
      
      // Get the selected lubricant details
      const selectedLubricant = this.lubricantOptions.find(option => option.value === formValue.lubricant);
      
      if (selectedLubricant) {
        // Add new lubricant to the data array
        this.lubricantData.push({
          srar_monthly_header:this.headerData.id,
          name: selectedLubricant.label, // Lubricant name
          lubricant: selectedLubricant.value, // Lubricant ID
          quantity: formValue.quantity,
          unit: formValue.unit
        });
        
 
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Lubricant added successfully'
        });
      }
      
      this.lubricantForm.reset();
      this.displayDialog = false;
    }
  }

  editLubricantItem(item: any) {
    this.isEditMode = true;
    this.lubricantForm.patchValue({
      lubricant: item.lubricant,
      quantity: item.quantity,
      unit: item.unit
    });
    this.displayDialog = true;
  }

  deleteLubricant(index: number) {
    const item = this.lubricantData[index];
    
    if (item.id) {
      // Delete from API if it has an ID
      this.apiService.delete(`srar/srar-monthly-lubricants/${item.id}/`).subscribe({
        next: (response) => {
          //console.log('Deleted lubricant data:', response);
          this.lubricantData.splice(index, 1);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message || 'Lubricant data deleted successfully'
          });
        },
        error: (error) => {
          console.error('Error deleting lubricant data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to delete lubricant data'
          });
        }
      });
    } else {
      // Remove from local array if it's a new item
      this.lubricantData.splice(index, 1);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Lubricant removed successfully'
      });
    }
  }

  cancelDialog() {
    this.isEditMode = false;
    this.lubricantForm.reset();
    this.displayDialog = false;
  }
}
