import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { SharedLayoutComponent } from '../shared-layout/shared-layout.component';
import { AddFormComponent } from '../shared/components/add-form/add-form.component';

@Component({
  selector: 'app-new-user-registration',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    SharedLayoutComponent,
    AddFormComponent
  ],
  templateUrl: './new-user-registration.component.html',
  styleUrls: ['./new-user-registration.component.scss']
})
export class NewUserRegistrationComponent {
  showRegistrationForm = false;
  
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

  constructor(private router: Router) {}

  openRegistrationForm() {
    this.showRegistrationForm = true;
  }

  onBackToLogin() {
    this.router.navigate(['/home']);
  }

  onRegistrationSubmit(formData: any) {
    //console.log('Registration form submitted:', formData);
    // Handle form submission - you can add API call here
    alert('Registration submitted successfully!');
    this.showRegistrationForm = false;
    this.router.navigate(['/home']);
  }

  onFormOpenChange(isOpen: boolean) {
    this.showRegistrationForm = isOpen;
  }
}
