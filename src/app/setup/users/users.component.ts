import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';
import { AddFormComponent } from '../../shared/components/add-form/add-form.component';
import { ResuableTableComponent } from '../../sfd/sfd-transaction/resuable-table/resuable-table.component';
import { ApiService } from '../../services/api.service';
import { forkJoin, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';



@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    ToastModule,
    DialogModule,
    AddFormComponent,
    ResuableTableComponent
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  

  // Loading state
  isLoadingUsers = false;

  // Users data
  users: any[] = [];

  // Initial data for new user form
  initialUserData: any = {
    loginname: '',
    process: '',
    role: '',
    rankName: '',
    first_name: '',
    hrcdf_designation: '',
    vessel: '',
    unit: '',
    password: '',
    confirm_password: '',
    employee_type: '',
    establishment: '',
    email: '',
    phone_no: '',
    sso_user: false,
    department: []
  };

  totalRecords: number = 0;
  currentPage: number = 1;
  rowsPerPage: number = 10;
  rowsPerPageOptions: number[] = [5, 10, 20, 50, 100];

  gridColumns = [
    { field: 'loginname', header: 'Login Name', sortable: true, type: 'text' },
    { field: 'first_name', header: 'First Name', sortable: true, type: 'text' },
    { field: 'last_name', header: 'Last Name', sortable: true, type: 'text' },
    { field: 'email', header: 'Email', sortable: true, type: 'text' },
    { field: 'rankName', header: 'Rank Name', sortable: true, type: 'text' },
    { field: 'hrcdf_designation', header: 'HRCDF Designation', sortable: true, type: 'text' },
    { field: 'role_name', header: 'Role', sortable: true, type: 'text' },
    { field: 'status', header: 'Status', sortable: true, type: 'status' },
    { field: 'last_login', header: 'Last Login', sortable: true, type: 'date' }
  ];

  showAddForm = false;
  showEditForm = false;
  showViewForm = false;
  showDeleteModal = false;
  showSwitchModeDialog = false;
  
  selectedUser: any | null = null;
 

  // Setup tiles for Switch Mode dialog
  setupTiles = [
    {
      title: 'Users',
      description: 'Manage user accounts and profiles',
      icon: 'pi pi-users',
      borderColor: 'border-blue-500',
      route: 'users'
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


  

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private apiService: ApiService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // this.filteredUsers = this.users;
    this.getRequiredData();
    this.fetchUsers(1, this.rowsPerPage);

  }
  fetchUsers(page: number, pageSize: number): void {
    this.apiService.get('api/auth/users/?page='+page).subscribe((data: any) => {
      this.users = data.results.data || data.results || data;
     
      this.totalRecords = data.count;
    }); 
}
getRequiredData(){
  forkJoin({
   
    departments: this.apiService.get('master/department/?is_dropdown=true'),
    establishment: this.apiService.get('master/establishments/?is_dropdown=true'),
    employeeType: this.apiService.get('master/employee-type/?is_dropdown=true'),
    ship: this.apiService.get('master/ship/'),
    units: this.apiService.get('master/units/'),
    userType: this.apiService.get('access/processes/?is_dropdown=true')
  }).subscribe((data: any) => {
    //console.log('API Responses:', data);
    
    // Handle different response structures
    // this.setResponse(data.userRoles?.data || data.userRoles || [],'role');
    this.setResponse(data.departments?.data || data.departments || [],'department');
    this.setResponse(data.establishment?.data || data.establishment || [],'establishment');
    this.setResponse(data.employeeType?.data || data.employeeType || [],'employee_type');
    this.setResponse(data.ship?.data || data.ship || [],'vessel');
    this.setResponse(data.units?.data || data.units || [],'unit');
    this.setResponse(data.userType?.data || data.userType || [],'process');
    
    //console.log('Updated form config:', this.userFormConfig);
  }, (error) => {
    console.error('Error fetching dropdown data:', error);
  })

}

userFormConfig = [
  { label: 'Personal No.', key: 'loginname', type: 'text', required: true, placeholder: 'Enter Personal Number' },
  // { label: 'User Login', key: 'user_login', type: 'text', required: true, placeholder: 'Enter User Login' },
  { label: 'User Type', key: 'process', type: 'select', required: true, placeholder: 'Select User Type', options: [] },
  { label: 'Role', key: 'role', type: 'select', required: true, placeholder: 'Select Role', options: [] },
  { label: 'Rank', key: 'rankName', type: 'text', required: true, placeholder: 'Enter Rank' },
  { label: 'Name', key: 'first_name', type: 'text', required: true, placeholder: 'Enter Name' },
  { label: 'Designation', key: 'hrcdf_designation', type: 'text', required: true, placeholder: 'Enter Designation' },
  { label: 'Ship', key: 'vessel', type: 'select', required: false, placeholder: 'Select Ship', options: [] },
  { label: 'Unit', key: 'unit', type: 'select', required: true, placeholder: 'Select Unit', options: [] },
  { label: 'Password', key: 'password', type: 'password', required: true, placeholder: 'Enter Password' },
  { label: 'Confirm Password', key: 'confirm_password', type: 'password', required: true, placeholder: 'Confirm Password' },
  { label: 'Employee Type', key: 'employee_type', type: 'select', required: true, placeholder: 'Select Employee Type', options: [] },
  { label: 'Establishment', key: 'establishment', type: 'select', required: false, placeholder: 'Select Establishment', options: [] },
  { label: 'NUD Email', key: 'email', type: 'email', required: true, placeholder: 'Enter NUD Email' },
  { label: 'Phone No.', key: 'phone_no', type: 'text', required: true, placeholder: 'Enter Phone Number' },
  { label: 'SSO User', key: 'ad_user', type: 'checkbox', required: false },
  { label: 'Department', key: 'department', type: 'select-multiple', required: false, placeholder: 'Select Department', options: [] }
];
  goBack(): void {
    // Navigate back to setup page
    window.history.back();
  }

  setResponse(data: any, key: string): void {
  
    
    const res = data.map((item: any) => ({
      label: item.name || item.title || item.label || `${key} ${item.id}`,
      value: item.id || item.value
    }));

  
    this.userFormConfig.forEach((item: any) => {
      if (item.key === key) {
        item.options = res;
        //console.log(`Updated ${key} options:`, item.options);
      }
    });
    this.userFormConfig=[...this.userFormConfig]
    this.initialUserData={...this.initialUserData}

  }

  addNewUser(): void {
    this.initialUserData = {
      loginname: '',
      process: '',
      role: '',
      rankName: '',
      first_name: '',
      hrcdf_designation: '',
      vessel: '',
      unit: '',
      password: '',
      confirm_password: '',
      employee_type: '',
      establishment: '',
      email: '',
      phone_no: '',
      sso_user: false,
      department: []
    };
    this.showAddForm = true;
    //console.log(this.userFormConfig)
  }
editCinfig:any[]=[];
  editUser(user: any): void {
    this.apiService.get('access/role-process-mappings/?process_id='+user.process).subscribe((data: any) => {
      const newdata= data.map((item: any) => {
        return {
          label:item.role_name,
          value:item.user_role,
        }
      });
      this.setResponse(newdata,'role');
    });
    this.editCinfig=this.userFormConfig.filter((item: any) => item.key !== 'confirm_password' && item.key !== 'password'  );
    this.selectedUser = { ...user };
    this.showEditForm = true;
  }

  viewUser(user: any): void {
    this.selectedUser = { ...user };
    this.showViewForm = true;
  }

  deleteUser(user: any): void {
    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  handleAddSubmit(data: any): void {
    //console.log('Submitting user data:', data);

    this.apiService.post('api/auth/users/', data).subscribe(res=>{
      this.showAddForm = false;
      this.isLoadingUsers = false;
      this.fetchUsers(1, this.rowsPerPage); // Refresh the users list
    });
  }

  handleEditSubmit(data: any): void {
    //console.log('Submitting user data:', data);

    this.apiService.put('api/auth/users/'+this.selectedUser.id+'/', data).subscribe(res=>{
      this.showEditForm = false;
      this.isLoadingUsers = false;
      this.fetchUsers(1, this.rowsPerPage); // Refresh the users list
    });
  }

  handleViewSubmit(data: any): void {
    this.showViewForm = false;
    this.selectedUser = null;
  }

  // confirmDelete(): void {
  //   if (this.selectedUser) {
  //     // Show loading state

  //     // Make API call to delete user
  //     this.apiService.delete(`${this.USERS_API}${this.selectedUser.id}/`).subscribe({
  //       next: (response: any) => {
  //         //console.log('User deleted successfully:', response);
          
  //         this.messageService.add({
  //           severity: 'success',
  //           summary: 'Success',
  //           detail: 'User deleted successfully'
  //         });
          
  //         this.showDeleteModal = false;
  //         this.selectedUser = null;
          
  //         // Refresh the table data from API
  //         this.fetchUsers();
  //       },
  //       error: (error) => {
  //         console.error('Error deleting user:', error);
  //         this.messageService.add({
  //           severity: 'error',
  //           summary: 'Error',
  //           detail: 'Failed to delete user. Please try again.'
  //         });
  //       },
  //       complete: () => {
  //         this.isLoadingUsers = false;
  //       }
  //     });
  //   }
  // }

  closeAddForm(): void {
    this.showAddForm = false;
  }

  closeEditForm(): void {
    this.showEditForm = false;
    this.selectedUser = null;
  }

  closeViewForm(): void {
    this.showViewForm = false;
    this.selectedUser = null;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedUser = null;
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


  onSelectChange(event: any): void {
    //console.log(event)
     if(event.key==='process'){
    this.apiService.get('access/role-process-mappings/?process_id='+event.value).subscribe((data: any) => {
      const newdata= data.map((item: any) => {
        return {
          label:item.role_name,
          value:item.user_role,
        }
      });
      this.setResponse(newdata,'role');
      this.initialUserData[event.key]=event.value;
      this.initialUserData={...event.formData}
    });
  }
    
  
    
  }
  onPageChange(event: any): void {
    console.log('Page change event:', event);
    const newPage = event.page + 1; // PrimeNG uses 0-based indexing
    const newPageSize = event.rows;
    
    this.currentPage = newPage;
    this.rowsPerPage = newPageSize;
    
    // Fetch data for the new page
    this.fetchUsers(newPage, newPageSize);
  }

  onRowsPerPageChange(event: any): void {
    console.log('Rows per page change event:', event);
    this.rowsPerPage = event.value;
    this.currentPage = 1; // Reset to first page when changing page size
    
    // Fetch data with new page size
    this.fetchUsers(1, this.rowsPerPage);
  }
}
