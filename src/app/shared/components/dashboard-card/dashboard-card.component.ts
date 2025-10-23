import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; // Needed for Angular directives like ngIf

@Component({
  selector: 'app-dashboard-card',
  standalone: true, // Mark as standalone
  imports: [CommonModule], // Import CommonModule for directives
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.css'],
})
export class DashboardCardComponent {
      @Input() title: string = 'Dashboard Metric';
      @Input() value: string | number = 0;
      @Input() description: any = '';
      @Input() iconClass: string = 'pi pi-chart-line';
      @Input() type: string = '';
      @Input() color: string = '#1e40af'; // Added color input for border

      @Output() cardClick = new EventEmitter<string>();

      onClick(): void {
        this.cardClick.emit(this.type);
      }
}