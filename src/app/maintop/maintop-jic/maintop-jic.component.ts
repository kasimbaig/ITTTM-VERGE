import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { CommonModule } from '@angular/common';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AddFormComponent } from '../../shared/components/add-form/add-form.component';
import { forkJoin } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { Card } from '../../interfaces/interfaces';
import { formatDate } from '../../shared/utils/filter-helper';
import { resetFilterCards } from '../../shared/utils/filter-helper';
import { ExportService } from '../../services/export.service';
import { filterData } from '../../shared/utils/filter-helper';
import { PaginatedTableComponent } from '../../shared/components/paginated-table/paginated-table.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ViewDetailsComponent } from '../../shared/components/view-details/view-details.component';
@Component({
  selector: 'app-maintop-jic',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    MultiSelectModule,
    DropdownModule,
    CheckboxModule,
    CalendarModule,
    CommonModule,
    TieredMenuModule,
    DropdownModule,
    AddFormComponent,
    ToastComponent,
    ConfirmDialogComponent,
    ViewDetailsComponent,
    PaginatedTableComponent
],
  templateUrl: './maintop-jic.component.html',
  styleUrl: './maintop-jic.component.css',
})
export class MaintopJicComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @Input() tableName: string = 'Maintop JIC';
  @Output() exportCSVEvent = new EventEmitter<void>();
  @Output() exportPDFEvent = new EventEmitter<void>();
  isViewDetailsOpen: boolean = false;
  isFormOpen: boolean = false;
  showConfirmDialog: boolean = false;
  isEditFormOpen: boolean = false;
  title: string = 'Add new maintop JIC';
  editTitle: string = 'Edit maintop JIC';
  viewDetialsTitle: string = 'Maintop JIC';

  searchText: string = '';
  maintopJIC: any = [];
  filteredEquipments: any[] = [];
  filteredHeaders: any;

  newDetails = {
    active: 1,
  };
  selectedDetails: any = {
    active: 1,
  };

  cols = [
    { field: 'duration', header: 'Duration' },
    { field: 'dskill_level', header: 'DSkill Level' },
    { field: 'reference', header: 'Reference' },
    { field: 'amendment_no', header: 'Ammendment No' },
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
      label: 'Maintop Header',
      selectedOption: null,
      options: [],
    },
    {
      label: 'Maintop Detail',
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
      label: 'Maintop Header',
      key: 'maintop_header',
      type: 'select',
      options: [],
      required: true,
    },
    {
      label: 'Maintop Detail',
      key: 'maintop_detail',
      type: 'select',
      options: [],
      required: true,
    },
    {
      label: 'Reference',
      key: 'reference',
      type: 'text',
      required: true,
    },
    {
      label: 'Amendment Number',
      key: 'amendment_no',
      type: 'text',
      required: false,
    },
    {
      label: 'Date',
      key: 'date',
      type: 'date',
      required: true,
    },

    {
      label: 'Duration',
      key: 'duration',
      type: 'text',
      required: true,
    },
    {
      label: 'Skill Level',
      key: 'dskill_level',
      type: 'text',
      required: true,
    },
    {
      label: 'Brief Description',
      key: 'brief_description',
      type: 'textarea',
      required: true,
    },
    {
      label: 'Description',
      key: 'description',
      type: 'textarea',
      required: true,
    },
    {
      label: 'Procedure',
      key: 'procedure',
      type: 'textarea',
      required: true,
    },
  ];

  toggleForm(open: boolean) {
    this.isFormOpen = open;
  }

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private exportService: ExportService
  ) {}
  ngOnInit(): void {
    this.loadInitialData();
  }
  loadInitialData(): void {
    forkJoin({
      equipments: this.apiService.get<any[]>('master/equipment/'),
    }).subscribe({
      next: ({ equipments }) => {
        this.filteredEquipments = equipments.map((details: any) => ({
          label: details.name,
          value: details.id,
        }));

        const equipmentField = this.formConfigForNewDetails.find(
          (field) => field.key === 'equipment'
        );
        if (equipmentField) {
          equipmentField.options = equipments.map((eq) => ({
            label: eq.name,
            value: eq.id,
          }));
        }

        const equipmentcommandCard = this.cards.find(
          (card) => card.label === 'Equipment'
        );
        if (equipmentcommandCard) {
          equipmentcommandCard.options = equipments.map((eq) => ({
            label: eq.name,
            value: eq.id,
          }));
        }
      },
      error: (error) => {
        console.error('Error loading data:', error);
      },
    });
  }
  applyFilter(card: any, value: any) {
    //console.log(card, value);
    switch (card) {
      case 'Equipment':
        this.onEquipmentChange(value);
        break;
      case 'Maintop Header':
        this.onHeaderChange(value);
        break;
      case 'Maintop Detail':
        this.onDetailChange(value);
        break;
    }
  }

  onEquipmentChange(equipmentId: number) {
    //console.log(equipmentId);
    this.apiService
      .get<any[]>(`maintop/maintop-header/?equipment=${equipmentId}`)
      .subscribe((headers) => {
        const HeadercommandCard = this.cards.find(
          (card) => card.label === 'Maintop Header'
        );
        if (HeadercommandCard) {
          HeadercommandCard.options = headers.map((eq) => ({
            label: eq.code,
            value: eq.id,
          }));
        }
      });
  }

  onHeaderChange(headerId: number) {
    this.apiService
      .get<any[]>(`maintop/maintop-detail/?maintop_header=${headerId}`)
      .subscribe((details) => {
        const detailCommandCard = this.cards.find(
          (card) => card.label === 'Maintop Detail'
        );
        if (detailCommandCard) {
          detailCommandCard.options = details.map((eq) => ({
            label: eq.no,
            value: eq.id,
          }));
        }
      });
  }
  onDetailChange(detailId: number) {
    this.apiService
      .get<any[]>(`maintop/maintop-jic/?maintop_detail=${detailId}`)
      .subscribe((data) => {
        this.maintopJIC = data;
      });
  }
  handleSubmit(event: any) {
    this.newDetails = { ...event };
    this.newDetails.active = 1;
    this.apiService.post(`maintop/maintop-jic/`, this.newDetails).subscribe({
      next: (data: any) => {
        //console.log(data);
        this.toastService.showSuccess('Maintop JIC Added Successfully');
        this.maintopJIC.push(data);
      },
      error: (error) => {
        console.error('Login failed:', error);
        alert('Invalid login credentials');
      },
    });
    this.isFormOpen = false;
  }

  viewDetails(details: any, open: boolean) {
    this.selectedDetails = details;

    this.selectedDetails.maintop_detail =
      this.selectedDetails.maintop_detail.no;

    this.selectedDetails.date = formatDate(this.selectedDetails.created_on);
    this.filteredHeaders = this.formConfigForNewDetails.filter(
      (item: any) => item.key !== 'equipment' && item.key !== 'maintop_header'
    );
    this.isViewDetailsOpen = open;
  }
  editDetails(details: any, open: boolean) {
    this.isEditFormOpen = open;

    this.selectedDetails = {
      ...details,
      equipment: details?.maintop_detail?.maintop_header?.equipment.id || null,
      maintop_header: details?.maintop_detail?.maintop_header.id || null,
      maintop_detail: details?.maintop_detail.id || null,
    };
  }

  deleteDetails(details: any) {
    this.selectedDetails = { ...details };
    this.showConfirmDialog = true;
  }

  resetFilters() {
    this.searchText = '';
    resetFilterCards(this.cards, 'Equipment', this.maintopJIC);
  }

  confirmDeletion() {
    this.apiService
      .delete(`maintop/maintop-jic/${this.selectedDetails.id}/`)
      .subscribe({
        next: (data: any) => {
          this.maintopJIC = this.maintopJIC.filter(
            (item: any) => item.id !== this.selectedDetails.id
          );

          this.toastService.showSuccess('Maintop JIC deleted successfully');
          this.showConfirmDialog = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.toastService.showError('Failed to delete maintop JIC');
        },
      });
  }

  onConfirmDelete(confirmed: boolean): void {
    if (confirmed) this.confirmDeletion();
    else this.showConfirmDialog = false;
  }

  handleEditSubmit(data: any) {
    this.selectedDetails = { ...this.selectedDetails, ...data };
    this.selectedDetails.active = 1;
    this.apiService
      .put(
        `maintop/maintop-jic/${this.selectedDetails.id}/`,
        this.selectedDetails
      )
      .subscribe({
        next: (data: any) => {
          //console.log(data);
          this.toastService.showSuccess('Maintop JIC updated Successfully');
          const index = this.maintopJIC.findIndex(
            (item: any) => item.id === data.id
          );
          if (index !== -1) {
            this.maintopJIC[index] = {
              ...data,
              maintopDetail: data.maintop_detail?.group_heading || 'Unknown',
            };
          }
          //console.log(this.maintopJIC);
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
    this.isEditFormOpen = false;
  }

  filterHeaders() {
    this.maintopJIC = filterData(this.maintopJIC, this.searchText, [
      'dskill_level',
      'duration',
    ]);
  }

  exportExcel() {
    this.exportService.exportExcel(this.cols, this.maintopJIC, this.tableName);
  }
  exportPDF() {
    this.exportService.exportPDF(this.cols, this.maintopJIC, this.tableName);
  }
}
