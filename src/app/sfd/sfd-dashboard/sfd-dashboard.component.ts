// src/app/features/dashboards/insma-nhq/insma.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';


import { forkJoin, Subject, combineLatest, of } from 'rxjs';
import { takeUntil, startWith, switchMap, tap } from 'rxjs/operators';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ChartCardComponent } from '../../shared/components/chart-card/chart-card.component';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { ApiService, DashboardFilters } from '../../services/sfd-dashboard-service/sfd-dashboard.api.service';
import { DataProcessingService } from '../../data-processing.service';
import { DashboardCardComponent } from "../../shared/components/dashboard-card/dashboard-card.component";


@Component({
  selector: 'app-insma',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgChartsModule,
    ButtonModule,
    ProgressBarModule,
    DialogModule,
    DropdownModule,
    CalendarModule,
    LoadingSpinnerComponent,
    DataTableComponent,
    DashboardCardComponent
],
  templateUrl: './sfd-dashboard.component.html',
  styleUrl: './sfd-dashboard.component.css'
})

export class SfdDashboardComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject<void>();

  // --- Loading States ---
  isLoadingKPIs: boolean = true;
  isLoadingCharts: boolean = true;
  isLoadingAlerts: boolean = true;
  isLoadingFilterOptions: boolean = true;
  isLoadingCascadingFilters: boolean = false;

  isLoadingCommonEquipmentDetails: boolean = false;
  isLoadingMappedEquipmentDetails: boolean = false;
  isLoadingSFDUpdatesDetails: boolean = false;
  isLoadingFleetCompositionDetails: boolean = false;

  // --- Filter Models ---
  selectedCommand: string | null = null;
  selectedShip: string | null = null;
  selectedDepartment: string | null = null;
  selectedEquipmentType: string | null = null;
  selectedSubComponent: string | null = null;
  selectedEquipmentCodeFilter: string | null = null;
  dateRange: Date[] = [];

  // --- Dropdown Options ---
  commandOptions: { label: string, value: string }[] = [];
  shipOptions: { label: string, value: string }[] = [];
  departmentOptions: { label: string, value: string }[] = [];
  equipmentTypeOptions: { label: string, value: string }[] = [];
  subComponentOptions: { label: string, value: string }[] = [];
  equipmentCodeOptions: { label: string, value: string }[] = [];


  // --- KPI Data ---
  totalActiveShips: number = 0;
  activeShipsTrendData: number[] = [];
  operationalReadinessIndex: number = 0;
  criticalEquipmentHealthScore: number = 0;
  pendingMaintenanceCount: number = 0;
  equipmentAvailabilityIndex: number = 0;

  // --- Chart Data & Options ---
  public fleetCompositionChartData!: ChartConfiguration['data'];
  public fleetCompositionChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { stacked: true }, y: { stacked: true } },
    plugins: { legend: { position: 'bottom' } },
    onClick: (event, elements) => this.onChartClick(event, elements, 'fleetComposition')
  };
  showAllEquipmentDetail: boolean = false;
  allEquipmentDetailData: any[] = [];
  allEquipmentDetailColumns: TableColumn[] = [
    { field: 'equipmentName', header: 'Equipment Name' },
    { field: 'equipmentType', header: 'Type' },
    { field: 'shipName', header: 'Ship Name' },
    { field: 'commandName', header: 'Command' },
    { field: 'healthScore', header: 'Health Score', type: 'number' },
    { field: 'isCommon', header: 'Commonality', type: 'boolean' }
  ];
  public fleetCompositionChartType: ChartType = 'bar';

  public commonEquipmentChartData!: ChartConfiguration['data'];
  public commonEquipmentChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } },
    onClick: (event, elements) => this.onChartClick(event, elements, 'commonEquipment')
  };
  public commonEquipmentChartType: ChartType = 'doughnut';

  public sfdIlmsMappingChartData!: ChartConfiguration['data'];
  public sfdIlmsMappingChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: false } },
    onClick: (event, elements) => this.onChartClick(event, elements, 'sfdIlmsMapping')
  };
  public sfdIlmsMappingChartType: ChartType = 'doughnut';
  public mappedPercentage: number = 0;

  public sfdUpdatesChartData!: ChartConfiguration['data'];
  public sfdUpdatesChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true } },
    plugins: { legend: { position: 'bottom' } },
    onClick: (event, elements) => this.onChartClick(event, elements, 'sfdUpdates')
  };
  public sfdUpdatesChartType: ChartType = 'line';

  recentAlerts: {
    id: number;
    type: 'Critical' | 'Warning' | 'Maintenance';
    message: string;
    timestamp: Date;
    status: string;
    shipId: string | null;
    equipmentId: string | null;
  }[] = [];

  // --- Detail View Modals Visibility ---
  showCommonEquipmentDetail: boolean = false;
  showMappedEquipmentDetail: boolean = false;
  showSFDUpdatesDetail: boolean = false;
  showFleetCompositionDetail: boolean = false;

  // --- Modal Data & Columns ---
  commonEquipmentDetailData: any[] = [];
  commonEquipmentDetailColumns: TableColumn[] = [
    { field: 'equipmentName', header: 'Equipment Name' },
    { field: 'equipmentType', header: 'Type' },
    { field: 'shipName', header: 'Ship Name' },
    { field: 'commandName', header: 'Command' },
    { field: 'healthScore', header: 'Health Score', type: 'number' },
    { field: 'isCommon', header: 'Commonality', type: 'boolean' }
  ];

  mappedEquipmentDetailData: any[] = [];
  mappedEquipmentDetailColumns: TableColumn[] = [
    { field: 'equipmentName', header: 'Equipment Name' },
    { field: 'equipmentType', header: 'Type' },
    { field: 'shipName', header: 'Ship Name' },
    { field: 'commandName', header: 'Command' },
    { field: 'ilmsMapped', header: 'ILMS Mapped', type: 'boolean' }
  ];

  sfdUpdatesDetailData: any[] = [];
  sfdUpdatesDetailColumns: TableColumn[] = [
    { field: 'updateDate', header: 'Update Date', type: 'date' },
    { field: 'equipmentName', header: 'Equipment Name' },
    { field: 'updatedByCommand', header: 'Command' },
    { field: 'updateDescription', header: 'Description' }
  ];

  fleetCompositionDetailData: any[] = [];
  fleetCompositionDetailColumns: TableColumn[] = [
    { field: 'shipName', header: 'Ship Name' },
    { field: 'shipType', header: 'Type' },
    { field: 'commandName', header: 'Command' },
    { field: 'sdpClearDryDockDate', header: 'Dry Dock Date', type: 'date' }
  ];

  constructor(
    private apiService: ApiService,
    private dataProcessingService: DataProcessingService
  ) { }

  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * Loads options for all filter dropdowns, including initial cascading setup.
   */
  loadFilterOptions(): void {
    this.isLoadingFilterOptions = true;
    forkJoin([
      this.apiService.getAllCommands(),
      this.apiService.getAllShips(),
      this.apiService.getAllDepartments(),
      this.apiService.getEquipmentTypes({}) // Initially load all equipment types
    ]).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: ([commands, ships, departments, equipmentTypes]) => {
        this.commandOptions = commands.map(cmd => ({ label: cmd.CommandName, value: cmd.CommandID }));
        this.shipOptions = ships.map(ship => ({ label: ship.ShipName, value: ship.ShipID }));
        this.departmentOptions = departments.map(dep => ({ label: dep.DepartmentName, value: dep.DepartmentID }));
        this.equipmentTypeOptions = equipmentTypes.map(type => ({ label: type, value: type }));

        // Initial load for dependent dropdowns, potentially empty
        this.subComponentOptions = [];
        this.equipmentCodeOptions = [];

        this.isLoadingFilterOptions = false;
      },
      error: (err) => {
        console.error('Error loading initial filter options:', err);
        this.isLoadingFilterOptions = false;
      }
    });
  }

  // --- Cascading Filter Logic ---
  onCommandChange(): void {
    this.selectedShip = null; // Clear ship selection if command changes
    // If you want to filter ships based on command, add a call here:
    // this.apiService.getAllShips({ commandId: this.selectedCommand }).subscribe(ships => {
    //   this.shipOptions = ships.map(ship => ({ label: ship.ShipName, value: ship.ShipID }));
    // });
  }

  onShipChange(): void {
    // No cascading from ship to department/equipment is implemented in mock currently
  }

  onDepartmentChange(): void {
    // When department changes, reset subsequent equipment filters and load relevant equipment types
    this.selectedEquipmentType = null;
    this.selectedSubComponent = null;
    this.selectedEquipmentCodeFilter = null;
    this.equipmentTypeOptions = []; // Clear options immediately for visual feedback
    this.subComponentOptions = [];
    this.equipmentCodeOptions = [];

    this.isLoadingCascadingFilters = true;
    this.apiService.getEquipmentTypes({ departmentId: this.selectedDepartment }).pipe(
      takeUntil(this.ngUnsubscribe),
      tap(() => this.isLoadingCascadingFilters = false)
    ).subscribe(equipmentTypes => {
      this.equipmentTypeOptions = equipmentTypes.map(type => ({ label: type, value: type }));
    });
  }

  onEquipmentTypeChange(): void {
    // When equipment type changes, reset subsequent sub-component and equipment code filters
    this.selectedSubComponent = null;
    this.selectedEquipmentCodeFilter = null;
    this.subComponentOptions = []; // Clear options immediately
    this.equipmentCodeOptions = [];

    this.isLoadingCascadingFilters = true;
    this.apiService.getSubComponents({ equipmentType: this.selectedEquipmentType, departmentId: this.selectedDepartment }).pipe(
      takeUntil(this.ngUnsubscribe),
      tap(() => this.isLoadingCascadingFilters = false)
    ).subscribe(subComponents => {
      this.subComponentOptions = subComponents.map(sub => ({ label: sub.SubComponentName, value: sub.SubComponentID }));
    });
  }

  onSubComponentChange(): void {
    // When sub-component changes, reset equipment code filter
    this.selectedEquipmentCodeFilter = null;
    this.equipmentCodeOptions = []; // Clear options immediately

    this.isLoadingCascadingFilters = true;
    this.apiService.getEquipmentCodes({
      subComponentId: this.selectedSubComponent,
      equipmentType: this.selectedEquipmentType, // Pass parent filters for more accurate results
      departmentId: this.selectedDepartment
    }).pipe(
      takeUntil(this.ngUnsubscribe),
      tap(() => this.isLoadingCascadingFilters = false)
    ).subscribe(codes => {
      this.equipmentCodeOptions = codes.map(code => ({ label: code, value: code }));
    });
  }

  /**
   * Added onEquipmentCodeChange to trigger data reload when Equipment Code changes.
   */
  onEquipmentCodeChange(): void {
    // When the final filter in the cascade (Equipment Code) changes, apply all filters
    this.applyFilters();
  }

 // --- KPI Data (now structured for reusable component) ---
  kpiMetrics:any[] = [
    {
      title: 'Operational Ships',
      value: 7, // Will be populated dynamically
      description: 'Total active vessels in the fleet.',
      iconClass: 'pi pi-sitemap', // Using a suitable PrimeIcons class
      type: 'OPERATIONAL_SHIPS',
      color: '#0D9488' // Teal color
    },
    {
      title: 'Fleet Readiness',
      value: '100%', // Will be populated dynamically
      description: 'Overall operational readiness of the fleet.',
      iconClass: 'pi pi-gauge', // Gauge icon
      type: 'FLEET_READINESS',
      color: '#22C55E' // Green color
    },
    {
      title: 'Avg Eq. Health Score',
      value: 90, // Will be populated dynamically
      description: 'Average health score of critical equipment.',
      iconClass: 'pi pi-heart-fill', // Heart icon
      type: 'EQUIPMENT_HEALTH',
      color: '#F59E0B' // Amber color
    },
    // {
    //   title: 'Pending Maintenance',
    //   value: 0, // Will be populated dynamically
    //   description: 'Number of maintenance tasks awaiting action.',
    //   iconClass: 'pi pi-wrench', // Wrench icon
    //   type: 'PENDING_MAINTENANCE',
    //   color: '#EF4444' // Red color
    // },
    {
      title: 'Equipment Availability',
      value: '100%', // Will be populated dynamically
      description: 'Percentage of equipment available for use.',
      iconClass: 'pi pi-check-circle', // Check circle icon
      type: 'EQUIPMENT_AVAILABILITY',
      color: '#3B82F6' // Blue color
    },
  ];
  /**
   * Loads dashboard data based on selected filters.
   * @param filters The current filter selections.
   */
  loadDashboardData(filters: DashboardFilters = {}): void {
    this.isLoadingKPIs = true;
    this.isLoadingCharts = true;
    this.isLoadingAlerts = true;

    combineLatest([
      this.apiService.getAllEquipment(filters),
      this.apiService.getAllShips(filters),
      this.apiService.getAllCommands(),
      this.apiService.getRecentAlerts(5)
    ]).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: ([equipment, ships, commands, alerts]) => {
        // Process KPIs with potentially filtered data
        const kpis = this.dataProcessingService.processActiveShipsKPI(ships);
        this.totalActiveShips = kpis.total;
        this.activeShipsTrendData = kpis.trend;
        this.operationalReadinessIndex = this.dataProcessingService.processOperationalReadinessKPI(equipment);
        this.criticalEquipmentHealthScore = this.dataProcessingService.processAvgEquipmentHealthScoreKPI(equipment);
        this.pendingMaintenanceCount = this.dataProcessingService.processPendingMaintenanceKPI(equipment);
        this.equipmentAvailabilityIndex = this.dataProcessingService.processEquipmentAvailabilityKPI(equipment);
        this.isLoadingKPIs = false;

        // Process Charts with potentially filtered data
        this.fleetCompositionChartData = this.dataProcessingService.processFleetCompositionData(ships, commands);
        this.commonEquipmentChartData = this.dataProcessingService.processCommonEquipmentData(equipment);

        const sfdMapData = this.dataProcessingService.processSFDILMSMappingData(equipment);
        this.sfdIlmsMappingChartData = sfdMapData;

        // Safely calculate mappedPercentage
        if (sfdMapData.datasets.length > 0 &&
            sfdMapData.datasets[0].data &&
            sfdMapData.datasets[0].data[0] !== null && sfdMapData.datasets[0].data[0] !== undefined &&
            sfdMapData.datasets[0].data[1] !== null && sfdMapData.datasets[0].data[1] !== undefined) {

            const mappedCount = sfdMapData.datasets[0].data[0] as number;
            const unmappedCount = sfdMapData.datasets[0].data[1] as number;
            const totalCount = mappedCount + unmappedCount;

            if (totalCount > 0) {
                this.mappedPercentage = parseFloat(((mappedCount / totalCount) * 100).toFixed(1));
            } else {
                this.mappedPercentage = 0;
            }
        } else {
            this.mappedPercentage = 0;
        }

        this.sfdUpdatesChartData = this.dataProcessingService.processSFDUpdatesData(equipment, commands);
        this.isLoadingCharts = false;

        // Load Alerts
        this.recentAlerts = alerts;
        this.isLoadingAlerts = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.isLoadingKPIs = false;
        this.isLoadingCharts = false;
        this.isLoadingAlerts = false;
        // Implement user-friendly error message display
      }
    });
  }

  /**
   * Applies the selected filters and reloads dashboard data.
   */
  applyFilters(): void {
    const filters: DashboardFilters = {
      commandId: this.selectedCommand,
      shipId: this.selectedShip,
      departmentId: this.selectedDepartment,
      equipmentType: this.selectedEquipmentType,
      subComponentId: this.selectedSubComponent,
      equipmentCode: this.selectedEquipmentCodeFilter,
      startDate: this.dateRange[0] || null,
      endDate: this.dateRange[1] || null
    };
    this.loadDashboardData(filters);
  }

  /**
   * Resets all filters to their default state and reloads the dashboard.
   */
  resetFilters(): void {
    this.selectedCommand = null;
    this.selectedShip = null;
    this.selectedDepartment = null;
    this.selectedEquipmentType = null;
    this.selectedSubComponent = null;
    this.selectedEquipmentCodeFilter = null;
    this.dateRange = [];

    // Reset options for cascading dropdowns
    this.equipmentTypeOptions = []; // Will be repopulated by loadFilterOptions
    this.subComponentOptions = [];
    this.equipmentCodeOptions = [];

    this.loadFilterOptions(); // Reload initial filter options to repopulate primary dropdowns
    this.loadDashboardData(); // Load without any filters
  }


  // --- Drill-down event handlers (no changes here for filter updates) ---
  onChartClick(event: any, elements: any[], chartName: string): void {
    if (!elements || elements.length === 0) {
      //console.log('No active element found on chart click.');
      return;
    }

    const dataIndex = elements[0].index;
    const datasetIndex = elements[0].datasetIndex;

    // Simulate fetching drill-down data based on chart clicked
    switch (chartName) {
      case 'fleetComposition':
        const clickedCommandName = this.fleetCompositionChartData.labels![dataIndex] as string;
        const clickedShipType = this.fleetCompositionChartData.datasets![datasetIndex].label as string;
        this.isLoadingFleetCompositionDetails = true;
        this.apiService.getAllShips().pipe(takeUntil(this.ngUnsubscribe)).subscribe(ships => {
            this.apiService.getAllCommands().pipe(takeUntil(this.ngUnsubscribe)).subscribe(commands => {
                this.fleetCompositionDetailData = ships
                    .filter(s => s.ShipType === clickedShipType &&
                                 (commands.find(c => c.CommandID === s.CommandID)?.CommandName === clickedCommandName))
                    .map(s => ({
                        shipName: s.ShipName,
                        shipType: s.ShipType,
                        commandName: commands.find(c => c.CommandID === s.CommandID)?.CommandName || 'N/A',
                        sdpClearDryDockDate: s.SDPClearDryDockDate
                    }));
                this.showFleetCompositionDetail = true;
                this.isLoadingFleetCompositionDetails = false;
            });
        });
        break;

      case 'commonEquipment':
        const clickedEquipmentType = this.commonEquipmentChartData.labels![dataIndex] as string;
        this.isLoadingCommonEquipmentDetails = true;
        combineLatest([
            this.apiService.getAllEquipment(),
            this.apiService.getAllShips(),
            this.apiService.getAllCommands()
        ]).pipe(takeUntil(this.ngUnsubscribe)).subscribe(([equipment, ships, commands]) => {
              this.commonEquipmentDetailData = equipment
                .filter(e => e.EquipmentType === clickedEquipmentType)
                .map(e => ({
                  equipmentName: e.EquipmentName,
                  equipmentType: e.EquipmentType,
                  shipName: ships.find(s => s.ShipID === e.ShipID)?.ShipName || 'N/A',
                  commandName: commands.find(c => c.CommandID === e.CommandID)?.CommandName || 'N/A',
                  healthScore: e.HealthScore,
                  isCommon: e.IsCommon
                }));
              this.showCommonEquipmentDetail = true;
              this.isLoadingCommonEquipmentDetails = false;
            });
        break;

      case 'sfdIlmsMapping':
        const clickedSegment = this.sfdIlmsMappingChartData.labels![dataIndex] as string;
        this.isLoadingMappedEquipmentDetails = true;
        combineLatest([
            this.apiService.getAllEquipment(),
            this.apiService.getAllShips(),
            this.apiService.getAllCommands()
        ]).pipe(takeUntil(this.ngUnsubscribe)).subscribe(([equipment, ships, commands]) => {
          this.mappedEquipmentDetailData = equipment.filter(e =>
            (clickedSegment === 'Mapped' && e.ILMSMapped) ||
            (clickedSegment === 'Unmapped' && !e.ILMSMapped)
          ).map(e => ({
              equipmentName: e.EquipmentName,
              equipmentType: e.EquipmentType,
              ilmsMapped: e.ILMSMapped,
              shipName: ships.find(s => s.ShipID === e.ShipID)?.ShipName || 'N/A',
              commandName: commands.find(c => c.CommandID === e.CommandID)?.CommandName || 'N/A'
          }));
          this.showMappedEquipmentDetail = true;
          this.isLoadingMappedEquipmentDetails = false;
        });
        break;

      case 'sfdUpdates':
        const clickedMonth = this.sfdUpdatesChartData.labels![dataIndex] as string;
        const clickedCommand = this.sfdUpdatesChartData.datasets![datasetIndex].label as string;
        this.isLoadingSFDUpdatesDetails = true;
        this.apiService.getAllEquipment().pipe(takeUntil(this.ngUnsubscribe)).subscribe(equipment => {
          this.apiService.getAllCommands().pipe(takeUntil(this.ngUnsubscribe)).subscribe(commands => {
            this.sfdUpdatesDetailData = equipment.filter(e => {
              const equipmentCommand = commands.find(c => c.CommandID === e.CommandID);
              return equipmentCommand?.CommandName === clickedCommand &&
                     (e.LastUpdateDate && new Date(e.LastUpdateDate).getMonth() === this.getMonthIndex(clickedMonth));
            }).map(e => ({
              equipmentName: e.EquipmentName,
              updateDate: e.LastUpdateDate,
              updatedByCommand: commands.find(c => c.CommandID === e.CommandID)?.CommandName || 'N/A',
              updateDescription: e.LastUpdateDescription || 'N/A'
            }));
            this.showSFDUpdatesDetail = true;
            this.isLoadingSFDUpdatesDetails = false;
          });
        });
        break;
      default:
        //console.log('Unknown chart type clicked.');
    }
  }

  // Helper to get month index from name (for mock data filtering)
  private getMonthIndex(monthName: string): number {
    const monthMap: { [key: string]: number } = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    return monthMap[monthName];
  }

  // --- Helper for consistent chart colors ---
  private getShipTypeColor(type: string, isHover: boolean = false): string {
    const colors: { [key: string]: string } = {
      'Carrier': '#4CAF50', // Green
      'Destroyer': '#2196F3', // Blue
      'Frigate': '#FFC107', // Amber
      'Submarine': '#9C27B0', // Deep Purple
      'Corvette': '#FF5722'  // Deep Orange
    };
    const hoverColors: { [key: string]: string } = {
      'Carrier': '#388E3C',
      'Destroyer': '#1976D2',
      'Frigate': '#FFA000',
      'Submarine': '#7B1FA2',
      'Corvette': '#E64A19'
    };
    return isHover ? (hoverColors[type] || '#cccccc') : (colors[type] || '#dddddd');
  }

  onAlertClick(alert: any): void {
    //console.log('Alert clicked:', alert);
    alert(`Alert for: ${alert.message}. Implement navigation to detailed view (EqID: ${alert.equipmentId}, ShipID: ${alert.shipId}).`);
  }
}
