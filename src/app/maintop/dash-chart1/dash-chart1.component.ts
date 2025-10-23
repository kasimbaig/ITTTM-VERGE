import { Component, Input, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-dash-chart1',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './dash-chart1.component.html',
  styleUrl: './dash-chart1.component.css',
})
export class DashChart1Component {
  @Input() data: { name: string; value: number }[] = [];
  constructor(private cdr: ChangeDetectorRef) {}
  chartData: any;
  chartOptions: any;

  ngOnInit() {
    //console.log(this.data);
    this.buildChart();
  }
  ngOnChanges(changes: any) {
    if (changes['data']) {
      this.buildChart();
      //console.log(this.data);
      this.cdr.detectChanges(); // Manually trigger change detection if necessary
    }
  }

  buildChart() {
    this.chartData = {
      labels: this.data.map((d) => d.name),
      datasets: [
        {
          label: 'Value',
          backgroundColor: '#0ca5e9',
          data: this.data.map((d) => d.value),
        },
      ],
    };

    this.chartOptions = {
      indexAxis: 'y', // 👈 Makes it horizontal
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Value',
          },
          grid: {
            display: true,
          },
        },
        y: {
          title: {
            display: true,
            text: 'Department',
          },
          grid: {
            display: false,
          },
          barThickness: 50,
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
      },
      animation: {
        duration: 0, // 👈 Disable animation like you had [animations]="false"
      },
    };
  }
}
