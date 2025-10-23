// src/app/core/services/data-processing.service.ts
import { Injectable } from '@angular/core';
import { ChartConfiguration } from 'chart.js';

// Mock Interfaces (must match those in api.service.ts for consistency)
interface Equipment {
  EquipmentID: string;
  EquipmentName: string;
  EquipmentType: string;
  ShipID: string;
  CommandID: string;
  DepartmentID: string; // NEW
  SectionID: string | null; // Changed to allow null
  ComponentID: string | null; // Changed to allow null
  SubComponentID: string | null; // NEW (already was string | null)
  EquipmentCode: string; // NEW
  Specification: string | null; // Changed to allow null
  Manufacturer: string | null; // Changed to allow null
  InstallationDate: string;
  Status: string;
  HealthScore: number;
  ILMSMapped: boolean;
  LastUpdateDate: Date;
  LastUpdateDescription?: string;
  PolicyType?: string;
  IsCommon?: boolean;
}

interface Ship {
  ShipID: string;
  ShipName: string;
  ShipType: string;
  CommandID: string;
  CommissionDate: Date;
  DecommissionDate?: Date;
  SDPClearDryDockDate?: string | null;
  Status: string;
}

interface Command {
  CommandID: string;
  CommandName: string;
}

// Interfaces for modal data (can be defined directly in component or here if shared)
interface EquipmentDetailForModal {
  equipmentName: string;
  equipmentType: string;
  shipName: string;
  commandName: string;
  healthScore: number;
  isCommon: boolean;
}

interface MappedEquipmentDetailForModal {
  equipmentName: string;
  equipmentType: string;
  ilmsMapped: boolean;
  shipName: string;
  commandName: string;
}

interface SfdUpdateDetailForModal {
  equipmentName: string;
  updateDate: Date;
  updatedByCommand: string;
  updateDescription: string;
}

interface ShipDetailForModal {
  shipName: string;
  shipType: string;
  commandName: string;
  sdpClearDryDockDate?: string | null;
}


@Injectable({
  providedIn: 'root'
})
export class DataProcessingService {

  constructor() { }

  /**
   * Processes data for Total Active Ships KPI and its trend.
   * @param ships All ship data.
   * @returns An object with total active ships and trend data for sparkline.
   */
  processActiveShipsKPI(ships: Ship[]): { total: number; trend: number[] } {
    const activeShips = ships.filter(s => s.Status === 'Active').length;

    // Simulate trend data (e.g., last 6 months)
    // The numbers represent a scaled value for sparkline height, not raw count
    // Scale to values between 10 (min) and 40 (max) for sparkline height
    const rawTrend = [
      activeShips - 5 + Math.floor(Math.random() * 5),
      activeShips - 3 + Math.floor(Math.random() * 3),
      activeShips - 1 + Math.floor(Math.random() * 2),
      activeShips,
      activeShips + 2 - Math.floor(Math.random() * 2),
      activeShips + 1 - Math.floor(Math.random() * 1)
    ].map(val => Math.max(10, val)); // Ensure no negative or too low values

    const minRaw = Math.min(...rawTrend);
    const maxRaw = Math.max(...rawTrend);
    const rangeRaw = maxRaw - minRaw;

    const scaledTrend = rawTrend.map(val => {
      if (rangeRaw === 0) return 30; // Handle flat line, center it
      return 10 + ((val - minRaw) / rangeRaw) * 30; // Scale to 10-40 range
    });

    return { total: activeShips, trend: scaledTrend };
  }

  /**
   * Processes data for Operational Readiness Index KPI.
   * @param equipment All equipment data.
   * @returns The operational readiness percentage.
   */
  processOperationalReadinessKPI(equipment: Equipment[]): number {
    const operationalEquipment = equipment.filter(e => e.Status === 'Operational').length;
    const totalDeployedEquipment = equipment.length;
    if (totalDeployedEquipment === 0) return 0;
    return parseFloat(((operationalEquipment / totalDeployedEquipment) * 100).toFixed(1));
  }

  /**
   * Processes data for Average Equipment Health Score KPI.
   * @param equipment All equipment data.
   * @returns The average health score.
   */
  processAvgEquipmentHealthScoreKPI(equipment: Equipment[]): number {
    if (equipment.length === 0) return 0;
    const totalHealthScore = equipment.reduce((sum, e) => sum + e.HealthScore, 0);
    return parseFloat((totalHealthScore / equipment.length).toFixed(1));
  }

  /**
   * Processes data for Pending Maintenance KPI.
   * @param equipment All equipment data.
   * @returns The count of equipment with pending maintenance or upgrades.
   */
  processPendingMaintenanceKPI(equipment: Equipment[]): number {
    return equipment.filter(e =>
      e.Status === 'Maintenance' || e.PolicyType === 'Major Maintenance' || e.PolicyType === 'Upgrade'
    ).length;
  }

  /**
   * NEW: Processes data for Equipment Availability KPI.
   * @param equipment All equipment data.
   * @returns The equipment availability percentage.
   */
  processEquipmentAvailabilityKPI(equipment: Equipment[]): number {
    const operationalEquipment = equipment.filter(e => e.Status === 'Operational').length;
    const totalEquipment = equipment.length;
    if (totalEquipment === 0) return 0;
    return parseFloat(((operationalEquipment / totalEquipment) * 100).toFixed(1));
  }

  /**
   * Processes data for Fleet Composition by Ship Type Chart.
   * @param ships All ship data.
   * @param commands All command data.
   * @returns Chart.js data configuration.
   */
  processFleetCompositionData(ships: Ship[], commands: Command[]): ChartConfiguration<'bar'>['data'] {
    const commandNames = [...new Set(commands.map(c => c.CommandName))].sort();
    const shipTypes = [...new Set(ships.map(s => s.ShipType))].sort();

    const datasets = shipTypes.map(type => {
      return {
        data: commandNames.map(cmdName => {
          const commandId = commands.find(c => c.CommandName === cmdName)?.CommandID;
          return ships.filter(s => s.CommandID === commandId && s.Status === 'Active' && s.ShipType === type).length;
        }),
        label: type,
        backgroundColor: this.getShipTypeColor(type),
        hoverBackgroundColor: this.getShipTypeColor(type, true)
      };
    });

    return {
      labels: commandNames,
      datasets: datasets
    };
  }

  /**
   * Processes data for Common Equipment Distribution Chart.
   * @param equipment All equipment data.
   * @returns Chart.js data configuration.
   */
  processCommonEquipmentData(equipment: Equipment[]): ChartConfiguration<'doughnut'>['data'] {
    const commonEquipmentCounts = new Map<string, number>();

    equipment.forEach(e => {
      // For this mock, we count all equipment by its type for 'common distribution'
      commonEquipmentCounts.set(e.EquipmentType, (commonEquipmentCounts.get(e.EquipmentType) || 0) + 1);
    });

    const labels = Array.from(commonEquipmentCounts.keys()).sort();
    const data = labels.map(label => commonEquipmentCounts.get(label)!);

    return {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: [
            '#6a0572', '#ab47bc', '#d65b00', '#f48c06', '#faa63e', '#0097a7', '#5e35b1', '#c62828'
          ],
          hoverBackgroundColor: [
            '#53045a', '#913b9f', '#b24c00', '#c27104', '#d18932', '#007987', '#4527a0', '#b71c1c'
          ]
        }
      ]
    };
  }

  /**
   * Processes data for SFD/ILMS Mapping Status Chart.
   * @param equipment All equipment data.
   * @returns Chart.js data configuration.
   */
  processSFDILMSMappingData(equipment: Equipment[]): ChartConfiguration<'doughnut'>['data'] {
    const mapped = equipment.filter(e => e.ILMSMapped).length;
    const unmapped = equipment.filter(e => !e.ILMSMapped).length;

    return {
      labels: ['Mapped', 'Unmapped'],
      datasets: [
        {
          data: [mapped, unmapped],
          backgroundColor: ['#28a745', '#dc3545'], // Green for mapped, red for unmapped
          hoverBackgroundColor: ['#218838', '#c82333']
        }
      ]
    };
  }

  /**
   * Processes data for SFD Updates Velocity Chart.
   * @param equipment All equipment data.
   * @param commands All command data.
   * @returns Chart.js data configuration.
   */
  processSFDUpdatesData(equipment: Equipment[], commands: Command[]): ChartConfiguration<'line'>['data'] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']; // Fixed for 6 months as per previous spec
    const commandNames = commands.map(c => c.CommandName);

    const datasets: ChartConfiguration<'line'>['data']['datasets'] = commandNames.map(cmdName => {
      const updatesPerMonth = new Array(months.length).fill(0);
      const commandId = commands.find(c => c.CommandName === cmdName)?.CommandID;

      equipment.forEach(e => {
        if (e.CommandID === commandId && e.LastUpdateDate) {
          const updateMonth = new Date(e.LastUpdateDate).getMonth(); // 0-indexed month
          // Only consider updates within the last 6 months (Jan-Jun for mock)
          // Adjust this logic if your mock LastUpdateDate spans wider range
          if (updateMonth >= 0 && updateMonth <= 5) { // Assuming Jan (0) to Jun (5) for current mock
             updatesPerMonth[updateMonth]++;
          }
        }
      });

      return {
        data: updatesPerMonth,
        label: cmdName,
        borderColor: this.getCommandColor(cmdName),
        backgroundColor: this.getCommandColor(cmdName, true), // Transparent version for fill
        tension: 0.3,
        fill: true
      };
    });

    return {
      labels: months,
      datasets: datasets
    };
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

  private getCommandColor(commandName: string, isTransparent: boolean = false): string {
    const colors: { [key: string]: string } = {
      'Eastern Naval Command': '#8e24aa', // Purple
      'Western Naval Command': '#d81b60', // Pink
      'Southern Naval Command': '#f4511e', // Orange
    };
    const color = colors[commandName] || '#cccccc'; // Default gray
    if (isTransparent) {
      // Convert hex to rgba with 0.2 alpha
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.2)`;
    }
    return color;
  }

  private getMonthName(monthIndex: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthIndex];
  }
}
