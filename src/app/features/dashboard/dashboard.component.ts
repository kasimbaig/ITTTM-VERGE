// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, combineLatest, Subject, of } from 'rxjs';
import { map, takeUntil, startWith } from 'rxjs/operators';
import { Option } from '../../masters/ship-master/ship.model';
// Commented out API services - using static data instead
// import { CommandService } from '../../masters/ship-master/ship-services/command.service';
// import { ShipService } from '../../masters/ship-master/ship.service';
// import { DepartmentService } from '../../masters/ship-master/ship-services/department.service';
import { MessageService } from 'primeng/api';
import { DefectListComponent } from './defect-list/defect-list.component'; // Correct path
import { ProjectionChartComponent } from './projection-chart/projection-chart.component';
// Static data imports
import {
  STATIC_COMMANDS,
  STATIC_SHIPS,
  STATIC_DEPARTMENTS,
  STATIC_FLEET_STATUS,
  STATIC_TIMELINE_DATA,
  STATIC_TASK_DISTRIBUTION_DATA,
  STATIC_MAINTENANCE_TIMELINE_DATA,
  STATIC_DEFECTS_DATA,
  STATIC_FREQUENT_DEFECT_DATA,
  STATIC_EQUIPMENT_LIST,
  STATIC_DEFECT_TYPE_OPTIONS,
  STATIC_SYSTEM_OPTIONS,
  STATIC_EQUIPMENT_OPTIONS,
  STATIC_PRIORITY_OPTIONS,
  STATIC_MAINTENANCE_TYPE_OPTIONS,
  STATIC_MAINTENANCE_FREQUENCY_OPTIONS,
  STATIC_PERSONNEL_OPTIONS,
  getFilteredShips,
  getShipsForDefect,
  getDepartmentsForDefect,
  StaticOption,
  StaticFleetStatus,
  StaticOcrcEvent,
  StaticChartData,
  StaticEquipmentItem
} from './dashboard-static-data';
// import { AddFormComponent } from '../../shared/components/add-form/add-form.component'; // No longer needed in TS file

interface OcrcEvent {
  ship: string;
  opStart: Date;
  opEnd: Date;
  refStart: Date;
  refEnd: Date;
  refitType: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
}

interface KpiCardData {
  value: number | string;
  trend?: number;
  trendDirection?: 'up' | 'down';
  progress?: number;
  progressText?: string;
  severity?: { critical: number; major: number; minor: number };
  overdueTasks?: number;
}

interface FleetStatus {
  ship: string;
  readiness: number; // percentage
  defects: number;
  maintenance: string; // e.g., "Due 2 weeks"
}

interface NewDefect {
  ship: number | null;
  department: number | null;
  title: string;
  description: string;
  defectType: string | null;
  system: string | null;
  equipment: string | null;
  priority: string | null;
  attachments: File[]; // For file upload
}

interface MaintenanceLog {
  maintenanceType: string | null;
  frequency: string | null;
  task: string;
  equipment: string | null;
  assignedPersonnel: string | null;
  hours: number | null;
  completionDate: Date | null;
  sparesUsed: string;
  remarks: string;
}

interface EquipmentItem {
  name: string;
  nsn?: string; // National Stock Number
  partNumber?: string;
  department?: string;
  compartment?: string;
  status: string; // Operational, In Maintenance, etc.
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild(DefectListComponent) defectListComponent!: DefectListComponent;

  // Tab and Dropdown Properties
  activeTab: string = 'dashboard';
  showMastersDropdown: boolean = false;
  menuExpanded: boolean = true;
  userInitials = 'JD';
  userName = 'John Doe';
  userRank = 'Commander';
  userRole = 'Maintenance Supervisor';
  isApprover: boolean = true;
  totalEquipment: number = 245;
  activeMaintenanceTasks: number = 87;
  activeMaintenanceProgress: number = 62;
  openDefects: number = 34;
  criticalDefects: number = 8;
  majorDefects: number = 15;
  minorDefects: number = 11;
  equipmentFitProgress: number = 100;
  equipmentFitSystemsCount: string = '191/245 systems';
  taskCompletionRate: number = 92;
  overdueTasks: number = 5;
  timelineData: StaticOcrcEvent[] = STATIC_TIMELINE_DATA;

  // Commented out API observables - using static data instead
  // commands$: Observable<Option[]>;
  // allShips$: Observable<Option[]>;
  // departments$: Observable<Option[]>;

  // Static data properties - Direct assignment instead of Observable
  commands: StaticOption[] = STATIC_COMMANDS;
  allShips: StaticOption[] = STATIC_SHIPS;
  departments: StaticOption[] = STATIC_DEPARTMENTS;

  private _allCommands: StaticOption[] = STATIC_COMMANDS;
  private _allShips: StaticOption[] = STATIC_SHIPS;
  private _allDepartments: StaticOption[] = STATIC_DEPARTMENTS;

  filteredShips: StaticOption[] = STATIC_SHIPS;
  filteredDepartments: StaticOption[] = STATIC_DEPARTMENTS;

  selectedCommand:any='';
  selectedShip:any='';
  selectedDept:any='';
  dateRange: Date[] | undefined; // Keep this if other parts of dashboard use it, but it's not passed to DefectListComponent

  kpiMetrics = [
    {
      title: 'Total Equipment',
      value: 245,
      description: 'Total equipment across all units.',
      iconClass: 'pi pi-cog',
      type: 'TOTAL_EQUIPMENT',
      backgroundColor: 'white',
      iconColor: '#022B5A',
      titleColor: '#022B5A',
      valueColor: '#022B5A',
      trendPercentage: '3.2%',
      trendDirection: 'up'
    },
    {
      title: 'Active Tasks',
      value: 87,
      iconClass: 'pi pi-calendar',
      type: 'ACTIVE_MAINTENANCE_TASKS',
      backgroundColor: 'white',
      iconColor: '#6B7C8F',
      titleColor: '#6B7C8F',
      valueColor: '#6B7C8F',
      progressBarValue: 62,
    },
    {
      title: 'Open Defects',
      value: 34,
      iconClass: 'pi pi-exclamation-triangle',
      type: 'OPEN_DEFECTS',
      backgroundColor: 'white',
      iconColor: '#E53935',
      titleColor: '#E53935',
      valueColor: '#E53935',
      severityDetails: { critical: 8, major: 15, minor: 11 }
    },
    {
      title: 'Equipment Fit Progress',
      value: '100%',
      iconClass: 'pi pi-check-square',
      type: 'EQUIPMENT_FIT_PROGRESS',
      backgroundColor: 'white',
      iconColor: '#4CAF50',
      titleColor: '#4CAF50',
      valueColor: '#4CAF50',
      subText: '191/245 systems'
    },
    {
      title: 'Task Completion Rate',
      value: '92%',
      iconClass: 'pi pi-chart-line',
      type: 'TASK_COMPLETION_RATE',
      backgroundColor: 'white',
      iconColor: '#FF6B35',
      titleColor: '#FF6B35',
      valueColor: '#FF6B35',
      subText: '5 overdue tasks'
    },
  ];

  taskDistributionData: StaticChartData = STATIC_TASK_DISTRIBUTION_DATA;
  maintenanceTimelineData: StaticChartData = STATIC_MAINTENANCE_TIMELINE_DATA;
  defectsData: StaticChartData = STATIC_DEFECTS_DATA;
  frequentDefectData: StaticChartData = STATIC_FREQUENT_DEFECT_DATA;

  fleetStatus: StaticFleetStatus[] = STATIC_FLEET_STATUS;

  // showNewDefectDialog: boolean = false; // No longer needed with reusable form
  newDefect: NewDefect = {
    ship: null, department: null, title: '', description: '',
    defectType: null, system: null, equipment: null, priority: null, attachments: []
  };

  selectedFiles: File[] = [];

  shipsForDefect: StaticOption[] = getShipsForDefect();
  departmentsForDefect: StaticOption[] = getDepartmentsForDefect();

  defectTypeOptions: StaticOption[] = STATIC_DEFECT_TYPE_OPTIONS;
  systemOptions: StaticOption[] = STATIC_SYSTEM_OPTIONS;
  equipmentOptions: StaticOption[] = STATIC_EQUIPMENT_OPTIONS;
  priorityOptions: StaticOption[] = STATIC_PRIORITY_OPTIONS;

  showLogMaintenanceDialog: boolean = false;
  maintenanceLog: MaintenanceLog = {
    maintenanceType: null, frequency: null, task: '', equipment: null,
    assignedPersonnel: null, hours: null, completionDate: null, sparesUsed: '', remarks: ''
  };
  maintenanceTypeOptions: StaticOption[] = STATIC_MAINTENANCE_TYPE_OPTIONS;
  maintenanceFrequencyOptions: StaticOption[] = STATIC_MAINTENANCE_FREQUENCY_OPTIONS;
  personnelOptions: StaticOption[] = STATIC_PERSONNEL_OPTIONS;

  // Remove Fleet Entry Form Properties
  // showAddFleetEntryDialog: boolean = false;
  // newFleetEntry: FleetStatus = {
  //   ship: '',
  //   readiness: 0,
  //   defects: 0,
  //   maintenance: ''
  // };

  showEquipmentFitDialog: boolean = false;
  selectedEFCommand: number | null = null;
  selectedEFShip: number | null = null;
  equipmentList: StaticEquipmentItem[] = STATIC_EQUIPMENT_LIST;

  showApprovePlanDialog: boolean = false;
  approverComments: string = '';

  // Defects Form Configuration for Reusable Form
  showDefectsFormDialog: boolean = false;
  defectsFormConfig: { label: string; key: string; type: string; required: boolean; placeholder?: string; options?: { label: string; value: any }[] }[] = [
    {
      key: 'ship',
      label: 'Ship',
      type: 'select',
      required: true,
      placeholder: 'Select a Ship',
      options: []
    },
    {
      key: 'department',
      label: 'Department',
      type: 'select',
      required: true,
      placeholder: 'Select Department',
      options: []
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      required: true,
      placeholder: 'Provide detailed description of the defect observed.'
    },
    {
      key: 'defectType',
      label: 'Defect Type',
      type: 'select',
      required: true,
      placeholder: 'Select Type',
      options: []
    }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    // Commented out API services - using static data instead
    // private commandService: CommandService,
    // private shipService: ShipService,
    // private departmentService: DepartmentService,
    private messageService: MessageService,
    private router: Router
  ) {
    // Static data is already initialized above
    // this.commands$ = this.commandService.getCommandOptions();
    // this.allShips$ = this.shipService.getShipOptions();
    // this.departments$ = this.departmentService.getDepartmentOptions();
  }

  ngOnInit(): void {
    this.loadDefaultData();
    
    // Static data is already initialized, no need for API calls
    // Initialize filter dropdowns based on static data
    this.applyShipAndDepartmentFilters(this._allShips, this._allCommands, this._allDepartments);

    // IMPORTANT: Trigger applyFilters *once* after all initial data and dropdowns are ready
    // This ensures the initial charts are populated with static data.
    this.applyFilters();

    // Add document click listener for dropdown
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Remove document click listener
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }

  loadDefaultData(): void {
    // Static data is already initialized in the properties above
    // this.fleetStatus = STATIC_FLEET_STATUS; // Already set above
    // this.timelineData = STATIC_TIMELINE_DATA; // Already set above
    
    // Use static timeline data
    this.timelineData = STATIC_TIMELINE_DATA;
  }

  // New method to apply filters only for the mock charts (not for the defect-list component)
  applyFiltersForMockCharts(): void {
    let selectedShipNames: string[] = [];
    if (this.selectedShip) {
      const foundShip = this._allShips.find(s => s.value === this.selectedShip);
      if (foundShip?.label) {
        selectedShipNames = [foundShip.label];
      }
    } else {
      let shipsToConsider = this._allShips;
      if (this.selectedCommand !== null) {
        // Filter ships based on selected command using commandId property
        shipsToConsider = this._allShips.filter(s => (s as any).commandId === this.selectedCommand);
      }
      selectedShipNames = shipsToConsider.filter(s => s.value !== null).map(s => s.label);
    }
    this.timelineData = this.getMockTimelineData(selectedShipNames);

    // Use static chart data with filtered labels
    this.frequentDefectData = {
      labels: ['Filtered A', 'Filtered B', 'Filtered C'],
      datasets: [{
        label: 'Filtered Frequency',
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'],
        data: [3, 2, 4]
      }]
    };

    this.taskDistributionData = {
      labels: ['Engineering', 'Operations', 'Logistics', 'Medical', 'Weapons'],
      datasets: [{
        label: 'Filtered Tasks',
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC'],
        data: [15, 25, 10, 5, 20]
      }]
    };

    this.maintenanceTimelineData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Filtered Planned',
          backgroundColor: ['#42A5F5'],
          data: [45, 40, 55, 50, 30, 35]
        },
        {
          label: 'Filtered Unplanned',
          backgroundColor: ['#EF5350'],
          data: [25, 35, 20, 15, 50, 20]
        }
      ]
    };

    this.defectsData = {
      labels: ['Engine', 'Navigation', 'Electrical'],
      datasets: [{
        label: 'Filtered Defects',
        backgroundColor: ['#FF6384'],
        data: [6, 2, 4]
      }]
    };
  }

  applyFilters(): void {
  
    // Update mock charts
    this.applyFiltersForMockCharts();

    // Trigger API call for DefectListComponent only
    if (this.defectListComponent) {
      // Pass the current filter values directly to the child component's method
      // The child component's fetchData will now use these updated values
      this.defectListComponent.fetchData();
    }
  }

  onCommandChange(): void {
    // Reset dependent filters
    this.selectedShip = null;
    this.selectedDept = null;

    // Re-filter ships based on the new command
    this.applyShipAndDepartmentFilters(this._allShips, this._allCommands, this._allDepartments);

    // DO NOT call applyFilters() here.
    // The user must click 'Apply' to trigger data fetching.
  }

  onShipChange(): void {
    // Reset dependent filters
    this.selectedDept = null;
    // DO NOT call applyFilters() here.
  }

  onDeptChange(): void {
    // DO NOT call applyFilters() here.
  }

  clearFilters(): void {
    this.selectedCommand = null;
    this.selectedShip = null;
    this.selectedDept = null;
    this.dateRange = undefined; // Clear the date range
    // Reset dropdowns based on the new null selections
    this.applyShipAndDepartmentFilters(this._allShips, this._allCommands, this._allDepartments);
    // After clearing, trigger the applyFilters to update all charts, including the DefectListComponent
    this.applyFilters();
  }

  applyShipAndDepartmentFilters(allShips: StaticOption[], allCommands: StaticOption[], allDepartments: StaticOption[]): void {
    let filtered = allShips.filter(ship =>
      // Filter ships based on selected command using commandId property
      this.selectedCommand === null || (ship as any).commandId === this.selectedCommand
    )
    this.filteredShips = [{ label: 'All Ships', value: null }, ...filtered];

    this.filteredDepartments = [{ label: 'All Departments', value: null }, ...allDepartments];

    this.shipsForDefect = allShips.filter(s => s.value !== null);
    this.departmentsForDefect = allDepartments.filter(d => d.value !== null);
  }

  getStatusClass(readiness: number): string {
    if (readiness >= 90) return 'operational';
    if (readiness >= 75) return 'limited';
    return 'in-maintenance';
  }

  getStatusClassd(status: string): string {
    switch (status) {
      case 'Operational': return 'status-operational';
      case 'In Maintenance': return 'status-in-maintenance';
      default: return '';
    }
  }

  addNewDefect(): void {
    // Update the form configuration with current static options
    this.defectsFormConfig = [
      {
        key: 'ship',
        label: 'Ship',
        type: 'select',
        required: true,
        placeholder: 'Select a Ship',
        options: this.shipsForDefect
      },
      {
        key: 'department',
        label: 'Department',
        type: 'select',
        required: true,
        placeholder: 'Select Department',
        options: this.departmentsForDefect
      },
      {
        key: 'description',
        label: 'Description',
        type: 'text',
        required: true,
        placeholder: 'Provide detailed description of the defect observed.'
      },
      {
        key: 'defectType',
        label: 'Defect Type',
        type: 'select',
        required: true,
        placeholder: 'Select Type',
        options: this.defectTypeOptions
      }
    ];

    this.newDefect = {
      ship: null, department: null, title: '', description: '',
      defectType: null, system: null, equipment: null, priority: null, attachments: []
    };
    this.showDefectsFormDialog = true;
    //console.log('Opening Add New Defect Dialog with Reusable Form');
  }

  handleDefectsFormSubmit(data: any): void {
    //console.log('Submitting new defect from reusable form:', data);
    
    // Validate required fields
    if (!data.ship || !data.department || !data.description || 
        !data.defectType) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Please fill in all required fields for the new defect.' 
      });
      return;
    }

    // Process the submitted data
    const newDefectData = {
      ship: data.ship,
      department: data.department,
      title: data.description.substring(0, 50) + (data.description.length > 50 ? '...' : ''), // Use description as title
      description: data.description,
      defectType: data.defectType,
      system: null, // Not provided in the new form
      equipment: null, // Not provided in the new form
      priority: null, // Not provided in the new form
      attachments: []
    };

    // Here you would typically save the defect to your backend
    //console.log('Processed defect data:', newDefectData);
    
    setTimeout(() => {
      this.messageService.add({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Defect submitted successfully!' 
      });
      this.showDefectsFormDialog = false;
    }, 1000);
  }

  // Keep the old method for backward compatibility but it's no longer used
  submitNewDefect(): void {
    //console.log('Submitting new defect:', this.newDefect);
    if (this.newDefect.ship === null || this.newDefect.department === null || !this.newDefect.title || !this.newDefect.description ||
      !this.newDefect.defectType) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill in all required fields for the new defect.' });
      return;
    }
    setTimeout(() => {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Defect submitted successfully!' });
      // this.showNewDefectDialog = false; // No longer needed
    }, 1000);
  }

  logMaintenance(): void {
    this.maintenanceLog = {
      maintenanceType: null, frequency: null, task: '', equipment: null,
      assignedPersonnel: null, hours: null, completionDate: null, sparesUsed: '', remarks: ''
    };
    this.showLogMaintenanceDialog = true;
    //console.log('Opening Log Maintenance Dialog');
  }

  submitMaintenanceLog(): void {
    //console.log('Submitting maintenance log:', this.maintenanceLog);
    if (!this.maintenanceLog.maintenanceType || !this.maintenanceLog.frequency || !this.maintenanceLog.task ||
      !this.maintenanceLog.equipment || !this.maintenanceLog.assignedPersonnel || this.maintenanceLog.hours === null ||
      !this.maintenanceLog.completionDate) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill in all required fields for the maintenance log.' });
      return;
    }
    setTimeout(() => {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Maintenance log submitted successfully!' });
      this.showLogMaintenanceDialog = false;
    }, 1000);
  }

  viewEquipmentFit(): void {
    this.showEquipmentFitDialog = true;
    //console.log('Opening View Equipment Fit Dialog');
  }

  approveMaintenancePlan(): void {
    //console.log('Approving/Rejecting Maintenance Plan with comments:', this.approverComments);
    setTimeout(() => {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Maintenance plan action recorded!' });
      this.showApprovePlanDialog = false;
    }, 1000);
  }

  onChartSelect(event: any): void {
    //console.log('Chart segment selected:', event);
  }

  getMockTimelineData(ships: string[]): StaticOcrcEvent[] {
    const refitTypes = ['Major Refit', 'Minor Refit', 'Maintenance', 'Inspection'];
    const events: StaticOcrcEvent[] = [];
    
    ships.forEach((ship, index) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + (index * 30));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 14);
      
      events.push({
        ship,
        opStart: startDate,
        opEnd: endDate,
        refStart: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000),
        refEnd: new Date(endDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        refitType: refitTypes[index % refitTypes.length]
      });
    });
    
    return events;
  }

  // Tab and Dropdown Methods
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'dashboard') {
      this.showMastersDropdown = false;
    }
  }

  toggleMastersDropdown(): void {
    this.showMastersDropdown = !this.showMastersDropdown;
  }

  navigateToMasters(route: string): void {
    this.showMastersDropdown = false;
    
    // Navigation logic based on the routing structure
    switch (route) {
      case 'ship-details':
        this.router.navigate(['/masters/ship-group']);
        break;
      case 'equipment-details':
        this.router.navigate(['/masters/equipment-group']);
        break;
      case 'unit-details':
        this.router.navigate(['/masters/unit-group']);
        break;
      case 'overseeing-team':
        this.router.navigate(['/masters/overseeing-team']);
        break;
      case 'propulsion':
        this.router.navigate(['/masters/propulsion']);
        break;
      case 'country':
        this.router.navigate(['/masters/country']);
        break;
      case 'establishment':
        this.router.navigate(['/masters/establishment']);
        break;
      case 'manufacturer':
        this.router.navigate(['/masters/manufacturer']);
        break;
      default:
        //console.log('Unknown route:', route);
    }
  }

  // Close dropdown when clicking outside
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.tab-dropdown')) {
      this.showMastersDropdown = false;
    }
  }

  // File handling methods
  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      this.selectedFiles = Array.from(files);
      this.newDefect.attachments = this.selectedFiles;
    }
  }

  // Remove Fleet Entry Form Methods
  // addNewFleetEntry(): void {
  //   this.showAddFleetEntryDialog = true;
  //   this.newFleetEntry = {
  //     ship: '',
  //     readiness: 0,
  //     defects: 0,
  //     maintenance: ''
  //   };
  // }

  // handleFleetEntrySubmit(data: any): void {
  //   // Validate readiness percentage
  //   if (data.readiness < 0 || data.readiness > 100) {
  //     this.messageService.add({ 
  //       severity: 'error', 
  //       summary: 'Validation Error', 
  //       detail: 'Readiness percentage must be between 0 and 100' 
  //     });
  //     return;
  //   }

  //   // Validate defects count
  //   if (data.defects < 0) {
  //     this.messageService.add({ 
  //       severity: 'error', 
  //       summary: 'Validation Error', 
  //       detail: 'Open defects count cannot be negative' 
  //     });
  //     return;
  //   }

  //   // Add the new fleet entry
  //   const newEntry: FleetStatus = {
  //     ship: data.ship,
  //     readiness: data.readiness,
  //     defects: data.defects,
  //     maintenance: data.maintenance || 'None'
  //   };

  //   this.fleetStatus.push(newEntry);
    
  //   this.messageService.add({ 
  //     severity: 'success', 
  //       summary: 'Success', 
  //       detail: `Fleet entry for ${data.ship} added successfully!` 
  //   });
    
  //   this.showAddFleetEntryDialog = false;
  // }

  // closeFleetEntryDialog(): void {
  //   this.showAddFleetEntryDialog = false;
  // }
}