import { Component, OnInit, HostListener   } from '@angular/core';
import { CommonModule } from '@angular/common';
  import { Router, NavigationEnd, ActivatedRoute, RouterModule, RouterOutlet } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { filter } from 'rxjs/operators';

interface MasterMenuItem {
  icon: string;
  label: string;
  path: string;
}
interface ReportMenuItem {  
  id: number;
  icon: string;
  label: string;
  path: string;
}
@Component({
  selector: 'app-maintop-main',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './maintop-main.component.html',
  styleUrls: ['./maintop-main.component.css']
})
export class MaintopMainComponent implements OnInit {
  activeSubPath: string = 'dashmaintop';
  showMasterDropdown: boolean = false;
  showTransactionsDropdown: boolean = false; // New property for Transactions dropdown
  showReportsDropdown: boolean = false;
  masterMenuItems: MasterMenuItem[] = [
    {
      icon: 'fa-solid fa-header',
      label: 'Maintop Header',
      path: 'maintop-master/maintop-header',
    },
    {
      icon: 'fa-solid fa-info-circle',
      label: 'Maintop Details',
      path: 'maintop-master/maintop-details',
    },
    {
      icon: 'fa-solid fa-cog',
      label: 'Maintop JIC',
      path: 'maintop-master/maintop-jic',
    },
    {
      icon: 'fa-solid fa-wrench',
      label: 'JIC Spare',
      path: 'maintop-master/maintop-jic-spare',
    },
    {
      icon: 'fa-solid fa-tools',
      label: 'JIC Tool',
      path: 'maintop-master/maintop-jic-tool',
    },
    {
      icon: 'fa-solid fa-map-marker-alt',
      label: 'Address',
      path: 'maintop-master/maintop-address',
    },
    {
      icon: 'fa-solid fa-paperclip',
      label: 'JIC Attachment',
      path: 'maintop-master/maintop-jic-attachment',
    },
    {
      icon: 'fa-solid fa-book',
      label: 'Library Dist Detail',
      path: 'maintop-master/maintop-library-dist-detail',
    },
    {
      icon: 'fa-solid fa-warehouse',
      label: 'Library Dist',
      path: 'maintop-master/maintop-library-dist',
    }
  ];

  transactionMenuItems: MasterMenuItem[] = [
    {
      icon: 'fa-solid fa-exchange-alt',
      label: 'Maintop Transaction',
      path: 'transaction/maintop-transaction',
    },
    {
      icon: 'fa-solid fa-shipping-fast',
      label: 'Distribution Address',
      path: 'transaction/maintop-distribution-address',
    }
  ];
  
  reportsMenuItems: ReportMenuItem[] = [
    {
      id: 1,
      icon: 'fa-solid fa-clock',
      label: 'Equipment Running Hours',
      path: 'srar-reports',
    },
    {
      id: 2,
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
      id: 4,
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
      this.activeSubPath = 'dashmaintop';
      return;
    }

    // Check if the current URL is for any of the Master sub-paths
    if (this.masterMenuItems.some(item => url.includes(item.path))) {
      this.activeSubPath = 'maintop-master';
    }
    // Check if the current URL is for any of the Transactions sub-paths
    else if (this.transactionMenuItems.some(item => url.includes(item.path))) {
      this.activeSubPath = 'maintop-transaction';
    }
    // Check for other direct paths
    else if (['dashmaintop', 'maintop-reports'].includes(lastSegment)) {
      this.activeSubPath = lastSegment;
    }
    // Fallback to dashboard if URL doesn't match
    else {
      this.activeSubPath = 'dashmaintop';
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
    if (subPath === 'maintop-master') {
      this.toggleMasterDropdown();
    } else if (subPath === 'maintop-transaction') {
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
    this.activeSubPath = 'maintop-master';
    this.router.navigate([masterPath], { relativeTo: this.activatedRoute });
  }

  navigateToTransactionSubItem(transactionPath: string): void {
    this.showTransactionsDropdown = false; // Close dropdown after selection
    this.activeSubPath = 'maintop-transaction';
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