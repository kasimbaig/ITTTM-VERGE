import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';


@Component({
  selector: 'app-eqpt-nomenclature-location',
  standalone: false,
  templateUrl: './eqpt-nomenclature-location.component.html',
  styleUrl: './eqpt-nomenclature-location.component.css'
})
export class EqptNomenclatureLocationComponent  implements OnInit {

  departmentOptions: any[] = [];
  shipOptions: any[] = [];
  unitTypeOptions: any[] = [];
  
  searchValue: string = '';
  // Selected Values
  selectedUnitType: any = null;
  selectedShip: any = null;
  selectDepartment: any = null;

  // Table Data
  tableData: any[] = [];
  originalData: any[] = []; // Store original data to track changes
  
  constructor(private apiService: ApiService) {}
  
  ngOnInit(): void {
    this.apiCall();
    // Don't load all data initially - wait for filters
    //console.log('Equipment Nomenclature Component initialized - waiting for filter selection');
  }
  
  currentPageApi(page: number, pageSize: number){
    // Only load data if both unit and ship are selected
    if (this.selectedUnitType && this.selectedShip) {
      this.loadTableData(this.selectedUnitType.id, this.selectedShip.id, this.selectDepartment?.id);
    }
  }

  apiCall(){
    // Only load unit types initially - ships will be loaded when unit is selected
    this.apiService.get('master/unit-type/').subscribe((res: any) => {
      this.unitTypeOptions = res.results;
    });
    
    // Load other independent dropdowns
    this.apiService.get('master/department/?is_dropdown=true').subscribe((res: any) => {
      this.departmentOptions = res.results || res;
    });
  }

  // Event Handlers
  onView(data: any): void {
    //console.log('View Equipment:', data);
  }

  onUnitTypeChange(): void {
    //console.log('Unit Type changed to:', this.selectedUnitType);
    let id = this.selectedUnitType.id;
    //console.log("idCheck", id);
    
    // Fetch ships for selected unit
    this.apiService.get(`master/ship/?unit_type=${id}`).subscribe((res: any) => {
      this.shipOptions = res.results;
      //console.log("response is ", res);
      //console.log("shipOption data", this.shipOptions);
    });
    
    // Clear ship selection and table data when unit changes
    this.selectedShip = null;
    this.selectDepartment = null;
    this.tableData = [];
  }

  onShipChange(): void {
    //console.log('Ship changed to:', this.selectedShip);
    // Clear table data when ship changes
    this.tableData = [];
    
    // Automatically load data if both unit and ship are selected
    if (this.selectedUnitType && this.selectedShip) {
      //console.log('Both unit and ship selected, loading data...');
      this.loadTableData(this.selectedUnitType.id, this.selectedShip.id, this.selectDepartment?.id);
    }
  }

  onDepartmentChange(): void {
    // Only load data if both unit and ship are selected
    if (this.selectedUnitType && this.selectedShip) {
      this.loadTableData(this.selectedUnitType.id, this.selectedShip.id, this.selectDepartment?.id);
    }
  }

  // Load table data for selected Unit + Ship + Department
  loadTableData(unitId: number, shipId: number, departmentId?: number) {
    //console.log('Loading table data for Unit ID:', unitId, 'Ship ID:', shipId, 'Department ID:', departmentId);
    
    let apiUrl = `sfd/sfd-details/?ship=${shipId}`;
    if (departmentId) {
      apiUrl += `&department=${departmentId}`;
    }
    
    this.apiService.get(apiUrl).subscribe((res: any) => {
      //console.log('API Response:', res);
      if (res.results && res.results.length > 0) {
        // Map the API response data to match the table structure
        this.tableData = res.results.map((item: any) => ({
          ...item,
          // Ensure location_on_board is initialized with location_name
          location_on_board: item.location_name || '',
          // Ensure equipment_nomenclature is initialized with nomenclature
          equipment_nomenclature: item.nomenclature || ''
        }));
        
        // Store original data for change tracking
        this.originalData = JSON.parse(JSON.stringify(this.tableData));
        
        //console.log('Table data loaded:', this.tableData.length, 'records');
      } else {
        this.tableData = [];
        this.originalData = [];
        // You can add a toast message here if you want to show "No data found"
        //console.log('No data found for the selected filters.');
      }
    }, (error) => {
      console.error('Error loading data:', error);
      this.tableData = [];
      this.originalData = [];
      // You can add a toast message here if you want to show error
      console.error('Failed to load data. Please try again.');
    });
  }

  onSearchInput(value: string): string {
    const val = value.trim();
    return val || '';
  }

  // Check if there are any changes in the nomenclature
  hasChanges(): boolean {
    if (!this.tableData || !this.originalData || this.tableData.length === 0) {
      return false;
    }
    
    return this.tableData.some((item, index) => {
      const original = this.originalData[index];
      return original && item.equipment_nomenclature !== original.equipment_nomenclature;
    });
  }

  // Track changes in nomenclature field
  onNomenclatureChange(item: any, index: number): void {
    // This method can be called when nomenclature field changes
    // The two-way binding will automatically update the tableData
    // We can add additional validation or logging here if needed
    //console.log(`Nomenclature changed for item ${index}:`, item.equipment_nomenclature);
  }

  // Get count of changed items
  getChangedItemsCount(): number {
    return this.getChangedItems().length;
  }

  // Reset all changes to original values
  resetChanges(): void {
    if (this.originalData && this.originalData.length > 0) {
      this.tableData = JSON.parse(JSON.stringify(this.originalData));
      //console.log('Changes reset to original values');
    }
  }

  // Get all changed items for bulk update
  getChangedItems(): any[] {
    if (!this.tableData || !this.originalData || this.tableData.length === 0) {
      return [];
    }
    
    const changedItems: any[] = [];
    
    this.tableData.forEach((item, index) => {
      const original = this.originalData[index];
      if (original && item.equipment_nomenclature !== original.equipment_nomenclature) {
        changedItems.push({
          sfd_details_id: item.id,
          nomenclature: item.equipment_nomenclature
        });
      }
    });
    
    return changedItems;
  }

  // Bulk update all changed nomenclatures using the same API endpoint
  updateAllNomenclatures(): void {
    const changedItems = this.getChangedItems();
    
    if (changedItems.length === 0) {
      //console.log('No changes detected');
      return;
    }
    
    //console.log('Updating nomenclature for items:', changedItems);
    
    // Use the same API endpoint but send all changes in one request
    this.apiService.put('sfd/sfd-details/', [...changedItems
    ]).subscribe({
      next: (response: any) => {
        //console.log('Bulk nomenclature update successful:', response);
        // Refresh the data to show updated values
        this.loadTableData(this.selectedUnitType.id, this.selectedShip.id, this.selectDepartment?.id);
        // Show success message (you can add toast service here)
      },
      error: (error: any) => {
        console.error('Error in bulk nomenclature update:', error);
        // Show error message (you can add toast service here)
      }
    });
  }

  // Update method for nomenclature only (individual update)
  updateNomenclature(item: any): void {
    if (!item.equipment_nomenclature) {
      //console.log('Please enter nomenclature value first');
      return;
    }

    // Prepare update data with only nomenclature
    const updateData = {
      nomenclature: item.equipment_nomenclature
    };

    // Make API call to update the nomenclature
    this.apiService.put(`sfd/sfd-details/${item.id}/`, updateData).subscribe({
      next: (response: any) => {
        //console.log('Nomenclature updated successfully:', response);
        // Optionally refresh the data or show success message
        this.loadTableData(this.selectedUnitType.id, this.selectedShip.id, this.selectDepartment?.id);
      },
      error: (error: any) => {
        console.error('Error updating nomenclature:', error);
        // Optionally show error message
      }
    });
  }
}
