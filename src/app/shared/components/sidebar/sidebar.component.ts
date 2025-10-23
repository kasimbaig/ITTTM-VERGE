import { Component, Input, Output, EventEmitter, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

interface MenuItem {
  label: string;
  path?: string;
  expanded?: boolean;
  children?: MenuItem[];
  icon?: string;
  hasChildren?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent implements OnChanges {
  @Input() isCollapsed: boolean = false;
  @Output() collapseSidebar = new EventEmitter<void>();
  currentUser: any;
  public expanded: boolean = true;
  showLogoutDialog: boolean = false;
  // Watch for changes to isCollapsed input
  ngOnChanges() {
    if (this.isCollapsed !== undefined) {
      this.expanded = !this.isCollapsed;
    }
  }
  activeItem: string = '/dashboard';
  openSubMenus: { [key: string]: boolean } = {};

  themeMode: 'light' | 'dark' = 'light';

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.activeItem = event.urlAfterRedirects;
        this.collapseSidebar.emit();
      }
    });
  }

  menuItems: MenuItem[] = [
    {
      icon: 'fa-solid fa-chart-line',
      label: 'Dashboard',
      path: '/dashboard',
      hasChildren: false,
    },
    {
      icon: 'fa-solid fa-cog',
      label: 'Setup',
      path: '/setup',
      hasChildren: false,
    },

    {
      icon: 'fa-solid fa-database',
      label: 'Masters',
      path: '/masters/ship-group/ship-master',
      hasChildren: false,
    },
    // {
    //   icon: 'fa-solid fa-ship',
    //   label: 'SFD',
    //   path: '/sfd',
    //   hasChildren: false,
    // },
    {
      icon: 'fa-solid fa-anchor',
      label: 'SRAR',
      path: '/srar',
      hasChildren: false,
    },

    // {
    //   icon: 'fa-solid fa-calendar',
    //   label: 'Maintop',
    //   path: '/maintop',
    //   hasChildren: false,
    //  
    // },
    {
      icon: 'fa-solid fa-ship',
      label: 'DART',
      path: '/dart',
      hasChildren: false,
     
    },
    {
      icon: 'fa-solid fa-bolt', // Icon for ETMA
      label: 'ETMA',
      path: '/forms/etma',
      hasChildren: false,
    },
    {
      icon: 'fa-solid fa-clipboard', // Icon for SEG Forms
      label: 'SEG Forms',
      path: '/forms/seg',
      hasChildren: false
    },
    {
      icon: 'fa-solid fa-tools', // Icon for HITU Forms
      label: 'HITU Forms',
      path: '/forms/hitu',
      hasChildren: false,
    },
    
    
  ];

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    //console.log(this.getActiveRouteSegments());
  }


  getActiveRouteSegments(): string[] {
    const currentUrl = this.router.url;
    // Remove leading slash and split by slash
    const segments = currentUrl.replace(/^\//, '').split('/').filter(segment => segment.length > 0);
    //console.log('Current URL segments:', segments);
    return segments;
  }

  isActive(path: string): boolean {
    const currentUrl = this.router.url;
    return currentUrl === path || currentUrl.startsWith(path + '/');
  }
  toggleSidebar() {
    this.expanded = !this.expanded;
    if (!this.expanded) {
      this.openSubMenus = {};
    }
    //console.log('toggleSidebar called, expanded:', this.expanded);
    // Emit to parent to sync the state
    this.collapseSidebar.emit();
  }

  toggleSubMenu(path: string) {
    this.openSubMenus[path] = !this.openSubMenus[path];
  }


  
  navigateTo(path: string) {
    // this.setActiveItem(path);
    this.activeItem = path;
    //console.log('navigateTo called with path:', path);
    this.router.navigate([path]);
    // Auto-collapse sidebar when navigating
    //console.log('Emitting collapseSidebar from navigateTo');
    this.collapseSidebar.emit();
  }

  logOut() {
    localStorage.clear();
    this.router.navigate(['/home']);

    // window.location.href = '/home';
  }



}