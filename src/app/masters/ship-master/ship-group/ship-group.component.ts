
import { ChangeDetectorRef, Component } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ship-group',
  imports: [CommonModule,RouterModule],
  templateUrl: './ship-group.component.html',
  styleUrl: './ship-group.component.scss'
})

export class ShipGroupComponent {
  navTabs = [
    {
      title: 'Ship Master',
      iconClass: 'pi pi-cog',
      count: 12,
      route: 'ship-master'
    },
    {
      title: 'Ship Category',
      iconClass: 'pi pi-tags',
      count: 8,
      route: 'ship-category'
    },
    {
      title: 'Department',
      iconClass: 'pi pi-sliders-h',
      count: 15,
      route: 'departments'
    },
    {
      title: 'Group',
      iconClass: 'pi pi-building',
      count: 5,
      route: 'group'
    },
    {
      title: 'Section',
      iconClass: 'pi pi-briefcase',
      count: 10,
      route: 'section'
    },
    {
      title: 'Class',
      iconClass: 'pi pi-calendar',
      count: 4,
      route: 'class'
    }
  ];
}

