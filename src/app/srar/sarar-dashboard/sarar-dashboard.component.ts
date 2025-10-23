// cspell:ignore sarar
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-sarar-dashboard',
  standalone: false,
  templateUrl: './sarar-dashboard.component.html',
  styleUrls: ['./sarar-dashboard.component.css']
})
export class SararDashboardComponent implements OnInit {
  @ViewChild('areaChartCanvas') areaChartCanvas!: ElementRef;
  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef;
  @ViewChild('donutChartCanvas') donutChartCanvas!: ElementRef;
  @ViewChild('horizontalBarCanvas') horizontalBarCanvas!: ElementRef;
  @ViewChild('shipPerformanceCanvas') shipPerformanceCanvas!: ElementRef;
  @ViewChild('commandShipsCanvas') commandShipsCanvas!: ElementRef;
  @ViewChild('operationalReadinessCanvas') operationalReadinessCanvas!: ElementRef;
  @ViewChild('operationalReadyCanvas') operationalReadyCanvas!: ElementRef;
  @ViewChild('maintenanceCanvas') maintenanceCanvas!: ElementRef;
  @ViewChild('materialNotReadyCanvas') materialNotReadyCanvas!: ElementRef;
  @ViewChild('fullPowerTrialsCanvas') fullPowerTrialsCanvas!: ElementRef;
  @ViewChild('materialReadyDetailsCanvas') materialReadyDetailsCanvas!: ElementRef;
  @ViewChild('fuelConsumptionCanvas') fuelConsumptionCanvas!: ElementRef;
  @ViewChild('engineExploitationFactorCanvas') engineExploitationFactorCanvas!: ElementRef;
  @ViewChild('dieselGeneratorUtilisationFactorCanvas') dieselGeneratorUtilisationFactorCanvas!: ElementRef;
  @ViewChild('topRunningHoursCanvas') topRunningHoursCanvas!: ElementRef;
  @ViewChild('averageRunningHoursCanvas') averageRunningHoursCanvas!: ElementRef;

  activeTab = 'Total';
  showDisplacement = false;
  chartsLoaded = false;
  selectedView = 'monthly';
  selectedRunningHoursView = 'monthly';
  currentDate = new Date().toLocaleDateString('en-US', { 
    day: '2-digit', 
    month: 'short', 
    year: '2-digit' 
  }).toUpperCase();

  // Navigation tabs
  tabs = ['Total', 'WNC', 'ENC', 'SNC', 'ANC'];
  
  // Command selection for ships chart
  selectedCommand = 'WNC';
  availableCommands = ['WNC', 'ENC', 'SNC', 'ANC'];

  // Ship details selection
  selectedShip = 'INS MUMBAI';
  availableShips = [
    'INS MUMBAI', 'INS TABAR', 'INS KOCHI', 'INS MYSORE', 'INS MORMUGA', 
    'INS DELHI', 'INS BETWA', 'INS CHENNAI', 'INS RAJWIR', 'INS SATPURA', 
    'INS TEG', 'INS TALWAR', 'INS VISAKHA', 'INS IMPHAL', 'INS TRIKAND', 
    'INS TARKASH', 'INS SAHYADRI', 'INS TRISHUL', 'INS SHIVALI', 'INS SURAT', 
    'INS RANA', 'INS NILGIRI', 'INS KOLKATA', 'INS RANVIJAY', 'INS BEAS', 'INS BRAHMAP'
  ];
  startDate = '2024-05-26';
  endDate = '2025-05-26';

  // Ship Performance Data
  shipPerformanceData = {
    monthly: [
      {
        ship_id: 'INS001',
        ship_name: 'INS Vikrant',
        ship_code: 'VKR',
        ship_category: 'Aircraft Carrier',
        total_hours_month: 720,
        total_distance_month: 4500,
        avg_hours_month: 24,
        max_speed: 28
      },
      {
        ship_id: 'INS002',
        ship_name: 'INS Delhi',
        ship_code: 'DLH',
        ship_category: 'Destroyer',
        total_hours_month: 680,
        total_distance_month: 3800,
        avg_hours_month: 22.7,
        max_speed: 32
      },
      {
        ship_id: 'INS003',
        ship_name: 'INS Mumbai',
        ship_code: 'MBI',
        ship_category: 'Destroyer',
        total_hours_month: 650,
        total_distance_month: 3600,
        avg_hours_month: 21.7,
        max_speed: 32
      },
      {
        ship_id: 'INS004',
        ship_name: 'INS Kolkata',
        ship_code: 'KLK',
        ship_category: 'Destroyer',
        total_hours_month: 700,
        total_distance_month: 4200,
        avg_hours_month: 23.3,
        max_speed: 32
      },
      {
        ship_id: 'INS005',
        ship_name: 'INS Shivalik',
        ship_code: 'SVK',
        ship_category: 'Frigate',
        total_hours_month: 580,
        total_distance_month: 3200,
        avg_hours_month: 19.3,
        max_speed: 30
      },
      {
        ship_id: 'INS006',
        ship_name: 'INS Satpura',
        ship_code: 'STP',
        ship_category: 'Frigate',
        total_hours_month: 620,
        total_distance_month: 3400,
        avg_hours_month: 20.7,
        max_speed: 30
      },
      {
        ship_id: 'INS007',
        ship_name: 'INS Sahyadri',
        ship_code: 'SHD',
        ship_category: 'Frigate',
        total_hours_month: 590,
        total_distance_month: 3300,
        avg_hours_month: 19.7,
        max_speed: 30
      },
      {
        ship_id: 'INS008',
        ship_name: 'INS Kamorta',
        ship_code: 'KMR',
        ship_category: 'Corvette',
        total_hours_month: 520,
        total_distance_month: 2800,
        avg_hours_month: 17.3,
        max_speed: 25
      },
      {
        ship_id: 'INS009',
        ship_name: 'INS Kadmatt',
        ship_code: 'KDM',
        ship_category: 'Corvette',
        total_hours_month: 540,
        total_distance_month: 2900,
        avg_hours_month: 18,
        max_speed: 25
      },
      {
        ship_id: 'INS010',
        ship_name: 'INS Kiltan',
        ship_code: 'KLT',
        ship_category: 'Corvette',
        total_hours_month: 510,
        total_distance_month: 2700,
        avg_hours_month: 17,
        max_speed: 25
      }
    ],
    yearly: [
      {
        ship_id: 'INS001',
        ship_name: 'INS Vikrant',
        ship_code: 'VKR',
        ship_category: 'Aircraft Carrier',
        total_hours_month: 8640,
        total_distance_month: 54000,
        avg_hours_month: 24,
        max_speed: 28
      },
      {
        ship_id: 'INS002',
        ship_name: 'INS Delhi',
        ship_code: 'DLH',
        ship_category: 'Destroyer',
        total_hours_month: 8160,
        total_distance_month: 45600,
        avg_hours_month: 22.7,
        max_speed: 32
      },
      {
        ship_id: 'INS003',
        ship_name: 'INS Mumbai',
        ship_code: 'MBI',
        ship_category: 'Destroyer',
        total_hours_month: 7800,
        total_distance_month: 43200,
        avg_hours_month: 21.7,
        max_speed: 32
      },
      {
        ship_id: 'INS004',
        ship_name: 'INS Kolkata',
        ship_code: 'KLK',
        ship_category: 'Destroyer',
        total_hours_month: 8400,
        total_distance_month: 50400,
        avg_hours_month: 23.3,
        max_speed: 32
      },
      {
        ship_id: 'INS005',
        ship_name: 'INS Shivalik',
        ship_code: 'SVK',
        ship_category: 'Frigate',
        total_hours_month: 6960,
        total_distance_month: 38400,
        avg_hours_month: 19.3,
        max_speed: 30
      },
      {
        ship_id: 'INS006',
        ship_name: 'INS Satpura',
        ship_code: 'STP',
        ship_category: 'Frigate',
        total_hours_month: 7440,
        total_distance_month: 40800,
        avg_hours_month: 20.7,
        max_speed: 30
      },
      {
        ship_id: 'INS007',
        ship_name: 'INS Sahyadri',
        ship_code: 'SHD',
        ship_category: 'Frigate',
        total_hours_month: 7080,
        total_distance_month: 39600,
        avg_hours_month: 19.7,
        max_speed: 30
      },
      {
        ship_id: 'INS008',
        ship_name: 'INS Kamorta',
        ship_code: 'KMR',
        ship_category: 'Corvette',
        total_hours_month: 6240,
        total_distance_month: 33600,
        avg_hours_month: 17.3,
        max_speed: 25
      },
      {
        ship_id: 'INS009',
        ship_name: 'INS Kadmatt',
        ship_code: 'KDM',
        ship_category: 'Corvette',
        total_hours_month: 6480,
        total_distance_month: 34800,
        avg_hours_month: 18,
        max_speed: 25
      },
      {
        ship_id: 'INS010',
        ship_name: 'INS Kiltan',
        ship_code: 'KLT',
        ship_category: 'Corvette',
        total_hours_month: 6120,
        total_distance_month: 32400,
        avg_hours_month: 17,
        max_speed: 25
      }
    ]
  };

  // Fleet composition data for area chart
  fleetData = {
    labels: ['2015-118 Ships', '2016-121 Ships', '2017-127 Ships', '2018-130 Ships', '2019-132 Ships', 
             '2020-134 Ships', '2021-138 Ships', '2022-140 Ships', '2023-143 Ships', '2024-145 Ships', '2025-149 Ships'],
    datasets: [
      {
        label: 'AIRCRAFT CARRIERS',
        data: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        fill: true
      },
      {
        label: 'DESTROYER AND FRIGATES',
        data: [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 27],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        fill: true
      },
      {
        label: 'FLEET SUPPORT VESSELS',
        data: [7, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        fill: true
      },
      {
        label: 'CORVETTES AND PATROL CRAFTS',
        data: [16, 17, 18, 19, 19, 19, 20, 20, 20, 20, 20],
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgba(245, 158, 11, 1)',
        fill: true
      },
      {
        label: 'SMALL FRONTLINE',
        data: [32, 33, 34, 35, 35, 36, 37, 37, 38, 38, 38],
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgba(139, 92, 246, 1)',
        fill: true
      },
      {
        label: 'LARGE SUPPORT SHIPS',
        data: [6, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8],
        backgroundColor: 'rgba(236, 72, 153, 0.8)',
        borderColor: 'rgba(236, 72, 153, 1)',
        fill: true
      },
      {
        label: 'SMALL SUPPORT SHIPS',
        data: [24, 25, 26, 26, 27, 27, 28, 28, 29, 29, 26],
        backgroundColor: 'rgba(107, 114, 128, 0.8)',
        borderColor: 'rgba(107, 114, 128, 1)',
        fill: true
      },
      {
        label: 'CONVENTIONAL SUBMARINES',
        data: [14, 14, 15, 15, 16, 16, 17, 17, 17, 17, 17],
        backgroundColor: 'rgba(251, 146, 60, 0.8)',
        borderColor: 'rgba(251, 146, 60, 1)',
        fill: true
      }
    ]
  };

  // Ships in commission data
  shipsInCommission = {
    labels: ['AIRCRAFT CARRIERS', 'DESTROYER AND FRIGATES', 'FLEET SUPPORT VESSELS AND LARGE', 
             'CORVETTES AND PATROL CRAFTS', 'SMALL FRONTLINE LANDING', 'LARGE SUPPORT SHIPS/TONNAGE', 
             'SMALL SUPPORT SHIPS/TONNAGE', 'CONVENTIONAL SUBMARINES'],
    data: [2, 27, 9, 20, 38, 10, 26, 17]
  };

  // Operational availability data
  operationalAvailability = {
    labels: ['OPS', 'AMP', 'Refit'],
    data: [108, 31, 10],
    colors: ['rgba(34, 197, 94, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(239, 68, 68, 0.8)']
  };

  // Max days at sea data
  daysAtSea = {
    labels: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
    data: [209, 189, 202, 217, 241, 225, 209, 208, 225, 220, 80]
  };

  // Command Ships Data based on API response structure
  commandShipsData = {
    'WNC': [
      {
        ship_id: 'INS001',
        ship_name: 'INS Vikrant',
        ship_code: 'VKR',
        command_name: 'WNC',
        total_rh_at_sea: 450.5,
        total_rh_at_port: 269.5,
        total_rh_in_month: 720.0,
        avg_rh_at_sea: 15.0,
        avg_rh_at_port: 8.9,
        avg_total_rh: 24.0,
        max_rh_at_sea: 18.5,
        max_rh_at_port: 12.0,
        max_total_rh: 28.0,
        record_count: 30
      },
      {
        ship_id: 'INS002',
        ship_name: 'INS Delhi',
        ship_code: 'DLH',
        command_name: 'WNC',
        total_rh_at_sea: 420.3,
        total_rh_at_port: 259.7,
        total_rh_in_month: 680.0,
        avg_rh_at_sea: 14.0,
        avg_rh_at_port: 8.7,
        avg_total_rh: 22.7,
        max_rh_at_sea: 17.2,
        max_rh_at_port: 11.5,
        max_total_rh: 26.8,
        record_count: 30
      },
      {
        ship_id: 'INS005',
        ship_name: 'INS Shivalik',
        ship_code: 'SVK',
        command_name: 'WNC',
        total_rh_at_sea: 380.2,
        total_rh_at_port: 199.8,
        total_rh_in_month: 580.0,
        avg_rh_at_sea: 12.7,
        avg_rh_at_port: 6.7,
        avg_total_rh: 19.3,
        max_rh_at_sea: 15.8,
        max_rh_at_port: 9.2,
        max_total_rh: 22.5,
        record_count: 30
      }
    ],
    'ENC': [
      {
        ship_id: 'INS003',
        ship_name: 'INS Mumbai',
        ship_code: 'MBI',
        command_name: 'ENC',
        total_rh_at_sea: 410.5,
        total_rh_at_port: 239.5,
        total_rh_in_month: 650.0,
        avg_rh_at_sea: 13.7,
        avg_rh_at_port: 8.0,
        avg_total_rh: 21.7,
        max_rh_at_sea: 16.5,
        max_rh_at_port: 10.8,
        max_total_rh: 25.2,
        record_count: 30
      },
      {
        ship_id: 'INS004',
        ship_name: 'INS Kolkata',
        ship_code: 'KLK',
        command_name: 'ENC',
        total_rh_at_sea: 440.8,
        total_rh_at_port: 259.2,
        total_rh_in_month: 700.0,
        avg_rh_at_sea: 14.7,
        avg_rh_at_port: 8.6,
        avg_total_rh: 23.3,
        max_rh_at_sea: 17.8,
        max_rh_at_port: 11.2,
        max_total_rh: 26.5,
        record_count: 30
      }
    ],
    'SNC': [
      {
        ship_id: 'INS006',
        ship_name: 'INS Satpura',
        ship_code: 'STP',
        command_name: 'SNC',
        total_rh_at_sea: 395.3,
        total_rh_at_port: 224.7,
        total_rh_in_month: 620.0,
        avg_rh_at_sea: 13.2,
        avg_rh_at_port: 7.5,
        avg_total_rh: 20.7,
        max_rh_at_sea: 16.2,
        max_rh_at_port: 9.8,
        max_total_rh: 24.0,
        record_count: 30
      }
    ],
    'ANC': [
      {
        ship_id: 'INS007',
        ship_name: 'INS Sahyadri',
        ship_code: 'SHD',
        command_name: 'ANC',
        total_rh_at_sea: 425.1,
        total_rh_at_port: 244.9,
        total_rh_in_month: 670.0,
        avg_rh_at_sea: 14.2,
        avg_rh_at_port: 8.2,
        avg_total_rh: 22.3,
        max_rh_at_sea: 17.5,
        max_rh_at_port: 10.5,
        max_total_rh: 25.8,
        record_count: 30
      }
    ]
  };

  // Operational Readiness Data for Destroyers and Frigates
  operationalReadinessData = {
    labels: [
      'INS MUMBAI', 'INS TABAR', 'INS KOCHI', 'INS MYSORE', 'INS MORMUGA', 
      'INS DELHI', 'INS BETWA', 'INS CHENNAI', 'INS RAJWIR', 'INS SATPURA', 
      'INS TEG', 'INS TALWAR', 'INS VISAKHA', 'INS IMPHAL', 'INS TRIKAND', 
      'INS TARKASH', 'INS SAHYADRI', 'INS TRISHUL', 'INS SHIVALI', 'INS SURAT', 
      'INS RANA', 'INS NILGIRI', 'INS KOLKATA', 'INS RANVIJAY', 'INS BEAS', 'INS BRAHMAP'
    ],
    datasets: [
      {
        label: 'OPERATIONAL READY',
        data: [337, 336, 334, 334, 334, 325, 318, 313, 310, 310, 310, 296, 291, 273, 249, 225, 205, 168, 42, 112, 102, 61, 4, 0, 0, 0],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        borderRadius: 4
      },
      {
        label: 'MAINTENANCE',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 61, 56, 0, 0, 0, 120, 0, 175, 0, 273, 304, 61, 334],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)',
        borderWidth: 2,
        borderRadius: 4
      },
      {
        label: 'MNR',
        data: [0, 0, 0, 0, 0, 0, 9, 0, 2, 0, 0, 0, 0, 0, 5, 0, 24, 14, 28, 0, 16, 18, 0, 28, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 2,
        borderRadius: 4
      }
    ]
  };

  // Ship Details Data for individual ship breakdown
  shipDetailsData = {
    'INS MUMBAI': {
      operationalReady: {
        labels: ['Sea', 'Harbour', 'AMP', 'SMP'],
        data: [165, 203, 0, 13],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      maintenance: {
        labels: ['Refit', 'EAMP'],
        data: [0, 0],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)'
      },
      materialNotReady: {
        labels: ['Emergency Repair', 'NUC', 'Ext Notice For Refit', 'OPDEFSTA'],
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)'
      }
    },
    'INS TABAR': {
      operationalReady: {
        labels: ['Sea', 'Harbour', 'AMP', 'SMP'],
        data: [160, 210, 0, 10],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      maintenance: {
        labels: ['Refit', 'EAMP'],
        data: [0, 0],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)'
      },
      materialNotReady: {
        labels: ['Emergency Repair', 'NUC', 'Ext Notice For Refit', 'OPDEFSTA'],
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)'
      }
    },
    'INS KOCHI': {
      operationalReady: {
        labels: ['Sea', 'Harbour', 'AMP', 'SMP'],
        data: [158, 208, 0, 12],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      maintenance: {
        labels: ['Refit', 'EAMP'],
        data: [0, 0],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)'
      },
      materialNotReady: {
        labels: ['Emergency Repair', 'NUC', 'Ext Notice For Refit', 'OPDEFSTA'],
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)'
      }
    },
    'INS DELHI': {
      operationalReady: {
        labels: ['Sea', 'Harbour', 'AMP', 'SMP'],
        data: [150, 195, 0, 15],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      maintenance: {
        labels: ['Refit', 'EAMP'],
        data: [0, 0],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)'
      },
      materialNotReady: {
        labels: ['Emergency Repair', 'NUC', 'Ext Notice For Refit', 'OPDEFSTA'],
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)'
      }
    },
    'INS BETWA': {
      operationalReady: {
        labels: ['Sea', 'Harbour', 'AMP', 'SMP'],
        data: [145, 190, 0, 8],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      maintenance: {
        labels: ['Refit', 'EAMP'],
        data: [0, 0],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)'
      },
      materialNotReady: {
        labels: ['Emergency Repair', 'NUC', 'Ext Notice For Refit', 'OPDEFSTA'],
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)'
      }
    },
    'INS CHENNAI': {
      operationalReady: {
        labels: ['Sea', 'Harbour', 'AMP', 'SMP'],
        data: [155, 200, 0, 11],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      maintenance: {
        labels: ['Refit', 'EAMP'],
        data: [0, 0],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)'
      },
      materialNotReady: {
        labels: ['Emergency Repair', 'NUC', 'Ext Notice For Refit', 'OPDEFSTA'],
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)'
      }
    },
    'INS RAJWIR': {
      operationalReady: {
        labels: ['Sea', 'Harbour', 'AMP', 'SMP'],
        data: [140, 185, 0, 9],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      maintenance: {
        labels: ['Refit', 'EAMP'],
        data: [0, 0],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)'
      },
      materialNotReady: {
        labels: ['Emergency Repair', 'NUC', 'Ext Notice For Refit', 'OPDEFSTA'],
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)'
      }
    },
    'INS SATPURA': {
      operationalReady: {
        labels: ['Sea', 'Harbour', 'AMP', 'SMP'],
        data: [152, 198, 0, 14],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      maintenance: {
        labels: ['Refit', 'EAMP'],
        data: [0, 0],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)'
      },
      materialNotReady: {
        labels: ['Emergency Repair', 'NUC', 'Ext Notice For Refit', 'OPDEFSTA'],
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)'
      }
    },
    'INS TEG': {
      operationalReady: {
        labels: ['Sea', 'Harbour', 'AMP', 'SMP'],
        data: [148, 192, 0, 12],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      maintenance: {
        labels: ['Refit', 'EAMP'],
        data: [0, 0],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)'
      },
      materialNotReady: {
        labels: ['Emergency Repair', 'NUC', 'Ext Notice For Refit', 'OPDEFSTA'],
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)'
      }
    },
    'INS TALWAR': {
      operationalReady: {
        labels: ['Sea', 'Harbour', 'AMP', 'SMP'],
        data: [135, 180, 0, 10],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      maintenance: {
        labels: ['Refit', 'EAMP'],
        data: [0, 0],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)'
      },
      materialNotReady: {
        labels: ['Emergency Repair', 'NUC', 'Ext Notice For Refit', 'OPDEFSTA'],
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)'
      }
    },
    'INS VISAKHA': {
      operationalReady: {
        labels: ['Sea', 'Harbour', 'AMP', 'SMP'],
        data: [130, 175, 0, 8],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      maintenance: {
        labels: ['Refit', 'EAMP'],
        data: [0, 0],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)'
      },
      materialNotReady: {
        labels: ['Emergency Repair', 'NUC', 'Ext Notice For Refit', 'OPDEFSTA'],
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)'
      }
    },
    'INS IMPHAL': {
      operationalReady: {
        labels: ['Sea', 'Harbour', 'AMP', 'SMP'],
        data: [120, 160, 0, 6],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      maintenance: {
        labels: ['Refit', 'EAMP'],
        data: [15, 8],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)'
      },
      materialNotReady: {
        labels: ['Emergency Repair', 'NUC', 'Ext Notice For Refit', 'OPDEFSTA'],
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)'
      }
    },
    'INS TRIKAND': {
      operationalReady: {
        labels: ['Sea', 'Harbour', 'AMP', 'SMP'],
        data: [110, 150, 0, 5],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      maintenance: {
        labels: ['Refit', 'EAMP'],
        data: [12, 10],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)'
      },
      materialNotReady: {
        labels: ['Emergency Repair', 'NUC', 'Ext Notice For Refit', 'OPDEFSTA'],
        data: [2, 0, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)'
      }
    },
    'INS TARKASH': {
      operationalReady: {
        labels: ['Sea', 'Harbour', 'AMP', 'SMP'],
        data: [100, 140, 0, 4],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      maintenance: {
        labels: ['Refit', 'EAMP'],
        data: [0, 0],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)'
      },
      materialNotReady: {
        labels: ['Emergency Repair', 'NUC', 'Ext Notice For Refit', 'OPDEFSTA'],
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)'
      }
    },
    'INS SAHYADRI': {
      operationalReady: {
        labels: ['Sea', 'Harbour', 'AMP', 'SMP'],
        data: [90, 130, 0, 3],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      maintenance: {
        labels: ['Refit', 'EAMP'],
        data: [0, 0],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)'
      },
      materialNotReady: {
        labels: ['Emergency Repair', 'NUC', 'Ext Notice For Refit', 'OPDEFSTA'],
        data: [8, 0, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)'
      }
    },
    'INS TRISHUL': {
      operationalReady: {
        labels: ['Sea', 'Harbour', 'AMP', 'SMP'],
        data: [80, 120, 0, 2],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      maintenance: {
        labels: ['Refit', 'EAMP'],
        data: [0, 0],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)'
      },
      materialNotReady: {
        labels: ['Emergency Repair', 'NUC', 'Ext Notice For Refit', 'OPDEFSTA'],
        data: [5, 0, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)'
      }
    },
    'INS SHIVALI': {
      operationalReady: {
        labels: ['Sea', 'Harbour', 'AMP', 'SMP'],
        data: [20, 40, 0, 1],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      maintenance: {
        labels: ['Refit', 'EAMP'],
        data: [25, 15],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)'
      },
      materialNotReady: {
        labels: ['Emergency Repair', 'NUC', 'Ext Notice For Refit', 'OPDEFSTA'],
        data: [8, 0, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)'
      }
    },
    'INS SURAT': {
      operationalReady: {
        labels: ['Sea', 'Harbour', 'AMP', 'SMP'],
        data: [60, 100, 0, 2],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      maintenance: {
        labels: ['Refit', 'EAMP'],
        data: [0, 0],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)'
      },
      materialNotReady: {
        labels: ['Emergency Repair', 'NUC', 'Ext Notice For Refit', 'OPDEFSTA'],
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)'
      }
    },
    'INS RANA': {
      operationalReady: {
        labels: ['Sea', 'Harbour', 'AMP', 'SMP'],
        data: [50, 90, 0, 1],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      maintenance: {
        labels: ['Refit', 'EAMP'],
        data: [30, 20],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)'
      },
      materialNotReady: {
        labels: ['Emergency Repair', 'NUC', 'Ext Notice For Refit', 'OPDEFSTA'],
        data: [4, 0, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)'
      }
    },
    'INS NILGIRI': {
      operationalReady: {
        labels: ['Sea', 'Harbour', 'AMP', 'SMP'],
        data: [30, 60, 0, 1],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      maintenance: {
        labels: ['Refit', 'EAMP'],
        data: [0, 0],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)'
      },
      materialNotReady: {
        labels: ['Emergency Repair', 'NUC', 'Ext Notice For Refit', 'OPDEFSTA'],
        data: [6, 0, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)'
      }
    },
    'INS KOLKATA': {
      operationalReady: {
        labels: ['Sea', 'Harbour', 'AMP', 'SMP'],
        data: [2, 10, 0, 0],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      maintenance: {
        labels: ['Refit', 'EAMP'],
        data: [45, 35],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)'
      },
      materialNotReady: {
        labels: ['Emergency Repair', 'NUC', 'Ext Notice For Refit', 'OPDEFSTA'],
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)'
      }
    },
    'INS RANVIJAY': {
      operationalReady: {
        labels: ['Sea', 'Harbour', 'AMP', 'SMP'],
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      maintenance: {
        labels: ['Refit', 'EAMP'],
        data: [50, 40],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)'
      },
      materialNotReady: {
        labels: ['Emergency Repair', 'NUC', 'Ext Notice For Refit', 'OPDEFSTA'],
        data: [8, 0, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)'
      }
    },
    'INS BEAS': {
      operationalReady: {
        labels: ['Sea', 'Harbour', 'AMP', 'SMP'],
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      maintenance: {
        labels: ['Refit', 'EAMP'],
        data: [15, 10],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)'
      },
      materialNotReady: {
        labels: ['Emergency Repair', 'NUC', 'Ext Notice For Refit', 'OPDEFSTA'],
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)'
      }
    },
    'INS BRAHMAP': {
      operationalReady: {
        labels: ['Sea', 'Harbour', 'AMP', 'SMP'],
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      maintenance: {
        labels: ['Refit', 'EAMP'],
        data: [55, 45],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)'
      },
      materialNotReady: {
        labels: ['Emergency Repair', 'NUC', 'Ext Notice For Refit', 'OPDEFSTA'],
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)'
      }
    }
  };

  // Full Power Trials Data
  fullPowerTrialsData = {
    labels: ['CST', '2020', '2021', '2022', '2023', '2024', '2025'],
    datasets: [
      {
        label: 'Monthly/MaxSpeed',
        data: [31, 0, 25, 29, 28, 28, 23],
        backgroundColor: 'rgba(34, 197, 94, 0.3)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Displacement',
        data: [3560, 0, 3736, 3736, 3800, 3760, 3750],
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  // Material Ready Details Data
  materialReadyDetailsData = {
    labels: ['Operational Exercise', 'Operational Sea Training', 'Independent Passage', 'Anchorage', 'Special Duty', 'OPDEF'],
    data: [82, 9, 64, 2, 8, 119],
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
    borderColor: 'rgba(34, 197, 94, 1)'
  };

  // Fuel Consumption Data
  fuelConsumptionData = {
    labels: ['Sea', 'Harbour', 'Anchorage'],
    data: [86.4, 13.2, 0.4],
    backgroundColor: [
      'rgba(59, 130, 246, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(34, 197, 94, 0.8)'
    ],
    borderColor: [
      'rgba(59, 130, 246, 1)',
      'rgba(245, 158, 11, 1)',
      'rgba(34, 197, 94, 1)'
    ]
  };

  // Engine Exploitation Factor Data
  engineExploitationFactorData = {
    labels: ['May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April'],
    datasets: [
      {
        label: 'LimitingValue',
        data: [1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)',
        borderWidth: 2,
        type: 'line' as const,
        fill: false,
        tension: 0
      },
      {
        label: 'ActualValue',
        data: [1.14, 0, 1.36, 1.78, 1.6, 1.93, 1.5, 1.75, 2.32, 1.87, 2.17, 2.4],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        borderRadius: 4
      }
    ]
  };

  // Diesel Generator Utilisation Factor Data
  dieselGeneratorUtilisationFactorData = {
    'Total': {
      labels: ['May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April'],
      datasets: [
        {
          label: 'Actual DGUF at Hbr',
          data: [8.3, 1.1, 1.31, 0, 0, 1.05, 0.95, 1.46, 1, 1, 1.21, 1.14],
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2,
          borderRadius: 4
        },
        {
          label: 'Actual DGUF At Sea',
          data: [1.61, 2.49, 1.98, 0, 0, 1.85, 2.1, 1.57, 2.1, 2.1, 2.23, 2.25],
          backgroundColor: 'rgba(168, 85, 247, 0.8)',
          borderColor: 'rgba(168, 85, 247, 1)',
          borderWidth: 2,
          borderRadius: 4
        }
      ]
    },
    'WNC': {
      labels: ['May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April'],
      datasets: [
        {
          label: 'Actual DGUF at Hbr',
          data: [7.2, 1.3, 1.45, 0, 0, 1.15, 1.05, 1.56, 1.2, 1.1, 1.31, 1.24],
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2,
          borderRadius: 4
        },
        {
          label: 'Actual DGUF At Sea',
          data: [1.71, 2.59, 2.08, 0, 0, 1.95, 2.2, 1.67, 2.2, 2.2, 2.33, 2.35],
          backgroundColor: 'rgba(168, 85, 247, 0.8)',
          borderColor: 'rgba(168, 85, 247, 1)',
          borderWidth: 2,
          borderRadius: 4
        }
      ]
    },
    'ENC': {
      labels: ['May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April'],
      datasets: [
        {
          label: 'Actual DGUF at Hbr',
          data: [6.8, 1.0, 1.25, 0, 0, 0.95, 0.85, 1.36, 0.9, 0.9, 1.11, 1.04],
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2,
          borderRadius: 4
        },
        {
          label: 'Actual DGUF At Sea',
          data: [1.51, 2.39, 1.88, 0, 0, 1.75, 2.0, 1.47, 2.0, 2.0, 2.13, 2.15],
          backgroundColor: 'rgba(168, 85, 247, 0.8)',
          borderColor: 'rgba(168, 85, 247, 1)',
          borderWidth: 2,
          borderRadius: 4
        }
      ]
    },
    'SNC': {
      labels: ['May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April'],
      datasets: [
        {
          label: 'Actual DGUF at Hbr',
          data: [7.8, 1.2, 1.35, 0, 0, 1.1, 1.0, 1.51, 1.1, 1.0, 1.26, 1.19],
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2,
          borderRadius: 4
        },
        {
          label: 'Actual DGUF At Sea',
          data: [1.66, 2.54, 2.03, 0, 0, 1.9, 2.15, 1.62, 2.15, 2.15, 2.28, 2.3],
          backgroundColor: 'rgba(168, 85, 247, 0.8)',
          borderColor: 'rgba(168, 85, 247, 1)',
          borderWidth: 2,
          borderRadius: 4
        }
      ]
    },
    'ANC': {
      labels: ['May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April'],
      datasets: [
        {
          label: 'Actual DGUF at Hbr',
          data: [6.5, 0.9, 1.15, 0, 0, 0.9, 0.8, 1.31, 0.85, 0.85, 1.06, 0.99],
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2,
          borderRadius: 4
        },
        {
          label: 'Actual DGUF At Sea',
          data: [1.46, 2.34, 1.83, 0, 0, 1.7, 1.95, 1.42, 1.95, 1.95, 2.08, 2.1],
          backgroundColor: 'rgba(168, 85, 247, 0.8)',
          borderColor: 'rgba(168, 85, 247, 1)',
          borderWidth: 2,
          borderRadius: 4
        }
      ]
    }
  };

  // DGUF Detailed Data for each command
  dgufDetailedData = {
    'Total': [
      // WNC Ships
      {
        ship_name: 'INS Vikrant (WNC)',
        total_rh_at_sea: 465.2,
        total_rh_at_port: 254.8,
        total_rh_in_month: 720.0,
        avg_rh_at_sea: 15.5,
        avg_rh_at_port: 8.5,
        avg_total_rh: 24.0,
        max_rh_at_sea: 19.2,
        max_rh_at_port: 12.8,
        max_total_rh: 29.5,
        record_count: 30
      },
      {
        ship_name: 'INS Delhi (WNC)',
        total_rh_at_sea: 435.8,
        total_rh_at_port: 244.2,
        total_rh_in_month: 680.0,
        avg_rh_at_sea: 14.5,
        avg_rh_at_port: 8.1,
        avg_total_rh: 22.7,
        max_rh_at_sea: 17.8,
        max_rh_at_port: 11.2,
        max_total_rh: 27.5,
        record_count: 30
      },
      // ENC Ships
      {
        ship_name: 'INS Mumbai (ENC)',
        total_rh_at_sea: 395.3,
        total_rh_at_port: 254.7,
        total_rh_in_month: 650.0,
        avg_rh_at_sea: 13.2,
        avg_rh_at_port: 8.5,
        avg_total_rh: 21.7,
        max_rh_at_sea: 15.8,
        max_rh_at_port: 10.2,
        max_total_rh: 24.0,
        record_count: 30
      },
      {
        ship_name: 'INS Kolkata (ENC)',
        total_rh_at_sea: 440.8,
        total_rh_at_port: 259.2,
        total_rh_in_month: 700.0,
        avg_rh_at_sea: 14.7,
        avg_rh_at_port: 8.6,
        avg_total_rh: 23.3,
        max_rh_at_sea: 17.8,
        max_rh_at_port: 11.2,
        max_total_rh: 26.5,
        record_count: 30
      },
      // SNC Ships
      {
        ship_name: 'INS Satpura (SNC)',
        total_rh_at_sea: 395.3,
        total_rh_at_port: 224.7,
        total_rh_in_month: 620.0,
        avg_rh_at_sea: 13.2,
        avg_rh_at_port: 7.5,
        avg_total_rh: 20.7,
        max_rh_at_sea: 16.2,
        max_rh_at_port: 9.8,
        max_total_rh: 24.0,
        record_count: 30
      },
      // ANC Ships
      {
        ship_name: 'INS Sahyadri (ANC)',
        total_rh_at_sea: 425.1,
        total_rh_at_port: 244.9,
        total_rh_in_month: 670.0,
        avg_rh_at_sea: 14.2,
        avg_rh_at_port: 8.2,
        avg_total_rh: 22.3,
        max_rh_at_sea: 17.5,
        max_rh_at_port: 10.5,
        max_total_rh: 25.8,
        record_count: 30
      }
    ],
    'WNC': [
      {
        ship_name: 'INS Vikrant',
        total_rh_at_sea: 465.2,
        total_rh_at_port: 254.8,
        total_rh_in_month: 720.0,
        avg_rh_at_sea: 15.5,
        avg_rh_at_port: 8.5,
        avg_total_rh: 24.0,
        max_rh_at_sea: 19.2,
        max_rh_at_port: 12.8,
        max_total_rh: 29.5,
        record_count: 30
      },
      {
        ship_name: 'INS Delhi',
        total_rh_at_sea: 435.8,
        total_rh_at_port: 244.2,
        total_rh_in_month: 680.0,
        avg_rh_at_sea: 14.5,
        avg_rh_at_port: 8.1,
        avg_total_rh: 22.7,
        max_rh_at_sea: 17.8,
        max_rh_at_port: 11.2,
        max_total_rh: 27.5,
        record_count: 30
      }
    ],
    'ENC': [
      {
        ship_name: 'INS Mumbai',
        total_rh_at_sea: 395.3,
        total_rh_at_port: 254.7,
        total_rh_in_month: 650.0,
        avg_rh_at_sea: 13.2,
        avg_rh_at_port: 8.5,
        avg_total_rh: 21.7,
        max_rh_at_sea: 15.8,
        max_rh_at_port: 10.2,
        max_total_rh: 24.0,
        record_count: 30
      },
      {
        ship_name: 'INS Kolkata',
        total_rh_at_sea: 440.8,
        total_rh_at_port: 259.2,
        total_rh_in_month: 700.0,
        avg_rh_at_sea: 14.7,
        avg_rh_at_port: 8.6,
        avg_total_rh: 23.3,
        max_rh_at_sea: 17.8,
        max_rh_at_port: 11.2,
        max_total_rh: 26.5,
        record_count: 30
      }
    ],
    'SNC': [
      {
        ship_name: 'INS Satpura',
        total_rh_at_sea: 395.3,
        total_rh_at_port: 224.7,
        total_rh_in_month: 620.0,
        avg_rh_at_sea: 13.2,
        avg_rh_at_port: 7.5,
        avg_total_rh: 20.7,
        max_rh_at_sea: 16.2,
        max_rh_at_port: 9.8,
        max_total_rh: 24.0,
        record_count: 30
      }
    ],
    'ANC': [
      {
        ship_name: 'INS Sahyadri',
        total_rh_at_sea: 425.1,
        total_rh_at_port: 244.9,
        total_rh_in_month: 670.0,
        avg_rh_at_sea: 14.2,
        avg_rh_at_port: 8.2,
        avg_total_rh: 22.3,
        max_rh_at_sea: 17.5,
        max_rh_at_port: 10.5,
        max_total_rh: 25.8,
        record_count: 30
      }
    ]
  };

  // Top Running Hours Data
  topRunningHoursData = {
    monthly: [
      {
        ship_name: 'INS Vikrant',
        total_hours_underway_month: 720.0,
        total_distance_run_month: 4500.0,
        avg_hours_underway_month: 24.0,
        max_speed_recorded: 28.0,
        max_duration_recorded: 18.5,
        record_count: 30
      },
      {
        ship_name: 'INS Delhi',
        total_hours_underway_month: 680.0,
        total_distance_run_month: 3800.0,
        avg_hours_underway_month: 22.7,
        max_speed_recorded: 32.0,
        max_duration_recorded: 17.2,
        record_count: 30
      },
      {
        ship_name: 'INS Mumbai',
        total_hours_underway_month: 650.0,
        total_distance_run_month: 3600.0,
        avg_hours_underway_month: 21.7,
        max_speed_recorded: 32.0,
        max_duration_recorded: 16.5,
        record_count: 30
      },
      {
        ship_name: 'INS Kolkata',
        total_hours_underway_month: 700.0,
        total_distance_run_month: 4200.0,
        avg_hours_underway_month: 23.3,
        max_speed_recorded: 32.0,
        max_duration_recorded: 17.8,
        record_count: 30
      },
      {
        ship_name: 'INS Shivalik',
        total_hours_underway_month: 580.0,
        total_distance_run_month: 3200.0,
        avg_hours_underway_month: 19.3,
        max_speed_recorded: 30.0,
        max_duration_recorded: 15.8,
        record_count: 30
      },
      {
        ship_name: 'INS Satpura',
        total_hours_underway_month: 620.0,
        total_distance_run_month: 3400.0,
        avg_hours_underway_month: 20.7,
        max_speed_recorded: 30.0,
        max_duration_recorded: 16.2,
        record_count: 30
      },
      {
        ship_name: 'INS Sahyadri',
        total_hours_underway_month: 590.0,
        total_distance_run_month: 3300.0,
        avg_hours_underway_month: 19.7,
        max_speed_recorded: 30.0,
        max_duration_recorded: 17.5,
        record_count: 30
      },
      {
        ship_name: 'INS Kamorta',
        total_hours_underway_month: 520.0,
        total_distance_run_month: 2800.0,
        avg_hours_underway_month: 17.3,
        max_speed_recorded: 25.0,
        max_duration_recorded: 14.2,
        record_count: 30
      },
      {
        ship_name: 'INS Kadmatt',
        total_hours_underway_month: 540.0,
        total_distance_run_month: 2900.0,
        avg_hours_underway_month: 18.0,
        max_speed_recorded: 25.0,
        max_duration_recorded: 14.8,
        record_count: 30
      },
      {
        ship_name: 'INS Kiltan',
        total_hours_underway_month: 510.0,
        total_distance_run_month: 2700.0,
        avg_hours_underway_month: 17.0,
        max_speed_recorded: 25.0,
        max_duration_recorded: 13.9,
        record_count: 30
      }
    ],
    yearly: [
      {
        ship_name: 'INS Vikrant',
        total_hours_underway_year: 8640.0,
        total_distance_run_month: 54000.0,
        avg_hours_underway_year: 24.0,
        max_speed_recorded: 28.0,
        max_duration_recorded: 18.5,
        record_count: 365
      },
      {
        ship_name: 'INS Delhi',
        total_hours_underway_year: 8160.0,
        total_distance_run_month: 45600.0,
        avg_hours_underway_year: 22.7,
        max_speed_recorded: 32.0,
        max_duration_recorded: 17.2,
        record_count: 365
      },
      {
        ship_name: 'INS Mumbai',
        total_hours_underway_year: 7800.0,
        total_distance_run_month: 43200.0,
        avg_hours_underway_year: 21.7,
        max_speed_recorded: 32.0,
        max_duration_recorded: 16.5,
        record_count: 365
      },
      {
        ship_name: 'INS Kolkata',
        total_hours_underway_year: 8400.0,
        total_distance_run_month: 50400.0,
        avg_hours_underway_year: 23.3,
        max_speed_recorded: 32.0,
        max_duration_recorded: 17.8,
        record_count: 365
      },
      {
        ship_name: 'INS Shivalik',
        total_hours_underway_year: 6960.0,
        total_distance_run_month: 38400.0,
        avg_hours_underway_year: 19.3,
        max_speed_recorded: 30.0,
        max_duration_recorded: 15.8,
        record_count: 365
      },
      {
        ship_name: 'INS Satpura',
        total_hours_underway_year: 7440.0,
        total_distance_run_month: 40800.0,
        avg_hours_underway_year: 20.7,
        max_speed_recorded: 30.0,
        max_duration_recorded: 16.2,
        record_count: 365
      },
      {
        ship_name: 'INS Sahyadri',
        total_hours_underway_year: 7080.0,
        total_distance_run_month: 39600.0,
        avg_hours_underway_year: 19.7,
        max_speed_recorded: 30.0,
        max_duration_recorded: 17.5,
        record_count: 365
      },
      {
        ship_name: 'INS Kamorta',
        total_hours_underway_year: 6240.0,
        total_distance_run_month: 33600.0,
        avg_hours_underway_year: 17.3,
        max_speed_recorded: 25.0,
        max_duration_recorded: 14.2,
        record_count: 365
      },
      {
        ship_name: 'INS Kadmatt',
        total_hours_underway_year: 6480.0,
        total_distance_run_month: 34800.0,
        avg_hours_underway_year: 18.0,
        max_speed_recorded: 25.0,
        max_duration_recorded: 14.8,
        record_count: 365
      },
      {
        ship_name: 'INS Kiltan',
        total_hours_underway_year: 6120.0,
        total_distance_run_month: 32400.0,
        avg_hours_underway_year: 17.0,
        max_speed_recorded: 25.0,
        max_duration_recorded: 13.9,
        record_count: 365
      }
    ]
  };

  // Average Running Hours Data (Yearly Basis)
  averageRunningHoursData = [
    {
      ship_name: 'INS Vikrant',
      avg_hours_underway_year: 24.0,
      total_hours_underway_year: 8640.0,
      total_distance_run_year: 54000.0,
      avg_distance_per_day: 147.9,
      operational_days: 365,
      efficiency_rating: 95.8
    },
    {
      ship_name: 'INS Delhi',
      avg_hours_underway_year: 22.7,
      total_hours_underway_year: 8160.0,
      total_distance_run_year: 45600.0,
      avg_distance_per_day: 125.0,
      operational_days: 360,
      efficiency_rating: 92.3
    },
    {
      ship_name: 'INS Mumbai',
      avg_hours_underway_year: 21.7,
      total_hours_underway_year: 7800.0,
      total_distance_run_year: 43200.0,
      avg_distance_per_day: 118.4,
      operational_days: 355,
      efficiency_rating: 89.7
    },
    {
      ship_name: 'INS Kolkata',
      avg_hours_underway_year: 23.3,
      total_hours_underway_year: 8400.0,
      total_distance_run_year: 50400.0,
      avg_distance_per_day: 138.1,
      operational_days: 365,
      efficiency_rating: 94.2
    },
    {
      ship_name: 'INS Shivalik',
      avg_hours_underway_year: 19.3,
      total_hours_underway_year: 6960.0,
      total_distance_run_year: 38400.0,
      avg_distance_per_day: 105.2,
      operational_days: 360,
      efficiency_rating: 85.1
    },
    {
      ship_name: 'INS Satpura',
      avg_hours_underway_year: 20.7,
      total_hours_underway_year: 7440.0,
      total_distance_run_year: 40800.0,
      avg_distance_per_day: 111.8,
      operational_days: 365,
      efficiency_rating: 87.9
    },
    {
      ship_name: 'INS Sahyadri',
      avg_hours_underway_year: 19.7,
      total_hours_underway_year: 7080.0,
      total_distance_run_year: 39600.0,
      avg_distance_per_day: 108.5,
      operational_days: 365,
      efficiency_rating: 86.4
    },
    {
      ship_name: 'INS Kamorta',
      avg_hours_underway_year: 17.3,
      total_hours_underway_year: 6240.0,
      total_distance_run_year: 33600.0,
      avg_distance_per_day: 92.1,
      operational_days: 365,
      efficiency_rating: 78.9
    },
    {
      ship_name: 'INS Kadmatt',
      avg_hours_underway_year: 18.0,
      total_hours_underway_year: 6480.0,
      total_distance_run_year: 34800.0,
      avg_distance_per_day: 95.3,
      operational_days: 365,
      efficiency_rating: 81.2
    },
    {
      ship_name: 'INS Kiltan',
      avg_hours_underway_year: 17.0,
      total_hours_underway_year: 6120.0,
      total_distance_run_year: 32400.0,
      avg_distance_per_day: 88.8,
      operational_days: 360,
      efficiency_rating: 76.5
    },
    {
      ship_name: 'INS Chennai',
      avg_hours_underway_year: 21.2,
      total_hours_underway_year: 7632.0,
      total_distance_run_year: 42000.0,
      avg_distance_per_day: 115.1,
      operational_days: 365,
      efficiency_rating: 88.6
    },
    {
      ship_name: 'INS Rajvir',
      avg_hours_underway_year: 18.8,
      total_hours_underway_year: 6768.0,
      total_distance_run_year: 37200.0,
      avg_distance_per_day: 101.9,
      operational_days: 365,
      efficiency_rating: 82.4
    },
    {
      ship_name: 'INS Teg',
      avg_hours_underway_year: 20.1,
      total_hours_underway_year: 7236.0,
      total_distance_run_year: 39600.0,
      avg_distance_per_day: 108.5,
      operational_days: 365,
      efficiency_rating: 86.1
    },
    {
      ship_name: 'INS Talwar',
      avg_hours_underway_year: 19.5,
      total_hours_underway_year: 7020.0,
      total_distance_run_year: 38400.0,
      avg_distance_per_day: 105.2,
      operational_days: 365,
      efficiency_rating: 84.3
    },
    {
      ship_name: 'INS Visakha',
      avg_hours_underway_year: 18.2,
      total_hours_underway_year: 6552.0,
      total_distance_run_year: 36000.0,
      avg_distance_per_day: 98.6,
      operational_days: 365,
      efficiency_rating: 80.7
    }
  ];

  // Tab-specific data for different charts
  tabSpecificData = {
    'Total': {
      fleetData: {
        labels: ['2015-118 Ships', '2016-121 Ships', '2017-127 Ships', '2018-130 Ships', '2019-132 Ships', 
                 '2020-134 Ships', '2021-138 Ships', '2022-140 Ships', '2023-143 Ships', '2024-145 Ships', '2025-149 Ships'],
        datasets: [
          {
            label: 'AIRCRAFT CARRIERS',
            data: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgba(239, 68, 68, 1)',
            fill: true
          },
          {
            label: 'DESTROYER AND FRIGATES',
            data: [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 27],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            fill: true
          }
        ]
      },
      shipPerformanceData: {
        monthly: [
          {
            ship_name: 'INS Vikrant',
            total_hours_month: 720,
            total_distance_month: 4500,
            avg_hours_month: 24,
            max_speed: 28
          },
          {
            ship_name: 'INS Delhi',
            total_hours_month: 680,
            total_distance_month: 3800,
            avg_hours_month: 22.7,
            max_speed: 32
          }
        ]
      },
      fullPowerTrialsData: {
        labels: ['CST', '2020', '2021', '2022', '2023', '2024', '2025'],
        datasets: [
          {
            label: 'Monthly/MaxSpeed',
            data: [31, 0, 25, 29, 28, 28, 23],
            backgroundColor: 'rgba(34, 197, 94, 0.3)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: 'Displacement',
            data: [3560, 0, 3736, 3736, 3800, 3760, 3750],
            backgroundColor: 'rgba(59, 130, 246, 0.3)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      materialReadyDetailsData: {
        labels: ['Operational Exercise', 'Operational Sea Training', 'Independent Passage', 'Anchorage', 'Special Duty', 'OPDEF'],
        data: [82, 9, 64, 2, 8, 119],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      fuelConsumptionData: {
        labels: ['Sea', 'Harbour', 'Anchorage'],
        data: [86.4, 13.2, 0.4],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(34, 197, 94, 1)'
        ]
      },
      engineExploitationFactorData: {
        labels: ['May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April'],
        datasets: [
          {
            label: 'LimitingValue',
            data: [1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6],
            backgroundColor: 'rgba(34, 211, 238, 0.8)',
            borderColor: 'rgba(34, 211, 238, 1)',
            borderWidth: 2,
            type: 'line' as const,
            fill: false,
            tension: 0
          },
          {
            label: 'ActualValue',
            data: [1.14, 0, 1.36, 1.78, 1.6, 1.93, 1.5, 1.75, 2.32, 1.87, 2.17, 2.4],
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 2,
            borderRadius: 4
          }
        ]
      }
    },
    'WNC': {
      fleetData: {
        labels: ['2015-45 Ships', '2016-47 Ships', '2017-49 Ships', '2018-50 Ships', '2019-51 Ships', 
                 '2020-52 Ships', '2021-53 Ships', '2022-54 Ships', '2023-55 Ships', '2024-56 Ships', '2025-57 Ships'],
        datasets: [
          {
            label: 'AIRCRAFT CARRIERS',
            data: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgba(239, 68, 68, 1)',
            fill: true
          },
          {
            label: 'DESTROYER AND FRIGATES',
            data: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 17],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            fill: true
          }
        ]
      },
      shipPerformanceData: {
        monthly: [
          {
            ship_name: 'INS Vikrant',
            total_hours_month: 750,
            total_distance_month: 4700,
            avg_hours_month: 25,
            max_speed: 29
          },
          {
            ship_name: 'INS Delhi',
            total_hours_month: 710,
            total_distance_month: 4000,
            avg_hours_month: 23.7,
            max_speed: 33
          }
        ]
      },
      fullPowerTrialsData: {
        labels: ['CST', '2020', '2021', '2022', '2023', '2024', '2025'],
        datasets: [
          {
            label: 'Monthly/MaxSpeed',
            data: [32, 0, 26, 30, 29, 29, 24],
            backgroundColor: 'rgba(34, 197, 94, 0.3)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: 'Displacement',
            data: [3600, 0, 3750, 3750, 3820, 3780, 3770],
            backgroundColor: 'rgba(59, 130, 246, 0.3)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      materialReadyDetailsData: {
        labels: ['Operational Exercise', 'Operational Sea Training', 'Independent Passage', 'Anchorage', 'Special Duty', 'OPDEF'],
        data: [85, 10, 67, 3, 9, 122],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      fuelConsumptionData: {
        labels: ['Sea', 'Harbour', 'Anchorage'],
        data: [88.2, 11.4, 0.4],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(34, 197, 94, 1)'
        ]
      },
      engineExploitationFactorData: {
        labels: ['May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April'],
        datasets: [
          {
            label: 'LimitingValue',
            data: [1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6],
            backgroundColor: 'rgba(34, 211, 238, 0.8)',
            borderColor: 'rgba(34, 211, 238, 1)',
            borderWidth: 2,
            type: 'line' as const,
            fill: false,
            tension: 0
          },
          {
            label: 'ActualValue',
            data: [1.24, 0, 1.46, 1.88, 1.7, 2.03, 1.6, 1.85, 2.42, 1.97, 2.27, 2.5],
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 2,
            borderRadius: 4
          }
        ]
      }
    },
    'ENC': {
      fleetData: {
        labels: ['2015-35 Ships', '2016-36 Ships', '2017-38 Ships', '2018-39 Ships', '2019-40 Ships', 
                 '2020-41 Ships', '2021-42 Ships', '2022-43 Ships', '2023-44 Ships', '2024-45 Ships', '2025-46 Ships'],
        datasets: [
          {
            label: 'AIRCRAFT CARRIERS',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgba(239, 68, 68, 1)',
            fill: true
          },
          {
            label: 'DESTROYER AND FRIGATES',
            data: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            fill: true
          }
        ]
      },
      shipPerformanceData: {
        monthly: [
          {
            ship_name: 'INS Mumbai',
            total_hours_month: 670,
            total_distance_month: 3800,
            avg_hours_month: 22.3,
            max_speed: 31
          },
          {
            ship_name: 'INS Kolkata',
            total_hours_month: 720,
            total_distance_month: 4300,
            avg_hours_month: 24.0,
            max_speed: 33
          }
        ]
      },
      fullPowerTrialsData: {
        labels: ['CST', '2020', '2021', '2022', '2023', '2024', '2025'],
        datasets: [
          {
            label: 'Monthly/MaxSpeed',
            data: [30, 0, 24, 28, 27, 27, 22],
            backgroundColor: 'rgba(34, 197, 94, 0.3)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: 'Displacement',
            data: [3520, 0, 3720, 3720, 3780, 3740, 3730],
            backgroundColor: 'rgba(59, 130, 246, 0.3)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      materialReadyDetailsData: {
        labels: ['Operational Exercise', 'Operational Sea Training', 'Independent Passage', 'Anchorage', 'Special Duty', 'OPDEF'],
        data: [78, 8, 60, 2, 7, 115],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      fuelConsumptionData: {
        labels: ['Sea', 'Harbour', 'Anchorage'],
        data: [84.8, 14.8, 0.4],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(34, 197, 94, 1)'
        ]
      },
      engineExploitationFactorData: {
        labels: ['May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April'],
        datasets: [
          {
            label: 'LimitingValue',
            data: [1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6],
            backgroundColor: 'rgba(34, 211, 238, 0.8)',
            borderColor: 'rgba(34, 211, 238, 1)',
            borderWidth: 2,
            type: 'line' as const,
            fill: false,
            tension: 0
          },
          {
            label: 'ActualValue',
            data: [1.04, 0, 1.26, 1.68, 1.5, 1.83, 1.4, 1.65, 2.22, 1.77, 2.07, 2.3],
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 2,
            borderRadius: 4
          }
        ]
      }
    },
    'SNC': {
      fleetData: {
        labels: ['2015-25 Ships', '2016-26 Ships', '2017-28 Ships', '2018-29 Ships', '2019-30 Ships', 
                 '2020-31 Ships', '2021-32 Ships', '2022-33 Ships', '2023-34 Ships', '2024-35 Ships', '2025-36 Ships'],
        datasets: [
          {
            label: 'AIRCRAFT CARRIERS',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgba(239, 68, 68, 1)',
            fill: true
          },
          {
            label: 'DESTROYER AND FRIGATES',
            data: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 13],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            fill: true
          }
        ]
      },
      shipPerformanceData: {
        monthly: [
          {
            ship_name: 'INS Satpura',
            total_hours_month: 640,
            total_distance_month: 3600,
            avg_hours_month: 21.3,
            max_speed: 30
          }
        ]
      },
      fullPowerTrialsData: {
        labels: ['CST', '2020', '2021', '2022', '2023', '2024', '2025'],
        datasets: [
          {
            label: 'Monthly/MaxSpeed',
            data: [29, 0, 23, 27, 26, 26, 21],
            backgroundColor: 'rgba(34, 197, 94, 0.3)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: 'Displacement',
            data: [3480, 0, 3700, 3700, 3760, 3720, 3710],
            backgroundColor: 'rgba(59, 130, 246, 0.3)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      materialReadyDetailsData: {
        labels: ['Operational Exercise', 'Operational Sea Training', 'Independent Passage', 'Anchorage', 'Special Duty', 'OPDEF'],
        data: [75, 7, 58, 1, 6, 112],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      fuelConsumptionData: {
        labels: ['Sea', 'Harbour', 'Anchorage'],
        data: [83.2, 16.4, 0.4],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(34, 197, 94, 1)'
        ]
      },
      engineExploitationFactorData: {
        labels: ['May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April'],
        datasets: [
          {
            label: 'LimitingValue',
            data: [1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6],
            backgroundColor: 'rgba(34, 211, 238, 0.8)',
            borderColor: 'rgba(34, 211, 238, 1)',
            borderWidth: 2,
            type: 'line' as const,
            fill: false,
            tension: 0
          },
          {
            label: 'ActualValue',
            data: [0.94, 0, 1.16, 1.58, 1.4, 1.73, 1.3, 1.55, 2.12, 1.67, 1.97, 2.2],
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 2,
            borderRadius: 4
          }
        ]
      }
    },
    'ANC': {
      fleetData: {
        labels: ['2015-13 Ships', '2016-14 Ships', '2017-15 Ships', '2018-16 Ships', '2019-17 Ships', 
                 '2020-18 Ships', '2021-19 Ships', '2022-20 Ships', '2023-21 Ships', '2024-22 Ships', '2025-23 Ships'],
        datasets: [
          {
            label: 'AIRCRAFT CARRIERS',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgba(239, 68, 68, 1)',
            fill: true
          },
          {
            label: 'DESTROYER AND FRIGATES',
            data: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 11],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            fill: true
          }
        ]
      },
      shipPerformanceData: {
        monthly: [
          {
            ship_name: 'INS Sahyadri',
            total_hours_month: 590,
            total_distance_month: 3300,
            avg_hours_month: 19.7,
            max_speed: 29
          }
        ]
      },
      fullPowerTrialsData: {
        labels: ['CST', '2020', '2021', '2022', '2023', '2024', '2025'],
        datasets: [
          {
            label: 'Monthly/MaxSpeed',
            data: [28, 0, 22, 26, 25, 25, 20],
            backgroundColor: 'rgba(34, 197, 94, 0.3)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: 'Displacement',
            data: [3440, 0, 3680, 3680, 3740, 3700, 3690],
            backgroundColor: 'rgba(59, 130, 246, 0.3)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      materialReadyDetailsData: {
        labels: ['Operational Exercise', 'Operational Sea Training', 'Independent Passage', 'Anchorage', 'Special Duty', 'OPDEF'],
        data: [72, 6, 55, 1, 5, 108],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      fuelConsumptionData: {
        labels: ['Sea', 'Harbour', 'Anchorage'],
        data: [81.6, 18.0, 0.4],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(34, 197, 94, 1)'
        ]
      },
      engineExploitationFactorData: {
        labels: ['May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April'],
        datasets: [
          {
            label: 'LimitingValue',
            data: [1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6],
            backgroundColor: 'rgba(34, 211, 238, 0.8)',
            borderColor: 'rgba(34, 211, 238, 1)',
            borderWidth: 2,
            type: 'line' as const,
            fill: false,
            tension: 0
          },
          {
            label: 'ActualValue',
            data: [0.84, 0, 1.06, 1.48, 1.3, 1.63, 1.2, 1.45, 2.02, 1.57, 1.87, 2.1],
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 2,
            borderRadius: 4
          }
        ]
      }
    }
  };

  charts: { [key: string]: Chart } = {};

  ngOnInit() {
    setTimeout(() => {
      this.initializeCharts();
    }, 300);
  }

  initializeCharts() {
    this.createAreaChart();
    this.createBarChart();
    this.createDonutChart();
    this.createHorizontalBarChart();
    this.createShipPerformanceChart();
    this.createCommandShipsChart();
    this.createOperationalReadinessChart();
    this.createShipDetailsCharts();
    this.createFullPowerTrialsChart();
    this.createMaterialReadyDetailsChart();
    this.createFuelConsumptionChart();
    this.createEngineExploitationFactorChart();
    this.createDieselGeneratorUtilisationFactorChart();
    this.createTopRunningHoursChart();
    this.createAverageRunningHoursChart();
    
    // Set charts as loaded after all charts are created
    setTimeout(() => {
      this.chartsLoaded = true;
    }, 200);
  }

  createShipPerformanceChart() {
    const ctx = this.shipPerformanceCanvas.nativeElement.getContext('2d');
    const tabData = this.tabSpecificData[this.activeTab as keyof typeof this.tabSpecificData]?.shipPerformanceData;
    const currentData = tabData ? tabData[this.selectedView as keyof typeof tabData] : this.shipPerformanceData[this.selectedView as keyof typeof this.shipPerformanceData];
    
    if (this.charts['shipPerformance']) {
      this.charts['shipPerformance'].destroy();
    }
    
    this.charts['shipPerformance'] = new Chart(ctx, {
      type: 'bar' as ChartType,
      data: {
        labels: currentData.map(ship => ship.ship_name),
        datasets: [
          {
            label: 'Total Hours',
            data: currentData.map(ship => ship.total_hours_month),
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 2,
            borderRadius: 8,
            yAxisID: 'y'
          },
          {
            label: 'Total Distance (km)',
            data: currentData.map(ship => ship.total_distance_month),
            backgroundColor: 'rgba(244, 63, 94, 0.8)',
            borderColor: 'rgba(244, 63, 94, 1)',
            borderWidth: 2,
            borderRadius: 8,
            yAxisID: 'y1'
          },
          {
            label: 'Average Hours',
            data: currentData.map(ship => ship.avg_hours_month),
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 2,
            borderRadius: 8,
            yAxisID: 'y2'
          },
          {
            label: 'Max Speed (knots)',
            data: currentData.map(ship => ship.max_speed),
            backgroundColor: 'rgba(168, 85, 247, 0.8)',
            borderColor: 'rgba(168, 85, 247, 1)',
            borderWidth: 2,
            borderRadius: 8,
            yAxisID: 'y3'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `SHIP PERFORMANCE METRICS - ${this.activeTab} - ${this.selectedView.toUpperCase()} VIEW`,
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Ships'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Total Hours'
            },
            grid: {
              drawOnChartArea: false,
            },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Total Distance (km)'
            },
            grid: {
              drawOnChartArea: false,
            },
          },
          y2: {
            type: 'linear',
            display: false,
            title: {
              display: false,
              text: 'Average Hours'
            },
            grid: {
              drawOnChartArea: false,
            },
          },
          y3: {
            type: 'linear',
            display: false,
            title: {
              display: false,
              text: 'Max Speed (knots)'
            },
            grid: {
              drawOnChartArea: false,
            },
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }

  onViewChange() {
    if (this.charts['shipPerformance']) {
      this.charts['shipPerformance'].destroy();
    }
    this.createShipPerformanceChart();
  }

  createAreaChart() {
    const ctx = this.areaChartCanvas.nativeElement.getContext('2d');
    const currentData = this.tabSpecificData[this.activeTab as keyof typeof this.tabSpecificData]?.fleetData || this.fleetData;
    
    if (this.charts['area']) {
      this.charts['area'].destroy();
    }
    
    this.charts['area'] = new Chart(ctx, {
      type: 'line' as ChartType,
      data: currentData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `NUMBER OF SHIPS AND SUBMARINES - ${this.activeTab}`,
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: 'Year - Total Ships'
            }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            max: 160,
            ticks: {
              stepSize: 20
            },
            title: {
              display: true,
              text: 'Count'
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }

  createBarChart() {
    const ctx = this.barChartCanvas.nativeElement.getContext('2d');
    
    this.charts['bar'] = new Chart(ctx, {
      type: 'bar' as ChartType,
      data: {
        labels: this.shipsInCommission.labels,
        datasets: [{
          label: 'Active Count',
          data: this.shipsInCommission.data,
          backgroundColor: 'rgba(139, 92, 246, 0.8)',
          borderColor: 'rgba(139, 92, 246, 1)',
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'SHIPS/SUBMARINES IN COMMISSION: 149',
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 40,
            ticks: {
              stepSize: 5
            },
            title: {
              display: true,
              text: 'Active Count'
            }
          }
        }
      }
    });
  }

  createDonutChart() {
    const ctx = this.donutChartCanvas.nativeElement.getContext('2d');
    
    this.charts['donut'] = new Chart(ctx, {
      type: 'doughnut' as ChartType,
      data: {
        labels: this.operationalAvailability.labels,
        datasets: [{
          data: this.operationalAvailability.data,
          backgroundColor: this.operationalAvailability.colors,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'OPERATIONAL AVAILABILITY',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        }
      }
    });
  }

  createHorizontalBarChart() {
    const ctx = this.horizontalBarCanvas.nativeElement.getContext('2d');
    
    this.charts['horizontalBar'] = new Chart(ctx, {
      type: 'bar' as ChartType,
      data: {
        labels: this.daysAtSea.labels,
        datasets: [{
          label: 'DaysAtSea',
          data: this.daysAtSea.data,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'MAX DAYS AT SEA',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 300,
            ticks: {
              stepSize: 50
            },
            title: {
              display: true,
              text: 'Days'
            }
          }
        }
      }
    });
  }

  onTabChange(tab: string) {
    this.activeTab = tab;
    // Update all charts based on the selected tab
    this.updateAllChartsForTab();
  }

  updateAllChartsForTab() {
    // Update command ships chart
    this.createCommandShipsChart();
    
    // Update DGUF chart
    this.createDieselGeneratorUtilisationFactorChart();
    
    // Update operational readiness chart based on tab
    this.updateOperationalReadinessForTab();
    
    // Update ship details charts
    this.createShipDetailsCharts();
    
    // Update top running hours chart
    this.createTopRunningHoursChart();
    
    // Update average running hours chart
    this.createAverageRunningHoursChart();
    
    // Update all other charts
    this.updateFleetCompositionForTab();
    this.updateShipPerformanceForTab();
    this.updateFullPowerTrialsForTab();
    this.updateMaterialReadyDetailsForTab();
    this.updateFuelConsumptionForTab();
    this.updateEngineExploitationFactorForTab();
  }

  updateOperationalReadinessForTab() {
    // Update operational readiness data based on selected tab
    if (this.charts['operationalReadiness']) {
      this.charts['operationalReadiness'].destroy();
    }
    this.createOperationalReadinessChart();
  }

  updateFleetCompositionForTab() {
    // Update fleet composition chart based on selected tab
    if (this.charts['area']) {
      this.charts['area'].destroy();
    }
    this.createAreaChart();
  }

  updateShipPerformanceForTab() {
    // Update ship performance chart based on selected tab
    if (this.charts['shipPerformance']) {
      this.charts['shipPerformance'].destroy();
    }
    this.createShipPerformanceChart();
  }

  updateFullPowerTrialsForTab() {
    // Update full power trials chart based on selected tab
    if (this.charts['fullPowerTrials']) {
      this.charts['fullPowerTrials'].destroy();
    }
    this.createFullPowerTrialsChart();
  }

  updateMaterialReadyDetailsForTab() {
    // Update material ready details chart based on selected tab
    if (this.charts['materialReadyDetails']) {
      this.charts['materialReadyDetails'].destroy();
    }
    this.createMaterialReadyDetailsChart();
  }

  updateFuelConsumptionForTab() {
    // Update fuel consumption chart based on selected tab
    if (this.charts['fuelConsumption']) {
      this.charts['fuelConsumption'].destroy();
    }
    this.createFuelConsumptionChart();
  }

  updateEngineExploitationFactorForTab() {
    // Update engine exploitation factor chart based on selected tab
    if (this.charts['engineExploitationFactor']) {
      this.charts['engineExploitationFactor'].destroy();
    }
    this.createEngineExploitationFactorChart();
  }

  onDisplacementToggle() {
    this.showDisplacement = !this.showDisplacement;
    // Here you would typically update the chart data based on displacement
  }

  createCommandShipsChart() {
    const ctx = this.commandShipsCanvas.nativeElement.getContext('2d');
    const currentData = this.dgufDetailedData[this.activeTab as keyof typeof this.dgufDetailedData] || [];
    
    if (this.charts['commandShips']) {
      this.charts['commandShips'].destroy();
    }
    
    this.charts['commandShips'] = new Chart(ctx, {
      type: 'bar' as ChartType,
      data: {
        labels: currentData.map(ship => ship.ship_name),
        datasets: [
          {
            label: 'Total RH at Sea',
            data: currentData.map(ship => ship.total_rh_at_sea),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            borderRadius: 8,
            yAxisID: 'y'
          },
          {
            label: 'Total RH at Port',
            data: currentData.map(ship => ship.total_rh_at_port),
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 2,
            borderRadius: 8,
            yAxisID: 'y'
          },
          {
            label: 'Total RH in Month',
            data: currentData.map(ship => ship.total_rh_in_month),
            backgroundColor: 'rgba(245, 158, 11, 0.8)',
            borderColor: 'rgba(245, 158, 11, 1)',
            borderWidth: 2,
            borderRadius: 8,
            yAxisID: 'y'
          },
          {
            label: 'Avg RH at Sea',
            data: currentData.map(ship => ship.avg_rh_at_sea),
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 2,
            borderRadius: 8,
            yAxisID: 'y1'
          },
          {
            label: 'Avg RH at Port',
            data: currentData.map(ship => ship.avg_rh_at_port),
            backgroundColor: 'rgba(139, 92, 246, 0.8)',
            borderColor: 'rgba(139, 92, 246, 1)',
            borderWidth: 2,
            borderRadius: 8,
            yAxisID: 'y1'
          },
          {
            label: 'Max RH at Sea',
            data: currentData.map(ship => ship.max_rh_at_sea),
            backgroundColor: 'rgba(236, 72, 153, 0.8)',
            borderColor: 'rgba(236, 72, 153, 1)',
            borderWidth: 2,
            borderRadius: 8,
            yAxisID: 'y1'
          },
          {
            label: 'Max RH at Port',
            data: currentData.map(ship => ship.max_rh_at_port),
            backgroundColor: 'rgba(251, 146, 60, 0.8)',
            borderColor: 'rgba(251, 146, 60, 1)',
            borderWidth: 2,
            borderRadius: 8,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `COMMAND SHIPS RUNNING HOURS - ${this.activeTab}`,
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Ships'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Total Running Hours'
            },
            grid: {
              drawOnChartArea: false,
            },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Average/Max Running Hours'
            },
            grid: {
              drawOnChartArea: false,
            },
          }
        }
      }
    });
  }



  createOperationalReadinessChart() {
    const ctx = this.operationalReadinessCanvas.nativeElement.getContext('2d');
    
    this.charts['operationalReadiness'] = new Chart(ctx, {
      type: 'bar' as ChartType,
      data: {
        labels: this.operationalReadinessData.labels,
        datasets: this.operationalReadinessData.datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'OPERATIONAL READINESS FOR DESTROYER AND FRIGATES',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Ships'
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            beginAtZero: true,
            max: 400,
            ticks: {
              stepSize: 50
            },
            title: {
              display: true,
              text: 'Running Hours'
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }

  createShipDetailsCharts() {
    this.createOperationalReadyChart();
    this.createMaintenanceChart();
    this.createMaterialNotReadyChart();
  }

  createOperationalReadyChart() {
    const ctx = this.operationalReadyCanvas.nativeElement.getContext('2d');
    const shipData = this.shipDetailsData[this.selectedShip as keyof typeof this.shipDetailsData];
    
    if (this.charts['operationalReady']) {
      this.charts['operationalReady'].destroy();
    }
    
    this.charts['operationalReady'] = new Chart(ctx, {
      type: 'bar' as ChartType,
      data: {
        labels: shipData.operationalReady.labels,
        datasets: [{
          label: 'Days',
          data: shipData.operationalReady.data,
          backgroundColor: shipData.operationalReady.backgroundColor,
          borderColor: shipData.operationalReady.borderColor,
          borderWidth: 2,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: false
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 10
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 220,
            ticks: {
              stepSize: 20
            },
            title: {
              display: true,
              text: 'Days'
            }
          }
        }
      }
    });
  }

  createMaintenanceChart() {
    const ctx = this.maintenanceCanvas.nativeElement.getContext('2d');
    const shipData = this.shipDetailsData[this.selectedShip as keyof typeof this.shipDetailsData];
    
    if (this.charts['maintenance']) {
      this.charts['maintenance'].destroy();
    }
    
    this.charts['maintenance'] = new Chart(ctx, {
      type: 'bar' as ChartType,
      data: {
        labels: shipData.maintenance.labels,
        datasets: [{
          label: 'Days',
          data: shipData.maintenance.data,
          backgroundColor: shipData.maintenance.backgroundColor,
          borderColor: shipData.maintenance.borderColor,
          borderWidth: 2,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: false
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 10
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 50,
            ticks: {
              stepSize: 10
            },
            title: {
              display: true,
              text: 'Days'
            }
          }
        }
      }
    });
  }

  createMaterialNotReadyChart() {
    const ctx = this.materialNotReadyCanvas.nativeElement.getContext('2d');
    const shipData = this.shipDetailsData[this.selectedShip as keyof typeof this.shipDetailsData];
    
    if (this.charts['materialNotReady']) {
      this.charts['materialNotReady'].destroy();
    }
    
    this.charts['materialNotReady'] = new Chart(ctx, {
      type: 'bar' as ChartType,
      data: {
        labels: shipData.materialNotReady.labels,
        datasets: [{
          label: 'Days',
          data: shipData.materialNotReady.data,
          backgroundColor: shipData.materialNotReady.backgroundColor,
          borderColor: shipData.materialNotReady.borderColor,
          borderWidth: 2,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: false
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 10
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 50,
            ticks: {
              stepSize: 10
            },
            title: {
              display: true,
              text: 'Days'
            }
          }
        }
      }
    });
  }

  onShipChange() {
    this.createShipDetailsCharts();
  }

  onDateChange() {
    // In a real application, you would fetch new data based on the date range
    // For now, we'll just update the charts with existing data
    this.createShipDetailsCharts();
  }

  createFullPowerTrialsChart() {
    const ctx = this.fullPowerTrialsCanvas.nativeElement.getContext('2d');
    const currentData = this.tabSpecificData[this.activeTab as keyof typeof this.tabSpecificData]?.fullPowerTrialsData || this.fullPowerTrialsData;
    
    if (this.charts['fullPowerTrials']) {
      this.charts['fullPowerTrials'].destroy();
    }
    
    this.charts['fullPowerTrials'] = new Chart(ctx, {
      type: 'line' as ChartType,
      data: currentData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `FULL POWER TRIALS (FPT) - ${this.activeTab}`,
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time Period'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Speed'
            },
            min: 0,
            max: 100,
            ticks: {
              stepSize: 10
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Displacement in Tonnage'
            },
            min: 0,
            max: 4000,
            ticks: {
              stepSize: 500
            },
            grid: {
              drawOnChartArea: false,
            },
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }

  createMaterialReadyDetailsChart() {
    const ctx = this.materialReadyDetailsCanvas.nativeElement.getContext('2d');
    const currentData = this.tabSpecificData[this.activeTab as keyof typeof this.tabSpecificData]?.materialReadyDetailsData || this.materialReadyDetailsData;
    
    if (this.charts['materialReadyDetails']) {
      this.charts['materialReadyDetails'].destroy();
    }
    
    this.charts['materialReadyDetails'] = new Chart(ctx, {
      type: 'bar' as ChartType,
      data: {
        labels: currentData.labels,
        datasets: [{
          label: 'Days',
          data: currentData.data,
          backgroundColor: currentData.backgroundColor,
          borderColor: currentData.borderColor,
          borderWidth: 2,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `MATERIAL READY DETAILS - ${this.activeTab}`,
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 10
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 130,
            ticks: {
              stepSize: 10
            },
            title: {
              display: true,
              text: 'Days'
            }
          }
        }
      }
    });
  }

  createFuelConsumptionChart() {
    const ctx = this.fuelConsumptionCanvas.nativeElement.getContext('2d');
    const currentData = this.tabSpecificData[this.activeTab as keyof typeof this.tabSpecificData]?.fuelConsumptionData || this.fuelConsumptionData;
    
    if (this.charts['fuelConsumption']) {
      this.charts['fuelConsumption'].destroy();
    }
    
    this.charts['fuelConsumption'] = new Chart(ctx, {
      type: 'doughnut' as ChartType,
      data: {
        labels: currentData.labels,
        datasets: [{
          data: currentData.data,
          backgroundColor: currentData.backgroundColor,
          borderColor: currentData.borderColor,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `HARBOUR VS AT SEA FUEL CONSUMPTION - ${this.activeTab}`,
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        }
      }
    });
  }

  createEngineExploitationFactorChart() {
    const ctx = this.engineExploitationFactorCanvas.nativeElement.getContext('2d');
    const currentData = this.tabSpecificData[this.activeTab as keyof typeof this.tabSpecificData]?.engineExploitationFactorData || this.engineExploitationFactorData;
    
    if (this.charts['engineExploitationFactor']) {
      this.charts['engineExploitationFactor'].destroy();
    }
    
    this.charts['engineExploitationFactor'] = new Chart(ctx, {
      type: 'bar' as ChartType,
      data: {
        labels: currentData.labels,
        datasets: currentData.datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `ENGINE EXPLOITATION FACTOR (EEF) - ${this.activeTab}`,
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Months'
            }
          },
          y: {
            beginAtZero: true,
            max: 2.6,
            ticks: {
              stepSize: 0.2
            },
            title: {
              display: true,
              text: 'EEF Value'
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }

  createDieselGeneratorUtilisationFactorChart() {
    const ctx = this.dieselGeneratorUtilisationFactorCanvas.nativeElement.getContext('2d');
    const currentData = this.dieselGeneratorUtilisationFactorData[this.activeTab as keyof typeof this.dieselGeneratorUtilisationFactorData];
    
    if (this.charts['dieselGeneratorUtilisationFactor']) {
      this.charts['dieselGeneratorUtilisationFactor'].destroy();
    }
    
    this.charts['dieselGeneratorUtilisationFactor'] = new Chart(ctx, {
      type: 'bar' as ChartType,
      data: {
        labels: currentData.labels,
        datasets: currentData.datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `DIESEL GENERATOR UTILISATION FACTOR (DGUF) - ${this.activeTab}`,
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Months'
            }
          },
          y: {
            beginAtZero: true,
            max: 9,
            ticks: {
              stepSize: 1
            },
            title: {
              display: true,
              text: 'DGUF Value'
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }

  createTopRunningHoursChart() {
    const ctx = this.topRunningHoursCanvas.nativeElement.getContext('2d');
    const currentData = this.topRunningHoursData[this.selectedRunningHoursView as keyof typeof this.topRunningHoursData];
    
    // Sort data by total hours (descending) and take top 8
    const sortedData = currentData
      .sort((a, b) => {
        const aHours = this.selectedRunningHoursView === 'monthly' ? 
          (a as any).total_hours_underway_month : (a as any).total_hours_underway_year;
        const bHours = this.selectedRunningHoursView === 'monthly' ? 
          (b as any).total_hours_underway_month : (b as any).total_hours_underway_year;
        return bHours - aHours;
      })
      .slice(0, 8);
    
    if (this.charts['topRunningHours']) {
      this.charts['topRunningHours'].destroy();
    }
    
    this.charts['topRunningHours'] = new Chart(ctx, {
      type: 'bar' as ChartType,
      data: {
        labels: sortedData.map(ship => ship.ship_name),
        datasets: [
          {
            label: this.selectedRunningHoursView === 'monthly' ? 'Total Hours Underway (Month)' : 'Total Hours Underway (Year)',
            data: sortedData.map(ship => this.selectedRunningHoursView === 'monthly' ? 
              (ship as any).total_hours_underway_month : (ship as any).total_hours_underway_year),
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 2,
            borderRadius: 4,
            yAxisID: 'y'
          },
          {
            label: 'Total Distance Run (km)',
            data: sortedData.map(ship => (ship as any).total_distance_run_month),
            backgroundColor: 'rgba(244, 63, 94, 0.8)',
            borderColor: 'rgba(244, 63, 94, 1)',
            borderWidth: 2,
            borderRadius: 4,
            yAxisID: 'y1'
          },
          {
            label: this.selectedRunningHoursView === 'monthly' ? 'Avg Hours Underway (Month)' : 'Avg Hours Underway (Year)',
            data: sortedData.map(ship => this.selectedRunningHoursView === 'monthly' ? 
              (ship as any).avg_hours_underway_month : (ship as any).avg_hours_underway_year),
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 2,
            borderRadius: 4,
            yAxisID: 'y2'
          },
          {
            label: 'Max Speed Recorded (knots)',
            data: sortedData.map(ship => (ship as any).max_speed_recorded),
            backgroundColor: 'rgba(168, 85, 247, 0.8)',
            borderColor: 'rgba(168, 85, 247, 1)',
            borderWidth: 2,
            borderRadius: 4,
            yAxisID: 'y3'
          },
          {
            label: 'Max Duration Recorded (hours)',
            data: sortedData.map(ship => (ship as any).max_duration_recorded),
            backgroundColor: 'rgba(245, 158, 11, 0.8)',
            borderColor: 'rgba(245, 158, 11, 1)',
            borderWidth: 2,
            borderRadius: 4,
            yAxisID: 'y4'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `TOP RUNNING HOURS - ${this.selectedRunningHoursView.toUpperCase()} VIEW`,
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Ships'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: this.selectedRunningHoursView === 'monthly' ? 'Total Hours Underway (Month)' : 'Total Hours Underway (Year)'
            },
            grid: {
              drawOnChartArea: false,
            },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Total Distance Run (km)'
            },
            grid: {
              drawOnChartArea: false,
            },
          },
          y2: {
            type: 'linear',
            display: false,
            title: {
              display: false,
              text: this.selectedRunningHoursView === 'monthly' ? 'Avg Hours Underway (Month)' : 'Avg Hours Underway (Year)'
            },
            grid: {
              drawOnChartArea: false,
            },
          },
          y3: {
            type: 'linear',
            display: false,
            title: {
              display: false,
              text: 'Max Speed Recorded (knots)'
            },
            grid: {
              drawOnChartArea: false,
            },
          },
          y4: {
            type: 'linear',
            display: false,
            title: {
              display: false,
              text: 'Max Duration Recorded (hours)'
            },
            grid: {
              drawOnChartArea: false,
            },
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }

  onRunningHoursViewChange() {
    this.createTopRunningHoursChart();
  }

  createAverageRunningHoursChart() {
    const ctx = this.averageRunningHoursCanvas.nativeElement.getContext('2d');
    
    // Sort data by average hours (descending) and take top 10
    const sortedData = this.averageRunningHoursData
      .sort((a, b) => b.avg_hours_underway_year - a.avg_hours_underway_year)
      .slice(0, 10);
    
    if (this.charts['averageRunningHours']) {
      this.charts['averageRunningHours'].destroy();
    }
    
    this.charts['averageRunningHours'] = new Chart(ctx, {
      type: 'bar' as ChartType,
      data: {
        labels: sortedData.map(ship => ship.ship_name),
        datasets: [
          {
            label: 'Average Hours Underway (Year)',
            data: sortedData.map(ship => ship.avg_hours_underway_year),
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 2,
            borderRadius: 4,
            yAxisID: 'y'
          },
          {
            label: 'Total Hours Underway (Year)',
            data: sortedData.map(ship => ship.total_hours_underway_year),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            borderRadius: 4,
            yAxisID: 'y1'
          },
          {
            label: 'Total Distance Run (km)',
            data: sortedData.map(ship => ship.total_distance_run_year),
            backgroundColor: 'rgba(244, 63, 94, 0.8)',
            borderColor: 'rgba(244, 63, 94, 1)',
            borderWidth: 2,
            borderRadius: 4,
            yAxisID: 'y2'
          },
          {
            label: 'Average Distance per Day (km)',
            data: sortedData.map(ship => ship.avg_distance_per_day),
            backgroundColor: 'rgba(168, 85, 247, 0.8)',
            borderColor: 'rgba(168, 85, 247, 1)',
            borderWidth: 2,
            borderRadius: 4,
            yAxisID: 'y3'
          },
          {
            label: 'Efficiency Rating (%)',
            data: sortedData.map(ship => ship.efficiency_rating),
            backgroundColor: 'rgba(245, 158, 11, 0.8)',
            borderColor: 'rgba(245, 158, 11, 1)',
            borderWidth: 2,
            borderRadius: 4,
            yAxisID: 'y4'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'AVERAGE RUNNING HOURS (YEARLY BASIS)',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Ships'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Average Hours Underway (Year)'
            },
            min: 0,
            max: 25,
            ticks: {
              stepSize: 5
            },
            grid: {
              drawOnChartArea: false,
            },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Total Hours Underway (Year)'
            },
            min: 0,
            max: 9000,
            ticks: {
              stepSize: 1000
            },
            grid: {
              drawOnChartArea: false,
            },
          },
          y2: {
            type: 'linear',
            display: false,
            title: {
              display: false,
              text: 'Total Distance Run (km)'
            },
            grid: {
              drawOnChartArea: false,
            },
          },
          y3: {
            type: 'linear',
            display: false,
            title: {
              display: false,
              text: 'Average Distance per Day (km)'
            },
            grid: {
              drawOnChartArea: false,
            },
          },
          y4: {
            type: 'linear',
            display: false,
            title: {
              display: false,
              text: 'Efficiency Rating (%)'
            },
            grid: {
              drawOnChartArea: false,
            },
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }

  // Stats card methods
  getTotalShips(): number {
    // Always return the ships count for the current active tab
    return this.dgufDetailedData[this.activeTab as keyof typeof this.dgufDetailedData]?.length || 0;
  }

  getCommandShipsCount(): number {
    return this.dgufDetailedData[this.activeTab as keyof typeof this.dgufDetailedData]?.length || 0;
  }

  getAvgRunningHours(): string {
    const ships = this.dgufDetailedData[this.activeTab as keyof typeof this.dgufDetailedData] || [];
    if (ships.length === 0) return '0.0';
    
    const totalAvg = ships.reduce((sum, ship) => sum + ship.avg_rh_at_sea, 0);
    return (totalAvg / ships.length).toFixed(1);
  }

  getMaxRunningHours(): string {
    const ships = this.dgufDetailedData[this.activeTab as keyof typeof this.dgufDetailedData] || [];
    if (ships.length === 0) return '0.0';
    
    const maxRh = Math.max(...ships.map(ship => ship.max_rh_at_sea));
    return maxRh.toFixed(1);
  }

  // Command Ships Stats Methods
  getTotalRHAtSea(): string {
    const ships = this.dgufDetailedData[this.activeTab as keyof typeof this.dgufDetailedData] || [];
    if (ships.length === 0) return '0';
    
    const total = ships.reduce((sum, ship) => sum + ship.total_rh_at_sea, 0);
    return total.toFixed(0);
  }

  getTotalRHAtPort(): string {
    const ships = this.dgufDetailedData[this.activeTab as keyof typeof this.dgufDetailedData] || [];
    if (ships.length === 0) return '0';
    
    const total = ships.reduce((sum, ship) => sum + ship.total_rh_at_port, 0);
    return total.toFixed(0);
  }

  getTotalRHInMonth(): string {
    const ships = this.dgufDetailedData[this.activeTab as keyof typeof this.dgufDetailedData] || [];
    if (ships.length === 0) return '0';
    
    const total = ships.reduce((sum, ship) => sum + ship.total_rh_in_month, 0);
    return total.toFixed(0);
  }

  getAvgRHAtSea(): string {
    const ships = this.dgufDetailedData[this.activeTab as keyof typeof this.dgufDetailedData] || [];
    if (ships.length === 0) return '0.0';
    
    const totalAvg = ships.reduce((sum, ship) => sum + ship.avg_rh_at_sea, 0);
    return (totalAvg / ships.length).toFixed(1);
  }

  // Ship Performance Stats Methods
  getTotalHours(): string {
    const tabData = this.tabSpecificData[this.activeTab as keyof typeof this.tabSpecificData]?.shipPerformanceData;
    const currentData = tabData ? tabData[this.selectedView as keyof typeof tabData] : this.shipPerformanceData[this.selectedView as keyof typeof this.shipPerformanceData];
    const total = currentData.reduce((sum, ship) => sum + ship.total_hours_month, 0);
    return total.toFixed(0);
  }

  getTotalDistance(): string {
    const tabData = this.tabSpecificData[this.activeTab as keyof typeof this.tabSpecificData]?.shipPerformanceData;
    const currentData = tabData ? tabData[this.selectedView as keyof typeof tabData] : this.shipPerformanceData[this.selectedView as keyof typeof this.shipPerformanceData];
    const total = currentData.reduce((sum, ship) => sum + ship.total_distance_month, 0);
    return total.toFixed(0);
  }

  getAverageHours(): string {
    const tabData = this.tabSpecificData[this.activeTab as keyof typeof this.tabSpecificData]?.shipPerformanceData;
    const currentData = tabData ? tabData[this.selectedView as keyof typeof tabData] : this.shipPerformanceData[this.selectedView as keyof typeof this.shipPerformanceData];
    const total = currentData.reduce((sum, ship) => sum + ship.avg_hours_month, 0);
    return (total / currentData.length).toFixed(1);
  }

  getMaxSpeed(): string {
    const tabData = this.tabSpecificData[this.activeTab as keyof typeof this.tabSpecificData]?.shipPerformanceData;
    const currentData = tabData ? tabData[this.selectedView as keyof typeof tabData] : this.shipPerformanceData[this.selectedView as keyof typeof this.shipPerformanceData];
    const maxSpeed = Math.max(...currentData.map(ship => ship.max_speed));
    return maxSpeed.toFixed(0);
  }

  // Fleet Composition Stats Methods
  getTotalFleet(): number {
    const tabData = this.tabSpecificData[this.activeTab as keyof typeof this.tabSpecificData]?.fleetData;
    const currentData = tabData || this.fleetData;
    return currentData.datasets.reduce((total, dataset) => total + dataset.data[dataset.data.length - 1], 0);
  }

  getAircraftCarriers(): number {
    const tabData = this.tabSpecificData[this.activeTab as keyof typeof this.tabSpecificData]?.fleetData;
    const currentData = tabData || this.fleetData;
    return currentData.datasets[0].data[currentData.datasets[0].data.length - 1];
  }

  getDestroyersFrigates(): number {
    const tabData = this.tabSpecificData[this.activeTab as keyof typeof this.tabSpecificData]?.fleetData;
    const currentData = tabData || this.fleetData;
    return currentData.datasets[1].data[currentData.datasets[1].data.length - 1];
  }

  getSubmarines(): number {
    const tabData = this.tabSpecificData[this.activeTab as keyof typeof this.tabSpecificData]?.fleetData;
    const currentData = tabData || this.fleetData;
    return currentData.datasets[2]?.data[currentData.datasets[2].data.length - 1] || 0;
  }

  // Bottom Charts Stats Methods
  getShipsInCommission(): number {
    return this.shipsInCommission.data.reduce((sum, count) => sum + count, 0);
  }

  getOperationalCount(): number {
    return this.operationalAvailability.data[0]; // OPS ships
  }

  getMaxDaysAtSea(): number {
    return Math.max(...this.daysAtSea.data);
  }

  // Operational Readiness Stats Methods
  getTotalOperationalReady(): number {
    return this.operationalReadinessData.datasets[0].data.reduce((sum, value) => sum + value, 0);
  }

  getTotalMaintenance(): number {
    return this.operationalReadinessData.datasets[1].data.reduce((sum, value) => sum + value, 0);
  }

  getTotalMNR(): number {
    return this.operationalReadinessData.datasets[2].data.reduce((sum, value) => sum + value, 0);
  }

  getTotalShipsInReadiness(): number {
    return this.operationalReadinessData.labels.length;
  }

  getAverageOperationalReady(): string {
    const total = this.getTotalOperationalReady();
    const shipCount = this.getTotalShipsInReadiness();
    return (total / shipCount).toFixed(1);
  }
}
