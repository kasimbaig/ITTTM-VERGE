import { ChangeDetectionStrategy, Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { ChartModule } from 'primeng/chart';

interface Data {
  name: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-dash3-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChartModule],
  templateUrl: './dash3-chart.component.html',
  styleUrl: './dash3-chart.component.css',
})
export class Dash3ChartComponent implements OnChanges {
  @Input() data: Data[] = [];

  @Output() segmentClick = new EventEmitter<string>();

  chartData: any;
  chartOptions: any;

  ngOnChanges() {
    this.chartData = {
      labels: this.data.map(d => d.name),
      datasets: [
        {
          data: this.data.map(d => d.value),
          backgroundColor: this.data.map(d => d.color),
          hoverBackgroundColor: this.data.map(d => d.color),
        }
      ]
    };

    this.chartOptions = {
      plugins: {
        legend: {
          display: true,
          position: 'right'
        },
        tooltip: {
          enabled: true
        }
      },
      animation: {
        duration: 0
      },
      maintainAspectRatio: false,
      onClick: (event: any, elements: any[]) => this.onChartClick(event, elements),
    };
  }

  onChartClick(event: any, elements: any[]) {
    if (elements && elements.length > 0) {
      const chartElement = elements[0];
      const label = this.chartData.labels[chartElement.index];
      this.segmentClick.emit(label);
    }
  }
}
