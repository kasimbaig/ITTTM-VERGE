import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-linked-equipment',
  standalone:false,
  templateUrl: './linked-equipment.component.html',
  styleUrl: './linked-equipment.component.css'
})
export class LinkedEquipmentComponent implements OnInit {
  displayDialog: boolean = false;
  isMaximized: boolean = false;
  sararMasterForm: FormGroup = new FormGroup({
    id: new FormControl(''),
    ship: new FormControl(''),
    ship_name: new FormControl(''),
    ship_id: new FormControl(''),
    equipment_name: new FormControl(''),
    equipment_id: new FormControl(''),
    sarar_equipemnt: new FormControl(''),
    sarar_equipment_id: new FormControl(''),
    location_name: new FormControl(''),
    location_id: new FormControl(''),
    location_on_board: new FormControl(''),
    status: new FormControl(''),
    active: new FormControl(''),
  });
 // Table Columns Configuration
 tableColumns = [
  { field: 'ship_name', header: 'Ship Name', type: 'text', sortable: true, filterable: true },
  { field: 'equipment_code', header: 'Equipment Code', type: 'text', sortable: true, filterable: true },
  { field: 'equipment_name', header: 'Equipment Name', type: 'text', sortable: true, filterable: true },
  { field: 'srar_equipment_nomenclature', header: 'Nomenclature', type: 'text', sortable: true, filterable: true },
  { field: 'location_name', header: 'Location', type: 'text', sortable: true, filterable: true },
  { field: 'active', header: 'Active', type: 'status', sortable: true, filterable: true },
];

  


  // Table Data
  tableData: any[]   = [];
  
  // Dropdown options
  equipmentTypeOptions: any[] = [];
  
  constructor(private apiService: ApiService, private toast: MessageService) {}
  ngOnInit(): void {
    // Don't load data initially - wait for ship selection
    //console.log('Linked Equipment Component initialized - waiting for ship selection');
    this.apiCall();
  }
  currentPageApi(page: number, pageSize: number, shipId?: string){
    let apiUrl = `srar/srar-linked-equipments/`;
    if (shipId) {
      apiUrl += `?ship=${shipId}`;
    }
    
    this.apiService.get(apiUrl).subscribe((res: any) => {
      // Handle paginated response structure
      this.tableData = res.results || res;
      //console.log('Linked Equipment Data loaded for ship:', shipId, 'with', this.tableData.length, 'records');
    }, (error) => {
      console.error('Error fetching SRAR linked equipment data:', error);
      this.toast.add({severity:'error', summary: 'Error', detail: 'Failed to fetch linked equipment data'});
    });
  }
apiCall(){
  this.apiService.get('master/ship/?is_dropdown=true').subscribe((res: any) => {
    this.shipOptions = res;
  });
  this.apiService.get('master/locations/?is_dropdown=true').subscribe((res: any) => {
    this.locationOptions = res.data || res.results || res;
  });
  this.apiService.get('master/equipment/?is_dropdown=true').subscribe((res: any) => {
    this.equipmentOptions = res;
  });
  this.apiService.get('sfd/sfd-details/?is_srar_equipment=True').subscribe((res: any) => {
    // Extract equipment_name from the results array
    this.equipmentTypeOptions = res.results || res;
  });
}

  crudName='Add'
  openDialog(): void {
    this.displayDialog = true;
    // Reset form when opening for new record (not for view mode)
    if (!this.isEdit && this.crudName !== 'View') {
      this.sararMasterForm.reset();
      this.sararMasterForm.patchValue({
        active: true
      });
      // Enable form for new record
      this.sararMasterForm.enable();
    }
  }

  closeDialog(): void {
    this.displayDialog = false;
    // Only reset form if not in view mode
    if (this.crudName !== 'View') {
      this.sararMasterForm.reset();
      this.sararMasterForm.enable();
    }
    this.crudName='Add'
  }


  // Event Handlers
  onView(data: any): void {
    this.crudName='View'
    // Map API data to form fields
    const formData = {
      id: data.id,
      ship: data.ship,
      ship_name: data.ship_name,
      ship_id: data.ship,
      equipment_name: data.equipment_name,
      equipment_id: data.equipment,
      sarar_equipemnt: data.sarar_equipemnt,
      sarar_equipment_id: data.sarar_equipment || data.sarar_equipemnt,
      location_name: data.location_name,
      location_id: data.location,
      location_on_board: data.location_name,
      active: data.active
    };
    this.sararMasterForm.patchValue(formData);
    this.sararMasterForm.get('active')?.setValue(data.active == 1 ? true : false);
    // Disable form for view mode
    this.sararMasterForm.disable();
    this.openDialog();
  }
  isEdit: boolean = false;
  onEdit(data: any): void {
    this.isEdit = true;
    this.crudName='Edit'
    // Map API data to form fields
    const formData = {
      id: data.id,
      ship: data.ship,
      ship_name: data.ship_name,
      ship_id: data.ship,
      equipment_name: data.equipment_name,
      equipment_id: data.equipment,
      sarar_equipemnt: data.sarar_equipemnt,
      sarar_equipment_id: data.sarar_equipment || data.sarar_equipemnt,
      location_name: data.location_name,
      location_id: data.location,
      location_on_board: data.location_name,
      active: data.active
    };
    this.sararMasterForm.patchValue(formData);
    this.sararMasterForm.get('active')?.setValue(data.active === 1 ? true : false);
    // Enable form for edit mode
    this.sararMasterForm.enable();
    this.openDialog();
  }

  // Delete confirmation modal properties
  showDeleteModal: boolean = false;
  itemToDelete: any = null;

  onDelete(data: any): void {
    //console.log('Delete Linked Equipment:', data);
    this.itemToDelete = data;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.itemToDelete) {
      this.apiService.delete(`srar/srar-linked-equipments/${this.itemToDelete.id}/`).subscribe((res: any) => {
        this.toast.add({severity:'success', summary: 'Success', detail: 'Linked Equipment Deleted Successfully'});
        //console.log(res);
        // Refresh data for the currently selected ship
        const currentShipId = this.selectedShip?.id;
        if (currentShipId) {
          this.currentPageApi(0, 0, currentShipId);
        }
        this.showDeleteModal = false;
        this.itemToDelete = null;
      }, (error) => {
        this.toast.add({severity:'error', summary: 'Error', detail: 'Failed to delete linked equipment record'});
        console.error('Delete error:', error);
        this.showDeleteModal = false;
        this.itemToDelete = null;
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.itemToDelete = null;
  }

  save(){
    //console.log('Form values:', this.sararMasterForm.value);
    
    // Prepare the payload with the required structure
    const payload = {
      equipment: this.sararMasterForm.value.equipment_id || null,
      ship: this.sararMasterForm.value.ship || null,
      location: this.sararMasterForm.value.location_id || null,
      srar_equipment: this.sararMasterForm.value.sarar_equipment_id || null,
      active: this.sararMasterForm.value.active ? 1 : 0
    };

    //console.log('Sending payload:', payload);

    if(this.isEdit){
      // Update existing record
      this.apiService.put(`srar/srar-linked-equipments/${this.sararMasterForm.value.id}/`, payload).subscribe((res: any) => {
        this.toast.add({severity:'success', summary: 'Success', detail: 'Linked Equipment Updated Successfully'});
        //console.log(res);
        this.isEdit = false;
        // Refresh data for the currently selected ship
        const currentShipId = this.selectedShip?.id || this.sararMasterForm.value.ship;
        if (currentShipId) {
          this.currentPageApi(0, 0, currentShipId);
        }
        this.closeDialog();
      }, (error) => {
        this.toast.add({severity:'error', summary: 'Error', detail: 'Failed to update linked equipment record'});
        console.error('Update error:', error);
      });
    } else {
      // Create new record
      this.apiService.post('srar/srar-linked-equipments/', payload).subscribe((res: any) => {
        this.toast.add({severity:'success', summary: 'Success', detail: 'Linked Equipment Added Successfully'});
        //console.log(res);
        // Refresh data for the currently selected ship
        const currentShipId = this.selectedShip?.id || this.sararMasterForm.value.ship;
        if (currentShipId) {
          this.currentPageApi(0, 0, currentShipId);
        }
        this.closeDialog();
      }, (error) => {
        this.toast.add({severity:'error', summary: 'Error', detail: 'Failed to add linked equipment record'});
        console.error('Create error:', error);
      });
    }
  }
  
  shipOptions: any[] = [];
  locationOptions: any[] = [];
  equipmentOptions: any[] = [];
  selectedShip: any;
  
  onShipChange(event: any): void {
    // Extract the ship ID from the selected ship object
    const shipId = event?.id || event;
    
    if (shipId) {
      // Find the selected ship object to get additional details
      const selectedShip = this.shipOptions.find(ship => ship.id === shipId);
      
      if (selectedShip) {
        // Update form with ship details
        this.sararMasterForm.patchValue({
          ship: shipId,
          ship_name: selectedShip.name,
          ship_id: shipId
        });
        
        // Fetch equipment options for the selected ship using master/equipment API
        this.apiService.get(`master/equipment/?is_dropdown=true&ship=${shipId}`).subscribe((res: any) => {
          this.equipmentOptions = res;
        });
        
        // Fetch linked equipment data for the selected ship
        this.currentPageApi(0, 0, shipId);
      }
    } else {
      // If no ship is selected (dropdown cleared), clear the table data
      this.selectedShip = null;
      this.clearTableData();
      // Also clear the form ship-related fields
      this.sararMasterForm.patchValue({
        ship: '',
        ship_name: '',
        ship_id: ''
      });
    }
  }

  // Method to clear table data and equipment options when no ship is selected
  clearTableData(): void {
    this.tableData = [];
    this.equipmentOptions = [];
    //console.log('No ship selected - clearing table data and equipment options');
  }

  onLocationOnBoardChange(event: any): void {
    //console.log('Location changed to:', event);
    if (event) {
      // Find the selected location object from the options array
      const selectedLocation = this.locationOptions.find(location => location.name === event);
      if (selectedLocation) {
        this.sararMasterForm.patchValue({
          location_name: selectedLocation.name,
          location_id: selectedLocation.id,
          location_on_board: selectedLocation.name
        });
      }
    }
  }

  onEquipmentChange(event: any): void {
    const selectedEquipment = this.equipmentOptions.find(equipment => equipment.name === event);
    if (selectedEquipment) {
      this.sararMasterForm.patchValue({
        equipment_id: selectedEquipment.id
      });
    }
  }

  onEquipmentTypeChange(event: any): void {
    // Handle equipment type selection change
    //console.log('Equipment type changed:', event);
    
    // Find the selected equipment to get additional details if needed
    const selectedEquipment = this.equipmentTypeOptions.find(equipment => equipment.equipment_name === event);
    if (selectedEquipment) {
      // Store the equipment ID in the form
      this.sararMasterForm.patchValue({
        sarar_equipment_id: selectedEquipment.id
      });
      //console.log('Selected equipment details:', selectedEquipment);
    }
  }

 
}

