import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../../../services/api.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-ship-activity',
  standalone: false,
  templateUrl: './ship-activity.component.html',
  styleUrl: './ship-activity.component.css',
})
export class ShipActivityComponent implements OnInit {

  shipNames: Array<{ id: number; name: string }> = [];
  shipLocations: Array<{ id: number; name: string }> = []; // changed type for clarity

  activityTypes: any[] = [];
  activityDetails: any[] = [];
  headerData:any;
  selectedShipName: any;
  selectedShipLocation: any;
  selectedActivityType: any;
  selectedActivityDetails: any;
  selectedRemarks: any;

  // Date selection properties
  fromDate: Date | null = null;
  toDate: Date | null = null;
  
  // Form state
  isFormEnabled: boolean = false;
  
  // Table data
  tableData: any[] = [];

  constructor(private apiService: ApiService, private messageService: MessageService) {}

  ngOnInit(): void {
    this.headerData=this.apiService.getData();
    this.loadShips();
    this.loadShipLocations(); // also load ship locations
    this.loadActivityTypes();
    this.loadActivityDetails();
    this.getShipActivity();
  }

  /** Load ship names from /master/ship/ */
  private loadShips(): void {
    this.apiService.get<any[]>('srar/ship-states/?is_dropdown=true').subscribe({
      next: (res) => {
        this.shipNames = (res || [])
          .filter(item => item && item.name)
          .map(item => ({ id: item.id, name: item.name }));
      },
      error: (err) => {
        console.error('Failed to load ship names', err);
        this.shipNames = [];
      },
    });
  }

  /** Load ship locations from /srar/ship-locations/ */
  private loadShipLocations(): void {
    this.apiService.get<any>('srar/ship-locations/?is_dropdown=true').subscribe({
      next: (res) => {
        // API returns { count, next, previous, results: [...] }
        this.shipLocations = (res)
          .filter((item: { id: number; name: string }) => item && item.name)
          .map((item: { id: number; name: string }) => ({ id: item.id, name: item.name }));
      },
      error: (err) => {
        console.error('Failed to load ship locations', err);
        this.shipLocations = [];
      },
    });
  }

  /** Load activity types from /srar/ship-activity-types/ */
  private loadActivityTypes(): void {
    this.apiService.get<any>('srar/ship-activity-types/?is_dropdown=true').subscribe({
      next: (res) => {
        // API returns { count, next, previous, results: [...] }
        this.activityTypes = (res)
          .filter((item: any) => item && item.name)
          .map((item: any) => ({ id: item.id, name: item.name }));
      },
      error: (err) => {
        console.error('Failed to load activity types', err);
        this.activityTypes = [];
      },
    });
  }

  /** Load activity details from /srar/ship-activity-details/ */
  private loadActivityDetails(): void {
    this.apiService.get<any>('srar/ship-activity-details/?is_dropdown=true').subscribe({
      next: (res) => {
        // API returns { count, next, previous, results: [...] }
        this.activityDetails = (res)
          .filter((item: any) => item && item.name)
          .map((item: any) => ({ id: item.id, name: item.name }));
      },
      error: (err) => {
        console.error('Failed to load activity details', err);
        this.activityDetails = [];
      },
    });
  }

  /** Enable form after date selection */
  onGoClick(): void {
    if (this.fromDate && this.toDate) {
      this.isFormEnabled = true;
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "Please select both From and To dates" });
    }
  }

  /** Add new ship activity */
  onAddClick(): void {
    if (!this.validateForm()) {
      return;
    }

    const payload = {
      srar_monthly_header:this.headerData.id,
      ship_activity_detail: this.selectedActivityDetails?.id || null,
      ship_activity_type: this.selectedActivityType?.id || null,
      ship_location: this.selectedShipLocation?.id || null,
      ship_state: this.selectedShipName?.id || null, // Assuming ship_name maps to ship_state
      from_date: this.apiService.formatDate(this.fromDate || new Date(),'YYYY-MM-DD'),
      to_date: this.apiService.formatDate(this.toDate || new Date(),'YYYY-MM-DD'),
      remarks: this.selectedRemarks || ''
    };

    this.apiService.post<any>('srar/srar-monthly-ship-activities/', payload).subscribe({
      next: (response) => {
        // Add to table data
        const newRow = {
          id: response.id,
          srar_monthly_header:this.headerData.id,
          shipName: this.selectedShipName?.name || '',
          shipLocation: this.selectedShipLocation?.name || '',
          activityType: this.selectedActivityType?.name || '',
          activityDetails: this.selectedActivityDetails?.name || '',
          remarks: this.selectedRemarks || '',
          fromDate: this.fromDate,
          toDate: this.toDate
        };
        
        this.tableData.push(newRow);
        this.clearForm();
        //console.log('Ship activity added successfully', response);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message || "Ship activity added successfully" });
        this.clearForm();
          },
      error: (err) => {
        console.error('Failed to add ship activity', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Failed to add ship activity. Please try again." });
      }
    });
  }

  getShipActivity(){
    this.apiService.get<any>(`srar/srar-monthly-ship-activities/?srar_monthly_header=${this.headerData.id}`).subscribe({
      next: (res) => {
        this.tableData = res.results.map((item: any) => ({
          id: item.id,
          srar_monthly_header:item.srar_monthly_header,
          shipName: item.ship_state_name,
          shipLocation: item.ship_location_name,
          activityType: item.ship_activity_type_name,
          activityDetails: item.ship_activity_detail_name,
          remarks: item.remarks,
          fromDate: item.from_date,
          toDate: item.to_date
        }));
        
      },
      error: (err) => {
        console.error('Failed to get ship activity', err);
      }
    });
    //console.log(this.tableData);
  }
  /** Delete ship activity */
  onDeleteClick(rowId: number): void {
    this.apiService.delete(`srar/srar-monthly-ship-activities/${rowId}/`).subscribe({
      next: () => {
        this.tableData = this.tableData.filter(row => row.id !== rowId);
        //console.log('Ship activity deleted successfully');
        this.messageService.add({ severity: 'success', summary: 'Success', detail: "ship activity deleted successfully from the list" });
        this.clearForm();
      },
      error: (err) => {
        console.error('Failed to delete ship activity', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message || "Failed to delete ship activity. Please try again." });
      }
    });
  }

  /** Validate form before submission */
  private validateForm(): boolean {
    if (!this.selectedShipName) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "Please select a ship name" });
      return false;
    }
    if (!this.selectedShipLocation) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "Please select a ship location" });
      return false;
    }
    if (!this.selectedActivityType) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "Please select an activity type" });
      return false;
    }
    if (!this.selectedActivityDetails) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "Please select activity details" });
      return false;
    }
    if (!this.fromDate || !this.toDate) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "Please select both from and to dates" });
      return false;
    }
    return true;
  }

  /** Clear form after successful submission */
  private clearForm(): void {
    this.selectedShipName = null;
    this.selectedShipLocation = null;
    this.selectedActivityType = null;
    this.selectedActivityDetails = null;
    this.selectedRemarks = '';
  }
}
