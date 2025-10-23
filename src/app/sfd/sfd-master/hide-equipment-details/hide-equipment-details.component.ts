import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TieredMenuModule } from 'primeng/tieredmenu';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AddFormComponent } from '../../../shared/components/add-form/add-form.component';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ToastService } from '../../../services/toast.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DropdownModule } from 'primeng/dropdown';
import { Card } from '../../../interfaces/interfaces';
import { ExportService } from '../../../services/export.service';
import { filterData } from '../../../shared/utils/filter-helper';
import { resetFilterCards } from '../../../shared/utils/filter-helper';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { ViewDetailsComponent } from '../../../shared/components/view-details/view-details.component';

@Component({
  selector: 'app-hide-equipment-details',
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
    ConfirmDialogComponent,
    DropdownModule,
    ViewDetailsComponent,
  ],
  templateUrl: './hide-equipment-details.component.html',
  styleUrl: './hide-equipment-details.component.css',
})
export class HideEquipmentDetailsComponent {
  @Input() tableName: string = '';
  @Output() exportCSVEvent = new EventEmitter<void>();
  @Output() exportPDFEvent = new EventEmitter<void>();
  // Search and UI State
  searchText: string = '';
  selectedFilterOption: any = null;
  isEditFormOpen: boolean = false;
  isFormOpen: boolean = false;
  showConfirmDialog: boolean = false;
  isViewDetailsOpen: boolean = false;
  // Data Variables
  hidEquipments: any = [];
  filteredHidEquipments: any = [];
  filteredEquipments: any[] = [];
  filteredSFDHierarchy: any[] = [];

  // Titles
  title: string = 'Add new HID Equipment';
  editTitle: string = 'Edit HID Equipment';
  viewDetialsTitle: string = 'HID Equipments';

  // Form Models
  newDetails = {
    equipment: null,
    sfd_hierarchy: null,
    active: 1,
  };

  selectedDetails: any = {
    equipment: null,
    sfd_hierarchy: null,
  };

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
  ];

  // Table
  cols = [
    { field: 'equipment.name', header: 'Equipment Name' },
    { field: 'sfd_hierarchy.name', header: 'SFD Hierarchy' },
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
  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  // Load data for dropdowns and table
  loadInitialData() {
    forkJoin({
      equipments: this.apiService.get<any[]>('master/equipment/'),
    }).subscribe({
      next: (response) => {
        this.filteredEquipments = response.equipments.map((item: any) => ({
          label: item.name,
          value: item.id,
        }));
        const equipmentField = this.formConfigForNewDetails.find(
          (field) => field.key === 'equipment'
        );
        if (equipmentField) equipmentField.options = this.filteredEquipments;

        const equipmentCard = this.cards.find(
          (card) => card.label === 'Equipment'
        );
        if (equipmentCard) {
          equipmentCard.options = response.equipments.map((item: any) => ({
            label: item.name,
            value: item.id,
          }));
        }
      },
      error: (error) => console.error('Error loading data:', error),
    });
  }

  // Form Handlers
  toggleForm(open: boolean) {
    this.isFormOpen = open;
  }

  handleSubmit(data: any) {
    const payload = { ...data, active: 1 };
    this.apiService.post('sfd/hid-equipment-details/', payload).subscribe({
      next: (response: any) => {
        const newRecord = {
          ...response,
          equipment: {
            id: response.equipment,
            name:
              this.filteredEquipments.find(
                (eq) => eq.value === response.equipment
              )?.label || '',
          },

          sfd_hierarchy: {
            id: response.sfd_hierarchy,
            name:
              this.filteredSFDHierarchy.find(
                (sfd) => sfd.value === response.sfd_hierarchy
              )?.label || '',
          },
        };
        //console.log(newRecord);

        this.hidEquipments.unshift(newRecord); // update your table data
        this.filteredHidEquipments = [...this.hidEquipments];
        this.toastService.showSuccess('Successfully added new HID Equipment');
        this.toggleForm(false);
      },

      error: (error) => {
        console.error('Submission failed:', error);
        alert('Invalid submission');
      },
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
  onSFDChange(sfdId: any) {
    this.apiService
      .get<any[]>(`sfd/hid-equipment-details/?sfd_hierarchy=${sfdId}`)
      .subscribe((headers) => {
        //console.log(headers);
        this.hidEquipments = headers;
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

  handleEditSubmit(data: any) {
    const updated = { ...this.selectedDetails, ...data };

    const equipmentId =
      typeof updated.equipment === 'object'
        ? updated.equipment.id
        : updated.equipment;
    const sfdHierarchyId =
      typeof updated.sfd_hierarchy === 'object'
        ? updated.sfd_hierarchy.id
        : updated.sfd_hierarchy;

    this.apiService
      .put(`sfd/hid-equipment-details/${updated.id}/`, {
        ...data,
        equipment: equipmentId,
        sfd_hierarchy: sfdHierarchyId,
        modified_by: 1,
        modified_ip: '106.76.190.206',
      })
      .subscribe({
        next: (response: any) => {
          // 👇 just like handleSubmit - convert ID to object
          const updatedRecord = {
            ...response,
            equipment: {
              id: response.equipment,
              name:
                this.filteredEquipments.find(
                  (eq) => eq.value === response.equipment
                )?.label || '',
            },
            sfd_hierarchy: {
              id: response.sfd_hierarchy,
              name:
                this.filteredSFDHierarchy.find(
                  (sfd) => sfd.value === response.sfd_hierarchy
                )?.label || '',
            },
          };

          // 👇 update the correct row in hidEquipments
          this.hidEquipments = this.hidEquipments.map((item: any) =>
            item.id === updated.id ? updatedRecord : item
          );

          this.filteredHidEquipments = [...this.hidEquipments];
          this.toastService.showSuccess('Successfully updated HID Equipment');
          this.isEditFormOpen = false;
        },
        error: (error) => {
          console.error('Update failed:', error);
          this.toastService.showError('Failed to update');
        },
      });
  }

  viewDetails(details: any, open: boolean) {
    this.isViewDetailsOpen = open;
    this.selectedDetails = details;
  }

  editDetails(details: any, open: boolean) {
    this.selectedDetails = { ...details };
    this.isEditFormOpen = open;
  }

  deleteDetails(details: any): void {
    this.selectedDetails = { ...details };
    this.showConfirmDialog = true;
  }

  onConfirmDelete(confirmed: boolean) {
    if (!confirmed) {
      this.showConfirmDialog = false;
      return;
    }

    this.apiService
      .delete(`sfd/hid-equipment-details/${this.selectedDetails.id}/`)
      .subscribe({
        next: () => {
          this.hidEquipments = this.hidEquipments.filter(
            (item: any) => item.id !== this.selectedDetails.id
          );
          this.toastService.showSuccess('HID Equipment deleted successfully');
          this.showConfirmDialog = false;
        },
        error: (error) => {
          console.error('Deletion error:', error);
          this.toastService.showError('Failed to delete');
        },
      });
  }

  resetFilters() {
    resetFilterCards(this.cards, 'Equipment', this.hidEquipments);
    this.selectedFilterOption = null;
    this.filteredHidEquipments = [...this.hidEquipments];
  }

  getDropdownOptions(): any[] {
    return this.cards && this.cards.length > 0 ? this.cards[0].options : [];
  }

  onFilterChange(event: any) {
    if (this.cards && this.cards.length > 0) {
      this.applyFilter(this.cards[0].label, event.value);
    }
  }

  filterHeaders() {
    this.hidEquipments = filterData(
      this.filteredHidEquipments,
      this.searchText,
      ['equipment.name']
    );
  }

  exportExcel() {
    this.exportService.exportExcel(
      this.cols,
      this.hidEquipments,
      this.tableName
    );
  }
  exportPDF() {
    this.exportService.exportPDF(this.cols, this.hidEquipments, this.tableName);
  }
}
