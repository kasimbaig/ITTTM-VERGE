// src/app/shared/services/refit-cycle.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RefitCycle, RefitCyclesResponse, RefitSummary, FiltersApplied, RefitTypesBreakdown } from '../models/refit-cycle.model';
import { Option } from '../models/ship.model';

@Injectable({
  providedIn: 'root'
})
export class RefitCycleService {

  // Mock data for refit cycles
  private mockRefitCycles: RefitCycle[] = [
    {
      id: 1, title: 'INS Vikrant Long Refit', ship_name: 'INS Vikrant', ship_code: 'CV-01', command_id: 1,
      start_date: '2025-04-01', end_date: '2025-07-19', refit_type: 'Long Refit', location: 'Mumbai Dockyard',
      progress_percentage: 85, estimated_cost: 4500, crew_size: 1200, priority: 'High',
      type: 'refit', status: '', duration_days: 110 // Calculated for mock purposes
    },
    {
      id: 2, title: 'INS Chennai Major Refit', ship_name: 'INS Chennai', ship_code: 'D65', command_id: 1,
      start_date: '2025-05-10', end_date: '2025-08-25', refit_type: 'Major Refit', location: 'Vizag Dockyard',
      progress_percentage: 60, estimated_cost: 3000, crew_size: 800, priority: 'High',
      type: 'refit', status: '', duration_days: 108
    },
    {
      id: 3, title: 'INS Delhi Medium Refit', ship_name: 'INS Delhi', ship_code: 'D61', command_id: 1,
      start_date: '2025-06-01', end_date: '2025-07-30', refit_type: 'Medium Refit', location: 'Mumbai Dockyard',
      progress_percentage: 95, estimated_cost: 1500, crew_size: 400, priority: 'Medium',
      type: 'refit', status: '', duration_days: 60
    },
    {
      id: 4, title: 'INS Ranvijay Short Refit', ship_name: 'INS Ranvijay', ship_code: 'D55', command_id: 1,
      start_date: '2025-07-05', end_date: '2025-07-15', refit_type: 'Short Refit', location: 'Vizag Dockyard',
      progress_percentage: 70, estimated_cost: 500, crew_size: 150, priority: 'Low',
      type: 'refit', status: '', duration_days: 11
    },
    {
      id: 5, title: 'INS Sahyadri Minor Repair', ship_name: 'INS Sahyadri', ship_code: 'F49', command_id: 1,
      start_date: '2025-07-01', end_date: '2025-07-08', refit_type: 'Minor Repair', location: 'At Sea',
      progress_percentage: 100, estimated_cost: 100, crew_size: 50, priority: 'Medium',
      type: 'refit', status: '', duration_days: 8
    },
    {
      id: 6, title: 'INS Satpura Docking Period', ship_name: 'INS Satpura', ship_code: 'F48', command_id: 2, // Eastern Naval Command
      start_date: '2025-07-10', end_date: '2025-07-25', refit_type: 'Docking Period', location: 'Vizag Dockyard',
      progress_percentage: 20, estimated_cost: 800, crew_size: 200, priority: 'High',
      type: 'refit', status: '', duration_days: 16
    },
    {
      id: 7, title: 'INS Kamorta Scheduled Maint.', ship_name: 'INS Kamorta', ship_code: 'P28', command_id: 2,
      start_date: '2025-07-15', end_date: '2025-07-20', refit_type: 'Scheduled Maintenance', location: 'Port Blair',
      progress_percentage: 0, estimated_cost: 200, crew_size: 100, priority: 'Medium',
      type: 'refit', status: '', duration_days: 6
    },
    {
      id: 8, title: 'INS Shivalik Propulsion Check', ship_name: 'INS Shivalik', ship_code: 'F50', command_id: 1, // Western Naval Command
      start_date: '2025-07-08', end_date: '2025-07-12', refit_type: 'Propulsion Check', location: 'Mumbai Dockyard',
      progress_percentage: 50, estimated_cost: 300, crew_size: 80, priority: 'High',
      type: 'refit', status: '', duration_days: 5
    },
    {
      id: 9, title: 'INS Kavaratti Weapon Upgrade', ship_name: 'INS Kavaratti', ship_code: 'P31', command_id: 2,
      start_date: '2025-08-01', end_date: '2025-09-15', refit_type: 'Weapon System Upgrade', location: 'Vizag Dockyard',
      progress_percentage: 0, estimated_cost: 1200, crew_size: 300, priority: 'High',
      type: 'refit', status: '', duration_days: 46
    },
    {
      id: 10, title: 'INS Kadmatt Hull Inspection', ship_name: 'INS Kadmatt', ship_code: 'P29', command_id: 2,
      start_date: '2025-07-01', end_date: '2025-07-05', refit_type: 'Hull Inspection', location: 'Port Blair',
      progress_percentage: 100, estimated_cost: 150, crew_size: 70, priority: 'Low',
      type: 'refit', status: '', duration_days: 5
    },
    {
      id: 11, title: 'INS Talwar Minor Repair', ship_name: 'INS Talwar', ship_code: 'F40', command_id: 1, // Western Naval Command
      start_date: '2025-06-20', end_date: '2025-07-01', refit_type: 'Minor Repair', location: 'At Sea',
      progress_percentage: 100, estimated_cost: 80, crew_size: 40, priority: 'Low',
      type: 'refit', status: '', duration_days: 12
    },
    {
      id: 12, title: 'INS Sindhugosh Major Refit', ship_name: 'INS Sindhugosh', ship_code: 'S55', command_id: 1, // Western Naval Command
      start_date: '2025-03-15', end_date: '2025-06-30', refit_type: 'Major Refit', location: 'Mumbai Dockyard',
      progress_percentage: 100, estimated_cost: 2500, crew_size: 600, priority: 'High',
      type: 'refit', status: '', duration_days: 108
    },
    {
      id: 13, title: 'INS Arihant Scheduled Maint.', ship_name: 'INS Arihant', ship_code: 'S73', command_id: 2,
      start_date: '2025-06-01', end_date: '2025-06-10', refit_type: 'Scheduled Maintenance', location: 'Vizag Dockyard',
      progress_percentage: 100, estimated_cost: 180, crew_size: 90, priority: 'Medium',
      type: 'refit', status: '', duration_days: 10
    },
    {
      id: 14, title: 'INS Kiltan Docking Period', ship_name: 'INS Kiltan', ship_code: 'P30', command_id: 2,
      start_date: '2025-07-28', end_date: '2025-08-10', refit_type: 'Docking Period', location: 'Port Blair',
      progress_percentage: 0, estimated_cost: 700, crew_size: 180, priority: 'High',
      type: 'refit', status: '', duration_days: 14
    },
    {
      id: 15, title: 'INS Pralaya Short Refit', ship_name: 'INS Pralaya', ship_code: 'K96', command_id: 1, // Western Naval Command
      start_date: '2025-08-05', end_date: '2025-08-15', refit_type: 'Short Refit', location: 'Goa Shipyard',
      progress_percentage: 0, estimated_cost: 400, crew_size: 120, priority: 'Low',
      type: 'refit', status: '', duration_days: 11
    }
  ];

  // Mock data for ship options (used in dropdowns)
  private mockShipOptions: Option[] = [
    { label: 'INS Vikrant', value: 101, commandId: 1 },
    { label: 'INS Chennai', value: 102, commandId: 1 },
    { label: 'INS Delhi', value: 103, commandId: 1 },
    { label: 'INS Ranvijay', value: 104, commandId: 1 },
    { label: 'INS Sahyadri', value: 105, commandId: 1 },
    { label: 'INS Shivalik', value: 108, commandId: 1 },
    { label: 'INS Talwar', value: 111, commandId: 1 },
    { label: 'INS Sindhugosh', value: 112, commandId: 1 },
    { label: 'INS Pralaya', value: 113, commandId: 1 },

    { label: 'INS Satpura', value: 106, commandId: 2 },
    { label: 'INS Kamorta', value: 107, commandId: 2 },
    { label: 'INS Kavaratti', value: 109, commandId: 2 },
    { label: 'INS Kadmatt', value: 110, commandId: 2 },
    { label: 'INS Arihant', value: 114, commandId: 2 },
    { label: 'INS Kiltan', value: 115, commandId: 2 },

    { label: 'INS Gomati', value: 201, commandId: 3 }, // Southern Naval Command
    { label: 'INS Sumedha', value: 202, commandId: 3 },

    { label: 'INS Car Nicobar', value: 301, commandId: 4 }, // Andaman & Nicobar Command
  ];

  constructor() { }

  /**
   * Calculates the status of a refit cycle based on current date.
   * @param startDate The start date of the refit cycle.
   * @param endDate The end date of the refit cycle.
   * @returns 'completed', 'in_progress', or 'scheduled'.
   */
  private getRefitStatus(startDate: string, endDate: string): 'completed' | 'in_progress' | 'scheduled' {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now > end) {
      return 'completed';
    } else if (now >= start && now <= end) {
      return 'in_progress';
    } else {
      return 'scheduled';
    }
  }

  /**
   * Fetches mock refit cycle data based on provided filters.
   * @param commandId Optional: Filter by command ID.
   * @param shipId Optional: Filter by ship ID (value from Option).
   * @param startDate The start date for the refit cycles period (format: YYYY-MM-DD).
   * @param endDate The end date for the refit cycles period (format: YYYY-MM-DD).
   * @returns An Observable of RefitCyclesResponse.
   */
  getRefitCycles(
    commandId: number | null,
    shipId: number | null,
    startDate: string,
    endDate: string
  ): Observable<RefitCyclesResponse> {
    let filteredCycles = [...this.mockRefitCycles];

    // Filter by command
    if (commandId !== null) {
      filteredCycles = filteredCycles.filter(cycle => cycle.command_id === commandId);
    }

    // Filter by ship
    if (shipId !== null) {
      const selectedShip = this.mockShipOptions.find(opt => opt.value === shipId);
      if (selectedShip) {
        filteredCycles = filteredCycles.filter(cycle => cycle.ship_name === selectedShip.label);
      }
    }

    // Filter by date range
    const filterStartDate = new Date(startDate);
    const filterEndDate = new Date(endDate);

    filteredCycles = filteredCycles.filter(cycle => {
      const cycleStart = new Date(cycle.start_date);
      const cycleEnd = new Date(cycle.end_date);

      // Check for overlap: (start1 <= end2) && (end1 >= start2)
      return cycleStart <= filterEndDate && cycleEnd >= filterStartDate;
    });

    // Calculate summary data
    let totalRefits = filteredCycles.length;
    let completed = 0;
    let inProgress = 0;
    let scheduled = 0;
    let totalEstimatedCost = 0;
    let totalDurationDays = 0;

    const uniqueLocations = new Set<string>();
    const refitTypesCount: RefitTypesBreakdown = {};

    filteredCycles.forEach(cycle => {
      const status = this.getRefitStatus(cycle.start_date, cycle.end_date);
      if (status === 'completed') {
        completed++;
      } else if (status === 'in_progress') {
        inProgress++;
      } else {
        scheduled++;
      }
      totalEstimatedCost += cycle.estimated_cost;
      totalDurationDays += cycle.duration_days || 0; // Use 0 if duration_days is undefined

      uniqueLocations.add(cycle.location);

      refitTypesCount[cycle.refit_type] = (refitTypesCount[cycle.refit_type] || 0) + 1;
    });

    const averageDuration = totalRefits > 0 ? totalDurationDays / totalRefits : 0;

    const summary: RefitSummary = {
      total_refits: totalRefits,
      completed: completed,
      in_progress: inProgress,
      scheduled: scheduled,
      total_estimated_cost: totalEstimatedCost,
      average_duration: parseFloat(averageDuration.toFixed(2))
    };

    const filtersApplied: FiltersApplied = {
      command_id: commandId,
      ship_id: shipId,
      start_date: startDate,
      end_date: endDate
    };

    const locationsArray = Array.from(uniqueLocations);

    if (filteredCycles.length > 0) {
      return of({
        status: 'success',
        message: 'Refit cycles retrieved successfully.',
        status_code: 200,
        data: {
          refit_cycles: filteredCycles,
          summary: summary,
          filters_applied: filtersApplied,
          refit_types: refitTypesCount,
          locations: locationsArray
        }
      });
    } else {
      return of({
        status: 'success',
        message: 'No refit cycles found for the selected filters.',
        status_code: 200,
        data: {
          refit_cycles: [],
          summary: { total_refits: 0, completed: 0, in_progress: 0, scheduled: 0, total_estimated_cost: 0, average_duration: 0 },
          filters_applied: filtersApplied,
          refit_types: {},
          locations: []
        }
      });
    }
  }

  /**
   * Provides mock ship options for dropdowns.
   * @returns An Observable of Option array.
   */
  getShipOptions(): Observable<Option[]> {
    return of(this.mockShipOptions);
  }
}
