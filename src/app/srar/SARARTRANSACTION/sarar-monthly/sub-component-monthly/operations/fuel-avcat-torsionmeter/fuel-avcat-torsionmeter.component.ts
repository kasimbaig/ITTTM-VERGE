import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from '../../../../../../services/api.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-fuel-avcat-torsionmeter',
  standalone: false,
  templateUrl: './fuel-avcat-torsionmeter.component.html',
  styleUrl: './fuel-avcat-torsionmeter.component.css'
})
export class FuelAvcatTorsionmeterComponent implements OnInit {
  fuelConsumptionData: any[] = [];
  avcatStatusData: any[] = [];
  isEdit: boolean = true;
  headerData:any;
  constructor(private apiService: ApiService, private messageService: MessageService) {}
  
  ngOnInit() {
    this.headerData=this.apiService.getData();
    this.loadFuelConsumptionData();
    this.loadAvcatStatusData();
  }

  loadFuelConsumptionData() {
    this.apiService.get('srar/fuel-consumption-months/?srar_monthly_header='+this.headerData.id).subscribe((data) => {
      this.fuelConsumptionData = data.results;
    });
  }

  loadAvcatStatusData() {
    this.apiService.get('srar/avcat-statuses/?srar_monthly_header='+this.headerData.id).subscribe((data) => {
      this.avcatStatusData = data.results;
    });
  }

  addFuel() {
    this.isEdit = false;
    
    // Add new empty row
    this.fuelConsumptionData.push({
      b_f_from_last_month: '',
      recieved: '',
      consumed_in_harbour: '',
      consumed_at_anchorage: '',
      consumed_at_sea: '',
      total_consumed: '',
      defueled: '',
      balance_left_on_board: ''
    });
    
    //console.log('addFuel - Added new row');
  }

  addAvcat() {
    this.isEdit = false;
    
    // Add new empty row for AVCAT
    this.avcatStatusData.push({
      b_f_from_last_month: '',
      recieved: '',
      given_to_ac: '',
      used_for_trials_drained: '',
      total_consumed: '',
      defueled: '',
      balance_left_on_board: ''
    });
    
    //console.log('addAvcat - Added new row');
  }

  editFuel() {
    this.isEdit = false;
    //console.log('editFuel - Entered edit mode');
  }

  editAvcat() {
    this.isEdit = false;
    //console.log('editAvcat - Entered edit mode');
  }

  saveFuel() {
    this.isEdit = true;
    
    // Filter out rows that have been filled with data
    const dataToSave = this.fuelConsumptionData.filter(item => 
      item.b_f_from_last_month || 
      item.recieved || 
      item.consumed_in_harbour || 
      item.consumed_at_anchorage || 
      item.consumed_at_sea || 
      item.total_consumed || 
      item.defueled || 
      item.balance_left_on_board
    );

    if (dataToSave.length === 0) {
      //console.log('No fuel data to save');
      return;
    }

    // Process each item individually - new records get POST, existing records get PUT
    dataToSave.forEach(item => {
      item.srar_monthly_header=this.headerData.id;
      if (item.id) {
        // Update existing record with PUT
        //console.log('PUT API call for existing fuel record:', item);
        this.apiService.put(`srar/fuel-consumption-months/${item.id}/`, item).subscribe({
          next: (response) => {
            //console.log('Updated fuel consumption data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Fuel consumption data updated successfully'
            });
          },
          error: (error) => {
            console.error('Error updating fuel consumption data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update fuel consumption data'
            });
          }
        });
      } else {
        // Create new record with POST
        //console.log('POST API call for new fuel record:', item);
        this.apiService.post('srar/fuel-consumption-months/', item).subscribe({
          next: (response) => {
            //console.log('Saved fuel consumption data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Fuel consumption data saved successfully'
            });
            // Reload data after successful save
            this.loadFuelConsumptionData();
          },
          error: (error) => {
            console.error('Error saving fuel consumption data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to save fuel consumption data'
            });
          }
        });
      }
    });

    //console.log('saveFuel', { dataToSave });
  }

  saveAvcat() {
    this.isEdit = true;
    
    // Filter out rows that have been filled with data
    const dataToSave = this.avcatStatusData.filter(item => 
      item.b_f_from_last_month || 
      item.recieved || 
      item.consumed_in_harbour || 
      item.consumed_at_anchorage || 
      item.consumed_at_sea || 
      item.total_consumed || 
      item.defueled || 
      item.balance_left_on_board
    );

    if (dataToSave.length === 0) {
      //console.log('No AVCAT data to save');
      return;
    }

    // Process each item individually - new records get POST, existing records get PUT
    dataToSave.forEach(item => {
      item.srar_monthly_header=this.headerData.id;
      if (item.id) {
        // Update existing record with PUT
        //console.log('PUT API call for existing AVCAT record:', item);
        this.apiService.put(`srar/avcat-statuses/${item.id}/`, item).subscribe({
          next: (response) => {
            //console.log('Updated AVCAT status data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'AVCAT status data updated successfully'
            });
          },
          error: (error) => {
            console.error('Error updating AVCAT status data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update AVCAT status data'
            });
          }
        });
      } else {
        // Create new record with POST
        //console.log('POST API call for new AVCAT record:', item);
        this.apiService.post('srar/avcat-statuses/', item).subscribe({
          next: (response) => {
            //console.log('Saved AVCAT status data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'AVCAT status data saved successfully'
            });
            // Reload data after successful save
            this.loadAvcatStatusData();
          },
          error: (error) => {
            console.error('Error saving AVCAT status data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to save AVCAT status data'
            });
          }
        });
      }
    });

    //console.log('saveAvcat', { dataToSave });
  }

  deleteFuel(index: number) {
    const item = this.fuelConsumptionData[index];
    
    if (item.id) {
      // Delete from API if it has an ID
      this.apiService.delete(`srar/fuel-consumption-months/${item.id}/`).subscribe({
        next: (response) => {
          //console.log('Deleted fuel consumption data:', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message || 'Fuel consumption data deleted successfully'
          });
          this.fuelConsumptionData.splice(index, 1);
        },
        error: (error) => {
          console.error('Error deleting fuel consumption data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to delete fuel consumption data'
          });
        }
      });
    } else {
      // Remove from local array if it's a new item
      this.fuelConsumptionData.splice(index, 1);
    }
  }

  deleteAvcat(index: number) {
    const item = this.avcatStatusData[index];
    
    if (item.id) {
      // Delete from API if it has an ID
      this.apiService.delete(`srar/avcat-statuses/${item.id}/`).subscribe({
        next: (response) => {
          //console.log('Deleted AVCAT status data:', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message || 'AVCAT status data deleted successfully'
          });
          this.avcatStatusData.splice(index, 1);
        },
        error: (error) => {
          console.error('Error deleting AVCAT status data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to delete AVCAT status data'
          });
        }
      });
    } else {
      // Remove from local array if it's a new item
      this.avcatStatusData.splice(index, 1);
    }
  }
}
