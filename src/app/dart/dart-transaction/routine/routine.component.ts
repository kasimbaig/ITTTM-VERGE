
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { DropdownModule } from 'primeng/dropdown';
import { AddFormComponent } from '../../../shared/components/add-form/add-form.component';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

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
  selector: 'app-routine',
  imports: [
    DropdownModule,
    TableModule,
    AddFormComponent,
    CommonModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    TieredMenuModule,
    PaginatedTableComponent,
    ToastComponent,
    Dialog

  ],
  templateUrl: './routine.component.html',
  styleUrl: './routine.component.scss'
})
export class RoutineComponent {
  title: string = 'Add New Routine';
  isFormOpen: boolean = false;
  searchText: string = '';
  departments: any = [];
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  deletedisplayModal: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit';

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

  constructor(private apiService: ApiService, private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.getDepartments();
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
    { field: 'id', header: 'Eqpt Name' },
    // { field: 'name', header: 'Nomenclature' },
    { field: 'name', header: 'Month Avg Running Hrs' },
    { field: 'name', header: 'Running H/R Routine Due' },
    { field: '', header: 'Date of Next Routine Due' },



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
    doc.save(`${this.tableName || 'table'}.pdf`); // Use backticks
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
    link.download = `${this.tableName || 'table'}.csv`; // Use backticks
    link.click();
    window.URL.revokeObjectURL(url);
  }
  cards: Card[] = [
    {
      label: 'Department',
      selectedOption: null,
      options: [],
    },
    {
      label: 'Equipment',
      selectedOption: null,
      options: [],
    },
    {
      label: 'Section',
      selectedOption: null,
      options: [],
    },
    {
      label: 'Frequency',
      selectedOption: null,
      options: [],
    },

  ];
  applyFilter(card: any, value: any) {
    //console.log(card, value);

  }
  onMaintopDetailChange(value: any) {}
  
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


