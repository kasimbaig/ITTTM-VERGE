import { Component, OnInit, HostListener } from '@angular/core'; // Import HostListener
import { Router, ActivatedRoute, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

interface MasterMenuItem {
  label: string;
  icon: string;
  path: string;
}

interface ReportMenuItem {
  id: any;
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-sarar-main-component',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './sarar-main-component.component.html',
  styleUrls: ['./sarar-main-component.component.css'],
})
export class SararMainComponentComponent implements OnInit {
  activeSubPath: string = 'srar-dashboard';
  showMasterDropdown: boolean = false;
  showTransactionsDropdown: boolean = false; // New property for Transactions dropdown
  showReportsDropdown: boolean = false;
  masterMenuItems: MasterMenuItem[] = [
    {
      icon: 'fa-solid fa-ship',
      label: 'Ship-State',
      path: 'sarar-master/sarar/master-ship-state',
    },{
      icon: 'fa-solid fa-map-marker-alt',
      label: 'Ship Location',
      path: 'sarar-master/sarar/master-ship-location',
    },{
      icon: 'fa-solid fa-microchip',
      label: 'Ship Activity Type',
      path: 'sarar-master/sarar/master-ship-activity-type',
    }, {
      icon: 'fa-solid fa-toolbox',
      label: 'Ship Activity Detail',
      path: 'sarar-master/sarar/master-ship-activity-detail',
    },
    {
      icon: 'fa-solid fa-industry',
      label: 'Lubricant',
      path: 'sarar-master/sarar/master-lubricant',
    },
   
    {
      icon: 'fa-solid fa-chart-line',
      label: 'Equipment',
      path: 'sarar-master/sarar/master-equipment',
    },{
      icon: 'fa-solid fa-ship',
      label: 'Linked Equipment',
      path: 'sarar-master/sarar/master-linked-equipment',
    },
    {
      icon: 'fa-solid fa-sitemap',
      label: 'FPT CST Form',
      path: 'sarar-master/sarar/master-fpt-cst-form',
    },
    
  ];

  transactionMenuItems: MasterMenuItem[] = [
    {
      icon: 'fa-solid fa-paperclip',
      label: 'Adjustment',
      path: 'sarar-transaction/sarar/transaction-adjustment',
    },
    {
      icon: 'fa-solid fa-list',
      label: 'Monthly',
      path: 'sarar-transaction/sarar/transaction-monthly',
    },
    {
      icon: 'fa-solid fa-ship',
      label: 'Status',
      path: 'sarar-transaction/sarar/transaction-status',
    },
    {
      icon: 'fa-solid fa-chart-line',
      label: 'GraphQL',
      path: 'sarar-transaction/sarar/transaction-graphql',
    },
    {
      icon: 'fa-solid fa-search',
      label: 'Global Search',
      path: 'sarar-transaction/sarar/transaction-elastic-search',
    }
  ];
  reportsMenuItems: ReportMenuItem[] = [
    {
      id: 'equipment-running-hours',
      icon: 'fa-solid fa-clock',
      label: 'Equipment Running Hours',
      path: 'srar-reports',
    },
    {
      id: 'boiler-running-hour-and-inspection-detail',
      icon: 'fa-solid fa-fire',
      label: 'Boiler-Running Hour and Inspection Detail',
      path: 'srar-reports',
    },
    {
      id: 3,
      icon: 'fa-solid fa-oil-can',
      label: 'Consumption of Lubricant',
      path: 'srar-reports',
    },
    {
      id: "hours-underway",
      icon: 'fa-solid fa-route',
      label: 'Hours Underway/Distance Run',
      path: 'srar-reports',
    },
    {
      id: 5,
      icon: 'fa-solid fa-anchor',
      label: 'Cumulative Ship Activity-At Sea / Harbour',
      path: 'srar-reports',
    },
    {
      id: 6,
      icon: 'fa-solid fa-list-alt',
      label: 'Ship Activity Details',
      path: 'srar-reports',
    },
    {
      id: 7,
      icon: 'fa-solid fa-expand-arrows-alt',
      label: 'EQPT RH Extension',
      path: 'srar-reports',
    },
    {
      id: 8,
      icon: 'fa-solid fa-building',
      label: 'Overall Activity - In Platforms',
      path: 'srar-reports',
    },
    {
      id: 9,
      icon: 'fa-solid fa-gas-pump',
      label: 'Fuel Consumption - Month Wise',
      path: 'srar-reports',
    },
    {
      id: 10,
      icon: 'fa-solid fa-ship',
      label: 'Fuel Consumption - Propulsion Wise',
      path: 'srar-reports',
    },
    {
      id: 11,
      icon: 'fa-solid fa-exclamation-triangle',
      label: 'H2S Sensor Status',
      path: 'srar-reports',
    },
    {
      id: 12,
      icon: 'fa-solid fa-calendar-alt',
      label: 'Yearly Cumulative Ship Activity Report',
      path: 'srar-reports',
    },
    {
      id: 13,
      icon: 'fa-solid fa-calendar',
      label: 'Monthly Cumulative Ship Activity Report',
      path: 'srar-reports',
    },
    {
      id: 14,
      icon: 'fa-solid fa-cogs',
      label: 'SRAR GTG Utilisation',
      path: 'srar-reports',
    },
    {
      id: 15,
      icon: 'fa-solid fa-tachometer-alt',
      label: 'SRAR Average Speed Annual Report',
      path: 'srar-reports',
    },
    {
      id: 16,
      icon: 'fa-solid fa-file-alt',
      label: 'FPTCST Report',
      path: 'srar-reports',
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
      this.activeSubPath = 'srar-dashboard';
      return;
    }

    // Check if the current URL is for any of the Master sub-paths
    if (this.masterMenuItems.some(item => url.includes(item.path))) {
      this.activeSubPath = 'srar-masters';
    }
    // Check if the current URL is for any of the Transactions sub-paths
    else if (this.transactionMenuItems.some(item => url.includes(item.path))) {
      this.activeSubPath = 'srar-transactions'; // Set 'sfd-transactions' as active
    }
    // Check for other direct paths
    else if (['srar-dashboard', 'srar-reports'].includes(lastSegment)) {
      this.activeSubPath = lastSegment;
    }
    // Fallback to dashboard if URL doesn't match
    else {
      this.activeSubPath = 'srar-dashboard';
    }
  }

  toggleMasterDropdown(): void {
    this.showMasterDropdown = !this.showMasterDropdown;
    this.showTransactionsDropdown = false; // Close other dropdown
    this.showReportsDropdown = false;
  }
  toggleReportsDropdown(): void {
    this.showReportsDropdown = !this.showReportsDropdown;
    this.showTransactionsDropdown = false; // Close other dropdown
    this.showMasterDropdown = false;
  }

  toggleTransactionsDropdown(): void {
    this.showTransactionsDropdown = !this.showTransactionsDropdown;
    this.showMasterDropdown = false; // Close other dropdown
    this.showReportsDropdown = false;
  }

  navigateToSFD(subPath: string): void {
    if (subPath === 'srar-masters') {
      this.toggleMasterDropdown();
    } else if (subPath === 'srar-transactions') {
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
    this.activeSubPath = 'srar-masters';
    this.router.navigate([masterPath], { relativeTo: this.activatedRoute });
  }

  navigateToTransactionSubItem(transactionPath: string): void {
    this.showTransactionsDropdown = false; // Close dropdown after selection
    this.activeSubPath = 'srar-transactions'; // Keep 'Transactions' active
    this.router.navigate([transactionPath], { relativeTo: this.activatedRoute });
  }

  navigateToReportsSubItem(reportsPath: any): void {
    this.showReportsDropdown = false; // Close dropdown after selection
    this.activeSubPath = 'reports'; 
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