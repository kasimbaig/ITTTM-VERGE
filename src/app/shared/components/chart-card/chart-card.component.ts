import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-chart-card',
  imports: [CommonModule,LoadingSpinnerComponent],
  templateUrl: './chart-card.component.html',
  styleUrl: './chart-card.component.css'
})
export class ChartCardComponent {
  @Input() title: string = 'Chart Title';
  @Input() isLoading: boolean = false;
  @Input() description: string = ''; // Optional description

  constructor() { }

  ngOnInit(): void {
  }

}
