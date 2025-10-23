import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from '../../../../../../services/api.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-full-power-trials',
  standalone: false,
  templateUrl: './full-power-trials.component.html',
  styleUrl: './full-power-trials.component.css'
})
export class FullPowerTrialsComponent implements OnInit {
  fullPowerTrialsData: any[] = [];
  fptEquipmentData: any[] = [];
  fptDieselAlternatorsData: any[] = [];
  isEdit: boolean = true;
  isEditEquipment: boolean = true;
  isEditDieselAlternators: boolean = true;
  @Input() srarEquipmentData: any[] = [];
  headerData:any;
  // Properties to track selected values for equipment
  selectedEquipment: any[] = [];
  selectedDieselEquipment: any[] = [];
  
  constructor(private apiService: ApiService, private messageService: MessageService) {}
  
  ngOnInit() {
    this.headerData=this.apiService.getData();
    this.loadFullPowerTrialsData();
    this.loadFptEquipmentData();
    this.loadFptDieselAlternatorsData();
  }

  loadFullPowerTrialsData() {
    this.apiService.get('srar/full-power-trials-main-engines/?srar_monthly_header='+this.headerData.id).subscribe((data) => {
      this.fullPowerTrialsData = data.results;
    });
  }

  loadFptEquipmentData() {
    this.apiService.get('srar/fpt-equipment-wise/?srar_monthly_header='+this.headerData.id).subscribe((data) => {
      this.fptEquipmentData = data.results;
    });
  }

  loadFptDieselAlternatorsData() {
    this.apiService.get('srar/fpt-diesel-alternators/?srar_monthly_header='+this.headerData.id).subscribe((data) => {
      this.fptDieselAlternatorsData = data.results;
    });
  }

  addFullPowerTrials() {
    this.isEdit = false;
    
    // Add new empty row for full power trials data
    this.fullPowerTrialsData.push({
      date: '',
      occasion_reason: '',
      draught_fwd: '',
      draught_aft: '',
      displacement: '',
      max_speed: '',
      conducted_by: ''
    });
    
    //console.log('addFullPowerTrials - Added new row');
  }

  addFptEquipment() {
    this.isEditEquipment = false;
    
    // Check if any equipment is selected
    if (this.selectedEquipment.length > 0) {
      // Create a row for each selected equipment
      this.selectedEquipment.forEach(selectedEquipmentData => {
        // Add new row with selected equipment data
        const { id, ...equipmentDataWithoutId } = selectedEquipmentData;
        this.fptEquipmentData.push({
          srar_monthly_header:this.headerData.id,
          sfd_details: selectedEquipmentData.id, // Send only the ID
          ...equipmentDataWithoutId
        });
        
      });
      
      //console.log('addFptEquipment', { selectedEquipment: this.selectedEquipment });
      
      // Clear the selection after adding
      this.selectedEquipment = [];
    }
  }

  addFptDieselAlternators() {
    this.isEditDieselAlternators = false;
    
    // Check if any equipment is selected
    if (this.selectedDieselEquipment.length > 0) {
      // Create a row for each selected equipment
      this.selectedDieselEquipment.forEach(selectedEquipmentData => {
        const { id, ...equipmentDataWithoutId } = selectedEquipmentData;
        this.fptDieselAlternatorsData.push({
          srar_monthly_header:this.headerData.id,
          sfd_details: selectedEquipmentData.id, // Send only the ID
          ...equipmentDataWithoutId
        });
      });
      
      //console.log('addFptDieselAlternators', { selectedDieselEquipment: this.selectedDieselEquipment });
      
      // Clear the selection after adding
      this.selectedDieselEquipment = [];
    }
  }

  editFullPowerTrials() {
    this.isEdit = false;
    //console.log('editFullPowerTrials - Entered edit mode');
  }

  editFptEquipment() {
    this.isEditEquipment = false;
    //console.log('editFptEquipment - Entered edit mode');
  }

  editFptDieselAlternators() {
    this.isEditDieselAlternators = false;
    //console.log('editFptDieselAlternators - Entered edit mode');
  }

  saveFullPowerTrials() {
    this.isEdit = true;
    
    // Filter out rows that have been filled with data
    const dataToSave = this.fullPowerTrialsData.filter(item => 
      item.date || 
      item.occasion_reason || 
      item.draught_fwd || 
      item.draught_aft || 
      item.displacement || 
      item.max_speed || 
      item.conducted_by
    );

    if (dataToSave.length === 0) {
      //console.log('No full power trials data to save');
      return;
    }

    // Process each item individually - new records get POST, existing records get PUT
    dataToSave.forEach(item => {
        item.srar_monthly_header= this.headerData.id 
        if (item.id) {
        // Update existing record with PUT
        //console.log('PUT API call for existing full power trials record:', item);
        this.apiService.put(`srar/full-power-trials-main-engines/${item.id}/`, item).subscribe({
          next: (response) => {
            //console.log('Updated full power trials data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Full power trials data updated successfully'
            });
          },
          error: (error) => {
            console.error('Error updating full power trials data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update full power trials data'
            });
          }
        });
      } else {
        // Create new record with POST
        //console.log('POST API call for new full power trials record:', item);
        this.apiService.post('srar/full-power-trials-main-engines/', item).subscribe({
          next: (response) => {
            //console.log('Saved full power trials data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Full power trials data saved successfully'
            });
            // Reload data after successful save
            this.loadFullPowerTrialsData();
          },
          error: (error) => {
            console.error('Error saving full power trials data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to save full power trials data'
            });
          }
        });
      }
    });

    //console.log('saveFullPowerTrials', { dataToSave });
  }

  saveFptEquipment() {
    this.isEditEquipment = true;
    
    // Filter out rows that have been filled with data
    const dataToSave = this.fptEquipmentData.filter(item => 
      item.sfd_details // Only require sfd_details to be present
    );

    if (dataToSave.length === 0) {
      //console.log('No FPT equipment data to save');
      return;
    }

    // Process each item individually - new records get POST, existing records get PUT
    dataToSave.forEach(item => {
      // Create payload with only the fields that should be sent to API
      const payload = {
        srar_monthly_header:this.headerData.id,
        sfd_details: item.sfd_details,
        serial_no: item.serial_no,
        location: item.location,
        serial_number: item.serial_number,
        fuel_rack_dbr_max: item.fuel_rack_dbr_max,
        marking_max: item.marking_max,
        undertaken_on: item.undertaken_on,
        pitch: item.pitch,
        max_rpm: item.max_rpm,
        rated_power: item.rated_power,
        max_achieved_power: item.max_achieved_power,
        remarks: item.remarks
      };

      if (item.id) {
        // Update existing record with PUT
        //console.log('PUT API call for existing FPT equipment record:', payload);
        this.apiService.put(`srar/fpt-equipment-wise/${item.id}/`, payload).subscribe({
          next: (response) => {
            //console.log('Updated FPT equipment data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'FPT equipment data updated successfully'
            });
          },
          error: (error) => {
            console.error('Error updating FPT equipment data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update FPT equipment data'
            });
          }
        });
      } else {
        // Create new record with POST
        //console.log('POST API call for new FPT equipment record:', payload);
        this.apiService.post('srar/fpt-equipment-wise/', payload).subscribe({
          next: (response) => {
            //console.log('Saved FPT equipment data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'FPT equipment data saved successfully'
            });
            // Reload data after successful save
            this.loadFptEquipmentData();
          },
          error: (error) => {
            console.error('Error saving FPT equipment data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to save FPT equipment data'
            });
          }
        });
      }
    });

    //console.log('saveFptEquipment', { dataToSave });
  }

  saveFptDieselAlternators() {
    this.isEditDieselAlternators = true;
    
    // Filter out rows that have been filled with data
    const dataToSave = this.fptDieselAlternatorsData.filter(item => 
      item.sfd_details // Only require sfd_details to be present
    );

    if (dataToSave.length === 0) {
      //console.log('No FPT diesel alternators data to save');
      return;
    }

    // Process each item individually - new records get POST, existing records get PUT
    dataToSave.forEach(item => {
      // Create payload with only the fields that should be sent to API
      const payload = {
        srar_monthly_header:this.headerData.id,
          sfd_details: item.sfd_details,
        serial_no: item.serial_no,
        location: item.location,
        serial_number: item.serial_number,
        date: item.date,
        occasion: item.occasion,
        rated_load: item.rated_load,
        max_load_achieved: item.max_load_achieved,
        conducted_by: item.conducted_by,
        last_ehm_trials_undertaken_on: item.last_ehm_trials_undertaken_on,
        remark: item.remark
      };

      if (item.id) {
        // Update existing record with PUT
        //console.log('PUT API call for existing FPT diesel alternators record:', payload);
        this.apiService.put(`srar/fpt-diesel-alternators/${item.id}/`, payload).subscribe({
          next: (response) => {
            //console.log('Updated FPT diesel alternators data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'FPT diesel alternators data updated successfully'
            });
          },
          error: (error) => {
            console.error('Error updating FPT diesel alternators data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update FPT diesel alternators data'
            });
          }
        });
      } else {
        // Create new record with POST
        //console.log('POST API call for new FPT diesel alternators record:', payload);
        this.apiService.post('srar/fpt-diesel-alternators/', payload).subscribe({
          next: (response) => {
            //console.log('Saved FPT diesel alternators data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'FPT diesel alternators data saved successfully'
            });
            // Reload data after successful save
            this.loadFptDieselAlternatorsData();
          },
          error: (error) => {
            console.error('Error saving FPT diesel alternators data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to save FPT diesel alternators data'
            });
          }
        });
      }
    });

    //console.log('saveFptDieselAlternators', { dataToSave });
  }

  deleteFullPowerTrials(index: number) {
    const item = this.fullPowerTrialsData[index];
    
    if (item.id) {
      // Delete from API if it has an ID
      this.apiService.delete(`srar/full-power-trials-main-engines/${item.id}/`).subscribe({
        next: (response) => {
          //console.log('Deleted full power trials data:', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message || 'Full power trials data deleted successfully'
          });
          this.fullPowerTrialsData.splice(index, 1);
        },
        error: (error) => {
          console.error('Error deleting full power trials data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to delete full power trials data'
          });
        }
      });
    } else {
      // Remove from local array if it's a new item
      this.fullPowerTrialsData.splice(index, 1);
    }
  }

  deleteFptEquipment(index: number) {
    const item = this.fptEquipmentData[index];
    
    if (item.id) {
      // Delete from API if it has an ID
      this.apiService.delete(`srar/fpt-equipment-wise/${item.id}/`).subscribe({
        next: (response) => {
          //console.log('Deleted FPT equipment data:', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message || 'FPT equipment data deleted successfully'
          });
          this.fptEquipmentData.splice(index, 1);
        },
        error: (error) => {
          console.error('Error deleting FPT equipment data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to delete FPT equipment data'
          });
        }
      });
    } else {
      // Remove from local array if it's a new item
      this.fptEquipmentData.splice(index, 1);
    }
  }

  deleteFptDieselAlternators(index: number) {
    const item = this.fptDieselAlternatorsData[index];
    
    if (item.id) {
      // Delete from API if it has an ID
      this.apiService.delete(`srar/fpt-diesel-alternators/${item.id}/`).subscribe({
        next: (response) => {
          //console.log('Deleted FPT diesel alternators data:', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message || 'FPT diesel alternators data deleted successfully'
          });
          this.fptDieselAlternatorsData.splice(index, 1);
        },
        error: (error) => {
          console.error('Error deleting FPT diesel alternators data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to delete FPT diesel alternators data'
          });
        }
      });
    } else {
      // Remove from local array if it's a new item
      this.fptDieselAlternatorsData.splice(index, 1);
    }
  }
}
