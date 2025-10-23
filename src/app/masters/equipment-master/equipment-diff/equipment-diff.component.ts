import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ApiService } from '../../../services/api.service';
import { TieredMenuModule } from 'primeng/tieredmenu';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AddFormComponent } from '../../../shared/components/add-form/add-form.component';
import { CommonModule, Location } from '@angular/common';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { ViewDetailsComponent } from '../../../shared/components/view-details/view-details.component';

@Component({
  selector: 'app-equipment-diff',
  imports: [
    TableModule,
    AddFormComponent,
    CommonModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    TieredMenuModule,
    PaginatedTableComponent,
    DeleteConfirmationModalComponent,
    ViewDetailsComponent
  ],
  templateUrl: './equipment-diff.component.html',
  styleUrl: './equipment-diff.component.css',
})
export class EquipmentDiffComponent implements OnInit {
  searchText: string = '';
  title: string = 'Add new Equipment Difference';
  isFormOpen: boolean = false;
  departments: any = [];
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  showDeleteDialog: boolean = false;
  filteredEquipment: any[] = [];
  filteredSFDHierarchy: any[] = [];
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit Equipment Difference';

  newDepartment = {
    equipment_1: null,
    sfd_hierarchy: null,
    equipment_2: null,
    common_diff: '',
    active: 1,
  };
  
  selectedDept: any = {
    equipment_1: null,
    sfd_hierarchy: null,
    equipment_2: null,
    common_diff: '',
    active: 1,
  };

  formConfigForNewDetails = [
    {
      label: 'Equipment 1',
      key: 'equipment_1',
      type: 'select',
      options: this.filteredEquipment,
      required: true,
    },
    {
      label: 'Equipment 2',
      key: 'equipment_2',
      type: 'select',
      options: this.filteredEquipment,
      required: true,
    },
    {
      label: 'Common Difference',
      key: 'common_diff',
      type: 'text',
      required: true,
    },

    {
      label: 'SFD Hierarchy',
      key: 'sfd_hierarchy',
      type: 'select',
      options: this.filteredSFDHierarchy,
      required: true,
    },
  ];
  toggleForm(open: boolean) {
    this.isFormOpen = open;
  }
  filteredDepartments: any = [];

  // New properties for pagination
  apiUrl: string = 'sfd/equipment-common-diff/';
  totalCount: number = 0;

  constructor(private apiService: ApiService, private location:Location, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    //console.log('🚢 Equipment Diff Component Initializing...');
    //console.log('API URL:', this.apiUrl);
    //console.log('Total Count:', this.totalCount);
    //console.log('Enable URL Fetching: true');
    
    // Load master data for dropdowns (but not differences data - paginated table will handle that)
    this.getEquipmentDetails();
    this.getSFDHierarchyDetails();
    
    // Note: Table data will be loaded by the paginated table component
    // No need to call getDepartments() here
  }
  goBack(){
    this.location.back();
  }
  getSFDHierarchyDetails(): void {
    this.apiService.get<any[]>('master/sfd-hierarchy/?is_dropdown=true').subscribe({
      next: (data) => {
        //console.log(data);
        this.filteredSFDHierarchy = data.map((details: any) => ({
          label: details.name,
          value: details.id,
        }));
        const sfdHierarchyField = this.formConfigForNewDetails.find(
          (field) => field.key === 'sfd_hierarchy'
        );

        if (sfdHierarchyField) {
          sfdHierarchyField.options = this.filteredSFDHierarchy;
        }
      }
    });
  }
  getEquipmentDetails(): void {
    this.apiService.get<any[]>('master/equipment/?is_dropdown=true').subscribe({
      next: (data) => {
        //console.log(data);
        this.filteredEquipment = data.map((details: any) => ({
          label: details.name,
          value: details.id,
        }));
        const equipmentField1 = this.formConfigForNewDetails.find(
          (field) => field.key === 'equipment_1'
        );
        const equipmentField2 = this.formConfigForNewDetails.find(
          (field) => field.key === 'equipment_2'
        );

        if (equipmentField1) {
          equipmentField1.options = this.filteredEquipment;
        }
        if (equipmentField2) {
          equipmentField2.options = this.filteredEquipment;
        }
      },
      error: (error) => {
        console.error('Error fetching departments:', error);
      },
    });
  }

  getDepartments(): void {
    this.apiService
      .get<any>('sfd/equipment-common-diff/') // Adjust endpoint
      .subscribe({
        next: (response) => {
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
  // Search function
  filterDepartments() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.departments = [...this.filteredDepartments]; // Reset to original list if search is empty
      return;
    }

    this.departments = this.filteredDepartments.filter(
      (dept: any) =>
        dept.equipment_1_name?.toLowerCase().includes(search) ||
        dept.equipment_2_name?.toLowerCase().includes(search) ||
        dept.sfd_hierarchy_name?.toLowerCase().includes(search) ||
        dept.common_diff?.toLowerCase().includes(search)
    );
  }

  closeDialog() {
    this.deptdisplayModal = false;
    this.viewdisplayModal = false;
    this.showDeleteDialog = false;
    this.editdisplayModal = false;
    this.isFormOpen = false;
    this.isEditFormOpen = false;
    this.selectedDept = {
      equipment_1: null,
      sfd_hierarchy: null,
      equipment_2: null,
      common_diff: '',
      active: 1,
    };
  }
  handleSubmit(data: any) {
    this.newDepartment = data;
    let payload = {...this.newDepartment, active: 1};
    //console.log('New Department:', this.newDepartment);
    this.apiService
      .post(`sfd/equipment-common-diff/`, payload)
      .subscribe({
        next: (data: any) => {
          //console.log(data);
          // Refresh the data after successful addition
          this.getDepartments();
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
    //console.log(dept);
    this.selectedDept = dept;
  }
  editDetails(dept: any, open: boolean) {
    this.selectedDept = { ...dept };
    this.isEditFormOpen = open;
  }
  deleteDeptDetails(dept: any) {
    this.showDeleteDialog = true;
    this.selectedDept = dept;
  }
  confirmDeletion() {
    this.apiService
      .delete(`sfd/equipment-common-diff/${this.selectedDept.id}/`)
      .subscribe({
        next: (data: any) => {
          //console.log(data);
          // Refresh the data after successful deletion
          this.getDepartments();
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
      .put(
        `sfd/equipment-common-diff/${this.selectedDept.id}/`,
        this.selectedDept
      )
      .subscribe({
        next: (data: any) => {
          //console.log(data);
          // Refresh the data after successful edit
          this.getDepartments();
          this.closeDialog();
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
    //console.log(this.selectedDept);
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
    { field: 'equipment_1_name', header: 'Equipment 1 Name', filterType: 'text' },
    { field: 'equipment_1_code', header: 'Equipment 1 Code', filterType: 'text' },
    { field: 'equipment_2_name', header: 'Equipment 2 Name', filterType: 'text' },
    { field: 'equipment_2_code', header: 'Equipment 2 Code', filterType: 'text' },
    { field: 'sfd_hierarchy_name', header: 'SFD Hierarchy', filterType: 'text' },
    { field: 'common_diff', header: 'Common Difference', filterType: 'text' },
    { field: 'active', header: 'Active', filterType: 'text', transform: (value: number) => (value === 1 ? 'Y' : 'N') },
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
        this.cols.map((col) => {
          if (col.transform) {
            return col.transform(row[col.field]);
          }
          return row[col.field] || '';
        })
      ),
    });
    doc.save(`${this.tableName || 'equipment_diff'}.pdf`); // ✅ Use backticks
  }
  @Input() tableName: string = '';
  exportExcel() {
    //console.log('Exporting as Excel...');
    // Your Excel export logic here
    this.exportCSVEvent.emit(); // Emit event instead of direct call
    const headers = this.cols.map((col) => col.header);
    const rows = this.departments.map((row: { [x: string]: any }) =>
      this.cols.map((col) => {
        if (col.transform) {
          return col.transform(row[col.field]);
        }
        return row[col.field] || '';
      })
    );
    const csv = [
      headers.join(','),
      ...rows.map((row: any[]) => row.join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.tableName || 'equipment_diff'}.csv`; // ✅ Use backticks
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Handle data loaded from paginated table
  onDataLoaded(data: any[]): void {
    //console.log('🚢 Data loaded from paginated table:', data);
    //console.log('🚢 Data length:', data?.length);
    //console.log('🚢 Data type:', typeof data);
    //console.log('🚢 First record:', data?.[0]);
    
    this.departments = data || [];
    this.filteredDepartments = [...(data || [])];
    
    //console.log('🚢 Departments array updated:', this.departments);
    //console.log('🚢 Filtered departments updated:', this.filteredDepartments);
    
    // Force change detection
    this.cdr.detectChanges();
  }
}
