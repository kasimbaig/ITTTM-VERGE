import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

interface HituMenuItem {
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-hitu-main-component',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './hitu-main-component.component.html',
  styleUrls: ['./hitu-main-component.component.css'],
})
export class HituMainComponentComponent implements OnInit {
  activeSubPath: string = 'preliminary-form';
  showHituDropdown: boolean = false;

  hituMenuItems: HituMenuItem[] = [
    {
      icon: 'fa-solid fa-search',
      label: 'Preliminary Form',
      path: 'preliminary-form',
    },
    {
      icon: 'fa-solid fa-clipboard-check',
      label: 'Intermediate Form',
      path: 'intermediate-form',
    },
    {
      icon: 'fa-solid fa-check-circle',
      label: 'Final Form',
      path: 'final-form',
    },
    {
      icon: 'fa-solid fa-water',
      label: 'U/W Compartments',
      path: 'uw-compartments-form',
    }
  ];

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    // Listen to route changes to update activeSubPath
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        if (url.includes('/forms/hitu')) {
          const segments = url.split('/');
          const lastSegment = segments[segments.length - 1];
          this.activeSubPath = lastSegment || 'preliminary-form';
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
    } else {
      this.showHituDropdown = false;
      this.activeSubPath = subPath;
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
}
