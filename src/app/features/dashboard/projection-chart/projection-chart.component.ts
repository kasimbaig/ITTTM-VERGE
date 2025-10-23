import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
// Commented out API service - using static data instead
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { ApiService } from '../../../services/api.service';
// Static data imports
import {
  STATIC_PROJECTION_SHIP_OPTIONS,
  STATIC_PROJECTION_EQUIPMENT_OPTIONS,
  getProjectionData,
  StaticProjectionApiResponse,
  StaticOption
} from '../dashboard-static-data';

@Component({
  selector: 'app-projection-chart',
  standalone: true,
  imports: [CommonModule, ChartModule,DropdownModule,FormsModule],
  templateUrl: './projection-chart.component.html',
  styleUrl: './projection-chart.component.css'
})
export class ProjectionChartComponent implements OnInit, OnChanges {
  @Input() set data(value: StaticProjectionApiResponse | null) {
    this.apiResponse = value || null;
    this.buildChart();
  }

  shipOptions: StaticOption[] = STATIC_PROJECTION_SHIP_OPTIONS;
  equipmentOptions: StaticOption[] = STATIC_PROJECTION_EQUIPMENT_OPTIONS;
  projectionOptions: StaticOption[] = [];
  selectedShip: string = '101'; // Default to INS Vikrant
  selectedEquipment: string = '1'; // Default to Main Engine #1
  selectedProjection: string = 'auto';

  apiResponse: StaticProjectionApiResponse | null = null;

  chartData: any;
  chartOptions: any;
  loading: boolean = false;
  errorMessage: string | null = null;

  constructor() {} // Removed API service dependency

  ngOnInit(): void {
    // Load static data instead of API calls
    this.loadStaticData();
  }
  onShipChange(event: any) {
    this.selectedShip = event.value;
    // Equipment options are static, no need to fetch
    this.loadStaticData();
  }
  
  onEquipmentChange(event: any) {
    this.selectedEquipment = event.value;
    this.loadStaticData();
  }

  onProjectionChange(event: any) {
    this.selectedProjection = event.value;
    this.buildChart();
  }
  loadStaticData(): void {
    this.loading = true;
    this.errorMessage = null;
    
    // Get static projection data based on selected ship and equipment
    const projectionData = getProjectionData(this.selectedShip, this.selectedEquipment);
    
    if (projectionData) {
      this.apiResponse = projectionData;
      this.projectionOptions = [
        { label: 'Auto (Best Fit)', value: 'auto' },
        { label: `Linear (R² = ${projectionData.models['linear']?.avg_r_squared?.toFixed(3) || 'N/A'})`, value: 'linear' },
        { label: `Polynomial (R² = ${projectionData.models['polynomial']?.avg_r_squared?.toFixed(3) || 'N/A'})`, value: 'polynomial' }
      ];
      this.buildChart();
      this.loading = false;
    } else {
      this.loading = false;
      this.chartData = undefined;
      this.projectionOptions = [];
      this.errorMessage = 'No projection data available for selected ship and equipment combination.';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['shipId'] || changes['equipmentId']) && !changes['data']) {
      // Reload static data when identifiers change
      this.loadStaticData();
    }
  }

  private buildChart(): void {
    if (!this.apiResponse) {
      this.chartData = undefined;
      return;
    }

    const xAxisTitle = 'Running Hours';
    const yAxisTitle = 'Defects';

    // Determine which projection to use
    let projectionKey: string | null = null;
    if (this.selectedProjection === 'auto') {
      projectionKey = this.getBestProjectionKey(this.apiResponse);
    } else if (this.apiResponse.models[this.selectedProjection]) {
      projectionKey = this.selectedProjection;
    }

    const projectionSeries = projectionKey
      ? this.apiResponse.models[projectionKey].data
      : [];

    // Create mock actual data (first half of projection data)
    const actualData = projectionSeries.slice(0, Math.floor(projectionSeries.length / 2));

    this.chartData = {
      datasets: [
        {
          label: 'Actual Data',
          data: actualData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2.5,
          fill: '+1',
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: 'rgb(59, 130, 246)',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: 'rgb(59, 130, 246)',
          pointHoverBorderColor: '#ffffff',
          tension: 0.2,
          parsing: { xAxisKey: 'x', yAxisKey: 'y' }
        },
        {
          label: `Projection (${projectionKey || 'Model'})`,
          data: projectionSeries,
          borderColor: 'rgb(236, 72, 153)',
          backgroundColor: 'rgba(236, 72, 153, 0.05)',
          borderWidth: 2.5,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: 'rgb(236, 72, 153)',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: 'rgb(236, 72, 153)',
          pointHoverBorderColor: '#ffffff',
          tension: 0.3,
          parsing: { xAxisKey: 'x', yAxisKey: 'y' }
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      interaction: { 
        mode: 'index', 
        intersect: false 
      },
      plugins: {
        legend: { 
          display: true, 
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12,
              weight: '500'
            }
          }
        },
        tooltip: { 
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 10,
          displayColors: true,
          callbacks: {
            label: function(context: any) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              const x = context.parsed.x;
              const y = context.parsed.y;
              return `${label}(${x.toFixed(0)}, ${y.toFixed(1)})`;
            }
          }
        }
      },
      scales: {
        x: {
          type: 'linear',
          title: { 
            display: true, 
            text: xAxisTitle,
            font: {
              size: 13,
              weight: '500'
            },
            padding: { top: 10 }
          },
          grid: { 
            display: true,
            color: 'rgba(0, 0, 0, 0.05)',
            drawBorder: false
          },
          ticks: {
            font: {
              size: 11
            },
            color: '#64748b'
          }
        },
        y: {
          type: 'linear',
          title: { 
            display: true, 
            text: yAxisTitle,
            font: {
              size: 13,
              weight: '500'
            },
            padding: { bottom: 10 }
          },
          grid: { 
            display: true,
            color: 'rgba(0, 0, 0, 0.05)',
            drawBorder: false
          },
          ticks: {
            font: {
              size: 11
            },
            color: '#64748b'
          },
          beginAtZero: true
        }
      }
    };
  }

  private getBestProjectionKey(resp: StaticProjectionApiResponse): string | null {
    const entries = Object.entries(resp.models || {});
    if (entries.length === 0) return null;
    // Choose the projection with the highest avg_r_squared (fallback to 'linear')
    const byScore = entries.reduce((best, current) => {
      const bestScore = best[1]?.avg_r_squared ?? Number.NEGATIVE_INFINITY;
      const currentScore = current[1]?.avg_r_squared ?? Number.NEGATIVE_INFINITY;
      return currentScore > bestScore ? current : best;
    });
    const bestKey = byScore[0];
    if (bestKey) return bestKey;
    return resp.models['linear'] ? 'linear' : entries[0][0];
  }
}

// --- Minimal types for clarity ---
interface XYPoint { x: number; y: number }

interface ProjectionModel {
  data: XYPoint[];
  avg_r_squared?: number;
  r_squared_defects?: number;
  r_squared_running_hours?: number;
  parameters_defects?: any;
  parameters_running_hours?: any;
}

interface EquipmentInfo {
  id: number;
  code: string;
  name: string;
  model: string;
  manufacture_name: string;
}

interface ShipInfo {
  id: number;
  code: string;
  name: string;
}

interface SfdDetailsInfo {
  id: number;
  nomenclature: string;
  oem_part_number: string;
  no_of_fits: number;
  installation_date: string;
  service_life: number;
}

interface ProjectionApiResponse {
  equipment_info?: EquipmentInfo;
  ship_info?: ShipInfo;
  sfd_details_info?: SfdDetailsInfo;
  x_axis?: string;
  y_axis?: string;
  actual_data: XYPoint[];
  projections: Record<string, ProjectionModel>;
}
