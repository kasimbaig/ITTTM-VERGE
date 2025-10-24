import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SararDashboardComponent } from '../../srar/sarar-dashboard/sarar-dashboard.component';

@Component({
  selector: 'app-etma-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SararDashboardComponent
  ],
  templateUrl: './etma-dashboard.component.html',
  styleUrls: ['./etma-dashboard.component.css']
})
export class EtmaDashboardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
