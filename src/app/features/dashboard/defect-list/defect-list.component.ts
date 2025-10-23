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
      aspectRatio: 0.6,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true, boxWidth: 10 }
        },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.08)' } }
      },
      elements: { bar: { borderRadius: 8, borderSkipped: false } },
      layout: { padding: { top: 8 } }
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
}