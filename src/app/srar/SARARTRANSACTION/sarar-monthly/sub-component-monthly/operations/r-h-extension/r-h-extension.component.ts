import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../../../../../../services/api.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-r-h-extension',
  standalone: false,
  templateUrl: './r-h-extension.component.html',
  styleUrl: './r-h-extension.component.css'
})
export class RHExtensionComponent implements OnInit {
  @Input() srarEquipmentData: any[] = [];
  headerData:any;
  onRoutineOptions = [
    { value: 'yes', name: 'Yes' },
    { value: 'no', name: 'No' },
    { value: 'na', name: 'N/A' },
  ];

  // Main Engine data
  mainEngineData: any[] = [];
  isEditMainEngine: boolean = true;
  selectedMainEngineEquipment: any[] = [];

  // Diesel Alternator data
  dieselAlternatorData: any[] = [];
  isEditDieselAlternator: boolean = true;
  selectedDieselAlternatorEquipment: any[] = [];

  constructor(private apiService: ApiService, private messageService: MessageService) {}

  ngOnInit() {
    this.headerData=this.apiService.getData();
    this.loadMainEngineData();
    this.loadDieselAlternatorData();
  }

  // Main Engine Methods
  loadMainEngineData() {
    this.apiService.get('srar/rh-extensions/?equipment_type=1&srar_monthly_header='+this.headerData.id).subscribe((data) => {
      this.mainEngineData = data.results;
    });
  }

  addMainEngine() {
    this.isEditMainEngine = false;
    
    // Add equipment from selection
    if (this.selectedMainEngineEquipment && this.selectedMainEngineEquipment.length > 0) {
      this.selectedMainEngineEquipment.forEach(selectedEquipmentData => {
        // Add new row with selected equipment data
        this.mainEngineData.push({
          srar_monthly_header:this.headerData.id,
          sfd_details: selectedEquipmentData.id, // Send only the ID
          equipment_sr_no: '', // Leave empty for manual filling
          total_rh_in_month: '',
          on_routine: '',
          rh_ext_at_conduct_of_ext_trial: '',
          authority_letter_for_extension_trial: '',
          rh_extension_granted_upto: '',
          rh_left_for_expiry_of_extension: '',
          // Frontend display fields (not sent to API)
          equipment_name: selectedEquipmentData.equipment_name,
          nomenclature: selectedEquipmentData.nomenclature,
          location_name: selectedEquipmentData.location_name,
          ship_name: selectedEquipmentData.ship_name
        });
      });
      
      // Clear selection after adding
      this.selectedMainEngineEquipment = [];
    }
    
    //console.log('addMainEngine - Entered add mode');
  }

  editMainEngine() {
    this.isEditMainEngine = false;
    //console.log('editMainEngine - Entered edit mode');
  }

  saveMainEngine() {
    this.isEditMainEngine = true;
    
    // Filter out rows that have been filled with data
    const dataToSave = this.mainEngineData.filter(item => 
      item.sfd_details && item.equipment_sr_no
    );

    if (dataToSave.length === 0) {
      //console.log('No main engine data to save');
      return;
    }

    // Process each item individually - new records get POST, existing records get PUT
    dataToSave.forEach(item => {
      // Create payload with only the fields that should be sent to API
      const payload = {
        srar_monthly_header:this.headerData.id,
        sfd_details: item.sfd_details,
        equipment_sr_no: item.equipment_sr_no,
        total_rh_in_month: item.total_rh_in_month,
        on_routine: item.on_routine,
        rh_ext_at_conduct_of_ext_trial: item.rh_ext_at_conduct_of_ext_trial,
        authority_letter_for_extension_trial: item.authority_letter_for_extension_trial,
        rh_extension_granted_upto: item.rh_extension_granted_upto,
        rh_left_for_expiry_of_extension: item.rh_left_for_expiry_of_extension,
        equipment_type: 1 // Main Engine
      };

      if (item.id) {
        // Update existing record with PUT
        //console.log('PUT API call for existing main engine record:', payload);
        this.apiService.put(`srar/rh-extensions/${item.id}/`, payload).subscribe({
          next: (response) => {
            //console.log('Updated main engine data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Main engine data updated successfully'
            });
          },
          error: (error) => {
            console.error('Error updating main engine data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update main engine data'
            });
          }
        });
      } else {
        // Create new record with POST
        //console.log('POST API call for new main engine record:', payload);
        this.apiService.post('srar/rh-extensions/', payload).subscribe({
          next: (response) => {
            //console.log('Saved main engine data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Main engine data saved successfully'
            });
            // Reload data after successful save
            this.loadMainEngineData();
          },
          error: (error) => {
            console.error('Error saving main engine data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to save main engine data'
            });
          }
        });
      }
    });

    //console.log('saveMainEngine', { dataToSave });
  }

  deleteMainEngine(index: number) {
    const item = this.mainEngineData[index];
    
    if (item.id) {
      // Delete from API if it has an ID
      this.apiService.delete(`srar/rh-extensions/${item.id}/`).subscribe({
        next: (response) => {
          //console.log('Deleted main engine data:', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message || 'Main engine data deleted successfully'
          });
          this.mainEngineData.splice(index, 1);
        },
        error: (error) => {
          console.error('Error deleting main engine data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to delete main engine data'
          });
        }
      });
    } else {
      // Remove from local array if it's a new item
      this.mainEngineData.splice(index, 1);
    }
  }

  // Diesel Alternator Methods
  loadDieselAlternatorData() {
    this.apiService.get('srar/rh-extensions/?equipment_type=2&srar_monthly_header='+this.headerData.id).subscribe((data) => {
      this.dieselAlternatorData = data.results;
    });
  }

  addDieselAlternator() {
    this.isEditDieselAlternator = false;
    
    // Add equipment from selection
    if (this.selectedDieselAlternatorEquipment && this.selectedDieselAlternatorEquipment.length > 0) {
      this.selectedDieselAlternatorEquipment.forEach(selectedEquipmentData => {
        // Add new row with selected equipment data
        this.dieselAlternatorData.push({
          srar_monthly_header:this.headerData.id,
          sfd_details: selectedEquipmentData.id, // Send only the ID
          equipment_sr_no: '', // Leave empty for manual filling
          total_rh_in_month: '',
          on_routine: '',
          rh_ext_at_conduct_of_ext_trial: '',
          authority_letter_for_extension_trial: '',
          rh_extension_granted_upto: '',
          rh_left_for_expiry_of_extension: '',
          // Frontend display fields (not sent to API)
          equipment_name: selectedEquipmentData.equipment_name,
          nomenclature: selectedEquipmentData.nomenclature,
          location_name: selectedEquipmentData.location_name,
          ship_name: selectedEquipmentData.ship_name
        });
      });
      
      // Clear selection after adding
      this.selectedDieselAlternatorEquipment = [];
    }
    
    //console.log('addDieselAlternator - Entered add mode');
  }

  editDieselAlternator() {
    this.isEditDieselAlternator = false;
    //console.log('editDieselAlternator - Entered edit mode');
  }

  saveDieselAlternator() {
    this.isEditDieselAlternator = true;
    
    // Filter out rows that have been filled with data
    const dataToSave = this.dieselAlternatorData.filter(item => 
      item.sfd_details && item.equipment_sr_no
    );

    if (dataToSave.length === 0) {
      //console.log('No diesel alternator data to save');
      return;
    }

    // Process each item individually - new records get POST, existing records get PUT
    dataToSave.forEach(item => {
      // Create payload with only the fields that should be sent to API
      const payload = {
        srar_monthly_header:this.headerData.id,
        sfd_details: item.sfd_details,
        equipment_sr_no: item.equipment_sr_no,
        total_rh_in_month: item.total_rh_in_month,
        on_routine: item.on_routine,
        rh_ext_at_conduct_of_ext_trial: item.rh_ext_at_conduct_of_ext_trial,
        authority_letter_for_extension_trial: item.authority_letter_for_extension_trial,
        rh_extension_granted_upto: item.rh_extension_granted_upto,
        rh_left_for_expiry_of_extension: item.rh_left_for_expiry_of_extension,
        equipment_type: 2 // Diesel Alternator
      };

      if (item.id) {
        // Update existing record with PUT
        //console.log('PUT API call for existing diesel alternator record:', payload);
        this.apiService.put(`srar/rh-extensions/${item.id}/`, payload).subscribe({
          next: (response) => {
            //console.log('Updated diesel alternator data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Diesel alternator data updated successfully'
            });
          },
          error: (error) => {
            console.error('Error updating diesel alternator data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update diesel alternator data'
            });
          }
        });
      } else {
        // Create new record with POST
        //console.log('POST API call for new diesel alternator record:', payload);
        this.apiService.post('srar/rh-extensions/', payload).subscribe({
          next: (response) => {
            //console.log('Saved diesel alternator data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Diesel alternator data saved successfully'
            });
            // Reload data after successful save
            this.loadDieselAlternatorData();
          },
          error: (error) => {
            console.error('Error saving diesel alternator data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to save diesel alternator data'
            });
          }
        });
      }
    });

    //console.log('saveDieselAlternator', { dataToSave });
  }

  deleteDieselAlternator(index: number) {
    const item = this.dieselAlternatorData[index];
    
    if (item.id) {
      // Delete from API if it has an ID
      this.apiService.delete(`srar/rh-extensions/${item.id}/`).subscribe({
        next: (response) => {
          //console.log('Deleted diesel alternator data:', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message || 'Diesel alternator data deleted successfully'
          });
          this.dieselAlternatorData.splice(index, 1);
        },
        error: (error) => {
          console.error('Error deleting diesel alternator data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to delete diesel alternator data'
          });
        }
      });
    } else {
      // Remove from local array if it's a new item
      this.dieselAlternatorData.splice(index, 1);
    }
  }
}
