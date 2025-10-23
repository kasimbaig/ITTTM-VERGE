import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from '../../../../../../services/api.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-test-kits-centrifuge',
  standalone: false,
  templateUrl: './test-kits-centrifuge.component.html',
  styleUrl: './test-kits-centrifuge.component.css'
})
export class TestKitsCentrifugeComponent implements OnInit {
  testKitsData: any[] = [];
  centrifugeData: any[] = [];
  isEdit: boolean = true;
  @Input() srarEquipmentData: any[] = [];
  
  // Properties to track selected values for centrifuge
  selectedEquipment: any[] = [];
  headerData:any;
  constructor(private apiService: ApiService, private messageService: MessageService) {}
  
  ngOnInit() {
    this.headerData=this.apiService.getData();
    this.loadTestKitsData();
    this.loadCentrifugeData();
  }

  loadTestKitsData() {
    this.apiService.get('srar/ops-status-of-lub-oil-and-coolant-test-kits/?srar_monthly_header='+this.headerData.id).subscribe((data) => {
      this.testKitsData = data.results;
    });
  }

  loadCentrifugeData() {
    this.apiService.get('srar/ops-status-of-lub-oil-and-fuel-centrifuge/?srar_monthly_header='+this.headerData.id).subscribe((data) => {
      this.centrifugeData = data.results;
    });
  }

  addTestKits() {
    this.isEdit = false;
    
    // Add new empty row
    this.testKitsData.push({
      srar_monthly_header:this.headerData.id,
      test_kits_description: '',
      ops_or_non_ops: '',
      non_ops_since: '',
      last_trials_taken: '',
      next_trials_due: ''
    });
    
    //console.log('addTestKits - Added new row');
  }

  addCentrifuge() {
    this.isEdit = false;
    
    // Check if any equipment is selected
    if (this.selectedEquipment.length > 0) {
      // Create a row for each selected equipment
      this.selectedEquipment.forEach(selectedEquipmentData => {
        // Add new row with selected equipment data
        this.centrifugeData.push({
          srar_monthly_header:this.headerData.id,
          sfd_details: selectedEquipmentData.id, // Send only the ID
          equipment_sr_no: selectedEquipmentData.serial_no, // Leave empty for manual filling
          ops_or_non_ops: '',
          non_ops_since: '',
          // Frontend display fields (not sent to API)
          equipment_name: selectedEquipmentData.equipment_name,
          equipment_code: selectedEquipmentData.equipment_code,
          nomenclature: selectedEquipmentData.nomenclature || '',
          location_name: selectedEquipmentData.location_name || ''
        });
      });
      
      //console.log('addCentrifuge', { selectedEquipment: this.selectedEquipment });
      
      // Clear the selection after adding
      this.selectedEquipment = [];
    }
  }

  editTestKits() {
    this.isEdit = false;
    //console.log('editTestKits - Entered edit mode');
  }

  editCentrifuge() {
    this.isEdit = false;
    //console.log('editCentrifuge - Entered edit mode');
  }

  saveTestKits() {
    this.isEdit = true;
    
    // Filter out rows that have been filled with data
    const dataToSave = this.testKitsData.filter(item => 
      item.test_kits_description || 
      item.ops_or_non_ops || 
      item.non_ops_since || 
      item.last_trials_taken || 
      item.next_trials_due
    );

    if (dataToSave.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'No test kits data to save'
      });
      return;
    }

    // Process each item individually - new records get POST, existing records get PUT
    dataToSave.forEach(item => {
      if (item.id) {
        // Update existing record with PUT
        //console.log('PUT API call for existing test kits record:', item);
        this.apiService.put(`srar/ops-status-of-lub-oil-and-coolant-test-kits/${item.id}/`, item).subscribe({
          next: (response) => {
            //console.log('Updated test kits data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Test kits data updated successfully'
            });
          },
          error: (error) => {
            console.error('Error updating test kits data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Error updating test kits data'
            });
          }
        });
      } else {
        // Create new record with POST
        //console.log('POST API call for new test kits record:', item);
        this.apiService.post('srar/ops-status-of-lub-oil-and-coolant-test-kits/', item).subscribe({
          next: (response) => {
            //console.log('Saved test kits data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Test kits data saved successfully'
            });
            // Reload data after successful save
            this.loadTestKitsData();
          },
          error: (error) => {
            console.error('Error saving test kits data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Error saving test kits data'
            });
          }
        });
      }
    });

    //console.log('saveTestKits', { dataToSave });
  }

  saveCentrifuge() {
    this.isEdit = true;
    
    // Filter out rows that have been filled with data
    const dataToSave = this.centrifugeData.filter(item => 
      item.sfd_details // Only require sfd_details to be present
    );

    if (dataToSave.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'No centrifuge data to save'
      });
      return;
    }

    // Process each item individually - new records get POST, existing records get PUT
    dataToSave.forEach(item => {
      // Create payload with only the fields that should be sent to API
      const payload = {
        srar_monthly_header:this.headerData.id,
          sfd_details: item.sfd_details,
        equipment_sr_no: item.equipment_sr_no,
        ops_or_non_ops: item.ops_or_non_ops,
        non_ops_since: item.non_ops_since
      };

      if (item.id) {
        // Update existing record with PUT
        //console.log('PUT API call for existing centrifuge record:', payload);
        this.apiService.put(`srar/ops-status-of-lub-oil-and-fuel-centrifuge/${item.id}/`, payload).subscribe({
          next: (response) => {
            //console.log('Updated centrifuge data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Centrifuge data updated successfully'
            });
          },
          error: (error) => {
            console.error('Error updating centrifuge data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Error updating centrifuge data'
            });
          }
        });
      } else {
        // Create new record with POST
        //console.log('POST API call for new centrifuge record:', payload);
        this.apiService.post('srar/ops-status-of-lub-oil-and-fuel-centrifuge/', payload).subscribe({
          next: (response) => {
            //console.log('Saved centrifuge data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Centrifuge data saved successfully'
            });
            // Reload data after successful save
            this.loadCentrifugeData();
          },
          error: (error) => {
            console.error('Error saving centrifuge data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Error saving centrifuge data'
            });
          }
        });
      }
    });

    //console.log('saveCentrifuge', { dataToSave });
  }

  deleteTestKits(index: number) {
    const item = this.testKitsData[index];
    
    if (item.id) {
      // Delete from API if it has an ID
      this.apiService.delete(`srar/ops-status-of-lub-oil-and-coolant-test-kits/${item.id}/`).subscribe({
        next: (response) => {
          //console.log('Deleted test kits data:', response);
          this.testKitsData.splice(index, 1);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message || 'Test kits data deleted successfully'
          });
        },
        error: (error) => {
          console.error('Error deleting test kits data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Error deleting test kits data'
          });
        }
      });
    } else {
      // Remove from local array if it's a new item
      this.testKitsData.splice(index, 1);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Test kits data removed successfully'
      });
    }
  }

  deleteCentrifuge(index: number) {
    const item = this.centrifugeData[index];
    
    if (item.id) {
      // Delete from API if it has an ID
      this.apiService.delete(`srar/ops-status-of-lub-oil-and-fuel-centrifuge/${item.id}/`).subscribe({
        next: (response) => {
          //console.log('Deleted centrifuge data:', response);
          this.centrifugeData.splice(index, 1);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message || 'Centrifuge data deleted successfully'
          });
        },
        error: (error) => {
          console.error('Error deleting centrifuge data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Error deleting centrifuge data'
          });
        }
      });
    } else {
      // Remove from local array if it's a new item
      this.centrifugeData.splice(index, 1);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Centrifuge data removed successfully'
      });
    }
  }
}
