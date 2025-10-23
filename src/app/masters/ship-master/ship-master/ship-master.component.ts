import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnInit,
  OnDestroy,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TieredMenuModule } from 'primeng/tieredmenu';

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';

import { ToastService } from '../../../services/toast.service';
import { ViewDetailsComponent } from '../../../shared/components/view-details/view-details.component';
import { AddFormComponent } from '../../../shared/components/add-form/add-form.component';

import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';

// Import models
// Note: If Option is a global type, it might be in a different shared location,
// but for now, assuming it's imported with Ship or its own file as specified.
import { Option, Ship } from '../ship.model';

// Import services
import { ShipService } from '../ship.service';
import { ShipCategoryService } from '../ship-services/ship-category.service';
import { SfdHierarchyService } from '../ship-services/sfd-hierarchy.service';
import { ClassMasterService } from '../ship-services/class-master.service';
import { CommandService } from '../ship-services/command.service';
import { OpsAuthorityService } from '../ship-services/ops-authority.service';
import { OverseeingTeamService } from '../ship-services/overseeing-team.service';
import { PropulsionService } from '../ship-services/propulsion.service';
import { ApiService } from '../../../services/api.service';


@Component({
  selector: 'app-ship-master',
  standalone: true,
        imports: [
    TableModule,
    ViewDetailsComponent,
    AddFormComponent,
    ButtonModule,
    InputTextModule,
  FormsModule,
  TieredMenuModule,
  PaginatedTableComponent,
  CommonModule,
  DialogModule,
  ToastComponent,
  DeleteConfirmationModalComponent,
],
  templateUrl: './ship-master.component.html',
  styleUrl: './ship-master.component.css',
})

export class ShipMasterComponent implements OnInit, OnDestroy {
  searchText: string = '';
  ships: Ship[] = [];
  filteredShips: Ship[] = [];
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  showDeleteDialog: boolean = false;
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  isViewDetailsOpen: boolean = false;
  viewDetialsTitle: string = 'Ship Details';
  title: string = 'Add Ship';
  editTitle: string = 'Edit Ship';

  initialShipFormData: {
    id?: number;
    sr_no: string; code: string; name: string; unit_type: number | null;
    ship_category: number | null; sfd_hierarchy: number | null; class_master: number | null;
    class_code: string; commission_date: string;
    command: number | null; authority: number | null;
    ops_code: string; ship_builder: string; decommission_date: string; displacement: string;
    hours_underway: number; distance_run: number; decommission_scheduled_date: string;
    propulsion: number | null; sdrsref: string; yard_no: string; reference_no: string;
    classification_society: string; length_overall: string; length_perpen: string;
    module_breath: string; wetted_under_water: string; depth_main: string;
    standard_disp: string; full_load_disp: string; stand_draft: string;
    full_load_draft: string; wetted_boot_top: string; engine_rating: string;
    max_cont_speed: string; eco_speed: string; endurance: string; remark: string;
    refit_authority: string; signal_name: string; address: string; contact_number: string;
    nud_email_id: string; nic_email_id: string;
    overseeing_team: number | null; active: boolean;
  } = {
      sr_no: '', code: '', name: '', unit_type:null,
      ship_category: null, sfd_hierarchy: null, class_master: null,
      class_code: '', commission_date: '',
      command: null, authority: null,
      ops_code: '', ship_builder: '', decommission_date: '', displacement: '',
      hours_underway: 0, distance_run: 0, decommission_scheduled_date: '',
      propulsion: null, sdrsref: '', yard_no: '', reference_no: '',
      classification_society: '', length_overall: '', length_perpen: '',
      module_breath: '', wetted_under_water: '', depth_main: '',
      standard_disp: '', full_load_disp: '', stand_draft: '',
      full_load_draft: '', wetted_boot_top: '', engine_rating: '',
      max_cont_speed: '', eco_speed: '', endurance: '', remark: '',
      refit_authority: '', signal_name: '', address: '', contact_number: '',
      nud_email_id: '', nic_email_id: '',
      overseeing_team: null, active: true,
    };

  newShip: typeof this.initialShipFormData = { ...this.initialShipFormData };
  selectedShip: typeof this.initialShipFormData = { ...this.initialShipFormData };

  // Form configuration for the reusable AddFormComponent - Perfectly Balanced Two-Column Layout
  shipFormConfig: any[] = [
    // LEFT COLUMN - Exactly 21 fields (Half of total)
    { key: 'sr_no', label: 'Sr. No.', type: 'text', required: true, placeholder: 'Enter serial number' },
    { key: 'code', label: 'Code', type: 'text', required: true, placeholder: 'Enter ship code' },
    { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Enter ship name' },
    { key: 'unit_type', label: 'Unit Type', type: 'select', options: [] as Option[], required: true, placeholder: 'Select unit type' },
    { key: 'ship_category', label: 'Ship Category', type: 'select', options: [] as Option[], required: true, placeholder: 'Select category' },
    // { key: 'sfd_hierarchy', label: 'SFD Hierarchy', type: 'select', options: [] as Option[], required: true, placeholder: 'Select SFD hierarchy' },
    { key: 'class_master', label: 'Class Master', type: 'select', options: [] as Option[], required: true, placeholder: 'Select class' },
    // { key: 'class_code', label: 'Class Code', type: 'text', required: true, placeholder: 'Enter class code' },
    { key: 'commission_date', label: 'Commission Date', type: 'date', required: true, placeholder: 'Select commission date' },
    { key: 'command', label: 'Command', type: 'select', options: [] as Option[], required: true, placeholder: 'Select command' },
    { key: 'authority', label: 'Authority', type: 'select', options: [] as Option[], required: true, placeholder: 'Select authority' },
    // { key: 'ops_code', label: 'OPS Code', type: 'text', required: true, placeholder: 'Enter OPS code' },
    { key: 'ship_builder', label: 'Ship Builder', type: 'text', required: true, placeholder: 'Enter shipbuilder name' },
    { key: 'decommission_date', label: 'Decommission Date', type: 'date', required: true, placeholder: 'Select decommission date' },
    { key: 'displacement', label: 'Displacement', type: 'text', required: false, placeholder: 'Enter displacement' },
    { key: 'hours_underway', label: 'Hours Underway', type: 'number', required: false, placeholder: 'Enter hours underway' },
    { key: 'distance_run', label: 'Distance Run', type: 'number', required: false, placeholder: 'Enter distance run' },
    { key: 'decommission_scheduled_date', label: 'Decommission Scheduled Date', type: 'date', required: true, placeholder: 'Select scheduled decommission date' },
    { key: 'propulsion', label: 'Propulsion', type: 'select', options: [] as Option[], required: false, placeholder: 'Select propulsion type' },
    { key: 'sdrsref', label: 'SDRS Ref', type: 'text', required: false, placeholder: 'Enter SDRS reference' },
    { key: 'yard_no', label: 'Yard No.', type: 'text', required: false, placeholder: 'Enter yard number' },
    { key: 'reference_no', label: 'Reference No.', type: 'text', required: false, placeholder: 'Enter reference number' },
    { key: 'classification_society', label: 'Classification Society', type: 'text', required: false, placeholder: 'Enter classification society' },
    
    // RIGHT COLUMN - Exactly 21 fields (Half of total)
    { key: 'length_overall', label: 'Length Overall', type: 'text', required: false, placeholder: 'Enter length overall' },
    { key: 'length_perpen', label: 'Length Perpendicular', type: 'text', required: false, placeholder: 'Enter perpendicular length' },
    { key: 'module_breath', label: 'Module Breath', type: 'text', required: false, placeholder: 'Enter module breadth' },
    { key: 'wetted_under_water', label: 'Wetted Under Water', type: 'text', required: false, placeholder: 'Enter wetted area' },
    { key: 'depth_main', label: 'Depth Main', type: 'text', required: false, placeholder: 'Enter main depth' },
    { key: 'standard_disp', label: 'Standard Displacement', type: 'text', required: false, placeholder: 'Enter standard displacement' },
    { key: 'full_load_disp', label: 'Full Load Displacement', type: 'text', required: false, placeholder: 'Enter full load displacement' },
    { key: 'stand_draft', label: 'Standard Draft', type: 'text', required: false, placeholder: 'Enter standard draft' },
    { key: 'full_load_draft', label: 'Full Load Draft', type: 'text', required: false, placeholder: 'Enter full load draft' },
    { key: 'wetted_boot_top', label: 'Wetted Boot Top', type: 'text', required: false, placeholder: 'Enter wetted boot top' },
    { key: 'engine_rating', label: 'Engine Rating', type: 'text', required: false, placeholder: 'Enter engine rating' },
    { key: 'max_cont_speed', label: 'Max Continuous Speed', type: 'text', required: false, placeholder: 'Enter max continuous speed' },
    { key: 'eco_speed', label: 'Eco Speed', type: 'text', required: false, placeholder: 'Enter eco speed' },
    { key: 'endurance', label: 'Endurance', type: 'text', required: false, placeholder: 'Enter endurance' },
    { key: 'refit_authority', label: 'Refit Authority', type: 'text', required: false, placeholder: 'Enter refit authority' },
    { key: 'signal_name', label: 'Signal Name', type: 'text', required: false, placeholder: 'Enter signal name' },
    { key: 'contact_number', label: 'Contact Number', type: 'text', required: false, placeholder: 'Enter contact number' },
    { key: 'nud_email_id', label: 'NUD Email ID', type: 'email', required: false, placeholder: 'Enter NUD email ID' },
    { key: 'nic_email_id', label: 'NIC Email ID', type: 'email', required: false, placeholder: 'Enter NIC email ID' },
    { key: 'overseeing_team', label: 'Overseeing Team', type: 'select', options: [] as Option[], required: false, placeholder: 'Select overseeing team' },
    { key: 'active', label: 'Active', type: 'checkbox', required: false },
    
    // FULL WIDTH FIELDS (span both columns)
    { key: 'remark', label: 'Remark', type: 'text', required: false, placeholder: 'Enter remarks', fullWidth: true },
    { key: 'address', label: 'Address', type: 'text', required: false, placeholder: 'Enter address', fullWidth: true }
  ];

  // Keep this as any[] as per the strict constraint
  detailsForViewComponent: any[] = [];
  private subscriptions: Subscription = new Subscription();
  unitOptions: any;
  toggleTable=true

  constructor(
    private toastService: ToastService,
    private location: Location,
    private shipService: ShipService,
    private shipCategoryService: ShipCategoryService,
    private sfdHierarchyService: SfdHierarchyService,
    private classMasterService: ClassMasterService,
    private commandService: CommandService,
    private opsAuthorityService: OpsAuthorityService,
    private overseeingTeamService: OverseeingTeamService,
    private propulsionService: PropulsionService,
    private unitTypeService : ShipCategoryService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    //console.log('🚢 Ship Master Component Initializing...');
    //console.log('API URL:', this.apiUrl);
    //console.log('Total Count:', this.totalCount);
    //console.log('Enable URL Fetching: true');
    
    this.loadAllMasterDataAndOptions();
    // this.apiCall();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  goBack(): void {
    this.location.back();
  }

  loadAllMasterDataAndOptions(): void {
    // Note: Ships data will be loaded by the paginated table component
    // No need to subscribe to ships data here

    // Subscribe to lookup options and set them in formConfig
    this.subscriptions.add(
      this.shipCategoryService.getCategoryOptions().subscribe(options => {
        this.setFieldOptions('ship_category', options);
      })
    );
    this.subscriptions.add(
      this.sfdHierarchyService.getSfdHierarchyOptions().subscribe(options => {
        this.setFieldOptions('sfd_hierarchy', options);
      })
    );
    this.subscriptions.add(
      this.classMasterService.getClassOptions().subscribe(options => {
        this.setFieldOptions('class_master', options);
      })
    );
    this.subscriptions.add(
      this.commandService.getCommandOptions().subscribe(options => {
        this.setFieldOptions('command', options);
      })
    );
    this.subscriptions.add(
      this.opsAuthorityService.getAuthorityOptions().subscribe(options => {
        this.setFieldOptions('authority', options);
      })
    );
    this.subscriptions.add(
      this.overseeingTeamService.getOverseeingTeamOptions().subscribe(options => {
        this.setFieldOptions('overseeing_team', options);
      })
    );
    this.subscriptions.add(
      this.propulsionService.getPropulsionOptions().subscribe(options => {
        this.setFieldOptions('propulsion', options);
      })
    );
    
     this.subscriptions.add(
      this.unitTypeService.getUnitTypeOptions().subscribe(options => {
        this.setFieldOptions('unit_type', options);
      })
    );

    this.unitTypeService.loadAllUnitTypesData();
    // this.shipService.loadAllShipsData();
    this.shipCategoryService.loadAllCategoriesData();
    this.sfdHierarchyService.loadAllSfdHierarchiesData();
    this.classMasterService.loadAllClassesData();
    this.commandService.loadAllCommandsData();
    this.opsAuthorityService.loadAllAuthoritiesData();
    this.overseeingTeamService.loadAllOverseeingTeamsData();
    this.propulsionService.loadAllPropulsionData();
  }

  private setFieldOptions(key: string, options: Option[]): void {
    const field = this.shipFormConfig.find((f) => f.key === key);
    if (field) {
      field.options = options;
    }
  }

  // Handle data loaded from paginated table
  onDataLoaded(data: any[]): void {
    //console.log('🚢 Data loaded from paginated table:', data);
    //console.log('🚢 Data length:', data?.length);
    //console.log('🚢 Data type:', typeof data);
    //console.log('🚢 First record:', data?.[0]);
    
    this.ships = data || [];
    this.filteredShips = [...(data || [])];
    
    //console.log('🚢 Ships array updated:', this.ships);
    //console.log('🚢 Filtered ships updated:', this.filteredShips);
    
    // Force change detection
    this.cdr.detectChanges();
  }

 

  filterShips(): void {
    const search = this.searchText.toLowerCase().trim();
    this.ships = search
      ? this.filteredShips.filter(
        (ship: Ship) =>
          ship.name.toLowerCase().includes(search) ||
          ship.code.toLowerCase().includes(search) ||
          (ship.ship_builder && ship.ship_builder.toLowerCase().includes(search))
      )
      : [...this.filteredShips];
  }



  closeDialog(): void {
    this.isFormOpen = false;
    this.isEditFormOpen = false;
    this.viewdisplayModal = false;
    this.showDeleteDialog = false;
    this.editdisplayModal = false;
    this.isViewDetailsOpen = false;
    this.selectedShip = { ...this.initialShipFormData };
  }

  openAddShip(): void {
    this.isFormOpen = true;
    this.isEditFormOpen = false;
    this.newShip = { ...this.initialShipFormData };
  }

  handleSubmit(data: typeof this.initialShipFormData): void {
    //console.log("data", data);

      const updatedData = { ...data, active: data.active ? 1 : 2 };
    this.subscriptions.add(
      this.shipService.addShip(updatedData as Ship).subscribe({
        next: (res) => {
          this.toggleTable=false
          setTimeout(() => {
            this.toggleTable=true
          }, 100);
          this.toastService.showSuccess('Ship added successfully');
          // this.shipService.loadAllShipsData();
          this.closeDialog();
        },
        error: (error) => {
          console.error('Add ship failed:', error);
          this.toastService.showError(error.error?.message || 'Failed to add ship.');
        },
      })
    );
  }

  editDetails(details: Ship, open: boolean): void {
    this.selectedShip = {
      ...this.initialShipFormData,
      ...(details as Partial<typeof this.initialShipFormData>),
      id: details.id,
      ship_category: this.getForeignKeyId(details.ship_category),
      sfd_hierarchy: this.getForeignKeyId(details.sfd_hierarchy),
      class_master: this.getForeignKeyId(details.class_master),
      command: this.getForeignKeyId(details.command),
      authority: this.getForeignKeyId(details.authority),
      overseeing_team: this.getForeignKeyId(details.overseeing_team),
      propulsion: this.getForeignKeyId(details.propulsion),
      active: details.active === 1,
    };
    
    this.isEditFormOpen = open;
    this.isFormOpen = false;
    this.editdisplayModal = open;
  }

  handleEditSubmit(data: typeof this.initialShipFormData): void {
    const updatedData = { ...data, active: data.active ? 1 : 2 };
    //console.log("data", updatedData);
    if (!this.selectedShip.id) {
      this.toastService.showError('Ship ID is missing for update.');
      this.closeDialog();
      return;
    }

    // const payload: Partial<Ship> = {
    //   ...data as Partial<Ship>,
    //   id: this.selectedShip.id,
    //   active: data.active ? 1 : 0,
    //   ship_category: this.getForeignKeyId(data.ship_category) as any,
    //   sfd_hierarchy: this.getForeignKeyId(data.sfd_hierarchy) as any,
    //   class_master: this.getForeignKeyId(data.class_master) as any,
    //   command: this.getForeignKeyId(data.command) as any,
    //   authority: this.getForeignKeyId(data.authority) as any,
    //   overseeing_team: this.getForeignKeyId(data.overseeing_team) as any,
    //   propulsion: this.getForeignKeyId(data.propulsion) as any,
    // };

    this.subscriptions.add(
      this.shipService.updateShip(this.selectedShip.id!,updatedData).subscribe({
        next: (updated) => {
          this.toggleTable=false
          setTimeout(() => {
            this.toggleTable=true
          }, 100);
          this.toastService.showSuccess('Ship updated successfully');
          // this.shipService.loadAllShipsData();
          this.closeDialog();
        },
        error: (error) => {
          console.error('Update ship failed:', error);
          this.toastService.showError(error.error?.message || 'Failed to update ship.');
        },
      })
    );
  }

  private getForeignKeyId(value: any): number | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return value;
    if (typeof value === 'object' && value !== null && 'id' in value) {
      return (value as { id: number }).id;
    }
    return null;
  }



  deleteShipDetails(ship: Ship): void {
    this.showDeleteDialog = true;
    this.selectedShip = {
      ...this.initialShipFormData,
      ...ship,
      ship_category: this.getForeignKeyId(ship.ship_category),
      sfd_hierarchy: this.getForeignKeyId(ship.sfd_hierarchy),
      class_master: this.getForeignKeyId(ship.class_master),
      command: this.getForeignKeyId(ship.command),
      authority: this.getForeignKeyId(ship.authority),
      overseeing_team: this.getForeignKeyId(ship.overseeing_team),
      propulsion: this.getForeignKeyId(ship.propulsion),
      active: ship.active === 1 || ship.active === true,
    };
  }

  confirmDeletion(): void {
    if (!this.selectedShip?.id) {
      this.toastService.showError('Ship ID is missing for deletion.');
      this.closeDialog();
      return;
    }
    this.subscriptions.add(
      this.shipService.deleteShip(this.selectedShip.id).subscribe({
        next: () => {
          this.toggleTable=false
          setTimeout(() => {
            this.toggleTable=true
          }, 100);
          this.toastService.showSuccess('Ship deleted successfully');
          // this.shipService.loadAllShipsData();
          this.showDeleteDialog = false;
        },
        error: (error) => {
          console.error('Delete ship failed:', error);
          this.toastService.showError(error.error?.message || 'Failed to delete ship.');
        },
      })
    );
  }

  cancelDeletion(): void {
    this.showDeleteDialog = false;
  }


  /**
   * Transforms the Ship details into an array that also contains string-keyed properties,
   * to satisfy the app-view-details's template logic.
   * This is a hacky solution to avoid changing app-view-details.
   */
  viewDetails(details: Ship, open: boolean): void {
    // Initialize as an empty array
    this.detailsForViewComponent = [];

    this.shipFormConfig.forEach(fieldConfig => {
      let displayValue: any;
      const fieldKey = fieldConfig.key as keyof Ship;

      // Access the raw value from the `details` (Ship object)
      const rawValue = details[fieldKey];

      if (fieldConfig.type === 'select') {
        if (typeof rawValue === 'object' && rawValue !== null) {
          displayValue = (rawValue as any).name || (rawValue as any).code || (rawValue as any).sr_no || 'N/A';
        } else if (rawValue !== null && rawValue !== undefined) {
          const option = fieldConfig.options?.find((opt: Option) => opt.value === rawValue);
          displayValue = option ? option.label : rawValue;
        } else {
          displayValue = 'N/A';
        }
      } else if (fieldConfig.type === 'boolean') {
        displayValue = (rawValue === 1) ? 'Yes' : 'No';
      } else if (fieldConfig.type === 'date') {
        displayValue = rawValue ? new Date(rawValue as string).toLocaleDateString() : 'N/A';
      } else {
        displayValue = rawValue;
      }

      // Assign the formatted displayValue as a property to the array object itself.
      // This is the hack that allows viewDetails[field.key] to work.
      (this.detailsForViewComponent as any)[fieldKey] = (displayValue !== null && displayValue !== undefined && String(displayValue).trim() !== '') ? displayValue : 'N/A';
    });

    //console.log("Details object passed to ViewDetailsComponent (hacky array-object):", this.detailsForViewComponent);
    this.isViewDetailsOpen = open;
    this.viewdisplayModal = open;
  }

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

  // URL-based fetching configuration
  apiUrl: string = 'master/ship/';
  totalCount: number = 0;

  cols = [
    { field: 'code', header: 'Ship Code', filterType: 'text' },
    { field: 'name', header: 'Ship Name', filterType: 'text' },
    { field: 'command_name', header: 'Command', filterType: 'text' },
    { field: 'commission_date', header: 'Commission Date', filterType: 'date' },
    { field: 'authority_name', header: 'Ops Auth', filterType: 'text' },
    { field: 'decommission_date', header: 'Decommission', filterType: 'date' },
    { field: 'active', header: 'Active', filterType: 'text' },
  ];
  // Here’s the table header text from your image:


  
  @ViewChild('dt') dt!: Table;
  @ViewChild('paginatedTable') paginatedTable!: PaginatedTableComponent;
  @ViewChildren(AddFormComponent) addFormComponents!: QueryList<AddFormComponent>;
  @Input() tableName: string = '';
  @Output() exportCSVEvent = new EventEmitter<void>();
  @Output() exportPDFEvent = new EventEmitter<void>();

  logMessage(...messages: any[]): void {
    //console.log(...messages);
  }

  exportPDF(): void {
    //console.log('Exporting as PDF...');
    this.exportPDFEvent.emit();
    const doc = new jsPDF();

    const tableRows = this.ships.map((row: Ship) =>
      this.cols.map((col) => {
        let value: any;
        if (col.field.includes('.')) {
          const fieldParts = col.field.split('.');
          let nestedValue: any = row;
          for (const part of fieldParts) {
            nestedValue = nestedValue ? (nestedValue as any)[part] : undefined;
            if (nestedValue === undefined) break;
          }
          value = nestedValue;
        } else {
          value = (row as any)[col.field];
        }
        return value !== undefined && value !== null ? String(value) : '';
      })
    );

    autoTable(doc, {
      head: [this.cols.map((col) => col.header)],
      body: tableRows,
    });
    doc.save(`${this.tableName || 'ship_master'}.pdf`);
  }

  exportExcel(): void {
    //console.log('Exporting as Excel...');
    this.exportCSVEvent.emit();
    const headers = this.cols.map((col) => col.header);
    const rows = this.ships.map((row: Ship) =>
      this.cols.map((col) => {
        let value: any;
        if (col.field.includes('.')) {
          const fieldParts = col.field.split('.');
          let nestedValue: any = row;
          for (const part of fieldParts) {
            nestedValue = nestedValue ? (nestedValue as any)[part] : undefined;
            if (nestedValue === undefined) break;
          }
          value = nestedValue;
        } else {
          value = (row as any)[col.field];
        }
        return value !== undefined && value !== null ? String(value) : '';
      })
    );

    const csv = [
      headers.join(','),
      ...rows.map((row: any[]) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.tableName || 'ship_master'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  handleSelectChange(event: any): void {
    //console.log('Selected value:', event);
    // Add your logic here
  }

  //   apiCall(){
  //   this.apiService.get('master/unit-type/').subscribe((res: any) => {
  //     this.unitOptions = res.results;
  //     //console.log("unit options are", this.unitOptions)
  //   });
  // }
}