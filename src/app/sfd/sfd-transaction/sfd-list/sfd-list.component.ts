  import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { MessageService } from 'primeng/api';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-sfd-list',
  standalone:false,
  templateUrl: './sfd-list.component.html',
  styleUrl: './sfd-list.component.css'
})
export class SfdListComponent implements OnInit {
  isChecked: boolean = false;
  displayDialog: boolean = false;
  isMaximized: boolean = false;
  isFormOpen: boolean = false;
  
  // Delete confirmation modal properties
  isDeleteConfirmationVisible: boolean = false;
  selectedSfd: any = null;
  
  // View details modal properties
  viewDisplayModal: boolean = false;
  
  // Form configuration for view details
  viewFormConfig = [
    // { label: 'Ship Name', key: 'ship_name', type: 'text' },
    { label: 'Equipment Name', key: 'equipment_name', type: 'text' },
    { label: 'Equipment Code', key: 'equipment_code', type: 'text' },
    { label: 'Location Name', key: 'location_name', type: 'text' },
    { label: 'Location Code', key: 'location_code', type: 'text' },
    { label: 'Nomenclature', key: 'nomenclature', type: 'text' },
    // { label: 'Model', key: 'model', type: 'text' },
    // { label: 'OEM Part Number', key: 'oem_part_number', type: 'text' },
    // { label: 'Manufacturer', key: 'manufacturer_name', type: 'text' },
    // { label: 'Supplier', key: 'supplier_name', type: 'text' },
    // { label: 'Installation Date', key: 'installation_date', type: 'text' },
    // { label: 'Removal Date', key: 'removal_date', type: 'text' },
    // { label: 'Service Life', key: 'service_life', type: 'text' },
    { label: 'No Of Fits', key: 'no_of_fits', type: 'text' },
    { label: 'Maintop Number', key: 'maintop_number', type: 'text' },
    { label: 'Active', key: 'active', type: 'status' },
    // { label: 'Department', key: 'department_name', type: 'text' },
    // { label: 'Parent Equipment', key: 'parent_equipment_name', type: 'text' },
    // { label: 'Sub Department', key: 'sub_department_name', type: 'text' },
    // { label: 'Authority Of Installation', key: 'authority_of_installation', type: 'text' },
    // { label: 'Authority Of Removal', key: 'authority_of_removal', type: 'text' },
    // { label: 'Included In DL', key: 'included_in_dl', type: 'text' },
    // { label: 'Installation Remarks', key: 'installation_remarks', type: 'textarea' },
    // { label: 'Removal Remarks', key: 'removal_remarks', type: 'textarea' }
  ];

// 

  sfdReferenceForm: FormGroup = new FormGroup({
    id: new FormControl(''),
    ship: new FormControl(''),
    equipment: new FormControl(''),
    model: new FormControl({value:'',disabled:true}),
    nomenclature: new FormControl(''),
    oem_part_number: new FormControl(''),
    manufacturer: new FormControl({value:'',disabled:true}),
    supplier: new FormControl({value:'',disabled:true}),
    location_code: new FormControl({value:'',disabled:true}),
    location: new FormControl(''),
    installation_date: new FormControl(''),
    removal_date: new FormControl(''),
    service_life: new FormControl(''),
    no_of_fits: new FormControl(''),
    department: new FormControl(''),
    parent_equipment: new FormControl(''),
    sub_department: new FormControl(''),
    installation_remarks: new FormControl(''),
    authority_of_installation: new FormControl(''),
    authority_of_removal: new FormControl(''),
    removal_remarks: new FormControl(''),
    included_in_dl: new FormControl(true)
  });
  equipmentOptions: any[] = [];
  supplierOptions: any[] = [];
  locationOnBoardOptions: any[] = [];
  
  subDepartmentOptions: any[] = [];
  manufacturerOptions: any[] = [];

  // Table Columns Configuration
  tableColumns = [
    { field: 'ship_name', header: 'Ship Name', type: 'text', sortable: true, filterable: true },
    { field: 'equipment_code', header: 'Equipment Code', type: 'text', sortable: true, filterable: true },
    { field: 'equipment_name', header: 'Equipment Name', type: 'text', sortable: true, filterable: true },
    { field: 'location_name', header: 'Location Name', type: 'text', sortable: true, filterable: true },
    { field: 'location_code', header: 'Location Code', type: 'text', sortable: true, filterable: true },
    { field: 'nomenclature', header: 'Nomenclature', type: 'text', sortable: true, filterable: true },
    { field: 'no_of_fits', header: 'No. Of Fits', type: 'number', sortable: true, filterable: true },
    { field: 'active', header: 'Status', type: 'status', sortable: true, filterable: true },
  ];
  

  // Dropdown Options
  unitOptions= []

  shipOptions= []

  departmentOptions= []

  // Selected Values
  selectedUnit: any = '';
  selectedShip: any = '';
  selectedDepartment: any = '';

  // Table Data
  tableData: any[] = [];
  
  constructor(private apiService: ApiService, private toast: MessageService) {}
  ngOnInit(): void {
    this.apiCall();
    // Don't load all data initially - wait for filters
    //console.log('SFD Component initialized - waiting for filter selection');
  }
  
  currentPageApi(page: number, pageSize: number){
    // Only load data if both unit and ship are selected
    if (this.selectedUnit && this.selectedShip) {
      this.loadTableData(this.selectedUnit.id, this.selectedShip.id, this.selectedDepartment?.id);
    }
  }

  apiCall(){
    // Only load unit types initially - ships will be loaded when unit is selected
    this.apiService.get('master/unit-type/').subscribe((res: any) => {
      this.unitOptions = res.results;
    });
    
    // Load other independent dropdowns
    this.apiService.get('master/department/?is_dropdown=true').subscribe((res: any) => {
      this.departmentOptions = res.results || res;
    });
    this.apiService.get('master/supplier/?is_dropdown=true').subscribe((res: any) => {
      this.supplierOptions = res.results || res;
    });
    this.apiService.get('master/locations/?is_dropdown=true').subscribe((res: any) => {
      this.locationOnBoardOptions = res.data || res;
    });
    // Equipment will be loaded when ship is selected - removed from here
    
    this.apiService.get('master/sub-department/?is_dropdown=true').subscribe((res: any) => {
      this.subDepartmentOptions = res.results || res;
    });
    this.apiService.get('master/manufacturers/?is_dropdown=true').subscribe((res: any) => {
      this.manufacturerOptions = res.data || res;
    });
  }

  openDialog(): void {
    this.displayDialog = true;
    this.isEdit=false;
    this.sfdReferenceForm.reset();
    
    // Auto-fill the ship field with the currently selected ship from the outside filters
    if (this.selectedShip) {
      this.sfdReferenceForm.patchValue({
        ship: this.selectedShip.id,
        included_in_dl: true
      });
      
      // Load equipment options for the selected ship
      this.loadEquipmentOptions(this.selectedShip.id);
    } else {
      this.sfdReferenceForm.patchValue({
        included_in_dl: true
      });
    }
    
  }

  closeDialog(): void {
    this.displayDialog = false;
    this.isDeleteConfirmationVisible = false;
    this.selectedSfd = null;
    this.isFormOpen = false;
    this.viewDisplayModal = false;
    this.sfdReferenceForm.reset();
  }

  saveReference(): void {
    this.sfdReferenceForm.enable()
    //console.log('Form values:', this.sfdReferenceForm.value);
    
    // Prepare the payload with proper data transformation
    const payload = {
      ...this.sfdReferenceForm.value,
      removal_date: this.sfdReferenceForm.value.removal_date,
      installation_date: this.sfdReferenceForm.value.installation_date,
      // Ensure all required fields are included with proper values
      ship: this.sfdReferenceForm.value.ship || null,
      equipment: this.sfdReferenceForm.value.equipment || null,
      department: this.sfdReferenceForm.value.department || null,
      supplier: this.sfdReferenceForm.value.supplier || null,
      parent_equipment: this.sfdReferenceForm.value.parent_equipment || null,
      // Replace location_onboard with location
      location: this.sfdReferenceForm.value.location || null,
      // Ensure service_life is included
      service_life: this.sfdReferenceForm.value.service_life || null,
      no_of_fits: this.sfdReferenceForm.value.no_of_fits || null,
    };

    //console.log('Form values:', this.sfdReferenceForm.value);
    //console.log('Sending payload:', payload);

    if(this.isEdit){
      this.apiService.put(`sfd/sfd-details/${this.sfdReferenceForm.value.id}/`, payload).subscribe((res: any) => {
        // this.toast.add({severity:'success', summary: 'Success', detail: 'SFD Updated Successfully'});
        //console.log(res);
        this.isEdit=false;
        // Refresh filtered data instead of all data
        if (this.selectedUnit && this.selectedShip) {
          this.loadTableData(this.selectedUnit.id, this.selectedShip.id, this.selectedDepartment?.id);
        }
      }, (error) => {
        this.toast.add({severity:'error', summary: 'Error', detail: 'Failed to update SFD record'});
        console.error('Update error:', error);
      });
    }else{
      this.apiService.post('sfd/sfd-details/', payload).subscribe((res: any) => {
        // this.toast.add({severity:'success', summary: 'Success', detail: 'SFD Added Successfully'});
        //console.log(res);
        // Refresh filtered data instead of all data
        if (this.selectedUnit && this.selectedShip) {
          this.loadTableData(this.selectedUnit.id, this.selectedShip.id, this.selectedDepartment?.id);
        }
      }, (error) => {
        this.toast.add({severity:'error', summary: 'Error', detail: 'Failed to add SFD record'});
        console.error('Create error:', error);
      });
    }
   
    this.closeDialog();
  }

  // Event Handlers
  onView(event : any) {
    //console.log('View SFD:', event);
    
    // Transform the data to match the viewFormConfig field names
    const transformedData = {
      ...event,
      // Map API response fields to view display fields
      ship_name: event.ship_name || event.ship?.name || 'N/A',
      equipment_code: event.equipment_code || event.equipment?.code || 'N/A',
      equipment_name: event.equipment_name || event.equipment?.name || 'N/A',
      location_name: event.location_name || event.location?.name || 'N/A',
      location_code: event.location_code || event.location?.code || 'N/A',
      nomenclature: event.nomenclature || 'N/A',
      model: event.model || 'N/A',
      oem_part_number: event.oem_part_number || 'N/A',
      manufacturer_name: event.manufacturer_name || event.manufacturer?.name || 'N/A',
      supplier_name: event.supplier_name || event.supplier?.name || 'N/A',
      installation_date: event.installation_date ? new Date(event.installation_date).toLocaleDateString() : 'N/A',
      removal_date: event.removal_date ? new Date(event.removal_date).toLocaleDateString() : 'N/A',
      service_life: event.service_life || 'N/A',
      no_of_fits: event.no_of_fits || 'N/A',
      department_name: event.department_name || event.department?.name || 'N/A',
      parent_equipment_name: event.parent_equipment_name || event.parent_equipment?.name || 'N/A',
      sub_department_name: event.sub_department_name || event.sub_department?.name || 'N/A',
      authority_of_installation: event.authority_of_installation || 'N/A',
      authority_of_removal: event.authority_of_removal || 'N/A',
      included_in_dl: event.included_in_dl ? 'Yes' : 'No',
      installation_remarks: event.installation_remarks || 'N/A',
      removal_remarks: event.removal_remarks || 'N/A'
    };
    
    this.selectedSfd = transformedData;
    this.viewDisplayModal = true;
  }
isEdit: boolean = false;
  onEdit(data: any): void {
    //console.log('Edit SFD:', data);
    this.isEdit = true;
    // Create a copy of data with properly formatted dates
    const formData = {
      ...data,
      manufacturer: data.equipment_details.manufacturer,
      department: data.equipment_details.department,
      supplier: data.equipment_details.supplier,
      model: data.equipment_details.model || '',
      removal_date: data.removal_date,
      installation_date: data.installation_date 
    };

    this.sfdReferenceForm.patchValue(formData);
    this.displayDialog = true;

    // Implement edit logic
  }



  onDelete(data: any): void {
    //console.log('Delete SFD:', data);
    this.selectedSfd = data; // Assign data to selectedSfd
    this.isDeleteConfirmationVisible = true; // Set visibility to true
  }

  confirmDelete(): void {
    if (this.selectedSfd) {
      this.apiService.delete(`sfd/sfd-details/${this.selectedSfd.id}/`).subscribe((res: any) => {
        this.toast.add({severity:'success', summary: 'Success', detail: 'SFD Deleted Successfully'});
        //console.log(res);
        // Refresh filtered data instead of all data
        if (this.selectedUnit && this.selectedShip) {
          this.loadTableData(this.selectedUnit.id, this.selectedShip.id, this.selectedDepartment?.id);
        }
        this.isDeleteConfirmationVisible = false;
        this.selectedSfd = null;
      }, (error) => {
        this.toast.add({severity:'error', summary: 'Error', detail: 'Failed to delete SFD record'});
        console.error('Delete error:', error);
        this.isDeleteConfirmationVisible = false;
        this.selectedSfd = null;
      });
    }
  }

  cancelDelete(): void {
    this.isDeleteConfirmationVisible = false;
    this.selectedSfd = null;
  }

  // Filter Methods
  onUnitChange(): void {
    //console.log('Unit changed to:', this.selectedUnit);
    let id = this.selectedUnit.id;
    //console.log("idCheck", id);
    
    // Fetch ships for selected unit
    this.apiService.get(`master/ship/?unit_type=${id}`).subscribe((res: any) => {
      this.shipOptions = res.results;
      //console.log("response is ", res);
      //console.log("shipOption data", this.shipOptions);
    });
    
    // Clear ship selection and table data when unit changes
    this.selectedShip = null;
    this.selectedDepartment = null;
    this.tableData = [];
  }

  onShipChange(): void {
    //console.log('Ship changed to:', this.selectedShip);
    // Clear table data when ship changes
    this.tableData = [];
    
    // Load equipment options for the selected ship
    if (this.selectedShip) {
      this.loadEquipmentOptions(this.selectedShip.id);
    }
    
    // Automatically load data if both unit and ship are selected
    if (this.selectedUnit && this.selectedShip) {
      //console.log('Both unit and ship selected, loading data...');
      this.loadTableData(this.selectedUnit.id, this.selectedShip.id, this.selectedDepartment?.id);
    }
  }

  onDepartmentChange(): void {
    // Only load data if both unit and ship are selected
    if (this.selectedUnit && this.selectedShip) {
      this.loadTableData(this.selectedUnit.id, this.selectedShip.id, this.selectedDepartment?.id);
    }
  }

  onSearch(): void {
    // Only show data when both unit and ship are selected
    if (this.selectedUnit && this.selectedShip) {
      this.loadTableData(this.selectedUnit.id, this.selectedShip.id, this.selectedDepartment?.id);
    } else {
      this.tableData = []; // Clear table if filters not selected
      // Show message to user
      this.toast.add({
        severity: 'info',
        summary: 'Selection Required',
        detail: 'Please select both Unit Type and Ship to view data.'
      });
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
        //console.log('Table data loaded:', this.tableData.length, 'records');
      } else {
        this.tableData = [];
        this.toast.add({
          severity: 'info',
          summary: 'No Data',
          detail: 'No data found for the selected filters.'
        });
      }
    }, (error) => {
      console.error('Error loading data:', error);
      this.tableData = [];
      this.toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load data. Please try again.'
      });
    });
  }

  onLocationOnBoardChange(event: any): void {
    //console.log('Location On Board changed to:', event);
    if (event) {
      // Find the selected location object from the options array
      const selectedLocation = this.locationOnBoardOptions.find(location => location.id === event);
      if (selectedLocation && selectedLocation.code) {
        this.sfdReferenceForm.patchValue({
          location_code: selectedLocation.code
        });
      }
    }
  }

  onEquipmentChange(event: any): void {
   const eqp = this.equipmentOptions.find((equipment: any) => equipment.id === event);
   //console.log(eqp);
   this.sfdReferenceForm.patchValue({
    model: eqp.model,
    manufacturer: eqp.manufacturer,
    supplier: eqp.supplier,
    // Removed department auto-fill - user must manually select department
    
   });
  }

  // Load equipment options based on selected ship
  loadEquipmentOptions(shipId: number): void {
    this.apiService.get(`master/equipment/?is_dropdown=true&ship=${shipId}`).subscribe((res: any) => {
      this.equipmentOptions = res.results || res;
    }, (error) => {
      console.error('Error loading equipment options:', error);
      this.equipmentOptions = [];
    });
  }
}