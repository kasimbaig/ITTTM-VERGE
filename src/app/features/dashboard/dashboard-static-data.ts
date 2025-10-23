// Static data for dashboard component
export interface StaticOption {
  label: string;
  value: any;
  commandId?: string; // Optional property for ships to link them to commands
}

export interface StaticFleetStatus {
  ship: string;
  readiness: number;
  defects: number;
  maintenance: string;
}

export interface StaticOcrcEvent {
  ship: string;
  opStart: Date;
  opEnd: Date;
  refStart: Date;
  refEnd: Date;
  refitType: string;
}

export interface StaticChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
}

export interface StaticEquipmentItem {
  name: string;
  nsn?: string;
  partNumber?: string;
  department?: string;
  compartment?: string;
  status: string;
}

// Static Commands Data
export const STATIC_COMMANDS: StaticOption[] = [
  { label: 'All Commands', value: null },
  { label: 'Eastern Naval Command', value: '1' },
  { label: 'Western Naval Command', value: '2' },
  { label: 'Southern Naval Command', value: '3' },
  { label: 'Northern Naval Command', value: '4' },
  { label: 'Andaman & Nicobar Command', value: '5' }
];

// Static Ships Data
export const STATIC_SHIPS: StaticOption[] = [
  { label: 'All Ships', value: null },
  { label: 'INS Vikrant', value: '101', commandId: '1' },
  { label: 'INS Vikramaditya', value: '102', commandId: '1' },
  { label: 'INS Chennai', value: '103', commandId: '1' },
  { label: 'INS Shivalik', value: '201', commandId: '2' },
  { label: 'INS Kamorta', value: '202', commandId: '2' },
  { label: 'INS Kochi', value: '203', commandId: '2' },
  { label: 'INS Kolkata', value: '301', commandId: '3' },
  { label: 'INS Mumbai', value: '302', commandId: '3' },
  { label: 'INS Delhi', value: '303', commandId: '3' },
  { label: 'INS Rajput', value: '401', commandId: '4' },
  { label: 'INS Ranvir', value: '402', commandId: '4' },
  { label: 'INS Ranvijay', value: '403', commandId: '4' },
  { label: 'INS Car Nicobar', value: '501', commandId: '5' },
  { label: 'INS Chetlat', value: '502', commandId: '5' }
];

// Static Departments Data
export const STATIC_DEPARTMENTS: StaticOption[] = [
  { label: 'All Departments', value: null },
  { label: 'Engineering', value: '1' },
  { label: 'Operations', value: '2' },
  { label: 'Logistics', value: '3' },
  { label: 'Medical', value: '4' },
  { label: 'Weapons', value: '5' },
  { label: 'Navigation', value: '6' },
  { label: 'Communications', value: '7' },
  { label: 'Administration', value: '8' }
];

// Static Fleet Status Data
export const STATIC_FLEET_STATUS: StaticFleetStatus[] = [
  { ship: 'INS Vikrant', readiness: 95, defects: 2, maintenance: 'None' },
  { ship: 'INS Vikramaditya', readiness: 78, defects: 5, maintenance: 'Scheduled (1 week)' },
  { ship: 'INS Chennai', readiness: 88, defects: 1, maintenance: 'None' },
  { ship: 'INS Shivalik', readiness: 65, defects: 8, maintenance: 'In Progress' },
  { ship: 'INS Kamorta', readiness: 92, defects: 0, maintenance: 'None' },
  { ship: 'INS Kochi', readiness: 85, defects: 3, maintenance: 'None' },
  { ship: 'INS Kolkata', readiness: 90, defects: 1, maintenance: 'None' },
  { ship: 'INS Mumbai', readiness: 75, defects: 4, maintenance: 'Scheduled (2 weeks)' },
  { ship: 'INS Delhi', readiness: 82, defects: 2, maintenance: 'None' },
  { ship: 'INS Rajput', readiness: 70, defects: 6, maintenance: 'In Progress' }
];

// Static OCR Timeline Data
export const STATIC_TIMELINE_DATA: StaticOcrcEvent[] = [
  {
    ship: 'INS Vikrant',
    opStart: new Date('2024-01-15'),
    opEnd: new Date('2024-01-29'),
    refStart: new Date('2024-01-08'),
    refEnd: new Date('2024-02-05'),
    refitType: 'Major Refit'
  },
  {
    ship: 'INS Vikramaditya',
    opStart: new Date('2024-02-10'),
    opEnd: new Date('2024-02-24'),
    refStart: new Date('2024-02-03'),
    refEnd: new Date('2024-03-03'),
    refitType: 'Minor Refit'
  },
  {
    ship: 'INS Chennai',
    opStart: new Date('2024-03-05'),
    opEnd: new Date('2024-03-19'),
    refStart: new Date('2024-02-26'),
    refEnd: new Date('2024-03-26'),
    refitType: 'Maintenance'
  },
  {
    ship: 'INS Shivalik',
    opStart: new Date('2024-04-01'),
    opEnd: new Date('2024-04-15'),
    refStart: new Date('2024-03-25'),
    refEnd: new Date('2024-04-22'),
    refitType: 'Inspection'
  },
  {
    ship: 'INS Kamorta',
    opStart: new Date('2024-05-10'),
    opEnd: new Date('2024-05-24'),
    refStart: new Date('2024-05-03'),
    refEnd: new Date('2024-05-31'),
    refitType: 'Major Refit'
  }
];

// Static Chart Data
export const STATIC_TASK_DISTRIBUTION_DATA: StaticChartData = {
  labels: ['Engineering', 'Operations', 'Logistics', 'Medical', 'Weapons'],
  datasets: [{
    label: 'Task Distribution',
    backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC'],
    data: [25, 30, 15, 8, 22]
  }]
};

export const STATIC_MAINTENANCE_TIMELINE_DATA: StaticChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Planned Maintenance',
      backgroundColor: ['#42A5F5'],
      data: [45, 40, 55, 50, 30, 35]
    },
    {
      label: 'Unplanned Maintenance',
      backgroundColor: ['#EF5350'],
      data: [25, 35, 20, 15, 50, 20]
    }
  ]
};

export const STATIC_DEFECTS_DATA: StaticChartData = {
  labels: ['Engine', 'Navigation', 'Electrical', 'Weapons', 'HVAC'],
  datasets: [{
    label: 'Defects by System',
    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
    data: [8, 3, 5, 2, 4]
  }]
};

export const STATIC_FREQUENT_DEFECT_DATA: StaticChartData = {
  labels: ['Engine Failure', 'Navigation Error', 'Electrical Fault', 'Communication Issue', 'Weapon Malfunction'],
  datasets: [{
    label: 'Defect Frequency',
    backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC'],
    data: [12, 8, 15, 6, 9]
  }]
};

// Static Equipment Data
export const STATIC_EQUIPMENT_LIST: StaticEquipmentItem[] = [
  { name: 'Main Engine #1', nsn: '1234-56-789-0123', department: 'Engineering', compartment: 'Engine Room A', status: 'Operational' },
  { name: 'Radar System', partNumber: 'XYZ-987', department: 'Operations', compartment: 'Bridge', status: 'Operational' },
  { name: 'HVAC Unit B', nsn: '9876-54-321-0987', department: 'Logistics', compartment: 'Deck 3', status: 'In Maintenance' },
  { name: 'Sonar Array', partNumber: 'ABC-111', department: 'Weapons', compartment: 'Sonar Bay', status: 'Operational' },
  { name: 'Auxiliary Generator', nsn: '5555-44-333-2222', department: 'Engineering', compartment: 'Engine Room B', status: 'Operational' },
  { name: 'Navigation Computer', partNumber: 'NAV-456', department: 'Navigation', compartment: 'Bridge', status: 'Operational' },
  { name: 'Communication Array', nsn: '7777-88-999-0000', department: 'Communications', compartment: 'Radio Room', status: 'In Maintenance' },
  { name: 'Fire Control System', partNumber: 'FCS-789', department: 'Weapons', compartment: 'Weapon Bay', status: 'Operational' },
  { name: 'Medical Equipment', nsn: '1111-22-333-4444', department: 'Medical', compartment: 'Sick Bay', status: 'Operational' },
  { name: 'Crane System', partNumber: 'CRN-123', department: 'Logistics', compartment: 'Deck 1', status: 'Operational' }
];

// Static Defect Types
export const STATIC_DEFECT_TYPE_OPTIONS: StaticOption[] = [
  { label: 'Mechanical', value: 'Mechanical' },
  { label: 'Electrical', value: 'Electrical' },
  { label: 'Software', value: 'Software' },
  { label: 'Structural', value: 'Structural' },
  { label: 'Hydraulic', value: 'Hydraulic' },
  { label: 'Pneumatic', value: 'Pneumatic' }
];

// Static System Options
export const STATIC_SYSTEM_OPTIONS: StaticOption[] = [
  { label: 'Propulsion System', value: 'Propulsion' },
  { label: 'Navigation System', value: 'Navigation' },
  { label: 'Weapon System', value: 'Weapon' },
  { label: 'Power Generation', value: 'Power' },
  { label: 'Communication System', value: 'Communication' },
  { label: 'HVAC System', value: 'HVAC' },
  { label: 'Fire Fighting System', value: 'Fire Fighting' }
];

// Static Equipment Options
export const STATIC_EQUIPMENT_OPTIONS: StaticOption[] = [
  { label: 'Main Engine #1', value: 'Main Engine #1' },
  { label: 'Radar System', value: 'Radar System' },
  { label: 'Sonar Array', value: 'Sonar Array' },
  { label: 'HVAC Unit A', value: 'HVAC Unit A' },
  { label: 'Navigation Computer', value: 'Navigation Computer' },
  { label: 'Communication Array', value: 'Communication Array' },
  { label: 'Fire Control System', value: 'Fire Control System' }
];

// Static Priority Options
export const STATIC_PRIORITY_OPTIONS: StaticOption[] = [
  { label: 'Critical', value: 'Critical' },
  { label: 'High', value: 'High' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Low', value: 'Low' }
];

// Static Maintenance Type Options
export const STATIC_MAINTENANCE_TYPE_OPTIONS: StaticOption[] = [
  { label: 'Preventive', value: 'Preventive' },
  { label: 'Corrective', value: 'Corrective' },
  { label: 'Predictive', value: 'Predictive' },
  { label: 'Emergency', value: 'Emergency' }
];

// Static Maintenance Frequency Options
export const STATIC_MAINTENANCE_FREQUENCY_OPTIONS: StaticOption[] = [
  { label: 'Daily', value: 'Daily' },
  { label: 'Weekly', value: 'Weekly' },
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Quarterly', value: 'Quarterly' },
  { label: 'Annually', value: 'Annually' },
  { label: 'As Required', value: 'As Required' }
];

// Static Personnel Options
export const STATIC_PERSONNEL_OPTIONS: StaticOption[] = [
  { label: 'CPO R. Sharma', value: 'R. Sharma' },
  { label: 'LT J. Khan', value: 'J. Khan' },
  { label: 'CDR S. Patel', value: 'S. Patel' },
  { label: 'LCDR A. Singh', value: 'A. Singh' },
  { label: 'PO M. Kumar', value: 'M. Kumar' },
  { label: 'LT CDR P. Verma', value: 'P. Verma' }
];

// Helper function to get filtered ships based on command
export function getFilteredShips(commandId: string | null): StaticOption[] {
  if (!commandId) {
    return STATIC_SHIPS;
  }
  return STATIC_SHIPS.filter(ship => ship.commandId === commandId || ship.value === null);
}

// Helper function to get ships for defect form (excluding "All Ships" option)
export function getShipsForDefect(): StaticOption[] {
  return STATIC_SHIPS.filter(ship => ship.value !== null);
}

// Helper function to get departments for defect form (excluding "All Departments" option)
export function getDepartmentsForDefect(): StaticOption[] {
  return STATIC_DEPARTMENTS.filter(dept => dept.value !== null);
}

// Static Projection Chart Data
export interface StaticProjectionPoint {
  x: number;
  y: number;
}

export interface StaticProjectionModel {
  data: StaticProjectionPoint[];
  avg_r_squared?: number;
  r_squared_defects?: number;
  r_squared_running_hours?: number;
  parameters_defects?: any;
  parameters_running_hours?: any;
}

export interface StaticProjectionApiResponse {
  equipment_info: {
    id: number;
    code: string;
    name: string;
  };
  models: {
    [key: string]: StaticProjectionModel;
  };
}

// Static projection data for different ship-equipment combinations
export const STATIC_PROJECTION_DATA: { [key: string]: StaticProjectionApiResponse } = {
  '101_1': { // INS Vikrant + Main Engine #1
    equipment_info: {
      id: 1,
      code: 'ME001',
      name: 'Main Engine #1'
    },
    models: {
      'auto': {
        data: [
          { x: 100, y: 2 },
          { x: 200, y: 4 },
          { x: 300, y: 6 },
          { x: 400, y: 8 },
          { x: 500, y: 10 },
          { x: 600, y: 12 },
          { x: 700, y: 14 },
          { x: 800, y: 16 }
        ],
        avg_r_squared: 0.85,
        r_squared_defects: 0.82,
        r_squared_running_hours: 0.88
      },
      'linear': {
        data: [
          { x: 100, y: 1.5 },
          { x: 200, y: 3.5 },
          { x: 300, y: 5.5 },
          { x: 400, y: 7.5 },
          { x: 500, y: 9.5 },
          { x: 600, y: 11.5 },
          { x: 700, y: 13.5 },
          { x: 800, y: 15.5 }
        ],
        avg_r_squared: 0.78,
        r_squared_defects: 0.75,
        r_squared_running_hours: 0.81
      },
      'polynomial': {
        data: [
          { x: 100, y: 2.2 },
          { x: 200, y: 4.1 },
          { x: 300, y: 6.3 },
          { x: 400, y: 8.2 },
          { x: 500, y: 10.1 },
          { x: 600, y: 12.4 },
          { x: 700, y: 14.2 },
          { x: 800, y: 16.1 }
        ],
        avg_r_squared: 0.92,
        r_squared_defects: 0.89,
        r_squared_running_hours: 0.95
      }
    }
  },
  '102_2': { // INS Vikramaditya + Radar System
    equipment_info: {
      id: 2,
      code: 'RAD001',
      name: 'Radar System'
    },
    models: {
      'auto': {
        data: [
          { x: 50, y: 1 },
          { x: 100, y: 2 },
          { x: 150, y: 3 },
          { x: 200, y: 4 },
          { x: 250, y: 5 },
          { x: 300, y: 6 },
          { x: 350, y: 7 },
          { x: 400, y: 8 }
        ],
        avg_r_squared: 0.88,
        r_squared_defects: 0.85,
        r_squared_running_hours: 0.91
      },
      'linear': {
        data: [
          { x: 50, y: 0.8 },
          { x: 100, y: 1.8 },
          { x: 150, y: 2.8 },
          { x: 200, y: 3.8 },
          { x: 250, y: 4.8 },
          { x: 300, y: 5.8 },
          { x: 350, y: 6.8 },
          { x: 400, y: 7.8 }
        ],
        avg_r_squared: 0.82,
        r_squared_defects: 0.79,
        r_squared_running_hours: 0.85
      },
      'polynomial': {
        data: [
          { x: 50, y: 1.1 },
          { x: 100, y: 2.2 },
          { x: 150, y: 3.1 },
          { x: 200, y: 4.2 },
          { x: 250, y: 5.1 },
          { x: 300, y: 6.2 },
          { x: 350, y: 7.1 },
          { x: 400, y: 8.2 }
        ],
        avg_r_squared: 0.94,
        r_squared_defects: 0.91,
        r_squared_running_hours: 0.97
      }
    }
  },
  '103_3': { // INS Chennai + HVAC Unit A
    equipment_info: {
      id: 3,
      code: 'HVAC001',
      name: 'HVAC Unit A'
    },
    models: {
      'auto': {
        data: [
          { x: 80, y: 1.5 },
          { x: 160, y: 3 },
          { x: 240, y: 4.5 },
          { x: 320, y: 6 },
          { x: 400, y: 7.5 },
          { x: 480, y: 9 },
          { x: 560, y: 10.5 },
          { x: 640, y: 12 }
        ],
        avg_r_squared: 0.87,
        r_squared_defects: 0.84,
        r_squared_running_hours: 0.90
      },
      'linear': {
        data: [
          { x: 80, y: 1.2 },
          { x: 160, y: 2.7 },
          { x: 240, y: 4.2 },
          { x: 320, y: 5.7 },
          { x: 400, y: 7.2 },
          { x: 480, y: 8.7 },
          { x: 560, y: 10.2 },
          { x: 640, y: 11.7 }
        ],
        avg_r_squared: 0.81,
        r_squared_defects: 0.78,
        r_squared_running_hours: 0.84
      },
      'polynomial': {
        data: [
          { x: 80, y: 1.6 },
          { x: 160, y: 3.2 },
          { x: 240, y: 4.6 },
          { x: 320, y: 6.2 },
          { x: 400, y: 7.6 },
          { x: 480, y: 9.2 },
          { x: 560, y: 10.6 },
          { x: 640, y: 12.2 }
        ],
        avg_r_squared: 0.93,
        r_squared_defects: 0.90,
        r_squared_running_hours: 0.96
      }
    }
  }
};

// Static ship options for projection chart
export const STATIC_PROJECTION_SHIP_OPTIONS: StaticOption[] = [
  { label: 'INS Vikrant', value: '101' },
  { label: 'INS Vikramaditya', value: '102' },
  { label: 'INS Chennai', value: '103' },
  { label: 'INS Shivalik', value: '201' },
  { label: 'INS Kamorta', value: '202' }
];

// Static equipment options for projection chart
export const STATIC_PROJECTION_EQUIPMENT_OPTIONS: StaticOption[] = [
  { label: 'Main Engine #1', value: '1' },
  { label: 'Radar System', value: '2' },
  { label: 'HVAC Unit A', value: '3' },
  { label: 'Sonar Array', value: '4' },
  { label: 'Navigation Computer', value: '5' }
];

// Helper function to get projection data
export function getProjectionData(shipId: string, equipmentId: string): StaticProjectionApiResponse | null {
  const key = `${shipId}_${equipmentId}`;
  return STATIC_PROJECTION_DATA[key] || null;
}

// Static Defect List Data
export interface StaticDefectListData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
}

export interface StaticDefectDetail {
  ship: string;
  status: string;
  dept: string;
}

// Static defect list chart data
export const STATIC_DEFECT_LIST_DATA: StaticDefectListData = {
  labels: ['Pump', 'Valve', 'Generator', 'Compressor', 'Radar', 'Sonar', 'HVAC', 'Navigation'],
  datasets: [
    {
      label: 'Defects',
      backgroundColor: '#FFA726',
      data: [12, 5, 9, 3, 7, 4, 6, 8]
    },
    {
      label: 'RA Projection',
      backgroundColor: '#EC407A',
      data: [10, 7, 6, 4, 8, 5, 7, 9]
    }
  ]
};

// Static defect details for dialog
export const STATIC_DEFECT_DETAILS: StaticDefectDetail[] = [
  { ship: 'INS Vikrant', status: 'Active', dept: 'Engineering' },
  { ship: 'INS Vikramaditya', status: 'Resolved', dept: 'Operations' },
  { ship: 'INS Chennai', status: 'Pending', dept: 'Logistics' },
  { ship: 'INS Shivalik', status: 'Active', dept: 'Weapons' },
  { ship: 'INS Kamorta', status: 'Resolved', dept: 'Navigation' },
  { ship: 'INS Kochi', status: 'Active', dept: 'Communications' },
  { ship: 'INS Kolkata', status: 'Pending', dept: 'Medical' },
  { ship: 'INS Mumbai', status: 'Resolved', dept: 'Administration' }
];

// Static OCRC Data
export interface StaticRefitCycle {
  id: number;
  ship_name: string;
  ship_code: string;
  title: string;
  start_date: string;
  end_date: string;
  refit_type: string;
  location: string;
  progress_percentage: number;
  estimated_cost: number;
  crew_size: number;
  priority: string;
}

// Static refit cycles data
export const STATIC_REFIT_CYCLES: StaticRefitCycle[] = [
  {
    id: 1,
    ship_name: 'INS Vikrant',
    ship_code: 'R11',
    title: 'Major Refit - INS Vikrant',
    start_date: '2025-07-20',
    end_date: '2025-08-15',
    refit_type: 'Major Refit',
    location: 'Mumbai Dockyard',
    progress_percentage: 75,
    estimated_cost: 15000000,
    crew_size: 1200,
    priority: 'High'
  },
  {
    id: 2,
    ship_name: 'INS Vikramaditya',
    ship_code: 'R33',
    title: 'Long Refit - INS Vikramaditya',
    start_date: '2025-08-01',
    end_date: '2025-10-30',
    refit_type: 'Long Refit',
    location: 'Kochi Shipyard',
    progress_percentage: 45,
    estimated_cost: 25000000,
    crew_size: 1500,
    priority: 'Critical'
  },
  {
    id: 3,
    ship_name: 'INS Chennai',
    ship_code: 'D65',
    title: 'Medium Refit - INS Chennai',
    start_date: '2025-07-25',
    end_date: '2025-09-10',
    refit_type: 'Medium Refit',
    location: 'Visakhapatnam Port',
    progress_percentage: 60,
    estimated_cost: 8000000,
    crew_size: 800,
    priority: 'Medium'
  },
  {
    id: 4,
    ship_name: 'INS Shivalik',
    ship_code: 'F47',
    title: 'Short Refit - INS Shivalik',
    start_date: '2025-08-10',
    end_date: '2025-08-25',
    refit_type: 'Short Refit',
    location: 'Karwar Naval Base',
    progress_percentage: 30,
    estimated_cost: 3000000,
    crew_size: 400,
    priority: 'Low'
  },
  {
    id: 5,
    ship_name: 'INS Kamorta',
    ship_code: 'P28',
    title: 'Docking Period - INS Kamorta',
    start_date: '2025-07-30',
    end_date: '2025-08-12',
    refit_type: 'Docking Period',
    location: 'Port Blair',
    progress_percentage: 85,
    estimated_cost: 2000000,
    crew_size: 200,
    priority: 'Medium'
  },
  {
    id: 6,
    ship_name: 'INS Kochi',
    ship_code: 'D64',
    title: 'Minor Repair - INS Kochi',
    start_date: '2025-08-05',
    end_date: '2025-08-18',
    refit_type: 'Minor Repair',
    location: 'Mumbai Dockyard',
    progress_percentage: 40,
    estimated_cost: 1500000,
    crew_size: 150,
    priority: 'Low'
  },
  {
    id: 7,
    ship_name: 'INS Kolkata',
    ship_code: 'D63',
    title: 'Scheduled Maintenance - INS Kolkata',
    start_date: '2025-08-15',
    end_date: '2025-08-28',
    refit_type: 'Scheduled Maintenance',
    location: 'Visakhapatnam Port',
    progress_percentage: 20,
    estimated_cost: 2500000,
    crew_size: 300,
    priority: 'Medium'
  },
  {
    id: 8,
    ship_name: 'INS Mumbai',
    ship_code: 'D62',
    title: 'Propulsion Check - INS Mumbai',
    start_date: '2025-08-20',
    end_date: '2025-09-05',
    refit_type: 'Propulsion Check',
    location: 'Mumbai Dockyard',
    progress_percentage: 10,
    estimated_cost: 4000000,
    crew_size: 350,
    priority: 'High'
  }
];

// Helper function to get refit cycles by command and date range
export function getRefitCyclesByCommandAndDateRange(commandId: number | null, startDate: string, endDate: string): StaticRefitCycle[] {
  // For static data, we'll return all refit cycles regardless of command/date filters
  // In a real implementation, you would filter based on commandId and date range
  return STATIC_REFIT_CYCLES.filter(cycle => {
    const cycleStart = new Date(cycle.start_date);
    const cycleEnd = new Date(cycle.end_date);
    const filterStart = new Date(startDate);
    const filterEnd = new Date(endDate);
    
    // Check if cycle overlaps with the date range
    return (cycleStart <= filterEnd && cycleEnd >= filterStart);
  });
}
