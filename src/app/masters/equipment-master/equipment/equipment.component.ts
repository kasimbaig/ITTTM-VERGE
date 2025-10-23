import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ApiService } from '../../../services/api.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AddFormComponent } from '../../../shared/components/add-form/add-form.component';
import { CommonModule, Location } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ToastService } from '../../../services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { ViewDetailsComponent } from '../../../shared/components/view-details/view-details.component';
import { DialogModule } from 'primeng/dialog'; // Import DialogModule for p-dialog
import { PanelModule } from 'primeng/panel'; // Import PanelModule for view details
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormFieldConfig } from '../../manufacturer-master/manufacturer-master.component';

@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    PaginatedTableComponent,
    TieredMenuModule,
    DialogModule,
    PanelModule,
    DropdownModule,
    InputNumberModule,
    ReactiveFormsModule,
    DeleteConfirmationModalComponent,
    ViewDetailsComponent,
    AddFormComponent
],
  templateUrl: './equipment.component.html',
  styleUrl: './equipment.component.css',
})
export class EquipmentComponent implements OnInit {
  searchText: string = '';
  departments: any = [];
  title: string = 'Add new Equipment';
  isFormOpen: boolean = false;
  viewdisplayModal: boolean = false;
  filteredSection: any[] = [];
  filteredTypes: any[] = [];
  filteredGroups: any[] = [];
  filteredCountries: any[] = [];
  filteredManufacturers: any[] = [];
  filteredSuppliers: any[] = [];
  isLoading: boolean = false;
  isViewFormOpen: boolean = false;
  isEdit = 'Add';
  // Add missing properties for edit functionality
  editTitle: string = 'Edit Equipment';
  isEditFormOpen: boolean = false;
  selectedDetails: any = {};
  
  // Add missing properties for table functionality
  filteredDepartments: any[] = [];

  // New properties for pagination
  apiUrl: string = 'master/equipments/';
  totalCount: number = 0;

  equipmentForm = new FormGroup({
    section: new FormControl('',[Validators.required]),
    group: new FormControl('',[Validators.required]),
    generic_code: new FormControl(''),
    type: new FormControl(''),
    code: new FormControl({value:'',disabled:true}),
    name: new FormControl('',[Validators.required]),
    model: new FormControl(''),
    maintop_number: new FormControl(''),
    acquaint_issued: new FormControl(''),
    authority: new FormControl(''),
    ilms_equipment_code: new FormControl(''),
    obsolete: new FormControl(false),
    total_fits: new FormControl(''),
    ship_applicable: new FormControl(''),
    manufacturer: new FormControl(''),
    country: new FormControl(''),
    supplier: new FormControl(''),
    active: new FormControl('')
  });

  toggleForm(open: boolean) {
    this.isFormOpen = open;
    this.isEdit = 'Add';
    this.equipmentForm.reset();
    this.equipmentForm.enable();
    
    // Reset selected details when opening for new equipment
    if (open) {
      this.selectedDetails = {};
    }
  }

  closeForm() {
    this.isFormOpen = false;
    this.isEdit = 'Add';
    this.equipmentForm.reset();
    this.selectedDetails = {};
  }

  constructor(private apiService: ApiService, private location: Location, private toastService: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchInitialDropdownData();
    // Note: Table data will be loaded by the paginated table component
    // No need to call getEquipments() here
  }
  goBack() {
    this.location.back();
  }
  fetchInitialDropdownData(): void {
    this.isLoading = true;
    forkJoin({
      eqType: this.apiService.get<any>('master/equipment-type/'),
      sections: this.apiService.get<any>('master/section/'),
      groups: this.apiService.get<any>('master/group/'),
      countries: this.apiService.get<any>('master/country/'),
      manufacturers: this.apiService.get<any>('master/manufacturers/'),
      suppliers: this.apiService.get<any>('master/supplier/'),
    }).subscribe({
      next: ({eqType, sections, groups, countries, manufacturers, suppliers }) => {
        this.filteredSection = sections.results|| sections 
        this.filteredTypes = eqType.results || eqType
        this.filteredGroups = groups.results || groups
        this.filteredCountries = (countries.results || countries).map((country: any) => ({
          value: country.id,
          label: country.name
        }));
        this.filteredManufacturers = manufacturers.results || manufacturers
        this.filteredSuppliers = suppliers.results || suppliers
        this.isLoading = false;
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error fetching initial data:', error);
        this.toastService.showError('Error fetching initial data');
      },
    });
  }

  // Add GET method for equipment data
  getEquipments(): void {
    this.isLoading = true;
    this.apiService
      .get<any>('master/equipment/')
      .subscribe({
        next: (response) => {
          // Handle paginated response structure
          if (response && response.results) {
            this.departments = response.results;
            this.filteredDepartments = [...this.departments];
          } else {
            // Fallback for non-paginated response
            this.departments = response;
            this.filteredDepartments = [...this.departments];
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching equipment:', error);
          this.isLoading = false;
          this.toastService.showError('Error fetching equipment data');
        },
      });
  }

  // Add search function for filtering equipment
  filterDepartments() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.departments = [...this.filteredDepartments]; // Reset to original list if search is empty
      return;
    }

    this.departments = this.filteredDepartments.filter(
      (dept: { name: string; code: string; equipment_name?: string; first_code?: string }) =>
        (dept.name && dept.name.toLowerCase().includes(search)) ||
        (dept.code && dept.code.toLowerCase().includes(search)) ||
        (dept.equipment_name && dept.equipment_name.toLowerCase().includes(search)) ||
        (dept.first_code && dept.first_code.toLowerCase().includes(search))
    );
  }


  exportOptions = [
    { label: 'Export as PDF', icon: 'pi pi-file-pdf', command: () => this.exportPDF() },
    { label: 'Export as Excel', icon: 'pi pi-file-excel', command: () => this.exportExcel() },
  ];
  cols = [
    { field: 'code', header: 'Code', filterType: 'text' },
    { field: 'name', header: 'Name', filterType: 'text' },
    { field: 'model', header: 'Model', filterType: 'text' },
    { field: 'manufacturer_name', header: 'Manufacture Name', filterType: 'text' },
    { field: 'country_name', header: 'Country Name', filterType: 'text' },
    { field: 'supplier_name', header: 'Supplier Name', filterType: 'text' },
    { field: 'group.name', header: 'Group name', filterType: 'text' },
    { field: 'type_name', header: 'Type', filterType: 'text' },
    { field: 'active', header: 'Active', filterType: 'text' }
  ];
  @ViewChild('dt') dt!: Table;
  value: number = 0;
  stateOptions: any[] = [
    { label: 'Equipment Specification', value: 'equipment' },
    { label: 'HID Equipment', value: 'hid' },
    { label: 'Generic Specification', value: 'generic' },
  ];
  tabvalue: string = 'equipment';
  @Output() exportCSVEvent = new EventEmitter<void>();
  @Output() exportPDFEvent = new EventEmitter<void>();
  exportPDF() {
    this.exportPDFEvent.emit();
    const doc = new jsPDF();
    autoTable(doc, {
      head: [this.cols.map((col) => col.header)],
      body: this.departments.map((row: { [x: string]: any }) =>
        this.cols.map((col) => row[col.field] || '')
      ),
    });
    doc.save(`${this.tableName || 'table'}.pdf`);
  }
  @Input() tableName: string = '';
  exportExcel() {
    this.exportCSVEvent.emit();
    const headers = this.cols.map((col) => col.header);
    const rows = this.departments.map((row: { [x: string]: any }) =>
      this.cols.map((col) => row[col.field] || '')
    );
    const csv = [
      headers.join(','),
      ...rows.map((row: any[]) => row.join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.tableName || 'table'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  view(event: any){
    this.selectedDetails = this.formatEquipmentDataForView(event);
    this.viewdisplayModal = true;
  }

  // Method to format equipment data for view details
  formatEquipmentDataForView(equipment: any): any {
    return {
      code: equipment.code || 'N/A',
      name: equipment.name || 'N/A',
      manufacturer: equipment.manufacturer?.name || equipment.manufacturer_name || 'N/A',
      supplier: equipment.supplier?.name || equipment.supplier_name || 'N/A',
      section: equipment.group?.section_name || equipment.section || 'N/A',
      group: equipment.group?.name || equipment.group || 'N/A',
      generic_code: equipment.generic_code || 'N/A',
      type: equipment.type?.name || equipment.type || 'N/A',
      model: equipment.model || 'N/A',
      maintop_number: equipment.maintop_number || 'N/A',
      acquaint_issued: equipment.acquaint_issued || 'N/A',
      authority: equipment.authority || 'N/A',
      ilms_equipment_code: equipment.ilms_equipment_code || 'N/A',
      obsolete: equipment.obsolete === 'Yes' || equipment.obsolete === true ? 'Yes' : 'No',
      total_fits: equipment.total_fits || 'N/A',
      ship_applicable: equipment.ship_applicable || 'N/A',
      country: equipment.country?.name || equipment.country_name || 'N/A',
    };
  }
  
  edit(event: any){
    this.isEdit = 'Edit';
    this.selectedDetails = { ...event };
    this.isFormOpen = true;
    
    // Fetch groups for the selected section
    if (event.group?.section) {
      this.apiService.get<any>('master/group/?is_dropdown=true&section='+event.group.section).subscribe((res:any)=>{
        this.filteredGroups = res;
      });
    }
    
    // Populate form with selected data - complete mapping
    const formData = {
      section: event.group?.section,
      group: event.group?.id,
      generic_code: event.generic_code || '',
      type: event.type?.id || event.type_id || event.type || '',
      code: event.code || '',
      name: event.name || '',
      model: event.model || '',
      maintop_number: event.maintop_number || '',
      acquaint_issued: event.acquaint_issued || '',
      authority: event.authority || '',
      ilms_equipment_code: event.ilms_equipment_code || '',
      obsolete: event.obsolete === 'Yes' || event.obsolete === true || false,
      total_fits: event.total_fits || '',
      ship_applicable: event.ship_applicable || '',
      manufacturer: event.manufacturer?.id || event.manufacturer_id || event.manufacturer || '',
      country: event.country?.id || event.country_id || event.country || '',
      supplier: event.supplier?.id || event.supplier_id || event.supplier || ''
    };
    
    // First reset the form to clear any previous values
    this.equipmentForm.reset();
    
    // Use setTimeout to ensure form is properly initialized before patching values
    setTimeout(() => {
      // Then patch the new values
      this.equipmentForm.patchValue(formData);
      
      // Enable the form for editing
      this.equipmentForm.enable();
      
      // Force change detection to ensure form updates
      this.cdr.detectChanges();
    }, 100);
  }
  
  showDeleteDialog: boolean = false;
  
  deleteRow(event: any){
    this.showDeleteDialog = true;
    this.selectedDetails = event;
  }
  
  confirmDeletion() {
    this.apiService
      .delete(`master/equipment/${this.selectedDetails.id}/`)
              .subscribe({
          next: (data: any) => {
            this.toastService.showSuccess('Equipment deleted successfully');
            this.getEquipments(); // Refresh the data
            this.showDeleteDialog = false;
          },
        error: (error) => {
          console.error('Error deleting equipment:', error);
          this.toastService.showError('Error deleting equipment');
        },
      });
  }

  cancelDeletion() {
    this.showDeleteDialog = false;
  }
  submit(){
    if (this.equipmentForm.valid) {
      this.isLoading = true;
      this.equipmentForm.get('active')?.setValue("1");
      const formData = this.equipmentForm.value;
      
      // Create API payload with proper types
      let apiPayload = {
        code:this.selectedDetails?.code || formData.code,
        ...formData,
        obsolete: formData.obsolete ? 'Yes' : 'No'
      };    
      if(this.isEdit === 'Add'){
        this.apiService
        .post('master/equipment/', apiPayload)
        .subscribe({
          next: (data: any) => {
            this.toastService.showSuccess('Equipment added successfully');
            this.getEquipments(); // Refresh the data
            this.closeForm(); // Close the form
            this.isLoading = false;
              },
          });
      }
      else{
        this.apiService
        .put(`master/equipment/${this.selectedDetails.id}/`, apiPayload)
        .subscribe({
          next: (data: any) => {
            //console.log('Equipment updated successfully:', data);
            this.toastService.showSuccess('Equipment updated successfully');
            this.getEquipments(); // Refresh the data
            this.closeForm(); // Close the form
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error updating equipment:', error);
            this.toastService.showError('Error updating equipment');
            this.isLoading = false;
          },
        });
      }
    }
    else{
      this.toastService.showError('Please fill all required fields');
    }
  }

  onSectionChange(event: any) {
    //console.log(event.value);
    // Clear group selection and equipment code when section changes
    this.equipmentForm.patchValue({
      group: '',
      code: '',
    });
    this.filteredGroups = [];
    
    if (event.value) {
      this.apiService.get<any>('master/group/?section=' + event.value+'&is_dropdown=true').subscribe((res: any) => {
        this.filteredGroups = res
        // this.setFieldOptions('group', this.filteredGroups);
      });
    }
  }

  onGroupChange(event: any) {
    //console.log('Group selected:', event.value);
    // Clear equipment code when group changes
    this.equipmentForm.patchValue({
      code: '',
    });
    
    if (event.value) {
      this.generateEquipmentCode(event.value);
    } else {
      // Group was cleared, reset equipment code fields
      this.equipmentForm.patchValue({
        code: ''
      });
    }
  }

  generateEquipmentCode(groupId: number) {
    this.isLoading = true;
    this.apiService.get<any>(`master/equipment-code/?group_id=${groupId}`).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const equipmentCode = res.data.equipment_code;
          //console.log('Generated equipment code:', equipmentCode);
          
          // Parse the equipment code and set it in the form fields
          this.setEquipmentCodeFields(equipmentCode);
          
          // Show success message
          this.toastService.showSuccess('Equipment code generated successfully');
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error generating equipment code:', error);
        this.toastService.showError('Error generating equipment code');
        this.isLoading = false;
      }
    });
  }

  setEquipmentCodeFields(equipmentCode: string) {
    // Split the equipment code into parts and set them in the form
    // Assuming the format is like "0005Group 09001" or similar
    // You may need to adjust this logic based on your actual equipment code format
    
    // For now, let's set the entire code in the first_code field
    // You can modify this logic based on your specific requirements
    this.equipmentForm.patchValue({
      code: equipmentCode
    });
  }

  // Handle data loaded from paginated table
  onDataLoaded(data: any[]): void {
    //console.log('🚢 Data loaded from paginated table:', data);
    //console.log('🚢 Data length:', data?.length);
    //console.log('🚢 Data type:', typeof data);
    //console.log('🚢 First record:', data?.[0]);
    
    this.departments = data || [];
    this.filteredDepartments = [...(data || [])];
    
    //console.log('🚢 Departments array updated:', this.departments);
    //console.log('🚢 Filtered departments updated:', this.filteredDepartments);
    
    // Force change detection
    this.cdr.detectChanges();
  }
  newManufacturer: any = {
    name: '',
    code: '',
    country: '',
    address: '',
    area: '',
    city: '',
    contact_person: '',
    contact_number: null,
    email: ''
  };
  manufacturerFormConfig = [
    { label: 'Manufacturer Name', key: 'name', type: 'text', required: true },
    { label: 'Manufacturer Code', key: 'code', type: 'text', required: true },
    { label: 'Country', key: 'country', type: 'select', options: [...this.filteredCountries], required: true },
    { label: 'Address', key: 'address', type: 'text', required: true, fullWidth: true },
    { label: 'Area Street', key: 'area', type: 'text', required: false },
    { label: 'City', key: 'city', type: 'text', required: true },
    { label: 'Contact Person', key: 'contact_person', type: 'text', required: false },
    { label: 'Contact Number', key: 'contact_number', type: 'number', required: false },
    { label: 'Email Id', key: 'email', type: 'text', required: true }
  ];

  isManufacturerFormOpen: boolean = false;
  addManufacturer(){
    this.manufacturerFormConfig.forEach((item:any)=>{
      if(item.key === 'country'){
        item.options = [...this.filteredCountries];
      }
    })
    setTimeout(()=>{
      this.isManufacturerFormOpen = true;
    },500)
  }
  handleSubmit(data: any): void {
    //console.log("data", data);
    this.apiService.post(`master/manufacturers/`, data).subscribe(res=>{
      this.apiService.get('master/manufacturers/?is_dropdown=true').subscribe((res:any)=>{
        this.filteredManufacturers = res.data;
        this.isManufacturerFormOpen = false;
      })
    });
  }

  formConfigForNewDetails = [
    { label: 'Code', key: 'code', type: 'text', required: true },
    { label: 'Name', key: 'name', type: 'text', required: true },
    { label: 'Address', key: 'address', type: 'text', required: true },
    { label: 'Area Street', key: 'area_street', type: 'text', required: true },
    { label: 'Country', key: 'country', type: 'select', options: [...this.filteredCountries], required: true },
    { label: 'City', key: 'city', type: 'text', required: true },
    { label: 'Manufacture Supplier', key: 'supplier_manufacture', type: 'text', required: true },
    { label: 'Contact Person', key: 'contact_person', type: 'text', required: true },
    { label: 'Country Code', key: 'country_code', type: 'text', required: true },
    { label: 'Contact Number', key: 'contact_number', type: 'number', required: true },
    { label: 'Email ID', key: 'email_id', type: 'text', required: true },
  ];

  // Form configuration for viewing equipment details
  equipmentViewConfig = [
    { label: 'Equipment Code', key: 'code', type: 'text' },
    { label: 'Equipment Name', key: 'name', type: 'text' },
    { label: 'Section', key: 'section', type: 'text' },
    { label: 'Group', key: 'group', type: 'text' },
    { label: 'Generic Code', key: 'generic_code', type: 'text' },
    { label: 'Type', key: 'type', type: 'text' },
    { label: 'Model', key: 'model', type: 'text' },
    { label: 'Maintop Number', key: 'maintop_number', type: 'text' },
    { label: 'Acquaint Issued', key: 'acquaint_issued', type: 'text' },
    { label: 'Authority', key: 'authority', type: 'text' },
    { label: 'ILMS Equipment Code', key: 'ilms_equipment_code', type: 'text' },
    { label: 'Obsolete', key: 'obsolete', type: 'text' },
    { label: 'Total Fits', key: 'total_fits', type: 'text' },
    { label: 'Ship Applicable', key: 'ship_applicable', type: 'text' },
    { label: 'Manufacturer', key: 'manufacturer', type: 'text' },
    { label: 'Country', key: 'country', type: 'text' },
    { label: 'Supplier', key: 'supplier', type: 'text' }
  ];
  newSupplier = {
    code: '',
    name: '',
    address: '',
    area_street: '',
    city: '',
    country: '',
    supplier_manufacture: '',
    contact_person: '',
    country_code: null,
    contact_number: '',
    email_id: '',
    active: 1,
  };
  isSupplierFormOpen: boolean = false;
  addSupplier(){
  
    setTimeout(()=>{
      this.isSupplierFormOpen = true;
    },500)
    this.formConfigForNewDetails.forEach((item:any)=>{
      if(item.key === 'country'){
        item.options = [...this.filteredCountries];
      }
    })
    
  }

  handleSupplierSubmit(data: any) {
   
    this.apiService.post(`master/supplier/`, data).subscribe(res=>{
      this.apiService.get<any>('master/supplier/?is_dropdown=true').subscribe(res=>{
        this.filteredSuppliers = res;
      })
    });
  }
}