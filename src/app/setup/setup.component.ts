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
      title: 'Users',
      description: 'Manage user accounts and profiles',
      icon: 'pi pi-users',
      borderColor: 'border-blue-500',
      route: 'users'
    },
    {
      title: 'Role',
      description: 'Add Roles',
      icon: 'pi pi-star',
      borderColor: 'border-orange-500',
      route: 'role'
    },
    {
      title: 'Root Config',
      description: 'Manage root configuration settings',
      icon: 'pi pi-cog',
      borderColor: 'border-yellow-500',
      route: 'root-config'
    },
    {
      title: 'Role Access',
      description: 'Configure roles access levels',
      icon: 'pi pi-lock',
      borderColor: 'border-green-500',
      route: 'role-access'
    },
    {
      title: 'User Access',
      description: 'Configure user access levels',
      icon: 'pi pi-user',
      borderColor: 'border-purple-500',
      route: 'user-access'
    },
    {
      title: 'Privileges',
      description: 'Manage system-wide privileges',
      icon: 'pi pi-cog',
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
