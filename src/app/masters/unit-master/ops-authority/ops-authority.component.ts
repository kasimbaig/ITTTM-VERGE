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
import { ApiService } from '../../../services/api.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AddFormComponent } from '../../../shared/components/add-form/add-form.component';
import { CommonModule , Location} from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { ViewDetailsComponent } from '../../../shared/components/view-details/view-details.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-ops-authority',
  imports: [
    TableModule,
    AddFormComponent,
    CommonModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    PaginatedTableComponent,
    TieredMenuModule,
    ToastComponent,
    DeleteConfirmationModalComponent,
    ViewDetailsComponent
  ],
  templateUrl: './ops-authority.component.html',
  styleUrl: './ops-authority.component.css',
})
export class OpsAuthorityComponent {
  searchText: string = '';
  title: string = 'Add new OPS Authority';
  isFormOpen: boolean = false;
  departments: any = [];
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  showDeleteDialog: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit OPS Authority';
  commands: any = [];
  newDepartment = {
    command: '',
    authority: '',
    address: '',
    active: 1,
  };
  selectedDept: any = {
    command: '',
    authority: '',
    description: '',
  };
  filteredDepartments: any = [];
  formConfigForNewDetails = [
    {
      label: 'OPS Authority',
      key: 'authority',
      type: 'text',
      required: true,
    },
    {
      label: 'Command',
      key: 'command',
      type: 'select',
      options: [],
      required: true,
    },
    
    {
      label: 'Address', 
      key: 'address',
      type: 'textarea',
      required: false,
    },
  ];
  toggleForm(open: boolean) {
    this.isFormOpen = open;
  }

  constructor(private apiService: ApiService,    private toastService: ToastService, private location: Location 
  ) {}

  ngOnInit(): void {
    this.getAuthorities();
  }
  goBack(){
    this.location.back();
  }

  getAuthorities(): void {
    forkJoin({
      opsAuthority: this.apiService.get<any>('master/ops-authority/'),
      command: this.apiService.get<any>('master/command/?is_dropdown=true')
    }).subscribe({
      next: ({ opsAuthority, command }) => {
        // Handle opsAuthority response
        if (opsAuthority && opsAuthority.results) {
          this.departments = opsAuthority.results;
        } else {
          this.departments = opsAuthority;
        }
        this.filteredDepartments = [...this.departments];
        this.formConfigForNewDetails[1].options = command.map((item:any)=>({
          label: item.name,
          value: item.id
        }));
     
      },
      error: (error) => {
        console.error('Error fetching data:', error);
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
      (dept: { name: string; authority: string; code: string; ops_order: string; address: string }) =>
        dept.name.toLowerCase().includes(search) ||
        dept.authority.toLowerCase().includes(search) ||
        dept.code.toLowerCase().includes(search) ||
        dept.ops_order.toLowerCase().includes(search) ||
        dept.address.toLowerCase().includes(search)
    );
  }
  openAddDept() {
    this.deptdisplayModal = true;
  }

  closeDialog() {
    this.deptdisplayModal = false;
    this.viewdisplayModal = false;
    this.showDeleteDialog = false;
    this.editdisplayModal = false;
    this.isFormOpen = false;
    this.isEditFormOpen = false;
    this.selectedDept = {
      code: '',
      name: '',
      description: '',
    };
  }

  handleSubmit(data: any) {
    this.newDepartment = { ...this.newDepartment, ...data };  
    this.apiService
      .post(`master/ops-authority/`, this.newDepartment)
      .subscribe({
        next: (data: any) => {
          //console.log(data);
          this.toastService.showSuccess(data.message || 'OPS added successfully');
          // Refresh the data after successful addition
          this.getAuthorities();
          this.closeDialog();
        },
        error: (err) => {
          const errorMsg = err?.error?.error || 'Something went wrong';
          this.toastService.showError(errorMsg);
        },
      });
  }
  viewDeptDetails(dept: any) {
    this.viewdisplayModal = true;
    this.selectedDept = dept;
  }
  editDetails(dept: any, open: boolean) {
    this.isEditFormOpen = open;
    this.selectedDept = { ...dept };
  }
  deleteDeptDetails(dept: any) {
    this.showDeleteDialog = true;
    this.selectedDept = dept;
  }

  confirmDeletion() {
    this.apiService
      .delete(`master/ops-authority/${this.selectedDept.id}/`)
      .subscribe({
        next: (data: any) => {
          this.toastService.showSuccess('Deleted successfully');
          // Refresh the data after successful deletion
          this.getAuthorities();
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
    this.selectedDept = { ...this.selectedDept, ...data };
    this.apiService
      .put(`master/ops-authority/${this.selectedDept.id}/`, this.selectedDept)
      .subscribe({
        next: (data: any) => {
          this.toastService.showSuccess('Updated successfully');
          // Refresh the data after successful edit
          this.getAuthorities();
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
    // { field: 'name', header: 'Name' },
    // { field: 'code', header: 'Code' },
    { field: 'authority', header: 'OPS Authority' },
    { field: 'command.name', header: 'Command' },
    { field: 'address', header: 'Address' },
    { field: 'active', header: 'Active' },
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
    doc.save(`${this.tableName || 'ops-authority'}.pdf`); // ✅ Use backticks
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
    link.download = `${this.tableName || 'ops-authority'}.csv`; // ✅ Use backticks
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
