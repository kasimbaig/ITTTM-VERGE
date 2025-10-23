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
    data: [78240, 72560, 74608, 80910, 84734, 41568, 73425, 82834, 117584, 190276, 53210]
  };

  // Dummy data for Days at Sea vs Average No. of Defect Darts (Line Chart)
  daysAtSeaData = {
    labels: ['50Days', '100Days', '150Days', '200Days', '250Days', '300Days', '350Days', '400Days'],
    datasets: {
      hull: [197, 500, 239, 120, 80, 45, 25, 10],
      electrical: [432, 1400, 1050, 500, 400, 1700, 1200, 800],
      engineering: [850, 900, 800, 300, 200, 150, 100, 50],
      nbcd: [50, 80, 120, 200, 180, 160, 140, 120]
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
    hull: [1200, 1100, 1050, 1000, 950, 900, 850, 800, 750, 700, 650, 600, 550, 500, 450, 400, 350, 300, 250, 200, 180, 160, 140, 120, 100, 90, 80, 70, 60, 50, 45, 40, 35, 30, 25, 20, 18, 16, 14, 12, 10, 8, 6, 5, 4, 3, 2, 1],
    electrical: [800, 750, 700, 650, 600, 550, 500, 450, 400, 350, 300, 250, 200, 180, 160, 140, 120, 100, 90, 80, 70, 60, 50, 45, 40, 35, 30, 25, 20, 18, 16, 14, 12, 10, 8, 6, 5, 4, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1],
    engineering: [600, 580, 560, 540, 520, 500, 480, 460, 440, 420, 400, 380, 360, 340, 320, 300, 280, 260, 240, 220, 200, 180, 160, 140, 120, 100, 90, 80, 70, 60, 50, 45, 40, 35, 30, 25, 20, 18, 16, 14, 12, 10, 8, 6, 5, 4, 3, 2],
    nbcd: [200, 180, 160, 140, 120, 100, 90, 80, 70, 60, 50, 45, 40, 35, 30, 25, 20, 18, 16, 14, 12, 10, 8, 6, 5, 4, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
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
          label: 'Total Dart',
          data: this.defectsRaisedData.data,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#2563eb',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'DEFECTS RAISED',
            font: { size: 16, weight: 'bold', family: 'Segoe UI' },
            padding: { bottom: 15 },
            color: '#1e293b'
          },
          subtitle: {
            display: true,
            text: 'PAN NAVY',
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
              text: 'Years',
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
            label: 'HULL',
            data: this.daysAtSeaData.datasets.hull,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: '#3b82f6',
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 3,
            tension: 0.4,
            fill: false
          },
          {
            label: 'ELECTRICAL',
            data: this.daysAtSeaData.datasets.electrical,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: '#ef4444',
            pointBackgroundColor: '#ef4444',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 3,
            tension: 0.4,
            fill: false
          },
          {
            label: 'ENGINEERING',
            data: this.daysAtSeaData.datasets.engineering,
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderColor: '#f59e0b',
            pointBackgroundColor: '#f59e0b',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 3,
            tension: 0.4,
            fill: false
          },
          {
            label: 'NBCD',
            data: this.daysAtSeaData.datasets.nbcd,
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: '#10b981',
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 3,
            tension: 0.4,
            fill: false
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
            text: 'DAYS AT SEA VS AVERAGE NO. OF DEFECT DARTS',
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
              text: 'Days at Sea',
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
              text: 'Average No. of Defect Darts',
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
            backgroundColor: '#3b82f6',
            borderColor: '#3b82f6',
            borderWidth: 1
          },
          {
            label: 'ELECTRICAL',
            data: this.shipwiseData.electrical,
            backgroundColor: '#ef4444',
            borderColor: '#ef4444',
            borderWidth: 1
          },
          {
            label: 'ENGINEERING',
            data: this.shipwiseData.engineering,
            backgroundColor: '#f59e0b',
            borderColor: '#f59e0b',
            borderWidth: 1
          },
          {
            label: 'NBCD',
            data: this.shipwiseData.nbcd,
            backgroundColor: '#10b981',
            borderColor: '#10b981',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'TOTAL DARTS SHIPWISE',
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
              text: 'Total Darts',
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
