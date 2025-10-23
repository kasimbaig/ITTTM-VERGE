import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-equipment-ship-details',
  standalone:false,
  templateUrl: './equipment-ship-details.component.html',
  styleUrl: './equipment-ship-details.component.css'
})
export class EquipmentShipDetailsComponent implements OnInit {
  isChecked: boolean = false;
  displayDialog: boolean = false;
  isMaximized: boolean = false;
  isEdit = 'Add';
  
  // Delete confirmation modal properties
  isDeleteConfirmationVisible: boolean = false;
  selectedEquipmentShip: any = null;
  
  // Form for equipment ship details
  sfdReferenceForm: FormGroup = new FormGroup({
    ship: new FormControl('',Validators.required),
    equipment_serial_number: new FormControl(''),
    supplier: new FormControl('',Validators.required),
    manufacturer: new FormControl('',Validators.required),
    location: new FormControl('',Validators.required),
    location_onboard: new FormControl('',Validators.required),
    installation_date: new FormControl(''),
    removal_date: new FormControl(''),
    oem_part_number: new FormControl(''),
    no_of_fits: new FormControl('',Validators.required),
    equipment: new FormControl(''),
    sfd_group: new FormControl(''),
    department: new FormControl(''),
    remarks: new FormControl(''),
  });
  
  // Dropdown options
  shipOptions: any[] = [];
  equipmentCodeNameOptions: any[] = [];
  locationOnBoardOptions: any[] = [];
  parentEquipmentOptions: any[] = [];
  subDepartmentOptions: any[] = [];
  manufacturerOptions: any[] = [];
  departmentOptions: any[] = [];
  // Table Columns Configuration - Updated to match API response
  tableColumns = [
    // { field: 'equipment_name', header: 'Equipment Name', type: 'text', sortable: true, filterable: true },
    // { field: 'equipment_code', header: 'Equipment Code', type: 'text', sortable: true, filterable: true },
    { field: 'ship_name', header: 'Ship Name', type: 'text', sortable: true, filterable: true },
    { field: 'location_code', header: 'Location Code', type: 'text', sortable: true, filterable: true },
    { field: 'location_name', header: 'Location On Board', type: 'text', sortable: true, filterable: true },
    { field: 'equipment_serial_number', header: 'Equipment serial No.', type: 'text', sortable: true, filterable: true },
    { field: 'no_of_fits', header: 'No. Of Fits', type: 'number', sortable: true, filterable: true },
    { field: 'active', header: 'Status', type: 'status', sortable: true, filterable: true },
  ];
  
  // Filter dropdown options
  sectionOptions= []
  groupOptions= []
  countryOptions= []
  supplierOptions= []
  // modelOptions= []
  equipmentOptions= []
  
  // Selected filter values
  selectedSection: any = '';
  selectedGroup: any = '';
  selectedCountry: any = '';
  selectedSupplier: any = '';
  // selectedModel: any = '';
  selectedEquipment: any = '';

  // Table Data - Will be populated from API response
  tableData: any[] = [];
option: any;
  
  constructor(private apiService: ApiService, private toast: MessageService) {}
  
  ngOnInit(): void {
    this.apiCall();
    // Don't load all data initially - wait for equipment selection
    //console.log('Equipment Ship Details Component initialized - waiting for equipment selection');
  }
  
  currentPageApi(page: number, pageSize: number){
    // Only load data if equipment is selected
    if (this.selectedEquipment) {
      this.loadTableData(this.selectedEquipment.id);
    }
  }

  apiCall(){
    // Only load independent dropdowns initially
    this.apiService.get('master/section/?is_dropdown=true').subscribe((res: any) => {
      this.sectionOptions = res.results || res;
    });
    // this.apiService.get('master/model/?is_dropdown=true').subscribe((res: any) => {
    //   this.modelOptions = res.results || res;
    // });
    this.apiService.get('master/country/?is_dropdown=true').subscribe((res: any) => {  
      this.countryOptions = res.results || res;
    });
    
    // Load other independent dropdowns for the form
    this.apiService.get('master/ship/?is_dropdown=true').subscribe((res: any) => {
      this.shipOptions = res.results || res;
    });
    this.apiService.get('master/locations/?is_dropdown=true').subscribe((res: any) => {
      this.locationOnBoardOptions = res.data;
    });
    this.apiService.get('master/equipment/?is_dropdown=true').subscribe((res: any) => {
      this.parentEquipmentOptions = res;
    });
    this.apiService.get('sfd/sfd-details/?is_dropdown=true').subscribe((res: any) => {
      this.subDepartmentOptions = res || res.results;
    });
    this.apiService.get('master/manufacturers/?is_dropdown=true').subscribe((res: any) => {
      this.manufacturerOptions = res.data || res;
    });
    this.apiService.get('master/department/?is_dropdown=true').subscribe((res: any) => {
      this.departmentOptions = res || res.results;
    });
  }

  // Open dialog for Add mode
  openDialog(): void {
    this.isEdit = 'Add';
    this.displayDialog = true;
    this.sfdReferenceForm.reset();
    this.sfdReferenceForm.enable();
  }

  // Close dialog and reset form
  closeDialog(): void {
    this.displayDialog = false;
    this.isEdit = 'Add';
    this.isDeleteConfirmationVisible = false;
    this.selectedEquipmentShip = null;
    this.sfdReferenceForm.reset();
  }

  // Save reference (Add/Edit)
  saveReference(): void {
    const data = this.sfdReferenceForm.value;
    // Format dates
    data.removal_date = data.removal_date ? this.apiService.formatDate(data.removal_date,'YYYY-MM-DD') : null;
    data.installation_date = data.installation_date ? this.apiService.formatDate(data.installation_date,'YYYY-MM-DD') : null;
    

    //console.log('Sending payload:', data);

    if (this.isEdit === 'Add') {
      // Add new record
      this.apiService.post('sfd/equipment-ship-details/', data).subscribe((res: any) => {
        this.toast.add({severity:'success', summary: 'Success', detail: 'Equipment Ship Details Added Successfully'});
        //console.log(res);
        // Refresh filtered data instead of all data
        if (this.selectedEquipment) {
          this.loadTableData(this.selectedEquipment.id);
        }
        this.closeDialog();
      });
    } else if (this.isEdit === 'Edit') {
      // Update existing record
      this.apiService.put(`sfd/equipment-ship-details/${this.selectedEquipmentShip.id}/`, data).subscribe((res: any) => {
        this.toast.add({severity:'success', summary: 'Success', detail: 'Equipment Ship Details Updated Successfully'});
        //console.log(res);
        // Refresh filtered data instead of all data
        if (this.selectedEquipment) {
          this.loadTableData(this.selectedEquipment.id);
        }
        this.closeDialog();
      });
    }
  }

  // View event handler - opens form in view mode
  onView(event: any) {
    this.isEdit = 'View';
    this.selectedEquipmentShip = event;
    
    const formData = {
      ...event,
      removal_date: event.removal_date ? new Date(event.removal_date) : null,
      installation_date: event.installation_date ? new Date(event.installation_date) : null
    };
    
    this.sfdReferenceForm.patchValue(formData);
    this.sfdReferenceForm.disable(); // Disable form for view mode
    this.displayDialog = true;
  }

  // Edit event handler - opens form in edit mode
  onEdit(event: any) {
    this.isEdit = 'Edit';
    this.selectedEquipmentShip = event;
    
    const formData = {
      ...event,
      department: event.department.id,
      location_onboard: event.location_name,
      removal_date: event.removal_date ? new Date(event.removal_date) : null,
      installation_date: event.installation_date ? new Date(event.installation_date) : null
    };
    
    this.sfdReferenceForm.patchValue(formData);
    this.sfdReferenceForm.enable(); // Enable form for edit mode
    this.displayDialog = true;
  }

  // Delete event handler
  onDelete(data: any): void {
    //console.log('Delete Equipment Ship Details:', data);
    this.selectedEquipmentShip = data;
    this.isDeleteConfirmationVisible = true;
  }

  // Confirm delete
  confirmDelete(): void {
    if (this.selectedEquipmentShip) {
      this.apiService.delete(`sfd/equipment-ship-details/${this.selectedEquipmentShip.id}/`).subscribe({
        next: () => {
          this.toast.add({severity:'success', summary: 'Success', detail: 'Equipment Ship Details Deleted Successfully'});
          // Refresh filtered data instead of all data
          if (this.selectedEquipment) {
            this.loadTableData(this.selectedEquipment.id);
          }
          this.isDeleteConfirmationVisible = false;
          this.selectedEquipmentShip = null;
        },
        error: (error) => {
          this.toast.add({severity:'error', summary: 'Error', detail: 'Failed to delete Equipment Ship Details record'});
          console.error('Delete error:', error);
          this.isDeleteConfirmationVisible = false;
          this.selectedEquipmentShip = null;
        }
      });
    }
  }

  // Cancel delete
  cancelDelete(): void {
    this.isDeleteConfirmationVisible = false;
    this.selectedEquipmentShip = null;
  }

  // Filter change handlers
  onSectionChange(): void {
    //console.log('Section changed to:', this.selectedSection);
    let sectionId = this.selectedSection.id;
    
    // Fetch groups for selected section
    this.apiService.get(`master/group/?section=${sectionId}`).subscribe((res: any) => {
      this.groupOptions = res.results || res;
      //console.log('Groups loaded for section:', this.groupOptions);
    });
    
    // Clear dependent dropdowns and table data when section changes
    this.selectedGroup = null;
    this.selectedEquipment = null;
    this.tableData = [];
  }

  onGroupChange(): void {
    //console.log('Group changed to:', this.selectedGroup);
    // Clear table data when group changes
    this.tableData = [];
    
    // Automatically load equipment if all required filters are selected
    if (this.selectedSection && this.selectedGroup && this.selectedCountry && this.selectedSupplier) {
      this.loadEquipmentData();
    }
  }   
  
  onCountryChange(): void {
    //console.log('Country changed to:', this.selectedCountry);
    let countryId = this.selectedCountry.id;
    
    // Fetch suppliers for selected country
    this.apiService.get(`master/supplier/?country=${countryId}`).subscribe((res: any) => {
      this.supplierOptions = res.results || res;
      //console.log('Suppliers loaded for country:', this.supplierOptions);
    });
    
    // Clear dependent dropdowns and table data when country changes
    this.selectedSupplier = null;
    this.selectedEquipment = null;
    this.tableData = [];
  }

  onSupplierChange(): void {
    //console.log('Supplier changed to:', this.selectedSupplier);
    // Clear table data when supplier changes
    this.tableData = [];
    
    // Automatically load equipment if all required filters are selected
    if (this.selectedSection && this.selectedGroup && this.selectedCountry && this.selectedSupplier) {
      this.loadEquipmentData();
    }
  } 
  
  // onModelChange(): void {
  //   //console.log('Model changed to:', this.selectedModel);
  //   // Clear table data when model changes
  //   this.tableData = [];
    
  //   // Automatically load equipment if all required filters are selected
  //   if (this.selectedSection && this.selectedGroup && this.selectedCountry && this.selectedSupplier && this.selectedModel) {
  //     this.loadEquipmentData();
  //   }
  // }
  
  onEquipmentChange(): void {
    //console.log('Equipment changed to:', this.selectedEquipment);
    // Automatically load table data when equipment is selected
    if (this.selectedEquipment) {
      this.loadTableData(this.selectedEquipment.id);
    }
  }

  // Load equipment data based on group ID and supplier ID
  loadEquipmentData() {
    let url = 'master/equipment/?';
    if (this.selectedGroup) {
      url += `group_id=${this.selectedGroup.id}&`;
    }
    if (this.selectedSupplier) {
      url += `supplier_id=${this.selectedSupplier.id}`;
    }

    this.apiService.get(url).subscribe((res: any) => {
      this.equipmentOptions = res.results || res;
      //console.log('Equipment loaded:', this.equipmentOptions);
    });
  }

  // Load table data for selected equipment
  loadTableData(equipmentId: number) {
    //console.log('Loading table data for Equipment ID:', equipmentId);
    
    this.apiService.get(`sfd/equipment-ship-details/?equipment=${equipmentId}`).subscribe((res: any) => {
      //console.log('API Response:', res);
      if (res.results && res.results.length > 0) {
        this.tableData = res.results;
        //console.log('Table data loaded:', this.tableData.length, 'records');
      } else {
        this.tableData = [];
        this.toast.add({
          severity: 'info',
          summary: 'No Data',
          detail: 'No data found for the selected equipment.'
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

  onLocationCodeChange(event: any): void {
   this.option = this.locationOnBoardOptions.find((option: any) => option.id === event.value);
   this.sfdReferenceForm.patchValue({
    location_onboard: this.option.name
   });
  }

  getName(data: any): string {
    return data.name || data.name;
  }
}
