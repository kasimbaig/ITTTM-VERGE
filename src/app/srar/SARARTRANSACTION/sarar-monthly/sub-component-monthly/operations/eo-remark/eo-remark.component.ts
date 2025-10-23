import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../../../services/api.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-eo-remark',
  standalone: false,
  templateUrl: './eo-remark.component.html',
  styleUrl: './eo-remark.component.css'
})
export class EoRemarkComponent implements OnInit {
  eefData: any[] = [];
  isEdit: boolean = true;
  shipRemarks: string = '';
  headerData:any;
  constructor(private apiService: ApiService, private messageService: MessageService) {}
  
  ngOnInit() {
    this.headerData=this.apiService.getData();
    this.loadEefData();
  }

  loadEefData() {
    this.apiService.get('srar/eefs/?srar_monthly_header='+this.headerData.id).subscribe((data) => { 
      this.eefData = data.results;
      // Set ship remarks from the first record if available
      if (this.eefData.length > 0 && this.eefData[0].ship_remarks) {
        this.shipRemarks = this.eefData[0].ship_remarks;
      }
    });
  }

  addEef() {
    this.isEdit = false;
    
    // Add new empty row for EEF
    this.eefData.push({
      srar_monthly_header:this.headerData.id,
      designed: '',
      actual: '',
      reason_for_exceeding: '',
      ship_remarks: this.shipRemarks // Include ship remarks in new record
    });
    
    //console.log('addEef - Added new row');
  }

  editEef() {
    this.isEdit = false;
    //console.log('editEef - Entered edit mode');
  }

  saveEef() {
    this.isEdit = true;
    
    // Filter out rows that have been filled with data
    const dataToSave = this.eefData.filter(item => 
      item.designed || 
      item.actual || 
      item.reason_for_exceeding || 
      item.ship_remarks
    );

    if (dataToSave.length === 0) {
      //console.log('No EEF data to save');
      return;
    }

    // Update ship remarks for all records
    dataToSave.forEach(item => {
      item.srar_monthly_header=this.headerData.id;
      item.ship_remarks = this.shipRemarks;
    });

    // Process each item individually - new records get POST, existing records get PUT
    dataToSave.forEach(item => {
      if (item.id) {
        // Update existing record with PUT
        //console.log('PUT API call for existing EEF record:', item);
        this.apiService.put(`srar/eefs/${item.id}/`, item).subscribe({
          next: (response) => {
            //console.log('Updated EEF data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'EEF data updated successfully'
            });
          },
          error: (error) => {
            console.error('Error updating EEF data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update EEF data'
            });
          }
        });
      } else {
        // Create new record with POST
        //console.log('POST API call for new EEF record:', item);
        this.apiService.post('srar/eefs/', item).subscribe({
          next: (response) => {
            //console.log('Saved EEF data:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'EEF data saved successfully'
            });
            // Reload data after successful save
            this.loadEefData();
          },
          error: (error) => {
            console.error('Error saving EEF data:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to save EEF data'
            });
          }
        });
      }
    });

    //console.log('saveEef', { dataToSave, shipRemarks: this.shipRemarks });
  }
}
