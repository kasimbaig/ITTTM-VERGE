import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  isETMAExpanded = false;
  isTransactionExpanded = false;
  isHITUExpanded = false;
  currentRoute = '';

  constructor(private router: Router) {}

  ngOnInit() {
    // Track current route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
        this.updateMenuStates();
      });
    
    // Set initial route
    this.currentRoute = this.router.url;
    this.updateMenuStates();
  }

  updateMenuStates() {
    // Expand ETMA menu if any ETMA transaction form is active
    if (this.currentRoute.includes('/transaction/etma')) {
      this.isETMAExpanded = true;
      this.isTransactionExpanded = true;
    }
    
    // Expand HITU menu if any HITU form is active
    if (this.currentRoute.includes('/etma-form') || 
        this.currentRoute.includes('/intermediate-form') || 
        this.currentRoute.includes('/final-form') || 
        this.currentRoute.includes('/uw-compartments-form')) {
      this.isHITUExpanded = true;
    }
  }

  toggleETMA() {
    this.isETMAExpanded = !this.isETMAExpanded;
  }

  toggleTransaction() {
    this.isTransactionExpanded = !this.isTransactionExpanded;
  }

  toggleHITU() {
    this.isHITUExpanded = !this.isHITUExpanded;
  }

  navigateToSegForm() {
    this.router.navigate(['/seg-form']);
  }

  navigateToETMAForm() {
    this.router.navigate(['/etma-form']);
  }

  navigateToHSConverter() {
   
    this.router.navigate(['/transaction/etma']).then(() => {
      
      console.error('Sidebar: Navigation failed:', error);
    });
  }

  navigateToIntermediateForm() {
    this.router.navigate(['/intermediate-form']);
  }

  navigateToFinalForm() {
    this.router.navigate(['/final-form']);
  }

  navigateToUWCompartmentsForm() {
    this.router.navigate(['/uw-compartments-form']);
  }

  // Check if menu item is active
  isActive(route: string): boolean {
    return this.currentRoute === route;
  }

  // Check if submenu item is active
  isSubmenuActive(route: string): boolean {
    return this.currentRoute === route;
  }
}