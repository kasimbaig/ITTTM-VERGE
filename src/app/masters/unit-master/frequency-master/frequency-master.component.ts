import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { CommonModule, Location } from '@angular/common';
import { TieredMenuModule } from 'primeng/tieredmenu';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AddFormComponent } from '../../../shared/components/add-form/add-form.component';
import { ToastService } from '../../../services/toast.service';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { ViewDetailsComponent } from '../../../shared/components/view-details/view-details.component';

@Component({
  selector: 'app-frequency-master',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    DropdownModule,
    CommonModule,
    PaginatedTableComponent,
    TieredMenuModule,
    AddFormComponent,
    ToastComponent,
    DeleteConfirmationModalComponent,
    ViewDetailsComponent
  ],
  templateUrl: './frequency-master.component.html',
  styleUrl: './frequency-master.component.css',
  providers: [ToastService],
})
export class FrequencyMasterComponent implements OnInit {
  toggleTable=true
  searchText: string = '';
  departments: any = [];
  title: string = 'Add new Frequency';
  isFormOpen: boolean = false;
  filteredDepartments: any = [];
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  showDeleteDialog: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit Frequency';

  newDepartment = {
    code: '',
    name: '',
    description: '',
    frequency_type: '',
    interval: null,
    active: 1,
  };
  selectedDept: any = {
    code: '',
    name: '',
    description: '',
    frequency_type: '',
    interval: 0,
    active: 1,
  };
  frequencyOptions = [
    { label: 'Hourly', value: 'hourly' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Quarterly', value: 'quarterly' },
    { label: 'Yearly', value: 'yearly' },
  ];

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
      label: 'Frequency Type',
      key: 'frequency_type',
      type: 'text',
      required: true,
    },
    {
      label: 'Interval',
      key: 'interval',
      type: 'number',
      required: true,
    },
    {
      label: 'Description',
      key: 'description',
      type: 'textarea',
      required: false,
    },
  ];
  toggleForm(open: boolean) {
    this.isFormOpen = open;
  }

  constructor(
    private apiService: ApiService,
    private toastService: ToastService, private location: Location
  ) {}

  ngOnInit(): void {
    this.getFrequencies();
  }
  goBack(){
    this.location.back();
  }
  // Search function
  filterDepartments() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.departments = [...this.filteredDepartments]; // Reset to original list if search is empty
      return;
    }

    this.departments = this.filteredDepartments.filter(
      (dept: { name: string; description: string; code: string; frequency_type: string; interval: number }) =>
        dept.name.toLowerCase().includes(search) ||
        dept.description.toLowerCase().includes(search) ||
        dept.code.toLowerCase().includes(search) ||
        dept.frequency_type.toLowerCase().includes(search) ||
        dept.interval.toString().includes(search)
    );
  }
  getFrequencies(): void {
    this.apiService
      .get<any>('master/frequency/') // Changed to handle paginated response
      .subscribe({
        next: (response) => {
          //console.log(response);
          // Handle paginated response structure
          if (response && response.results) {
            this.departments = response.results;
            this.filteredDepartments = [...this.departments];
          } else {
            // Fallback for non-paginated response
            this.departments = response;
            this.filteredDepartments = [...this.departments];
          }
        },
        error: (error) => {
          console.error('Error fetching departments:', error);
        },
      });
  }

  closeDialog() {
    this.deptdisplayModal = false;
    this.viewdisplayModal = false;
    this.showDeleteDialog = false;
    this.isFormOpen = false;
    this.isEditFormOpen = false;
  }
  handleSubmit(data: any) {
    this.newDepartment = data;
    this.newDepartment.active = 1;

    this.apiService.post(`master/frequency/`, this.newDepartment).subscribe({
      next: (data: any) => {
        this.toggleTable=false
        setTimeout(() => {
          this.toggleTable=true
        }, 100);
        this.toastService.showSuccess('New Frequency Added Successfully');
        // Refresh the data after successful addition
        this.getFrequencies();
        this.closeDialog();
      },
      error: (error) => {
        console.error('Login failed:', error);
        alert('Invalid login credentials');
      },
    });
  }
  viewDeptDetails(dept: any) {
    this.viewdisplayModal = true;
    this.selectedDept = dept;
  }
  selectedRow:any=null
  editDetails(details: any, open: boolean) {
    this.selectedRow=details
    this.selectedDept = { ...details };
    this.isEditFormOpen = open;
  }
  deleteDeptDetails(dept: any) {
    this.selectedRow=dept
    this.selectedDept = { ...dept };
    this.showDeleteDialog = true;
  }

  confirmDeletion() {
    this.apiService
      .delete(`master/frequency/${this.selectedRow.id}/`)
      .subscribe({
        next: (data: any) => {
          this.toggleTable=false
          setTimeout(() => {
            this.toggleTable=true
          }, 100);
          this.toastService.showSuccess('Frequency Deleted Successfully');
          // Refresh the data after successful deletion
          this.getFrequencies();
          this.showDeleteDialog = false;
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }

  cancelDeletion() {
    this.showDeleteDialog = false;
  }

  handleEditSubmit(data: any) {
    this.selectedDept = { ...data };

    //console.log(data);
    //console.log(this.selectedDept);
    this.selectedDept.active = 1;

    this.apiService.put(`master/frequency/${this.selectedRow.id}/`, this.selectedDept)
      .subscribe({
        next: (data: any) => {
          this.toggleTable=false
          setTimeout(() => {
            this.toggleTable=true
          }, 100);
          this.toastService.showSuccess('Frequency Edited Successfully');
          // Refresh the data after successful edit
          this.getFrequencies();
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
    { field: 'code', header: 'Code' },
    { field: 'name', header: 'Name' },
    { field: 'frequency_type', header: 'Frequency Type' },
    { field: 'interval', header: 'Interval' },
    { field: 'description', header: 'Description' },
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
    doc.save(`${this.tableName || 'frequency'}.pdf`); // ✅ Use backticks
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
    link.download = `${this.tableName || 'frequency'}.csv`; // ✅ Use backticks
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
