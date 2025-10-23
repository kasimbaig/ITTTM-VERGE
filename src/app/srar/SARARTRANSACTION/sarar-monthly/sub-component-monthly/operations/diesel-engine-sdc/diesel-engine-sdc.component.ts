import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from '../../../../../../services/api.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-diesel-engine-sdc',
  standalone: false,
  templateUrl: './diesel-engine-sdc.component.html',
  styleUrl: './diesel-engine-sdc.component.css'
})
export class DieselEngineSdcComponent implements OnInit {
  injectorFipData: any[] = [];
  isEdit: boolean = true;
  @Input() srarEquipmentData: any[] = [];
  headerData:any;
  // Properties to track selected values for injector/fip
  selectedEquipment: any[] = [];
  
  constructor(private apiService: ApiService, private messageService: MessageService) {}
  
  ngOnInit() {
    this.headerData=this.apiService.getData();
    this.loadInjectorFipData();
  }

  loadInjectorFipData() {
    this.apiService.get('srar/injector-fip-calibration-replacements/?srar_monthly_header='+this.headerData.id   ).subscribe((data) => {
      this.injectorFipData = data.results;
    });
  }

  addInjectorFip() {
    this.isEdit = false;
    
    // Check if any equipment is selected
    if (this.selectedEquipment.length > 0) {
      // Create a row for each selected equipment
      this.selectedEquipment.forEach(selectedEquipmentData => {
        const { id, ...equipmentDataWithoutId } = selectedEquipmentData;
        this.injectorFipData.push({
            srar_monthly_header:this.headerData.id,
            sfd_details: selectedEquipmentData.id, // Send only the ID
            ...equipmentDataWithoutId
          });
      });
      
      //console.log('addInjectorFip', { selectedEquipment: this.selectedEquipment });
      
      // Clear the selection after adding
      this.selectedEquipment = [];
    }
  }

  editInjectorFip() {
    this.isEdit = false;
    //console.log('editInjectorFip - Entered edit mode');
  }

  saveInjectorFip() {
    this.isEdit = true;
    
    // Filter out rows that have been filled with data
    const dataToSave = this.injectorFipData.filter(item => 
      item.sfd_details // Only require sfd_details to be present
    );

    if (dataToSave.length === 0) {
      //console.log('No injector/fip data to save');
      return;
    }

    // Process each item individually - new records get POST, existing records get PUT
    dataToSave.forEach(item => {
      // Create payload with only the fields that should be sent to API
      const payload = {
        srar_monthly_header:this.headerData.id,
        sfd_details: item.sfd_details,
        serial_no: item.serial_no,
        serial_number: item.serial_number,
        running_hours_months: item.running_hours_months,
        running_hours_since_installation: item.running_hours_since_installation,
        hrs_run_below_33_percent: item.hrs_run_below_33_percent,
        hrs_run_33_to_50_percent: item.hrs_run_33_to_50_percent,
        hrs_run_50_to_70_percent: item.hrs_run_50_to_70_percent,
        hrs_run_70_to_100_percent: item.hrs_run_70_to_100_percent,
        lub_oil_consumption_months: item.lub_oil_consumption_months,
        date_of_inj_fip_calibration: item.date_of_inj_fip_calibration,
        occasion: item.occasion,
        running_hours_at_replaced: item.running_hours_at_replaced,
        fuel_consumption_months: item.fuel_consumption_months,
        remarks: item.remarks
      };

      if (item.id) {
        // Update existing record with PUT
        //console.log('PUT API call for existing injector/fip record:', payload);
        this.apiService.put(`srar/injector-fip-calibration-replacements/${item.id}/`, payload).subscribe({
          next: (response) => {
            //console.log('Updated injector/fip data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Injector/FIP data updated successfully'
            });
          },
          error: (error) => {
            console.error('Error updating injector/fip data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update injector/FIP data'
            });
          }
        });
      } else {
        // Create new record with POST
        //console.log('POST API call for new injector/fip record:', payload);
        this.apiService.post('srar/injector-fip-calibration-replacements/', payload).subscribe({
          next: (response) => {
            //console.log('Saved injector/fip data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Injector/FIP data saved successfully'
            });
            // Reload data after successful save
            this.loadInjectorFipData();
          },
          error: (error) => {
            console.error('Error saving injector/fip data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to save injector/FIP data'
            });
          }
        });
      }
    });

    //console.log('saveInjectorFip', { dataToSave });
  }

  deleteInjectorFip(index: number) {
    const item = this.injectorFipData[index];
    
    if (item.id) {
      // Delete from API if it has an ID
      this.apiService.delete(`srar/injector-fip-calibration-replacements/${item.id}/`).subscribe({
        next: (response) => {
          //console.log('Deleted injector/fip data:', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message || 'Injector/FIP data deleted successfully'
          });
          this.injectorFipData.splice(index, 1);
        },
        error: (error) => {
          console.error('Error deleting injector/fip data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to delete injector/FIP data'
          });
        }
      });
    } else {
      // Remove from local array if it's a new item
      this.injectorFipData.splice(index, 1);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Injector/FIP data removed successfully'
      });
    }
  }
}
