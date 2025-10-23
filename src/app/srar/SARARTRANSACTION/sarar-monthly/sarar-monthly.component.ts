import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-sarar-monthly',
  standalone: false,
  templateUrl: './sarar-monthly.component.html',
  styleUrl: './sarar-monthly.component.css'
})
export class SararMonthlyComponent implements OnInit {
  displayDialog: boolean = false;
  isMaximized: boolean = false;
  sararMasterForm: FormGroup = new FormGroup({
    month: new FormControl(''),
    year: new FormControl(''),
    unit_type: new FormControl(''),
    ship_name: new FormControl(''),
    status: new FormControl(''),
  });

  monthOptions: any[] = [
    {name: 'Jan', value: 1},
    {name: 'Feb', value: 2},
    {name: 'Mar', value: 3},
    {name: 'Apr', value: 4},
    {name: 'May', value: 5},
    {name: 'Jun', value: 6},
    {name: 'Jul', value: 7},
    {name: 'Aug', value: 8},
    {name: 'Sep', value: 9},
    {name: 'Oct', value: 10},
    {name: 'Nov', value: 11},
    {name: 'Dec', value: 12},
  ];

  yearOptions: any[] = [
    {name: '2025', value: 2025},
    {name: '2024', value: 2024},
    {name: '2023', value: 2023},
    {name: '2022', value: 2022},
    {name: '2021', value: 2021},
    {name: '2020', value: 2020},
    {name: '2019', value: 2019},
  ];

  // Table Columns Configuration
  tableColumns = [
    { field: 'ship_name', header: 'Ship Name', type: 'text', sortable: true, filterable: true },
    { field: 'srar_month', header: 'Month', type: 'text', sortable: true, filterable: true },
    { field: 'srar_year', header: 'Year', type: 'number', sortable: true, filterable: true },
  ];

  // Table Data
  tableData: any[] = [];

  constructor(private apiService: ApiService, private toast: MessageService) {}

  ngOnInit(): void {
    // Initialize with empty table data
    this.tableData = [];
    // Load only units at start
    this.loadUnitTypes();
  }

  currentPageApi(page: number, pageSize: number) {
    // Only load data if both unit and ship are selected
    if (this.selectedUnit && this.selectedShip) {
      this.loadTableData(this.selectedUnit.id, this.selectedShip.id);
    }
  }

  loadUnitTypes() {
    this.apiService.get('master/unit-type?is_dropdown=True').subscribe((res: any) => {
      this.unitOptions = res.data || res.results || res;
    });
  }

  // When unit changes → fetch related ships and clear table
  onUnitChange(): void {
    let unit = this.selectedUnit || this.sararMasterForm.get('unit_type')?.value;
    if (unit) {
      this.apiService.get(`master/ship/?is_dropdown=True&unit_type=${unit.id}`).subscribe((res: any) => {
        this.shipOptions = res.data || res.results || res;
      });
    } else {
      this.shipOptions = [];
    }
    this.sararMasterForm.get('unit_type')?.setValue(unit);

    // Clear ship selection and table data when unit changes
    this.selectedShip = null;
    this.tableData = [];
  }

  crudName = 'Add';

  openDialog(): void {
    this.displayDialog = true;
  }

  closeDialog(): void {
    this.displayDialog = false;
    this.sararMasterForm.reset();
    this.sararMasterForm.enable();
    this.crudName = 'Add';
  }

  // Event Handlers
  onView(data: any): void {
    this.crudName = 'View';
    this.sararMasterForm.patchValue(data);
    this.sararMasterForm.get('status')?.setValue(data.status == 1 ? true : false);
    this.sararMasterForm.disable();
    this.openDialog();
    // Implement view logic
  }

  isEdit: boolean = false;

  onEdit(data: any): void {
    this.isEdit = true;
    this.crudName = 'Edit';
    this.sararMasterForm.get('status')?.setValue(data.status === 1 ? true : false);
    this.sararMasterForm.patchValue({
      month: this.monthOptions.find((month: any) => month.name === data.srar_month),
      year: this.yearOptions.find((year: any) => year.value === data.srar_year),
      ship_name: this.shipOptions.find((ship: any) => ship.id === data.ship_id),
      status: data.status === 1 ? true : false,
    });
    let rowData = this.sararMasterForm.value;
    rowData.id = data.id;
    this.apiService.setData(rowData);

    this.openDialog();
    // Implement edit logic
  }

  onDelete(data: any): void {
    //console.log('Delete SFD:', data);
    // Implement delete logic
  }

  save() {
    //console.log(this.sararMasterForm.value);
  }

  shipOptions: any[] = [];
  selectedShip: any;

  onShipChange(): void {
    //console.log('Selected Ship:', this.selectedShip);
    // Clear table data when ship changes
    this.tableData = [];
    
    // Automatically load data if both unit and ship are selected
    if (this.selectedUnit && this.selectedShip) {
      //console.log('Both unit and ship selected, loading data...');
      this.loadTableData(this.selectedUnit.id, this.selectedShip.id);
    }
  }

  unitOptions: any[] = [];
  selectedUnit: any;

  onPrint(data: any): void {
    //console.log('Print:', data);
  }

  onSearch(): void {
    // Only show data when both unit and ship are selected
    if (this.selectedUnit && this.selectedShip) {
      this.loadTableData(this.selectedUnit.id, this.selectedShip.id);
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

  // Load table data for selected Unit + Ship
  loadTableData(unitId: number, shipId: number) {
    //console.log('Loading table data for Unit ID:', unitId, 'Ship ID:', shipId);
    
    this.apiService
      .get(`srar/srar-monthly-headers/?ship=${shipId}`)
      .subscribe((res: any) => {
        //console.log('API Response:', res);
        if (res.results && res.results.length > 0) {
          this.tableData = res.results.map((item: any) => ({
            ship_name: item.ship_name,
            srar_month: this.monthOptions.find((m: any) => m.value === item.srar_month)?.name,
            srar_year: item.srar_year,
            id: item.id,
            ship_id: item.ship,
          }));
          //console.log('Table data loaded:', this.tableData);
        } else {
          this.tableData = [];
          this.toast.add({
            severity: 'info',
            summary: 'No Data',
            detail: 'No data found for the selected Unit Type and Ship combination.'
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

  openFullScreenSararMonthly: boolean = false;

  submit() {
    this.openFullScreenSararMonthly = true;
    this.apiService.setData(this.sararMasterForm.value);
    //console.log(this.sararMasterForm.value);
  }
}