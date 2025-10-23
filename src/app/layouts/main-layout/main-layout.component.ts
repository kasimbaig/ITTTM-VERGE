import { Component, ElementRef, HostListener, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { RoleService } from '../../services/role-service/role.service';
import { Router } from '@angular/router';
import { CommandService } from '../../masters/ship-master/ship-services/command.service';
import { ShipService } from '../../masters/ship-master/ship.service'; // Import ShipService
import { DepartmentService } from '../../masters/ship-master/ship-services/department.service'; // Import DepartmentService

@Component({
  selector: 'app-main-layout',
  standalone: false,
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
    isChatbotOpen: boolean = false;

  sidebarCollapsed: boolean = false;
  sidebarOpen: boolean = false;
  isUserMenuOpen: boolean = false;
  isMastersDropdownOpen: boolean = false;
  title = 'Dashboard';

  role = '';

  @ViewChild('mastersDropdown') mastersDropdown!: ElementRef;

  switchRole(role: string) {
    this.roleService.setRole(role);
  }

  constructor(
    private eRef: ElementRef,
    private roleService: RoleService,
    private router: Router,
    private commandService: CommandService,
    private shipService: ShipService, // Inject ShipService
    private departmentService: DepartmentService // Inject DepartmentService
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.commandService.loadAllCommandsData();
    this.shipService.loadAllShipsData(); // Load all ship data
    this.departmentService.loadAllDepartmentsData(); // Load all department data

    window.addEventListener('resize', () => this.checkScreenSize());
    this.roleService.role$.subscribe((role: any) => {
      this.role = role;
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', () => this.checkScreenSize());
  }

  // Navigation methods
  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.isMastersDropdownOpen = false;
  }

  isActiveRoute(route: string): boolean {
    const currentUrl = this.router.url;
    if (route === 'dashboard') {
      return currentUrl === '/dashboard' || currentUrl === '/';
    } else if (route === 'masters') {
      return currentUrl.startsWith('/masters');
    } else if (route === 'trans') {
      return currentUrl.startsWith('/trans');
    }
    return false;
  }

  toggleMastersDropdown(): void {
    this.isMastersDropdownOpen = !this.isMastersDropdownOpen;
  }

  logout() {
    // Clear local storage/session storage or tokens
    localStorage.clear(); // or sessionStorage.clear();

    // Navigate to login page
    this.router.navigate(['/login']);
  }

  checkScreenSize(): void {
    if (window.innerWidth <= 1024) {
      this.sidebarCollapsed = true;
    } else {
      this.sidebarCollapsed = false;
    }

    // Always close sidebar on resize for mobile
    if (window.innerWidth <= 768) {
      this.sidebarOpen = false;
      document.body.style.overflow = 'auto';
    }
  }

  toggleSidebar(): void {
    if (window.innerWidth <= 768) {
      this.sidebarOpen = !this.sidebarOpen;
      document.body.style.overflow = this.sidebarOpen ? 'hidden' : 'auto';
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  autoCollapseSidebar(): void {
    //console.log('autoCollapseSidebar called');
    // Auto-collapse sidebar on navigation (only on desktop)
    if (window.innerWidth > 768) {
      //console.log('Desktop detected, collapsing sidebar');
      this.sidebarCollapsed = true;
    }
    // Close mobile sidebar on navigation
    if (window.innerWidth <= 768 && this.sidebarOpen) {
      //console.log('Mobile detected, closing sidebar');
      this.sidebarOpen = false;
      document.body.style.overflow = 'auto';
    }
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    // Close user menu when clicking outside
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isUserMenuOpen = false;
    }

    // Close masters dropdown when clicking outside
    if (this.mastersDropdown && !this.mastersDropdown.nativeElement.contains(event.target)) {
      this.isMastersDropdownOpen = false;
    }

    // Close sidebar when clicking outside on mobile
    if (window.innerWidth <= 768 && this.sidebarOpen) {
      const target = event.target as HTMLElement;
      const sidebarEl = document.querySelector('.sidebar');
      const toggleBtn = document.querySelector('.mobile-toggle');

      if (
        sidebarEl &&
        !sidebarEl.contains(target) &&
        toggleBtn &&
        !toggleBtn.contains(target)
      ) {
        this.sidebarOpen = false;
        document.body.style.overflow = 'auto';
      }
    }
  }
  
  openChatbot() {
    //console.log("click");
    this.isChatbotOpen = true;
  }

  closeChatbot(): void {
    this.isChatbotOpen = false;
  }

  minimizeChatbot(): void {
    this.isChatbotOpen = false; // For this simple example, we can treat minimize the same as close
  }

}
