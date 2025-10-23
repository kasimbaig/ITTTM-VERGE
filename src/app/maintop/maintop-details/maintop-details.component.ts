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
import { Dialog } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AddFormComponent } from '../../shared/components/add-form/add-form.component';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { forkJoin } from 'rxjs';
import { Card } from '../../interfaces/interfaces';
import { ExportService } from '../../services/export.service';
import { filterData } from '../../shared/utils/filter-helper';
import { resetFilterCards } from '../../shared/utils/filter-helper';
import { PaginatedTableComponent } from '../../shared/components/paginated-table/paginated-table.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ViewDetailsComponent } from '../../shared/components/view-details/view-details.component';

@Component({
  selector: 'app-maintop-details',
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
    PaginatedTableComponent,
    TieredMenuModule,
    DropdownModule,
    AddFormComponent,
    ToastComponent,
    ViewDetailsComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './maintop-details.component.html',
  styleUrl: './maintop-details.component.css',
})
export class MaintopDetailsComponent {
  @ViewChild('dt') dt!: Table;
  @Input() tableName: string = '';
  @Output() exportCSVEvent = new EventEmitter<void>();
  @Output() exportPDFEvent = new EventEmitter<void>();
  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private exportService: ExportService
  ) {}

  // -------------------- Properties --------------------

  maintopDetails: any = [];
  filteredDetails: any = [];
  filteredMaintopHeaders: any = [];
  filteredFrequencies: any = [];

  isViewDetailsOpen: boolean = false;
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  showConfirmDialog: boolean = false;

  selectedDetails: any = { active: 1 };
  newDetails = {
    active: 1,
  };

  searchText: string = '';
  viewDetialsTitle: string = 'Maintop Details';
  editTitle: string = 'Edit Maintop Details';
  title: string = 'Add new Maintop Details';

  cols = [
    { field: 'no', header: 'Number' },
    { field: 'group_heading', header: 'Group Heading' },
    { field: 'admin_remark', header: 'Remark' },
    { field: 'by_whom', header: 'BY WHOM' },
    { field: 'dock_yard_remark', header: 'Dock yard Remark' },
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

  applyFilter(card: any, value: any) {
    //console.log(card, value.value);
    switch (card) {
      case 'Maintop Header':
        this.onMaintopChange(value.value);
        break;
    }
  }
  cards: Card[] = [
    {
      label: 'Maintop Header',
      selectedOption: null,
      options: [],
    },
  ];
  onMaintopChange(headerId: any) {
    this.apiService
      .get<any>(`maintop/maintop-detail/?maintop_header=${headerId}`)
      .subscribe((headers) => {
        const maintopHeaderMap = this.filteredMaintopHeaders.reduce(
          (acc: any, header: any) => {
            acc[header.value] = header.label;
            return acc;
          },
          {}
        );

        const frequencyMap = this.filteredFrequencies.reduce(
          (acc: any, freq: any) => {
            acc[freq.value] = freq.label;
            return acc;
          },
          {}
        );

        this.maintopDetails = headers.results.map((item: any) => ({
          ...item,
          maintopHeaderTitle:
            maintopHeaderMap[item.maintop_header] || 'Unknown',
          frequencyName: frequencyMap[item.frequency] || 'Unknown',
        }));
      });
  }

  resetFilters() {
    this.searchText = '';
    resetFilterCards(this.cards, 'Maintop Header', this.maintopDetails);
  }

  ngOnInit(): void {
    forkJoin({
      maintopHeaders: this.apiService.get<any>('maintop/maintop-header'),
      frequencies: this.apiService.get<any>('master/frequency/'),
    }).subscribe({
      next: ({ maintopHeaders, frequencies }) => {
        this.filteredMaintopHeaders = maintopHeaders.results.map((dept: any) => ({
          label: dept.code,
          value: dept.id,
        }));

        const maintop_headerField = this.formConfigForNewDetails.find(
          (field) => field.key === 'maintop_header'
        );
        if (maintop_headerField) {
          maintop_headerField.options = this.filteredMaintopHeaders;
        }

        // Process Frequencies
        this.filteredFrequencies = frequencies.results.map((freq: any) => ({
          label: freq.name,
          value: freq.id,
        }));

        const frequencyField = this.formConfigForNewDetails.find(
          (field) => field.key === 'frequency'
        );
        if (frequencyField) {
          frequencyField.options = this.filteredFrequencies;
        }

        const headerCard = this.cards.find(
          (card) => card.label === 'Maintop Header'
        );
        if (headerCard) {
          headerCard.options = maintopHeaders.results.map((item: any) => ({
            label: item.code,
            value: item.id,
          }));
          //console.log(headerCard.options);
        }
      },

      error: (error) => {
        console.error('Error fetching data:', error);
      },
    });
  }

  formConfigForNewDetails = [
    { label: 'Number', key: 'no', type: 'text', required: true },

    {
      label: 'Admin Remark',
      key: 'admin_remark',
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
      label: 'Amendment Date',
      key: 'amendment_date',
      type: 'date',
      required: false,
    },
    {
      label: 'Maintop Header',
      key: 'maintop_header',
      type: 'select',
      options: this.filteredMaintopHeaders,
      required: true,
    },
    {
      label: 'Frequency',
      key: 'frequency',
      type: 'select',
      options: this.filteredFrequencies,
      required: false,
    },
    {
      label: 'Group Headeing',
      key: 'group_heading',
      type: 'text',
      required: false,
    },
    {
      label: 'Paragrapgh Heading',
      key: 'paragraph_heading',
      type: 'text',
      required: false,
    },

    {
      label: 'Alternate Number',
      key: 'alternate_no',
      type: 'text',
      required: false,
    },
    { label: 'By Whom', key: 'by_whom', type: 'text', required: true },
    { label: 'By Whom1', key: 'by_whom1', type: 'text', required: true },
    { label: 'By Whom2', key: 'by_whom2', type: 'text', required: true },
    { label: 'By Whom3', key: 'by_whom3', type: 'text', required: true },
    { label: 'Category', key: 'category', type: 'text', required: true },
    {
      label: 'Dockyard Remark',
      key: 'dock_yard_remark',
      type: 'text',
      required: true,
    },

    {
      label: 'Description',
      key: 'description',
      type: 'textarea',
      required: true,
    },
    {
      label: 'Brief Description',
      key: 'brief_description',
      type: 'textarea',
      required: true,
    },
  ];

  

  toggleForm(open: boolean) {
    this.isFormOpen = open;
  }

  

  handleSubmit(event: any) {
    this.newDetails = event;
    this.newDetails.active = 1;
    this.apiService.post(`maintop/maintop-detail/`, this.newDetails).subscribe({
      next: (data: any) => {
        //console.log(data);
        this.maintopDetails.unshift(data);
        this.newDetails = {active:0}
        this.toastService.showSuccess('Maintop details added Successfully');
        
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.toastService.showError('Invalid Credentails');
      },
    });
  }

  
  handleEditSubmit(data: any) {
    this.selectedDetails = { ...this.selectedDetails, ...data };
    this.apiService
      .put(
        `maintop/maintop-detail/${this.selectedDetails.id}/`,
        this.selectedDetails
      )
      .subscribe({
        next: (updatedItem: any) => {
          this.toastService.showSuccess('Updated Maintop detail');

          const index = this.maintopDetails.findIndex(
            (item: any) => item.id === updatedItem.id
          );
          if (index !== -1) {
            this.maintopDetails[index] = {
              ...updatedItem,
              maintopHeaderTitle:
                this.filteredMaintopHeaders.find(
                  (h: any) => h.value === updatedItem.maintop_header
                )?.label || 'Unknown',
              frequencyName:
                this.filteredFrequencies.find(
                  (f: any) => f.value === updatedItem.frequency
                )?.label || 'Unknown',
            };
          }

          this.isEditFormOpen = false;
        },

        error: (error) => {
          console.error('Error:', error);
          this.toastService.showError('Update Failed');
        },
      });
    //console.log(this.selectedDetails);
  }

  onConfirmDelete(confirmed: boolean): void {
    if (confirmed) this.confirmDeletion();
    else this.showConfirmDialog = false;
  }

  viewDetails(dept: any, open: boolean) {
    this.selectedDetails = {
      ...dept,
    };

    this.isViewDetailsOpen = open;
  }

  editDetails(details: any, open: boolean) {
    this.selectedDetails = { ...details };
    this.isEditFormOpen = open;
  }

  deleteDetails(details: any) {
    this.selectedDetails = { ...details };
    this.showConfirmDialog = true;
  }
  confirmDeletion() {
    this.apiService
      .delete(`maintop/maintop-detail/${this.selectedDetails.id}/`)
      .subscribe({
        next: (data: any) => {
          this.maintopDetails = this.maintopDetails.filter(
            (item: any) => item.id !== this.selectedDetails.id
          );
          this.toastService.showSuccess('Maintop Detail deleted successfully');
          this.showConfirmDialog = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.toastService.showError('Failed to delete');
        },
      });
  }

  exportPDF() {
    this.exportService.exportPDF(
      this.cols,
      this.maintopDetails,
      this.tableName
    );
  }
  exportExcel() {
    this.exportService.exportExcel(
      this.cols,
      this.maintopDetails,
      this.tableName
    );
  }

  filterHeaders() {
    this.maintopDetails = filterData(this.maintopDetails, this.searchText, [
      'admin_remark',
      'no',
    ]);
  }
}
