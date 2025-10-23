import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from '../../../../../../services/api.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-dguf',
  standalone: false,
  templateUrl: './dguf.component.html',
  styleUrl: './dguf.component.css'
})
export class DgufComponent implements OnInit {
  dgufData: any[] = [];
  seaHarbourData: any[] = [];
  dgufLimitsData: any[] = [];
  isEdit: boolean = true;
  @Input() srarEquipmentData: any[] = [];
  
  // Properties to track selected values for dguf
  selectedEquipment: any[] = [];
  headerData:any;
  constructor(private apiService: ApiService, private messageService: MessageService) {}
  
  ngOnInit() {
    this.headerData=this.apiService.getData();
    this.loadDgufData();
    this.loadSeaHarbourData();
    this.loadDgufLimitsData();
  }

  loadDgufData() {
    this.apiService.get('srar/dgufs/?srar_monthly_header='+this.headerData.id).subscribe((data) => {
      this.dgufData = data.results;
    });
  }

  loadSeaHarbourData() {
    this.apiService.get('srar/dguf-sea-harbour-running-hour-data-inputs/?srar_monthly_header='+this.headerData.id).subscribe((data) => {
      this.seaHarbourData = data.results;
    });
  }

  loadDgufLimitsData() {
    this.apiService.get('srar/dguf-limits/?srar_monthly_header='+this.headerData.id).subscribe((data) => {
      this.dgufLimitsData = data.results;
    });
  }

  addDguf() {
    this.isEdit = false;
    
    // Check if any equipment is selected
    if (this.selectedEquipment.length > 0) {
      // Create a row for each selected equipment
      this.selectedEquipment.forEach(selectedEquipmentData => {
        // Add new row with selected equipment data
        const { id, ...equipmentDataWithoutId } = selectedEquipmentData;
        this.dgufData.push({
          srar_monthly_header:this.headerData.id,
          sfd_details: selectedEquipmentData.id, // Send only the ID
          ...equipmentDataWithoutId
        });
      });
      //console.log('addDguf', { selectedEquipment: this.selectedEquipment });
      
      // Clear the selection after adding
      this.selectedEquipment = [];
    }
  }

  addSeaHarbour() {
    this.isEdit = false;
    
    // Add new empty row for sea harbour data
    this.seaHarbourData.push({
      total_rh_at_sea: '',
      hours_underway: '',
      anchorage: '',
      drifting: '',
      no_of_hours_in_harbour: '',
      hours_shore_supply_avl_when_alongs: '',
      no_of_cold_moves_in_harbour: '',
      cmts_wrt_to_non_avl_shore_supply: ''
    });
    
    //console.log('addSeaHarbour - Added new row');
  }

  addDgufLimits() {
    this.isEdit = false;
    
    // Add new empty row for dguf limits data
    this.dgufLimitsData.push({
      limiting_value_sea: '',
      actual_dguf_sea: '',
      exceed_reason_sea: '',
      limiting_value_harbour: '',
      actual_dguf_harbour: '',
      exceed_reason_harbour: ''
    });
    
    //console.log('addDgufLimits - Added new row');
  }

  editDguf() {
    this.isEdit = false;
    //console.log('editDguf - Entered edit mode');
  }

  editSeaHarbour() {
    this.isEdit = false;
    //console.log('editSeaHarbour - Entered edit mode');
  }

  editDgufLimits() {
    this.isEdit = false;
    //console.log('editDgufLimits - Entered edit mode');
  }

  saveDguf() {
    this.isEdit = true;
    
    // Filter out rows that have been filled with data
    const dataToSave = this.dgufData.filter(item => 
      item.sfd_details // Only require sfd_details to be present
    );

    if (dataToSave.length === 0) {
      //console.log('No dguf data to save');
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
        da_number: item.da_number,
        rh_at_sea_and_anchorage: item.rh_at_sea_and_anchorage,
        rh_at_port: item.rh_at_port,
        total_rh_in_month: item.total_rh_in_month
      };

      if (item.id) {
        // Update existing record with PUT
        //console.log('PUT API call for existing dguf record:', payload);
        this.apiService.put(`srar/dgufs/${item.id}/`, payload).subscribe({
          next: (response) => {
            //console.log('Updated dguf data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'DGUF data updated successfully'
            });
          },
          error: (error) => {
            console.error('Error updating dguf data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update DGUF data'
            });
          }
        });
      } else {
        // Create new record with POST
        //console.log('POST API call for new dguf record:', payload);
        this.apiService.post('srar/dgufs/', payload).subscribe({
          next: (response) => {
            //console.log('Saved dguf data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'DGUF data saved successfully'
            });
            // Reload data after successful save
            this.loadDgufData();
          },
          error: (error) => {
            console.error('Error saving dguf data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to save DGUF data'
            });
          }
        });
      }
    });

    //console.log('saveDguf', { dataToSave });
  }

  saveSeaHarbour() {
    this.isEdit = true;
    
    // Filter out rows that have been filled with data
    const dataToSave = this.seaHarbourData.filter(item => 
      item.srar_monthly_header= this.headerData.id &&
      item.total_rh_at_sea || 
      item.hours_underway || 
      item.anchorage || 
      item.drifting || 
      item.no_of_hours_in_harbour || 
      item.hours_shore_supply_avl_when_alongs || 
      item.no_of_cold_moves_in_harbour || 
      item.cmts_wrt_to_non_avl_shore_supply
    );

    if (dataToSave.length === 0) {
      //console.log('No sea harbour data to save');
      return;
    }

    // Process each item individually - new records get POST, existing records get PUT
    dataToSave.forEach(item => {
        item.srar_monthly_header= this.headerData.id
      if (item.id) {
        // Update existing record with PUT
        //console.log('PUT API call for existing sea harbour record:', item);
        this.apiService.put(`srar/dguf-sea-harbour-running-hour-data-inputs/${item.id}/`, item).subscribe({
          next: (response) => {
            //console.log('Updated sea harbour data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Sea harbour data updated successfully'
            });
          },
          error: (error) => {
            console.error('Error updating sea harbour data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update sea harbour data'
            });
          }
        });
      } else {
        // Create new record with POST
        //console.log('POST API call for new sea harbour record:', item);
        this.apiService.post('srar/dguf-sea-harbour-running-hour-data-inputs/', item).subscribe({
          next: (response) => {
            //console.log('Saved sea harbour data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Sea harbour data saved successfully'
            });
            // Reload data after successful save
            this.loadSeaHarbourData();
          },
          error: (error) => {
            console.error('Error saving sea harbour data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to save sea harbour data'
            });
          }
        });
      }
    });

    //console.log('saveSeaHarbour', { dataToSave });
  }

  saveDgufLimits() {
    this.isEdit = true;
    
    // Filter out rows that have been filled with data
    const dataToSave = this.dgufLimitsData.filter(item => 
      item.srar_monthly_header= this.headerData.id ||
      item.limiting_value_sea || 
      item.actual_dguf_sea || 
      item.exceed_reason_sea || 
      item.limiting_value_harbour || 
      item.actual_dguf_harbour || 
      item.exceed_reason_harbour
    );

    if (dataToSave.length === 0) {
      //console.log('No dguf limits data to save');
      return;
    }

    // Process each item individually - new records get POST, existing records get PUT
    dataToSave.forEach(item => {
      item.srar_monthly_header= this.headerData.id 
      if (item.id) {
        // Update existing record with PUT
        //console.log('PUT API call for existing dguf limits record:', item);
        this.apiService.put(`srar/dguf-limits/${item.id}/`, item).subscribe({
          next: (response) => {
            //console.log('Updated dguf limits data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'DGUF limits data updated successfully'
            });
          },
          error: (error) => {
            console.error('Error updating dguf limits data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update DGUF limits data'
            });
          }
        });
      } else {
        // Create new record with POST
        //console.log('POST API call for new dguf limits record:', item);
        this.apiService.post('srar/dguf-limits/', item).subscribe({
          next: (response) => {
            //console.log('Saved dguf limits data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'DGUF limits data saved successfully'
            });
            // Reload data after successful save
            this.loadDgufLimitsData();
          },
          error: (error) => {
            console.error('Error saving dguf limits data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to save DGUF limits data'
            });
          }
        });
      }
    });

    //console.log('saveDgufLimits', { dataToSave });
  }

  deleteDguf(index: number) {
    const item = this.dgufData[index];
    
    if (item.id) {
      // Delete from API if it has an ID
      this.apiService.delete(`srar/dgufs/${item.id}/`).subscribe({
        next: (response) => {
          //console.log('Deleted dguf data:', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message || 'DGUF data deleted successfully'
          });
          this.dgufData.splice(index, 1);
        },
        error: (error) => {
          console.error('Error deleting dguf data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to delete DGUF data'
          });
        }
      });
    } else {
      // Remove from local array if it's a new item
      this.dgufData.splice(index, 1);
    }
  }

  deleteSeaHarbour(index: number) {
    const item = this.seaHarbourData[index];
    
    if (item.id) {
      // Delete from API if it has an ID
      this.apiService.delete(`srar/dguf-sea-harbour-running-hour-data-inputs/${item.id}/`).subscribe({
        next: (response) => {
          //console.log('Deleted sea harbour data:', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message || 'Sea harbour data deleted successfully'
          });
          this.seaHarbourData.splice(index, 1);
        },
        error: (error) => {
          console.error('Error deleting sea harbour data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to delete sea harbour data'
          });
        }
      });
    } else {
      // Remove from local array if it's a new item
      this.seaHarbourData.splice(index, 1);
    }
  }

  deleteDgufLimits(index: number) {
    const item = this.dgufLimitsData[index];
    
    if (item.id) {
      // Delete from API if it has an ID
      this.apiService.delete(`srar/dguf-limits/${item.id}/`).subscribe({
        next: (response) => {
          //console.log('Deleted dguf limits data:', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message || 'DGUF limits data deleted successfully'
          });
          this.dgufLimitsData.splice(index, 1);
        },
        error: (error) => {
          console.error('Error deleting dguf limits data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to delete DGUF limits data'
          });
        }
      });
    } else {
      // Remove from local array if it's a new item
      this.dgufLimitsData.splice(index, 1);
    }
  }

  calculateTotalRH(item: any) {
    const rhAtSea = parseFloat(item.rh_at_sea_and_anchorage || 0);
    const rhAtPort = parseFloat(item.rh_at_port || 0);
    item.total_rh_in_month = (rhAtSea + rhAtPort).toFixed(2);
  }

  calculateTotalRHSeaHarbour(key: string) {
    const totalRH = this.dgufData.reduce((sum, item) => sum + parseFloat(item[key] || 0), 0);
  
    return totalRH.toFixed(2);
  }
}
