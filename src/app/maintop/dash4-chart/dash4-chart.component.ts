import { Component, Input, OnChanges } from '@angular/core';
import { ChartModule } from 'primeng/chart';
@Component({
  selector: 'app-dash4-chart',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './dash4-chart.component.html',
  styleUrl: './dash4-chart.component.css',
})
export class Dash4ChartComponent {
  @Input() title!: string;
  @Input() data!: {
    name: string;
    pending: number;
    inProgress: number;
    completed: number;
  }[];

  chartData: any;
  chartOptions: any;

  ngOnChanges() {
    const labels = this.data.map((d) => d.name);

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Pending',
          data: this.data.map((d) => d.pending),
          backgroundColor: '#f59e0b', // amber
        },
        {
          label: 'In Progress',
          data: this.data.map((d) => d.inProgress),
          backgroundColor: '#3b82f6', // blue
        },
        {
          label: 'Completed',
          data: this.data.map((d) => d.completed),
          backgroundColor: '#10b981', // green
        },
      ],
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: false,
          ticks: { color: '#1e293b' },
          grid: { color: '#e5e7eb' },
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#1e293b' },
          grid: { color: '#e5e7eb' },
        },
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#1e293b',
          },
        },
        tooltip: {
          enabled: true,
        },
      },
      animation: {
        duration: 0,
      },
    };
  }
}
