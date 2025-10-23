import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-dash2-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChartModule],
  templateUrl: './dash2-chart.component.html',
  styleUrl: './dash2-chart.component.css',
})
export class Dash2ChartComponent {
  @Input() data: {
    name: string;
    daily: number;
    weekly: number;
    monthly: number;
    quarterly: number;
    yearly: number;
  }[] = [];

  chartData: any;
  chartOptions: any;

  ngOnInit() {
    this.buildChart();
  }

  buildChart() {
    const labels = this.data.map((item) => item.name);
    const keys = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
    const colors = ['#8884d8', '#0ca5e9', '#82ca9d', '#ffc658', '#ff8042'];

    this.chartData = {
      labels,
      datasets: keys.map((key, index) => ({
        label: key.charAt(0).toUpperCase() + key.slice(1),
        data: this.data.map((item) => item[key as keyof typeof item]),
        fill: false,
        borderColor: colors[index],
        tension: 0.4,
        pointRadius: 3,
      })),
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Maintenance Type',
          },
          grid: {
            display: true,
          },
        },
        y: {
          title: {
            display: true,
            text: 'Frequency Value',
          },
          grid: {
            display: true,
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
      },
      animation: {
        duration: 0, // disables animation like ngx-charts
      },
    };
  }
}
