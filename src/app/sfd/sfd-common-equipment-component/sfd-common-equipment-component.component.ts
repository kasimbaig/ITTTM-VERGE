import { Component, Input } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-sfd-common-equipment-component',
  imports: [ChartModule, DialogModule],
  templateUrl: './sfd-common-equipment-component.component.html',
  styleUrl: './sfd-common-equipment-component.component.css'
})
export class SfdCommonEquipmentComponentComponent {
  @Input() command: string | null = null;
  @Input() ship: string | null = null;
  chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#444',
          font: {
            size: 14,
            weight: '500'
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${context.parsed} items`;
          }
        }
      }
    }
  };

  chartData: any;
  detailItems: { equipment: string, ships: string[] }[] = [];
  dialogVisible = false;

  ngOnChanges() {
    this.loadChart();
  }

  loadChart() {
    // Replace below with your data fetch logic
    const common = 40, unique = 60;
    this.chartData = {
      labels: ['Common', 'Unique'],
      datasets: [{ data: [common, unique], backgroundColor: ['#007ad9', '#ffa000'] }]
    };
  }

  handleSelect(event: any) {
    const selected = this.chartData.labels[event.element._index];
    this.detailItems = selected === 'Common'
      ? [{ equipment: 'Radar', ships: ['INS Vikrant', 'INS Chennai'] }]
      : [{ equipment: 'Engine X', ships: ['INS Vikrant'] }];
    this.dialogVisible = true;
  }

}
