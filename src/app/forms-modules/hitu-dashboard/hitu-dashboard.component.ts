import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SararDashboardComponent } from '../../srar/sarar-dashboard/sarar-dashboard.component';

@Component({
  selector: 'app-hitu-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SararDashboardComponent
  ],
  templateUrl: './hitu-dashboard.component.html',
  styleUrls: ['./hitu-dashboard.component.css']
})
export class HituDashboardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
