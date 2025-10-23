import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-equipment-hierarchy',
  standalone:false,
  templateUrl: './equipment-hierarchy.component.html',
  styleUrl: './equipment-hierarchy.component.css'
})
export class EquipmentHierarchyComponent implements OnInit {

  departmentOptions: any[] = [];
  shipOptions: any[] = [];
  unitTypeOptions: any[] = [];
  equipmentOptions: any[] = []; // Added for Parent Equipment dropdown
  
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
    //console.log('Equipment Hierarchy Component initialized - waiting for filter selection');
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

    // Load equipment options for Parent Equipment dropdown
    this.apiService.get('master/equipment/').subscribe((res: any) => {
      if (res.results && res.results.length > 0) {
        this.equipmentOptions = res.results.map((equipment: any) => ({
          label: equipment.name,
          value: equipment.id
        }));
        //console.log('Equipment options loaded:', this.equipmentOptions.length, 'records');
      } else {
        this.equipmentOptions = [];
        //console.log('No equipment data found.');
      }
    }, (error) => {
      console.error('Error loading equipment data:', error);
      this.equipmentOptions = [];
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
    this.originalData = [];
  }

  onShipChange(): void {
    //console.log('Ship changed to:', this.selectedShip);
    // Clear table data when ship changes
    this.tableData = [];
    this.originalData = [];
    
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
        this.tableData = res.results;
        
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

  // Check if there are any changes in the equipment hierarchy
  hasChanges(): boolean {
    if (!this.tableData || !this.originalData || this.tableData.length === 0) {
      return false;
    }
    
    return this.tableData.some((item, index) => {
      const original = this.originalData[index];
      return original && (
        item.parent_child !== original.parent_child ||
        item.parent_equipment !== original.parent_equipment
      );
    });
  }

  // Track changes in parent/child field
  onParentChildChange(item: any, index: number): void {
    //console.log(`Parent/Child changed for item ${index}:`, item.parent_child);
    
    // Clear the parent_equipment selection when parent/child changes
    item.parent_equipment = '';
  }

  // Track changes in parent equipment field
  onParentEquipmentChange(item: any, index: number): void {
    //console.log(`Parent Equipment changed for item ${index}:`, item.parent_equipment);
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
      if (original && (
        item.parent_child !== original.parent_child ||
        item.parent_equipment !== original.parent_equipment
      )) {
        // Prepare update data based on Parent/Child selection
        let updateData: any = {
          sfd_details_id: item.id
        };
        
        if (item.parent_child === 'parent') {
          updateData.parent_equipment = parseInt(item.parent_equipment);
        } else if (item.parent_child === 'child') {
          updateData.child_equipment = parseInt(item.parent_equipment);
        }
        
        changedItems.push(updateData);
      }
    });
    
    return changedItems;
  }

  // Bulk update all changed equipment hierarchy
  updateAllEquipmentHierarchy(): void {
    const changedItems = this.getChangedItems();
    
    if (changedItems.length === 0) {
      //console.log('No changes detected');
      return;
    }
    
    //console.log('Updating equipment hierarchy for items:', changedItems);
    
    // Use the same API endpoint but send all changes in one request
    this.apiService.put('sfd/sfd-details/', changedItems).subscribe({
      next: (response: any) => {
        //console.log('Bulk equipment hierarchy update successful:', response);
        // Refresh the data to show updated values
        this.loadTableData(this.selectedUnitType.id, this.selectedShip.id, this.selectDepartment?.id);
        // Show success message (you can add toast service here)
      },
      error: (error: any) => {
        console.error('Error in bulk equipment hierarchy update:', error);
        // Show error message (you can add toast service here)
      }
    });
  }

  // Update method for Parent/Child equipment relationship (individual update)
  updateEquipmentHierarchy(item: any): void {
    if (!item.parent_child) {
      //console.log('Please select Parent or Child first');
      return;
    }

    if (!item.parent_equipment) {
      //console.log('Please select equipment from Parent Equipment dropdown');
      return;
    }

    // Prepare update data based on Parent/Child selection
    let updateData: any = {};
    
    if (item.parent_child === 'parent') {
      // If Parent is selected, send in parent_equipment key
      updateData = {
        parent_equipment: parseInt(item.parent_equipment)
      };
    } else if (item.parent_child === 'child') {
      // If Child is selected, send in child_equipment key
      updateData = {
        child_equipment: parseInt(item.parent_equipment)
      };
    }

    // Make API call to update the equipment hierarchy
    this.apiService.put(`sfd/sfd-details/${item.id}/`, updateData).subscribe({
      next: (response: any) => {
        //console.log('Equipment hierarchy updated successfully:', response);
        // Optionally refresh the data or show success message
        this.loadTableData(this.selectedUnitType.id, this.selectedShip.id, this.selectDepartment?.id);
      },
      error: (error: any) => {
        console.error('Error updating equipment hierarchy:', error);
        // Optionally show error message
      }
    });
  }
}
