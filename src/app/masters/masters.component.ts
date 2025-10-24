import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ApiService } from '../services/api.service';

interface DropdownItem {
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-masters',
  templateUrl: './masters.component.html',
  styleUrls: ['./masters.component.scss'],
  standalone: false
})
export class MastersComponent implements OnInit, AfterViewInit {
  @ViewChild('tabsContainer', { static: false }) tabsContainer!: ElementRef;
  
  activeTab: string = '';
  expandedTabs: Set<string> = new Set();

  dropdownPosition: { top: string; left: string; width: string } | null = null;

 


  constructor(private router: Router, private activatedRoute: ActivatedRoute,private apiService:ApiService) {}
  ngAfterViewInit(): void {
    // no-op
  }

  ngOnInit() {
   
  }


  shipDropdownItems: DropdownItem[] = [
    { label: 'Ship Master', icon: 'fa-solid fa-database', path: '/masters/ship-group/ship-master' },
    { label: 'Ship Category', icon: 'fa-solid fa-tags', path: '/masters/ship-group/ship-category' },
    { label: 'Departments', icon: 'fa-solid fa-building', path: '/masters/ship-group/departments' },
    // { label: 'Group', icon: 'fa-solid fa-layer-group', path: '/masters/ship-group/group' },
    { label: 'Section', icon: 'fa-solid fa-sitemap', path: '/masters/ship-group/section' },
    { label: 'Class', icon: 'fa-solid fa-graduation-cap', path: '/masters/ship-group/class' }
  ];
  // equipmentDropdownItems: DropdownItem[] = [
  //   { label: 'Equipments', icon: 'fa-solid fa-cogs', path: '/masters/equipment-group/equipments' },
  //   { label: 'Equipment Specification', icon: 'fa-solid fa-clipboard-list', path: '/masters/equipment-group/equipments-specification' },
  //   { label: 'Equipment Type', icon: 'fa-solid fa-tag', path: '/masters/equipment-group/equipment-type' },
  //   { label: 'Equipment Diff', icon: 'fa-solid fa-exchange-alt', path: '/masters/equipment-group/equipment-diff' },
  //   { label: 'Generic', icon: 'fa-solid fa-cube', path: '/masters/equipment-group/generic' },
  //   { label: 'Supplier', icon: 'fa-solid fa-truck', path: '/masters/equipment-group/supplier' }
  // ];
  unitDropdownItems: DropdownItem[] = [
    { label: 'Commands', icon: 'fa-solid fa-flag', path: '/masters/unit-group/commands' },
    { label: 'Units', icon: 'fa-solid fa-users', path: '/masters/unit-group/units' },
    { label: 'Ops Authority', icon: 'fa-solid fa-shield-alt', path: '/masters/unit-group/ops-authority' },
    // { label: 'Frequency Master', icon: 'fa-solid fa-clock', path: '/masters/unit-group/frequency' }
  ];

  showShipDropdownDropdown: boolean = false;
  showUnitDropdownDropdown: boolean = false;
  showEquipmentDropdownDropdown: boolean = false;
  activeSubPath: string = '';

  shipDropdown(){
    const willOpen = !this.showShipDropdownDropdown;
    this.showShipDropdownDropdown = willOpen;
    this.showUnitDropdownDropdown = false;
    this.showEquipmentDropdownDropdown = false;
    if (willOpen) {
      this.activeSubPath = 'ship-group';
    }
  }
  unitDropdown(){
    const willOpen = !this.showUnitDropdownDropdown;
    this.showShipDropdownDropdown = false;
    this.showUnitDropdownDropdown = willOpen;
    this.showEquipmentDropdownDropdown = false;
    if (willOpen) {
      this.activeSubPath = 'unit-group';
    }
  }
  equipmentDropdown(){
    const willOpen = !this.showEquipmentDropdownDropdown;
    this.showShipDropdownDropdown = false;
    this.showUnitDropdownDropdown = false;
    this.showEquipmentDropdownDropdown = willOpen;
    if (willOpen) {
      this.activeSubPath = 'equipment-group';
    }
  }


  navigateTo(subPath: string) {
    if (subPath === 'ship-group') {
      this.shipDropdown();
    } else if (subPath === 'equipment-group') {
      this.equipmentDropdown();
    }else if(subPath === 'unit-group'){
      this.unitDropdown();
      
    }else if(subPath === 'GRAPHQL'){
      this.showEquipmentDropdownDropdown = false;
      this.activeSubPath = subPath;
      this.router.navigate(['/srar/sarar-transaction/sarar/transaction-graphql']);
    }
    else {
      this.showShipDropdownDropdown = false;
      this.showUnitDropdownDropdown = false;
      this.showEquipmentDropdownDropdown = false;
      this.activeSubPath = subPath;
     
    }
  }

  navigateToShipSubItem(subPath: string) {
    this.showShipDropdownDropdown = false;
    this.activeSubPath='ship-group';
    this.router.navigate([subPath],{ relativeTo: this.activatedRoute });
  }
  navigateToEquipmentSubItem(subPath: string) {
    this.showEquipmentDropdownDropdown = false;
    this.activeSubPath='equipment-group';
    this.router.navigate([subPath],{ relativeTo: this.activatedRoute });
  }
  navigateToUnitSubItem(subPath: string) {
    this.showUnitDropdownDropdown = false;
    this.activeSubPath='unit-group';
    this.router.navigate([subPath],{ relativeTo: this.activatedRoute });
  }


  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.masters-dropdown-container') && !target.closest('.transactions-dropdown-container')) {
      this.showShipDropdownDropdown = false;
      this.showUnitDropdownDropdown = false;
      this.showEquipmentDropdownDropdown = false;
    }
  }
} 