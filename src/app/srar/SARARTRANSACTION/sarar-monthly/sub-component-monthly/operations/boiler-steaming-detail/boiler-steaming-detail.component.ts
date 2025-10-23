import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from '../../../../../../services/api.service';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-boiler-steaming-detail',
  standalone: false,
  templateUrl: './boiler-steaming-detail.component.html',
  styleUrl: './boiler-steaming-detail.component.css'
})
export class BoilerSteamingDetailComponent implements OnInit {
  srarBoilerData: any[] = [];
  boilerDetailData: any[] = [];
  isEdit: boolean = true;
  @Input() srarEquipmentData: any[] = [];
  headerData:any;
  
  // Properties to track selected values
  selectedEquipment: any[] = [];
  selectedEquipmentDetail: any[] = [];
  
  constructor(private apiService: ApiService, private messageService: MessageService) {}
  ngOnInit() {
    this.headerData=this.apiService.getData();
    this.loadBoilerData();
    this.loadBoilerDetailData();
  }

  loadBoilerData() {
    this.apiService.get('srar/srar-monthly-boilers/?srar_monthly_header='+this.headerData.id).subscribe((data) => {
      this.srarBoilerData = data.results || data;
    });
  }

  loadBoilerDetailData() {
    this.apiService.get('srar/boiler-detail-admiralty/?srar_monthly_header='+this.headerData.id).subscribe((data) => {
      this.boilerDetailData = data.results || data;
    });
  }

  addBoiler() {
    this.isEdit = false;
    
    // Check if any equipment is selected
    if (this.selectedEquipment.length > 0) {
      // Create a row for each selected equipment
      this.selectedEquipment.forEach(selectedEquipmentData => {
        // Add new row with selected equipment data
        this.srarBoilerData.push({
          sfd_details: selectedEquipmentData.id, // Send only the ID
         
          equipment_name: selectedEquipmentData.equipment_name,
          location: selectedEquipmentData.location_name,
          nomenclature: selectedEquipmentData.nomenclature || '',
          serial_no: selectedEquipmentData.serial_no || '' // Manual filling
        });
      });
      
      //console.log('addBoiler', { selectedEquipment: this.selectedEquipment });
      
      // Clear the selection after adding
      this.selectedEquipment = [];
    }
  }

  addBoilerDetail() {
    this.isEdit = false;
    
    // Check if any equipment is selected
    if (this.selectedEquipmentDetail.length > 0) {
      // Create a row for each selected equipment
      this.selectedEquipmentDetail.forEach(selectedEquipmentData => {
        // Add new row with selected equipment data
        this.boilerDetailData.push({
          sfd_details: selectedEquipmentData.id, // Send only the ID
        
          equipment_name: selectedEquipmentData.equipment_name,
          location: selectedEquipmentData.location_name,
          nomenclature: selectedEquipmentData.nomenclature || '',
          serial_number: selectedEquipmentData.serial_number || ''
        });
      });
      
      //console.log('addBoilerDetail', { selectedEquipmentDetail: this.selectedEquipmentDetail });
      
      // Clear the selection after adding
      this.selectedEquipmentDetail = [];
    }
  }

  editBoiler() {
    this.isEdit = false;
    //console.log('editBoiler - Entered edit mode');
  }

  editBoilerDetail() {
    this.isEdit = false;
    //console.log('editBoilerDetail - Entered edit mode');
  }

  saveBoiler() {
    this.isEdit = true;
    
    // Filter out rows that have been filled with data
    const dataToSave = this.srarBoilerData.filter(item => 
      item.sfd_details // Only require sfd_details to be present
    );

    if (dataToSave.length === 0) {
      //console.log('No data to save');
      return;
    }

    // Process each item individually - new records get POST, existing records get PUT
    dataToSave.forEach(item => {
      // Create payload with only the fields that should be sent to API
      // const payload = {
      //   srar_monthly_header:this.headerData.id,
      //   sfd_details: item.sfd_details,
      //   serial_no: item.serial_no,
      //   hours_steamed_during_month: item.hours_steamed_during_month,
      //   hours_steamed_since_commissioning: item.hours_steamed_since_commissioning,
      //   hrs_above_20: item.hrs_above_20,
      //   last_int_clg_date: item.last_int_clg_date,
      //   hrs_steamed_since_last_int_clg: item.hrs_steamed_since_last_int_clg,
      //   hrs_steaming_at_last_int_clg: item.hrs_steaming_at_last_int_clg,
      //   last_ext_clg_date: item.last_ext_clg_date,
      //   hrs_steamed_since_last_ext_clg: item.hrs_steamed_since_last_ext_clg,
      //   hrs_steaming_at_last_ext_clg: item.hrs_steaming_at_last_ext_clg,
      //   last_retubing_date: item.last_retubing_date,
      //   hrs_steamed_since_last_retubing: item.hrs_steamed_since_last_retubing,
      //   hrs_steaming_at_last_retubing: item.hrs_steaming_at_last_retubing,
      //   date_of_durability_test: item.date_of_durability_test,
      //   due_date_for_next_inspection: item.due_date_for_next_inspection,
      //   life_assessed_in_months: item.life_assessed_in_months
      // };
      item.srar_monthly_header=this.headerData.id;

      if (item.id) {
        // Update existing record with PUT
        //console.log('PUT API call for existing boiler record:', item);
        this.apiService.put(`srar/srar-monthly-boilers/${item.id}/`, item).subscribe({
          next: (response) => {
            //console.log('Updated boiler data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Boiler data updated successfully'
            });
          },
          error: (error) => {
            console.error('Error updating boiler data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update boiler data'
            });
          }
        });
      } else {
        // Create new record with POST
        //console.log('POST API call for new boiler record:', item);
        this.apiService.post('srar/srar-monthly-boilers/', item).subscribe({
          next: (response) => {
            //console.log('Saved boiler data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Boiler data saved successfully'
            });
            // Reload data after successful save
            this.loadBoilerData();
          },
          error: (error) => {
            console.error('Error saving boiler data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to save boiler data'
            });
          }
        });
      }
    });

    //console.log('saveBoiler', { dataToSave });
  }

  saveBoilerDetail() {
    this.isEdit = true;
    
    // Filter out rows that have been filled with data
    const dataToSave = this.boilerDetailData.filter(item => 
      item.sfd_details // Only require sfd_details to be present
    );

    if (dataToSave.length === 0) {
      //console.log('No boiler detail data to save');
      return;
    }

    // Process each item individually - new records get POST, existing records get PUT
    dataToSave.forEach(item => {
      // Create payload with only the fields that should be sent to API
      const payload = {
        srar_monthly_header:this.headerData.id,
        sfd_details: item.sfd_details,
        serial_no: item.serial_no,
        salinity_chloride_last_week: item.salinity_chloride_last_week,
        highest_salinity_chloride_month: item.highest_salinity_chloride_month,
        lowest_salinity_chloride_month: item.lowest_salinity_chloride_month,
        alkalinity_y160: item.alkalinity_y160,
        temperature_y160: item.temperature_y160,
        tds_ppm: item.tds_ppm,
        phosphate_ppm: item.phosphate_ppm,
        alkalinity_mg_l: item.alkalinity_mg_l,
        alkalinity_limit: item.alkalinity_limit,
        phosphate_mg_l: item.phosphate_mg_l,
        phosphate_limit: item.phosphate_limit,
        conductivity_ms_cm: item.conductivity_ms_cm,
        state_of_feed_water: item.state_of_feed_water
      };

      if (item.id) {
        // Update existing record with PUT
        //console.log('PUT API call for existing boiler detail record:', payload);
        this.apiService.put(`srar/boiler-detail-admiralty/${item.id}/`, payload).subscribe({
          next: (response) => {
            //console.log('Updated boiler detail data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Boiler detail data updated successfully'
            });
          },
          error: (error) => {
            console.error('Error updating boiler detail data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update boiler detail data'
            });
          }
        });
      } else {
        // Create new record with POST
        //console.log('POST API call for new boiler detail record:', payload);
        this.apiService.post('srar/boiler-detail-admiralty/', payload).subscribe({
          next: (response) => {
            //console.log('Saved boiler detail data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Boiler detail data saved successfully'
            });
            // Reload data after successful save
            this.loadBoilerDetailData();
          },
          error: (error) => {
            console.error('Error saving boiler detail data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to save boiler detail data'
            });
          }
        });
      }
    });

    //console.log('saveBoilerDetail', { dataToSave });
  }

  deleteBoiler(index: number) {
    this.srarBoilerData.splice(index, 1);
  }
}
