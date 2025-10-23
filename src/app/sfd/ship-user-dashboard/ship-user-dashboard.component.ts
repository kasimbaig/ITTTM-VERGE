import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ship-user-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './ship-user-dashboard.component.html',
  styleUrl: './ship-user-dashboard.component.css',
})
export class ShipUserDashboardComponent {
  chartData = [
    { label: 'Propulsion Systems', count: 2, color: '#B6B6F1' },
    { label: 'Electronic Systems', count: 1, color: '#FF7743' },
    { label: 'Weapons Systems', count: 1, color: '#58D0F5' },
    { label: 'Communication Systems', count: 1, color: '#FFD0D5' },
  ];

  donutSegments: any[] = [];
  total = 0;
  circleRadius = 80;
  circumference = 0;
  roles = ['Ship User', 'Super Admin'];
  selectedRole = 'Ship User';

  ngOnInit(): void {
    this.updateChart();
  }

  updateChart(): void {
    // Optional: Filter chartData based on selectedRole or selectedCategory
    this.total = this.chartData.reduce((sum, item) => sum + item.count, 0);
    this.circumference = 2 * Math.PI * this.circleRadius;

    let offset = 0;
    this.donutSegments = this.chartData.map((item) => {
      const fraction = item.count / this.total;
      const dash = fraction * this.circumference;
      const segment = {
        color: item.color,
        dasharray: `${dash} ${this.circumference}`,
        dashoffset: -offset,
      };
      offset += dash;
      return segment;
    });
  }
}
