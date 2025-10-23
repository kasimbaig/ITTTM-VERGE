import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ApiService } from '../../../services/api.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { CommonModule } from '@angular/common';
import { AddFormComponent } from '../../../shared/components/add-form/add-form.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../services/toast.service';
import { DropdownModule } from 'primeng/dropdown';
import { forkJoin } from 'rxjs';
import { Card } from '../../../interfaces/interfaces';
import { ExportService } from '../../../services/export.service';
import { filterData } from '../../../shared/utils/filter-helper';
import { resetFilterCards } from '../../../shared/utils/filter-helper';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';
import { ViewDetailsComponent } from '../../../shared/components/view-details/view-details.component';
@Component({
  selector: 'app-equipment-supplier',
  imports: [
    TableModule,
    ToastComponent,
    ConfirmDialogComponent,
    ButtonModule,
    InputTextModule,
    FormsModule,
    PaginatedTableComponent,
    TieredMenuModule,
    CommonModule,
    AddFormComponent,
    DropdownModule,
    ViewDetailsComponent,
  ],
  templateUrl: './equipment-supplier.component.html',
  styleUrl: './equipment-supplier.component.css',
})
export class EquipmentSupplierComponent {
  @Output() exportCSVEvent = new EventEmitter<void>();
  @Output() exportPDFEvent = new EventEmitter<void>();
  @Input() tableName: string = '';

  searchText: string = '';
  selectedFilterOption: any = null;
  equipmentPolicies: any[] = [];
  filteredEquipments: any[] = [];
  filteredEquipmentPolicies: any[] = [];
  isViewDetailsOpen: boolean = false;
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  showConfirmDialog: boolean = false;

  title: string = 'Add new Equipment Policies';
  editTitle: string = 'Edit Equipment policy';
  viewDetialsTitle: string = 'Equipment Policies';

  newDetails: any = {
    active: 1,
  };
  selectedEquipment: any;

  selectedDetails: any = {};

  formConfigForNewDetails = [
    {
      label: 'Equipment',
      key: 'equipment',
      type: 'select',
      options: this.filteredEquipments,
      required: true,
    },
    {
      label: 'Policy',
      key: 'policy',
      type: 'text',
      required: true,
    },
    {
      label: 'Policy Directive',
      key: 'policy_directive',
      type: 'text',
      required: false,
    },
  ];

  cols = [
    { field: 'equipment.name', header: 'Equipment Name' },
    { field: 'policy', header: 'Policy' },
    { field: 'policy_directive', header: 'Policy Directive' },
  ];

  stateOptions = [
    { label: 'Equipment Specification', value: 'equipment' },
    { label: 'HID Equipment', value: 'hid' },
    { label: 'Generic Specification', value: 'generic' },
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

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.fetchInitialData();
  }

  toggleForm(open: boolean): void {
    this.isFormOpen = open;
  }

  cards: Card[] = [
    {
      label: 'Equipment',
      selectedOption: null,
      options: [],
    },
  ];

  applyFilter(card: any, value: any) {
    //console.log(card, value);
    switch (card) {
      case 'Equipment':
        this.onEquipmentChange(value);
        break;
    }
  }
  onEquipmentChange(equipmentId: any) {
    //console.log('ekjdj00');
    this.apiService
      .get<any[]>(`sfd/equipment-policies/?equipment=${equipmentId}`)
      .subscribe((headers) => {
        //console.log(headers);

        this.equipmentPolicies = [...headers];
        this.filteredEquipmentPolicies = this.equipmentPolicies;
      });
  }

  fetchInitialData(): void {
    forkJoin({
      equipments: this.apiService.get<any[]>('master/equipment/'),
    }).subscribe({
      next: ({ equipments }) => {
        // Process Equipments
        this.filteredEquipments = equipments.map((equipment) => ({
          label: equipment.name,
          value: equipment.id,
        }));

        const equipmentField = this.formConfigForNewDetails.find(
          (field) => field.key === 'equipment'
        );
        if (equipmentField) {
          equipmentField.options = this.filteredEquipments;
        }
        const equipmentcommandCard = this.cards.find(
          (card) => card.label === 'Equipment'
        );
        //console.log(equipmentcommandCard);
        if (equipmentcommandCard) {
          equipmentcommandCard.options = equipments.map((eq) => ({
            label: eq.name,
            value: eq.id,
          }));
        }
      },
      error: (error: any) => {
        console.error('Error fetching initial data:', error);
      },
    });
  }

  handleSubmit(data: any): void {
    const payload = { ...data, active: 1 };

    this.apiService.post('sfd/equipment-policies/', payload).subscribe({
      next: (response: any) => {
        const normalizeField = (
          responseField: any,
          filteredArray: any[],
          idProp: string,
          displayProp: string,
          defaultPropName: string
        ) => {
          if (
            responseField &&
            typeof responseField === 'object' &&
            responseField[displayProp]
          ) {
            return responseField;
          }

          const match = filteredArray.find(
            (item: any) => item.value == responseField
          );
          return match
            ? { [idProp]: match.value, [defaultPropName]: match.label }
            : responseField;
        };

        response.equipment = normalizeField(
          response.equipment,
          this.filteredEquipments,
          'id',
          'name',
          'name'
        );

        this.equipmentPolicies.unshift(response);
        this.filteredEquipmentPolicies = [...this.equipmentPolicies];
        this.resetNewDetails();
        this.toastService.showSuccess(
          'Successfully added new Equipment Policy'
        );
      },
      error: (error) => {
        console.error('Submit failed:', error);
        this.toastService.showError('Invalid Credentails');
      },
    });
  }
  private resetNewDetails(): void {
    this.newDetails = {};
  }

  handleEditSubmit(data: any): void {
    const updatedDetails = { ...this.selectedDetails, ...data, active: 1 };

    this.apiService
      .put(`sfd/equipment-policies/${updatedDetails.id}/`, updatedDetails)
      .subscribe({
        next: (updatedData: any) => {
          //console.log(updatedData);

          const normalizeField = (
            responseField: any,
            filteredArray: any[],
            idProp: string,
            displayProp: string,
            defaultPropName: string
          ) => {
            if (
              responseField &&
              typeof responseField === 'object' &&
              responseField[displayProp]
            ) {
              return responseField;
            }

            const match = filteredArray.find(
              (item: any) => item.value == responseField
            );
            return match
              ? { [idProp]: match.value, [defaultPropName]: match.label }
              : responseField;
          };

          updatedData.equipment = normalizeField(
            updatedData.equipment,
            this.filteredEquipments,
            'id',
            'name',
            'name'
          );
          const index = this.equipmentPolicies.findIndex(
            (item) => item.id === updatedDetails.id
          );
          if (index !== -1) {
            const matchedEquipment = this.filteredEquipments.find(
              (g) => g.value === updatedData.generic
            );

            this.equipmentPolicies[index] = {
              ...updatedData,
              equipment: matchedEquipment
                ? { id: updatedData.equipment, code: matchedEquipment.label }
                : updatedData.equipment,
            };

            this.filteredEquipmentPolicies[index] =
              this.equipmentPolicies[index];
          }

          this.selectedDetails = {};
          this.isEditFormOpen = false;
          this.toastService.showSuccess(
            'Equipment policies edited successfully'
          );
        },
        error: (error) => {
          console.error('Edit failed:', error);
          this.toastService.showError('Failed to edit Equipment policies ');
        },
      });
  }

  viewDetails(details: any, open: boolean): void {
    this.isViewDetailsOpen = open;
    this.selectedDetails = { ...this.selectedDetails, ...details };
  }

  editDetails(details: any, open: boolean): void {
    this.selectedDetails = { ...details };
    this.isEditFormOpen = open;
  }

  deleteDetails(details: any): void {
    this.selectedDetails = details;
    this.showConfirmDialog = true;
  }

  onConfirmDelete(confirmed: boolean): void {
    if (!confirmed) {
      this.showConfirmDialog = false;
      return;
    }

    this.apiService
      .delete(`sfd/equipment-policies/${this.selectedDetails.id}/`)
      .subscribe({
        next: () => {
          this.equipmentPolicies = this.equipmentPolicies.filter(
            (item) => item.id !== this.selectedDetails.id
          );
          this.toastService.showSuccess('Deleted successfully');
          this.showConfirmDialog = false;
        },
        error: (error) => {
          console.error('Delete failed:', error);
          this.toastService.showError('Failed to Delete');
        },
      });
  }

  resetFilters() {
    resetFilterCards(this.cards, 'Equipment', this.equipmentPolicies);
    this.selectedFilterOption = null;
    this.filteredEquipmentPolicies = [...this.equipmentPolicies];
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
    this.equipmentPolicies = filterData(
      this.equipmentPolicies,
      this.searchText,
      ['specification_name']
    );
  }

  exportExcel() {
    this.exportService.exportExcel(
      this.cols,
      this.equipmentPolicies,
      this.tableName
    );
  }
  exportPDF() {
    this.exportService.exportPDF(
      this.cols,
      this.equipmentPolicies,
      this.tableName
    );
  }
}
