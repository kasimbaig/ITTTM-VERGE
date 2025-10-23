import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { SharedLayoutComponent } from '../shared-layout/shared-layout.component';
import { AddFormComponent } from '../shared/components/add-form/add-form.component';
import { ApiService } from '../services/api.service';
import { AuthService } from '../core/auth/services/auth-service/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    SharedLayoutComponent,
    AddFormComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  userLogin: string = '';
  password: string = '';
  showPassword: boolean = false;
  searchQuery: string = '';
  showRegistrationForm = false;
  showVideoGallery = false;
  selectedVideoCategory = '';
  
  videoCategories = [
    {
      id: 'installation',
      title: 'INSTALLATION VIDEOS',
      videos: [
        { id: 'hyperv', title: 'INSTALLATION OF HYPER-V', description: 'Step by step guide for Hyper-V installation' },
        { id: 'download', title: 'HOW TO DOWNLOAD VM PACKAGE', description: 'Complete guide for downloading VM packages' },
        { id: 'transfer', title: 'STEPS FOR TRANSFERING DOWNLOADED VM FILE', description: 'Transfer VM files to your system' },
        { id: 'processor', title: 'STEPS FOR INCREASING PROCESSOR OF VM', description: 'Increase VM processor allocation' },
        { id: 'vhdx', title: 'STEPS FOR CREATING VM FROM VHDX FILE', description: 'Create VM from VHDX file format' },
        { id: 'connect', title: 'STEPS FOR CONNECTING VM THROUGH HYPER-V', description: 'Connect to VM using Hyper-V' },
        { id: 'database', title: 'STEPS FOR RESTORING DATABASE IN SQL SERVER', description: 'Restore database in SQL Server' },
        { id: 'scheduler', title: 'STEPS FOR CREATING SCHEDULAR FOR SYNCING', description: 'Create sync scheduler for automation' }
      ]
    },
    {
      id: 'patch',
      title: 'STEPS FOR UPDATING PATCH',
      videos: [
        { id: 'patch1', title: 'PATCH UPDATE OVERVIEW', description: 'Overview of patch update process' },
        { id: 'patch2', title: 'PRE-INSTALLATION CHECKS', description: 'Checks before installing patches' },
        { id: 'patch3', title: 'PATCH INSTALLATION STEPS', description: 'Step by step patch installation' },
        { id: 'patch4', title: 'POST-INSTALLATION VERIFICATION', description: 'Verify patch installation success' }
      ]
    },
    {
      id: 'sfd',
      title: 'SFD, EMAPS AND SRAR VIDEOS',
      videos: [
        { id: 'sfd1', title: 'SFD SYSTEM OVERVIEW', description: 'SFD system introduction and features' },
        { id: 'sfd2', title: 'EMAPS INTEGRATION', description: 'EMAPS system integration guide' },
        { id: 'sfd3', title: 'SRAR REPORTING', description: 'SRAR reporting and analytics' },
        { id: 'sfd4', title: 'SYSTEM CONFIGURATION', description: 'SFD system configuration guide' }
      ]
    },
    {
      id: 'dart',
      title: 'DART, DL, OPDEF AND FUSS VIDEOS',
      videos: [
        { id: 'dart1', title: 'DART SYSTEM GUIDE', description: 'DART system user guide' },
        { id: 'dart2', title: 'DL OPERATIONS', description: 'DL operations and procedures' },
        { id: 'dart3', title: 'OPDEF CONFIGURATION', description: 'OPDEF configuration guide' },
        { id: 'dart4', title: 'FUSS INTEGRATION', description: 'FUSS system integration' }
      ]
    }
  ];
  
  formConfig = [
    {
      key: 'name',
      type: 'input',
      label: 'Name',
      required: true,
      placeholder: 'Enter full name'
    },
    {
      key: 'personalNo',
      type: 'input',
      label: 'Personal No',
      required: true,
      placeholder: 'Enter personal number'
    },
    {
      key: 'rank',
      type: 'input',
      label: 'Rank',
      required: true,
      placeholder: 'Enter rank'
    },
    {
      key: 'designation',
      type: 'input',
      label: 'Designation',
      required: true,
      placeholder: 'Enter designation'
    },
    {
      key: 'emailId',
      type: 'input',
      label: 'Desig. Mail Id',
      required: true,
      placeholder: 'Enter official email',
      inputType: 'email'
    },
    {
      key: 'phoneNo',
      type: 'input',
      label: 'Phone No',
      required: true,
      placeholder: 'Enter phone number'
    },
    {
      key: 'shipUnitName',
      type: 'select',
      label: 'Ship/Unit Name',
      required: true,
      options: [
        { label: '----Please Select----', value: '' },
        { label: 'Ship 1', value: 'ship1' },
        { label: 'Ship 2', value: 'ship2' },
        { label: 'Unit A', value: 'unitA' },
        { label: 'Unit B', value: 'unitB' },
        { label: 'Unit C', value: 'unitC' }
      ]
    },
    {
      key: 'unitName',
      type: 'input',
      label: 'Unit Name',
      required: false,
      placeholder: 'Enter unit name'
    },
    {
      key: 'mobileNo',
      type: 'input',
      label: 'Mobile No',
      required: true,
      placeholder: 'Enter mobile number'
    }
  ];

  formData = {};

  constructor(private router: Router, private apiService: ApiService, private authService: AuthService) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    this.apiService
      .post(`api/auth/token/`, {
        loginname: this.userLogin,
        password: this.password,
      })
      .subscribe({
        next: (data: any) => {
          //console.log(data);
          localStorage.setItem('currentUser', JSON.stringify(data));
          this.authService.setCurrentUser(data); // Update BehaviorSubject
          localStorage.setItem('user_role', data.user_roles[0]?.role);
          localStorage.setItem('user_process', data.user_roles[0]?.process);
          localStorage.setItem('unit_id', data.unit_id);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
         
        },
      });
  }

  onNewUser() {
    //console.log('New user registration requested');
    this.showRegistrationForm = true;
  }

  onRegistrationSubmit(formData: any) {
    //console.log('Registration form submitted:', formData);
    // Handle form submission - you can add API call here
    alert('Registration submitted successfully!');
    this.showRegistrationForm = false;
  }

  onFormOpenChange(isOpen: boolean) {
    this.showRegistrationForm = isOpen;
  }

  openVideoGallery(categoryId: string) {
    this.selectedVideoCategory = categoryId;
    this.showVideoGallery = true;
  }

  closeVideoGallery() {
    this.showVideoGallery = false;
    this.selectedVideoCategory = '';
  }

  downloadVideo(videoId: string, videoTitle: string) {
    //console.log(`Downloading video: ${videoTitle} (ID: ${videoId})`);
    // Implement actual download logic here
    alert(`Starting download for: ${videoTitle}`);
  }

  getSelectedCategoryTitle(): string {
    const category = this.videoCategories.find(cat => cat.id === this.selectedVideoCategory);
    return category ? category.title : '';
  }

  getSelectedCategoryVideos(): any[] {
    const category = this.videoCategories.find(cat => cat.id === this.selectedVideoCategory);
    return category ? category.videos : [];
  }

  onSearch() {
    //console.log('Search requested');
    // Implement search logic here
  }
}
