import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SararDashboardComponent } from '../../srar/sarar-dashboard/sarar-dashboard.component';

@Component({
  selector: 'app-seg-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SararDashboardComponent
  ],
  templateUrl: './seg-dashboard.component.html',
  styleUrls: ['./seg-dashboard.component.css']
})
export class SegDashboardComponent implements OnInit {
  currentDate: string = '';

  constructor() { }

  ngOnInit(): void {
    this.currentDate = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

}
