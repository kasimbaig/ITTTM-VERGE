import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from '../../../../../../services/api.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-equipment-next-roution-due',
  standalone: false,
  templateUrl: './equipment-next-roution-due.component.html',
  styleUrl: './equipment-next-roution-due.component.css'
})
export class EquipmentNextRoutionDueComponent implements OnInit {
  equipmentRoutineData: any[] = [];
  isEdit: boolean = true;
  @Input() srarEquipmentData: any[] = [];
  headerData:any;
  // Properties to track selected values
  selectedEquipment: any[] = [];
  
  constructor(private apiService: ApiService, private messageService: MessageService) {}
  
  ngOnInit() {
    this.headerData=this.apiService.getData();
    this.loadEquipmentRoutineData();
  }

  loadEquipmentRoutineData() {
    this.apiService.get('srar/equipment-routine-due-ons/?srar_monthly_header='+this.headerData.id).subscribe((data) => {
      this.equipmentRoutineData = data.results;
    });
  }

  addEquipmentRoutine() {
    this.isEdit = false;
    
    // Check if any equipment is selected
    if (this.selectedEquipment.length > 0) {
      // Create a row for each selected equipment
      this.selectedEquipment.forEach(selectedEquipmentData => {
        // Add new row with selected equipment data
        this.equipmentRoutineData.push({
          srar_monthly_header:this.headerData.id,
          sfd_details: selectedEquipmentData.id, // Send only the ID
          serial_no: '', // Leave empty for manual filling
          hrs_from_installations: '',
          frequency: '', // Will be selected from dropdown
          running_hr_routine_due: '',
          date_of_nxt_routine: '',
          // Frontend display fields (not sent to API)
          equipment_name: selectedEquipmentData.equipment_name,
          nomenclature: selectedEquipmentData.nomenclature || '',
          equipment_code: selectedEquipmentData.equipment_code || '',
          location: selectedEquipmentData.location_name,
          serial_number: '' // Manual filling
        });
      });
      
      //console.log('addEquipmentRoutine', { selectedEquipment: this.selectedEquipment });
      
      // Clear the selection after adding
      this.selectedEquipment = [];
      
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Equipment routine added successfully'
      });
    }
  }

  editEquipmentRoutine() {
    this.isEdit = false;
    //console.log('editEquipmentRoutine - Entered edit mode');
    
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Edit mode enabled'
    });
  }

  saveEquipmentRoutine() {
    this.isEdit = true;
    
    // Filter out rows that have been filled with data
    const dataToSave = this.equipmentRoutineData.filter(item => 
      item.sfd_details // Only require sfd_details to be present
    );

    if (dataToSave.length === 0) {
      //console.log('No equipment routine data to save');
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'No equipment routine data to save'
      });
      return;
    }

    // Process each item individually - new records get POST, existing records get PUT
    dataToSave.forEach(item => {
      // Create payload with only the fields that should be sent to API
      const payload = {
        srar_monthly_header:this.headerData.id,
          sfd_details: item.sfd_details,
        serial_no: item.serial_no,
        hrs_from_installations: item.hrs_from_installations,
        frequency: item.frequency,
        running_hr_routine_due: item.running_hr_routine_due,
        date_of_nxt_routine: item.date_of_nxt_routine
      };

      if (item.id) {
        // Update existing record with PUT
        //console.log('PUT API call for existing equipment routine record:', payload);
        this.apiService.put(`srar/equipment-routine-due-ons/${item.id}/`, payload).subscribe({
          next: (response) => {
            //console.log('Updated equipment routine data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Equipment routine data updated successfully'
            });
          },
          error: (error) => {
            console.error('Error updating equipment routine data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update equipment routine data'
            });
          }
        });
      } else {
        // Create new record with POST
        //console.log('POST API call for new equipment routine record:', payload);
        this.apiService.post('srar/equipment-routine-due-ons/', payload).subscribe({
          next: (response) => {
            //console.log('Saved equipment routine data:', response);
            // Reload data after successful save
            this.loadEquipmentRoutineData();
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Equipment routine data saved successfully'
            });
          },
          error: (error) => {
            console.error('Error saving equipment routine data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to save equipment routine data'
            });
          }
        });
      }
    });

    //console.log('saveEquipmentRoutine', { dataToSave });
  }
}
