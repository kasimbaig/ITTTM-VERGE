import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { HituDashboardComponent } from '../hitu-dashboard/hitu-dashboard.component';
import { PaginatedTableComponent } from '../../shared/components/paginated-table/paginated-table.component';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import {NgxPrintModule} from 'ngx-print';
import {QRCodeComponent} from 'angularx-qrcode';

interface HituMenuItem {
  label: string;
  icon: string;
  path: string;
  id: number;
}

@Component({
  selector: 'app-hitu-main-component',
  standalone: true,
  imports: [CommonModule, RouterOutlet,HituDashboardComponent, PaginatedTableComponent,NgxPrintModule,QRCodeComponent],
  templateUrl: './hitu-main-component.component.html',
  styleUrls: ['./hitu-main-component.component.css'],
})
export class HituMainComponentComponent implements OnInit {
  activeSubPath: string = 'dashboard';
  showHituDropdown: boolean = false;

  hituMenuItems: HituMenuItem[] = [
    {
      icon: 'fa-solid fa-search',
      label: 'Preliminary Form',
      path: 'preliminary-form',
      id: 4,
    },
    {
      icon: 'fa-solid fa-clipboard-check',
      label: 'Intermediate Form',
      path: 'intermediate-form',
      id: 3,
    },
    {
      icon: 'fa-solid fa-check-circle',
      label: 'Final Form',
      path: 'final-form',
      id: 2,
    },
    {
      icon: 'fa-solid fa-water',
      label: 'U/W Compartments',
      path: 'uw-compartments-form',
      id: 1,
    }
  ];

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private apiService: ApiService, private toastService: ToastService) {}

  ngOnInit(): void {
    // Listen to route changes to update activeSubPath
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        if (url.includes('/forms/hitu')) {
          const segments = url.split('/');
          const lastSegment = segments[segments.length - 1];
          this.activeSubPath = lastSegment || 'dashboard';
        }
      });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.hitu-dropdown-container')) {
      this.showHituDropdown = false;
    }
  }

  navigateToHitu(subPath: string): void {
    if (subPath === 'hitu') {
      this.toggleHituDropdown();
    } else if(subPath === 'report'){
      this.activeTab=this.hituMenuItems[0];
      this.reportApicall();
      this.activeSubPath = subPath;
    }else if(subPath === 'dashboard'){
      this.activeSubPath = subPath;

    } else {
      this.showHituDropdown = false;
      this.router.navigate([subPath], { relativeTo: this.activatedRoute });
    }
  }

  toggleHituDropdown(): void {
    this.showHituDropdown = !this.showHituDropdown;
  }

  navigateToHituSubItem(hituPath: string): void {
    this.showHituDropdown = false;
    this.activeSubPath = hituPath;
    this.router.navigate([hituPath], { relativeTo: this.activatedRoute });
  }

  reportVersions: any[] = [];
  colReportVersions=[
    { field: 'version', header: 'Version', filterType: 'text' },
    { field: 'created_on', header: 'Created At', filterType: 'date' },
  ];
  reportApicall(){
    this.apiService.get(`etma/version/?sub_module_id=` + this.activeTab.id).subscribe({
      next: (response: any) => {
        this.reportVersions = response;
      },
      error: (error: any) => {
        console.error('Error fetching report versions:', error);
        this.toastService.showError('Failed to fetch report versions');
      }
    });
  }

  onDataLoaded(data: any[]): void {
    // Data loaded from paginated table
  }

  viewReportVersion(version: any): void {
    this.openFullPopup = true;
    this.selectedReportVersion = version;
    setTimeout(() => {
      this.renderSavedHtml();
    }, 100);
  }

  private renderSavedHtml(): void {
    const container = document.querySelector('.report-version-container');
    if (container && this.selectedReportVersion?.data) {
      container.innerHTML = '';
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.selectedReportVersion.data;
      while (tempDiv.firstChild) {
        container.appendChild(tempDiv.firstChild);
      }
      
      // Handle different form elements
      container.querySelectorAll('input, textarea, select').forEach((element: any) => {
        if (element.tagName === 'SELECT') {
          // For select elements, restore the selected value
          const savedValue = element.getAttribute('value');
          console.log('Rendering select element:', element.name || element.id, 'Saved value:', savedValue);
          if (savedValue) {
            element.value = savedValue;
            // Also ensure the selected option is marked as selected
            element.querySelectorAll('option').forEach((option: any) => {
              option.removeAttribute('selected');
              if (option.value === savedValue) {
                option.setAttribute('selected', 'selected');
                console.log('Option selected:', option.textContent);
              }
            });
          }
          element.disabled = true;
          element.style.cursor = 'not-allowed';
        } else if (element.type === 'checkbox' || element.type === 'radio') {
          // For checkboxes and radio buttons, restore checked state
          const isChecked = element.getAttribute('checked') === 'true' || element.hasAttribute('checked');
          element.checked = isChecked;
          element.disabled = true;
          element.style.cursor = 'not-allowed';
        } else {
          // For text inputs and textareas, restore value and make read-only
          const savedValue = element.getAttribute('value');
          if (savedValue) {
            element.value = savedValue;
          }
          element.readOnly = true;
          element.style.cursor = 'not-allowed';
        }
      });
    }
  }
  selectedReportVersion: any | null = null;
  openFullPopup=false;
  closeReportVersionPopup(): void {
    this.openFullPopup = false;
    this.selectedReportVersion = null;
    
    // Clear the container content
    const container = document.querySelector('.report-version-container');
    if (container) {
      container.innerHTML = '';
    }
  }
  activeTab: any = 0;
  tabChange(item: any): void {
    this.activeTab = item;
    this.reportApicall();
  }

}
