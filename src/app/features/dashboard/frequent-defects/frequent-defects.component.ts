import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-frequent-defects',
  standalone:false,
  templateUrl: './frequent-defects.component.html',
  styleUrls: ['./frequent-defects.component.css']
})
export class FrequentDefectsComponent implements OnChanges {
  @Input() chartData: any;

  chartOptions: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData']) {
      this.setupChartOptions();
    }
  }

  setupChartOptions() {
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
      layout: { padding: { top: 8,} }
    };

    this.chartData = {
      labels: ['Engine Failure', 'Electrical Issues', 'Navigation Problems', 'Hull Damage', 'Communication Faults'],
      datasets: [{
        label: 'Frequency of Defects',
        data: [25, 18, 12, 8, 15],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ],
        borderColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ],
        borderWidth: 1
      }]
    };
  }
}
