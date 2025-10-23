import { Component, OnInit, Input, ViewChild, ElementRef, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { SliderModule } from 'primeng/slider';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

import {
  format, parseISO, startOfYear, endOfYear, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, eachYearOfInterval,
  isSameDay, isSameWeek, isSameMonth, isSameYear, differenceInCalendarDays, differenceInCalendarMonths, differenceInCalendarYears,
  startOfDay, endOfDay // Added for precise daily interval
} from 'date-fns';


Chart.register(...registerables);

interface Defect {
  defectId: string;
  description: string;
  department: string;
  defectType: string;
  equipment: string;
  system: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Logged' | 'Under Verification' | 'Approved/Rejected' | 'Resolved';
  reportedBy: string;
  dateLogged: string;
  lastUpdated: string;
  actionTaken?: string;
  resolutionMethod?: string;
  resolutionDate?: string;
  attachments?: string[];
  scope: 'NHQ' | 'COMMAND' | 'SHIP';
  command: string | null;
  ship: string | null;
}

const PRIORITY_COLORS: { [key: string]: string } = {
  'Critical': '#dc2626',
  'High': '#ef4444',
  'Medium': '#f59e0b',
  'Low': '#3b82f6',
  'No Defects': '#a8a8a8' // For periods with no defects
};

const PRIORITY_ORDER: ('Critical' | 'High' | 'Medium' | 'Low' | 'No Defects')[] = ['Critical', 'High', 'Medium', 'Low', 'No Defects'];

@Component({
  selector: 'app-system-wise-defect-activity-chart',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
    SliderModule,
  ],
  template: `
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
      <h3 class="text-xl font-semibold text-gray-800 mb-4">System-wise Defect Activity ({{ currentZoomLevelLabel }} View)</h3>

      <div class="flex flex-wrap items-center gap-4 mb-6">
        <div class="flex items-center gap-2">
          <label for="zoomLevel" class="text-gray-700 font-medium">View By:</label>
          <p-dropdown
            id="zoomLevel"
            [options]="zoomLevelOptions"
            [(ngModel)]="zoomLevel"
            (onChange)="onFilterChange()"
            optionLabel="label"
            optionValue="value"
            placeholder="Select View"
            [style]="{'min-width': '150px'}"
          ></p-dropdown>
        </div>

        <div class="flex items-center gap-2" *ngIf="zoomLevel === 'dateRange'">
          <label for="dateRange" class="text-gray-700 font-medium">Select Date Range:</label>
          <p-calendar
            id="dateRange"
            [(ngModel)]="dateRange"
            selectionMode="range"
            [showIcon]="true"
            dateFormat="yy-mm-dd"
            (onSelect)="onDateRangeChange($event)"
            (onClearClick)="onDateRangeChange(null)"
            [minDate]="minOverallDate"
            [maxDate]="maxOverallDate"
            [readonlyInput]="true"
            placeholder="Start Date - End Date"
          ></p-calendar>
        </div>
      </div>

      <div class="px-4 pb-4" *ngIf="defects && defects.length > 0 && minSliderValue !== undefined && maxSliderValue !== undefined">
        <label for="dateSlider" class="text-gray-700 font-medium mb-2 block">Filter by Date (Slider):</label>
        <p-slider
          [(ngModel)]="dateSliderValues"
          [range]="true"
          [min]="minSliderValue"
          [max]="maxSliderValue"
          (onSlideEnd)="onDateSliderChange($event)"
          class="w-full"
        ></p-slider>
        <div class="flex justify-between text-sm text-gray-500 mt-2">
          <span>{{ formatFullDate(minOverallDate) }}</span>
          <span>{{ formatFullDate(maxOverallDate) }}</span>
        </div>
        <div class="text-center text-sm text-gray-600 mt-2" *ngIf="dateRange[0] && dateRange[1]">
            Selected Range: {{ formatFullDate(dateRange[0]) }} - {{ formatFullDate(dateRange[1]) }}
        </div>
      </div>

      <div class="chart-scroll-container" [class.no-scroll]="chartWidth === 0" *ngIf="defects && defects.length > 0">
        <div class="chart-canvas-wrapper" [style.width.px]="chartWidth" >
          <canvas #chartCanvas></canvas>
        </div>
      </div>
      <div *ngIf="!defects || defects.length === 0" class="text-center text-gray-500 py-8">
        No defect data available to display the chart.
      </div>
    </div>
  `,
  styles: [`
    .chart-scroll-container {
      overflow-x: auto;
      overflow-y: hidden;
      width: 100%;
      padding-bottom: 10px;
    }
    .chart-scroll-container.no-scroll {
        overflow-x: hidden; /* Hide scrollbar when chartWidth is 0 */
    }
    .chart-canvas-wrapper {
        min-width: 600px; /* Ensures a minimum width for the chart area when visible */
        height: auto;
    }
    .chart-canvas-wrapper[style*="width: 0px"] {
        min-width: 0px !important; /* Override min-width when chartWidth is 0 */
        width: 0px !important;
        overflow: hidden; /* Hide content when width is 0 */
    }
    canvas {
      height: auto !important; /* Important to let Chart.js manage height based on responsive option */
    }
    /* Custom styles for the slider to make it look good */
    .p-slider .p-slider-handle {
      background-color: #4f46e5;
      border: 2px solid #4f46e5;
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.2);
      transition: background-color 0.2s, border-color 0.2s, box-shadow 0.2s;
    }
    .p-slider .p-slider-range {
      background-color: #6366f1;
    }
    .p-slider:not(.p-disabled) .p-slider-handle:hover {
      background-color: #4338ca;
      border-color: #4338ca;
    }
    .p-slider.p-slider-horizontal .p-slider-handle {
        margin-top: -0.5rem;
    }
  `]
})
export class SystemWiseDefectActivityChartComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() defects: Defect[] = [];
  // Min/Max overall dates are now optional inputs, and we will derive them if not provided
  @Input() minOverallDate?: Date;
  @Input() maxOverallDate?: Date;

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  chartInstance!: Chart;

  zoomLevel: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'dateRange' = 'monthly'; // Default to monthly view
  zoomLevelOptions = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
    { label: 'Date Range', value: 'dateRange' }
  ];

  dateRange: Date[] = [];
  dateSliderValues: number[] = [];
  minSliderValue!: number; // Initialize as undefined to control slider visibility
  maxSliderValue!: number; // Initialize as undefined to control slider visibility

  chartWidth: number = 0; // Initialize to 0 to hide scrollbar initially if no data

  // Dummy defect data for demonstration purposes
  dummyDefects: Defect[] = [
    { defectId: 'D-2023-001', description: 'Old Server Failure', department: 'IT', defectType: 'Hardware', equipment: 'Server Rack', system: 'CMMS Core', priority: 'Critical', status: 'Resolved', reportedBy: 'IT Admin', dateLogged: '2023-01-15', lastUpdated: '2023-01-20', resolutionDate: '2023-01-20', scope: 'NHQ', command: null, ship: null },
    { defectId: 'D-2023-002', description: 'Database Connectivity Issue', department: 'IT', defectType: 'Software Bug', equipment: 'Database Server', system: 'CMMS Core', priority: 'High', status: 'Resolved', reportedBy: 'IT Admin', dateLogged: '2023-02-01', lastUpdated: '2023-02-05', resolutionDate: '2023-02-05', scope: 'NHQ', command: null, ship: null },
    { defectId: 'D-2023-003', description: 'Minor Hull Corrosion', department: 'Hull', defectType: 'Structural', equipment: 'Hull', system: 'Ship Structure', priority: 'Low', status: 'Logged', reportedBy: 'Hull PO', dateLogged: '2023-03-10', lastUpdated: '2023-03-10', scope: 'SHIP', command: 'Eastern', ship: 'INS Vikrant' },
    { defectId: 'D-2023-004', description: 'Navigation Light Fuse Blown', department: 'Navigation', defectType: 'Electrical', equipment: 'Nav Lights', system: 'Navigation', priority: 'Medium', status: 'Resolved', reportedBy: 'Nav Officer', dateLogged: '2023-04-05', lastUpdated: '2023-04-06', resolutionDate: '2023-04-06', scope: 'SHIP', command: 'Western', ship: 'INS Chennai' },
    { defectId: 'D-2023-005', description: 'Engine Oil Leak', department: 'Engineering', defectType: 'Mechanical', equipment: 'Main Engine', system: 'Propulsion', priority: 'High', status: 'Under Verification', reportedBy: 'Chief Engineer', dateLogged: '2023-05-20', lastUpdated: '2023-05-22', scope: 'SHIP', command: 'Eastern', ship: 'INS Kolkata' },
    { defectId: 'D-2023-006', description: 'Communication Antenna Alignment', department: 'Communication', defectType: 'Maintenance', equipment: 'Antenna', system: 'External Comms', priority: 'Low', status: 'Resolved', reportedBy: 'Comms Officer', dateLogged: '2023-06-12', lastUpdated: '2023-06-13', resolutionDate: '2023-06-13', scope: 'SHIP', command: 'Southern', ship: 'INS Mumbai' },
    { defectId: 'D-2023-007', description: 'HVAC Unit Malfunction', department: 'Logistics', defectType: 'Facilities', equipment: 'HVAC Unit', system: 'Building Services', priority: 'Medium', status: 'Logged', reportedBy: 'Logistics Head', dateLogged: '2023-07-01', lastUpdated: '2023-07-01', scope: 'COMMAND', command: 'Eastern', ship: null },
    { defectId: 'D-2023-008', description: 'Port Crane Hydraulic Leak', department: 'Operations', defectType: 'Mechanical', equipment: 'Port Crane', system: 'Port Operations', priority: 'Critical', status: 'Under Verification', reportedBy: 'Port Master', dateLogged: '2023-08-18', lastUpdated: '2023-08-19', scope: 'COMMAND', command: 'Western', ship: null },
    { defectId: 'D-2023-009', description: 'Security System Glitch', department: 'Cyber Security', defectType: 'Software Bug', equipment: 'CCTV', system: 'Base Security', priority: 'High', status: 'Resolved', reportedBy: 'Security Analyst', dateLogged: '2023-09-25', lastUpdated: '2023-09-28', resolutionDate: '2023-09-28', scope: 'NHQ', command: null, ship: null },
    { defectId: 'D-2023-010', description: 'Galley Oven Element Failure', department: 'Supply', defectType: 'Electrical', equipment: 'Oven', system: 'Galley', priority: 'Medium', status: 'Approved/Rejected', reportedBy: 'Chef', dateLogged: '2023-10-01', lastUpdated: '2023-10-03', scope: 'SHIP', command: 'Western', ship: 'INS Chennai' },
    { defectId: 'D-2023-011', description: 'Life Raft Inspection Overdue', department: 'Safety', defectType: 'Safety Gear', equipment: 'Life Raft', system: 'Safety Systems', priority: 'Low', status: 'Logged', reportedBy: 'Safety Officer', dateLogged: '2023-11-05', lastUpdated: '2023-11-05', scope: 'SHIP', command: 'Eastern', ship: 'INS Vikrant' },
    { defectId: 'D-2023-012', description: 'Auxiliary Generator Overheating', department: 'Engineering', defectType: 'Mechanical', equipment: 'Auxiliary Generator', system: 'Power Generation', priority: 'Critical', status: 'Under Verification', reportedBy: 'PO Singh', dateLogged: '2023-12-10', lastUpdated: '2023-12-11', scope: 'SHIP', command: 'Eastern', ship: 'INS Kolkata' },

    // 2024 Data
    { defectId: 'D-2024-001', description: 'Policy Document Discrepancy', department: 'Policy', defectType: 'Documentation', equipment: 'N/A', system: 'CMS', priority: 'Medium', status: 'Logged', reportedBy: 'Admin', dateLogged: '2024-01-20', lastUpdated: '2024-01-20', scope: 'NHQ', command: null, ship: null },
    { defectId: 'D-2024-002', description: 'Software Glitch in Central System', department: 'IT', defectType: 'Software Bug', equipment: 'Central Server', system: 'CMMS Core', priority: 'High', status: 'Under Verification', reportedBy: 'IT Lead', dateLogged: '2024-02-15', lastUpdated: '2024-02-22', scope: 'NHQ', command: null, ship: null },
    { defectId: 'D-2024-003', description: 'Procurement Process Delay', department: 'Logistics', defectType: 'Process', equipment: 'N/A', system: 'Supply Chain', priority: 'Low', status: 'Resolved', reportedBy: 'Logistics Head', dateLogged: '2024-03-01', lastUpdated: '2024-03-05', resolutionDate: '2024-03-05', scope: 'NHQ', command: null, ship: null },
    { defectId: 'D-2024-004', description: 'Security Protocol Vulnerability', department: 'Cyber Security', defectType: 'Security', equipment: 'Firewall', system: 'Network', priority: 'Critical', status: 'Logged', reportedBy: 'Security Analyst', dateLogged: '2024-04-10', lastUpdated: '2024-04-10', scope: 'NHQ', command: null, ship: null },
    { defectId: 'D-2024-005', description: 'Minor structural crack in quay', department: 'Engineering', defectType: 'Infrastructure', equipment: 'Quay', system: 'Port Facilities', priority: 'Medium', status: 'Approved/Rejected', reportedBy: 'Engg Officer', dateLogged: '2024-05-01', lastUpdated: '2024-05-05', scope: 'COMMAND', command: 'Eastern', ship: null, resolutionMethod: 'Scheduled Repair' },
    { defectId: 'D-2024-006', description: 'Network outage in Command HQ', department: 'IT', defectType: 'Network', equipment: 'Router', system: 'Command Network', priority: 'High', status: 'Resolved', reportedBy: 'IT Team', dateLogged: '2024-06-25', lastUpdated: '2024-07-01', resolutionDate: '2024-07-01', scope: 'COMMAND', command: 'Western', ship: null, actionTaken: 'Router replacement', resolutionMethod: 'Replacement' },
    { defectId: 'D-2024-007', description: 'HVAC malfunction in admin block', department: 'Logistics', defectType: 'Facilities', equipment: 'HVAC Unit', system: 'Building Services', priority: 'Low', status: 'Logged', reportedBy: 'Logistics Head', dateLogged: '2024-07-18', lastUpdated: '2024-07-18', scope: 'COMMAND', command: 'Southern', ship: null },
    { defectId: 'D-2024-008', description: 'Berthing line wear and tear', department: 'Operations', defectType: 'Infrastructure', equipment: 'Berthing Line', system: 'Port Operations', priority: 'Medium', status: 'Under Verification', reportedBy: 'Port Master', dateLogged: '2024-08-05', lastUpdated: '2024-08-07', scope: 'COMMAND', command: 'Eastern', ship: null },
    { defectId: 'D-2024-009', description: 'Main Engine - Excessive Vibration', department: 'Engineering', defectType: 'Mechanical', equipment: 'Main Engine', system: 'Propulsion', priority: 'Critical', status: 'Under Verification', reportedBy: 'Lt. Cmdr. Sharma', dateLogged: '2024-09-25', lastUpdated: '2024-09-26', scope: 'SHIP', command: 'Eastern', ship: 'INS Vikrant', attachments: ['engine_vib.jpg'] },
    { defectId: 'D-2024-010', description: 'Radar System - Intermittent Signal Loss', department: 'Operations', defectType: 'Electrical', equipment: 'Radar System', system: 'Navigation', priority: 'High', status: 'Logged', reportedBy: 'Ops Officer', dateLogged: '2024-10-24', lastUpdated: '2024-10-24', scope: 'SHIP', command: 'Eastern', ship: 'INS Vikrant' },
    { defectId: 'D-2024-011', description: 'Fire Pump - Reduced Pressure', department: 'Safety', defectType: 'Hydraulic', equipment: 'Fire Pump', system: 'Fire Fighting', priority: 'Critical', status: 'Resolved', reportedBy: 'Safety Officer', dateLogged: '2024-11-10', lastUpdated: '2024-11-12', resolutionDate: '2024-11-12', scope: 'SHIP', command: 'Western', ship: 'INS Chennai', actionTaken: 'Pump seal replacement', resolutionMethod: 'Replacement' },
    { defectId: 'D-2024-012', description: 'Galley Oven - Not Heating', department: 'Supply', defectType: 'Electrical', equipment: 'Oven', system: 'Galley', priority: 'Medium', status: 'Approved/Rejected', reportedBy: 'Chef', dateLogged: '2024-12-18', lastUpdated: '2024-12-20', scope: 'SHIP', command: 'Western', ship: 'INS Chennai' },

    // 2025 Data (up to current date - July 3, 2025)
    { defectId: 'D-2025-001', description: 'Auxiliary Generator - Oil Leak', department: 'Engineering', defectType: 'Plumbing', equipment: 'Auxiliary Generator', system: 'Power Generation', priority: 'High', status: 'Under Verification', reportedBy: 'PO Singh', dateLogged: '2025-01-23', lastUpdated: '2025-01-23', scope: 'SHIP', command: 'Eastern', ship: 'INS Kolkata' },
    { defectId: 'D-2025-002', description: 'Communication Antenna - Malfunction', department: 'Communication', defectType: 'Electronic', equipment: 'Antenna', system: 'External Comms', priority: 'Critical', status: 'Logged', reportedBy: 'Comms Officer', dateLogged: '2025-02-26', lastUpdated: '2025-02-26', scope: 'SHIP', command: 'Western', ship: 'INS Delhi' },
    { defectId: 'D-2025-003', description: 'Navigation Lights - Dim Output', department: 'Navigation', defectType: 'Electrical', equipment: 'Nav Lights', system: 'Navigation', priority: 'Medium', status: 'Resolved', reportedBy: 'Nav Officer', dateLogged: '2025-03-30', lastUpdated: '2025-04-03', resolutionDate: '2025-04-03', scope: 'SHIP', command: 'Southern', ship: 'INS Mumbai', actionTaken: 'Bulb replacement', resolutionMethod: 'Replacement' },
    { defectId: 'D-2025-004', description: 'Hull Scratches - Minor', department: 'Hull', defectType: 'Structural', equipment: 'Hull', system: 'Ship Structure', priority: 'Low', status: 'Logged', reportedBy: 'Hull Petty Officer', dateLogged: '2025-04-20', lastUpdated: '2025-04-20', scope: 'SHIP', command: 'Southern', ship: 'INS Mumbai' },
    { defectId: 'D-2025-005', description: 'Propeller Shaft - Minor Bearing Noise', department: 'Engineering', defectType: 'Mechanical', equipment: 'Propeller Shaft', system: 'Propulsion', priority: 'High', status: 'Approved/Rejected', reportedBy: 'Chief Engineer', dateLogged: '2025-05-10', lastUpdated: '2025-05-15', scope: 'SHIP', command: 'Eastern', ship: 'INS Vikrant' },
    { defectId: 'D-2025-006', description: 'Life Raft - Inspection overdue', department: 'Safety', defectType: 'Safety Gear', equipment: 'Life Raft', system: 'Safety Systems', priority: 'Medium', status: 'Logged', reportedBy: 'Safety Officer', dateLogged: '2025-06-27', lastUpdated: '2025-06-27', scope: 'SHIP', command: 'Western', ship: 'INS Chennai' },
    { defectId: 'D-2025-007', description: 'Navigation Software Glitch', department: 'IT', defectType: 'Software Bug', equipment: 'Nav Computer', system: 'Navigation', priority: 'High', status: 'Logged', reportedBy: 'IT Officer', dateLogged: '2025-06-05', lastUpdated: '2025-06-05', scope: 'SHIP', command: 'Eastern', ship: 'INS Vikrant' },
    { defectId: 'D-2025-008', description: 'Fresh Water Generator Leak', department: 'Engineering', defectType: 'Plumbing', equipment: 'FW Generator', system: 'Water Systems', priority: 'Medium', status: 'Under Verification', reportedBy: 'PO Ram', dateLogged: '2025-06-12', lastUpdated: '2025-06-12', scope: 'SHIP', command: 'Eastern', ship: 'INS Kolkata' },
    { defectId: 'D-2025-009', description: 'Sonar System Glitch', department: 'Operations', defectType: 'Electronic', equipment: 'Sonar', system: 'Underwater Warfare', priority: 'Critical', status: 'Under Verification', reportedBy: 'Sonar Operator', dateLogged: '2025-07-01', lastUpdated: '2025-07-01', scope: 'SHIP', command: 'Eastern', ship: 'INS Kolkata' },
  ];


  constructor() { }

  ngOnInit(): void {
    // Ensure defects are initialized. If input is empty, use dummy data.
    if (!this.defects || this.defects.length === 0) {
      this.defects = this.dummyDefects;
    }
    // Initialize overall date ranges based on the (now guaranteed) defects array.
    this.initializeOverallDateRangeFromDefects();

    // Set initial view to current month by default
    this.setInitialMonthView();
  }

  ngAfterViewInit(): void {
    // Use a small timeout to ensure DOM is fully rendered and ViewChild is ready.
    // This is crucial for Chart.js to find the canvas element.
    setTimeout(() => {
        if (this.defects && this.defects.length > 0 && this.chartCanvas && this.chartCanvas.nativeElement) {
            this.updateChart();
        } else {
            this.chartWidth = 0; // If no data, ensure chart area collapses to remove scrollbar
        }
    }, 50); // A slight delay (e.g., 50ms) can sometimes help.
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Only re-initialize date range and update chart if 'defects' input changes.
    if (changes['defects'] && !changes['defects'].firstChange) {
      // If defects are provided and they are different from current, re-initialize.
      if (changes['defects'].currentValue) {
        this.defects = changes['defects'].currentValue;
      } else {
        this.defects = this.dummyDefects; // Fallback to dummy if input defects become null/empty
      }
      this.initializeOverallDateRangeFromDefects(); // Re-calculate overall date range based on new defects
      this.setInitialMonthView(); // Re-set to current month view after defects change
      this.updateChart(); // Update chart only if there's data
    } else if (changes['defects'] && changes['defects'].firstChange && changes['defects'].currentValue) {
      // Handle initial load if defects are provided via input on first change
      this.defects = changes['defects'].currentValue;
      this.initializeOverallDateRangeFromDefects();
      this.setInitialMonthView();
    }

    // React to minOverallDate/maxOverallDate changes if they are provided from parent
    if ((changes['minOverallDate'] && !changes['minOverallDate'].firstChange) ||
        (changes['maxOverallDate'] && !changes['maxOverallDate'].firstChange)) {
      if (this.minOverallDate && this.maxOverallDate &&
          (this.dateRange[0]?.getTime() !== this.minOverallDate.getTime() ||
           this.dateRange[1]?.getTime() !== this.maxOverallDate.getTime())) {
        this.dateRange = [new Date(this.minOverallDate), new Date(this.maxOverallDate)];
        this.dateSliderValues = [this.minOverallDate.getTime(), this.maxOverallDate.getTime()];
        if (this.defects && this.defects.length > 0) {
            this.updateChart();
        }
      }
    }
  }

  /**
   * Formats a Date object to a consistent string for display in the template.
   * Handles potential null/undefined dates gracefully.
   * @param date The Date object to format.
   * @returns Formatted date string (e.g., "Jan 01, 2023") or empty string if invalid.
   */
  formatFullDate(date: Date | undefined): string {
    if (date && !isNaN(date.getTime())) {
      return format(date, 'MMM dd, yyyy'); // Using 'yyyy' for full year
    }
    return '';
  }

  // Changed method name to clearly indicate it sets the ALL TIME min/max from defects
  private initializeOverallDateRangeFromDefects(): void {
    let allDefectDates: Date[] = [];
    this.defects.forEach(d => {
      const date = parseISO(d.dateLogged);
      if (!isNaN(date.getTime())) {
        allDefectDates.push(date);
      }
    });

    if (allDefectDates.length > 0) {
      // If minOverallDate or maxOverallDate are provided as inputs, use them.
      // Otherwise, derive from defects.
      this.minOverallDate = this.minOverallDate || new Date(Math.min(...allDefectDates.map(date => date.getTime())));
      this.maxOverallDate = this.maxOverallDate || new Date(Math.max(...allDefectDates.map(date => date.getTime())));
    } else {
      // Provide a default fallback range if no defects are available,
      // ensuring minOverallDate and maxOverallDate are always valid Dates.
      const today = new Date();
      this.minOverallDate = startOfYear(new Date(today.getFullYear() - 1, 0, 1)); // Default to start of previous year
      this.maxOverallDate = endOfYear(today);   // End of current year
    }

    // Ensure max date is end of the day for filtering inclusivity
    if (this.maxOverallDate) {
        this.maxOverallDate.setHours(23, 59, 59, 999);
    }
    if (this.minOverallDate) {
        this.minOverallDate.setHours(0, 0, 0, 0); // Set min date to start of day
    }

    // Initialize slider values based on the (now guaranteed valid) overall range.
    this.minSliderValue = this.minOverallDate!.getTime();
    this.maxSliderValue = this.maxOverallDate!.getTime();
  }

  private setInitialMonthView(): void {
    const today = new Date();
    this.zoomLevel = 'monthly';
    this.dateRange = [startOfMonth(today), endOfMonth(today)];
    // Ensure slider values are within overall range
    this.dateSliderValues = [
        Math.max(this.dateRange[0].getTime(), this.minSliderValue),
        Math.min(this.dateRange[1].getTime(), this.maxSliderValue)
    ];
  }


  onFilterChange(): void {
    if (this.zoomLevel !== 'dateRange') {
      const today = new Date();
      if (this.zoomLevel === 'daily') {
        this.dateRange = [startOfDay(today), endOfDay(today)];
      } else if (this.zoomLevel === 'weekly') {
        this.dateRange = [startOfWeek(today, { weekStartsOn: 0 }), endOfWeek(today, { weekStartsOn: 0 })];
      } else if (this.zoomLevel === 'monthly') {
        this.dateRange = [startOfMonth(today), endOfMonth(today)];
      } else if (this.zoomLevel === 'yearly') {
        this.dateRange = [startOfYear(today), endOfYear(today)];
      }
      // Ensure slider values are within the bounds of the overall data range
      this.dateSliderValues = [
          Math.max(this.dateRange[0].getTime(), this.minSliderValue),
          Math.min(this.dateRange[1].getTime(), this.maxSliderValue)
      ];
    }
    if (this.defects && this.defects.length > 0) {
        this.updateChart();
    } else {
        this.chartWidth = 0; // Hide chart if no defects
    }
  }

  onDateRangeChange(event: any): void {
    if (event && event.value && event.value[0] && event.value[1]) {
      const selectedStartDate = event.value[0];
      const selectedEndDate = new Date(event.value[1]);
      selectedEndDate.setHours(23, 59, 59, 999); // Set to end of day for proper range filtering

      this.dateRange = [selectedStartDate, selectedEndDate];
      this.dateSliderValues = [this.dateRange[0].getTime(), this.dateRange[1].getTime()];
    } else {
      // If cleared or invalid, reset to overall min/max
      this.dateRange = [new Date(this.minOverallDate!), new Date(this.maxOverallDate!)];
      this.dateSliderValues = [this.minSliderValue, this.maxSliderValue];
    }
    if (this.defects && this.defects.length > 0) {
        this.updateChart();
    } else {
        this.chartWidth = 0; // Hide chart if no defects
    }
  }

  onDateSliderChange(event: any): void {
    const [minTs, maxTs] = event.values;
    const startDate = new Date(minTs);
    const endDate = new Date(maxTs);
    endDate.setHours(23, 59, 59, 999); // Set to end of day for proper range filtering

    this.dateRange = [startDate, endDate];
    this.zoomLevel = 'dateRange'; // Automatically switch to dateRange view
    if (this.defects && this.defects.length > 0) {
        this.updateChart();
    } else {
        this.chartWidth = 0; // Hide chart if no defects
    }
  }

  get currentZoomLevelLabel(): string {
    const selectedOption = this.zoomLevelOptions.find(o => o.value === this.zoomLevel);
    return selectedOption ? selectedOption.label : '';
  }

  private updateChart(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy(); // Destroy existing chart instance
      this.chartInstance = null as any;
    }
    // Only attempt to create the chart if the canvas is available AND there's data
    if (this.chartCanvas && this.chartCanvas.nativeElement && this.defects && this.defects.length > 0) {
      this.createChart();
    } else {
        this.chartWidth = 0; // If no defects or canvas not ready, collapse chart area.
    }
  }

  private createChart(): void {
    // Safeguard: Ensure defects exist before trying to process.
    if (!this.defects || this.defects.length === 0) {
        this.chartWidth = 0; // Set to 0 if no data to prevent scrollbar
        return;
    }

    const { chartData, systems } = this.processChartData();

    // If chartData is empty (e.g., filtered range has no defects), collapse chart.
    if (chartData.length === 0) {
        this.chartWidth = 0;
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null as any;
        }
        return;
    }

    const barWidthPerInterval = 50; // Width of each bar group
    const minChartWidth = 600; // Minimum width for the chart area
    // Calculate chartWidth based on number of data points, ensuring a minimum width
    this.chartWidth = Math.max(minChartWidth, chartData.length * barWidthPerInterval + 150);


    const baseHeight = 250;
    const heightPerSystem = 30; // Estimated height for each system's label + stacked bars
    const maxChartHeight = 500; // Define a maximum height to prevent excessive scrolling

    // Calculate height: ensure a minimum height, but also scale with number of systems, capped by maxChartHeight
    // Adjust padding slightly for charts with fewer systems.
    let calculatedHeight = Math.max(baseHeight, systems.length * heightPerSystem + (systems.length > 5 ? 150 : 100));
    calculatedHeight = Math.min(maxChartHeight, calculatedHeight);


    if (this.chartCanvas && this.chartCanvas.nativeElement) {
      this.chartCanvas.nativeElement.height = calculatedHeight;
      const ctx = this.chartCanvas.nativeElement.getContext('2d');
      if (ctx) { // Ensure context is available
        this.chartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: chartData.map(d => d.name), // These are your time periods
            datasets: PRIORITY_ORDER.flatMap(priority =>
              systems.map(system => ({
                label: `${system} - ${priority}`, // More descriptive label for legend and tooltip
                data: chartData.map(d => d[`${system}_${priority}`]),
                backgroundColor: PRIORITY_COLORS[priority],
                stack: system, // Stacks bars per system
                borderRadius: 4,
                borderSkipped: false,
                categoryPercentage: 0.8,
                barPercentage: 0.9,
                // Only show "No Defects" if its value is > 0, otherwise it will just be a stacked bar of 1.
                // This styling is for visual representation, actual data will be handled by processChartData
                hidden: (priority === 'No Defects') ? false : false // Chart.js's default hidden state
              }))
            )
          },
          options: {
            indexAxis: 'x', // X-axis for categories (time periods)
            responsive: true,
            maintainAspectRatio: false, // Allows chart to scale freely within its container
            layout: {
              padding: {
                left: 10,
                right: 10,
                top: 20,
                bottom: 10
              }
            },
            plugins: {
              legend: {
                display: true,
                position: 'bottom',
                align: 'center',
                labels: {
                  boxWidth: 20,
                  padding: 15,
                  color: '#333333',
                  font: {
                    size: 12
                  },
                  // Filter and generate labels to show only priorities, not system-priority combinations
                  filter: (legendItem) => {
                    // Check if the label contains one of our PRIORITY_ORDER strings
                    return PRIORITY_ORDER.some(p => legendItem.text.includes(p));
                  },
                  generateLabels: (chart) => {
                    // Generate unique labels for each priority
                    const uniquePriorities = new Set<string>();
                    chart.data.datasets.forEach(dataset => {
                        const labelParts = dataset.label?.split(' - ');
                        if (labelParts && labelParts.length > 1) {
                            uniquePriorities.add(labelParts[1]); // Add the priority part
                        }
                    });

                    return Array.from(uniquePriorities).sort((a,b) => {
                        // Sort them based on PRIORITY_ORDER
                        return PRIORITY_ORDER.indexOf(a as any) - PRIORITY_ORDER.indexOf(b as any);
                    }).map(priority => ({
                        text: priority,
                        fillStyle: PRIORITY_COLORS[priority],
                        strokeStyle: PRIORITY_COLORS[priority],
                        lineWidth: 0,
                        hidden: false,
                        index: PRIORITY_ORDER.indexOf(priority as any)
                    }));
                  }
                }
              },
              tooltip: {
                backgroundColor: 'rgba(0,0,0,0.7)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#6366f1',
                borderWidth: 1,
                cornerRadius: 6,
                displayColors: true,
                boxPadding: 4,
                callbacks: {
                  title: (tooltipItems) => {
                    return `Period: ${tooltipItems[0].label}`;
                  },
                  label: (context) => {
                    const labelParts = context.dataset.label?.split(' - ');
                    if (labelParts && labelParts.length === 2) {
                      const system = labelParts[0];
                      const priority = labelParts[1];
                      const value = context.raw as number;

                      // Only show if there are actual defects or if it's the "No Defects" category with a value of 1
                      if (value > 0 || (priority === 'No Defects' && value === 1)) {
                        return `${value} ${priority} Defects for ${system}`;
                      }
                    }
                    return ''; // Don't display label if value is 0 and it's not 'No Defects'
                  }
                }
              }
            },
            scales: {
              x: {
                stacked: true,
                type: 'category',
                title: {
                  display: true,
                  text: 'Time Period',
                  color: '#333333',
                  font: {
                    size: 14,
                    weight: 'bold'
                  }
                },
                ticks: {
                  color: '#6b7280',
                  autoSkip: false,
                  maxRotation: 90,
                  minRotation: 45
                },
                grid: {
                  color: '#e5e7eb',
                  drawOnChartArea: true,
                  drawTicks: false
                },
                offset: true // Ensures bars are centered on tick marks
              },
              y: {
                stacked: true,
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Number of Defects',
                  color: '#333333',
                  font: {
                    size: 14,
                    weight: 'bold'
                  }
                },
                ticks: {
                  color: '#6b7280',
                  precision: 0, // Ensure integer ticks - explicitly set to 0
                  stepSize: 1 // Force steps of 1 for clarity
                },
                grid: {
                  color: '#e5e7eb',
                  drawOnChartArea: true,
                  drawTicks: false
                }
              }
            }
          }
        });
      }
    }
  }

  private processChartData(): { chartData: any[]; systems: string[] } {
    let startDate = this.dateRange[0];
    let endDate = this.dateRange[1];

    // Fallback if dateRange is invalid (shouldn't happen with current init logic, but good safeguard)
    if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      startDate = this.minOverallDate!;
      endDate = this.maxOverallDate!;
    }

    const filteredDefects = this.defects.filter(defect => {
      const defectDate = parseISO(defect.dateLogged);
      return !isNaN(defectDate.getTime()) && defectDate >= startDate && defectDate <= endDate;
    });

    // Get all unique systems, including 'Unknown System' if applicable from ALL defects, not just filtered
    const allSystems = Array.from(new Set(this.defects.map(d => d.system || 'Unknown System'))).sort();

    let timeIntervals: Date[] = [];
    let dateFormat: string = '';
    let currentProcessingZoomLevel: 'daily' | 'weekly' | 'monthly' | 'yearly';

    if (this.zoomLevel === 'dateRange') {
      currentProcessingZoomLevel = this.determineDynamicZoomLevel(startDate, endDate);
    } else {
      currentProcessingZoomLevel = this.zoomLevel as 'daily' | 'weekly' | 'monthly' | 'yearly';
    }


    if (currentProcessingZoomLevel === 'daily') {
      timeIntervals = this.eachDayOfIntervalSafe(startDate, endDate);
      dateFormat = 'MMM dd';
    } else if (currentProcessingZoomLevel === 'weekly') {
      timeIntervals = this.eachWeekOfIntervalSafe(startDate, endDate);
      dateFormat = 'MMM dd, yy';
    } else if (currentProcessingZoomLevel === 'monthly') {
      timeIntervals = this.eachMonthOfIntervalSafe(startDate, endDate);
      dateFormat = 'MMM yyyy'; // Corrected format for monthly view to show year
    } else if (currentProcessingZoomLevel === 'yearly') {
      timeIntervals = this.eachYearOfIntervalSafe(startDate, endDate);
      dateFormat = 'yyyy';
    }

    // If no time intervals are generated (e.g., invalid date range or very short interval),
    // and there are filtered defects, ensure at least one interval for context.
    // This is to prevent a blank chart when data exists but interval generation fails or is too narrow.
    // However, if there are NO defects in the filtered range, chartData should be empty.
    if (timeIntervals.length === 0 && filteredDefects.length > 0) {
        // Use the start date of the filtered defects for a single interval
        const firstDefectDate = parseISO(filteredDefects[0].dateLogged);
        if (!isNaN(firstDefectDate.getTime())) {
            timeIntervals.push(firstDefectDate);
            dateFormat = 'MMM dd, yyyy'; // Default format for single point
        }
    }
    // If no filtered defects and no intervals, chartData will be empty, leading to chartWidth = 0.
    if (timeIntervals.length === 0 && filteredDefects.length === 0) {
        return { chartData: [], systems: allSystems };
    }


    const chartData = timeIntervals.map(intervalStart => {
      const dataPoint: { [key: string]: string | number } = {
        name: format(intervalStart, dateFormat) // This is the label for X-axis
      };

      allSystems.forEach(system => {
        PRIORITY_ORDER.forEach(priority => {
          let count = 0;
          if (priority !== 'No Defects') { // Only count actual defects for these priorities
            count = filteredDefects.filter(defect => {
              const defectDate = parseISO(defect.dateLogged);
              const isWithinInterval = this.isDateWithinInterval(defectDate, intervalStart, currentProcessingZoomLevel);
              // Check if defect.system matches or if it's null/undefined and we're grouping as 'Unknown System'
              const systemMatch = (defect.system === system) || (!defect.system && system === 'Unknown System');
              return systemMatch && defect.priority === priority && isWithinInterval;
            }).length;
          }
          dataPoint[`${system}_${priority}`] = count;
        });
      });
      return dataPoint;
    });

    // Add 'No Defects' pseudo-priority where no other defects exist for a system in an interval
    // This ensures a grey bar shows up even if there are no defects of other priorities
    chartData.forEach(dataPoint => {
        allSystems.forEach(system => {
            let totalDefectsForSystemInInterval = 0;
            PRIORITY_ORDER.filter(p => p !== 'No Defects').forEach(priority => {
                totalDefectsForSystemInInterval += (dataPoint[`${system}_${priority}`] as number || 0);
            });
            if (totalDefectsForSystemInInterval === 0) {
                dataPoint[`${system}_No Defects`] = 1; // Assign 1 to show a 'No Defects' bar
            } else {
                dataPoint[`${system}_No Defects`] = 0; // No 'No Defects' bar if actual defects exist
            }
        });
    });


    return { chartData, systems: allSystems }; // Return all systems for consistent legend/stacks
  }

  private determineDynamicZoomLevel(startDate: Date, endDate: Date): 'daily' | 'weekly' | 'monthly' | 'yearly' {
    const diffDays = differenceInCalendarDays(endDate, startDate);
    const diffMonths = differenceInCalendarMonths(endDate, startDate);
    const diffYears = differenceInCalendarYears(endDate, startDate);

    if (diffDays <= 45) { // Roughly 1.5 months
      return 'daily';
    } else if (diffMonths <= 6) { // Half a year
      return 'weekly';
    } else if (diffYears <= 2) { // 2 years
      return 'monthly';
    } else {
      return 'yearly';
    }
  }

  // NOTE: getIntervalEnd is not directly used in isDateWithinInterval, but provided for completeness if needed elsewhere
  private getIntervalEnd(intervalStart: Date, level: 'daily' | 'weekly' | 'monthly' | 'yearly'): Date {
    let end: Date;
    if (level === 'daily') {
      end = endOfDay(intervalStart);
    } else if (level === 'weekly') {
      end = endOfWeek(intervalStart, { weekStartsOn: 0 }); // Sunday is 0
    } else if (level === 'monthly') {
      end = endOfMonth(intervalStart);
    } else if (level === 'yearly') {
      end = endOfYear(intervalStart);
    } else {
      end = intervalStart; // Fallback
    }
    return end;
  }

  private isDateWithinInterval(date: Date, intervalStart: Date, level: 'daily' | 'weekly' | 'monthly' | 'yearly'): boolean {
    if (level === 'daily') {
      return isSameDay(date, intervalStart);
    } else if (level === 'weekly') {
      // For weekly, check if date is within the week *starting* on intervalStart
      const weekStart = startOfWeek(intervalStart, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(intervalStart, { weekStartsOn: 0 });
      return date >= weekStart && date <= weekEnd;
    } else if (level === 'monthly') {
      return isSameMonth(date, intervalStart);
    } else if (level === 'yearly') {
      return isSameYear(date, intervalStart);
    }
    return false;
  }

  // Safe interval functions to prevent errors with invalid date ranges
  private eachDayOfIntervalSafe(start: Date, end: Date): Date[] {
    if (start > end || isNaN(start.getTime()) || isNaN(end.getTime())) return [];
    return eachDayOfInterval({ start: startOfDay(start), end: endOfDay(end) }); // Ensure full days are covered
  }

  private eachWeekOfIntervalSafe(start: Date, end: Date): Date[] {
    if (start > end || isNaN(start.getTime()) || isNaN(end.getTime())) return [];
    return eachWeekOfInterval({ start: startOfWeek(start, { weekStartsOn: 0 }), end: endOfWeek(end, { weekStartsOn: 0 }) }, { weekStartsOn: 0 });
  }

  private eachMonthOfIntervalSafe(start: Date, end: Date): Date[] {
    if (start > end || isNaN(start.getTime()) || isNaN(end.getTime())) return [];
    return eachMonthOfInterval({ start: startOfMonth(start), end: endOfMonth(end) });
  }

  private eachYearOfIntervalSafe(start: Date, end: Date): Date[] {
    if (start > end || isNaN(start.getTime()) || isNaN(end.getTime())) return [];
    return eachYearOfInterval({ start: startOfYear(start), end: endOfYear(end) });
  }
}