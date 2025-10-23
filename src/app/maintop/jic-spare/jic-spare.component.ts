import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ListboxModule } from 'primeng/listbox';
import { CommonModule } from '@angular/common';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AddFormComponent } from '../../shared/components/add-form/add-form.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { Card } from '../../interfaces/interfaces';
import { ToastService } from '../../services/toast.service';
import { ExportService } from '../../services/export.service';
import { filterData } from '../../shared/utils/filter-helper';
import { formatDate } from '../../shared/utils/filter-helper';
import { PaginatedTableComponent } from '../../shared/components/paginated-table/paginated-table.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ViewDetailsComponent } from '../../shared/components/view-details/view-details.component';

@Component({
  selector: 'app-jic-spare',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    MultiSelectModule,
    DropdownModule,
    CalendarModule,
    ListboxModule,
    CommonModule,
    TieredMenuModule,
    PaginatedTableComponent,
    DropdownModule,
    AddFormComponent,
    ToastComponent,
    ConfirmDialogComponent,
    ViewDetailsComponent,
  ],
  templateUrl: './jic-spare.component.html',
  styleUrl: './jic-spare.component.css',
})
export class JicSpareComponent implements OnInit {
  @Input() tableName: string = 'JIC Spares';
  @Output() exportCSVEvent = new EventEmitter<void>();
  @Output() exportPDFEvent = new EventEmitter<void>();
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  showConfirmDialog: boolean = false;
  isViewDetailsOpen: boolean = false;
  editTitle: string = 'Edit JIC  Spare';
  title: string = 'Add new Jic Spare';
  viewDetialsTitle: string = 'JIC Spare';
  searchText: string = '';
  jicSpares: any = [];
  selectedDetails: any = {
    active: 1,
  };
  filteredDetails: any = [];

  filteredMaintopJic: any = [];
  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private exportService: ExportService
  ) {}
  cols = [
    { field: 'maintop_detail_no', header: 'Part Number' },
    { field: 'description', header: 'Description' },
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

  newDetails = {
    description: '',
    jic_maintop: '',
    part_no: '',
    part_quantity: '',
    jic_amendment_no: '',
    active: 1,
  };

  formConfigForNewDetails = [
    {
      label: 'JIC Maintop',
      key: 'jic_maintop',
      type: 'select',
      options: this.filteredMaintopJic,
      required: true,
    },
    {
      label: 'Part Number',
      key: 'part_no',
      type: 'text',
      required: true,
    },
    {
      label: 'Part Quantity',
      key: 'part_quantity',
      type: 'number',
      required: true,
    },
    {
      label: 'JIC Amendment Number',
      key: 'jic_amendment_no',
      type: 'text',
      required: false,
    },

    {
      label: 'Description',
      key: 'description',
      type: 'textarea',
      required: true,
    },
  ];
  viewDetailsConfig = [
    {
      label: 'Description',
      key: 'description',
      type: 'text',
    },
    {
      label: 'Part Number',
      key: 'part_no',
      type: 'text',
      required: true,
    },
  ];
  cards: Card[] = [
    {
      label: 'Miantop JIC',
      selectedOption: null,
      options: [],
    },
  ];

  handleSubmit(event: any) {
    this.newDetails = event;
    this.newDetails.active = 1;
    this.apiService.post('maintop/jic-spare/', this.newDetails).subscribe({
      next: (data: any) => {
        //console.log(data);
        this.toastService.showSuccess('JIC Spare Added Successfully');
      },
      error: (error) => {
        console.error('Login failed:', error);
        alert('Invalid login credentials');
      },
    });
    this.isFormOpen = false;
  }

  toggleForm(open: boolean) {
    this.isFormOpen = open;
  }
  toggleEditForm(open: boolean) {
    this.isEditFormOpen = open;
  }

  ngOnInit(): void {
    this.getMaintopDeatails();
  }

  getMaintopDeatails(): void {
    this.apiService.get<any>('maintop/maintop-jic/').subscribe({
      next: (data) => {
        //console.log(data);
        this.filteredMaintopJic =data.results.map((details: any) => ({
          label: details.reference,
          value: details.id,
        }));
        const maintopJicField = this.formConfigForNewDetails.find(
          (field) => field.key === 'jic_maintop'
        );

        this.jicSpares = data.results;

        if (maintopJicField) {
          maintopJicField.options = this.filteredMaintopJic;
        }

        const JICcommandCard = this.cards.find(
          (card) => card.label === 'Miantop JIC'
        );
        //console.log(JICcommandCard);
        if (JICcommandCard) {
          JICcommandCard.options = data.results.map((eq: any) => ({
            label: eq.brief_description,
            value: eq.id,
          }));
        }
      },
      error: (error) => {
        console.error('Error fetching departments:', error);
      },
    });
  }

  viewDetails(details: any, open: boolean) {
    this.selectedDetails = { ...details };
    this.isViewDetailsOpen = open;
    //console.log(this.isViewDetailsOpen);
  }

  applyFilter(card: any, value: any) {
    //console.log(card, value);
    switch (card) {
      case 'Miantop JIC':
        this.onJicChange(value);
        break;
    }
  }
  onJicChange(equipmentId: any) {
    //console.log('ekjdj00');
    this.apiService
      .get<any[]>(`maintop/jic-spare/?dropdown=${true}`)
      .subscribe((headers) => {
        this.jicSpares = [...headers];
      });
  }
  resetFilters() {
    this.cards.forEach((card) => {
      card.selectedOption = null;
      if (card.label !== 'Miantop JIC') {
        card.options = [];
      }
    });
    this.jicSpares = [];
  }
  editDetails(details: any, open: boolean) {
    //console.log(details);

    this.selectedDetails = { ...details };
    this.isEditFormOpen = open;

    this.selectedDetails.date = formatDate(this.selectedDetails.date);
  }

  deleteDetails(details: any) {
    this.selectedDetails = details;
    this.showConfirmDialog = true;
  }
  confirmDeletion() {
    this.apiService
      .delete(`maintop/jic-spare/${this.selectedDetails.id}/`)
      .subscribe({
        next: (data: any) => {
          this.showConfirmDialog = false;
          this.toastService.showSuccess('JIC Spare deleted successfully');
          this.jicSpares = [
            ...this.jicSpares.filter(
              (item: any) => item.id !== this.selectedDetails.id
            ),
          ];
          this.filteredDetails = [
            ...this.filteredDetails.filter(
              (item: any) => item.id !== this.selectedDetails.id
            ),
          ];
        },
        error: (error) => {
          console.error('Error:', error);
          this.toastService.showError('Failed to delete');
        },
      });
    this.showConfirmDialog = false;
  }

  onConfirmDelete(confirmed: boolean): void {
    if (confirmed) this.confirmDeletion();
    else this.showConfirmDialog = false;
  }
  handleEditSubmit(data: any) {
    this.selectedDetails = { ...this.selectedDetails, ...data };

    this.apiService
      .put(
        `maintop/jic-spare/${this.selectedDetails.id}/`,
        this.selectedDetails
      )
      .subscribe({
        next: (updatedData: any) => {
          // Update the item in maintopDeatils
          const index = this.jicSpares.findIndex(
            (item: any) => item.id === updatedData.id
          );

          if (index !== -1) {
            // Merge updated data into the original entry
            this.jicSpares[index] = {
              ...this.jicSpares[index],
              ...updatedData,
            };
          }

          this.filteredDetails = [...this.jicSpares]; // Ensure UI re-renders
          this.toastService.showSuccess('JIC Spare updated successfully!');
          this.isEditFormOpen = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.toastService.showError('Failed to update JIC Spare');
        },
      });
  }

  filterHeaders() {
    this.jicSpares = filterData(this.jicSpares, this.searchText, [
      'title',
      'code',
    ]);
  }

  exportExcel() {
    this.exportService.exportExcel(this.cols, this.jicSpares, this.tableName);
  }
  exportPDF() {
    this.exportService.exportPDF(this.cols, this.jicSpares, this.tableName);
  }
}
