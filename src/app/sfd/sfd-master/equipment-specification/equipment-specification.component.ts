import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { SelectButton } from 'primeng/selectbutton';
import { TieredMenuModule } from 'primeng/tieredmenu';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AddFormComponent } from '../../../shared/components/add-form/add-form.component';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../services/toast.service';
import { Card } from '../../../interfaces/interfaces';
import { ExportService } from '../../../services/export.service';
import { filterData } from '../../../shared/utils/filter-helper';
import { resetFilterCards } from '../../../shared/utils/filter-helper';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { ViewDetailsComponent } from '../../../shared/components/view-details/view-details.component';

@Component({
  selector: 'app-equipment-specification',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    TieredMenuModule,
    PaginatedTableComponent,
    DropdownModule,
    AddFormComponent,
    CommonModule,
    ToastComponent,
    ConfirmDialogComponent,
    ViewDetailsComponent,
  ],
  templateUrl: './equipment-specification.component.html',
  styleUrl: './equipment-specification.component.css',
})
export class EquipmentSpecificationComponent implements OnInit {
  @Input() tableName: string = 'Equipment Specifications';
  @Output() exportCSVEvent = new EventEmitter<void>();
  @Output() exportPDFEvent = new EventEmitter<void>();

  viewDetialsTitle: string = 'Equipment Specifications';
  searchText: string = '';
  selectedFilterOption: any = null;
  title: string = 'Add new Generic Specification';
  editTitle: string = 'Edit specification';
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  showConfirmDialog: boolean = false;
  isViewDetailsOpen: boolean = false;

  equipmentSpecifications: any[] = [];
  filteredEquipmentSpecifications: any[] = [];
  filteredEquipments: any[] = [];
  filteredSFDHierarchy: any[] = [];
  selectedDetails: any = {};

  newDetails = { active: 1 };
  cards: Card[] = [
    {
      label: 'Equipment',
      selectedOption: null,
      options: [],
    },
    {
      label: 'SFD Hierarchy',
      selectedOption: null,
      options: [],
    },
  ];
  formConfigForNewDetails = [
    {
      label: 'Equipment',
      key: 'equipment',
      type: 'select',
      options: this.filteredEquipments,
      required: true,
    },
    {
      label: 'SFD Hierarchy',
      key: 'sfd_hierarchy',
      type: 'select',
      options: this.filteredSFDHierarchy,
      required: true,
    },
    {
      label: 'Specification Value',
      key: 'specification_value',
      type: 'text',
      required: false,
    },
    {
      label: 'Specification Name',
      key: 'specification_name',
      type: 'text',
      required: false,
    },
    {
      label: 'Specification Unit',
      key: 'specification_unit',
      type: 'text',
      required: false,
    },
  ];
  viewdetailHeader = [
    {
      label: 'Equipment',
      key: 'equipment',
      type: 'select',
      options: this.filteredEquipments,
      required: true,
    },
    {
      label: 'SFD Hierarchy',
      key: 'sfd_hierarchy',
      type: 'select',
      options: this.filteredSFDHierarchy,
      required: true,
    },
    {
      label: 'Group',
      key: 'group',
      type: 'text',
      required: false,
    },
    {
      label: 'Maintop',
      key: 'maintop',
      type: 'text',
      required: false,
    },
  ];

  cols = [
    { field: 'equipment.name', header: 'Equipment Name', filterType: 'text' },
    { field: 'sfd_hierarchy.name', header: 'SFD Hierarchy', filterType: 'text' },
    { field: 'specification_name', header: 'Specification Name', filterType: 'text' },
    { field: 'specification_unit', header: 'Specification Unit', filterType: 'text' },
    { field: 'specification_value', header: 'Specification Value', filterType: 'text' },
  ];

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

  // New properties for pagination
  apiUrl: string = 'sfd/equipment-specifications/';
  totalCount: number = 0;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    //console.log('🚢 SFD Equipment Specification Component Initializing...');
    //console.log('API URL:', this.apiUrl);
    //console.log('Total Count:', this.totalCount);
    //console.log('Enable URL Fetching: true');
    
    this.loadInitialData();
    
    // Note: Table data will be loaded by the paginated table component
    // No need to call getDepartments() here
  }

  loadInitialData(): void {
    this.fetchEquipments();
  }

  fetchEquipments(): void {
    this.apiService.get<any[]>('master/equipment/').subscribe({
      next: (data) => {
        this.filteredEquipments = data.map((eq) => ({
          label: eq.name,
          value: eq.id,
        }));
        const equipmentField = this.formConfigForNewDetails.find(
          (field) => field.key === 'equipment'
        );
        if (equipmentField) equipmentField.options = this.filteredEquipments;

        const equipmentCard = this.cards.find(
          (card) => card.label === 'Equipment'
        );
        if (equipmentCard) {
          equipmentCard.options = data.map((item: any) => ({
            label: item.name,
            value: item.id,
          }));
        }
      },
      error: (err) => console.error('Error fetching equipments:', err),
    });
  }

  applyFilter(card: any, value: any) {
    //console.log(card, value);
    switch (card) {
      case 'SFD Hierarchy':
        this.onSFDChange(value);
        break;
      case 'Equipment':
        this.onEquipmentChange(value);
        break;
    }
  }

  onSFDChange(equipmentId: any) {
    this.apiService
      .get<any[]>(`sfd/equipment-specifications/?equipment=${equipmentId}`)
      .subscribe((headers) => {
        //console.log(headers);
        this.equipmentSpecifications = headers;
      });
  }
  onEquipmentChange(equipmentId: any) {
    this.apiService
      .get<any[]>(`master/sfd-hierarchy/?dropdown=${true}`)
      .subscribe((headers) => {
        const sfdcommandCard = this.cards.find(
          (card) => card.label === 'SFD Hierarchy'
        );
        if (sfdcommandCard) {
          sfdcommandCard.options = headers.map((header) => ({
            label: header.name,
            value: header.id,
          }));
        }
      });
  }

  toggleForm(open: boolean): void {
    this.isFormOpen = open;
  }

  handleSubmit(formData: any): void {
    const payload = { ...formData, active: 1 };

    this.apiService.post('sfd/equipment-specifications/', payload).subscribe({
      next: (res: any) => {
        const newRecord = {
          ...res,
          equipment: {
            id: res.equipment,
            name:
              this.filteredEquipments.find((eq) => eq.value === res.equipment)
                ?.label || '',
          },
          sfd_hierarchy: {
            id: res.sfd_hierarchy,
            name:
              this.filteredSFDHierarchy.find(
                (h) => h.value === res.sfd_hierarchy
              )?.label || '',
          },
        };

        this.equipmentSpecifications.unshift(newRecord);
        this.filteredEquipmentSpecifications = [
          ...this.equipmentSpecifications,
        ];
        this.toastService.showSuccess(
          'Successfully added new Equipment Specification'
        );
        this.isFormOpen = false;
      },
      error: (err) => {
        console.error('Submission failed:', err);
        this.toastService.showError('Invalid Credentials');
      },
    });
  }
  resetFilters() {
    resetFilterCards(this.cards, 'Equipment', this.equipmentSpecifications);
    this.selectedFilterOption = null;
    this.filteredEquipmentSpecifications = [...this.equipmentSpecifications];
  }

  getDropdownOptions(): any[] {
    return this.cards && this.cards.length > 0 ? this.cards[0].options : [];
  }

  onFilterChange(event: any) {
    if (this.cards && this.cards.length > 0) {
      this.applyFilter(this.cards[0].label, event.value);
    }
  }

  handleEditSubmit(formData: any): void {
    const updatedPayload = { ...this.selectedDetails, ...formData };

    this.apiService
      .put(`sfd/equipment-specifications/${updatedPayload.id}/`, updatedPayload)
      .subscribe({
        next: (res: any) => {
          const updatedRecord = {
            ...res,
            equipment: {
              id: res.equipment,
              name:
                this.filteredEquipments.find((eq) => eq.value === res.equipment)
                  ?.label || '',
            },
            sfd_hierarchy: {
              id: res.sfd_hierarchy,
              name:
                this.filteredSFDHierarchy.find(
                  (h) => h.value === res.sfd_hierarchy
                )?.label || '',
            },
          };

          const index = this.equipmentSpecifications.findIndex(
            (item) => item.id === res.id
          );
          if (index !== -1) this.equipmentSpecifications[index] = updatedRecord;

          this.filteredEquipmentSpecifications = [
            ...this.equipmentSpecifications,
          ];
          this.toastService.showSuccess(
            ' Equipment Specification updated successfully'
          );
          this.isEditFormOpen = false;
        },
        error: (err) => {
          console.error('Update failed:', err);
          this.toastService.showError(
            'Failed to update Equipment Specification'
          );
        },
      });
  }

  viewDetails(details: any, open: boolean): void {
    this.isViewDetailsOpen = open;
    this.selectedDetails = { ...details };
    this.selectedDetails.group = this.selectedDetails.group.code;
    //console.log(this.selectedDetails);
  }

  editDetails(details: any, open: boolean): void {
    this.selectedDetails = { ...details };
    this.isEditFormOpen = open;
  }

  deleteDetails(details: any): void {
    this.selectedDetails = { ...details };
    this.showConfirmDialog = true;
  }

  onConfirmDelete(confirmed: boolean): void {
    if (!confirmed) {
      this.showConfirmDialog = false;
      return;
    }

    this.apiService
      .delete(`sfd/equipment-specifications/${this.selectedDetails.id}/`)
      .subscribe({
        next: () => {
          this.equipmentSpecifications = this.equipmentSpecifications.filter(
            (item) => item.id !== this.selectedDetails.id
          );
          this.toastService.showSuccess(
            'Equipment specification deleted successfully'
          );
          this.showConfirmDialog = false;
        },
        error: (err) => {
          console.error('Deletion failed:', err);
          this.toastService.showError('Failed to delete');
        },
      });
  }

  filterHeaders() {
    this.equipmentSpecifications = filterData(
      this.equipmentSpecifications,
      this.searchText,
      ['specification_name']
    );
  }

  exportExcel() {
    this.exportService.exportExcel(
      this.cols,
      this.equipmentSpecifications,
      this.tableName
    );
  }
  exportPDF() {
    this.exportService.exportPDF(
      this.cols,
      this.equipmentSpecifications,
      this.tableName
    );
  }

  // Handle data loaded from paginated table
  onDataLoaded(data: any[]): void {
    //console.log('🚢 Data loaded from paginated table:', data);
    //console.log('🚢 Data length:', data?.length);
    //console.log('🚢 Data type:', typeof data);
    //console.log('🚢 First record:', data?.[0]);
    
    this.equipmentSpecifications = data || [];
    this.filteredEquipmentSpecifications = [...(data || [])];
    
    //console.log('🚢 Equipment specifications array updated:', this.equipmentSpecifications);
    //console.log('🚢 Filtered equipment specifications updated:', this.filteredEquipmentSpecifications);
    
    // Force change detection
    this.cdr.detectChanges();
  }
}
