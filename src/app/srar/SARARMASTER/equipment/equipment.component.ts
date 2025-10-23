import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-equipment',
standalone:false,
  templateUrl: './equipment.component.html',
  styleUrl: './equipment.component.css'
})
export class EquipmentComponent 
implements OnInit {
  displayDialog: boolean = false;
  isMaximized: boolean = false;
     sararMasterForm: FormGroup = new FormGroup({
     id: new FormControl(''),
     ship: new FormControl(''),
     ship_name: new FormControl(''),
     ship_id: new FormControl(''),
     equipment_code: new FormControl(''),
     equipment_name: new FormControl(''),
     equipment_id: new FormControl(''),
     nomenclature: new FormControl(''),
     oem_part_number: new FormControl(''),
     no_of_fits: new FormControl(''),
     location_name: new FormControl(''),
     location_id: new FormControl(''),
     equipment_type: new FormControl(''),
     active: new FormControl(''),
   });
       // Table Columns Configuration
   tableColumns = [
    { field: 'ship_name', header: 'Ship Name', type: 'text', sortable: true, filterable: true },
    { field: 'equipment_code', header: 'Equipment Code', type: 'text', sortable: true, filterable: true },
    { field: 'equipment_name', header: 'Equipment Name', type: 'text', sortable: true, filterable: true },
    { field: 'nomenclature', header: 'Nomenclature', type: 'text', sortable: true, filterable: true },
    { field: 'location_name', header: 'Location', type: 'text', sortable: true, filterable: true },
    { field: 'active', header: 'Active', type: 'status', sortable: true, filterable: true },
    // { field: '', header: 'Link Equipment', type: 'text', sortable: true, filterable: true },
    { field: 'removal_date', header: 'Removal Date', type: 'text', sortable: true, filterable: true },
  ];

  


     // Table Data
   tableData: any[] = [];
  constructor(private apiService: ApiService, private toast: MessageService) {}
  ngOnInit(): void {
    // Don't load data initially - wait for ship selection
    //console.log('SRAR Equipment Component initialized - waiting for ship selection');
    this.apiCall(); // Only load ship options
  }
  
  currentPageApi(page: number, pageSize: number, shipId?: number){
    if (!shipId) {
      // If no ship is selected, clear the table
      this.tableData = [];
      return;
    }
    
    this.apiService.get(`sfd/sfd-details/?is_srar_equipment=True&ship=${shipId}`).subscribe((res: any) => {
      // Handle paginated response structure
      this.tableData = res.results || res;
      //console.log('SRAR Equipment Data loaded for ship:', shipId, 'with', this.tableData.length, 'records');
    }, (error) => {
      console.error('Error fetching SRAR equipment data:', error);
      this.toast.add({severity:'error', summary: 'Error', detail: 'Failed to fetch equipment data'});
      this.tableData = [];
    });
  }
  
 apiCall(){
   this.apiService.get('master/ship/?is_dropdown=true').subscribe((res: any) => {
     this.shipOptions = res;
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
      // Initially disable auto-fill fields
      this.sararMasterForm.get('equipment_code')?.disable();
      this.sararMasterForm.get('nomenclature')?.disable();
      this.sararMasterForm.get('oem_part_number')?.disable();
      this.sararMasterForm.get('location_name')?.disable();
      this.sararMasterForm.get('equipment_type')?.disable();
    }
  }

  closeDialog(): void {
    this.displayDialog = false;
    // Only reset form if not in view mode
    if (this.crudName !== 'View') {
      this.sararMasterForm.reset();
      this.sararMasterForm.enable();
    }
    // Reset equipment options when closing
    this.equipmentOptions = [];
    this.crudName='Add'
  }


  // Event Handlers
  onView(data: any): void {
    this.crudName='View'
    
    // First load equipment options for the selected ship to ensure proper data display
    if (data.ship) {
      this.apiService.get(`sfd/sfd-details/?ship=${data.ship}`).subscribe((res: any) => {
        const equipmentData = res.results || res;
        // Format equipment options to show "Equipment Code - Equipment Name" in dropdown
        this.equipmentOptions = equipmentData.map((equipment: any) => ({
          ...equipment,
          displayName: `${equipment.equipment_code} - ${equipment.equipment_name}`
        }));
        
        // Now set the form values after equipment options are loaded
        this.setViewFormData(data);
      });
    } else {
      // If no ship data, set form directly
      this.setViewFormData(data);
    }
  }

  private setViewFormData(data: any): void {
    // Map API data to form fields
    const formData = {
      id: data.id,
      ship: data.ship,
      ship_name: data.ship_name,
      ship_id: data.ship,
      equipment_code: data.equipment_code,
      equipment_name: data.equipment_name,
      equipment_id: data.equipment,
      nomenclature: data.nomenclature,
      oem_part_number: data.oem_part_number,
      no_of_fits: data.no_of_fits,
      location_name: data.location_name,
      location_id: data.location,
      equipment_type: data.type || '',
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
    
    // First load equipment options for the selected ship
    if (data.ship) {
      this.apiService.get(`sfd/sfd-details/?ship=${data.ship}`).subscribe((res: any) => {
        const equipmentData = res.results || res;
        // Format equipment options to show "Equipment Code - Equipment Name" in dropdown
        this.equipmentOptions = equipmentData.map((equipment: any) => ({
          ...equipment,
          displayName: `${equipment.equipment_code} - ${equipment.equipment_name}`
        }));
        
        // Now set the form values after equipment options are loaded
        this.setEditFormData(data);
      });
    } else {
      // If no ship data, set form directly
      this.setEditFormData(data);
    }
  }

  private setEditFormData(data: any): void {
    // Map API data to form fields
    const formData = {
      id: data.id,
      ship: data.ship,
      ship_name: data.ship_name,
      ship_id: data.ship,
      equipment_code: data.equipment_code,
      equipment_name: data.equipment_name,
      equipment_id: data.equipment,
      nomenclature: data.nomenclature,
      oem_part_number: data.oem_part_number,
      no_of_fits: data.no_of_fits,
      location_name: data.location_name,
      location_id: data.location,
      equipment_type: data.type || '',
      active: data.active
    };
    this.sararMasterForm.patchValue(formData);
    this.sararMasterForm.get('active')?.setValue(data.active === 1 ? true : false);
    // Enable form for edit mode
    this.sararMasterForm.enable();
    // Keep auto-fill fields disabled even in edit mode
    this.sararMasterForm.get('equipment_code')?.disable();
    this.sararMasterForm.get('nomenclature')?.disable();
    this.sararMasterForm.get('oem_part_number')?.disable();
    this.sararMasterForm.get('location_name')?.disable();
    this.sararMasterForm.get('equipment_type')?.disable();
    this.openDialog();
  }

  // Delete confirmation modal properties
  showDeleteModal: boolean = false;
  itemToDelete: any = null;

  onDelete(data: any): void {
    //console.log('Delete Equipment:', data);
    this.itemToDelete = data;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.itemToDelete) {
      // Prepare delete payload with action_flag
      const deletePayload = {
        action_flag: "DELETE",
        sfd_id: this.itemToDelete.id
      };
      
      //console.log('DELETE payload:', deletePayload);
      
      this.apiService.post(`srar/mark-srar-equipment/`, deletePayload).subscribe((res: any) => {
        this.toast.add({severity:'success', summary: 'Success', detail: 'Equipment Deleted Successfully'});
        //console.log(res);
        // Refresh data for the currently selected ship
        this.currentPageApi(0, 0, this.selectedShip?.id);
        this.showDeleteModal = false;
        this.itemToDelete = null;
      }, (error) => {
        this.toast.add({severity:'error', summary: 'Error', detail: 'Failed to delete equipment record'});
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
      
             // Prepare the payload with proper data transformation
       const payload = {
         ...this.sararMasterForm.value,
         // Convert active boolean to number
         active: this.sararMasterForm.value.active ? 1 : 0,
         // Include IDs in the payload
         equipment_id: this.sararMasterForm.value.equipment_id || null,
         ship_id: this.sararMasterForm.value.ship_id || null,
         location_id: this.sararMasterForm.value.location_id || null,
         // Ensure all required fields are included
         ship: this.sararMasterForm.value.ship || null,
         ship_name: this.sararMasterForm.value.ship_name || null,
         equipment_code: this.sararMasterForm.value.equipment_code || null,
         equipment_name: this.sararMasterForm.value.equipment_name || null,
         nomenclature: this.sararMasterForm.value.nomenclature || null,
         oem_part_number: this.sararMasterForm.value.oem_part_number || null,
         no_of_fits: this.sararMasterForm.value.no_of_fits || null,
         location_name: this.sararMasterForm.value.location_name || null,
         equipment_type: this.sararMasterForm.value.equipment_type || null
       };

    // Add extra fields only for UPDATE operations
    if (this.isEdit) {
      payload.action_flag = "UPDATE";
      payload.sfd_id = this.sararMasterForm.value.id; // Current record's ID being edited
      //console.log('UPDATE payload with extra fields:', payload);
    } else {
      //console.log('ADD payload:', payload);
    }

    if(this.isEdit){
      // Update existing record
      this.apiService.post(`srar/mark-srar-equipment/`, payload).subscribe((res: any) => {
        this.toast.add({severity:'success', summary: 'Success', detail: 'Equipment Updated Successfully'});
        //console.log(res);
        this.isEdit = false;
        // Refresh data for the currently selected ship
        this.currentPageApi(0, 0, this.selectedShip?.id);
        this.closeDialog();
      }, (error) => {
        this.toast.add({severity:'error', summary: 'Error', detail: 'Failed to update equipment record'});
        console.error('Update error:', error);
      });
    } else {
      // Create new record
      this.apiService.post('srar/mark-srar-equipment/', payload).subscribe((res: any) => {
        this.toast.add({severity:'success', summary: 'Success', detail: 'Equipment Added Successfully'});
        //console.log(res);
        // Refresh data for the currently selected ship
        this.currentPageApi(0, 0, this.selectedShip?.id);
        this.closeDialog();
      }, (error) => {
        this.toast.add({severity:'error', summary: 'Error', detail: 'Failed to add equipment record'});
        console.error('Create error:', error);
      });
    }
  }
  
     shipOptions: any[] = [];
   equipmentOptions: any[] = [];
   selectedShip: any;
onShipChange(): void {
  // Get ship ID from either the filter dropdown or the form
  const shipId = this.selectedShip?.id || this.sararMasterForm.value.ship;
  
  if (shipId) {
    // Fetch equipment options for the selected ship
    this.apiService.get(`sfd/sfd-details/?ship=${shipId}`).subscribe((res: any) => {
      const equipmentData = res.results || res;
      // Format equipment options to show "Equipment Code - Equipment Name" in dropdown
      this.equipmentOptions = equipmentData.map((equipment: any) => ({
        ...equipment,
        displayName: `${equipment.equipment_code} - ${equipment.equipment_name}`
      }));
      //console.log('Equipment options loaded:', this.equipmentOptions);
    });
    
    //console.log('Selected Ship:', shipId);
    
    // Find the selected ship object from the options array
    const selectedShip = this.shipOptions.find(ship => ship.id === shipId);
    if (selectedShip) {
      // Update form with ship details
      this.sararMasterForm.patchValue({
        ship: shipId,
        ship_name: selectedShip.name,
        ship_id: selectedShip.id
      });
      //console.log('Updated ship_name to:', selectedShip.name);
      //console.log('Updated ship_id to:', selectedShip.id);
    }
    
    // Load equipment data for the selected ship
    this.currentPageApi(0, 0, shipId);
  } else {
    // If no ship is selected, clear the table and equipment options
    this.tableData = [];
    this.equipmentOptions = [];
    //console.log('No ship selected - clearing table data');
    
    // Clear the form when no ship is selected
    this.clearForm();
  }
}

// Method to clear the form when ship selection changes
private clearForm(): void {
  this.sararMasterForm.patchValue({
    ship: '',
    ship_name: '',
    ship_id: '',
    equipment_code: '',
    equipment_name: '',
    equipment_id: '',
    nomenclature: '',
    oem_part_number: '',
    no_of_fits: '',
    location_name: '',
    location_id: '',
    equipment_type: '',
    active: true
  });
  
  // Re-enable all fields when clearing
  this.sararMasterForm.get('equipment_code')?.enable();
  this.sararMasterForm.get('nomenclature')?.enable();
  this.sararMasterForm.get('oem_part_number')?.enable();
  this.sararMasterForm.get('location_name')?.enable();
  this.sararMasterForm.get('equipment_type')?.enable();
}

// Method to clear ship selection (can be called from template if needed)
clearShipSelection(): void {
  this.selectedShip = null;
  this.tableData = [];
  this.equipmentOptions = [];
  this.clearForm();
  //console.log('Ship selection cleared');
}

  onEquipmentChange(event: any): void {
  //console.log('Equipment changed to:', event);
  if (event) {
    // Find the selected equipment object from the options array by equipment_name
    const selectedEquipment = this.equipmentOptions.find(equipment => equipment.equipment_name === event);
    if (selectedEquipment) {
             // Auto-fill all the required fields
       this.sararMasterForm.patchValue({
         equipment_name: selectedEquipment.equipment_name,
         equipment_code: selectedEquipment.equipment_code,
         equipment_id: selectedEquipment.equipment,
         nomenclature: selectedEquipment.nomenclature,
         oem_part_number: selectedEquipment.oem_part_number,
         location_name: selectedEquipment.location_name,
         location_id: selectedEquipment.location,
         equipment_type: selectedEquipment.type || ''
       });
      
     
      
      // Disable the auto-filled fields to make them read-only
      this.sararMasterForm.get('equipment_code')?.disable();
      this.sararMasterForm.get('nomenclature')?.disable();
      this.sararMasterForm.get('oem_part_number')?.disable();
      this.sararMasterForm.get('location_name')?.disable();
      this.sararMasterForm.get('equipment_type')?.disable();
    }
  } else {
    // Clear the fields if no equipment is selected
    this.sararMasterForm.patchValue({
      equipment_name: '',
      equipment_code: '',
      equipment_id: '',
      nomenclature: '',
      oem_part_number: '',
      location_name: '',
      location_id: '',
      equipment_type: ''
    });
    
    // Re-enable the fields when clearing
    this.sararMasterForm.get('equipment_code')?.enable();
    this.sararMasterForm.get('nomenclature')?.enable();
    this.sararMasterForm.get('oem_part_number')?.enable();
    this.sararMasterForm.get('location_name')?.enable();
    this.sararMasterForm.get('equipment_type')?.enable();
  }
}



 
}

