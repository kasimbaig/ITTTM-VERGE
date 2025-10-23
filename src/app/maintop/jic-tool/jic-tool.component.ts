import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ListboxModule } from 'primeng/listbox';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AddFormComponent } from '../../shared/components/add-form/add-form.component';
import { forkJoin } from 'rxjs';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../services/toast.service';
import { Card } from '../../interfaces/interfaces';
import { resetFilterCards } from '../../shared/utils/filter-helper';
import { ExportService } from '../../services/export.service';
import { filterData } from '../../shared/utils/filter-helper';
import { PaginatedTableComponent } from '../../shared/components/paginated-table/paginated-table.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ViewDetailsComponent } from '../../shared/components/view-details/view-details.component';
interface MaintopJic {
  label: string;
  value: number;
}

interface JicToolDetails {
  id?: number;
  description: string;
  maintop_jic: number | string;
  part_no: string;
  part_quantity: string;
  jic_amendment_no: string;
  active: number;
  maintopJic?: string;
  date?: string;
  brief_description?: string;
}

@Component({
  selector: 'app-jic-tool',
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
  templateUrl: './jic-tool.component.html',
  styleUrl: './jic-tool.component.css',
})
export class JicToolComponent implements OnInit {
  @Output() exportCSVEvent = new EventEmitter<void>();
  @Output() exportPDFEvent = new EventEmitter<void>();
  @Input() tableName: string = 'JIC Tools';
  searchText = '';
  filteredMaintopJic: MaintopJic[] = [];
  title: string = 'Add New Jic Tool';
  editTitle: string = 'Edit JIC TOOL';

  viewDetialsTitle: string = 'Maintop JIC Tool';
  selectedDetails: any = {
    active: 1,
  };
  isEditFormOpen: boolean = false;
  showConfirmDialog: boolean = false;
  isViewDetailsOpen: boolean = false;
  isFormOpen: boolean = false;
  jicTool: JicToolDetails[] = [];
  filteredTools: any = [];

  newDetails: JicToolDetails = {
    description: '',
    maintop_jic: 0,
    part_no: '',
    part_quantity: '',
    jic_amendment_no: '',
    active: 1,
  };

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private exportService: ExportService
  ) {}

  formConfigForNewDetails = [
    {
      label: 'Maintop JIC',
      key: 'maintop_jic',
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
  cards: Card[] = [
    {
      label: 'Miantop JIC',
      selectedOption: null,
      options: [],
    },
  ];
  cols = [
    { field: 'part_no', header: 'Part Number' },
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

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.apiService.get<any[]>('maintop/maintop-jic/').subscribe({
      next: (maintopJic) => {
        this.filteredMaintopJic = maintopJic.map((details: any) => ({
          label: details.reference,
          value: details.id,
        }));

        const maintopJicField = this.formConfigForNewDetails.find(
          (field) => field.key === 'maintop_jic'
        );

        if (maintopJicField) {
          maintopJicField.options = this.filteredMaintopJic;
        }
        const JICcommandCard = this.cards.find(
          (card) => card.label === 'Miantop JIC'
        );
        //console.log(JICcommandCard);
        if (JICcommandCard) {
          JICcommandCard.options = maintopJic.map((eq) => ({
            label: eq.brief_description,
            value: eq.id,
          }));
        }

        const maintopJicMap = this.filteredMaintopJic.reduce(
          (acc: any, header: any) => {
            acc[header.value] = header.label;
            return acc;
          },
          {}
        );
      },
      error: (error) => {
        console.error('Error loading data:', error);
      },
    });
  }
  handleSubmit(data: any) {
    this.newDetails = { ...this.newDetails, ...data };
    this.apiService.post('maintop/jic-tool/', this.newDetails).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('JIC tool Added successfully');
        this.jicTool.unshift(data);
      },
      error: (error) => {
        console.error('Login failed:', error);
        alert('Invalid login credentials');
      },
    });
  }

  applyFilter(card: any, value: any) {
    //console.log(card, value);
    switch (card) {
      case 'Miantop JIC':
        this.onJicChange();
        break;
    }
  }
  onJicChange() {
    //console.log('ekjdj00');
    this.apiService
      .get<any[]>(`maintop/jic-tool/?dropdown=${true}`)
      .subscribe((headers) => {
        this.jicTool = [...headers];
      });
  }
  toggleForm(open: boolean) {
    this.isFormOpen = open;
  }

  editDetails(details: JicToolDetails, open: boolean): void {
    this.selectedDetails = { ...details };
    this.isEditFormOpen = open;
  }
  viewDetails(details: JicToolDetails, open: boolean): void {
    this.selectedDetails = { ...details };
    this.selectedDetails.maintop_jic =
      this.selectedDetails.maintop_jic.brief_description;
    this.isViewDetailsOpen = open;
  }

  handleEditSubmit(data: any): void {
    this.selectedDetails = { ...this.selectedDetails, ...data };
    this.apiService
      .put<JicToolDetails>(
        `maintop/jic-tool/${this.selectedDetails.id}/`,
        this.selectedDetails
      )
      .subscribe({
        next: (data) => {
          this.toastService.showSuccess('JIC Tool Updated Successfully');
          const index = this.jicTool.findIndex(
            (item: any) => item.id === data.id
          );
          if (index !== -1) {
            this.jicTool[index] = {
              ...data,
            };
            const matchedJic = this.filteredMaintopJic.find(
              (item) => item.value === data.maintop_jic
            );
            this.jicTool[index] = {
              ...data,
              maintop_jic: matchedJic?.label || data.maintop_jic,
            };
          }
        },
        error: (error) => {
          console.error('Error updating details:', error);
          this.toastService.showError('Failed to update JIC Tool');
        },
      });
  }

  deleteDetails(details: JicToolDetails): void {
    this.selectedDetails = details;
    this.showConfirmDialog = true;
  }
  onConfirmDelete(confirmed: boolean): void {
    if (confirmed) this.confirmDeletion();
    else this.showConfirmDialog = false;
  }

  confirmDeletion(): void {
    this.apiService
      .delete(`maintop/jic-tool/${this.selectedDetails.id}/`)
      .subscribe({
        next: () => {
          this.showConfirmDialog = false;
          this.toastService.showSuccess('JIC Tool deleted successfully');
          this.jicTool = this.jicTool.filter(
            (item) => item.id !== this.selectedDetails.id
          );
        },
        error: (error) => {
          console.error('Error deleting details:', error);
          this.toastService.showError('Failed to delete JIC Tool');
        },
      });
  }

  resetFilters() {
    this.searchText = '';
    resetFilterCards(this.cards, 'Maintop JIC', this.jicTool);
  }
  exportExcel() {
    this.exportService.exportExcel(this.cols, this.jicTool, this.tableName);
  }
  exportPDF() {
    this.exportService.exportPDF(this.cols, this.jicTool, this.tableName);
  }

  filterHeaders() {
    this.jicTool = filterData(this.jicTool, this.searchText, [
      'part_no',
      'description',
    ]);
  }
}
