import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

interface SetupTile {
  title: string;
  description: string;
  icon: string;
  borderColor: string;
  route: string;
}

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, RouterModule, DialogModule, ButtonModule],
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent {
  
  showSwitchModeDialog = false;
  
  setupTiles: SetupTile[] = [
    {
      title: 'Personnel Management',
      description: 'Oversee crew accounts, credentials, and personnel profiles',
      icon: 'pi pi-users',
      borderColor: 'border-blue-500',
      route: 'users'
    },
    {
      title: 'Authority Designation',
      description: 'Define and assign organizational responsibilities',
      icon: 'pi pi-star',
      borderColor: 'border-orange-500',
      route: 'role'
    },
    {
      title: 'System Foundation',
      description: 'Configure core system parameters and base settings',
      icon: 'pi pi-cog',
      borderColor: 'border-yellow-500',
      route: 'root-config'
    },
    {
      title: 'Authorization Matrix',
      description: 'Control functional permissions by designation',
      icon: 'pi pi-lock',
      borderColor: 'border-green-500',
      route: 'role-access'
    },
    {
      title: 'Individual Permissions',
      description: 'Grant specific capabilities to personnel',
      icon: 'pi pi-user',
      borderColor: 'border-purple-500',
      route: 'user-access'
    },
    {
      title: 'Access Control',
      description: 'Administer platform-wide security clearances',
      icon: 'pi pi-shield',
      borderColor: 'border-red-500',
      route: 'privileges'
    }
  ];

  constructor(private router: Router) {}

  viewDetails(route: string): void {
    // Navigate to the specific module page
    this.router.navigate(['/setup', route]);
  }

  addNew(route: string): void {
    // Navigate to the specific module page with add action
    this.router.navigate(['/setup', route], { 
      queryParams: { action: 'add' } 
    });
  }

  openSwitchModeDialog(): void {
    this.showSwitchModeDialog = true;
  }

  switchToMode(route: string): void {
    this.showSwitchModeDialog = false;
    // Small delay to ensure dialog closes properly before navigation
    setTimeout(() => {
      this.router.navigate(['/setup', route]);
    }, 100);
  }
}
