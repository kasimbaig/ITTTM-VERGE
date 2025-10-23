import { Component } from '@angular/core';

@Component({
  selector: 'app-g-t-parameter',
  standalone: false,
  templateUrl: './g-t-parameter.component.html',
  styleUrl: './g-t-parameter.component.css'
})
export class GTParameterComponent {

  parameterOptions = [
    { label: 'Parameter 1', value: 'param1' },
    { label: 'Parameter 2', value: 'param2' },
    { label: 'Parameter 3', value: 'param3' }
  ];

}
