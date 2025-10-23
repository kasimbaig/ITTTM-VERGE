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
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ApiService } from '../../../services/api.service';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AddFormComponent } from '../../../shared/components/add-form/add-form.component';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ExportService } from '../../../services/export.service';
import { resetFilterCards } from '../../../shared/utils/filter-helper';
import { filterData } from '../../../shared/utils/filter-helper';
import { ChangeDetectionStrategy } from '@angular/core';
import { Card } from '../../../interfaces/interfaces';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';


import { ViewDetailsComponent } from '../../../shared/components/view-details/view-details.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
@Component({
  selector: 'app-generic-specification',
  imports: [
    DropdownModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    CommonModule,
    PaginatedTableComponent,
    TieredMenuModule,
    AddFormComponent,
    ToastComponent,
    ConfirmDialogComponent,
    ViewDetailsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './generic-specification.component.html',
  styleUrl: './generic-specification.component.css',
})
export class GenericSpecificationComponent {
  @ViewChild('dt') dt!: Table;
  @Output() exportCSVEvent = new EventEmitter<void>();
  @Output() exportPDFEvent = new EventEmitter<void>();
  @Input() tableName: string = '';
  isTableLoading = false;

  searchText: string = '';
  title: string = 'Add new Generic Specification';
  editTitle: string = 'Edit Generic Specification';
  viewDetialsTitle: string = 'Generic Specification';
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  showConfirmDialog: boolean = false;
  isViewDetailsOpen: boolean = false;
  selectedGeneric: any = null;

  genericSpecs: any[] = [];
  
  filteredGenericSpecs: any[] = [];
  filteredGenerics: any[] = [];
  selectedDetails: any = {};
  newDetails = {
    name: '',
    generic: '',
    unit: '',
    order: '',
    active: 1,
  };

  formConfigForNewDetails = [
    { label: 'Name', key: 'name', type: 'text', required: true },
    {
      label: 'Generic',
      key: 'generic',
      type: 'select',
      options: this.filteredGenerics,
      required: true,
    },
    { label: 'Unit', key: 'unit', type: 'text', required: false },
    { label: 'Order', key: 'order', type: 'text', required: true },
  ];

  cols = [
    { field: 'name', header: 'Name' },
    { field: 'generic.code', header: 'Generic code' },
    { field: 'order', header: 'Order' },
    { field: 'unit', header: 'Unit' },
  ];

  // Table configuration for paginated table
  tableColumns = [
    { field: 'name', header: 'Name' },
    { field: 'generic.code', header: 'Generic code' },
    { field: 'order', header: 'Order' },
    { field: 'unit', header: 'Unit' },
  ];
  cards: Card[] = [
    {
      label: 'Generic',
      selectedOption: null,
      options: [],
    },
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
  ) { }

  ngOnInit(): void {
    this.getGenericDetails();
  }

  resetFilters() {
    this.searchText = '';
    resetFilterCards(this.cards, 'Generic', this.genericSpecs);
  }

  handleSubmit(event: any): void {
    this.newDetails = { ...event, active: 1 };

    this.apiService
      .post('sfd/generic-specifications/', this.newDetails)
      .subscribe({
        next: (data: any) => {
          const newSpec = { ...this.newDetails, id: data.id };
          this.genericSpecs.unshift(newSpec);
          this.filteredGenericSpecs = [...this.genericSpecs];
          this.resetNewDetails();
          this.toastService.showSuccess(
            'Generic Specification added successfully'
          );
        },
        error: (error) => {
          console.error('Error:', error);
          alert('Failed to add Generic Specification');
        },
      });

    this.isFormOpen = false;
  }

  applyFilter(card: any, value: any) {
    this.isTableLoading = true;

    //console.log(card, value);
    switch (card) {
      case 'Generic':
        this.onGenericChange(value);
        break;
    }
  }
  getOptionLabel(options: { label: string, value: any }[], selectedValue: any): string | undefined {
    if (!options || selectedValue === null || selectedValue === undefined) {
      return undefined;
    }
    const foundOption = options.find(opt => opt.value === selectedValue);
    return foundOption ? foundOption.label : undefined;
  }

  onGenericChange(equipmentId: any) {
    //console.log('ekjdj00');
    this.apiService
      .get<any[]>(`sfd/generic-specifications/?generic=${equipmentId}`)
      .subscribe((headers) => {
        //console.log(headers);

        this.genericSpecs = [...headers];
        //console.log(this.genericSpecs);
        this.isTableLoading = false;

      });
  }
  getGenericDetails(): void {
    this.apiService.get<any[]>('master/generic/?is_dropdown=true').subscribe({
      next: (data) => {
        this.filteredGenerics = data.map((item) => ({
          label: item.type,
          value: item.id,
        }));

        const genericField = this.formConfigForNewDetails.find(
          (field) => field.key === 'generic'
        );
        if (genericField) genericField.options = this.filteredGenerics;

        const genericommandCard = this.cards.find(
          (card) => card.label === 'Generic'
        );
        //console.log(genericommandCard);
        if (genericommandCard) {
          genericommandCard.options = data.map((eq) => ({
            label: eq.type,
            value: eq.id,
          }));
        }
      },
      error: (error) => {
        console.error('Error fetching generics:', error);
      },
    });
  }

  toggleForm(open: boolean): void {
    this.isFormOpen = open;
  }

  viewDetails(details: any, open: boolean): void {
    this.isViewDetailsOpen = open;
    //console.log(details);
    this.selectedDetails = details;
  }

  editDetails(details: any, open: boolean): void {
    this.selectedDetails = { ...details };
    this.isEditFormOpen = open;
  }

  deleteDetails(details: any): void {
    this.selectedDetails = details;
    this.showConfirmDialog = true;
  }

  // Method to get action items for the paginated table
  getActionItems(details: any): any[] {
    return [
      {
        label: 'View',
        icon: 'pi pi-eye',
        command: () => this.viewDetails(details, true)
      },
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => this.editDetails(details, true)
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.deleteDetails(details)
      }
    ];
  }

  onConfirmDelete(confirmed: boolean): void {
    if (!confirmed) {
      this.showConfirmDialog = false;
      return;
    }

    this.apiService
      .delete(`sfd/generic-specifications/${this.selectedDetails.id}/`)
      .subscribe({
        next: (data) => {
          //console.log(data);

          this.genericSpecs = this.genericSpecs.filter(
            (item) => item.id !== this.selectedDetails.id
          );
          this.toastService.showSuccess(
            'Generic specification deleted successfully'
          );
          this.showConfirmDialog = false;
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }

  handleEditSubmit(data: any): void {
    const updatedDetails = { ...this.selectedDetails, ...data, active: 1 };

    this.apiService
      .put(`sfd/generic-specifications/${updatedDetails.id}/`, updatedDetails)
      .subscribe({
        next: (updatedData: any) => {
          //console.log(updatedData);
          const index = this.genericSpecs.findIndex(
            (item) => item.id === updatedDetails.id
          );
          if (index !== -1) {
            const matchedGeneric = this.filteredGenerics.find(
              (g) => g.value === updatedData.generic
            );

            this.genericSpecs[index] = {
              ...updatedData,
              generic: matchedGeneric
                ? { id: updatedData.generic, code: matchedGeneric.label }
                : updatedData.generic,
            };

            this.filteredGenericSpecs[index] = this.genericSpecs[index];
          }

          this.selectedDetails = {};
          this.isEditFormOpen = false;
          this.toastService.showSuccess(
            'Generic Specification edited successfully'
          );
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }

  filterHeaders() {
    this.genericSpecs = filterData(this.genericSpecs, this.searchText, [
      'name',
    ]);
  }

  exportExcel() {
    this.exportService.exportExcel(
      this.cols,
      this.genericSpecs,
      this.tableName
    );
  }
  exportPDF() {
    this.exportService.exportPDF(this.cols, this.genericSpecs, this.tableName);
  }

  private resetNewDetails(): void {
    this.newDetails = {
      name: '',
      generic: '',
      unit: '',
      order: '',
      active: 1,
    };
  }

  goBack(): void {
    // Navigate back to previous page
    window.history.back();
  }

  bulkUpload(): void {
    // Implement bulk upload functionality
    //console.log('Bulk upload functionality to be implemented');
    // You can add your bulk upload logic here
  }
}
