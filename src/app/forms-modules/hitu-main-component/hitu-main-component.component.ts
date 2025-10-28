import { Component, OnInit, HostListener, ElementRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { HituDashboardComponent } from '../hitu-dashboard/hitu-dashboard.component';
import { PaginatedTableComponent } from '../../shared/components/paginated-table/paginated-table.component';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { NgxPrintModule } from 'ngx-print';
import { WordDownloadService } from '../../shared/services/word-download.service';

interface HituMenuItem {
  label: string;
  icon: string;
  path: string;
  id: number;
}

@Component({
  selector: 'app-hitu-main-component',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HituDashboardComponent, PaginatedTableComponent, NgxPrintModule],
  providers: [WordDownloadService],
  templateUrl: './hitu-main-component.component.html',
  styleUrls: ['./hitu-main-component.component.css'],
})
export class HituMainComponentComponent implements OnInit, OnDestroy {
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
    },
    // {
    //   icon: 'fa-solid fa-water',
    //   label: 'Dynamic Form',
    //   path: 'dynmic-from',
    //   id: 5,
    // }
  ];

  // Loading states for Word download
  isDocLoading: boolean = false;
  docProgress: number = 0;
  docProgressInterval: any;

  constructor(
    private router: Router, 
    private activatedRoute: ActivatedRoute, 
    private apiService: ApiService, 
    private toastService: ToastService,
    public elementRef: ElementRef,
    private wordDownloadService: WordDownloadService
  ) {}

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

  // Word Download Functions
  async downloadWord() {
    this.isDocLoading = true;
    this.startProgress('doc');
    
    const htmlContent = document.querySelector('.report-version-container');
    
    if (htmlContent) {
      try {
        const { asBlob } = await import('html-docx-js-typescript');
        
        let string = this.removeNgContentAttributes(htmlContent as HTMLElement);
        const data: Blob = await asBlob(string) as Blob;
        const url = URL.createObjectURL(data);
        
        // Generate filename based on activeTab
        const formTypeMap: { [key: string]: string } = {
          'Preliminary Form': 'PF',
          'Intermediate Form': 'IF',
          'Final Form': 'FF',
          'U/W Compartments': 'UF'
        };
        const formCode = formTypeMap[this.activeTab?.label] || 'DOC';
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `HITU_${formCode}_${timestamp}.docx`;
        
        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object after a short delay
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        this.completeProgress('doc');
        setTimeout(() => {
          this.isDocLoading = false;
          this.docProgress = 0;
        }, 1000);
        this.toastService.showSuccess('Word document generated successfully');
      } catch (error) {
        this.completeProgress('doc');
        setTimeout(() => {
          this.isDocLoading = false;
          this.docProgress = 0;
        }, 1000);
        this.toastService.showError('Failed to generate Word document');
      }
    } else {
      this.completeProgress('doc');
      setTimeout(() => {
        this.isDocLoading = false;
        this.docProgress = 0;
      }, 1000);
      this.toastService.showError('HTML content not found');
    }
  }

  removeNgContentAttributes(element: HTMLElement): string {
    if (element.attributes) {
      for (let i = 0; i < element.attributes.length; i++) {
        const attribute = element.attributes[i];
        if (attribute.name.startsWith('_ngcontent')) {
          element.removeAttribute(attribute.name);
        }
      }
    }
    if (element.children) {
      for (let i = 0; i < element.children.length; i++) {
        this.removeNgContentAttributes(element.children[i] as HTMLElement);
      }
    }
    return element.outerHTML;
  }

  startProgress(type: 'doc') {
    if (type === 'doc') {
      this.docProgress = 0;
      this.docProgressInterval = setInterval(() => {
        if (this.docProgress < 90) {
          this.docProgress += Math.random() * 15;
        }
      }, 500);
    }
  }

  completeProgress(type: 'doc') {
    if (type === 'doc') {
      this.docProgress = 100;
      if (this.docProgressInterval) {
        clearInterval(this.docProgressInterval);
        this.docProgressInterval = null;
      }
    }
  }

  clearProgressIntervals() {
    if (this.docProgressInterval) {
      clearInterval(this.docProgressInterval);
      this.docProgressInterval = null;
    }
  }

  resetProgress() {
    this.docProgress = 0;
    this.clearProgressIntervals();
  }

  cancelLoading() {
    this.isDocLoading = false;
    this.resetProgress();
    this.toastService.showError('Loading cancelled by user');
  }

  ngOnDestroy(): void {
    this.clearProgressIntervals();
  }

}
