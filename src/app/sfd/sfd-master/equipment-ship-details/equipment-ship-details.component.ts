import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { DropdownModule } from 'primeng/dropdown';
import { AddFormComponent } from '../../../shared/components/add-form/add-form.component';
import { forkJoin } from 'rxjs';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../services/toast.service';
import { Card } from '../../../interfaces/interfaces';
import { ExportService } from '../../../services/export.service';
import { filterData } from '../../../shared/utils/filter-helper';
import { resetFilterCards } from '../../../shared/utils/filter-helper';
import { DialogModule } from 'primeng/dialog';
import { SidebarModule } from 'primeng/sidebar';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { ViewDetailsComponent } from '../../../shared/components/view-details/view-details.component';

export interface Ship {
  id: number;
  name: string;
  type: string;
  commissionDate: Date;
  decommissionDate?: Date;
  className: string;
  opsAuthority: string;
  endurance: number; // in nm
  speed?: number; // in knots
  remarks?: string;
  status?: string; // Added for filter purposes
  // You might want to add more fields from your ER diagram as needed,
  // e.g., ShipCode, Flag, Length, Breadth, Draft, etc.
  // For simplicity, I've kept only the fields present in your provided form/table.
}
@Component({
  selector: 'app-equipment-ship-details',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    SidebarModule,
    CommonModule,
    TieredMenuModule,
    DialogModule,
    ReactiveFormsModule,
    DropdownModule,
    PaginatedTableComponent,
    AddFormComponent
  ],
  templateUrl: './equipment-ship-details.component.html',
  styleUrl: './equipment-ship-details.component.css',
})
export class EquipmentShipDetailsComponent {
  viewSidebarVisible = false;
  viewedShip: Ship | null = null;

  // Dummy Data for Ships
  ships: Ship[] = [
    {
      id: 1,
      name: 'INS Vikrant',
      type: 'Carrier',
      commissionDate: new Date('2013-08-15'),
      decommissionDate: undefined,
      className: 'Alpha Class',
      opsAuthority: 'East',
      endurance: 7500,
      speed: 28,
      remarks: 'India\'s first indigenous aircraft carrier.',
      status: 'Active'
    },
    {
      id: 2,
      name: 'INS Kolkata',
      type: 'Destroyer',
      commissionDate: new Date('2014-08-16'),
      decommissionDate: undefined,
      className: 'Bravo Class',
      opsAuthority: 'West',
      endurance: 6000,
      speed: 32,
      remarks: 'Lead ship of the Kolkata-class stealth guided-missile destroyers.',
      status: 'Active'
    },
    {
      id: 3,
      name: 'INS Chennai',
      type: 'Destroyer',
      commissionDate: new Date('2016-11-21'),
      decommissionDate: undefined,
      className: 'Bravo Class',
      opsAuthority: 'East',
      endurance: 6200,
      speed: 30,
      remarks: 'Third ship of the Kolkata-class destroyers.',
      status: 'Active'
    },
    {
      id: 4,
      name: 'INS Rajput',
      type: 'Destroyer',
      commissionDate: new Date('1980-05-04'),
      decommissionDate: new Date('2021-05-21'),
      className: 'Rajput Class',
      opsAuthority: 'West',
      endurance: 4500,
      speed: 35,
      remarks: 'Decommissioned in 2021.',
      status: 'Decommissioned'
    },
    {
      id: 5,
      name: 'INS Kalvari',
      type: 'Submarine',
      commissionDate: new Date('2017-12-14'),
      decommissionDate: undefined,
      className: 'Kalvari Class',
      opsAuthority: 'East',
      endurance: 12000,
      speed: 20,
      remarks: 'First Scorpene-class submarine.',
      status: 'Active'
    }
  ];

  filteredShips: Ship[] = [];
  filters: { name: string | null; type: string | null; status: string | null } = {
    name: null,
    type: null,
    status: null,
  };

  shipTypes: { label: string; value: string }[] = [
    { label: 'Carrier', value: 'Carrier' },
    { label: 'Destroyer', value: 'Destroyer' },
    { label: 'Submarine', value: 'Submarine' },
    { label: 'Frigate', value: 'Frigate' },
    { label: 'Corvette', value: 'Corvette' },
  ];

  statuses: { label: string; value: string }[] = [
    { label: 'Active', value: 'Active' },
    { label: 'Decommissioned', value: 'Decommissioned' },
    { label: 'Under Repair', value: 'Under Repair' },
  ];

  classes: { label: string; value: string }[] = [
    { label: 'Alpha Class', value: 'Alpha Class' },
    { label: 'Bravo Class', value: 'Bravo Class' },
    { label: 'Kalvari Class', value: 'Kalvari Class' },
    { label: 'Rajput Class', value: 'Rajput Class' },
    // Add more classes as per your M_Class table
  ];

  opsAuthorities: { label: string; value: string }[] = [
    { label: 'East', value: 'East' },
    { label: 'West', value: 'West' },
    { label: 'North', value: 'North' },
    { label: 'South', value: 'South' },
  ];

  shipDialog: boolean = false;
  selectedShip: Ship | null = null;
  shipForm!: FormGroup; // Use definite assignment assertion as it's initialized in ngOnInit

  // Form configuration for the reusable AddFormComponent
  shipFormConfig = [
    {
      key: 'name',
      label: 'Ship Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., INS Vikramaditya'
    },
    {
      key: 'type',
      label: 'Ship Type',
      type: 'select',
      required: true,
      placeholder: 'Select Type',
      options: this.shipTypes
    },
    {
      key: 'commissionDate',
      label: 'Commission Date',
      type: 'date',
      required: true,
      placeholder: 'Commission Date'
    },
    {
      key: 'decommissionDate',
      label: 'Decommission Date',
      type: 'date',
      required: false,
      placeholder: 'Decommission Date'
    },
    {
      key: 'length',
      label: 'Length (m)',
      type: 'number',
      required: false,
      placeholder: 'Length (m)'
    },
    {
      key: 'breadth',
      label: 'Breadth (m)',
      type: 'number',
      required: false,
      placeholder: 'Breadth (m)'
    },
    {
      key: 'draft',
      label: 'Draft (m)',
      type: 'number',
      required: false,
      placeholder: 'Draft (m)'
    },
    {
      key: 'classId',
      label: 'Ship Class',
      type: 'select',
      required: true,
      placeholder: 'Select Class',
      options: this.classes
    },
    {
      key: 'opsAuthority',
      label: 'Ops Authority',
      type: 'select',
      required: true,
      placeholder: 'Ops Authority',
      options: this.opsAuthorities
    },
    {
      key: 'endurance',
      label: 'Endurance (nm)',
      type: 'number',
      required: true,
      placeholder: 'Endurance (nm)'
    },
    {
      key: 'speed',
      label: 'Max Speed (knots)',
      type: 'number',
      required: false,
      placeholder: 'Max Speed (knots)'
    },
    {
      key: 'remarks',
      label: 'Remarks',
      type: 'textarea',
      required: false,
      placeholder: 'Remarks',
      fullWidth: true
    }
  ];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.filteredShips = [...this.ships]; // Initialize with all ships
    this.initForm();
  }

  // Initialize the reactive form
  initForm(): void {
    this.shipForm = this.fb.group({
      id: [null], // Hidden field for ID, handled automatically on save
      name: ['', Validators.required],
      type: ['', Validators.required],
      commissionDate: [null, Validators.required],
      decommissionDate: [null],
      length: [null, Validators.min(0)], // Add length, breadth, draft based on ER diagram
      breadth: [null, Validators.min(0)],
      draft: [null, Validators.min(0)],
      classId: ['', Validators.required], // This maps to className for simplicity here
      opsAuthority: ['', Validators.required],
      endurance: [null, [Validators.required, Validators.min(0)]],
      speed: [null, Validators.min(0)],
      remarks: [''],
    });
  }

  // Reset filter values and show all ships
  resetFilters(): void {
    this.filters = { name: null, type: null, status: null };
    this.filteredShips = [...this.ships];
  }

  // Apply filters to the ship list
  searchShips(): void {
    this.filteredShips = this.ships.filter(ship => {
      const nameMatch = this.filters.name ?
        ship.name.toLowerCase().includes(this.filters.name.toLowerCase()) : true;
      const typeMatch = this.filters.type ?
        ship.type === this.filters.type : true;
      const statusMatch = this.filters.status ?
        ship.status === this.filters.status : true;
      return nameMatch && typeMatch && statusMatch;
    });
  }

  // Open the add new ship dialog
  openNew(): void {
    this.selectedShip = null;
    this.shipForm.reset(); // Reset form for new entry
    this.shipDialog = true;
  }

  // Edit an existing ship
  editShip(ship: Ship): void {
    this.selectedShip = { ...ship }; // Create a copy to avoid direct mutation
    this.shipForm.patchValue({
      id: this.selectedShip.id,
      name: this.selectedShip.name,
      type: this.selectedShip.type,
      commissionDate: this.selectedShip.commissionDate ? new Date(this.selectedShip.commissionDate) : null,
      decommissionDate: this.selectedShip.decommissionDate ? new Date(this.selectedShip.decommissionDate) : null,
      // You would need to add length, breadth, draft if you add them to the Ship interface and form
      classId: this.selectedShip.className, // Map className to classId for dropdown
      opsAuthority: this.selectedShip.opsAuthority,
      endurance: this.selectedShip.endurance,
      speed: this.selectedShip.speed,
      remarks: this.selectedShip.remarks,
    });
    this.shipDialog = true;
  }

  viewDetails(ship: Ship): void {
    this.viewedShip = ship;
    this.viewSidebarVisible = true;
  }

  // Delete a ship
  deleteShip(ship: Ship): void {
    if (confirm(`Are you sure you want to delete ${ship.name}?`)) {
      const index = this.ships.findIndex(s => s.id === ship.id);
      if (index !== -1) {
        this.ships.splice(index, 1);
        this.filteredShips = [...this.ships]; // Refresh filtered list
        //console.log('Ship deleted:', ship.name);
      }
    }
  }

  // Save or update a ship - Updated to work with AddFormComponent
  saveShip(formData: any): void {
    const shipToSave: Ship = {
      ...formData,
      // Ensure date objects are correctly formatted if sending to API
      commissionDate: formData.commissionDate ? new Date(formData.commissionDate) : null,
      decommissionDate: formData.decommissionDate ? new Date(formData.decommissionDate) : null,
      className: formData.classId, // Map classId back to className for the table display
    };

    if (this.selectedShip && shipToSave.id) {
      // Update existing ship
      const index = this.ships.findIndex(s => s.id === shipToSave.id);
      if (index !== -1) {
        this.ships[index] = shipToSave;
        //console.log('Ship updated:', shipToSave);
      }
    } else {
      // Add new ship
      shipToSave.id = this.generateNewId(); // Generate a unique ID
      shipToSave.status = 'Active'; // Default status for new ships
      this.ships.push(shipToSave);
      //console.log('New ship added:', shipToSave);
    }

    this.filteredShips = [...this.ships]; // Refresh filtered list
    this.shipDialog = false; // Close the dialog
    this.selectedShip = null; // Clear selected ship
  }

  // Simple ID generator (replace with backend ID generation in a real app)
  private generateNewId(): number {
    return this.ships.length > 0 ? Math.max(...this.ships.map(s => s.id)) + 1 : 1;
  }

  // Columns configuration for the reusable table
  cols = [
    { field: 'name', header: 'Ship Name' },
    { field: 'type', header: 'Type' },
    { field: 'commissionDate', header: 'Commission Date', type: 'date' },
    { field: 'className', header: 'Class' },
    { field: 'opsAuthority', header: 'Ops Authority' },
    { field: 'endurance', header: 'Endurance', type: 'number', suffix: ' nm' },
  ];

  // Export options
  exportOptions = [
    {
      label: 'Export as PDF',
      icon: 'pi pi-file-pdf',
      command: () => this.exportPDF(),
    },
    {
      label: 'Export as Excel',
      icon: 'pi pi-file-excel',
      command: () => this.exportExcel(),
    },
  ];

  // Export methods
  exportPDF() {
    //console.log('Exporting ships as PDF...');
    // PDF export logic can be implemented here
  }

  exportExcel() {
    //console.log('Exporting ships as Excel...');
    // Excel export logic can be implemented here
  }
}