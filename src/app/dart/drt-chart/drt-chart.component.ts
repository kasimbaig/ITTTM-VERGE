import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

@Component({
  selector: 'app-drt-chart',
  imports: [CommonModule],
  templateUrl: './drt-chart.component.html',
  styleUrl: './drt-chart.component.css'
})
export class DrtChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('defectsRaisedChart', { static: false }) defectsRaisedChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('daysAtSeaChart', { static: false }) daysAtSeaChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('totalDartsChart', { static: false }) totalDartsChart!: ElementRef<HTMLCanvasElement>;

  selectedFilter = 'ALL';
  filters = ['ALL', 'WNC', 'ENC', 'SNC', 'ANC'];

  // Chart instances
  defectsChart: Chart | null = null;
  daysChart: Chart | null = null;
  dartsChart: Chart | null = null;

  // Dummy data for Defects Raised (Area Chart)
  defectsRaisedData = {
    labels: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
    data: [65420, 68930, 72150, 79480, 88620, 45230, 69870, 85340, 124560, 198750, 61430]
  };

  // Dummy data for Days at Sea vs Average No. of Defect Darts (Line Chart)
  daysAtSeaData = {
    labels: ['50Days', '100Days', '150Days', '200Days', '250Days', '300Days', '350Days', '400Days'],
    datasets: {
      hull: [215, 520, 265, 145, 95, 55, 32, 18],
      electrical: [465, 1520, 1180, 580, 450, 1820, 1350, 920],
      engineering: [920, 980, 870, 340, 235, 175, 125, 68],
      nbcd: [62, 95, 145, 225, 205, 185, 165, 140]
    }
  };

  // Dummy data for Total Darts Shipwise (Stacked Bar Chart)
  shipwiseData = {
    labels: [
      'INS KOS', 'INS VIK', 'INS KEB', 'INS TAL', 'INS DEL', 'INS VIR', 'INS JAD', 'INS BRA',
      'INS CHE', 'INS KUL', 'INS BET', 'INS KUT', 'INS JAL', 'INS TAR', 'INS KOL', 'INS KAR',
      'INS TEG', 'INS MYS', 'INS SUT', 'INS LCU', 'INS CHE', 'INS TRI', 'INS MAK', 'INS PRA',
      'INS PRA', 'INS KAM', 'INS RAN', 'INS SHA', 'INS TRI', 'INS MOR', 'INS KIL', 'INS JUP',
      'INS KOL', 'INS SAR', 'INS SAT', 'INS ADI', 'INS SHI', 'INS SAR', 'INS VIR', 'INS VAG',
      'INS SAH', 'INS LCU', 'INS LCU', 'INS TIR', 'INS LOU', 'INS SHA', 'INS INV', 'INS TOR'
    ],
    hull: [1320, 1180, 1125, 1080, 1025, 975, 920, 865, 810, 765, 705, 655, 595, 545, 485, 435, 380, 325, 275, 220, 195, 175, 155, 135, 115, 98, 87, 76, 66, 56, 49, 44, 38, 33, 27, 22, 19, 17, 15, 13, 11, 9, 7, 6, 5, 4, 3, 2],
    electrical: [865, 815, 760, 710, 655, 600, 545, 490, 435, 380, 325, 270, 220, 195, 175, 155, 130, 110, 98, 87, 76, 66, 55, 49, 44, 38, 33, 27, 22, 19, 17, 15, 13, 11, 9, 7, 6, 5, 4, 3, 2, 2, 2, 2, 2, 2, 2, 2],
    engineering: [655, 635, 610, 590, 565, 545, 520, 500, 475, 455, 430, 410, 390, 370, 345, 325, 305, 280, 260, 240, 215, 195, 175, 155, 130, 110, 98, 87, 76, 66, 55, 49, 44, 38, 33, 27, 22, 19, 17, 15, 13, 11, 9, 7, 6, 5, 4, 3],
    nbcd: [220, 195, 175, 155, 130, 110, 98, 87, 76, 66, 55, 49, 44, 38, 33, 27, 22, 19, 17, 15, 13, 11, 9, 7, 6, 5, 4, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
  };

  ngOnInit() {
    // Component initialization
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.createDefectsRaisedChart();
      this.createDaysAtSeaChart();
      this.createTotalDartsChart();
    }, 100);
  }

  selectFilter(filter: string) {
    this.selectedFilter = filter;
    // Here you would typically filter the data based on the selected filter
    this.updateCharts();
  }

  private updateCharts() {
    // Update charts based on selected filter
    // For now, just refresh with the same data
    this.createDefectsRaisedChart();
    this.createDaysAtSeaChart();
    this.createTotalDartsChart();
  }

  private createDefectsRaisedChart() {
    if (this.defectsChart) {
      this.defectsChart.destroy();
    }

    const ctx = this.defectsRaisedChart.nativeElement.getContext('2d');
    if (!ctx) return;

    this.defectsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.defectsRaisedData.labels,
        datasets: [{
          label: 'Maintenance Issues',
          data: this.defectsRaisedData.data,
          borderColor: '#10B981',  // Changed to emerald green
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          borderWidth: 3,
          pointStyle: 'rectRot'  // Changed point style to rotated square
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Naval Fleet Defect Trends',
            font: { size: 16, weight: 'bold', family: 'Segoe UI' },
            padding: { bottom: 15 },
            color: '#1e293b'
          },
          subtitle: {
            display: true,
            text: 'Annual Analysis & Evolution',
            font: { size: 12, family: 'Segoe UI' },
            color: '#64748b',
            padding: { bottom: 20 }
          },
          legend: {
            display: true,
            position: 'top',
            align: 'center',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 20,
              font: {
                size: 12,
                weight: 500,
                family: 'Segoe UI'
              },
              color: '#374151'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#1e293b',
            bodyColor: '#374151',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            titleFont: { size: 13, weight: 'bold' },
            bodyFont: { size: 12 }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Reporting Period',
              font: { size: 13, weight: 600, family: 'Segoe UI' },
              color: '#374151'
            },
            grid: {
              display: true,
              color: 'rgba(148, 163, 184, 0.2)',
            },
            ticks: {
              color: '#64748b',
              font: { size: 11, family: 'Segoe UI' }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Total Defects',
              font: { size: 13, weight: 600, family: 'Segoe UI' },
              color: '#374151'
            },
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(148, 163, 184, 0.2)',
            },
            ticks: {
              color: '#64748b',
              font: { size: 11, family: 'Segoe UI' }
            }
          }
        }
      }
    });
  }

  private createDaysAtSeaChart() {
    if (this.daysChart) {
      this.daysChart.destroy();
    }

    const ctx = this.daysAtSeaChart.nativeElement.getContext('2d');
    if (!ctx) return;

    this.daysChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.daysAtSeaData.labels,
        datasets: [
          {
            label: 'Hull Systems',
            data: this.daysAtSeaData.datasets.hull,
            backgroundColor: 'rgba(147, 51, 234, 0.1)',  // Purple
            borderColor: '#9333EA',
            pointBackgroundColor: '#9333EA',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 3,
            tension: 0.3,
            fill: true,
            pointStyle: 'triangle'  // Triangle points
          },
          {
            label: 'Power Systems',
            data: this.daysAtSeaData.datasets.electrical,
            backgroundColor: 'rgba(236, 72, 153, 0.1)',  // Pink
            borderColor: '#EC4899',
            pointBackgroundColor: '#EC4899',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 3,
            tension: 0.3,
            fill: true,
            pointStyle: 'rect'  // Square points
          },
          {
            label: 'Propulsion',
            data: this.daysAtSeaData.datasets.engineering,
            backgroundColor: 'rgba(14, 165, 233, 0.1)',  // Sky blue
            borderColor: '#0EA5E9',
            pointBackgroundColor: '#0EA5E9',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 3,
            tension: 0.3,
            fill: true,
            pointStyle: 'star'  // Star points
          },
          {
            label: 'Safety Systems',
            data: this.daysAtSeaData.datasets.nbcd,
            backgroundColor: 'rgba(234, 88, 12, 0.1)',  // Orange
            borderColor: '#EA580C',
            pointBackgroundColor: '#EA580C',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 3,
            tension: 0.3,
            fill: true,
            pointStyle: 'circle'  // Circle points
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          title: {
            display: true,
            text: 'Operational Impact Analysis',
            font: { size: 16, weight: 'bold', family: 'Segoe UI' },
            padding: { bottom: 15 },
            color: '#1e293b'
          },
          subtitle: {
            display: true,
            text: 'Correlation: Sea Time vs Technical Issues',
            font: { size: 12, family: 'Segoe UI' },
            color: '#64748b',
            padding: { bottom: 20 }
          },
          legend: {
            display: true,
            position: 'top',
            align: 'center',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 20,
              font: {
                size: 12,
                
                family: 'Segoe UI'
              },
              color: '#374151'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#1e293b',
            bodyColor: '#374151',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            titleFont: { size: 13, weight: 'bold' },
            bodyFont: { size: 12 }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Operational Duration',
              font: { size: 13,  family: 'Segoe UI' },
              color: '#374151'
            },
            grid: {
              display: true,
              color: 'rgba(148, 163, 184, 0.2)',
             
            },
            ticks: {
              color: '#64748b',
              font: { size: 11, family: 'Segoe UI' }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Technical Incidents',
              font: { size: 13,  family: 'Segoe UI' },
              color: '#374151'
            },
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(148, 163, 184, 0.2)',
              
            },
            ticks: {
              color: '#64748b',
              font: { size: 11, family: 'Segoe UI' }
            }
          }
        }
      }
    });
  }

  private createTotalDartsChart() {
    if (this.dartsChart) {
      this.dartsChart.destroy();
    }

    const ctx = this.totalDartsChart.nativeElement.getContext('2d');
    if (!ctx) return;

    this.dartsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.shipwiseData.labels,
        datasets: [
          {
            label: 'HULL',
            data: this.shipwiseData.hull,
            backgroundColor: '#6366F1',  // Indigo
            borderColor: '#4F46E5',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'ELECTRICAL',
            data: this.shipwiseData.electrical,
            backgroundColor: '#F43F5E',  // Rose
            borderColor: '#E11D48',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'ENGINEERING',
            data: this.shipwiseData.engineering,
            backgroundColor: '#06B6D4',  // Cyan
            borderColor: '#0891B2',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'NBCD',
            data: this.shipwiseData.nbcd,
            backgroundColor: '#FB923C',  // Orange
            borderColor: '#F97316',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'TOTAL DEFECTS SHIPWISE',
            font: { size: 16, weight: 'bold', family: 'Segoe UI' },
            padding: { bottom: 15 },
            color: '#1e293b'
          },
          subtitle: {
            display: true,
            text: 'PAN NAVY | 29-5-2024 TO 29-5-2025',
            font: { size: 12, family: 'Segoe UI' },
            color: '#64748b',
            padding: { bottom: 20 }
          },
          legend: {
            display: true,
            position: 'top',
            align: 'center',
            labels: {
              usePointStyle: true,
              pointStyle: 'rect',
              padding: 20,
              font: {
                size: 12,
                weight: 500,
                family: 'Segoe UI'
              },
              color: '#374151'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#1e293b',
            bodyColor: '#374151',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            titleFont: { size: 13, weight: 'bold' },
            bodyFont: { size: 12 }
          }
        },
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: 'Ships',
              font: { size: 13, weight: 600, family: 'Segoe UI' },
              color: '#374151'
            },
            ticks: {
              maxRotation: 90,
              minRotation: 45,
              color: '#64748b',
              font: { size: 10, family: 'Segoe UI' }
            },
            grid: {
              display: false
            }
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: 'Total Defects',
              font: { size: 13, weight: 600, family: 'Segoe UI' },
              color: '#374151'
            },
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(148, 163, 184, 0.2)',
              
            },
            ticks: {
              color: '#64748b',
              font: { size: 11, family: 'Segoe UI' }
            }
          }
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.defectsChart) this.defectsChart.destroy();
    if (this.daysChart) this.daysChart.destroy();
    if (this.dartsChart) this.dartsChart.destroy();
  }
}
