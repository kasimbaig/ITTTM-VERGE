// src/app/core/services/api.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// Mock Interfaces based on your ERD and new filter requirements
interface Equipment {
  EquipmentID: string;
  EquipmentName: string;
  EquipmentType: string; // e.g., Radar, Propulsion, Sonar
  ShipID: string;
  CommandID: string;
  DepartmentID: string; // NEW
  SectionID: string | null; // Changed to allow null
  ComponentID: string | null; // Changed to allow null
  SubComponentID: string | null; // Changed to allow null
  EquipmentCode: string; // NEW: e.g., GT1, GT2, RADAR-01
  Specification: string | null; // Changed to allow null
  Manufacturer: string | null; // Changed to allow null
  InstallationDate: string; //YYYY-MM-DD format for mock
  Status: string;
  HealthScore: number;
  ILMSMapped: boolean;
  LastUpdateDate: Date;
  LastUpdateDescription?: string;
  PolicyType?: string;
  IsCommon?: boolean; // For common/unique categorization
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

interface Department { // NEW
  DepartmentID: string;
  DepartmentName: string;
}

interface Section { // Kept for data structure, not for filtering
  SectionID: string;
  SectionName: string;
  DepartmentID: string; // Link to Department
}

interface Component { // Kept for data structure, not for filtering
  ComponentID: string;
  ComponentName: string;
  EquipmentType: string; // Link to EquipmentType
}

interface SubComponent { // NEW
  SubComponentID: string;
  SubComponentName: string;
  ComponentID: string; // Link to Component
}

interface Alert {
  id: number;
  type: 'Critical' | 'Warning' | 'Maintenance';
  message: string;
  timestamp: Date;
  status: string;
  shipId: string | null;
  equipmentId: string | null;
}

// Interfaces for filter parameters - now simplified
export interface DashboardFilters {
  commandId?: string | null;
  shipId?: string | null;
  departmentId?: string | null;
  equipmentType?: string | null;
  subComponentId?: string | null;
  equipmentCode?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // --- Mock Data ---
  private mockCommands: Command[] = [
    { CommandID: 'CMD001', CommandName: 'Eastern Naval Command' },
    { CommandID: 'CMD002', CommandName: 'Western Naval Command' },
    { CommandID: 'CMD003', CommandName: 'Southern Naval Command' },
  ];

  private mockShips: Ship[] = [
    { ShipID: 'S001', ShipName: 'INS Vikrant', ShipType: 'Carrier', CommandID: 'CMD001', CommissionDate: new Date('2013-08-15'), Status: 'Active', SDPClearDryDockDate: null },
    { ShipID: 'S002', ShipName: 'INS Kolkata', ShipType: 'Destroyer', CommandID: 'CMD001', CommissionDate: new Date('2014-08-16'), Status: 'Active', SDPClearDryDockDate: '2024-12-01' },
    { ShipID: 'S003', ShipName: 'INS Chennai', ShipType: 'Destroyer', CommandID: 'CMD002', CommissionDate: new Date('2016-11-21'), Status: 'Active', SDPClearDryDockDate: '2025-01-15' },
    { ShipID: 'S004', ShipName: 'INS Rajput', ShipType: 'Destroyer', CommandID: 'CMD003', CommissionDate: new Date('1980-05-04'), DecommissionDate: new Date('2021-05-21'), Status: 'Decommissioned', SDPClearDryDockDate: null },
    { ShipID: 'S005', ShipName: 'INS Kalvari', ShipType: 'Submarine', CommandID: 'CMD001', CommissionDate: new Date('2017-12-14'), Status: 'Active', SDPClearDryDockDate: '2025-06-30' },
    { ShipID: 'S006', ShipName: 'INS Kavaratti', ShipType: 'Corvette', CommandID: 'CMD003', CommissionDate: new Date('2020-02-10'), Status: 'Active', SDPClearDryDockDate: null },
    { ShipID: 'S007', ShipName: 'INS Kamorta', ShipType: 'Corvette', CommandID: 'CMD003', CommissionDate: new Date('2014-08-23'), Status: 'Active', SDPClearDryDockDate: '2024-10-01' },
    { ShipID: 'S008', ShipName: 'INS Arihant', ShipType: 'Submarine', CommandID: 'CMD001', CommissionDate: new Date('2016-10-17'), Status: 'Active', SDPClearDryDockDate: null },
    { ShipID: 'S009', ShipName: 'INS Shivalik', ShipType: 'Frigate', CommandID: 'CMD002', CommissionDate: new Date('2010-04-29'), Status: 'Active', SDPClearDryDockDate: '2025-03-20' },
    { ShipID: 'S010', ShipName: 'INS Sahyadri', ShipType: 'Frigate', CommandID: 'CMD002', CommissionDate: new Date('2012-07-21'), Status: 'Active', SDPClearDryDockDate: null },
  ];

  private mockDepartments: Department[] = [ // NEW
    { DepartmentID: 'DEP001', DepartmentName: 'Engineering' },
    { DepartmentID: 'DEP002', DepartmentName: 'Combat Systems' },
    { DepartmentID: 'DEP003', DepartmentName: 'Navigation' },
    { DepartmentID: 'DEP004', DepartmentName: 'Hull & Structure' }
  ];

  private mockSections: Section[] = [ // Kept for data structure, not for filtering
    { SectionID: 'SEC001', SectionName: 'Power Generation', DepartmentID: 'DEP001' },
    { SectionID: 'SEC002', SectionName: 'Propulsion Control', DepartmentID: 'DEP001' },
    { SectionID: 'SEC003', SectionName: 'HVAC', DepartmentID: 'DEP001' },
    { SectionID: 'SEC004', SectionName: 'Radar Systems', DepartmentID: 'DEP002' },
    { SectionID: 'SEC005', SectionName: 'Sonar Systems', DepartmentID: 'DEP002' },
    { SectionID: 'SEC006', SectionName: 'Communication', DepartmentID: 'DEP002' },
    { SectionID: 'SEC007', SectionName: 'Bridge & Helm', DepartmentID: 'DEP003' },
    { SectionID: 'SEC008', SectionName: 'Safety Equipment', DepartmentID: 'DEP004' }
  ];

  private mockComponents: Component[] = [ // Kept for data structure, not for filtering
    { ComponentID: 'COMP001', ComponentName: 'Main Engine', EquipmentType: 'Propulsion' },
    { ComponentID: 'COMP002', ComponentName: 'Auxiliary Generator', EquipmentType: 'Auxiliary' },
    { ComponentID: 'COMP003', ComponentName: 'Air Compressor', EquipmentType: 'HVAC' },
    { ComponentID: 'COMP004', ComponentName: 'Antenna Array', EquipmentType: 'Radar' },
    { ComponentID: 'COMP005', ComponentName: 'Transducer', EquipmentType: 'Sonar' },
    { ComponentID: 'COMP006', ComponentName: 'Transceiver', EquipmentType: 'Communication' }
  ];

  private mockSubComponents: SubComponent[] = [ // NEW
    { SubComponentID: 'SUB001', SubComponentName: 'Turbocharger', ComponentID: 'COMP001' },
    { SubComponentID: 'SUB002', SubComponentName: 'Fuel Injector', ComponentID: 'COMP001' },
    { SubComponentID: 'SUB003', SubComponentName: 'Stator', ComponentID: 'COMP002' },
    { SubComponentID: 'SUB004', SubComponentName: 'Filter Unit', ComponentID: 'COMP003' },
    { SubComponentID: 'SUB005', SubComponentName: 'Phased Array Module', ComponentID: 'COMP004' }
  ];

  private mockEquipment: Equipment[] = [
    { EquipmentID: 'EQ001', EquipmentName: 'X-Band Radar', EquipmentType: 'Radar', ShipID: 'S001', CommandID: 'CMD001', DepartmentID: 'DEP002', SectionID: 'SEC004', ComponentID: 'COMP004', SubComponentID: 'SUB005', EquipmentCode: 'RADAR-01', Specification: 'High Resolution', Manufacturer: 'Raytheon', InstallationDate: '2020-01-15', Status: 'Operational', HealthScore: 90, ILMSMapped: true, LastUpdateDate: new Date('2024-06-01'), LastUpdateDescription: 'Routine system check and update.', PolicyType: 'Regular', IsCommon: true },
    { EquipmentID: 'EQ002', EquipmentName: 'Port Main Engine', EquipmentType: 'Propulsion', ShipID: 'S001', CommandID: 'CMD001', DepartmentID: 'DEP001', SectionID: 'SEC002', ComponentID: 'COMP001', SubComponentID: 'SUB001', EquipmentCode: 'ME-P-01', Specification: '20MW Diesel', Manufacturer: 'GE', InstallationDate: '2019-03-20', Status: 'Operational', HealthScore: 85, ILMSMapped: true, LastUpdateDate: new Date('2024-05-20'), LastUpdateDescription: 'Lubricant levels updated.', PolicyType: 'Regular', IsCommon: true },
    { EquipmentID: 'EQ003', EquipmentName: 'Hull Mounted Sonar', EquipmentType: 'Sonar', ShipID: 'S002', CommandID: 'CMD001', DepartmentID: 'DEP002', SectionID: 'SEC005', ComponentID: 'COMP005', SubComponentID: null, EquipmentCode: 'SONAR-02', Specification: 'Active/Passive', Manufacturer: 'Thales', InstallationDate: '2021-07-01', Status: 'Under Repair', HealthScore: 40, ILMSMapped: false, LastUpdateDate: new Date('2024-06-10'), LastUpdateDescription: 'Major component replacement.', PolicyType: 'Major Maintenance', IsCommon: false },
    { EquipmentID: 'EQ004', EquipmentName: 'SATCOM Terminal', EquipmentType: 'Communication', ShipID: 'S002', CommandID: 'CMD001', DepartmentID: 'DEP002', SectionID: 'SEC006', ComponentID: 'COMP006', SubComponentID: null, EquipmentCode: 'SATCOM-03', Specification: 'Ku-Band', Manufacturer: 'Harris', InstallationDate: '2020-11-10', Status: 'Operational', HealthScore: 92, ILMSMapped: true, LastUpdateDate: new Date('2024-04-25'), LastUpdateDescription: 'Software patch applied.', PolicyType: 'Regular', IsCommon: true },
    { EquipmentID: 'EQ005', EquipmentName: 'S-Band Radar', EquipmentType: 'Radar', ShipID: 'S003', CommandID: 'CMD002', DepartmentID: 'DEP002', SectionID: 'SEC004', ComponentID: 'COMP004', SubComponentID: 'SUB005', EquipmentCode: 'RADAR-02', Specification: 'Long Range', Manufacturer: 'Lockheed', InstallationDate: '2018-05-01', Status: 'Operational', HealthScore: 75, ILMSMapped: true, LastUpdateDate: new Date('2024-06-05'), LastUpdateDescription: 'Firmware upgrade.', PolicyType: 'Regular', IsCommon: true },
    { EquipmentID: 'EQ006', EquipmentName: 'VLS Launcher 1', EquipmentType: 'Weaponry', ShipID: 'S003', CommandID: 'CMD002', DepartmentID: 'DEP002', SectionID: null, ComponentID: null, SubComponentID: null, EquipmentCode: 'VLS-01', Specification: 'Mk41 Compatible', Manufacturer: 'Boeing', InstallationDate: '2022-02-01', Status: 'Operational', HealthScore: 95, ILMSMapped: false, LastUpdateDate: new Date('2024-05-15'), LastUpdateDescription: 'Ammunition bay inspection.', PolicyType: 'Regular', IsCommon: false },
    { EquipmentID: 'EQ007', EquipmentName: 'GPS Receiver', EquipmentType: 'Navigation', ShipID: 'S004', CommandID: 'CMD003', DepartmentID: 'DEP003', SectionID: 'SEC007', ComponentID: null, SubComponentID: null, EquipmentCode: 'GPS-01', Specification: 'Navstar Compatible', Manufacturer: 'Garmin', InstallationDate: '2023-01-01', Status: 'Operational', HealthScore: 98, ILMSMapped: true, LastUpdateDate: new Date('2024-06-12'), LastUpdateDescription: 'GPS module alignment.', PolicyType: 'Regular', IsCommon: true },
    { EquipmentID: 'EQ008', EquipmentName: 'Emergency Diesel Gen', EquipmentType: 'Auxiliary', ShipID: 'S004', CommandID: 'CMD003', DepartmentID: 'DEP001', SectionID: 'SEC001', ComponentID: 'COMP002', SubComponentID: 'SUB003', EquipmentCode: 'EDG-01', Specification: '500kW Rating', Manufacturer: 'Caterpillar', InstallationDate: '2017-09-01', Status: 'Maintenance', HealthScore: 60, ILMSMapped: true, LastUpdateDate: new Date('2024-06-18'), LastUpdateDescription: 'Scheduled filter replacement.', PolicyType: 'Scheduled Maintenance', IsCommon: true },
    { EquipmentID: 'EQ009', EquipmentName: 'Torpedo Tube 1', EquipmentType: 'Weaponry', ShipID: 'S005', CommandID: 'CMD001', DepartmentID: 'DEP002', SectionID: null, ComponentID: null, SubComponentID: null, EquipmentCode: 'TT-01', Specification: '533mm', Manufacturer: 'Northrop Grumman', InstallationDate: '2019-10-10', Status: 'Operational', HealthScore: 88, ILMSMapped: false, LastUpdateDate: new Date('2024-06-03'), LastUpdateDescription: 'Targeting software update.', PolicyType: 'Regular', IsCommon: false },
    { EquipmentID: 'EQ010', EquipmentName: 'Fuel Quality Monitor', EquipmentType: 'Fuel', ShipID: 'S005', CommandID: 'CMD001', DepartmentID: 'DEP001', SectionID: 'SEC001', ComponentID: null, SubComponentID: null, EquipmentCode: 'FQM-01', Specification: 'Hydrocarbon Sensor', Manufacturer: 'Honeywell', InstallationDate: '2022-08-01', Status: 'Operational', HealthScore: 80, ILMSMapped: true, LastUpdateDate: new Date('2024-05-01'), LastUpdateDescription: 'Fuel sensor recalibration.', PolicyType: 'Upgrade', IsCommon: true },
    { EquipmentID: 'EQ011', EquipmentName: 'Naval Radar 3D', EquipmentType: 'Radar', ShipID: 'S004', CommandID: 'CMD003', DepartmentID: 'DEP002', SectionID: 'SEC004', ComponentID: 'COMP004', SubComponentID: 'SUB005', EquipmentCode: 'RADAR-03', Specification: 'Volume Search', Manufacturer: 'Raytheon', InstallationDate: '2021-02-10', Status: 'Operational', HealthScore: 88, ILMSMapped: true, LastUpdateDate: new Date('2024-06-15'), LastUpdateDescription: 'New feature integration.', PolicyType: 'Regular', IsCommon: true },
    { EquipmentID: 'EQ012', EquipmentName: 'Starboard Main Engine', EquipmentType: 'Propulsion', ShipID: 'S005', CommandID: 'CMD001', DepartmentID: 'DEP001', SectionID: 'SEC002', ComponentID: 'COMP001', SubComponentID: 'SUB001', EquipmentCode: 'ME-S-01', Specification: '20MW Diesel', Manufacturer: 'GE', InstallationDate: '2020-07-01', Status: 'Operational', HealthScore: 82, ILMSMapped: true, LastUpdateDate: new Date('2024-05-28'), LastUpdateDescription: 'Efficiency check.', PolicyType: 'Regular', IsCommon: true },
    { EquipmentID: 'EQ013', EquipmentName: 'Bow Sonar', EquipmentType: 'Sonar', ShipID: 'S001', CommandID: 'CMD001', DepartmentID: 'DEP002', SectionID: 'SEC005', ComponentID: 'COMP005', SubComponentID: null, EquipmentCode: 'SONAR-01', Specification: 'Multi-frequency', Manufacturer: 'Thales', InstallationDate: '2022-04-01', Status: 'Operational', HealthScore: 90, ILMSMapped: true, LastUpdateDate: new Date('2024-06-08'), LastUpdateDescription: 'Hydrophone inspection.', PolicyType: 'Regular', IsCommon: true },
    { EquipmentID: 'EQ014', EquipmentName: 'Internal Comm Unit', EquipmentType: 'Communication', ShipID: 'S003', CommandID: 'CMD002', DepartmentID: 'DEP002', SectionID: 'SEC006', ComponentID: 'COMP006', SubComponentID: null, EquipmentCode: 'ICU-01', Specification: 'Secure Link', Manufacturer: 'Harris', InstallationDate: '2021-09-10', Status: 'Operational', HealthScore: 91, ILMSMapped: true, LastUpdateDate: new Date('2024-04-18'), LastUpdateDescription: 'Antenna realignment.', PolicyType: 'Regular', IsCommon: true },
    { EquipmentID: 'EQ015', EquipmentName: 'Naval Radar Air', EquipmentType: 'Radar', ShipID: 'S002', CommandID: 'CMD001', DepartmentID: 'DEP002', SectionID: 'SEC004', ComponentID: 'COMP004', SubComponentID: 'SUB005', EquipmentCode: 'RADAR-04', Specification: 'Air Search', Manufacturer: 'Lockheed', InstallationDate: '2019-11-01', Status: 'Operational', HealthScore: 78, ILMSMapped: true, LastUpdateDate: new Date('2024-06-02'), LastUpdateDescription: 'Calibration for drift.', PolicyType: 'Regular', IsCommon: true },
    { EquipmentID: 'EQ016', EquipmentName: 'AC Unit 1', EquipmentType: 'HVAC', ShipID: 'S001', CommandID: 'CMD001', DepartmentID: 'DEP001', SectionID: 'SEC003', ComponentID: 'COMP003', SubComponentID: 'SUB004', EquipmentCode: 'AC-01', Specification: 'Chilled Water', Manufacturer: 'Carrier', InstallationDate: '2020-03-01', Status: 'Operational', HealthScore: 85, ILMSMapped: true, LastUpdateDate: new Date('2024-06-10'), LastUpdateDescription: 'Refrigerant top-up.', PolicyType: 'Regular', IsCommon: true },
    { EquipmentID: 'EQ017', EquipmentName: 'Power Gen Unit 1', EquipmentType: 'Auxiliary', ShipID: 'S001', CommandID: 'CMD001', DepartmentID: 'DEP001', SectionID: 'SEC001', ComponentID: 'COMP002', SubComponentID: 'SUB003', EquipmentCode: 'PGU-01', Specification: 'Turbine Generator', Manufacturer: 'GE', InstallationDate: '2018-09-01', Status: 'Operational', HealthScore: 91, ILMSMapped: true, LastUpdateDate: new Date('2024-05-25'), LastUpdateDescription: 'Bearing inspection.', PolicyType: 'Regular', IsCommon: true }
  ];

  private mockAlerts: Alert[] = [
    { id: 1, type: 'Critical', message: 'Engine Overheat detected on INS Kalvari (AFT Propulsion)', timestamp: new Date('2024-06-19T10:30:00Z'), status: 'Urgent', shipId: 'S005', equipmentId: 'EQ002' },
    { id: 2, type: 'Warning', message: 'Radar System "Sea Hawk" performance degradation on INS Vikrant', timestamp: new Date('2024-06-19T09:15:00Z'), status: 'Pending Review', shipId: 'S001', equipmentId: 'EQ001' },
    { id: 3, type: 'Maintenance', message: 'Scheduled dry dock for INS Kolkata due in 30 days', timestamp: new Date('2024-06-18T16:00:00Z'), status: 'Scheduled', shipId: 'S002', equipmentId: null },
    { id: 4, type: 'Critical', message: 'Aviation Fuel contamination detected on INS Chennai', timestamp: new Date('2024-06-18T11:00:00Z'), status: 'Investigating', shipId: 'S003', equipmentId: 'EQ010' },
    { id: 5, type: 'Warning', message: 'Sonar System C needs immediate calibration on INS Kolkata', timestamp: new Date('2024-06-17T08:00:00Z'), status: 'Action Required', shipId: 'S002', equipmentId: 'EQ003' },
  ];

  constructor() { }

  getAllEquipment(filters?: DashboardFilters): Observable<Equipment[]> {
    let filteredEquipment = this.mockEquipment;

    if (filters) {
      if (filters.commandId) {
        filteredEquipment = filteredEquipment.filter(e => e.CommandID === filters.commandId);
      }
      if (filters.shipId) {
        filteredEquipment = filteredEquipment.filter(e => e.ShipID === filters.shipId);
      }
      if (filters.departmentId) {
        filteredEquipment = filteredEquipment.filter(e => e.DepartmentID === filters.departmentId);
      }
      if (filters.equipmentType) {
        filteredEquipment = filteredEquipment.filter(e => e.EquipmentType === filters.equipmentType);
      }
      if (filters.subComponentId) {
        filteredEquipment = filteredEquipment.filter(e => e.SubComponentID === filters.subComponentId);
      }
      if (filters.equipmentCode) {
        filteredEquipment = filteredEquipment.filter(e => e.EquipmentCode === filters.equipmentCode);
      }
      if (filters.startDate) {
        filteredEquipment = filteredEquipment.filter(e => new Date(e.LastUpdateDate) >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredEquipment = filteredEquipment.filter(e => new Date(e.LastUpdateDate) <= filters.endDate!);
      }
    }
    return of(filteredEquipment).pipe(delay(300));
  }

  getAllShips(filters?: DashboardFilters): Observable<Ship[]> {
    let filteredShips = this.mockShips;

    if (filters) {
      if (filters.commandId) {
        filteredShips = filteredShips.filter(s => s.CommandID === filters.commandId);
      }
      if (filters.shipId) {
        filteredShips = filteredShips.filter(s => s.ShipID === filters.shipId);
      }
    }
    return of(filteredShips).pipe(delay(300));
  }

  getAllCommands(): Observable<Command[]> {
    return of(this.mockCommands).pipe(delay(100));
  }

  getAllDepartments(): Observable<Department[]> {
    return of(this.mockDepartments).pipe(delay(100));
  }

  // Modified to accept departmentId
  getEquipmentTypes(filters?: { departmentId?: string | null }): Observable<string[]> {
    let filteredEquipment = this.mockEquipment;
    if (filters?.departmentId) {
      filteredEquipment = filteredEquipment.filter(e => e.DepartmentID === filters.departmentId);
    }
    const uniqueTypes = [...new Set(filteredEquipment.map(e => e.EquipmentType))];
    return of(uniqueTypes.sort()).pipe(delay(100));
  }

  // Modified to accept equipmentType and departmentId
  getSubComponents(filters?: { equipmentType?: string | null, departmentId?: string | null }): Observable<SubComponent[]> {
    let filteredEquipment = this.mockEquipment;
    if (filters?.departmentId) {
      filteredEquipment = filteredEquipment.filter(e => e.DepartmentID === filters.departmentId);
    }
    if (filters?.equipmentType) {
      filteredEquipment = filteredEquipment.filter(e => e.EquipmentType === filters.equipmentType);
    }

    const relevantSubComponentIds = [...new Set(filteredEquipment
      .filter(e => e.SubComponentID !== null)
      .map(e => e.SubComponentID as string))];

    const uniqueSubComponents = this.mockSubComponents.filter(sc =>
      relevantSubComponentIds.includes(sc.SubComponentID)
    );
    return of(uniqueSubComponents.sort((a, b) => a.SubComponentName.localeCompare(b.SubComponentName))).pipe(delay(100));
  }

  // Modified to accept subComponentId, equipmentType, and departmentId
  getEquipmentCodes(filters?: { subComponentId?: string | null, equipmentType?: string | null, departmentId?: string | null }): Observable<string[]> {
    let filteredEquipment = this.mockEquipment;

    if (filters?.departmentId) {
        filteredEquipment = filteredEquipment.filter(e => e.DepartmentID === filters.departmentId);
    }
    if (filters?.equipmentType) {
        filteredEquipment = filteredEquipment.filter(e => e.EquipmentType === filters.equipmentType);
    }
    if (filters?.subComponentId) {
        filteredEquipment = filteredEquipment.filter(e => e.SubComponentID === filters.subComponentId);
    }

    const uniqueCodes = [...new Set(filteredEquipment
      .filter(e => e.EquipmentCode !== null)
      .map(e => e.EquipmentCode as string))];
    return of(uniqueCodes.sort()).pipe(delay(100));
  }

  getRecentAlerts(limit: number): Observable<Alert[]> {
    return of(this.mockAlerts.slice(0, limit)).pipe(delay(300));
  }
}
