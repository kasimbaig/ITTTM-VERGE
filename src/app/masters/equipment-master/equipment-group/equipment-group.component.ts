import { ChangeDetectorRef, Component } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-equipment-group',
  imports: [CommonModule,RouterModule],
  templateUrl: './equipment-group.component.html',
  styleUrl: './equipment-group.component.scss'
})

export class EquipmentGroupComponent {
  navTabs = [
    {
      title: 'Equipment Master',
      iconClass: 'pi pi-cog',
      count: 12,
      route: 'equipments'
    },
    {
      title: 'Equipment Specifiaction',
      iconClass: 'pi pi-tags',
      count: 8,
      route: 'equipments-specification'
    },
    {
      title: 'Equipment Type',
      iconClass: 'pi pi-sliders-h',
      count: 15,
      route: 'equipment-type'
    },
    {
      title: 'Equipment Difference',
      iconClass: 'pi pi-building',
      count: 5,
      route: 'equipment-diff'
    },
    {
      title: 'Generic Master',
      iconClass: 'pi pi-briefcase',
      count: 10,
      route: 'generic'
    },
    {
      title: 'Supplier',
      iconClass: 'pi pi-calendar',
      count: 4,
      route: 'supplier'
    }
  ];
}