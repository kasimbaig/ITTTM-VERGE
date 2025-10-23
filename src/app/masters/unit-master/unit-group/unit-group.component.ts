
import { ChangeDetectorRef, Component } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unit-group',
  imports: [CommonModule,RouterModule],
  templateUrl: './unit-group.component.html',
  styleUrl: './unit-group.component.scss'
})

export class UnitGroupComponent {


  navTabs = [
    {
      title: 'Commands Master',
      iconClass: 'pi pi-cog',
      count: 12, // These counts might eventually come from an API or a store
      route: 'commands' 
    },
    {
      title: 'Unit Master', 
      iconClass: 'pi pi-tags',
      count: 8,
      route: 'units' 
    },
    {
      title: 'OPS Authority Master',
      iconClass: 'pi pi-sliders-h',
      count: 15,
      route: 'ops-authority'
    },
    {
      title: 'Frequency Master',
      iconClass: 'pi pi-building',
      count: 5,
      route: 'frequency'
    },
    
  ];
}