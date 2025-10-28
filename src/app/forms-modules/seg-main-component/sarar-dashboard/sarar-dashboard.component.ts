// etma-dashboard.component.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-sarar-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './sarar-dashboard.component.html',
  styleUrls: ['./sarar-dashboard.component.css']
})
export class SararDashboardComponent implements OnInit {
  @ViewChild('loadTrialCanvas') loadTrialCanvas!: ElementRef;
  @ViewChild('insulationResistanceCanvas') insulationResistanceCanvas!: ElementRef;
  @ViewChild('protectionCheckCanvas') protectionCheckCanvas!: ElementRef;
  @ViewChild('calibrationStatusCanvas') calibrationStatusCanvas!: ElementRef;
  @ViewChild('temperatureRiseCanvas') temperatureRiseCanvas!: ElementRef;
  @ViewChild('turnaroundTimeCanvas') turnaroundTimeCanvas!: ElementRef;

  chartsLoaded = false;
  currentDate = new Date().toLocaleDateString('en-US', { 
    day: '2-digit', 
    month: 'short', 
    year: '2-digit' 
  }).toUpperCase();

  // Trial Monitoring Data
  ongoingTrialsCount = 12;
  ongoingTrialsChange = 8;
  completedTrialsCount = 45;
  completedTrialsChange = 15;
  pendingApprovalCount = 7;
  pendingApprovalChange = -5;

  // System Performance Data
  systemPerformance = [
    {
      name: 'Gas Turbine Generator (GTG)',
      description: 'Primary power generation system',
      status: 'Optimal',
      efficiency: 94
    },
    {
      name: 'Automatic Voltage Regulator (AVR)',
      description: 'Voltage stabilization system',
      status: 'Satisfactory',
      efficiency: 87
    },
    {
      name: 'Main Switchboard',
      description: 'Primary power distribution',
      status: 'Optimal',
      efficiency: 96
    },
    {
      name: 'Emergency Generator',
      description: 'Backup power system',
      status: 'Needs Attention',
      efficiency: 72
    }
  ];

  // Trial Alerts Data
  trialAlerts = [
    {
      trialId: 'ET-TR-2024-015',
      description: 'Voltage fluctuation exceeds 5% threshold during load test',
      system: 'GTG-2',
      deviation: 7.2,
      severity: 'High',
      date: '24 May 2024'
    },
    {
      trialId: 'ET-TR-2024-023',
      description: 'Insulation resistance below minimum acceptable value',
      system: 'Switchboard-A',
      deviation: 12.5,
      severity: 'Medium',
      date: '22 May 2024'
    },
    {
      trialId: 'ET-TR-2024-031',
      description: 'Temperature rise exceeds design limits',
      system: 'AVR-1',
      deviation: 8.7,
      severity: 'Medium',
      date: '20 May 2024'
    },
    {
      trialId: 'ET-TR-2024-042',
      description: 'Protection relay response time delayed',
      system: 'Emergency Panel',
      deviation: 15.3,
      severity: 'High',
      date: '18 May 2024'
    }
  ];

  // Load Trial Data
  loadTrialData = {
    labels: ['25%', '50%', '75%', '100%', '110%', '125%'],
    datasets: [
      {
        label: 'Frequency Variation (%)',
        data: [0.2, 0.5, 0.8, 1.2, 1.8, 2.5],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        yAxisID: 'y'
      },
      {
        label: 'Voltage Variation (%)',
        data: [0.8, 1.2, 1.8, 2.5, 3.2, 4.1],
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 2,
        yAxisID: 'y1'
      }
    ]
  };

  // Insulation Resistance Data
  insulationResistanceData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'Generator (MΩ)',
        data: [520, 515, 510, 508, 505, 502],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4
      },
      {
        label: 'Switchboard (MΩ)',
        data: [480, 475, 470, 465, 460, 455],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4
      },
      {
        label: 'Cable (MΩ)',
        data: [450, 445, 440, 435, 430, 425],
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4
      },
      {
        label: 'Breaker (MΩ)',
        data: [500, 495, 490, 485, 480, 475],
        backgroundColor: 'rgba(236, 72, 153, 0.8)',
        borderColor: 'rgba(236, 72, 153, 1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4
      }
    ]
  };

  // Protection Check Compliance Data
  protectionCheckData = {
    labels: ['Overcurrent', 'Earth Fault', 'Differential', 'Under Voltage', 'Over Voltage', 'Reverse Power'],
    datasets: [
      {
        label: 'Satisfactory',
        data: [95, 92, 88, 96, 94, 90],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2
      },
      {
        label: 'Unsatisfactory',
        data: [5, 8, 12, 4, 6, 10],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2
      }
    ]
  };

  // Calibration Status Data
  calibrationStatusData = {
    labels: ['Voltmeters', 'Ammeters', 'Frequency Meters', 'Power Meters', 'Temperature Sensors', 'Pressure Gauges'],
    datasets: [
      {
        label: 'Calibrated',
        data: [45, 38, 42, 35, 48, 40],
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 2
      },
      {
        label: 'Pending',
        data: [5, 12, 8, 15, 2, 10],
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 2
      }
    ]
  };

  // Temperature Rise Analysis Data
  temperatureRiseData = {
    labels: ['Trial 1', 'Trial 2', 'Trial 3', 'Trial 4', 'Trial 5', 'Trial 6', 'Trial 7'],
    datasets: [
      {
        label: 'Ambient Temperature (°C)',
        data: [32, 31, 33, 30, 32, 31, 33],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4
      },
      {
        label: 'Rise Temperature (°C)',
        data: [45, 48, 52, 47, 49, 51, 53],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4
      }
    ]
  };

  // Trial Turnaround Time Data
  turnaroundTimeData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Average Duration (Days)',
        data: [14, 12, 11, 10, 9, 8, 9, 8, 7, 8, 9, 8],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: 'rgba(34, 211, 238, 1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4
      }
    ]
  };

  charts: { [key: string]: Chart } = {};

  ngOnInit() {
    setTimeout(() => {
      this.initializeCharts();
    }, 300);
  }

  initializeCharts() {
    try {
      this.createLoadTrialChart();
      this.createInsulationResistanceChart();
      this.createProtectionCheckChart();
      this.createCalibrationStatusChart();
      this.createTemperatureRiseChart();
      this.createTurnaroundTimeChart();
      
      setTimeout(() => {
        this.chartsLoaded = true;
      }, 200);
    } catch (error) {
      console.warn('Some charts could not be initialized:', error);
    }
  }

  createLoadTrialChart() {
    const ctx = this.loadTrialCanvas.nativeElement.getContext('2d');
    
    this.charts['loadTrial'] = new Chart(ctx, {
      type: 'bar' as ChartType,
      data: this.loadTrialData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'LOAD TRIAL SUMMARY',
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
              text: 'Load (%)',
              font: { weight: 'bold' }
            }
          },
          y: {
            type: 'linear',
            position: 'left',
            title: {
              display: true,
              text: 'Frequency Variation (%)',
              font: { weight: 'bold' }
            }
          },
          y1: {
            type: 'linear',
            position: 'right',
            title: {
              display: true,
              text: 'Voltage Variation (%)',
              font: { weight: 'bold' }
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
  }

  createInsulationResistanceChart() {
    const ctx = this.insulationResistanceCanvas.nativeElement.getContext('2d');
    
    this.charts['insulationResistance'] = new Chart(ctx, {
      type: 'line' as ChartType,
      data: this.insulationResistanceData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'INSULATION RESISTANCE TRENDS',
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
              text: 'Time Period',
              font: { weight: 'bold' }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Resistance (MΩ)',
              font: { weight: 'bold' }
            }
          }
        }
      }
    });
  }

  createProtectionCheckChart() {
    const ctx = this.protectionCheckCanvas.nativeElement.getContext('2d');
    
    this.charts['protectionCheck'] = new Chart(ctx, {
      type: 'bar' as ChartType,
      data: this.protectionCheckData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'PROTECTION CHECK COMPLIANCE',
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
            stacked: true,
            title: {
              display: true,
              text: 'Protection Type',
              font: { weight: 'bold' }
            }
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: 'Percentage (%)',
              font: { weight: 'bold' }
            },
            min: 0,
            max: 100
          }
        }
      }
    });
  }

  createCalibrationStatusChart() {
    const ctx = this.calibrationStatusCanvas.nativeElement.getContext('2d');
    
    this.charts['calibrationStatus'] = new Chart(ctx, {
      type: 'bar' as ChartType,
      data: this.calibrationStatusData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'INSTRUMENTATION CALIBRATION STATUS',
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
              text: 'Instrument Type',
              font: { weight: 'bold' }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Number of Instruments',
              font: { weight: 'bold' }
            }
          }
        }
      }
    });
  }

  createTemperatureRiseChart() {
    const ctx = this.temperatureRiseCanvas.nativeElement.getContext('2d');
    
    this.charts['temperatureRise'] = new Chart(ctx, {
      type: 'line' as ChartType,
      data: this.temperatureRiseData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'TEMPERATURE RISE ANALYSIS',
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
              text: 'Trial Number',
              font: { weight: 'bold' }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Temperature (°C)',
              font: { weight: 'bold' }
            }
          }
        }
      }
    });
  }

  createTurnaroundTimeChart() {
    const ctx = this.turnaroundTimeCanvas.nativeElement.getContext('2d');
    
    this.charts['turnaroundTime'] = new Chart(ctx, {
      type: 'line' as ChartType,
      data: this.turnaroundTimeData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'TRIAL TURNAROUND TIME',
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
              text: 'Month',
              font: { weight: 'bold' }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Average Duration (Days)',
              font: { weight: 'bold' }
            }
          }
        }
      }
    });
  }
}