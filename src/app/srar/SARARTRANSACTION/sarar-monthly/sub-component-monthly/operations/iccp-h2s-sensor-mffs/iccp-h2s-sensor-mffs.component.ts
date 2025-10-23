import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from '../../../../../../services/api.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-iccp-h2s-sensor-mffs',
  standalone: false,
  templateUrl: './iccp-h2s-sensor-mffs.component.html',
  styleUrl: './iccp-h2s-sensor-mffs.component.css'
})
export class IccpH2sSensorMffsComponent implements OnInit {
  iccpData: any[] = [];
  h2sData: any[] = [];
  stpData: any[] = [];
  mffsData: any[] = [];
  isEdit: boolean = true;
  @Input() srarEquipmentData: any[] = [];
  @Input() srarLocationsData: any[] = [];
  
  // Properties to track selected values for each table
  selectedIccpEquipment: any[] = [];
  selectedH2sEquipment: any[] = [];
  selectedStpEquipment: any[] = [];
  selectedMffsEquipment: any[] = [];
  headerData:any;
  constructor(private apiService: ApiService, private messageService: MessageService) {}
  
  ngOnInit() {
    this.headerData=this.apiService.getData();
    this.loadIccpData();
    this.loadH2sData();
    this.loadStpData();
    this.loadMffsData();
  }

  loadIccpData() {
    this.apiService.get('srar/iccps/?srar_monthly_header='+this.headerData.id).subscribe((data) => {
      this.iccpData = data.results;
    });
  }

  loadH2sData() {
    this.apiService.get('srar/h2s-sensors/?srar_monthly_header='+this.headerData.id).subscribe((data) => {
      this.h2sData = data.results;
    });
  }

  loadStpData() {
    this.apiService.get('srar/stps/?srar_monthly_header='+this.headerData.id).subscribe((data) => {
      this.stpData = data.results;
    });
  }

  loadMffsData() {
    this.apiService.get('srar/magazine-ff-system-flooding-systems/?srar_monthly_header='+this.headerData.id).subscribe((data) => {
      this.mffsData = data.results;
    });
  }

  addIccp() {
    this.isEdit = false;
    
    // Check if any equipment is selected
    if (this.selectedIccpEquipment.length > 0) {
      // Create a row for each selected equipment
      this.selectedIccpEquipment.forEach((selectedEquipmentData: any) => {
        // Add new row with selected equipment data
        this.iccpData.push({
          sfd_details: selectedEquipmentData.id, // Send only the ID
          equipment_code: '', // Leave empty for manual filling
          ops_or_non_ops: '',
          non_ops_since: '',
          // Frontend display fields (not sent to API)
          equipment: selectedEquipmentData.equipment,
          location: selectedEquipmentData.location_name || '',
          nomenclature: selectedEquipmentData.nomenclature || ''
        });
      });
      
      //console.log('addIccp', { selectedEquipment: this.selectedIccpEquipment });
      
      // Clear the selection after adding
      this.selectedIccpEquipment = [];
    }
  }

  addH2s() {
    this.isEdit = false;
    
    // Check if any equipment is selected
    if (this.selectedH2sEquipment.length > 0) {
      // Create a row for each selected equipment
      this.selectedH2sEquipment.forEach((selectedEquipmentData: any) => {
        // Add new row with selected equipment data
        this.h2sData.push({
          sfd_details: selectedEquipmentData.id, // Send only the ID
          equipment_code: '', // Leave empty for manual filling
          ops_or_non_ops: '',
          non_ops_since: '',
          last_calibration_date: '',
          next_calibration_date: '',
          // Frontend display fields (not sent to API)
          equipment: selectedEquipmentData.equipment,
          location: selectedEquipmentData.location_name || '',
          nomenclature: selectedEquipmentData.nomenclature || ''
        });
      });
      
      //console.log('addH2s', { selectedEquipment: this.selectedH2sEquipment });
      
      // Clear the selection after adding
      this.selectedH2sEquipment = [];
    }
  }

  addStp() {
    this.isEdit = false;
    
    // Check if any equipment is selected
    if (this.selectedStpEquipment.length > 0) {
      // Create a row for each selected equipment
      this.selectedStpEquipment.forEach((selectedEquipmentData: any) => {
        // Add new row with selected equipment data
        this.stpData.push({
          sfd_details: selectedEquipmentData.id, // Send only the ID
          equipment_code: '', // Leave empty for manual filling
          ops_or_non_ops: '',
          non_ops_since: '',
          effluent_test_date: '',
          // Frontend display fields (not sent to API)
          equipment: selectedEquipmentData.equipment,
          location: selectedEquipmentData.location_name || '',
          nomenclature: selectedEquipmentData.nomenclature || ''
        });
      });
      
      //console.log('addStp', { selectedEquipment: this.selectedStpEquipment });
      
      // Clear the selection after adding
      this.selectedStpEquipment = [];
    }
  }

  addMffs() {
    this.isEdit = false;
    
    // Check if any equipment is selected
    if (this.selectedMffsEquipment.length > 0) {
      // Create a row for each selected equipment
      this.selectedMffsEquipment.forEach((selectedEquipmentData: any) => {
        // Add new row with selected equipment data
        this.mffsData.push({
          sfd_details: selectedEquipmentData.id, // Send only the ID
          equipment_code: '', // Leave empty for manual filling
          ops_or_non_ops: '',
          non_ops_since: '',
          last_trials_taken: '',
          next_trials_due: '',
          // Frontend display fields (not sent to API)
          equipment: selectedEquipmentData.equipment,
          location: selectedEquipmentData.location_name || '',
          nomenclature: selectedEquipmentData.nomenclature || ''
        });
      });
      
      //console.log('addMffs', { selectedEquipment: this.selectedMffsEquipment });
      
      // Clear the selection after adding
      this.selectedMffsEquipment = [];
    }
  }

  editIccp() {
    this.isEdit = false;
    //console.log('editIccp - Entered edit mode');
  }

  editH2s() {
    this.isEdit = false;
    //console.log('editH2s - Entered edit mode');
  }

  editStp() {
    this.isEdit = false;
    //console.log('editStp - Entered edit mode');
  }

  editMffs() {
    this.isEdit = false;
    //console.log('editMffs - Entered edit mode');
  }

  saveIccp() {
    this.isEdit = true;
    
    // Filter out rows that have been filled with data
    const dataToSave = this.iccpData.filter(item => 
      item.sfd_details // Only require sfd_details to be present
    );

    if (dataToSave.length === 0) {
      //console.log('No ICCP data to save');
      return;
    }

    // Process each item individually - new records get POST, existing records get PUT
    dataToSave.forEach(item => {
      // Create payload with only the fields that should be sent to API
      const payload = {
        srar_monthly_header:this.headerData.id,
        sfd_details: item.sfd_details,
        equipment_code: item.equipment_code,
        ops_or_non_ops: item.ops_or_non_ops,
        non_ops_since: item.non_ops_since
      };

      if (item.id) {
        // Update existing record with PUT
        //console.log('PUT API call for existing ICCP record:', payload);
        this.apiService.put(`srar/iccps/${item.id}/`, payload).subscribe({
          next: (response) => {
            //console.log('Updated ICCP data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'ICCP data updated successfully'
            });
          },
          error: (error) => {
            console.error('Error updating ICCP data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update ICCP data'
            });
          }
        });
      } else {
        // Create new record with POST
        //console.log('POST API call for new ICCP record:', payload);
        this.apiService.post('srar/iccps/', payload).subscribe({
          next: (response) => {
            //console.log('Saved ICCP data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'ICCP data saved successfully'
            });
            // Reload data after successful save
            this.loadIccpData();
          },
          error: (error) => {
            console.error('Error saving ICCP data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to save ICCP data'
            });
          }
        });
      }
    });

    //console.log('saveIccp', { dataToSave });
  }

  saveH2s() {
    this.isEdit = true;
    
    // Filter out rows that have been filled with data
    const dataToSave = this.h2sData.filter(item => 
      item.sfd_details // Only require sfd_details to be present
    );

    if (dataToSave.length === 0) {
      //console.log('No H2S data to save');
      return;
    }

    // Process each item individually - new records get POST, existing records get PUT
    dataToSave.forEach(item => {
      // Create payload with only the fields that should be sent to API
      const payload = {
        srar_monthly_header:this.headerData.id,
        sfd_details: item.sfd_details,
        equipment_code: item.equipment_code,
        ops_or_non_ops: item.ops_or_non_ops,
        non_ops_since: item.non_ops_since,
        last_calibration_date: item.last_calibration_date,
        next_calibration_date: item.next_calibration_date
      };

      if (item.id) {
        // Update existing record with PUT
        //console.log('PUT API call for existing H2S record:', payload);
        this.apiService.put(`srar/h2s-sensors/${item.id}/`, payload).subscribe({
          next: (response) => {
            //console.log('Updated H2S data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'H2S data updated successfully'
            });
          },
          error: (error) => {
            console.error('Error updating H2S data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update H2S data'
            });
          }
        });
      } else {
        // Create new record with POST
        //console.log('POST API call for new H2S record:', payload);
        this.apiService.post('srar/h2s-sensors/', payload).subscribe({
          next: (response) => {
            //console.log('Saved H2S data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'H2S data saved successfully'
            });
            // Reload data after successful save
            this.loadH2sData();
          },
          error: (error) => {
            console.error('Error saving H2S data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to save H2S data'
            });
          }
        });
      }
    });

    //console.log('saveH2s', { dataToSave });
  }

  saveStp() {
    this.isEdit = true;
    
    // Filter out rows that have been filled with data
    const dataToSave = this.stpData.filter(item => 
      item.sfd_details // Only require sfd_details to be present
    );

    if (dataToSave.length === 0) {
      //console.log('No STP data to save');
      return;
    }

    // Process each item individually - new records get POST, existing records get PUT
    dataToSave.forEach(item => {
      // Create payload with only the fields that should be sent to API
      const payload = {
        srar_monthly_header:this.headerData.id,
        sfd_details: item.sfd_details,
        equipment_code: item.equipment_code,
        ops_or_non_ops: item.ops_or_non_ops,
        non_ops_since: item.non_ops_since,
        effluent_test_date: item.effluent_test_date,
        remarks: item.remarks
      };

      if (item.id) {
        // Update existing record with PUT
        //console.log('PUT API call for existing STP record:', payload);
        this.apiService.put(`srar/stps/${item.id}/`, payload).subscribe({
          next: (response) => {
            //console.log('Updated STP data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'STP data updated successfully'
            });
          },
          error: (error) => {
            console.error('Error updating STP data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update STP data'
            });
          }
        });
      } else {
        // Create new record with POST
        //console.log('POST API call for new STP record:', payload);
        this.apiService.post('srar/stps/', payload).subscribe({
          next: (response) => {
            //console.log('Saved STP data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'STP data saved successfully'
            });
            // Reload data after successful save
            this.loadStpData();
          },
          error: (error) => {
            console.error('Error saving STP data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to save STP data'
            });
          }
        });
      }
    });

    //console.log('saveStp', { dataToSave });
  }

  saveMffs() {
    this.isEdit = true;
    
    // Filter out rows that have been filled with data
    const dataToSave = this.mffsData.filter(item => 
      item.sfd_details // Only require sfd_details to be present
    );

    if (dataToSave.length === 0) {
      //console.log('No MFFS data to save');
      return;
    }

    // Process each item individually - new records get POST, existing records get PUT
    dataToSave.forEach(item => {
      // Create payload with only the fields that should be sent to API
      const payload = {
        srar_monthly_header:this.headerData.id,
        sfd_details: item.sfd_details,
        equipment_code: item.equipment_code,
        ops_or_non_ops: item.ops_or_non_ops,
        non_ops_since: item.non_ops_since,
        last_trials_taken: item.last_trials_taken,
        next_trials_due: item.next_trials_due
      };

      if (item.id) {
        // Update existing record with PUT
        //console.log('PUT API call for existing MFFS record:', payload);
        this.apiService.put(`srar/magazine-ff-system-flooding-systems/${item.id}/`, payload).subscribe({
          next: (response) => {
            //console.log('Updated MFFS data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'MFFS data updated successfully'
            });
          },
          error: (error) => {
            console.error('Error updating MFFS data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update MFFS data'
            });
          }
        });
      } else {
        // Create new record with POST
        //console.log('POST API call for new MFFS record:', payload);
        this.apiService.post('srar/magazine-ff-system-flooding-systems/', payload).subscribe({
          next: (response) => {
            //console.log('Saved MFFS data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'MFFS data saved successfully'
            });
            // Reload data after successful save
            this.loadMffsData();
          },
          error: (error) => {
            console.error('Error saving MFFS data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to save MFFS data'
            });
          }
        });
      }
    });

    //console.log('saveMffs', { dataToSave });
  }
}
