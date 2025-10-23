import {
  Component,
  OnInit,
} from '@angular/core';

import { ButtonModule } from 'primeng/button';


import { TableModule } from 'primeng/table';
import { ApiService } from '../../../services/api.service';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AddFormComponent } from '../../../shared/components/add-form/add-form.component';
import { CommonModule, Location } from '@angular/common';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';
import { MenuItem } from 'primeng/api';
import { ViewDetailsComponent } from '../../../shared/components/view-details/view-details.component';

@Component({
  selector: 'app-sfd-hierarchy',
  standalone: true,
  imports: [
    TableModule,
    AddFormComponent,
    CommonModule,
    ButtonModule,
    TieredMenuModule,
    PaginatedTableComponent,
    ViewDetailsComponent
  ],
  templateUrl: './sfd-hierarchy.component.html',
  styleUrl: './sfd-hierarchy.component.css',
})
export class SfdHierarchyComponent implements OnInit {
  departments: any = [];
  title: string = 'Add new SFD Hierarchy';
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit SFD Hierarchy';
  isViewDetailsOpen: boolean = false;
  selectedDetails: any = {};
  viewDetailsTitle: string = 'SFD Hierarchy';

  newDepartment = {
    name: '',
    code: '',
    sfd_level: null,
    master_id: null,
    h_code: '',
    active: 1,
  };
  selectedDept: any = {
    name: '',
    code: '',
    sfd_level: null,
    master_id: null,
    h_code: '',
    active: 1,
  };

  formConfigForNewDetails = [
    {
      label: 'Code',
      key: 'code',
      type: 'text',
      required: true,
    },
    {
      label: 'Name',
      key: 'name',
      type: 'text',
      required: true,
    },
    {
      label: 'SFD Level',
      key: 'sfd_level',
      type: 'number',
      required: false,
    },
    {
      label: 'Master ID',
      key: 'master_id',
      type: 'number',
      required: true,
    },
    {
      label: 'H Code',
      key: 'h_code',
      type: 'text',
      required: true,
    },
  ];


  openNew() {
    this.isFormOpen = true;
    // Reset form data when opening
    this.newDepartment = {
      name: '',
      code: '',
      sfd_level: null,
      master_id: null,
      h_code: '',
      active: 1,
    };
  }

  goBack() {
    this.location.back();
  }

  constructor(private apiService: ApiService, private location: Location) { }

  ngOnInit(): void {
    // Initialize with empty array for now
    this.departments = [];
  }




  closeDialog() {
    this.isFormOpen = false;
    this.isEditFormOpen = false;
    this.selectedDept = {
      name: '',
      code: '',
      sfd_level: null,
      master_id: null,
      h_code: '',
      active: 1,
    };
  }
  handleSubmit(data: any) {
    this.newDepartment = data;
    
    //console.log('New Department:', this.newDepartment);
    this.apiService
      .post(`master/sfd-hierarchy/`, this.newDepartment)
      .subscribe({
        next: (data: any) => {
          //console.log(data);
          this.departments.push(data);
        },
        error: (error) => {
          console.error('Login failed:', error);
          alert('Invalid login credentials');
        },
      });
    this.closeDialog();
  }
  // viewDeptDetails(dept: any) {
  //   this.selectedDept = dept;
  // }
   viewDeptDetails(details: any, open: boolean): void {
    this.isViewDetailsOpen = open;
    //console.log(details);
    this.selectedDetails = details;
  }
  editDetails(details: any, open: boolean) {
    this.isEditFormOpen = true;
    this.selectedDept = { ...details };
  }
  // deleteDeptDetails(dept: any) {
  //   this.selectedDept = dept;
  // }


  

  deleteDeptDetails(dept: any) {
  if (confirm(`Are you sure you want to delete "${dept.name}"?`)) {
    this.apiService
      .delete(`master/sfd-hierarchy/${dept.id}/`)
      .subscribe({
        next: () => {
          //console.log('Department deleted:', dept);

          // Remove from local list
          this.departments = this.departments.filter((d:any) => d.id !== dept.id);
        },
        error: (error) => {
          console.error('Delete failed:', error);
          alert('Failed to delete department');
        },
      });
  }
}


  // handleEditSubmit(data: any) {
  //   this.selectedDept = { ...this.selectedDept, ...data };
  //   this.apiService
  //     .put(`master/sfd-hierarchy/${this.selectedDept.id}/`, this.selectedDept)
  //     .subscribe({
  //       next: (data: any) => {
  //         //console.log(data);
  //       },
  //       error: (error) => {
  //         console.error('Error:', error);
  //       },
  //     });
  //   //console.log(this.selectedDept);
  //   this.closeDialog();
  // }

  handleEditSubmit(data: any) {
  // Merge form data into selectedDept
  this.selectedDept = { ...this.selectedDept, ...data };

  this.apiService
    .put(`master/sfd-hierarchy/${this.selectedDept.id}/`, this.selectedDept)
    .subscribe({
      next: (updatedDept: any) => {
        //console.log('Update success:', updatedDept);

        // Update local array so UI shows changes instantly
        const index = this.departments.findIndex(
          (dept: any) => dept.id === this.selectedDept.id
        );
        if (index !== -1) {
          this.departments[index] = updatedDept;
        }

        // Close popup after successful update
        this.isEditFormOpen = false;
      },
      error: (error) => {
        console.error('Update failed:', error);
        alert('Failed to update department');
      },
    });
}

  exportOptions: MenuItem[] = [
    {
      label: 'Export as PDF',
      icon: 'pi pi-file-pdf',
     
    },
    {
      label: 'Export as Excel',
      icon: 'pi pi-file-excel',
    }
  ];
  cols = [
    { field: 'name', header: 'Name' },
    { field: 'h_code', header: 'Hierarchy Code' },
  ];

}
