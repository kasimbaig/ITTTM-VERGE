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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AddFormComponent } from '../../shared/components/add-form/add-form.component';
import { forkJoin } from 'rxjs';
import { Card, HeaderItem } from '../../interfaces/interfaces';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../services/toast.service';
import { ExportService } from '../../services/export.service';
import { filterData } from '../../shared/utils/filter-helper';
import { resetFilterCards } from '../../shared/utils/filter-helper';
import { formatDate } from '../../shared/utils/filter-helper';
import { PaginatedTableComponent } from '../../shared/components/paginated-table/paginated-table.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ViewDetailsComponent } from '../../shared/components/view-details/view-details.component';
@Component({
  selector: 'app-maintop-header',
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
    PaginatedTableComponent,
    DropdownModule,
    AddFormComponent,
    ToastComponent,
    ConfirmDialogComponent,
    ViewDetailsComponent,
  ],
  templateUrl: './maintop-header.component.html',
  styleUrl: './maintop-header.component.css',
})
export class MaintopHeaderComponent implements OnInit {
  @Input() tableName: string = '';
  @ViewChild('dt') dt!: Table;
  @Output() exportCSVEvent = new EventEmitter<void>();
  @Output() exportPDFEvent = new EventEmitter<void>();

  searchText: string = '';
  maintopHeaders: any[] = [];
  filteredMaintopHeaders: any[] = [];
  selectedDate: Date | null = null;
  filteredDepartments: any[] = [];
  filteredEquipments: any[] = [];
  selectedDetails: any = {};
  newDetails = {};

  isFormOpen = false;
  isEditFormOpen = false;
  isViewDetailsOpen = false;
  showConfirmDialog = false;

  editTitle = 'Edit Maintop Header';
  title = 'Add Maintop Header';
  viewDetialsTitle = 'Maintop Headers';

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private exportService: ExportService
  ) {}

  formConfigForNewDetails: any[] = [
    { label: 'Code', key: 'code', type: 'text', required: true },
    { label: 'Number', key: 'no', type: 'text', required: true },
    { label: 'Title', key: 'title', type: 'text', required: true },
    { label: 'Original Date', key: 'original_date', type: 'date' },
    { label: 'Amendment Number', key: 'amendment_number', type: 'text' },
    { label: 'Amendment Date', key: 'amendment_date', type: 'date' },
    { label: 'Authority', key: 'authority', type: 'text', required: true },
    { label: 'Reference', key: 'reference', type: 'text' },
    {
      label: 'Department',
      key: 'department',
      type: 'select',
      options: [],
      required: true,
    },
    {
      label: 'Equipment',
      key: 'equipment',
      type: 'select',
      options: [],
    },
    { label: 'Document', key: 'document', type: 'file' },
    { label: 'Issue Date', key: 'issue_date', type: 'date' },
    { label: 'FUSS ID', key: 'fuss_id', type: 'text' },
    { label: 'Flag', key: 'flag', type: 'checkbox' },
    { label: 'Is Non-Digital', key: 'is_non_digital', type: 'checkbox' },
    { label: 'Reason', key: 'reason', type: 'textarea' },
  ];

  cols = [
    { field: 'code', header: 'Code' },
    { field: 'title', header: 'Title' },
    { field: 'original_date', header: 'Original Date' },
    { field: 'amendment_number', header: 'Amendment No' },
    { field: 'authority', header: 'Authority' },
  ];

  cards: Card[] = [
    {
      label: 'Equipment',
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

  ngOnInit(): void {
    forkJoin({
      departments: this.apiService.get<any>('master/department/'),
      equipments: this.apiService.get<any>('master/equipment/'),
    }).subscribe({
      next: ({ departments, equipments }) => {
        this.filteredDepartments = departments.results.map((d: any) => ({
          label: d.name,
          value: d.id,
        }));
        this.filteredEquipments = equipments.results.map((e: any) => ({
          label: e.name,
          value: e.id,
        }));

        this.updateFormConfigOptions('department', this.filteredDepartments);
        this.updateFormConfigOptions('equipment', this.filteredEquipments);

        const equipmentcommandCard = this.cards.find(
          (card) => card.label === 'Equipment'
        );
        if (equipmentcommandCard) {
          equipmentcommandCard.options = equipments.results.map((eq: any) => ({
            label: eq.name,
            value: eq.id,
          }));
        }
      },
      error: (err) => console.error('Error loading data:', err),
    });
  }

  updateFormConfigOptions(key: string, options: any[]) {
    const field = this.formConfigForNewDetails.find((f) => f.key === key);
    if (field) field.options = options;
  }

  applyFilter(card: any, value: any) {
    //console.log(card, value);
    switch (card) {
      case 'Equipment':
        this.onEquipmentChange(value.value);
        break;
    }
  }
  onEquipmentChange(equipmentId: any) {
    this.apiService
      .get<any>(`maintop/maintop-header/?equipment=${equipmentId}`)
      .subscribe((headers) => {
        //console.log(headers);
        //console.log(this.maintopHeaders);

        this.maintopHeaders = headers.results;
        //console.log(this.maintopHeaders);
      });
  }

  resetFilters() {
    this.searchText = '';
    resetFilterCards(this.cards, 'Equipment', this.maintopHeaders);
  }

  handleSubmit(formValues: any) {
    formValues.active = 1;

    if (!formValues.document) {
      this.toastService.showError('Document is required');
      return;
    }

    const formData = this.buildFormData(formValues);

    if (formValues.document instanceof File) {
      formData.append(
        'document',
        formValues.document,
        formValues.document.name
      );
    }

    this.apiService.post('maintop/maintop-header/', formData).subscribe({
      next: (data) => {
        this.addNewHeader(data as HeaderItem);
        //console.log(data);
      },
      error: (err) => this.handleError(err, 'Upload failed'),
    });
  }
  buildFormData(formValues: any): FormData {
    const formData = new FormData();

    for (const key in formValues) {
      if (formValues.hasOwnProperty(key)) {
        formData.append(key, formValues[key]);
      }
    }

    return formData;
  }
  handleEditSubmit(data: any) {
    if (!data.document) {
      this.toastService.showError('Document is required');
      return;
    }
    //console.log(this.selectedDetails);
    this.selectedDetails = { ...this.selectedDetails, ...data };

    const hasNewDocument = this.selectedDetails.document instanceof File;
    const payload = hasNewDocument
      ? this.buildFormData(this.selectedDetails)
      : { ...this.selectedDetails };

    this.apiService
      .put(`maintop/maintop-header/${this.selectedDetails.id}/`, payload)
      .subscribe({
        next: (data) => {
          this.toastService.showSuccess('Updated header successfully');
          this.isEditFormOpen = false;
        },
        error: (err) => this.handleError(err, 'Update failed'),
      });
  }

  addNewHeader(data: HeaderItem) {
    if (!data['equipment']?.group?.section?.department) {
      this.apiService
        .get<HeaderItem>(`maintop/maintop-header/${data['id']}/`)
        .subscribe((fullData) => {
          const formattedItem: HeaderItem = {
            ...fullData,
            original_date: formatDate(fullData.original_date),
            amendment_date: formatDate(fullData.amendment_date),
            issue_date: formatDate(fullData.issue_date),
          };
          this.toastService.showSuccess('Sucessfully added new header');
          this.maintopHeaders.unshift(formattedItem);
        });
      return;
    }

    // Option 2: Proceed if structure is valid
    const formattedItem: HeaderItem = {
      ...data,
      original_date: formatDate(data.original_date),
      amendment_date: formatDate(data.amendment_date),
      issue_date: formatDate(data.issue_date),
    };
    this.maintopHeaders.unshift(formattedItem);
    this.toastService.showSuccess('Added header successfully');
  }

  handleError(error: any, message: string) {
    console.error(message, error);
    this.toastService.showError(`${message}. Please try again.`);
  }

  toggleForm(open: boolean) {
    this.isFormOpen = open;
  }

  viewDetails(details: any, open: boolean) {
    this.selectedDetails = { ...details };
    this.selectedDetails.department =
      this.selectedDetails.equipment.group.section.department.name;
    this.isViewDetailsOpen = open;
  }

  editDetails(header: any, open: boolean) {
    this.selectedDetails = { ...header };
    this.selectedDetails.department =
      this.selectedDetails?.equipment?.group?.section?.department?.id ?? null; 
      //console.log("check",this.selectedDetails.department)
    this.isEditFormOpen = open;
  }

  deleteDetails(dept: any) {
    this.selectedDetails = dept;
    this.showConfirmDialog = true;
  }
  onConfirmDelete(confirmed: boolean): void {
    if (confirmed) this.confirmDeletion();
    else this.showConfirmDialog = false;
  }

  confirmDeletion() {
    if (!this.selectedDetails.id) return;
    this.apiService
      .delete(`maintop/maintop-header/${this.selectedDetails.id}/`)
      .subscribe({
        next: () => {
          this.maintopHeaders = this.maintopHeaders.filter(
            (item) => item.id !== this.selectedDetails.id
          );
          this.toastService.showSuccess('Maintop Header deleted successfully');
          this.showConfirmDialog = false;
        },
        error: (err) => console.error('Delete failed:', err),
      });
  }

  filterHeaders() {
    this.maintopHeaders = filterData(this.maintopHeaders, this.searchText, [
      'title',
      'code',
    ]);
  }

  exportExcel() {
    this.exportService.exportExcel(
      this.cols,
      this.maintopHeaders,
      this.tableName
    );
  }
  exportPDF() {
    this.exportService.exportPDF(
      this.cols,
      this.maintopHeaders,
      this.tableName
    );
  }
}
