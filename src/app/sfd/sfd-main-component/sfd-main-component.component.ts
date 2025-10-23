import { Component, OnInit, HostListener } from '@angular/core'; // Import HostListener
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { SfdMasterRoutingModule } from "../sfd-master/sfd-master-routing.module";
import { ApiService } from '../../services/api.service';

interface MasterMenuItem {
  label: string;
  icon: string;
  path: string;
}

interface ReportMenuItem {
  id: number;
  label: string;
  icon: string;
  path: string;
}

  @Component({
  selector: 'app-sfd-main-component',
  standalone: true,
  imports: [CommonModule, SfdMasterRoutingModule],
  templateUrl: './sfd-main-component.component.html',
  styleUrls: ['./sfd-main-component.component.css'],
})
export class SfdMainComponentComponent implements OnInit {
  activeSubPath: string = 'sfd-dashboard';
  showMasterDropdown: boolean = false;
  showTransactionsDropdown: boolean = false; // New property for Transactions dropdown
  showReportsDropdown: boolean = false;
  // masterMenuItems: MasterMenuItem[] = [
  //   {
  //     icon: 'fa-solid fa-chart-line',
  //     label: 'Generic Specification',
  //     path: 'sfd-masters/generic-specification',
  //   },
  //   {
  //     icon: 'fa-solid fa-sitemap',
  //     label: 'SFD Hierarchy',
  //     path: 'sfd-masters/sfd-hierarchy',
  //   },
  //   {
  //     icon: 'fa-solid fa-ship',
  //     label: 'Ship Details',
  //     path: 'sfd-masters/equipment-ship-details',
  //   },
  //   {
  //     icon: 'fa-solid fa-industry',
  //     label: 'Equipment Policies',
  //     path: 'sfd-masters/equipment-supplier',
  //   },
  //   {
  //     icon: 'fa-solid fa-toolbox',
  //     label: 'Equipment Details',
  //     path: 'sfd-masters/hide-equipment-details',
  //   },
  //   {
  //     icon: 'fa-solid fa-microchip',
  //     label: 'Equipment Specification',
  //     path: 'sfd-masters/equipment-specification',
  //   },
  // ];
  masterMenuItems: MasterMenuItem[] = [
    {
      icon: 'fa-solid fa-sitemap',
      label: 'Section',
      path: 'sfd-masters/section',
    },
    {
      icon: 'fa-solid fa-users',
      label: 'Group',
      path: 'sfd-masters/group',
    },
    {
      icon: 'fa-solid fa-globe',
      label: 'Country',
      path: 'sfd-masters/country',
    },
    {
      icon: 'fa-solid fa-layer-group',
      label: 'Class',
      path: 'sfd-masters/class',
    },
    {
      icon: 'fa-solid fa-ship',
      label: 'Ship Master',
      path: 'sfd-masters/ship-master',
    },
    {
      icon: 'fa-solid fa-truck',
      label: 'Supplier',
      path: 'sfd-masters/supplier',
    },
    {
      icon: 'fa-solid fa-user-shield',
      label: 'OPS Authority',
      path: 'sfd-masters/ops-authority',
    },
    {
      icon: 'fa-solid fa-chart-line',
      label: 'Generic',
      path: 'sfd-masters/generic',
    },
    {
      icon: 'fa-solid fa-toolbox',
      label: 'Equipments',
      path: 'sfd-masters/equipments',
    },
    {
      icon: 'fa-solid fa-building',
      label: 'Establishment',
      path: 'sfd-masters/establishment',
    },
    {
      icon: 'fa-solid fa-cog',
      label: 'Propulsion',
      path: 'sfd-masters/propulsion',
    },
    {
      icon: 'fa-solid fa-industry',
      label: 'Manufacturer',
      path: 'sfd-masters/manufacturer',
    },
  ];
  transactionMenuItems: MasterMenuItem[] = [
    {
      icon: 'fa-solid fa-paperclip',
      label: 'Attach SFD By Reference',
      path: 'sfd-transactions/attach-sfd-by-reference',
    },
    {
      icon: 'fa-solid fa-list',
      label: 'SFD List',
      path: 'sfd-transactions/sfd-list',
    },
    {
      icon: 'fa-solid fa-ship',
      label: 'Equipment Ship Detail',
      path: 'sfd-transactions/equipment-ship-details',
    },
    {
      icon: 'fa-solid fa-file-alt',
      label: 'Ship Equipment Document Details',
      path: 'sfd-transactions/ship-equipment-doc-details',
    },
    
    {
      icon: 'fa-solid fa-plus-circle',
      label: 'SFD Change Request (Add/Approve/Removal/Change Request)',
      path: 'sfd-transactions/sfd-change-request',
    },
    // {
    //   icon: 'fa-solid fa-check',
    //   label: 'SFD Approve/Removal/Change Request',
    //   path: 'sfd-transactions/sfd-approve-removal-change-request',
    // },
    {
      icon: 'fa-solid fa-sitemap',
      label: 'Equipment Hierarchy',
      path: 'sfd-transactions/equipment-hierarchy',
    },
    {
      icon: 'fa-solid fa-map-marker-alt',
      label: 'Eqpt Nomenclature, Location On Board',
      path: 'sfd-transactions/eqpt-nomenclature-location',
    },
  ];

  reportsMenuItems: ReportMenuItem[] = [
    {
      id: 1,
      icon: 'fa-solid fa-cogs',
      label: 'Platform Equipment Fit',
      path: 'sfd-reports',
    },
    {
      id: 2,
      icon: 'fa-solid fa-ship',
      label: 'Equipment Distribution Across Ship',
      path: 'sfd-reports',
    },
    {
      id: 3,
      icon: 'fa-solid fa-anchor',
      label: 'SHIP - SFD',
      path: 'sfd-reports',
    },
    {
      id: 4,
      icon: 'fa-solid fa-link',
      label: 'SFD Link For ILMS',
      path: 'sfd-reports',
    },
    {
      id: 5,
      icon: 'fa-solid fa-address-book',
      label: 'Supplier/Manufacturer - Address',
      path: 'sfd-reports',
    },
    {
      id: 6,
      icon: 'fa-solid fa-tools',
      label: 'Equipment - Ship',
      path: 'sfd-reports',
    },
    {
      id: 7,
      icon: 'fa-solid fa-sitemap',
      label: 'GROUP CODE-EQPT-Ship Detail',
      path: 'sfd-reports',
    },
    {
      id: 8,
      icon: 'fa-solid fa-file-alt',
      label: 'Equipment Details Across Navy Documents AVL In CMMS Ship Wise',
      path: 'sfd-reports',
    },
  ];
  constructor(private router: Router, private activatedRoute: ActivatedRoute,private apiService:ApiService) { }

  ngOnInit(): void {
    this.updateActiveSubPath(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateActiveSubPath(event.urlAfterRedirects);
    });
  }

  private updateActiveSubPath(url: string): void {
    const urlSegments = url.split('/');
    const lastSegment = urlSegments.pop() || urlSegments.pop();

    if (!lastSegment) {
      this.activeSubPath = 'sfd-dashboard';
      return;
    }

    // Check if the current URL is for any of the Master sub-paths
    if (this.masterMenuItems.some(item => url.includes(item.path))) {
      this.activeSubPath = 'sfd-masters';
    }
    // Check if the current URL is for any of the Transactions sub-paths
    else if (this.transactionMenuItems.some(item => url.includes(item.path))) {
      this.activeSubPath = 'sfd-transactions'; // Set 'sfd-transactions' as active
    }
    // Check for other direct paths
    else if (['sfd-dashboard', 'sfd-reports'].includes(lastSegment)) {
      this.activeSubPath = lastSegment;
    }
    // Fallback to dashboard if URL doesn't match
    else {
      this.activeSubPath = 'sfd-dashboard';
    }
  }

  toggleMasterDropdown(): void {
    this.showMasterDropdown = !this.showMasterDropdown;
    this.showTransactionsDropdown = false; // Close other dropdown
    this.showReportsDropdown = false;
  }

  toggleTransactionsDropdown(): void {
    this.showTransactionsDropdown = !this.showTransactionsDropdown;
    this.showMasterDropdown = false; // Close other dropdown
    this.showReportsDropdown = false;
  }

  toggleReportsDropdown(): void {
    this.showReportsDropdown = !this.showReportsDropdown;
    this.showMasterDropdown = false; // Close other dropdown
    this.showTransactionsDropdown = false;
  }

  navigateToSFD(subPath: string): void {
    if (subPath === 'sfd-masters') {
      this.toggleMasterDropdown();
    } else if (subPath === 'sfd-transactions') {
      this.toggleTransactionsDropdown();
    }else if(subPath === 'reports'){
      this.toggleReportsDropdown();
    }
    else {
      this.showMasterDropdown = false;
      this.showTransactionsDropdown = false;
      this.activeSubPath = subPath;
      this.router.navigate([subPath], { relativeTo: this.activatedRoute });
    }
  }

  navigateToMasterSubItem(masterPath: string): void {
    this.showMasterDropdown = false;
    this.activeSubPath = 'sfd-masters';
    this.router.navigate([masterPath], { relativeTo: this.activatedRoute });
  }

  navigateToTransactionSubItem(transactionPath: string): void {
    this.showTransactionsDropdown = false; // Close dropdown after selection
    this.activeSubPath = 'sfd-transactions'; // Keep 'Transactions' active
    this.router.navigate([transactionPath], { relativeTo: this.activatedRoute });
  }

  navigateToReportsSubItem(reportsPath: any): void {
    this.showReportsDropdown = false;
    this.activeSubPath = 'sfd-reports';
    this.apiService.setReportName(reportsPath);
    this.router.navigate([reportsPath.path], { relativeTo: this.activatedRoute });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.masters-dropdown-container') && !target.closest('.transactions-dropdown-container')) {
      this.showMasterDropdown = false;
      this.showTransactionsDropdown = false;
      this.showReportsDropdown = false;
    }
  }
}