import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar'; // Import CalendarModule for date range picker
import { SliderModule } from 'primeng/slider'; // Import SliderModule for the date range slider

// Import Chart and the zoom plugin, along with necessary scales and elements for time series
import { Chart as ChartJS, TimeScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import { SystemWiseDefectActivityChartComponent } from "../../system-wise-defect-activity-chart/system-wise-defect-activity-chart.component"; // Import the date adapter for time scales
import { DashboardCardComponent } from '../../../shared/components/dashboard-card/dashboard-card.component';
import { DrtChartComponent } from '../../drt-chart/drt-chart.component';

// Register the plugin and necessary Chart.js components globally.
ChartJS.register(zoomPlugin, TimeScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

// --- Interfaces for DART Data ---
interface Defect {
  defectId: string;
  description: string;
  department: string; // From Master Tables
  defectType: string; // From Master Tables
  equipment: string; // M_Equipment
  system: string; // M_Generic
  priority: 'Critical' | 'High' | 'Medium' | 'Low'; // Defect Severity Master
  status: 'Logged' | 'Under Verification' | 'Approved/Rejected' | 'Resolved'; // Defect Status Master
  reportedBy: string;
  dateLogged: string;
  lastUpdated: string;
  actionTaken?: string; // Action Taken Table
  resolutionMethod?: string; // Resolution Method Master
  resolutionDate?: string;
  attachments?: string[]; // URLs or file names
  scope: 'NHQ' | 'COMMAND' | 'SHIP';
  command: string | null;
  ship: string | null;
}

interface Routine {
  routineId: string;
  routineType: string; // Routine Type Table (Daily Checks, Safety Inspections, Departmental SOP Routines)
  department: string;
  timeTakenHours: number;
  sparesConsumed: string[]; // PartNo from Maintop Spares
  outcome: string; // Routine Outcome Master
  equipmentTagged: string[]; // M_Equipment
  datePerformed: string;
  reportedBy: string;
  scope: 'NHQ' | 'COMMAND' | 'SHIP';
  command: string | null;
  ship: string | null;
}

// Union type for all possible DART items for filtering purposes
type DartItem = Defect | Routine;

// Type for the mock database structure
type DartDataTypeMap = {
  defects: Defect[];
  routines: Routine[];
};

@Component({
  selector: 'app-dart-dashboard',
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
    CalendarModule, // Added CalendarModule
    SliderModule,
    SystemWiseDefectActivityChartComponent,
    DrtChartComponent
],
  templateUrl: './dart-dashboard.component.html',
  styleUrls: ['./dart-dashboard.component.scss'],
})
export class DartDashboardComponent implements OnInit {

  // --- Filter Properties (Similar to Maintop, but adapted for DART) ---
  organizationalFilterOptions: { label: string, value: string }[] = [
    { label: 'Overall (INSMAT)', value: 'INSMAT' },
    { label: 'Naval Headquarters (NHQ)', value: 'NHQ' }
  ];
  selectedOrganizationalFilter: string = 'INSMAT';

  commandOptions: { label: string, value: string }[] = [];
  selectedCommand: string | null = null;

  shipOptions: { label: string, value: string }[] = [];
  selectedShip: string | null = null;

  // --- KPI Card Data for DART ---
  kpiMetrics = [
    {
      title: 'Total Open Defects',
      value: 0,
      description: 'Defects currently active, under verification, or approved.',
      iconClass: 'pi pi-exclamation-triangle',
      type: 'TOTAL_OPEN_DEFECTS',
      color: '#ef4444' // Red for critical attention
    },
    {
      title: 'Critical Defects',
      value: 0,
      description: 'High-priority defects requiring immediate attention.',
      iconClass: 'pi pi-bolt',
      type: 'CRITICAL_DEFECTS',
      color: '#dc2626' // Darker red for critical
    },
    {
      title: 'Avg. Resolution Time (Days)',
      value: '0 days',
      description: 'Average time taken to resolve defects.',
      iconClass: 'pi pi-hourglass',
      type: 'AVG_RESOLUTION_TIME',
      color: '#f59e0b' // Amber for time
    },
    {
      title: 'Defects Awaiting Verification',
      value: 0,
      description: 'Defects logged but not yet verified or approved.',
      iconClass: 'pi pi-hourglass',
      type: 'DEFECTS_AWAITING_VERIFICATION',
      color: '#3b82f6' // Blue for pending
    },
  ];

  // --- Chart Data & Options ---
  defectsByStatusData: any; defectsByStatusOptions: any;
  defectsByPriorityData: any; defectsByPriorityOptions: any;
  topRecurringDefectsData: any; topRecurringDefectsOptions: any;
  defectsByDepartmentData: any; defectsByDepartmentOptions: any;
  monthlyDefectTrendData: any; monthlyDefectTrendOptions: any;

  // --- Scatter Chart Data & Options ---
  scatterChartData: any;
  scatterChartOptions: any;
  @ViewChild('scatterChart') scatterChart: any; // For zoom reset

  // --- Date Range Filter (p-calendar) ---
  dateRange: Date[] = []; // Stores the selected date range [startDate, endDate]
  minDate!: Date; // Minimum date for the calendar
  maxDate!: Date; // Maximum date for the calendar

  // --- Date Range Slider (p-slider) for Scatter Chart ---
  dateSliderValues: number[] = []; // [minTimestamp, maxTimestamp] for the slider
  minSliderValue!: number; // Overall min timestamp for the slider
  maxSliderValue!: number; // Overall max timestamp for the slider

  // --- Drill-down Dialog Properties ---
  displayDrilldownDialog: boolean = false;
  drilldownDialogTitle: string = '';
  drilldownTableData: any[] = [];
  drilldownTableCols: any[] = [];

  // --- SRAR KPI Data ---
  // Mock data for SRAR KPI calculations
  private srarShipData = [
    { shipId: 'INS001', shipName: 'INS Vikrant', totalRHAtSea: 1250, avgRHAtSea: 24.5, maxRHAtSea: 28.0, operational: true },
    { shipId: 'INS002', shipName: 'INS Delhi', totalRHAtSea: 1180, avgRHAtSea: 22.7, maxRHAtSea: 32.0, operational: true },
    { shipId: 'INS003', shipName: 'INS Mumbai', totalRHAtSea: 1150, avgRHAtSea: 21.7, maxRHAtSea: 32.0, operational: true },
    { shipId: 'INS004', shipName: 'INS Kolkata', totalRHAtSea: 1200, avgRHAtSea: 23.3, maxRHAtSea: 32.0, operational: true },
    { shipId: 'INS005', shipName: 'INS Shivalik', totalRHAtSea: 980, avgRHAtSea: 19.3, maxRHAtSea: 30.0, operational: true },
    { shipId: 'INS006', shipName: 'INS Satpura', totalRHAtSea: 1020, avgRHAtSea: 20.7, maxRHAtSea: 30.0, operational: true },
    { shipId: 'INS007', shipName: 'INS Sahyadri', totalRHAtSea: 990, avgRHAtSea: 19.7, maxRHAtSea: 30.0, operational: true },
    { shipId: 'INS008', shipName: 'INS Kamorta', totalRHAtSea: 820, avgRHAtSea: 17.3, maxRHAtSea: 25.0, operational: true },
    { shipId: 'INS009', shipName: 'INS Kadmatt', totalRHAtSea: 840, avgRHAtSea: 18.0, maxRHAtSea: 25.0, operational: true },
    { shipId: 'INS010', shipName: 'INS Kiltan', totalRHAtSea: 810, avgRHAtSea: 17.0, maxRHAtSea: 25.0, operational: true },
    { shipId: 'INS011', shipName: 'INS Chennai', totalRHAtSea: 1100, avgRHAtSea: 21.2, maxRHAtSea: 30.0, operational: false },
    { shipId: 'INS012', shipName: 'INS Delhi', totalRHAtSea: 1080, avgRHAtSea: 20.8, maxRHAtSea: 32.0, operational: false },
    { shipId: 'INS013', shipName: 'INS Mumbai', totalRHAtSea: 1050, avgRHAtSea: 20.2, maxRHAtSea: 32.0, operational: false },
    { shipId: 'INS014', shipName: 'INS Kolkata', totalRHAtSea: 1120, avgRHAtSea: 21.5, maxRHAtSea: 32.0, operational: false },
    { shipId: 'INS015', shipName: 'INS Shivalik', totalRHAtSea: 920, avgRHAtSea: 17.7, maxRHAtSea: 30.0, operational: false }
  ];

  // --- Mock Data Store for DART ---
  private mockDatabase: DartDataTypeMap = {
    defects: [
      // NHQ Level Defects (no ship/command)
      { defectId: 'D-NHQ-001', description: 'Policy Document Discrepancy', department: 'Policy', defectType: 'Documentation', equipment: 'N/A', system: 'CMS', priority: 'Medium', status: 'Logged', reportedBy: 'Admin', dateLogged: '2024-01-20', lastUpdated: '2024-01-20', scope: 'NHQ', command: null, ship: null },
      { defectId: 'D-NHQ-002', description: 'Software Glitch in Central System', department: 'IT', defectType: 'Software Bug', equipment: 'Central Server', system: 'CMMS Core', priority: 'High', status: 'Under Verification', reportedBy: 'IT Lead', dateLogged: '2024-02-15', lastUpdated: '2024-02-22', scope: 'NHQ', command: null, ship: null },
      { defectId: 'D-NHQ-003', description: 'Procurement Process Delay', department: 'Logistics', defectType: 'Process', equipment: 'N/A', system: 'Supply Chain', priority: 'Low', status: 'Resolved', reportedBy: 'Logistics Head', dateLogged: '2024-03-01', lastUpdated: '2024-03-05', resolutionDate: '2024-03-05', scope: 'NHQ', command: null, ship: null },
      { defectId: 'D-NHQ-004', description: 'Security Protocol Vulnerability', department: 'Cyber Security', defectType: 'Security', equipment: 'Firewall', system: 'Network', priority: 'Critical', status: 'Logged', reportedBy: 'Security Analyst', dateLogged: '2024-04-10', lastUpdated: '2024-04-10', scope: 'NHQ', command: null, ship: null },

      // Command Level Defects
      { defectId: 'D-EC-001', description: 'Minor structural crack in quay', department: 'Engineering', defectType: 'Infrastructure', equipment: 'Quay', system: 'Port Facilities', priority: 'Medium', status: 'Approved/Rejected', reportedBy: 'Engg Officer', dateLogged: '2024-05-01', lastUpdated: '2024-05-05', scope: 'COMMAND', command: 'Eastern', ship: null, resolutionMethod: 'Scheduled Repair' },
      { defectId: 'D-WC-001', description: 'Network outage in Command HQ', department: 'IT', defectType: 'Network', equipment: 'Router', system: 'Command Network', priority: 'High', status: 'Resolved', reportedBy: 'IT Team', dateLogged: '2024-06-25', lastUpdated: '2024-07-01', resolutionDate: '2024-07-01', scope: 'COMMAND', command: 'Western', ship: null, actionTaken: 'Router replacement', resolutionMethod: 'Replacement' },
      { defectId: 'D-SC-001', description: 'HVAC malfunction in admin block', department: 'Logistics', defectType: 'Facilities', equipment: 'HVAC Unit', system: 'Building Services', priority: 'Low', status: 'Logged', reportedBy: 'Logistics Head', dateLogged: '2024-07-18', lastUpdated: '2024-07-18', scope: 'COMMAND', command: 'Southern', ship: null },
      { defectId: 'D-EC-002', description: 'Berthing line wear and tear', department: 'Operations', defectType: 'Infrastructure', equipment: 'Berthing Line', system: 'Port Operations', priority: 'Medium', status: 'Under Verification', reportedBy: 'Port Master', dateLogged: '2024-08-05', lastUpdated: '2024-08-07', scope: 'COMMAND', command: 'Eastern', ship: null },

      // Ship Level Defects
      { defectId: 'D-VIK-001', description: 'Main Engine - Excessive Vibration', department: 'Engineering', defectType: 'Mechanical', equipment: 'Main Engine', system: 'Propulsion', priority: 'Critical', status: 'Under Verification', reportedBy: 'Lt. Cmdr. Sharma', dateLogged: '2024-09-25', lastUpdated: '2024-09-26', scope: 'SHIP', command: 'Eastern', ship: 'INS Vikrant', attachments: ['engine_vib.jpg'] },
      { defectId: 'D-VIK-002', description: 'Radar System - Intermittent Signal Loss', department: 'Operations', defectType: 'Electrical', equipment: 'Radar System', system: 'Navigation', priority: 'High', status: 'Logged', reportedBy: 'Ops Officer', dateLogged: '2024-10-24', lastUpdated: '2024-10-24', scope: 'SHIP', command: 'Eastern', ship: 'INS Vikrant' },
      { defectId: 'D-CHE-001', description: 'Fire Pump - Reduced Pressure', department: 'Safety', defectType: 'Hydraulic', equipment: 'Fire Pump', system: 'Fire Fighting', priority: 'Critical', status: 'Resolved', reportedBy: 'Safety Officer', dateLogged: '2024-11-10', lastUpdated: '2024-11-12', resolutionDate: '2024-11-12', scope: 'SHIP', command: 'Western', ship: 'INS Chennai', actionTaken: 'Pump seal replacement', resolutionMethod: 'Repair' },
      { defectId: 'D-CHE-002', description: 'Galley Oven - Not Heating', department: 'Supply', defectType: 'Electrical', equipment: 'Oven', system: 'Galley', priority: 'Medium', status: 'Approved/Rejected', reportedBy: 'Chef', dateLogged: '2024-12-18', lastUpdated: '2024-12-20', scope: 'SHIP', command: 'Western', ship: 'INS Chennai' },
      { defectId: 'D-KOL-001', description: 'Auxiliary Generator - Oil Leak', department: 'Engineering', defectType: 'Plumbing', equipment: 'Auxiliary Generator', system: 'Power Generation', priority: 'High', status: 'Under Verification', reportedBy: 'PO Singh', dateLogged: '2025-01-23', lastUpdated: '2025-01-23', scope: 'SHIP', command: 'Eastern', ship: 'INS Kolkata' },
      { defectId: 'D-DEL-001', description: 'Communication Antenna - Malfunction', department: 'Communication', defectType: 'Electronic', equipment: 'Antenna', system: 'External Comms', priority: 'Critical', status: 'Logged', reportedBy: 'Comms Officer', dateLogged: '2025-02-26', lastUpdated: '2025-02-26', scope: 'SHIP', command: 'Western', ship: 'INS Delhi' },
      { defectId: 'D-MUM-001', description: 'Navigation Lights - Dim Output', department: 'Navigation', defectType: 'Electrical', equipment: 'Nav Lights', system: 'Navigation', priority: 'Medium', status: 'Resolved', reportedBy: 'Nav Officer', dateLogged: '2025-03-30', lastUpdated: '2025-04-03', resolutionDate: '2025-04-03', scope: 'SHIP', command: 'Southern', ship: 'INS Mumbai', actionTaken: 'Bulb replacement', resolutionMethod: 'Replacement' },
      { defectId: 'D-MUM-002', description: 'Hull Scratches - Minor', department: 'Hull', defectType: 'Structural', equipment: 'Hull', system: 'Ship Structure', priority: 'Low', status: 'Logged', reportedBy: 'Hull Petty Officer', dateLogged: '2025-04-20', lastUpdated: '2025-04-20', scope: 'SHIP', command: 'Southern', ship: 'INS Mumbai' },
      { defectId: 'D-VIK-003', description: 'Propeller Shaft - Minor Bearing Noise', department: 'Engineering', defectType: 'Mechanical', equipment: 'Propeller Shaft', system: 'Propulsion', priority: 'High', status: 'Approved/Rejected', reportedBy: 'Chief Engineer', dateLogged: '2025-05-10', lastUpdated: '2025-05-15', scope: 'SHIP', command: 'Eastern', ship: 'INS Vikrant' },
      { defectId: 'D-CHE-003', description: 'Life Raft - Inspection overdue', department: 'Safety', defectType: 'Safety Gear', equipment: 'Life Raft', system: 'Safety Systems', priority: 'Medium', status: 'Logged', reportedBy: 'Safety Officer', dateLogged: '2025-06-27', lastUpdated: '2025-06-27', scope: 'SHIP', command: 'Western', ship: 'INS Chennai' },
      { defectId: 'D-VIK-004', description: 'Navigation Software Glitch', department: 'IT', defectType: 'Software Bug', equipment: 'Nav Computer', system: 'Navigation', priority: 'High', status: 'Logged', reportedBy: 'IT Officer', dateLogged: '2025-06-05', lastUpdated: '2025-06-05', scope: 'SHIP', command: 'Eastern', ship: 'INS Vikrant' },
      { defectId: 'D-KOL-002', description: 'Fresh Water Generator Leak', department: 'Engineering', defectType: 'Plumbing', equipment: 'FW Generator', system: 'Water Systems', priority: 'Medium', status: 'Under Verification', reportedBy: 'PO Ram', dateLogged: '2025-06-12', lastUpdated: '2025-06-12', scope: 'SHIP', command: 'Eastern', ship: 'INS Kolkata' },
    ],
    routines: [
      { routineId: 'R-VIK-001', routineType: 'Daily Checks', department: 'Engineering', timeTakenHours: 0.5, sparesConsumed: [], outcome: 'Normal', equipmentTagged: ['Main Engine'], datePerformed: '2024-01-26', reportedBy: 'PO Singh', scope: 'SHIP', command: 'Eastern', ship: 'INS Vikrant' },
      { routineId: 'R-CHE-001', routineType: 'Safety Inspections', department: 'Safety', timeTakenHours: 1.0, sparesConsumed: [], outcome: 'Satisfactory', equipmentTagged: ['Fire Alarm'], datePerformed: '2024-02-25', reportedBy: 'Lt. Devi', scope: 'SHIP', command: 'Western', ship: 'INS Chennai' },
      { routineId: 'R-KOL-001', routineType: 'Departmental SOP Routines', department: 'Electrical', timeTakenHours: 2.0, sparesConsumed: ['EL-001'], outcome: 'Minor Adjustment', equipmentTagged: ['Switchboard'], datePerformed: '2024-03-24', reportedBy: 'Seaman Verma', scope: 'SHIP', command: 'Eastern', ship: 'INS Kolkata' },
      { routineId: 'R-DEL-001', routineType: 'Daily Checks', department: 'Navigation', timeTakenHours: 0.75, sparesConsumed: [], outcome: 'Normal', equipmentTagged: ['GPS'], datePerformed: '2024-04-23', reportedBy: 'Nav Officer', scope: 'SHIP', command: 'Western', ship: 'INS Delhi' },
      { routineId: 'R-MUM-001', routineType: 'Daily Checks', department: 'Hull', timeTakenHours: 0.25, sparesConsumed: [], outcome: 'Normal', equipmentTagged: ['Hull'], datePerformed: '2024-05-22', reportedBy: 'Hull Petty Officer', scope: 'SHIP', command: 'Southern', ship: 'INS Mumbai' },
      { routineId: 'R-EC-001', routineType: 'Departmental SOP Routines', department: 'Logistics', timeTakenHours: 3.0, sparesConsumed: [], outcome: 'Satisfactory', equipmentTagged: [], datePerformed: '2024-06-15', reportedBy: 'Logistics Officer', scope: 'COMMAND', command: 'Eastern', ship: null },
      { routineId: 'R-NHQ-001', routineType: 'Safety Inspections', department: 'Admin', timeTakenHours: 4.0, sparesConsumed: [], outcome: 'Satisfactory', equipmentTagged: [], datePerformed: '2024-07-10', reportedBy: 'Admin Chief', scope: 'NHQ', command: null, ship: null },
      { routineId: 'R-WC-001', routineType: 'Daily Checks', department: 'IT', timeTakenHours: 1.0, sparesConsumed: [], outcome: 'Normal', equipmentTagged: ['Server Rack'], datePerformed: '2024-08-01', reportedBy: 'IT Support', scope: 'COMMAND', command: 'Western', ship: null },
      { routineId: 'R-SC-001', routineType: 'Departmental SOP Routines', department: 'Engineering', timeTakenHours: 2.5, sparesConsumed: [], outcome: 'Minor Issue', equipmentTagged: ['Generator'], datePerformed: '2024-09-05', reportedBy: 'Engg Team', scope: 'COMMAND', command: 'Southern', ship: null },
      { routineId: 'R-VIK-002', routineType: 'Safety Inspections', department: 'Safety', timeTakenHours: 1.5, sparesConsumed: [], outcome: 'Satisfactory', equipmentTagged: ['Lifeboat'], datePerformed: '2024-10-15', reportedBy: 'Safety Officer', scope: 'SHIP', command: 'Eastern', ship: 'INS Vikrant' },
      { routineId: 'R-CHE-002', routineType: 'Daily Checks', department: 'Supply', timeTakenHours: 0.8, sparesConsumed: [], outcome: 'Normal', equipmentTagged: ['Pantry'], datePerformed: '2024-11-20', reportedBy: 'Chef', scope: 'SHIP', command: 'Western', ship: 'INS Chennai' },
      { routineId: 'R-KOL-002', routineType: 'Departmental SOP Routines', department: 'Operations', timeTakenHours: 3.0, sparesConsumed: [], outcome: 'Normal', equipmentTagged: ['Bridge Console'], datePerformed: '2024-12-01', reportedBy: 'Ops Officer', scope: 'SHIP', command: 'Eastern', ship: 'INS Kolkata' },
      { routineId: 'R-DEL-002', routineType: 'Safety Inspections', department: 'Communication', timeTakenHours: 1.2, sparesConsumed: [], outcome: 'Satisfactory', equipmentTagged: ['Radio'], datePerformed: '2025-01-10', reportedBy: 'Comms Officer', scope: 'SHIP', command: 'Western', ship: 'INS Delhi' },
      { routineId: 'R-MUM-002', routineType: 'Daily Checks', department: 'Navigation', timeTakenHours: 0.6, sparesConsumed: [], outcome: 'Normal', equipmentTagged: ['Chart Table'], datePerformed: '2025-02-15', reportedBy: 'Nav Officer', scope: 'SHIP', command: 'Southern', ship: 'INS Mumbai' },
      { routineId: 'R-EC-002', routineType: 'Daily Checks', department: 'Engineering', timeTakenHours: 0.7, sparesConsumed: [], outcome: 'Normal', equipmentTagged: ['Docking Equipment'], datePerformed: '2025-03-01', reportedBy: 'Engg Officer', scope: 'COMMAND', command: 'Eastern', ship: null },
      { routineId: 'R-NHQ-002', routineType: 'Departmental SOP Routines', department: 'Policy', timeTakenHours: 5.0, sparesConsumed: [], outcome: 'Normal', equipmentTagged: [], datePerformed: '2025-04-05', reportedBy: 'Policy Analyst', scope: 'NHQ', command: null, ship: null },
      { routineId: 'R-VIK-003', routineType: 'Daily Checks', department: 'Engineering', timeTakenHours: 0.5, sparesConsumed: [], outcome: 'Normal', equipmentTagged: ['Auxiliary Engine'], datePerformed: '2025-05-20', reportedBy: 'PO Singh', scope: 'SHIP', command: 'Eastern', ship: 'INS Vikrant' },
      { routineId: 'R-CHE-003', routineType: 'Safety Inspections', department: 'Safety', timeTakenHours: 1.0, sparesConsumed: [], outcome: 'Satisfactory', equipmentTagged: ['Life Vest'], datePerformed: '2025-06-10', reportedBy: 'Lt. Devi', scope: 'SHIP', command: 'Western', ship: 'INS Chennai' },
    ]
  };

  // ViewChild decorators to get references to the PrimeNG Chart components
  // These allow us to access the underlying Chart.js instances to call methods like resetZoom()
  @ViewChild('defectsByStatusChart') defectsByStatusChart: any;
  @ViewChild('defectsByPriorityChart') defectsByPriorityChart: any;
  @ViewChild('topRecurringDefectsChart') topRecurringDefectsChart: any;
  @ViewChild('defectsByDepartmentChart') defectsByDepartmentChart: any;
  @ViewChild('monthlyDefectTrendChart') monthlyDefectTrendChart: any;


  constructor(private location: Location) {}

  ngOnInit(): void {
    this.initializeFilterOptions();
    this.initializeDateRange(); // New method to set initial date range
    this.applyFilter(); // Initial data load
  }

  public initializeFilterOptions(): void {
    this.commandOptions = [
      { label: 'All Commands', value: 'ALL_COMMANDS' },
      { label: 'Eastern Command', value: 'Eastern' },
      { label: 'Western Command', value: 'Western' },
      { label: 'Southern Command', value: 'Southern' }
    ];
    this.selectedCommand = 'ALL_COMMANDS';

    this.populateShipOptions(); // Call with no command to get all ships
    this.selectedShip = 'ALL_SHIPS';
  }

  public initializeDateRange(): void {
    let allDates: Date[] = [];
    this.mockDatabase.defects.forEach(d => allDates.push(new Date(d.dateLogged)));
    this.mockDatabase.routines.forEach(r => allDates.push(new Date(r.datePerformed)));

    if (allDates.length > 0) {
      this.minDate = new Date(Math.min(...allDates.map(date => date.getTime())));
      this.maxDate = new Date(Math.max(...allDates.map(date => date.getTime())));
    } else {
      // Default to a reasonable range if no data
      this.minDate = new Date('2024-01-01');
      this.maxDate = new Date('2025-12-31');
    }
    // Set initial date range for p-calendar
    this.dateRange = [this.minDate, this.maxDate];

    // Set initial date range for p-slider (full range initially)
    this.minSliderValue = this.minDate.getTime();
    this.maxSliderValue = this.maxDate.getTime();
    this.dateSliderValues = [this.minSliderValue, this.maxSliderValue];
  }

  onOrganizationalFilterChange(event: any): void {
    this.selectedOrganizationalFilter = event.value;
    this.applyFilter();
  }

  onCommandChange(event: any): void {
    this.selectedCommand = event.value;
    if (this.selectedCommand && this.selectedCommand !== 'ALL_COMMANDS') {
        this.populateShipOptions(this.selectedCommand);
    } else {
        this.populateShipOptions();
    }
    this.selectedShip = 'ALL_SHIPS';
    this.applyFilter();
  }

  onShipChange(event: any): void {
    this.selectedShip = event.value;
    this.applyFilter();
  }

  onDateRangeChange(event: any): void {
    // event.value will be an array [startDate, endDate] or null if cleared
    this.dateRange = event.value;
    // Update slider values to match calendar selection
    if (this.dateRange && this.dateRange[0] && this.dateRange[1]) {
      this.dateSliderValues = [this.dateRange[0].getTime(), this.dateRange[1].getTime()];
    } else {
      // If calendar is cleared, reset slider to full range
      this.dateSliderValues = [this.minSliderValue, this.maxSliderValue];
    }
    this.applyFilter();
  }

  onDateSliderChange(event: any): void {
    // event.values will be [minTimestamp, maxTimestamp] from the slider
    const [minTs, maxTs] = event.values;
    // Update p-calendar's dateRange to reflect slider's selection
    this.dateRange = [new Date(minTs), new Date(maxTs)];
    this.applyFilter();
  }


  private populateShipOptions(command: string | null = null): void {
    let ships: string[] = [];
    // Extract ships from Defect data
    if (command && command !== 'ALL_COMMANDS') {
      ships = [...new Set(this.mockDatabase.defects
        .filter(defect => defect.scope === 'SHIP' && defect.command === command)
        .map(defect => defect.ship)
        .filter(ship => ship !== null))] as string[];
    } else {
      ships = [...new Set(this.mockDatabase.defects
        .filter(defect => defect.scope === 'SHIP')
        .map(defect => defect.ship)
        .filter(ship => ship !== null))] as string[];
    }
    this.shipOptions = [{ label: 'All Ships', value: 'ALL_SHIPS' }, ...ships.map(ship => ({ label: ship, value: ship }))];
  }

  applyFilter(): void {
    this.initializeKpiData();
    this.initializeChartData();
  }

  private initializeKpiData(): void {
    const filteredDefects = this.getFilteredData('defects') as Defect[]; // Cast to Defect[]

    this.kpiMetrics[0].value = filteredDefects.filter((d:any) => d.status !== 'Resolved').length;
    this.kpiMetrics[1].value = filteredDefects.filter((d:any) => d.priority === 'Critical' && d.status !== 'Resolved').length;

    const resolvedDefectsWithDate = filteredDefects.filter((d:any) => d.status === 'Resolved' && d.dateLogged && d.resolutionDate);
    if (resolvedDefectsWithDate.length > 0) {
      const totalDays = resolvedDefectsWithDate.reduce((sum: number, defect: any) => {
        const loggedDate = new Date(defect.dateLogged).getTime();
        const resolutionDate = new Date(defect.resolutionDate).getTime();
        return sum + (resolutionDate - loggedDate) / (1000 * 60 * 60 * 24); // Convert ms to days
      }, 0);
      this.kpiMetrics[2].value = `${(totalDays / resolvedDefectsWithDate.length).toFixed(1)} days`;
    } else {
      this.kpiMetrics[2].value = 'N/A';
    }

    this.kpiMetrics[3].value = filteredDefects.filter((d:any) => d.status === 'Under Verification').length;
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

    const filteredDefects = this.getFilteredData('defects') as Defect[]; // Cast to Defect[]
    const filteredRoutines = this.getFilteredData('routines') as Routine[]; // Cast to Routine[]

    // Helper function to get common zoom options for charts
    // This configuration enables both panning (dragging) and zooming (mouse wheel, pinch gestures).
    // Double-clicking on a chart will reset the zoom.
    const getZoomOptions = (mode: 'x' | 'y' | 'xy' = 'xy') => {
      return {
        pan: {
          enabled: true, // Enable panning (dragging the chart)
          mode: mode,    // Pan along specified axes
        },
        zoom: {
          wheel: {
            enabled: true, // Enable zooming with the mouse wheel
          },
          pinch: {
            enabled: true, // Enable zooming with pinch gestures on touch devices
          },
          mode: mode, // Zoom along specified axes
          // You can add onZoomComplete callback here if you need to react to zoom events,
          // for example, to update displayed data range or perform other actions.
          // onZoomComplete: ({ chart }) => {
          
          //   // Example: Update a state variable based on new zoom level
          // }
        },
      };
    };

    // --- Defects by Status (Doughnut Chart) ---
    const loggedCount = filteredDefects.filter((d:any) => d.status === 'Logged').length;
    const underVerificationCount = filteredDefects.filter((d:any) => d.status === 'Under Verification').length;
    const approvedRejectedCount = filteredDefects.filter((d:any) => d.status === 'Approved/Rejected').length;
    const resolvedCount = filteredDefects.filter((d:any) => d.status === 'Resolved').length;

    this.defectsByStatusData = {
      labels: ['Logged', 'Under Verification', 'Approved/Rejected', 'Resolved'],
      datasets: [
        {
          data: [loggedCount, underVerificationCount, approvedRejectedCount, resolvedCount],
          backgroundColor: [appColors.danger, appColors.warning, appColors.info, appColors.success],
          hoverBackgroundColor: [appColors.danger + 'CC', appColors.warning + 'CC', appColors.info + 'CC', appColors.success + 'CC']
        }
      ]
    };
    this.defectsByStatusOptions = {
      cutout: '60%',
      plugins: {
        legend: { labels: { color: textColor } },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label || '';
              const value = context.raw;
              const total = context.dataset.data.reduce((sum: number, current: number) => sum + current, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        },
        zoom: getZoomOptions() // Apply zoom options to this chart
      }
    };

    // --- Defects by Priority (Bar Chart) ---
    const criticalCount = filteredDefects.filter((d:any) => d.priority === 'Critical').length;
    const highCount = filteredDefects.filter((d:any) => d.priority === 'High').length;
    const mediumCount = filteredDefects.filter((d:any) => d.priority === 'Medium').length;
    const lowCount = filteredDefects.filter((d:any) => d.priority === 'Low').length;

    this.defectsByPriorityData = {
      labels: ['Critical', 'High', 'Medium', 'Low'],
      datasets: [
        {
          label: 'Number of Defects',
          data: [criticalCount, highCount, mediumCount, lowCount],
          backgroundColor: [appColors.danger, appColors.primary, appColors.warning, appColors.info],
          borderColor: [appColors.danger, appColors.primary, appColors.warning, appColors.info],
          borderWidth: 1
        }
      ]
    };
    this.defectsByPriorityOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: { labels: { color: textColor } },
        zoom: getZoomOptions() // Apply zoom options to this chart
      },
      scales: {
        x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } },
        y: { beginAtZero: true, ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } }
      }
    };

    // --- Top 5 Recurring Defects (Horizontal Bar Chart) ---
    const defectTypeCounts: { [key: string]: number } = {};
    filteredDefects.forEach((d:any) => {
      defectTypeCounts[d.defectType] = (defectTypeCounts[d.defectType] || 0) + 1;
    });
    const sortedDefectTypes = Object.entries(defectTypeCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5); // Top 5

    this.topRecurringDefectsData = {
      labels: sortedDefectTypes.map(([type]) => type),
      datasets: [
        {
          label: 'Count',
          data: sortedDefectTypes.map(([, count]) => count),
          backgroundColor: appColors.primary,
          borderColor: appColors.primary,
          borderWidth: 1
        }
      ]
    };
    this.topRecurringDefectsOptions = {
      indexAxis: 'y', // Horizontal bars
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: { labels: { color: textColor } },
        zoom: getZoomOptions() // Apply zoom options to this chart
      },
      scales: {
        x: { beginAtZero: true, ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } },
        y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } }
      }
    };

    // --- Defects by Department (Stacked Bar Chart - Example) ---
    const departments = [...new Set(filteredDefects.map((d:any) => d.department))];
    const statusTypes = ['Logged', 'Under Verification', 'Approved/Rejected', 'Resolved'];

    const datasetsByDepartment = statusTypes.map(status => {
        const dataForStatus: number[] = departments.map(dept =>
          filteredDefects.filter((d:any) => d.department === dept && d.status === status).length
        );
        let color;
        switch(status) {
            case 'Logged': color = appColors.danger; break;
            case 'Under Verification': color = appColors.warning; break;
            case 'Approved/Rejected': color = appColors.info; break;
            case 'Resolved': color = appColors.success; break;
            default: color = appColors.neutral;
        }
        return {
          type: 'bar',
          label: status,
          backgroundColor: color,
          data: dataForStatus
        };
    });

    this.defectsByDepartmentData = {
        labels: departments,
        datasets: datasetsByDepartment
    };
    this.defectsByDepartmentOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            tooltip: {
                mode: 'index',
                intersect: false
            },
            legend: {
                labels: {
                    color: textColor
                }
            },
            zoom: getZoomOptions() // Apply zoom options to this chart
        },
        scales: {
            x: {
                stacked: true,
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                stacked: true,
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            }
        }
    };

    // --- Monthly Defect Trend (Line Chart) ---
    const monthlyDefectCounts: number[] = Array(12).fill(0); // For Jan-Dec
    filteredDefects.forEach((defect:any) => {
        const monthIndex = new Date(defect.dateLogged).getMonth(); // 0 for Jan, 1 for Feb...
        if (monthIndex >= 0 && monthIndex < 12) { // For all 12 months
            monthlyDefectCounts[monthIndex]++;
        }
    });

    this.monthlyDefectTrendData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        { label: 'Defects Logged', data: monthlyDefectCounts, fill: false, borderColor: appColors.primary, tension: 0.4 },
      ]
    };
    this.monthlyDefectTrendOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: { labels: { color: textColor } },
        zoom: getZoomOptions('x') // Only zoom/pan on X-axis for time series
      },
      scales: {
        x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } },
        y: { beginAtZero: true, ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } }
      }
    };

    // --- Scatter Plot: Defects by Date and Priority, Routines by Date and Time Taken ---
    // Map priority to a numerical value for Y-axis
    const priorityMap: { [key: string]: number } = {
      'Critical': 4,
      'High': 3,
      'Medium': 2,
      'Low': 1,
    };

    const defectsScatterData = filteredDefects.map((d: Defect) => ({ // 'd' is now guaranteed Defect
      x: new Date(d.dateLogged).getTime(), // Convert date to timestamp for X-axis
      y: priorityMap[d.priority],          // Map priority to number for Y-axis
      label: `Defect: ${d.defectId} - ${d.description} (Priority: ${d.priority})`, // Tooltip label
      type: 'Defect'
    }));

    const routinesScatterData = filteredRoutines.map((r: Routine) => ({ // 'r' is now guaranteed Routine
      x: new Date(r.datePerformed).getTime(), // Convert date to timestamp for X-axis
      y: r.timeTakenHours,                  // Time taken for Y-axis
      label: `Routine: ${r.routineId} - ${r.routineType} (${r.timeTakenHours} hrs)`, // Tooltip label
      type: 'Routine'
    }));

    this.scatterChartData = {
      datasets: [
        {
          label: 'Defects',
          data: defectsScatterData,
          backgroundColor: appColors.danger, // Red for defects
          borderColor: appColors.danger,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointStyle: 'circle', // Circle for defects
        },
        {
          label: 'Routines',
          data: routinesScatterData,
          backgroundColor: appColors.info, // Blue for routines
          borderColor: appColors.info,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointStyle: 'triangle', // Triangle for routines
        }
      ]
    };

    this.scatterChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 1.2,
      plugins: {
        legend: { labels: { color: textColor } },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const dataPoint = context.raw;
              return dataPoint.label; // Use the custom label from data
            }
          }
        },
        zoom: {
          pan: {
            enabled: true,
            mode: 'x', // Only pan along X-axis for time
          },
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: 'x', // Only zoom along X-axis for time
          },
        }
      },
      scales: {
        x: {
          type: 'time', // Use time scale for X-axis
          time: {
            unit: 'month', // Display units in months
            tooltipFormat: 'MMM D,YYYY', // Format for tooltip
            displayFormats: {
              month: 'MMM YYYY' // Format for axis labels
            }
          },
          title: {
            display: true,
            text: 'Date',
            color: textColor
          },
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder },
          // Set min/max based on the slider values
          min: this.dateSliderValues[0],
          max: this.dateSliderValues[1],
        },
        y: {
          title: {
            display: true,
            text: 'Severity (Defects) / Time Taken (Routines)',
            color: textColor
          },
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder },
          // Define min/max for y-axis if needed, e.g., for priority 1-4, and routine hours 0-5
          min: 0, // Assuming priority values are 1-4, timeTakenHours can be 0+
          max: 5, // Max for priority 4, and some routines might take more than 4 hours
        }
      }
    };
  }

  /**
   * Resets the zoom level of a specific chart.
   * @param chart The PrimeNG Chart component instance.
   */
  resetChartZoom(chart: any): void {
    if (chart && chart.chart) { // Ensure both PrimeNG Chart component and its internal Chart.js instance exist
      chart.chart.resetZoom();
      // If resetting scatter chart, also reset its slider to full range
      if (chart === this.scatterChart) {
        this.dateSliderValues = [this.minSliderValue, this.maxSliderValue];
        this.dateRange = [new Date(this.minSliderValue), new Date(this.maxSliderValue)];
        this.applyFilter(); // Re-apply filter to update chart with new slider range
      }
    }
  }

  // --- Drill Down Logic for Charts and Cards ---
  drillDown(event: any, type: string): void {
    let drilldownData: any[] = [];
    let drilldownColumns: any[] = [];
    let dialogTitle = '';

    const isChartClick = event && event.element && event.chart && event.chart.data;

    const currentFilteredDefects = this.getFilteredData('defects') as Defect[]; // Cast to Defect[]

    if (isChartClick) {
      const datasetIndex = event.element.datasetIndex;
      const index = event.element.index;

      const label = event.chart.data.labels[index];

      switch (type) {
        case 'DEFECT_STATUS':
          dialogTitle = `Detailed Defects: ${label}`;
          drilldownData = currentFilteredDefects.filter((defect:any) => defect.status === label);
          drilldownColumns = [
            { field: 'defectId', header: 'Defect ID' }, { field: 'description', header: 'Description' },
            { field: 'ship', header: 'Ship' }, { field: 'department', header: 'Department' },
            { field: 'priority', header: 'Priority' }, { field: 'status', header: 'Status' },
            { field: 'dateLogged', header: 'Date Logged' }
          ];
          break;
        case 'DEFECT_PRIORITY':
          dialogTitle = `Defects with Priority: ${label}`;
          drilldownData = currentFilteredDefects.filter((defect:any) => defect.priority === label);
          drilldownColumns = [
            { field: 'defectId', header: 'Defect ID' }, { field: 'description', header: 'Description' },
            { field: 'ship', header: 'Ship' }, { field: 'department', header: 'Department' },
            { field: 'priority', header: 'Priority' }, { field: 'status', header: 'Status' },
            { field: 'reportedBy', header: 'Reported By' }
          ];
          break;
        case 'RECURRING_DEFECTS':
          dialogTitle = `Defects of Type: ${label}`;
          drilldownData = currentFilteredDefects.filter((defect:any) => defect.defectType === label);
          drilldownColumns = [
            { field: 'defectId', header: 'Defect ID' }, { field: 'description', header: 'Description' },
            { field: 'equipment', header: 'Equipment' }, { field: 'defectType', header: 'Defect Type' },
            { field: 'ship', header: 'Ship' }, { field: 'status', header: 'Status' }
          ];
          break;
        case 'DEFECTS_BY_DEPARTMENT':
            dialogTitle = `Defects in Department: ${label}`;
            drilldownData = currentFilteredDefects.filter((defect:any) => defect.department === label);
            drilldownColumns = [
                { field: 'defectId', header: 'Defect ID' }, { field: 'description', header: 'Description' },
                { field: 'department', header: 'Department' }, { field: 'equipment', header: 'Equipment' },
                { field: 'priority', header: 'Priority' }, { field: 'status', header: 'Status' }
            ];
            break;
        case 'MONTHLY_DEFECT_TREND':
            dialogTitle = `Defects Logged in ${label}`;
            drilldownData = currentFilteredDefects.filter((defect:any) =>
              new Date(defect.dateLogged).toLocaleString('en-US', { month: 'short' }) === label
            );
            drilldownColumns = [
              { field: 'defectId', header: 'Defect ID' }, { field: 'description', header: 'Description' },
              { field: 'dateLogged', header: 'Date Logged' }, { field: 'ship', header: 'Ship' },
              { field: 'status', header: 'Status' }, { field: 'priority', header: 'Priority' }
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
            case 'TOTAL_OPEN_DEFECTS':
                drilldownData = currentFilteredDefects.filter((d:any) => d.status !== 'Resolved');
                drilldownColumns = [
                    { field: 'defectId', header: 'Defect ID' }, { field: 'description', header: 'Description' },
                    { field: 'ship', header: 'Ship' }, { field: 'department', header: 'Department' },
                    { field: 'priority', header: 'Priority' }, { field: 'status', header: 'Status' }
                ];
                break;
            case 'CRITICAL_DEFECTS':
                drilldownData = currentFilteredDefects.filter((d:any) => d.priority === 'Critical' && d.status !== 'Resolved');
                drilldownColumns = [
                    { field: 'defectId', header: 'Defect ID' }, { field: 'description', header: 'Description' },
                    { field: 'ship', header: 'Ship' }, { field: 'department', header: 'Department' },
                    { field: 'status', header: 'Status' }
                ];
                break;
            case 'AVG_RESOLUTION_TIME':
                drilldownData = currentFilteredDefects.filter((d:any) => d.status === 'Resolved' && d.dateLogged && d.resolutionDate);
                drilldownColumns = [
                    { field: 'defectId', header: 'Defect ID' }, { field: 'description', header: 'Description' },
                    { field: 'dateLogged', header: 'Date Logged' }, { field: 'resolutionDate', header: 'Resolution Date' },
                    { field: 'timeToResolve', header: 'Time to Resolve (Days)' } // Add a calculated field
                ];
                drilldownData = drilldownData.map((d: any) => {
                    const loggedDate = new Date(d.dateLogged).getTime();
                    const resolutionDate = new Date(d.resolutionDate).getTime();
                    const timeToResolve = (resolutionDate - loggedDate) / (1000 * 60 * 60 * 24);
                    return { ...d, timeToResolve: timeToResolve.toFixed(1) };
                });
                break;
            case 'DEFECTS_AWAITING_VERIFICATION':
                drilldownData = currentFilteredDefects.filter((d:any) => d.status === 'Under Verification');
                drilldownColumns = [
                    { field: 'defectId', header: 'Defect ID' }, { field: 'description', header: 'Description' },
                    { field: 'ship', header: 'Ship' }, { field: 'department', header: 'Department' },
                    { field: 'dateLogged', header: 'Date Logged' }
                ];
                break;
            default:
                dialogTitle = 'Drilldown Data';
                drilldownData = [{ message: 'No specific drilldown data available for this selection.' }];
                drilldownColumns = [{ field: 'message', header: 'Information' }];
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
  }

  /**
   * Helper to get filtered data based on current selections.
   * @param type 'defects' or 'routines'
   * @returns Filtered array of Defect or Routine objects.
   */
  private getFilteredData(type: 'defects' | 'routines'): (Defect | Routine)[] {
    let data: (Defect | Routine)[] = []; // Initialize with the union type

    if (type === 'defects') {
      data = [...this.mockDatabase.defects];
    } else if (type === 'routines') {
      data = [...this.mockDatabase.routines];
    }

    // Apply organizational filter
    if (this.selectedOrganizationalFilter === 'NHQ') {
      data = data.filter((item: DartItem) => item.scope === 'NHQ');
    } else if (this.selectedOrganizationalFilter === 'INSMAT') {
      // INSMAT means all data, no specific filter needed here for scope.
    }

    // Apply command filter
    if (this.selectedCommand && this.selectedCommand !== 'ALL_COMMANDS') {
      // Cast item to DartItem to access 'command' and 'scope' properties safely
      data = data.filter((item: DartItem) => item.command === this.selectedCommand || item.scope === 'NHQ');
    }

    // Apply ship filter
    if (this.selectedShip && this.selectedShip !== 'ALL_SHIPS') {
      // Cast item to DartItem to access 'ship' and 'scope' properties safely
      data = data.filter((item: DartItem) => item.ship === this.selectedShip || item.scope === 'NHQ' || item.scope === 'COMMAND');
    }

    // Apply date range filter (from p-calendar or p-slider)
    if (this.dateRange && this.dateRange[0] && this.dateRange[1]) {
      const startDate = this.dateRange[0].setHours(0, 0, 0, 0); // Set to start of day
      const endDate = this.dateRange[1].setHours(23, 59, 59, 999); // Set to end of day

      data = data.filter((item: DartItem) => { // Cast item to DartItem
        let itemDate: Date | null = null;
        if ('dateLogged' in item) {
          itemDate = new Date((item as Defect).dateLogged); // Explicitly cast to Defect
        } else if ('datePerformed' in item) {
          itemDate = new Date((item as Routine).datePerformed); // Explicitly cast to Routine
        }
        return itemDate && itemDate.getTime() >= startDate && itemDate.getTime() <= endDate;
      });
    }

    return data;
  }

  goBack(): void {
    this.location.back();
  }

  // --- SRAR KPI Methods ---
  getTotalShips(): number {
    return this.srarShipData.length;
  }

  getTotalRHAtSea(): string {
    const total = this.srarShipData.reduce((sum, ship) => sum + ship.totalRHAtSea, 0);
    return total.toFixed(0);
  }

  getAvgRHAtSea(): string {
    const totalAvg = this.srarShipData.reduce((sum, ship) => sum + ship.avgRHAtSea, 0);
    return (totalAvg / this.srarShipData.length).toFixed(1);
  }

  getMaxRunningHours(): string {
    const maxRh = Math.max(...this.srarShipData.map(ship => ship.maxRHAtSea));
    return maxRh.toFixed(1);
  }

  getOperationalCount(): number {
    return this.srarShipData.filter(ship => ship.operational).length;
  }
}
