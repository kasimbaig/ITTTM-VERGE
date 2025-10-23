import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ApiService } from '../../services/api.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AddFormComponent } from '../../shared/components/add-form/add-form.component';
import { CommonModule } from '@angular/common';
import { PaginatedTableComponent } from '../../shared/components/paginated-table/paginated-table.component';

@Component({
  selector: 'app-ship',
  imports: [
    TableModule,
    AddFormComponent,
    CommonModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    TieredMenuModule,
    PaginatedTableComponent,
  ],
  templateUrl: './ship.component.html',
  styleUrl: './ship.component.css',
})
export class ShipComponent implements OnInit {
  searchText: string = '';
  departments: any = [];
  title: string = 'Add new Ship';
  isFormOpen: boolean = false;
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  deletedisplayModal: boolean = false;

  newDepartment = {
    code: '',
    name: '',
    description: '',
    sfd_applicable: 1,
    active: 1,
  };
  selectedDept: any = {
    code: '',
    name: '',
    description: '',
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
      label: 'SFD Applicable',
      key: 'sfd_applicable',
      type: 'text',
      required: true,
    },
    {
      label: 'Description',
      key: 'description',
      type: 'textarea',
      required: true,
    },
  ];
  filteredDepartments: any = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getDepartments();
  }
  toggleForm(open: boolean) {
    this.isFormOpen = open;
  }

  getDepartments(): void {
    this.apiService
      .get<any[]>('master/ship/') // Adjust endpoint
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
    this.selectedDept = {
      code: '',
      name: '',
      description: '',
    };
  }
  handleSubmit(data: any) {
    this.newDepartment = data;
    //console.log('New Department:', this.newDepartment);
    this.apiService.post(`master/ship/`, this.newDepartment).subscribe({
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
    //console.log(dept);
    this.selectedDept = dept;
  }
  editDeptDetails(dept: any) {
    this.editdisplayModal = true;
    this.selectedDept = { ...dept };
  }
  deleteDeptDetails(dept: any) {
    this.deletedisplayModal = true;
    this.selectedDept = dept;
  }
  confirmDeletion() {
    this.apiService.delete(`master/ship/${this.selectedDept.id}/`).subscribe({
      next: (data: any) => {
        //console.log(data);
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
    this.closeDialog();
  }
  confirmEdit() {
    this.apiService
      .put(`master/ship/${this.selectedDept.id}/`, this.selectedDept)
      .subscribe({
        next: (data: any) => {
          //console.log(data);
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
    //console.log(this.selectedDept);
    this.closeDialog();
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
    { field: 'equipment', header: 'Equipment Name' },
    { field: 'ship', header: 'Ship' },
    { field: 'no_of_fits', header: 'No. of Fits' },
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
}
