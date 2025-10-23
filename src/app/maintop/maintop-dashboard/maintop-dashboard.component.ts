import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { DashboardCardComponent } from '../../shared/components/dashboard-card/dashboard-card.component'; // Ensure correct path
import { MenuItem } from 'primeng/api';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-maintop-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DashboardCardComponent,
    TieredMenuModule,
    ButtonModule,
    ChartModule,
    DialogModule,
    TableModule,
    DropdownModule,
    FormsModule,
  ],
  templateUrl: './maintop-dashboard.component.html',
  styleUrls: ['./maintop-dashboard.component.css'],
})
export class MaintopDashboardComponent implements OnInit {

  // --- Filter Properties ---
  // Dropdown 1: Organizational Level (INSMAT, NHQ)
  organizationalFilterOptions: { label: string, value: string }[] = [
    { label: 'Overall (INSMAT)', value: 'INSMAT' },
    { label: 'Naval Headquarters (NHQ)', value: 'NHQ' }
  ];
  selectedOrganizationalFilter: string = 'INSMAT'; // Default value: Overall INSMAT

  // Dropdown 2: Command
  commandOptions: { label: string, value: string }[] = [];
  selectedCommand: string | null = null; // Specific command (e.g., Eastern, Western)

  // Dropdown 3: Ship
  shipOptions: { label: string, value: string }[] = [];
  selectedShip: string | null = null; // Specific ship name (e.g., INS Vikrant)

  // --- KPI Card Data ---
  kpiMetrics = [
    {
      title: 'Total Active Tasks',
      value: 0,
      description: 'Tasks currently in progress or assigned.',
      iconClass: 'pi pi-list',
      type: 'ACTIVE_TASKS',
      color: '#1e40af'
    },
    {
      title: 'Overdue Tasks',
      value: 0,
      description: 'Tasks past their scheduled completion date.',
      iconClass: 'pi pi-clock',
      type: 'OVERDUE_TASKS',
      color: '#dc2626'
    },
    {
      title: 'Monthly Completion Rate',
      value: '0%',
      description: 'Percentage of planned tasks completed this month.',
      iconClass: 'pi pi-chart-bar',
      type: 'MONTHLY_COMPLETION',
      color: '#16a34a'
    },
    {
      title: 'OEM Routine Optimizations',
      value: '0 New',
      description: 'New optimized routines identified from OEM comparisons.',
      iconClass: 'pi pi-compass',
      type: 'OEM_OPTIMIZATIONS',
      color: '#2563eb'
    },
  ];

  // --- Chart Data & Options ---
  taskStatusData: any; taskStatusOptions: any;
  monthlyCompletionData: any; monthlyCompletionOptions: any;
  acquaintsByReasonData: any; acquaintsByReasonOptions: any;
  sparesConsumptionData: any; sparesConsumptionOptions: any;
  oemEfficiencyData: any; oemEfficiencyOptions: any;

  // --- Drill-down Dialog Properties ---
  displayDrilldownDialog: boolean = false;
  drilldownDialogTitle: string = '';
  drilldownTableData: any[] = [];
  drilldownTableCols: any[] = [];

  exportOptions: MenuItem[] = [];

  // --- Mock Data Store (Expanded for granularity) ---
  private mockDatabase = {
    tasks: [
      // NHQ/INSMAT Level (scope: 'NHQ' for direct NHQ, or 'INSMAT' for overall INSMAT data if distinguishable)
      { taskId: 'NHQ-001', description: 'New policy draft review', scope: 'NHQ', command: null, ship: null, assignedTo: 'NHQ', dueDate: '2025-07-25', status: 'Active', completionDate: null },
      { taskId: 'NHQ-002', description: 'Annual budget finalization', scope: 'NHQ', command: null, ship: null, assignedTo: 'NHQ', dueDate: '2025-06-01', status: 'Overdue', completionDate: null },
      // Command Level
      { taskId: 'EC-001', description: 'Eastern Command security audit', scope: 'COMMAND', command: 'Eastern', ship: null, assignedTo: 'EC-HQ', dueDate: '2025-07-15', status: 'Active', completionDate: null },
      { taskId: 'WC-001', description: 'Western Command logistics review', scope: 'COMMAND', command: 'Western', ship: null, assignedTo: 'WC-HQ', dueDate: '2025-05-20', status: 'Completed', completionDate: '2025-05-20' },
      { taskId: 'SC-001', description: 'Southern Command infrastructure upgrade', scope: 'COMMAND', command: 'Southern', ship: null, assignedTo: 'SC-HQ', dueDate: '2025-06-10', status: 'Overdue', completionDate: null },
      // Ship Level
      { taskId: 'VIK-001', description: 'Inspect Main Engine Turbocharger', scope: 'SHIP', command: 'Eastern', ship: 'INS Vikrant', assignedTo: 'Lt. Cmdr. Sharma', dueDate: '2025-06-30', status: 'Active', completionDate: null },
      { taskId: 'CHE-001', description: 'Lubricate Steering Gear', scope: 'SHIP', command: 'Western', ship: 'INS Chennai', assignedTo: 'PO Singh', dueDate: '2025-07-05', status: 'Active', completionDate: null },
      { taskId: 'KOL-001', description: 'Repair AC Unit - Section 3', scope: 'SHIP', command: 'Eastern', ship: 'INS Kolkata', assignedTo: 'Leading Seaman Verma', dueDate: '2025-06-15', status: 'Overdue', completionDate: null },
      { taskId: 'DEL-001', description: 'Replace Filter - HP Air Compressor', scope: 'SHIP', command: 'Western', ship: 'INS Delhi', assignedTo: 'Able Seaman Kumar', dueDate: '2025-06-20', status: 'Completed', completionDate: '2025-06-20' },
      { taskId: 'MUM-001', description: 'Calibration of Radar System', scope: 'SHIP', command: 'Southern', ship: 'INS Mumbai', assignedTo: 'EO Bansal', dueDate: '2025-07-10', status: 'Pending Approval', completionDate: null },
      { taskId: 'VIK-002', description: 'Weekly pump inspection', scope: 'SHIP', command: 'Eastern', ship: 'INS Vikrant', assignedTo: 'PO Sharma', dueDate: '2025-06-22', status: 'Completed', completionDate: '2025-06-22' },
      { taskId: 'CHE-002', description: 'Quarterly Battery Check', scope: 'SHIP', command: 'Western', ship: 'INS Chennai', assignedTo: 'Lt. Cmdr. Rao', dueDate: '2025-06-01', status: 'Overdue', completionDate: null },
      { taskId: 'KOL-002', description: 'Engine oil sample analysis', scope: 'SHIP', command: 'Eastern', ship: 'INS Kolkata', assignedTo: 'Lt. Patel', dueDate: '2025-07-12', status: 'Active', completionDate: null },
      { taskId: 'DEL-002', description: 'Fire Suppression System check', scope: 'SHIP', command: 'Western', ship: 'INS Delhi', assignedTo: 'PO Gupta', dueDate: '2025-06-28', status: 'Active', completionDate: null },
      { taskId: 'MUM-002', description: 'Navigational Software Update', scope: 'SHIP', command: 'Southern', ship: 'INS Mumbai', assignedTo: 'Sub Lt. Devi', dueDate: '2025-06-05', status: 'Completed', completionDate: '2025-06-05' },
      
      // Current Month (December 2024) Completed Tasks for Monthly Completion Rate
      { taskId: 'VIK-003', description: 'Monthly Engine Performance Check', scope: 'SHIP', command: 'Eastern', ship: 'INS Vikrant', assignedTo: 'Lt. Cmdr. Sharma', dueDate: '2024-12-15', status: 'Completed', completionDate: '2024-12-15' },
      { taskId: 'CHE-003', description: 'Quarterly Safety Equipment Inspection', scope: 'SHIP', command: 'Western', ship: 'INS Chennai', assignedTo: 'PO Singh', dueDate: '2024-12-10', status: 'Completed', completionDate: '2024-12-10' },
      { taskId: 'KOL-003', description: 'Monthly Fire Suppression Test', scope: 'SHIP', command: 'Eastern', ship: 'INS Kolkata', assignedTo: 'Leading Seaman Verma', dueDate: '2024-12-12', status: 'Completed', completionDate: '2024-12-12' },
      { taskId: 'DEL-003', description: 'Weekly Generator Maintenance', scope: 'SHIP', command: 'Western', ship: 'INS Delhi', assignedTo: 'Able Seaman Kumar', dueDate: '2024-12-08', status: 'Completed', completionDate: '2024-12-08' },
      { taskId: 'MUM-003', description: 'Monthly Navigation System Calibration', scope: 'SHIP', command: 'Southern', ship: 'INS Mumbai', assignedTo: 'EO Bansal', dueDate: '2024-12-20', status: 'Completed', completionDate: '2024-12-20' },
      { taskId: 'VIK-004', description: 'Bi-weekly Pump System Check', scope: 'SHIP', command: 'Eastern', ship: 'INS Vikrant', assignedTo: 'PO Sharma', dueDate: '2024-12-18', status: 'Completed', completionDate: '2024-12-18' },
      { taskId: 'CHE-004', description: 'Monthly Electrical Panel Inspection', scope: 'SHIP', command: 'Western', ship: 'INS Chennai', assignedTo: 'Lt. Cmdr. Rao', dueDate: '2024-12-14', status: 'Completed', completionDate: '2024-12-14' },
      { taskId: 'KOL-004', description: 'Weekly Hydraulic System Check', scope: 'SHIP', command: 'Eastern', ship: 'INS Kolkata', assignedTo: 'Lt. Patel', dueDate: '2024-12-16', status: 'Completed', completionDate: '2024-12-16' },
      { taskId: 'DEL-004', description: 'Monthly Communication Equipment Test', scope: 'SHIP', command: 'Western', ship: 'INS Delhi', assignedTo: 'PO Gupta', dueDate: '2024-12-22', status: 'Completed', completionDate: '2024-12-22' },
      { taskId: 'MUM-004', description: 'Bi-weekly Radar System Check', scope: 'SHIP', command: 'Southern', ship: 'INS Mumbai', assignedTo: 'Sub Lt. Devi', dueDate: '2024-12-19', status: 'Completed', completionDate: '2024-12-19' },
    ],
    acquaints: [
      { acquaintId: 'AQ-VIK-001', equipment: 'Main Engine', reason: 'Equipment Failure', reportedBy: 'PO Das', dateRaised: '2025-06-20', scope: 'SHIP', command: 'Eastern', ship: 'INS Vikrant' },
      { acquaintId: 'AQ-CHE-001', equipment: 'AC Unit', reason: 'Routine Anomaly', reportedBy: 'Lt. Rao', dateRaised: '2025-06-18', scope: 'SHIP', command: 'Western', ship: 'INS Chennai' },
      { acquaintId: 'AQ-KOL-001', equipment: 'Portable Drill', reason: 'Tool Issue', reportedBy: 'Seaman John', dateRaised: '2025-06-22', scope: 'SHIP', command: 'Eastern', ship: 'INS Kolkata' },
      { acquaintId: 'AQ-DEL-001', equipment: 'Radar System', reason: 'Equipment Failure', reportedBy: 'EO Kumar', dateRaised: '2025-06-19', scope: 'SHIP', command: 'Western', ship: 'INS Delhi' },
      { acquaintId: 'AQ-MUM-001', equipment: 'Pump System', reason: 'Operational Feedback', reportedBy: 'Cmdr. Singh', dateRaised: '2025-06-21', scope: 'SHIP', command: 'Southern', ship: 'INS Mumbai' },
      { acquaintId: 'AQ-EC-001', equipment: 'N/A', reason: 'Routine Anomaly', reportedBy: 'EC-HQ', dateRaised: '2025-06-10', scope: 'COMMAND', command: 'Eastern', ship: null },
      { acquaintId: 'AQ-WC-001', equipment: 'N/A', reason: 'Routine Anomaly', reportedBy: 'WC-HQ', dateRaised: '2025-06-11', scope: 'COMMAND', command: 'Western', ship: null },
      { acquaintId: 'AQ-SC-001', equipment: 'N/A', reason: 'Operational Feedback', reportedBy: 'SC-HQ', dateRaised: '2025-06-12', scope: 'COMMAND', command: 'Southern', ship: null },
      { acquaintId: 'AQ-NHQ-001', equipment: 'N/A', reason: 'Operational Feedback', reportedBy: 'NHQ', dateRaised: '2025-06-05', scope: 'NHQ', command: null, ship: null },
    ],
    spares: [
      { partNo: 'ME-001', description: 'Engine Gasket Set', quantity: 5, value: 50000, consumedDate: '2025-06-10', category: 'Mechanical', scope: 'SHIP', command: 'Eastern', ship: 'INS Vikrant' },
      { partNo: 'EL-005', description: 'Circuit Breaker', quantity: 10, value: 20000, consumedDate: '2025-06-12', category: 'Electrical', scope: 'SHIP', command: 'Western', ship: 'INS Chennai' },
      { partNo: 'HY-010', description: 'Hydraulic Fluid Barrel', quantity: 2, value: 30000, consumedDate: '2025-06-15', category: 'Hydraulic', scope: 'SHIP', command: 'Eastern', ship: 'INS Kolkata' },
      { partNo: 'CO-001', description: 'Cleaning Solvent', quantity: 20, value: 5000, consumedDate: '2025-06-20', category: 'Consumables', scope: 'SHIP', command: 'Western', ship: 'INS Delhi' },
      { partNo: 'SP-001', description: 'Diagnostic Tool Kit', quantity: 1, value: 40000, consumedDate: '2025-06-22', category: 'Specialized', scope: 'SHIP', command: 'Southern', ship: 'INS Mumbai' },
      { partNo: 'OFFICE-EC', description: 'Office Supplies', quantity: 50, value: 10000, consumedDate: '2025-06-01', category: 'Consumables', scope: 'COMMAND', command: 'Eastern', ship: null },
      { partNo: 'OFFICE-WC', description: 'Printer Toner', quantity: 10, value: 8000, consumedDate: '2025-06-02', category: 'Consumables', scope: 'COMMAND', command: 'Western', ship: null },
      { partNo: 'OFFICE-SC', description: 'Stationery', quantity: 30, value: 4000, consumedDate: '2025-06-03', category: 'Consumables', scope: 'COMMAND', command: 'Southern', ship: null },
      { partNo: 'IT-NHQ', description: 'Network Cables', quantity: 100, value: 15000, consumedDate: '2025-06-05', category: 'Electrical', scope: 'NHQ', command: null, ship: null },
    ],
    oem: [
      { routineName: 'Daily Engine Check', equipment: 'DA Engine', oem: 'OEM A (DA)', defectCount: 2, efficiencyScore: 7.2, scope: 'SHIP', command: 'Eastern', ship: 'INS Vikrant' },
      { routineName: 'Compressor Overhaul', equipment: 'Air Compressor', oem: 'OEM B (Compressor)', defectCount: 1, efficiencyScore: 5.8, scope: 'SHIP', command: 'Western', ship: 'INS Chennai' },
      { routineName: 'AC Filter Replacement', equipment: 'HVAC System', oem: 'OEM C (AC)', defectCount: 1, efficiencyScore: 6.5, scope: 'SHIP', command: 'Eastern', ship: 'INS Kolkata' },
      { routineName: 'Steering Gear Lubrication', equipment: 'Steering Gear', oem: 'OEM D (Steering)', defectCount: 0, efficiencyScore: 4.9, scope: 'SHIP', command: 'Western', ship: 'INS Delhi' },
      { routineName: 'Radar Antenna Inspection', equipment: 'Radar System', oem: 'OEM E (Radar)', defectCount: 3, efficiencyScore: 7.8, scope: 'SHIP', command: 'Southern', ship: 'INS Mumbai' },
      { routineName: 'Command-IT Maintenance', equipment: 'Server Farm', oem: 'OEM F (IT)', defectCount: 0, efficiencyScore: 4.0, scope: 'COMMAND', command: 'Eastern', ship: null },
      { routineName: 'Command-Logistics Audit', equipment: 'Supply Chain', oem: 'OEM H (Logistics)', defectCount: 1, efficiencyScore: 5.5, scope: 'COMMAND', command: 'Western', ship: null },
      { routineName: 'Command-Security Review', equipment: 'Perimeter Systems', oem: 'OEM I (Security)', defectCount: 0, efficiencyScore: 4.2, scope: 'COMMAND', command: 'Southern', ship: null },
      { routineName: 'NHQ Network Audit', equipment: 'Network Infrastructure', oem: 'OEM G (Network)', defectCount: 1, efficiencyScore: 5.0, scope: 'NHQ', command: null, ship: null },
    ]
  };

  constructor(private location: Location) {}

  ngOnInit(): void {
    this.initializeFilterOptions();
    this.initializeExportOptions();
    
    // Debug: Test date logic
    console.log('=== DATE DEBUGGING ===');
    const currentDate = new Date();
    console.log('Current date:', currentDate);
    console.log('Current month:', currentDate.getMonth()); // 0-11
    console.log('Current year:', currentDate.getFullYear());
    
    // Test with our mock data dates
    const testDate = new Date('2024-12-15');
    console.log('Test date 2024-12-15:', testDate);
    console.log('Test month:', testDate.getMonth());
    console.log('Test year:', testDate.getFullYear());
    console.log('Month match:', testDate.getMonth() === currentDate.getMonth());
    console.log('Year match:', testDate.getFullYear() === currentDate.getFullYear());
    console.log('=== END DATE DEBUGGING ===');
    
    // Debug: Check mock data
    console.log('=== MOCK DATA DEBUGGING ===');
    console.log('Total tasks in mock database:', this.mockDatabase.tasks.length);
    console.log('Tasks with completion dates:', this.mockDatabase.tasks.filter(t => t.completionDate).length);
    console.log('Tasks completed in December 2024:', this.mockDatabase.tasks.filter(t => {
      if (t.completionDate) {
        const date = new Date(t.completionDate);
        return date.getMonth() === 11 && date.getFullYear() === 2024; // December is month 11 (0-indexed)
      }
      return false;
    }).length);
    console.log('Sample December 2024 tasks:', this.mockDatabase.tasks.filter(t => {
      if (t.completionDate) {
        const date = new Date(t.completionDate);
        return date.getMonth() === 11 && date.getFullYear() === 2024;
      }
      return false;
    }).slice(0, 3));
    console.log('=== END MOCK DATA DEBUGGING ===');
    
    this.applyFilter(); // Initial data load
  }

  private initializeFilterOptions(): void {
    // Populate command options including an "All Commands" option
    this.commandOptions = [
      { label: 'All Commands', value: 'ALL_COMMANDS' }, // Added "All Commands" option
      { label: 'Eastern Command', value: 'Eastern' },
      { label: 'Western Command', value: 'Western' },
      { label: 'Southern Command', value: 'Southern' }
    ];
    this.selectedCommand = 'ALL_COMMANDS'; // Default to "All Commands"

    // Populate ship options including an "All Ships" option (all unique ships regardless of command initially)
    this.populateShipOptions(); // Call with no command to get all ships
    this.selectedShip = 'ALL_SHIPS'; // Default to "All Ships"
  }

  onOrganizationalFilterChange(event: any): void {
    this.selectedOrganizationalFilter = event.value;
    // No explicit reset of Command/Ship here as they are now independent filters.
    // Their relevance will be handled in getFilteredData.
    this.applyFilter();
  }

  onCommandChange(event: any): void {
    this.selectedCommand = event.value;
    // If a specific command is selected, update ship options to only show ships from that command.
    // If "All Commands" is selected, show all ships again.
    if (this.selectedCommand && this.selectedCommand !== 'ALL_COMMANDS') {
        this.populateShipOptions(this.selectedCommand);
    } else {
        this.populateShipOptions(); // Populate all ships
    }
    this.selectedShip = 'ALL_SHIPS'; // Reset ship selection to 'All Ships' for the new command context
    this.applyFilter();
  }

  onShipChange(event: any): void {
    this.selectedShip = event.value;
    this.applyFilter();
  }

  private populateShipOptions(command: string | null = null): void {
    let ships: string[] = [];
    if (command && command !== 'ALL_COMMANDS') {
      // Filter ships by the selected command
      ships = [...new Set(this.mockDatabase.tasks
        .filter(task => task.scope === 'SHIP' && task.command === command)
        .map(task => task.ship)
        .filter(ship => ship !== null))] as string[];
    } else {
      // Get all unique ships from the entire database (when 'All Commands' or no specific command)
      ships = [...new Set(this.mockDatabase.tasks
        .filter(task => task.scope === 'SHIP')
        .map(task => task.ship)
        .filter(ship => ship !== null))] as string[];
    }

    // Always include "All Ships" as the first option
    this.shipOptions = [{ label: 'All Ships', value: 'ALL_SHIPS' }, ...ships.map(ship => ({ label: ship, value: ship }))];
  }


  applyFilter(): void {
    console.log(`Applying filter: OrgFilter=${this.selectedOrganizationalFilter}, Command=${this.selectedCommand}, Ship=${this.selectedShip}`);
    this.initializeKpiData();
    this.initializeChartData();
  }

  private initializeKpiData(): void {
    const filteredTasks = this.getFilteredData('tasks');
    const filteredAcquaints = this.getFilteredData('acquaints');
    const filteredOem = this.getFilteredData('oem');

    // Total Active Tasks
    this.kpiMetrics[0].value = filteredTasks.filter((t:any) => t.status === 'Active').length;
    // Overdue Tasks
    this.kpiMetrics[1].value = filteredTasks.filter((t:any) => t.status === 'Overdue').length;
    // Monthly Completion Rate (simplified, would need more sophisticated logic for real rate calculation)
    let completedThisMonth = filteredTasks.filter((t:any) => {
        if (t.status === 'Completed' && t.completionDate) {
            const completionDate = new Date(t.completionDate);
            const currentDate = new Date();
            return completionDate.getMonth() === currentDate.getMonth() && 
                   completionDate.getFullYear() === currentDate.getFullYear();
        }
        return false;
    }).length;
    
    // If no tasks completed this month, show recent completion rate (last 3 months)
    if (completedThisMonth === 0) {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        completedThisMonth = filteredTasks.filter((t:any) => {
            if (t.status === 'Completed' && t.completionDate) {
                const completionDate = new Date(t.completionDate);
                return completionDate >= threeMonthsAgo;
            }
            return false;
        }).length;
        
        // Keep the original title - don't change it
        // this.kpiMetrics[2].title remains 'Monthly Completion Rate'
    }
    
    const totalPlannedThisMonth = filteredTasks.length; // Simplified total tasks for rate
    this.kpiMetrics[2].value = totalPlannedThisMonth > 0 ? `${((completedThisMonth / totalPlannedThisMonth) * 100).toFixed(0)}%` : '0%';
    
    console.log('KPI Calculation - completedThisMonth:', completedThisMonth, 'totalPlannedThisMonth:', totalPlannedThisMonth);
    // OEM Routine Optimizations
    this.kpiMetrics[3].value = filteredOem.filter((o:any) => o.efficiencyScore < 6).length + ' New'; // Example criteria for 'new optimizations'
  }

  private initializeChartData(): void {
    const appColors = {
      primary: '#1e40af',
      secondary: '#6d28d9',
      success: '#22c55e',
      warning: '#facc15',
      danger: '#ef4444',
      info: '#3b82f6',
      neutral: '#a8a8a8',
      text: '#333333',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      background: '#f9fafb'
    };

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color') || appColors.text;
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || appColors.textSecondary;
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || appColors.border;

    const filteredTasks = this.getFilteredData('tasks');
    const filteredAcquaints = this.getFilteredData('acquaints');
    const filteredSpares = this.getFilteredData('spares');
    const filteredOem = this.getFilteredData('oem');

    // --- Task Status Doughnut Chart ---
    const activeCount = filteredTasks.filter((t:any) => t.status === 'Active').length;
    const completedCount = filteredTasks.filter((t:any) => t.status === 'Completed').length;
    const overdueCount = filteredTasks.filter((t:any) => t.status === 'Overdue').length;
    const pendingCount = filteredTasks.filter((t:any) => t.status === 'Pending Approval').length;
    this.taskStatusData = {
      labels: ['Active', 'Completed', 'Overdue', 'Pending Approval'],
      datasets: [
        {
          data: [activeCount, completedCount, overdueCount, pendingCount],
          backgroundColor: [appColors.info, appColors.success, appColors.danger, appColors.warning],
          hoverBackgroundColor: [appColors.info + 'CC', appColors.success + 'CC', appColors.danger + 'CC', appColors.warning + 'CC']
        }
      ]
    };
    this.taskStatusOptions = {
      cutout: '60%', plugins: { legend: { labels: { color: textColor } }, tooltip: { callbacks: { label: (context: any) => { const label = context.label || ''; const value = context.raw; const total = context.dataset.data.reduce((sum: number, current: number) => sum + current, 0); const percentage = ((value / total) * 100).toFixed(1); return `${label}: ${value} (${percentage}%)`; } } } }
    };

    // --- Monthly Task Completion Trend Line Chart ---
    const monthlyCompleted: number[] = Array(6).fill(0); // For Jan-Jun
    const monthlyPlanned: number[] = Array(6).fill(0);
    filteredTasks.forEach((task:any) => {
        if (task.completionDate) {
            const monthIndex = new Date(task.completionDate).getMonth(); // 0 for Jan, 1 for Feb...
            if (monthIndex >= 0 && monthIndex < 6) { // Only for Jan-Jun
                if (task.status === 'Completed') monthlyCompleted[monthIndex]++;
            }
        }
        // Simplified: assuming all tasks are "planned" for some month
        if (task.dueDate) {
          const monthIndex = new Date(task.dueDate).getMonth();
          if (monthIndex >=0 && monthIndex < 6) {
            monthlyPlanned[monthIndex]++;
          }
        }
    });

    this.monthlyCompletionData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        { label: 'Tasks Completed', data: monthlyCompleted, fill: false, borderColor: appColors.primary, tension: 0.4 },
        { label: 'Planned Tasks', data: monthlyPlanned, fill: false, borderColor: appColors.neutral, borderDash: [5, 5], tension: 0.4 }
      ]
    };
    this.monthlyCompletionOptions = {
      maintainAspectRatio: false, aspectRatio: 0.6, plugins: { legend: { labels: { color: textColor } } }, scales: { x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } }, y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } } }
    };

    // --- Acquaints Raised by Reason Bar Chart ---
    const acquaintReasons = ['Equipment Failure', 'Routine Anomaly', 'Tool Issue', 'Spares Defect', 'Operational Feedback'];
    const acquaintsCounts = acquaintReasons.map(reason => filteredAcquaints.filter((acq:any) => acq.reason === reason).length);
    this.acquaintsByReasonData = {
      labels: acquaintReasons,
      datasets: [
        { label: 'Number of Acquaints', data: acquaintsCounts, backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'], borderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'], borderWidth: 1 }
      ]
    };
    this.acquaintsByReasonOptions = {
      maintainAspectRatio: false, aspectRatio: 0.6, plugins: { legend: { labels: { color: textColor } } }, scales: { x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } }, y: { beginAtZero: true, ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } } }
    };

    // --- Spares Consumption by Category Pie Chart ---
    const spareCategories = ['Mechanical', 'Electrical', 'Hydraulic', 'Consumables', 'Specialized'];
    const sparesCounts = spareCategories.map(cat => filteredSpares.filter((spare:any) => spare.category === cat).reduce((sum: number, current: any) => sum + current.quantity, 0)); // Sum of quantity
    this.sparesConsumptionData = {
      labels: spareCategories,
      datasets: [
        { data: sparesCounts, backgroundColor: ['#4BC0C0', '#FFCE56', '#E7E9ED', '#A7D9D9', '#8B80C6'], hoverBackgroundColor: ['#4BC0C0CC', '#FFCE56CC', '#E7E9EDCC', '#A7D9D9CC', '#8B80C6CC'] }
      ]
    };
    this.sparesConsumptionOptions = {
      plugins: { legend: { labels: { color: textColor } }, tooltip: { callbacks: { label: (context: any) => { const label = context.label || ''; const value = context.raw; const total = context.dataset.data.reduce((sum: number, current: number) => sum + current, 0); const percentage = ((value / total) * 100).toFixed(1); return `${label}: ${value} Units (${percentage}%)`; } } } }
    };

    // --- OEM Routine Efficiency Score Horizontal Bar Chart ---
    // For OEM, we want average efficiency score per OEM within the filtered scope
    const oemLabels = [...new Set(filteredOem.map((o:any) => o.oem))]; // Get unique OEM labels from filtered data
    const oemEfficiencyScores = oemLabels.map(oem => {
      const oemItems = filteredOem.filter((o:any) => o.oem === oem);
      const totalScore = oemItems.reduce((sum: number, current: any) => sum + current.efficiencyScore, 0);
      return oemItems.length > 0 ? parseFloat((totalScore / oemItems.length).toFixed(1)) : 0;
    });

    this.oemEfficiencyData = {
      labels: oemLabels,
      datasets: [
        { label: 'Avg. Efficiency Score (Lower is Better)', data: oemEfficiencyScores, backgroundColor: ['#FF9933', '#66B3BA', '#C2B280', '#8A2BE2', '#CD853F', '#FF6384', '#36A2EB'], borderColor: ['#FF9933', '#66B3BA', '#C2B280', '#8A2BE2', '#CD853F', '#FF6384', '#36A2EB'], borderWidth: 1 }
      ]
    };
    this.oemEfficiencyOptions = {
      indexAxis: 'y', maintainAspectRatio: false, aspectRatio: 0.8, plugins: { legend: { labels: { color: textColor } } }, scales: { x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } }, y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } } }
    };
  }

  private initializeExportOptions(): void {
    this.exportOptions = [
      {
        label: 'Export Dashboard Summary (PDF)',
        icon: 'pi pi-file-pdf',
        command: () => this.exportPDF(),
      },
      {
        label: 'Export Dashboard Data (Excel)',
        icon: 'pi pi-file-excel',
        command: () => this.exportExcel(),
      },
    ];
  }

  // --- Drill Down Logic for Charts and Cards ---
  drillDown(event: any, type: string): void {
    let drilldownData: any[] = [];
    let drilldownColumns: any[] = [];
    let dialogTitle = '';

    console.log(`Drill down event received for type: ${type}`);

    const isChartClick = event && event.element && event.chart && event.chart.data;

    // Get the data relevant to the current filter selection
    const currentFilteredTasks = this.getFilteredData('tasks');
    const currentFilteredAcquaints = this.getFilteredData('acquaints');
    const currentFilteredSpares = this.getFilteredData('spares');
    const currentFilteredOem = this.getFilteredData('oem');

    if (isChartClick) {
      const datasetIndex = event.element.datasetIndex;
      const index = event.element.index;

      if (!event.chart.data.labels || event.chart.data.labels.length <= index ||
          !event.chart.data.datasets || event.chart.data.datasets.length <= datasetIndex ||
          !event.chart.data.datasets[datasetIndex].data || event.chart.data.datasets[datasetIndex].data.length <= index) {
          console.warn("Chart data or labels are incomplete for the clicked element.");
          return;
      }

      const label = event.chart.data.labels[index];
      const value = event.chart.data.datasets[datasetIndex].data[index];
      const color = event.chart.data.datasets[datasetIndex].backgroundColor[index];
      console.log(`Chart Clicked: Label=${label}, Value=${value}, Color=${color}`);

      switch (type) {
        case 'TASK_STATUS':
          dialogTitle = `Detailed Tasks: ${label}`;
          drilldownData = currentFilteredTasks.filter((task:any) => task.status === label);
          drilldownColumns = [
            { field: 'taskId', header: 'Task ID' }, { field: 'description', header: 'Description' },
            { field: 'ship', header: 'Ship' }, { field: 'assignedTo', header: 'Assigned To' },
            { field: 'dueDate', header: 'Due Date' }, { field: 'status', header: 'Status' }
          ];
          break;
        case 'MONTHLY_TREND':
          dialogTitle = `Tasks in ${label}`;
          drilldownData = currentFilteredTasks.filter((task:any) =>
            (task.completionDate && new Date(task.completionDate).toLocaleString('en-US', { month: 'short' }) === label) ||
            (task.dueDate && new Date(task.dueDate).toLocaleString('en-US', { month: 'short' }) === label)
          );
          drilldownColumns = [
            { field: 'taskId', header: 'Task ID' }, { field: 'description', header: 'Description' },
            { field: 'completionDate', header: 'Completion Date' }, { field: 'dueDate', header: 'Due Date' }, { field: 'status', header: 'Status' }
          ];
          break;
        case 'ACQUAINTS_REASON':
          dialogTitle = `Acquaints for Reason: ${label}`;
          const reasonColorsAcquaints: { [key: string]: string } = {
            'Equipment Failure': '#FF6384', 'Routine Anomaly': '#36A2EB', 'Tool Issue': '#FFCE56', 'Spares Defect': '#4BC0C0', 'Operational Feedback': '#9966FF'
          };
          drilldownData = currentFilteredAcquaints.filter((acq:any) => acq.reason === label).map((acq:any) => ({ ...acq, displayColor: reasonColorsAcquaints[acq.reason] || '#CCCCCC' }));
          drilldownColumns = [
            { field: 'acquaintId', header: 'Acquaint ID' }, { field: 'equipment', header: 'Equipment' },
            { field: 'reason', header: 'Reason' }, { field: 'reportedBy', header: 'Reported By' },
            { field: 'dateRaised', header: 'Date Raised' }, { field: 'displayColor', header: 'Color' }
          ];
          break;
        case 'SPARES_CONSUMPTION':
          dialogTitle = `Spares Consumption: ${label}`;
          const categoryColorsSpares: { [key: string]: string } = {
            'Mechanical': '#4BC0C0', 'Electrical': '#FFCE56', 'Hydraulic': '#E7E9ED', 'Consumables': '#A7D9D9', 'Specialized': '#8B80C6'
          };
          drilldownData = currentFilteredSpares.filter((spare:any) => spare.category === label).map((spare:any) => ({ ...spare, displayColor: categoryColorsSpares[spare.category] || '#CCCCCC' }));
          drilldownColumns = [
            { field: 'partNo', header: 'Part No.' }, { field: 'description', header: 'Description' },
            { field: 'quantity', header: 'Quantity' }, { field: 'value', header: 'Value (₹)' },
            { field: 'consumedDate', header: 'Consumed Date' }, { field: 'displayColor', header: 'Color' }
          ];
          break;
        case 'OEM_EFFICIENCY':
          dialogTitle = `OEM Efficiency Details: ${label}`;
          const oemColors: { [key: string]: string } = {
            'OEM A (DA)': '#FF9933', 'OEM B (Compressor)': '#66B3BA', 'OEM C (AC)': '#C2B280', 'OEM D (Steering)': '#8A2BE2', 'OEM E (Radar)': '#CD853F', 'OEM F (IT)': '#FF6384', 'OEM G (Network)': '#36A2EB'
          };
          drilldownData = currentFilteredOem.filter((detail:any) => detail.oem === label).map((detail:any) => ({ ...detail, displayColor: oemColors[detail.oem] || '#CCCCCC' }));
          drilldownColumns = [
            { field: 'routineName', header: 'Routine Name' }, { field: 'equipment', header: 'Equipment' },
            { field: 'oem', header: 'OEM' }, { field: 'defectCount', header: 'Defect Count' },
            { field: 'efficiencyScore', header: 'Efficiency Score' }, { field: 'displayColor', header: 'Color' }
          ];
          break;
        default:
          dialogTitle = 'Drilldown Data';
          drilldownData = [{ message: 'No specific drilldown data available for this selection.' }];
          drilldownColumns = [{ field: 'message', header: 'Information' }];
      }
    } else { // KPI Card click event
        const kpiType = type;
        dialogTitle = `Details for: ${this.kpiMetrics.find(m => m.type === kpiType)?.title || kpiType}`;
        switch (kpiType) {
            case 'ACTIVE_TASKS':
                drilldownData = currentFilteredTasks.filter((task:any) => task.status === 'Active');
                drilldownColumns = [
                    { field: 'taskId', header: 'Task ID' }, { field: 'description', header: 'Description' },
                    { field: 'ship', header: 'Ship' }, { field: 'assignedTo', header: 'Assigned To' },
                    { field: 'dueDate', header: 'Due Date' }, { field: 'status', header: 'Status' }
                ];
                break;
            case 'OVERDUE_TASKS':
                drilldownData = currentFilteredTasks.filter((task:any) => task.status === 'Overdue');
                drilldownColumns = [
                    { field: 'taskId', header: 'Task ID' }, { field: 'description', header: 'Description' },
                    { field: 'ship', header: 'Ship' }, { field: 'assignedTo', header: 'Assigned To' },
                    { field: 'dueDate', header: 'Due Date' } // Removed overdueDays from mock, using dueDate
                ];
                break;
            case 'MONTHLY_COMPLETION':
                // This KPI drilldown might show all tasks that contributed to the monthly completion rate within the filter scope
                console.log('Filtering for MONTHLY_COMPLETION...');
                console.log('Current date:', new Date());
                console.log('Current month:', new Date().getMonth());
                console.log('All filtered tasks:', currentFilteredTasks);
                
                // First try to get tasks from current month
                drilldownData = currentFilteredTasks.filter((t:any) => {
                    if (t.completionDate) {
                        const completionDate = new Date(t.completionDate);
                        const currentDate = new Date();
                        const monthMatch = completionDate.getMonth() === currentDate.getMonth();
                        const yearMatch = completionDate.getFullYear() === currentDate.getFullYear();
                        console.log(`Task ${t.taskId}: completionDate=${t.completionDate}, parsed=${completionDate}, monthMatch=${monthMatch}, yearMatch=${yearMatch}`);
                        return monthMatch && yearMatch;
                    }
                    return false;
                });
                
                // If no tasks found for current month, show recent completed tasks (last 3 months)
                if (drilldownData.length === 0) {
                    console.log('No tasks found for current month, showing recent completed tasks...');
                    const threeMonthsAgo = new Date();
                    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                    
                    drilldownData = currentFilteredTasks.filter((t:any) => {
                        if (t.completionDate && t.status === 'Completed') {
                            const completionDate = new Date(t.completionDate);
                            return completionDate >= threeMonthsAgo;
                        }
                        return false;
                    }).slice(0, 10); // Limit to 10 most recent
                }
                
                console.log('Final filtered monthly completion tasks:', drilldownData);
                drilldownColumns = [
                    { field: 'taskId', header: 'Task ID' }, { field: 'description', header: 'Description' },
                    { field: 'completionDate', header: 'Completion Date' }, { field: 'status', header: 'Status' }
                ];
                break;
            case 'OEM_OPTIMIZATIONS':
                drilldownData = currentFilteredOem.filter((o:any) => o.efficiencyScore < 6); // Example for 'new optimizations'
                drilldownColumns = [
                    { field: 'oem', header: 'OEM' }, { field: 'equipment', header: 'Equipment Type' },
                    { field: 'routineName', header: 'Routine Name' }, { field: 'estimatedBenefit', header: 'Est. Benefit' } // Add this field to mock if needed
                ];
                break;
            default:
                drilldownData = [{ message: 'No specific drilldown data available for this KPI.' }];
                drilldownColumns = [{ field: 'message', header: 'Information' }];
                break;
        }
    }

    this.drilldownDialogTitle = dialogTitle;
    this.drilldownTableData = drilldownData;
    this.drilldownTableCols = drilldownColumns;
    this.displayDrilldownDialog = true;
  }

  onHideDrilldownDialog(): void {
    this.displayDrilldownDialog = false;
    this.drilldownTableData = [];
    this.drilldownTableCols = [];
    this.drilldownDialogTitle = '';
  }

  // --- Centralized Data Filtering Logic ---
  private getFilteredData(dataType: 'tasks' | 'acquaints' | 'spares' | 'oem'): any[] {
    let data: any[] = this.mockDatabase[dataType];
    
    console.log(`getFilteredData(${dataType}) - Initial data length:`, data.length);
    console.log(`getFilteredData(${dataType}) - Selected filters:`, {
      org: this.selectedOrganizationalFilter,
      command: this.selectedCommand,
      ship: this.selectedShip
    });

    // 1. Apply Organizational Filter (INSMAT vs NHQ)
    if (this.selectedOrganizationalFilter === 'NHQ') {
      data = data.filter((item: any) => item.scope === 'NHQ');
      console.log(`getFilteredData(${dataType}) - After NHQ filter:`, data.length);
    }
    // If 'INSMAT' is selected, no initial filter is applied here, as INSMAT means overall.
    // This allows command/ship filters to then slice the whole dataset.

    // 2. Apply Command Filter
    if (this.selectedCommand && this.selectedCommand !== 'ALL_COMMANDS') {
      data = data.filter((item: any) =>
        (item.scope === 'COMMAND' || item.scope === 'SHIP') && // Only filter items that have command relevance
        item.command === this.selectedCommand
      );
      console.log(`getFilteredData(${dataType}) - After command filter:`, data.length);
    }
    // If 'ALL_COMMANDS' is selected, no filter is applied by command.

    // 3. Apply Ship Filter
    if (this.selectedShip && this.selectedShip !== 'ALL_SHIPS') {
      data = data.filter((item: any) =>
        item.scope === 'SHIP' && // Only filter items that are specifically ship-level
        item.ship === this.selectedShip
      );
      console.log(`getFilteredData(${dataType}) - After ship filter:`, data.length);
    }
    // If 'ALL_SHIPS' is selected, no filter is applied by ship.

    console.log(`getFilteredData(${dataType}) - Final filtered data length:`, data.length);
    if (dataType === 'tasks') {
      console.log('Sample tasks with completion dates:', data.filter(t => t.completionDate).slice(0, 3));
    }
    
    return data;
  }


  // --- General Actions ---
  exportPDF(): void {
    console.log('Exporting Maintop Dashboard Summary as PDF');
    alert('Dashboard Summary PDF export simulated!');
  }

  exportExcel(): void {
    console.log('Exporting Maintop Dashboard Data as Excel');
    alert('Dashboard Data Excel export simulated!');
  }

  goBack(): void {
    this.location.back();
  }
}