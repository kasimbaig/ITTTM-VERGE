// src/app/features/dashboard/defect-list/defect-list.component.ts
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Observable, of } from 'rxjs';
// Commented out API service - using static data instead
// import { ChartData, DefectListService } from '../../../shared/services/defect/defect-list.service';
// Static data imports
import {
  STATIC_DEFECT_LIST_DATA,
  STATIC_DEFECT_DETAILS,
  StaticDefectListData,
  StaticDefectDetail
} from '../dashboard-static-data';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
  }[];
}

@Component({
  selector: 'app-defect-list',
  standalone: false,
  templateUrl: './defect-list.component.html',
  styleUrls: ['./defect-list.component.css']
})
export class DefectListComponent implements OnInit, OnChanges {
  // Inputs will now only *receive* values, not trigger fetches
  @Input() command: number | null = null;
  @Input() ship: number | null = null;
  @Input() dept: number | null = null;
  // @Input() dateRange: Date[] | undefined; // Removed as per your request

  chartData: ChartData | undefined;
  chartOptions: any;
  details: any[] = [];
  dialogVisible = false;

  loading$: Observable<boolean> = of(false); // Static data doesn't need loading

  constructor() {} // Removed service dependency

  ngOnInit(): void {
    // Load static data immediately on initialization
    this.loadStaticData();
  }

  loadStaticData(): void {
    // Use centralized static data
    this.chartData = STATIC_DEFECT_LIST_DATA as ChartData;

    // Set chart options
    this.chartOptions = {
      responsive: true,
      aspectRatio: 0.8,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          align: 'start',
          labels: { 
            usePointStyle: true, 
            boxWidth: 6,
            font: {
              family: 'Segoe UI',
              size: 12
            },
            padding: 20
          }
        },
        tooltip: { 
          mode: 'index', 
          intersect: false,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#1e293b',
          bodyColor: '#374151',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            size: 13
          },
          displayColors: true
        },
        title: {
          display: true,
          text: 'Naval Defect Distribution Analysis',
          color: '#1e293b',
          font: {
            size: 16,
            weight: 'bold',
            family: 'Segoe UI'
          },
          padding: { bottom: 20 }
        },
        subtitle: {
          display: true,
          text: 'System-wise Breakdown & Categorization',
          color: '#64748b',
          font: {
            size: 13,
            family: 'Segoe UI'
          },
          padding: { bottom: 20 }
        }
      },
      scales: {
        x: { 
          grid: { display: false },
          title: {
            display: true,
            text: 'System Categories',
            color: '#4b5563',
            font: {
              size: 12,
              weight: 'bold',
              family: 'Segoe UI'
            }
          },
          ticks: {
            color: '#6b7280',
            font: {
              size: 11,
              family: 'Segoe UI'
            }
          }
        },
        y: { 
          beginAtZero: true, 
          grid: { 
            color: 'rgba(148, 163, 184, 0.1)',
            drawBorder: false
          },
          title: {
            display: true,
            text: 'Number of Defects',
            color: '#4b5563',
            font: {
              size: 12,
              weight: 'bold',
              family: 'Segoe UI'
            }
          },
          ticks: {
            color: '#6b7280',
            font: {
              size: 11,
              family: 'Segoe UI'
            },
           callback: function (value: string | number): string | number | null {
  const num = Number(value);
  if (Math.floor(num) === num) {
    return num;
  }
  return null;
},
          }
        }
      },
      elements: {
        bar: {
          borderRadius: 6,
          borderSkipped: false,
          borderWidth: 1,
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',  // Indigo
            'rgba(236, 72, 153, 0.8)',   // Pink
            'rgba(14, 165, 233, 0.8)',   // Sky blue
            'rgba(245, 158, 11, 0.8)',   // Amber
            'rgba(16, 185, 129, 0.8)',   // Emerald
            'rgba(168, 85, 247, 0.8)',   // Purple
          ]
        }
      },
      layout: { 
        padding: { 
          top: 20,
          right: 20,
          bottom: 20,
          left: 20
        }
      },
      animation: {
        duration: 2000,
        easing: 'easeInOutQuart'
      }
    };

    // Use centralized static details
    this.details = STATIC_DEFECT_DETAILS;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Important: Do NOT trigger fetchData() here.
    // The `fetchData()` method will be called explicitly by the parent.
    // This `ngOnChanges` is just to observe when inputs update, but not to fetch data immediately.
    // If you need to react to input changes for *other* local logic (not data fetching), do it here.
  }

  /**
   * This method is explicitly called by the parent DashboardComponent
   * when the "Apply Filters" button is clicked or on initial load.
   */
  fetchData(): void {
    // Use the same static data method
    this.loadStaticData();
  }

  onChartClick(event: any): void {
    this.dialogVisible = true;
    // Use centralized static details
    this.details = STATIC_DEFECT_DETAILS;
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  exportData(): void {
    // Implement export functionality here
    console.log('Exporting data...');
  }
}