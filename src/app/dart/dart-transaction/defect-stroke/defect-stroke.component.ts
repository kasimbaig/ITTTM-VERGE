import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';
import { CommonModule } from '@angular/common';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DropdownModule } from 'primeng/dropdown';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';


interface Card {
  label: string;
  selectedOption: any; // or more specific type if needed
  options: CardOption[];
}
interface CardOption {
  label: string;
  value: any;
}


@Component({
  selector: 'app-defect-stroke',
  imports: [
    TableModule,
    // AddFormComponent,
    CommonModule, DropdownModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    TieredMenuModule,
    PaginatedTableComponent,
    ToastComponent,
    Dialog,
    ReactiveFormsModule,
    CheckboxModule,
    CalendarModule,
    ButtonModule,
    InputTextModule
],
  templateUrl: './defect-stroke.component.html',
  styleUrl: './defect-stroke.component.scss'
})
export class DefectStrokeComponent {
  title: string = 'Add new Delay';
  isFormOpen: boolean = false;
  searchText: string = '';
  departments: any = [];
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  deletedisplayModal: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit';
  formFields = [
    { name: 'dart_id', label: 'Dart ID', type: 'number' },
    { name: 'ShipSrNo', label: 'Ship Sr No', type: 'text' },
    { name: 'DartDate', label: 'Dart Date', type: 'date' },
    { name: 'ExDept', label: 'Ex Dept', type: 'text' },
    { name: 'ExDeptID', label: 'Ex Dept ID', type: 'number' },
    { name: 'EquipmentShipID', label: 'Equipment Ship ID', type: 'number' },
    { name: 'EquipmentCode', label: 'Equipment Code', type: 'text' },
    { name: 'SeverityID', label: 'Severity ID', type: 'number' },
    { name: 'SeverityCode', label: 'Severity Code', type: 'text' },
    { name: 'DiagnosticID', label: 'Diagnostic ID', type: 'number' },
    { name: 'DiagnosticCode', label: 'Diagnostic Code', type: 'text' },
    { name: 'RectifiedDate', label: 'Rectified Date', type: 'date' },
    { name: 'RepairID', label: 'Repair ID', type: 'number' },
    { name: 'RepairCode', label: 'Repair Code', type: 'text' },
    { name: 'RepairAgencyID', label: 'Repair Agency ID', type: 'number' },
    { name: 'AgencyCode', label: 'Agency Code', type: 'text' },
    { name: 'DelayID', label: 'Delay ID', type: 'number' },
    { name: 'DelayCode', label: 'Delay Code', type: 'text' },
    { name: 'Remarks', label: 'Remarks', type: 'text' },
    { name: 'OpdefSrNo', label: 'Opdef Sr No', type: 'text' },
    { name: 'XdueRefitType', label: 'Xdue Refit Type', type: 'text' },
    { name: 'XdueRefitRemarks', label: 'Xdue Refit Remarks', type: 'text' },
    { name: 'CancelDate', label: 'Cancel Date', type: 'date' },
    { name: 'NILDart', label: 'NIL Dart', type: 'checkbox' },
    { name: 'Active', label: 'Active', type: 'checkbox' },
    { name: 'CreatedDate', label: 'Created Date', type: 'date' },
    { name: 'UpdatedBy', label: 'Updated By', type: 'text' },
    { name: 'UpdatedDate', label: 'Updated Date', type: 'date' },
    { name: 'Source', label: 'Source', type: 'text' },
    { name: 'status', label: 'Status', type: 'text' },
    { name: 'created_ip', label: 'Created IP', type: 'text' },
    { name: 'CreatedBy_id', label: 'Created By ID', type: 'number' },
    { name: 'DepartmentID_id', label: 'Department ID', type: 'number' },
    { name: 'defectlist_code', label: 'Defect List Code', type: 'text' },
    { name: 'defectlist_name', label: 'Defect List Name', type: 'text' },
    { name: 'refittype_id', label: 'Refit Type ID', type: 'number' },
    { name: 'dl_upload_status_id', label: 'DL Upload Status ID', type: 'number' }
  ];
  

  newDetails = {
    name: '',
    active: 1,
  };
  selectedDetails: any = {
    name: '',
    description: '',
  };
  formConfigForNewDetails = [
    {
      label: 'Name',
      key: 'name',
      type: 'text',
      required: true,
    },
  ];

  toggleForm(open: boolean) {
    this.isFormOpen = open;
  }

  filteredDepartments: any = [];

  constructor(private apiService: ApiService, private toastService: ToastService,  private fb: FormBuilder
  ) {}
  defectForm!: FormGroup;

  ngOnInit(): void {
    this.getDepartments();
    this.createForm();
  }
  createForm() {
    const group: any = {};
    this.formFields.forEach((field) => {
      group[field.name] = [''];
    });
    this.defectForm = this.fb.group(group);
  }

  getDepartments(): void {
    this.apiService
      .get<any[]>('master/propulsion/') // Adjust endpoint
      .subscribe({
        next: (data) => {
          this.departments = data;
          this.filteredDepartments = [...this.departments];
        },
        error: (error) => {
          console.error('Error fetching departments:', error);
        },
      });
  }
  onInputFocus(event: any): void {
    event.target.style.borderColor = '#007acc';  // Example: Change border color on focus
  }
  // Search function
  filterDepartments() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.departments = [...this.filteredDepartments]; // Reset to original list if search is empty
      return;
    }

    this.departments = this.filteredDepartments.filter(
      (dept: { name: string; description: string }) =>
        dept.name.toLowerCase().includes(search) ||
        dept.description.toLowerCase().includes(search)
    );
  }
  openAddDept() {
    this.deptdisplayModal = true;
  }

  closeDialog() {
    this.deptdisplayModal = false;
    this.viewdisplayModal = false;
    this.deletedisplayModal = false;
    this.editdisplayModal = false;
 
  }
  handleSubmit(data: any) {
    this.newDetails = { ...this.newDetails, ...data };

    this.apiService.post(`master/propulsion/`, this.newDetails).subscribe({
      next: (data: any) => {
        //console.log(data);
        this.departments.push(data);
        this.filteredDepartments.push(data);
      },
      error: (error) => {
        console.error('Login failed:', error);
        alert('Invalid login credentials');
      },
    });
    this.closeDialog();
  }

  viewDeptDetails(dept: any) {
    this.viewdisplayModal = true;
  }
  editDetails(details: any, open: boolean) {
    this.selectedDetails = { ...details };
    this.isEditFormOpen = true;
  }
  deleteDeptDetails(dept: any): void {
    this.deletedisplayModal = true;
    // this.selectedDept = dept;
  }
  
  
  confirmDeletion() {
    this.apiService
      .delete(`master/country/${this.selectedDetails.id}/`)
      .subscribe({
        next: (data: any) => {
          //console.log(data);
          this.toastService.showSuccess('Country deleted successfully');
  
          // ✅ Remove from local array
          this.departments = this.departments.filter(
            (            dept: { id: any; }) => dept.id !== this.selectedDetails.id
          );
          this.filteredDepartments = [...this.departments];
  
          // ✅ Close modal/dialog
          this.closeDialog();
          this.deletedisplayModal = false;
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }
  handleEditSubmit(data: any) {
    this.selectedDetails = { ...this.selectedDetails, ...data };  
    this.apiService
      .put(`master/country/${this.selectedDetails.id}/`, this.selectedDetails)
      .subscribe({
        next: (data: any) => {
          //console.log(data);
          this.toastService.showSuccess('Updated Country successfully');
  
          this.getDepartments();
            this.closeDialog();
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }
  
  exportOptions = [
    {
      label: 'Export as PDF',
      icon: 'pi pi-file-pdf',
      command: () => this.exportPDF(),
    },
    {
      label: 'Export as Excel',
      icon: 'pi pi-file-excel',
      command: () => this.exportExcel(),
    },
  ];
  cols = [
    { field: 'id', header: 'DartDate' },
    { field: 'name', header: 'ExDept' },
    { field: 'name', header: 'EquipmentCode' },
    { field: 'name', header: 'DiagnosticCode' },
    { field: '', header: 'RepairCode' },



  ];
  @ViewChild('dt') dt!: Table;
  value: number = 0;
  stateOptions: any[] = [
    { label: 'Equipment Specification', value: 'equipment' },
    { label: 'HID Equipment', value: 'hid' },
    { label: 'Generic Specification', value: 'generic' },
  ];
  tabvalue: string = 'equipment';
  @Output() exportCSVEvent = new EventEmitter<void>();
  @Output() exportPDFEvent = new EventEmitter<void>();
  exportPDF() {
    //console.log('Exporting as PDF...');
    // Your PDF export logic here
    this.exportPDFEvent.emit(); // Emit event instead of direct call
    const doc = new jsPDF();
    autoTable(doc, {
      head: [this.cols.map((col) => col.header)],
      body: this.departments.map((row: { [x: string]: any }) =>
        this.cols.map((col) => row[col.field] || '')
      ),
    });
    doc.save(`${this.tableName || 'table'}.pdf`); // ✅ Use backticks
  }
  @Input() tableName: string = '';
  exportExcel() {
    //console.log('Exporting as Excel...');
    // Your Excel export logic here
    this.exportCSVEvent.emit(); // Emit event instead of direct call
    const headers = this.cols.map((col) => col.header);
    const rows = this.departments.map((row: { [x: string]: any }) =>
      this.cols.map((col) => row[col.field] || '')
    );
    const csv = [
      headers.join(','),
      ...rows.map((row: any[]) => row.join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.tableName || 'table'}.csv`; // ✅ Use backticks
    link.click();
    window.URL.revokeObjectURL(url);
  }
  showEquipmentPopup = false;
  selectedEquipment = [
    {
      name: 'Pump A',
      type: 'Hydraulic',
      status: 'Active',
      shipId: 'EQ-0012',
      defectType: 'Seal Leakage',
      occurrenceDate: '2025-04-15',
      rectificationDate: null,
      remainingSteps: [
        'Assign repair agency',
        'Schedule rectification',
        'Upload inspection report'
      ]
    },
    {
      name: 'Valve B',
      type: 'Pneumatic',
      status: 'Pending',
      shipId: 'EQ-0018',
      defectType: 'Pressure Fault',
      occurrenceDate: '2025-03-28',
      rectificationDate: '2025-04-05',
      remainingSteps: [
        'Verify post-repair performance'
      ]
    }
  ];
  
showAcquiredFrom(department: any) {
 // Adjust based on your data model
  this.showEquipmentPopup = true;
}
applyFilter(card: any, value: any) {
  //console.log(card, value);

}
cards: Card[] = [
  {
    label: 'Ship',
    selectedOption: null,
    options: [],
  },
  {
    label: 'Command',
    selectedOption: null,
    options: [],
  },
 

]; 
resetFilters() {
  this.cards.forEach((card) => {
    card.selectedOption = null;
    if (card.label !== 'Ship') {
      card.options = [];
    }
  });
  // this.transactions = [];
}
}


