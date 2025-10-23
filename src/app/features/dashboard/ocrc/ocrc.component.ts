// src/app/features/ocrc/ocrc.component.ts

import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

// PrimeNG imports
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DragDropModule } from 'primeng/dragdrop';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { CalendarModule } from 'primeng/calendar';
import { TabViewModule } from 'primeng/tabview';
import { MessageService } from 'primeng/api'; // For toast messages
// Commented out API services - using static data instead
// import { Option } from '../../../masters/ship-master/ship.model';
// import { DefectListService } from '../../../shared/services/defect-list.service';
// import { CommandService } from '../../../masters/ship-master/ship-services/command.service';
// import { RefitCycle } from '../../../shared/models/refit-cycle.model';

// Static data imports
import {
  STATIC_COMMANDS,
  STATIC_REFIT_CYCLES,
  getRefitCyclesByCommandAndDateRange,
  StaticOption,
  StaticRefitCycle
} from '../dashboard-static-data';


// Interfaces for OCRC specific data (adjusted for refit cycles)
interface OcrcResource {
  id: string;
  name: string; // Ship name
  avatar: string;
  role: string; // e.g., "Naval Vessel"
  groupId: string;
}

interface OcrcResourceGroup {
  id: string;
  name: string; // e.g., "Naval Fleet"
  expanded: boolean;
  resources: OcrcResource[];
}

interface OcrcTask {
  id: string;
  title: string;
  resourceId: string; // Ship ID
  startTime: Date;
  endTime: Date;
  color: string;
  status: string; // 'progress', 'completed', 'pending'
  type: 'operational' | 'refit'; // To distinguish between event types
  refitType?: string; // Only for refit tasks
  // Add other properties from RefitCycle if needed for display in dialog
  ship_code?: string;
  location?: string;
  progress_percentage?: number;
  estimated_cost?: number;
  crew_size?: number;
  priority?: string;
}

interface DropdownOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-ocrc',
  standalone: true,
  imports: [
    DropdownModule,
    DialogModule,
    ButtonModule,
    TabViewModule,
    TableModule,
    DragDropModule,
    OverlayPanelModule,
    CalendarModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './ocrc.component.html',
  styleUrls: ['./ocrc.component.css'],
  providers: [MessageService] // Provide MessageService for toasts
})
export class OcrcComponent implements OnInit, OnDestroy {
  @Input() menuExpanded = true;
  // Timeline data
  resourceGroups: OcrcResourceGroup[] = [];
  tasks: OcrcTask[] = [];
  timeSlots: Date[] = []; // Represents days on the timeline header

  // Filter properties for static data
  commands: StaticOption[] = STATIC_COMMANDS; // Static command options
  selectedCommand: number | null = null; // Selected command ID
  dateRange: Date[] = []; // [startDate, endDate] for calendar input
  minDate: Date = new Date(); // Minimum selectable date in calendar
  maxDate: Date = new Date(); // Maximum selectable date in calendar

  // Dialog state for task details
  displayTaskDialog = false;
  selectedTask: OcrcTask | null = null;

  // Dropdown options for task status filter
  statusOptions: DropdownOption[] = [
    { label: 'All Status', value: 'all' },
    { label: 'In Progress', value: 'progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Pending', value: 'pending' }
  ];
  selectedStatus = 'all'; // Currently selected status filter

  // Drag and drop state
  draggedTask: OcrcTask | null = null;

  private destroy$ = new Subject<void>(); // Used to unsubscribe from observables on component destruction

  constructor(
    // Commented out API services - using static data instead
    // private defectListService: DefectListService,
    // private commandService: CommandService,
    private messageService: MessageService // Inject MessageService for user feedback
  ) {
    // Static data is already initialized above
  }

  ngOnInit() {
    this.initializeDateRange(); // Set up default date range for the calendar
    // Set default command from static data
    this.selectedCommand = this.commands[1]?.value || null; // Skip "All Commands" option
    this.fetchRefitCycles(); // Load static refit cycles data
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions to prevent memory leaks
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initializes the default date range for the calendar and sets min/max selectable dates.
   * Default range is 6 months around the current date.
   */
  initializeDateRange(): void {
    const today = new Date();
    this.dateRange = [
      new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()), // 3 months prior
      new Date(today.getFullYear(), today.getMonth() + 3, today.getDate())  // 3 months after
    ];
    this.minDate = new Date(today.getFullYear() - 1, 0, 1); // Allow selecting up to 1 year back
    this.maxDate = new Date(today.getFullYear() + 2, 11, 31); // Allow selecting up to 2 years forward
    this.generateTimeSlots(); // Generate initial time slots based on this range
  }

  /**
   * Fetches refit cycle data from static data based on the currently selected command and date range.
   * Displays a warning if essential filters are not selected.
   */
  fetchRefitCycles(): void {
    // Validate that a command and a full date range are selected
    if (this.selectedCommand === null || !this.dateRange[0] || !this.dateRange[1]) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a Command and a valid Date Range to fetch data.' });
      // Clear existing data if filters are incomplete
      this.resourceGroups = [];
      this.tasks = [];
      return;
    }

    // Format dates to YYYY-MM-DD string for filtering
    const startDate = this.dateRange[0].toISOString().split('T')[0];
    const endDate = this.dateRange[1].toISOString().split('T')[0];

    // Get static refit cycles data
    const refitCycles = getRefitCyclesByCommandAndDateRange(this.selectedCommand, startDate, endDate);
    
    if (refitCycles && refitCycles.length > 0) {
      // Initialize the timeline data with the static refit cycles
      this.initializeOcrcData(refitCycles);
      this.messageService.add({ severity: 'success', summary: 'Success', detail: `Loaded ${refitCycles.length} refit cycles from static data.` });
    } else {
      // Handle case where no data matches the filters
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'No refit cycles found for the selected filters.' });
      this.resourceGroups = []; // Clear data
      this.tasks = [];
    }
  }

  /**
   * Initializes OCRC resources (ships) and tasks (refit periods) from the static `refitCycles` data.
   * This method transforms the static data into the format required for the timeline display.
   * @param refitCycles The array of StaticRefitCycle objects from static data.
   */
  initializeOcrcData(refitCycles: StaticRefitCycle[]) {
    this.resourceGroups = [];
    this.tasks = [];

    const uniqueShips = new Map<string, OcrcResource>();
    const navalFleetGroup: OcrcResourceGroup = {
      id: 'naval-fleet',
      name: 'Naval Fleet',
      expanded: true,
      resources: []
    };

    refitCycles.forEach(cycle => {
      // Create or get the resource (ship) if it doesn't already exist
      if (!uniqueShips.has(cycle.ship_name)) {
        const newResource: OcrcResource = {
          id: cycle.ship_name, // Using ship name as ID for simplicity in the timeline
          name: cycle.ship_name,
          // Generate a placeholder avatar with the first letter of the ship's name
          avatar: `https://placehold.co/150x150/AEC6CF/000000?text=${cycle.ship_name.charAt(4).toUpperCase()}`,
          role: 'Naval Vessel',
          groupId: navalFleetGroup.id
        };
        uniqueShips.set(cycle.ship_name, newResource);
        navalFleetGroup.resources.push(newResource);
      }

      // Create a task for the refit period
      this.tasks.push({
        id: `${cycle.ship_name}-refit-${cycle.id}`, // Unique ID for the task
        title: cycle.title,
        resourceId: cycle.ship_name,
        startTime: new Date(cycle.start_date),
        endTime: new Date(cycle.end_date),
        color: this.getRefitTypeColor(cycle.refit_type), // Assign color based on refit type
        status: this.getTaskStatus(new Date(cycle.start_date), new Date(cycle.end_date)), // Determine status (completed, progress, pending)
        type: 'refit', // Explicitly mark as refit type
        refitType: cycle.refit_type,
        // Include additional properties for display in the task details dialog
        ship_code: cycle.ship_code,
        location: cycle.location,
        progress_percentage: cycle.progress_percentage,
        estimated_cost: cycle.estimated_cost,
        crew_size: cycle.crew_size,
        priority: cycle.priority
      });
    });

    // Sort resources (ships) alphabetically by name for consistent display
    navalFleetGroup.resources.sort((a, b) => a.name.localeCompare(b.name));
    this.resourceGroups.push(navalFleetGroup); // Add the main group to the display
  }

  /**
   * Assigns a distinct color to each refit type for visual differentiation on the timeline.
   * @param refitType The type of refit (e.g., 'Long Refit', 'Major Refit').
   * @returns A hex color string.
   */
  getRefitTypeColor(refitType: string): string {
    switch (refitType) {
      case 'Long Refit': return '#ef4444'; // Red
      case 'Major Refit': return '#f97316'; // Orange
      case 'Medium Refit': return '#eab308'; // Yellow
      case 'Short Refit': return '#22c55e'; // Green
      case 'Docking Period': return '#3b82f6'; // Blue
      case 'Minor Repair': return '#a855f7'; // Purple
      case 'Scheduled Maintenance': return '#14b8a6'; // Teal
      case 'Propulsion Check': return '#6d28d9'; // Deep Purple
      case 'Weapon System Upgrade': return '#be123c'; // Dark Red
      case 'Hull Inspection': return '#059669'; // Dark Green
      default: return '#6b7280'; // Default gray for unknown types
    }
  }

  /**
   * Generates an array of Date objects representing each day within the selected date range.
   * These are used for the timeline header.
   */
  generateTimeSlots(): void {
    this.timeSlots = [];
    // Ensure both start and end dates are valid
    if (!this.dateRange || this.dateRange.length !== 2 || !this.dateRange[0] || !this.dateRange[1]) {
      return;
    }

    const startDate = new Date(this.dateRange[0]);
    startDate.setHours(0, 0, 0, 0); // Normalize to start of day
    const endDate = new Date(this.dateRange[1]);
    endDate.setHours(23, 59, 59, 999); // Normalize to end of day

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      this.timeSlots.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }
  }

  /**
   * Handles the change event for the date range picker.
   * Triggers `generateTimeSlots` and `fetchRefitCycles` to update the timeline.
   */
  onDateRangeChange(): void {
    if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
      this.generateTimeSlots(); // Re-generate time slots based on new range
      this.fetchRefitCycles(); // Fetch data with the new date range
    }
  }

  /**
   * Handles the change event for the command dropdown.
   * Triggers `fetchRefitCycles` to update the timeline with data for the selected command.
   */
  onCommandChange(): void {
    this.fetchRefitCycles(); // Fetch data with the new command selection
  }

  /**
   * Determines the current status of a task (completed, in progress, or pending)
   * based on its start and end dates relative to the current date.
   * @param start The start date of the task.
   * @param end The end date of the task.
   * @returns A string indicating the status ('completed', 'progress', or 'pending').
   */
  getTaskStatus(start: Date, end: Date): string {
    const now = new Date();
    // Normalize dates to start of day for accurate comparison
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskStartDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const taskEndDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    if (todayStart > taskEndDay) {
      return 'completed'; // Task ended before today
    } else if (todayStart >= taskStartDay && todayStart <= taskEndDay) {
      return 'progress'; // Task is ongoing today
    } else {
      return 'pending'; // Task is scheduled for a future date
    }
  }

  /**
   * Toggles the expanded/collapsed state of a resource group (e.g., "Naval Fleet").
   * @param groupId The unique ID of the group to toggle.
   */
  toggleGroup(groupId: string) {
    const group = this.resourceGroups.find(g => g.id === groupId);
    if (group) {
      group.expanded = !group.expanded;
    }
  }

  /**
   * Filters and returns tasks associated with a specific resource (ship),
   * optionally filtering by the selected status.
   * @param resourceId The ID of the resource (ship name).
   * @returns An array of filtered OcrcTask objects.
   */
  getTasksForResource(resourceId: string): OcrcTask[] {
    const filteredTasks = this.tasks.filter(task => task.resourceId === resourceId);
    if (this.selectedStatus === 'all') {
      return filteredTasks; // Return all tasks if 'All Status' is selected
    }
    return filteredTasks.filter(task => task.status === this.selectedStatus); // Filter by selected status
  }

  /**
   * Calculates the CSS `left` and `width` properties for a task item on the timeline.
   * This positions the task correctly based on its start/end dates within the visible timeline range.
   * @param task The OcrcTask object.
   * @returns An object with `left` and `width` CSS string values.
   */
  getTaskPosition(task: OcrcTask): any {
    // Ensure valid date range for calculation
    if (!this.dateRange || this.dateRange.length !== 2 || !this.dateRange[0] || !this.dateRange[1]) {
      return { left: '0%', width: '0%' };
    }

    const timelineStartDate = new Date(this.dateRange[0]);
    timelineStartDate.setHours(0, 0, 0, 0); // Normalize to start of day

    const timelineEndDate = new Date(this.dateRange[1]);
    timelineEndDate.setHours(23, 59, 59, 999); // Normalize to end of day

    // Calculate total number of days in the visible timeline
    const totalDaysInTimeline = Math.ceil((timelineEndDate.getTime() - timelineStartDate.getTime()) / (1000 * 60 * 60 * 24));
    if (totalDaysInTimeline === 0) return { left: '0%', width: '0%' }; // Avoid division by zero

    const dayWidthPercentage = 100 / totalDaysInTimeline; // Percentage width for one day

    const taskStartDay = new Date(task.startTime.getFullYear(), task.startTime.getMonth(), task.startTime.getDate());
    const taskEndDay = new Date(task.endTime.getFullYear(), task.endTime.getMonth(), task.endTime.getDate());

    // Calculate start position relative to the timeline's start date
    const daysFromTimelineStart = (taskStartDay.getTime() - timelineStartDate.getTime()) / (1000 * 60 * 60 * 24);
    let left = daysFromTimelineStart * dayWidthPercentage;

    // Calculate task duration in days (+1 to include the end day itself)
    const durationDays = Math.ceil((taskEndDay.getTime() - taskStartDay.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    let width = durationDays * dayWidthPercentage;

    // Clamp values to ensure they stay within the 0-100% range of the timeline
    // This prevents tasks from extending outside the visible area
    const clampedLeft = Math.max(0, left);
    const clampedWidth = Math.min(100 - clampedLeft, width);

    return {
      left: `${clampedLeft}%`,
      width: `${Math.max(clampedWidth, 0.5)}%` // Ensure a minimum width for visibility
    };
  }

  /**
   * Retrieves the display name of a resource (ship) given its ID.
   * @param resourceId The ID of the resource.
   * @returns The name of the resource or 'Unknown Ship' if not found.
   */
  getResourceName(resourceId: string): string {
    for (const group of this.resourceGroups) {
      const resource = group.resources.find(r => r.id === resourceId);
      if (resource) {
        return resource.name;
      }
    }
    return 'Unknown Ship';
  }

  /**
   * Formats a Date object into a short, readable string for the timeline header (e.g., "Mon, Jul 7").
   * @param date The Date object to format.
   * @returns A formatted date string.
   */
  formatDateForHeader(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Formats a Date object into a readable time string (e.g., "9:00 AM").
   * This method is primarily for displaying time within the task details dialog,
   * though the timeline itself is now day-based.
   * @param date The Date object to format.
   * @returns A formatted time string.
   */
  formatTime(date: Date): string {
    if (!date) {
      return '';
    }
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Opens the task details dialog and sets the `selectedTask` for display.
   * @param task The OcrcTask object to display details for.
   */
  openTaskDialog(task: OcrcTask) {
    this.selectedTask = task;
    this.displayTaskDialog = true;
  }

  /**
   * Closes the task details dialog and clears the `selectedTask`.
   */
  closeTaskDialog() {
    this.displayTaskDialog = false;
    this.selectedTask = null;
  }

  // Drag and drop methods (functionality remains the same)
  onTaskDragStart(task: OcrcTask) {
    this.draggedTask = task;
  }

  onTaskDragEnd() {
    this.draggedTask = null;
  }

  onResourceDrop(event: any, resourceId: string) {
    event.preventDefault();
    if (this.draggedTask) {
      const taskIndex = this.tasks.findIndex(t => t.id === this.draggedTask!.id);
      if (taskIndex !== -1) {
        this.tasks[taskIndex].resourceId = resourceId;
        this.tasks = [...this.tasks]; // Trigger change detection
      }
    }
  }

  onResourceDragOver(event: any) {
    event.preventDefault();
  }

  /**
   * Shifts the current date range displayed on the timeline by a specified number of days.
   * @param days The number of days to shift (positive for forward, negative for backward).
   * Calls `onDateRangeChange` to refresh the view and data.
   */
  shiftDateRange(days: number) {
    if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
      const newStartDate = new Date(this.dateRange[0]);
      newStartDate.setDate(newStartDate.getDate() + days);
      const newEndDate = new Date(this.dateRange[1]);
      newEndDate.setDate(newEndDate.getDate() + days);
      this.dateRange = [newStartDate, newEndDate];
      this.onDateRangeChange(); // Re-generate time slots and update view/data
    }
  }

  /**
   * Resets the date range to display the current week (7 days starting from today).
   * Calls `onDateRangeChange` to refresh the view and data.
   */
  goToTodayRange() {
    const today = new Date();
    this.dateRange = [new Date(today.getFullYear(), today.getMonth(), today.getDate()), new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6)];
    this.onDateRangeChange();
  }
}
