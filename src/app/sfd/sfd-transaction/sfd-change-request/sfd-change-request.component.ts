import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-sfd-change-request',
  standalone:false,
  templateUrl: './sfd-change-request.component.html',
  styleUrl: './sfd-change-request.component.css'
})
export class SfdChangeRequestComponent implements OnInit {
  isChecked: boolean = false;
  displayDialog: boolean = false;
  isMaximized: boolean = false;
  isEdit: boolean = false;
  
  // Delete confirmation modal properties
  isDeleteConfirmationVisible: boolean = false;
  selectedChangeRequest: any = null;
  sfdReferenceForm: FormGroup = new FormGroup({
    equipment: new FormControl(null, Validators.required),
    model: new FormControl('', Validators.required),
    nomenclature: new FormControl('', Validators.required),
    equipment_serial_no: new FormControl('', Validators.required),
    oem_part_number: new FormControl(''),
    supplier: new FormControl(null),
    manufacturer: new FormControl(null),
    location_code: new FormControl(''),
    location_onboard: new FormControl('', Validators.required),
    installation_date: new FormControl(''),
    removal_date: new FormControl(''),
    no_of_fits: new FormControl(''),
    service_life: new FormControl(''),
    department: new FormControl(null, Validators.required),
    parent_equipment: new FormControl(null),
    authority_of_installation: new FormControl(''),
    removal_remarks: new FormControl(''),
    rh_in_installation: new FormControl(''),
    sub_department: new FormControl(''),
    equipment_specifications: new FormControl('', Validators.required),
    insma_remarks: new FormControl('', Validators.required),
    request_reason: new FormControl('', Validators.required),
  });
  shipOptions: any[] = [];
  equipmentOptions: any[] = [];
  locationOnBoardOptions: any[] = [];
  parentEquipmentOptions: any[] = [];
  subDepartmentOptions: any[] = [];
  manufacturerOptions: any[] = [];
  departmentOptions: any[] = [];

  // Table Columns Configuration
  tableColumns = [
    { field: 'ship_name', header: 'Ship Name', type: 'text', sortable: true, filterable: true },
    { field: 'equipment_name', header: 'Equipment Name', type: 'text', sortable: true, filterable: true },
    { field: 'location_code', header: 'Location Code', type: 'text', sortable: true, filterable: true },
    { field: 'location_on_board', header: 'Location On Board', type: 'text', sortable: true, filterable: true },
    { field: 'no_of_fits', header: 'No. Of Fits', type: 'number', sortable: true, filterable: true },
    { field: 'status', header: 'Active', type: 'text', sortable: true, filterable: true },
  ];
  

  // Dropdown Options
  unitTypeOptions= []
  groupOptions= []
  countryOptions= []
  supplierOptions= []
  modelOptions= []
  // Selected Values
  selectedUnitType: any = '';
  selectedShip: any = '';
  selectedCountry: any = '';
  selectedSupplier: any = '';
  selectedModel: any = '';
  selectedEquipment: any = '';

  // Table Data
  tableData: any[] = [];
  constructor(private apiService: ApiService, private toast: MessageService) {}
  ngOnInit(): void {
    this.apiCall();
    this.currentPageApi(0 ,0)
    //console.log('SFD Component initialized with', this.tableData.length, 'records');
  }
  currentPageApi(page: number, pageSize: number){
    // this.apiService.get(`sfd/sfd-change-requests/`).subscribe((res: any) => {
    //   this.tableData = res.results;
    // });
  }

  apiCall(){
    this.apiService.get('master/unit-type/?is_dropdown=true').subscribe((res: any) => {
      this.unitTypeOptions = res;
    });
    

    this.apiService.get('master/group/').subscribe((res: any) => {
      this.groupOptions = res.results;
    });
    this.apiService.get('master/country/').subscribe((res: any) => {  
      this.countryOptions = res.results;
    });
    // this.apiService.get('master/equipment/').subscribe((res: any) => {
    //   this.equipmentOptions = res.results;
    // });
    this.apiService.get('master/supplier/').subscribe((res: any) => {
      this.supplierOptions = res.results;
    });
   
    this.apiService.get('master/parent-equipment/').subscribe((res: any) => {
      this.parentEquipmentOptions = res.results;
    });
    this.apiService.get('master/sub-department/').subscribe((res: any) => {
      this.subDepartmentOptions = res.results;
    });
    this.apiService.get('master/manufacturers/').subscribe((res: any) => {
      this.manufacturerOptions = res.results;
    });
    this.apiService.get('master/department/').subscribe((res: any) => {
      this.departmentOptions = res.results;
    });
  }

  openDialog(): void {
    this.displayDialog = true;
    // Reset form to clean state
    this.sfdReferenceForm.reset();
    // Reset form validation state
    Object.keys(this.sfdReferenceForm.controls).forEach(key => {
      const control = this.sfdReferenceForm.get(key);
      control?.markAsUntouched();
      control?.markAsPristine();
    });
  }

  openAddDialog(): void {
    this.isEdit = false;
    this.displayDialog = true;
    // Reset form to clean state
    this.sfdReferenceForm.reset();
    // Reset form validation state
    Object.keys(this.sfdReferenceForm.controls).forEach(key => {
      const control = this.sfdReferenceForm.get(key);
      control?.markAsUntouched();
      control?.markAsPristine();
    });
  }

  closeDialog(): void {
    this.displayDialog = false;
    this.isDeleteConfirmationVisible = false;
    this.selectedChangeRequest = null;
    this.sfdReferenceForm.enable()
  }

  saveReference(): void {
    let formData = this.sfdReferenceForm.value;
    formData.installation_date = this.apiService.formatDate(formData.installation_date,'YYYY-MM-DD');
    formData.removal_date = this.apiService.formatDate(formData.removal_date,'YYYY-MM-DD');
    formData.sfd_details = this.selectEquipment.id;
    formData.equipment = this.selectEquipment.equipment;
    formData.ship = this.selectedShip.id;
    
    this.apiService.post('sfd/sfd-change-requests/', formData).subscribe((res: any) => {
      // this.toast.add({severity:'success', summary: 'Success', detail: 'SFD Change Request Saved Successfully'});
      this.currentPageApi(0, 0); // Refresh the table data
      this.displayDialog = false;
    });
  }

  // Event Handlers
  onView(data: any): void {
    this.onShipChange(data.ship)
    setTimeout(() => {
      this.onEquipmentChange({value:data.sfd_details})
      this.sfdReferenceForm.patchValue(data)
      this.sfdReferenceForm.get('equipment')?.setValue(data.sfd_details)
    }, 1000);
    //console.log('View SFD:', data);
    this.sfdReferenceForm.patchValue(data);
    this.openDialog();
    this.sfdReferenceForm.disable()
  }

  onEdit(data: any): void {
    this.onShipChange(data.ship)
    setTimeout(() => {
      this.onEquipmentChange({value:data.sfd_details})
      this.sfdReferenceForm.patchValue(data)
      this.sfdReferenceForm.get('equipment')?.setValue(data.sfd_details)
    }, 1000);
    //console.log('View SFD:', data);
    this.sfdReferenceForm.patchValue(data);
    this.openDialog();
    
  }

  onDelete(data: any): void {
    //console.log('Delete SFD Change Request:', data);
    this.selectedChangeRequest = data;
    this.isDeleteConfirmationVisible = true;
  }

  confirmDelete(): void {
    if (this.selectedChangeRequest) {
      this.apiService.delete(`sfd/sfd-change-requests/${this.selectedChangeRequest.id}/`).subscribe({
        next: () => {
          this.toast.add({severity:'success', summary: 'Success', detail: 'SFD Change Request Deleted Successfully'});
          this.currentPageApi(0, 0); // Refresh the table data
          this.isDeleteConfirmationVisible = false;
          this.selectedChangeRequest = null;
        },
        error: (error) => {
          this.toast.add({severity:'error', summary: 'Error', detail: 'Failed to delete SFD Change Request record'});
          console.error('Delete error:', error);
          this.isDeleteConfirmationVisible = false;
          this.selectedChangeRequest = null;
        }
      });
    }
  }

  cancelDelete(): void {
    this.isDeleteConfirmationVisible = false;
    this.selectedChangeRequest = null;
  }

  onUnitTypeChange(): void {
      
    this.apiService.get('master/ship/?is_dropdown=true&unit_type='+this.selectedUnitType.id).subscribe((res: any) => {
      this.shipOptions = res;
    });
    
  }
  onShipChange(id:any): void {
   //console.log('Ship changed to:', id);
      this.apiService.get('sfd/sfd-details/?ship='+id).subscribe((res: any) => {
        this.equipmentOptions = res.results;
      });
      this.apiService.get('sfd/sfd-change-requests/?ship='+id).subscribe((res: any) => {
        this.tableData = res.results;
      });
      
    
  }
  showCommentDialog=false
  commentText: string = '';
  approveReference(event: any): void {

    this.selectEquipment=event
    this.showCommentDialog=true
    //console.log('Approve Reference:', this.sfdReferenceForm.value);
    // Implement approve logic
  }

  rejectReference(event: any): void {
    this.selectEquipment=event
    this.showCommentDialog=true
    // Implement reject logic
  }

  saveComment(status: number): void {
    const process=localStorage.getItem('user_process')
    const payload={
      "ship": this.selectedShip.id,
      "process": process,
      "sub_module": 2,
      "status": status,
      "message": this.commentText,
      "items": this.selectedItems.map((item:any)=> {return {id:item.id}})
    }
    this.apiService.post('config/approval/',payload).subscribe(res=>{
      this.showCommentDialog=false
      this.commentText=''
      this.selectedItems=[]
      this.onShipChange( this.selectedShip.id);

    })
    //console.log('Save Comment:', this.commentText);
    // Implement save comment logic
  }


selectEquipment:any
  onEquipmentChange(event: any): void {
    this.selectEquipment = this.equipmentOptions.find((item: any) => item.id === event.value);
    //console.log('Equipment changed to:', this.selectEquipment, this.equipmentOptions, event);
    this.sfdReferenceForm.patchValue({
      model: this.selectEquipment.equipment_details.model,
      nomenclature: this.selectEquipment.nomenclature,
      equipment_serial_no: this.selectEquipment.equipment_serial_no,
      oem_part_number: this.selectEquipment.oem_part_number,
      supplier: this.selectEquipment.supplier,
      manufacturer: this.selectEquipment.equipment_details.manufacturer,
      location_code: this.selectEquipment.location_code,
      location_onboard: this.selectEquipment.location_name,
      installation_date: this.selectEquipment.installation_date,
      removal_date: this.selectEquipment.removal_date,
      no_of_fits: this.selectEquipment.no_of_fits,
      service_life: this.selectEquipment.service_life,
      department: this.selectEquipment.department,
      parent_equipment: this.selectEquipment.parent_equipment,
      authority_of_installation: this.selectEquipment.authority_of_installation,
      equipment_specifications: this.selectEquipment.equipment_specifications,
      insma_remarks: this.selectEquipment.insma_remarks,
      request_reason: this.selectEquipment.request_reason,
      
    });
    // Implement equipment change logic
  }

  user_role=localStorage.getItem('user_role')
  
  selectedItems:any[]=[]
  onSelection(event: any): void {
    //console.log('Selection:', event);
    this.selectedItems=event
   
  }
}
