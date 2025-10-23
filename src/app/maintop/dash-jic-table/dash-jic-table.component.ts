import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
interface JIC {
  jicid: number;
  maintopID: number;
  routineID: number;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  date: string;
  sparesCount: number;
  toolsCount: number;
}
@Component({
  selector: 'app-dash-jic-table',
  imports: [CommonModule],
  templateUrl: './dash-jic-table.component.html',
  styleUrl: './dash-jic-table.component.css',
})
export class DashJicTableComponent {
  @Input() jics: JIC[] = [];

  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed':
        return 'badge green';
      case 'In Progress':
        return 'badge blue';
      default:
        return 'badge yellow';
    }
  }
}
