import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../../../../services/api.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-final-page',
  standalone: false,
  templateUrl: './final-page.component.html',
  styleUrl: './final-page.component.css'
})
export class FinalPageComponent implements OnInit {
  shipRunningData: any[] = [];
  equipmentExploitationData: any[] = [];
  isEdit: boolean = true;
  @Input() srarEquipmentData: any[] = [];
  headerData:any;   
  // Properties to track selected values for equipment
  selectedEquipment: any[] = [];
  
  // Form fields for the top section
  isShipInRefit: boolean = false;
  eoWriterContact: string = '';
  eoRank: string = '';
  eoName: string = '';
  eoPersonalNo: string = '';
  eoContactNo: string = '';
  
  constructor(private router: Router, private apiService: ApiService, private messageService: MessageService) {}
  
  ngOnInit() {
    this.headerData=this.apiService.getData();
    this.loadShipRunningData();
    this.loadEquipmentExploitationData();
  }

  loadShipRunningData() {
    this.apiService.get('srar/ship-running-details/?srar_monthly_header='+this.headerData.id).subscribe((data) => {
      this.shipRunningData = data;
      // Load form data if available
      if (this.shipRunningData.length > 0) {
        const firstRecord = this.shipRunningData[0];
        this.isShipInRefit = firstRecord.is_ship_in_refit || false;
        this.eoWriterContact = firstRecord.eo_writer_contact || '';
        this.eoRank = firstRecord.eo_rank || '';
        this.eoName = firstRecord.eo_name || '';
        this.eoPersonalNo = firstRecord.eo_personal_no || '';
        this.eoContactNo = firstRecord.eo_contact_no || '';
      }
    });
  }

  loadEquipmentExploitationData() {
    this.apiService.get('srar/equipment-exploitation-details/?srar_monthly_header='+this.headerData.id).subscribe((data) => {
      this.equipmentExploitationData = data;
    });
  }

  addShipRunning() {
    this.isEdit = false;
    
    // Add new empty row for ship running data
    this.shipRunningData.push({
      srar_monthly_header:this.headerData.id,
      hours_underway_month: '',
      distance_run_month: '',
      hours_underway_commissioning: '',
      distance_run_commissioning: '',
      max_speed_month: '',
      max_speed_duration: ''
    });
    
    //console.log('addShipRunning - Added new row');
  }

  editShipRunning() {
    this.isEdit = false;
    //console.log('editShipRunning - Entered edit mode');
  }

  saveShipRunning() {
    this.isEdit = true;
    
    // Filter out rows that have been filled with data
    const dataToSave = this.shipRunningData.filter(item => 
      item.hours_underway_month || 
      item.distance_run_month || 
      item.hours_underway_commissioning || 
      item.distance_run_commissioning || 
      item.max_speed_month || 
      item.max_speed_duration
    );

    if (dataToSave.length === 0) {
      //console.log('No ship running data to save');
      return;
    }

    // Add form data to the first record
    if (dataToSave.length > 0) {
      dataToSave[0].is_ship_in_refit = this.isShipInRefit;
      dataToSave[0].eo_writer_contact = this.eoWriterContact;
      dataToSave[0].eo_rank = this.eoRank;
      dataToSave[0].eo_name = this.eoName;
      dataToSave[0].eo_personal_no = this.eoPersonalNo;
      dataToSave[0].eo_contact_no = this.eoContactNo;
    }

    // Process each item individually - new records get POST, existing records get PUT
    dataToSave.forEach(item => {
      if (item.id) {
        // Update existing record with PUT
        //console.log('PUT API call for existing ship running record:', item);
        this.apiService.put(`srar/ship-running-details/${item.id}/`, item).subscribe({
          next: (response) => {
            //console.log('Updated ship running data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Ship running data updated successfully'
            });
          },
          error: (error) => {
            console.error('Error updating ship running data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update ship running data'
            });
          }
        });
      } else {
        // Create new record with POST
        //console.log('POST API call for new ship running record:', item);
        this.apiService.post('srar/ship-running-details/', item).subscribe({
          next: (response) => {
            //console.log('Saved ship running data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Ship running data saved successfully'
            });
            // Reload data after successful save
            this.loadShipRunningData();
          },
          error: (error) => {
            console.error('Error saving ship running data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to save ship running data'
            });
          }
        });
      }
    });

    //console.log('saveShipRunning', { dataToSave });
  }

  addEquipmentExploitation() {
    this.isEdit = false;
    
    // Check if any equipment is selected
    if (this.selectedEquipment.length > 0) {
      // Create a row for each selected equipment
      this.selectedEquipment.forEach(selectedEquipmentData => {
        // Add new row with selected equipment data
        this.equipmentExploitationData.push({
          sfd_details: selectedEquipmentData.id, // Send only the ID
          equipment_sr_no: '', // Leave empty for manual filling
          hrs_for_month: '',
          hrs_since_installation: '',
          // Frontend display fields (not sent to API)
          equipment_name: selectedEquipmentData.equipment_name,
          equipment_code: selectedEquipmentData.equipment_code || '',
          location: selectedEquipmentData.location_name,
          nomenclature: selectedEquipmentData.nomenclature || '',
          serial_number: '' // Manual filling
        });
      });
      
      //console.log('addEquipmentExploitation', { selectedEquipment: this.selectedEquipment });
      
      // Clear the selection after adding
      this.selectedEquipment = [];
    }
  }

  editEquipmentExploitation() {
    this.isEdit = false;
    //console.log('editEquipmentExploitation - Entered edit mode');
  }

  saveEquipmentExploitation() {
    this.isEdit = true;
    
    // Filter out rows that have been filled with data
    const dataToSave = this.equipmentExploitationData.filter(item => 
      item.sfd_details // Only require sfd_details to be present
    );

    if (dataToSave.length === 0) {
      //console.log('No equipment exploitation data to save');
      return;
    }

    // Process each item individually - new records get POST, existing records get PUT
    dataToSave.forEach(item => {
      // Create payload with only the fields that should be sent to API
      const payload = {
        srar_monthly_header:this.headerData.id,
        sfd_details: item.sfd_details,
        equipment_sr_no: item.equipment_sr_no,
        hrs_for_month: item.hrs_for_month,
        hrs_since_installation: item.hrs_since_installation
      };

      if (item.id) {
        // Update existing record with PUT
        //console.log('PUT API call for existing equipment exploitation record:', payload);
        this.apiService.put(`srar/equipment-exploitation-details/${item.id}/`, payload).subscribe({
          next: (response) => {
            //console.log('Updated equipment exploitation data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Equipment exploitation data updated successfully'
            });
          },
          error: (error) => {
            console.error('Error updating equipment exploitation data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update equipment exploitation data'
            });
          }
        });
      } else {
        // Create new record with POST
        //console.log('POST API call for new equipment exploitation record:', payload);
        this.apiService.post('srar/equipment-exploitation-details/', payload).subscribe({
          next: (response) => {
            //console.log('Saved equipment exploitation data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Equipment exploitation data saved successfully'
            });
            // Reload data after successful save
            this.loadEquipmentExploitationData();
          },
          error: (error) => {
            console.error('Error saving equipment exploitation data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to save equipment exploitation data'
            });
          }
        });
      }
    });

    //console.log('saveEquipmentExploitation', { dataToSave });
  }

  goBack() {
    this.router.navigate(['/srar/srar-monthly']);
  }

  submitToRBI() {
    //console.log('Submitting to RBI...');
  }
}
