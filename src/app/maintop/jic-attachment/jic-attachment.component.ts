import {
  Component,
  EventEmitter,
  Input,
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
import { CalendarModule } from 'primeng/calendar';
import { ListboxModule } from 'primeng/listbox';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TieredMenuModule } from 'primeng/tieredmenu';

import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../services/toast.service';
import { AddFormComponent } from '../../shared/components/add-form/add-form.component';
import { PaginatedTableComponent } from '../../shared/components/paginated-table/paginated-table.component';
import { ViewDetailsComponent } from '../../shared/components/view-details/view-details.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';

interface CardOption {
  label: string;
  value: any;
}

interface Card {
  label: string;
  selectedOption: any; // or more specific type if needed
  options: CardOption[];
}

@Component({
  selector: 'app-jic-attachment',
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
    ViewDetailsComponent,
    ToastComponent,
    ConfirmDialogComponent,
    AddFormComponent,
  ],
  templateUrl: './jic-attachment.component.html',
  styleUrl: './jic-attachment.component.css',
})
export class JicAttachmentComponent {
  isFormOpen: boolean = false;
  searchAmmendment: string = '';
  title: string = 'Add new JIC Attachment';
  isEditFormOpen: boolean = false;
  frequency = [];
  authority = [];
  ammendment = [];
  editTitle: string = 'Edit JIC Attachment';
  searchText: string = '';
  maintopDeatils: any = [];
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  deletedisplayModal: boolean = false;
  maintopJicAttachment: any[] = [];
  filteredmaintopJicAttachment: any[] = [];
  filteredAddresse: any[] = [];

  newDetails = {
    jic_maintop: '',
    jic_ammendment_no: '',
    file: '',
    active: 1,
  };

  selectedActiveStatus: number = 1;

  selectedDetails: any = {
    active: 1,
  };
  filteredDetails: any = [];
  // departments: any = [];
  // filteredDepartments: any = [];
  viewDetialsTitle: string = 'Addressee';
  isViewDetailsOpen: boolean = false;
  showConfirmDialog: boolean = false;
  filteredMaintopJic: any[] = [];

  onConfirmDelete(confirmed: boolean): void {
    if (confirmed) this.confirmDeletion();
    else this.showConfirmDialog = false;
  }
  formConfigForNewDetails = [
    {
      label: 'JIC Maintop',
      key: 'jic_maintop',
      type: 'select',
      options: this.filteredMaintopJic,
      required: true,
    },
    {
      label: 'JIC Ammendment No',
      key: 'jic_amendment_no',
      type: 'text',
      required: true,
    },
    {
      label: 'File',
      key: 'file',
      type: 'file',
      required: true,
    },
  ];
  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // this.getDetails();
    this.getMaintopDeatails();
  }
  getMaintopDeatails(): void {
    this.apiService.get<any[]>('maintop/maintop-jic/').subscribe({
      next: (data) => {
        //console.log(data);
        this.filteredMaintopJic = data.map((details: any) => ({
          label: details.brief_description,
          value: details.id,
        }));
        const maintopJicField = this.formConfigForNewDetails.find(
          (field) => field.key === 'jic_maintop'
        );

        if (maintopJicField) {
          maintopJicField.options = this.filteredMaintopJic;
        }
        const JICcommandCard = this.cards.find(
          (card) => card.label === 'Miantop JIC'
        );
        //console.log(JICcommandCard);
        if (JICcommandCard) {
          JICcommandCard.options = data.map((eq) => ({
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
  // getDetails(): void {
  //   this.apiService.get<any[]>('maintop/jic-attachment/').subscribe({
  //     next: (data) => {
  //       //console.log(data);
  //       this.maintopJicAttachment = data;
  //       this.filteredmaintopJicAttachment = [...this.maintopJicAttachment];

  //       // this.filteredAddresse = [...this.maintopJicAttachment];
  //       // this.filteredDetails = this.maintopDeatils;
  //     },
  //     error: (error) => {
  //       console.error('Error fetching maintop details:', error);
  //     },
  //   });
  // }

  handleSubmit(details: any) {
    if (!details.file) {
      this.toastService.showError('File is required');
      return;
    }

    const formData = new FormData();
    for (const key in details) {
      formData.append(key, details[key]);
    }
    formData.append('active', '1');

    this.apiService.post(`maintop/jic-attachment/`, formData).subscribe({
      next: (data: any) => {
        const maintop = this.filteredMaintopJic.find(
          (item) => item.value === data.jic_maintop
        );

        data.jic_maintop = {
          id: data.jic_maintop,
          brief_description: maintop ? maintop.label : 'Unknown',
        };

        this.maintopJicAttachment.unshift(data);
        this.toastService.showSuccess('Successfully added new JIC Attachment');
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError('Something went wrong');
      },
    });
  }

  viewDetails(address: any, open: boolean) {
    this.selectedDetails = address;
    this.isViewDetailsOpen = open;
  }
  editDetails(address: any, open: boolean) {
    this.selectedDetails = { ...address };
    //console.log(this.selectedDetails);
    this.isEditFormOpen = open;
  }
  cards: Card[] = [
    {
      label: 'Miantop JIC',
      selectedOption: null,
      options: [],
    },
  ];

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
      .get<any[]>(`maintop/jic-attachment/?dropdown=${true}`)
      .subscribe((headers) => {
        //console.log(headers);

        this.maintopJicAttachment = [...headers];
        //console.log(this.maintopJicAttachment);
      });
  }

  deleteDetails(address: any) {
    this.selectedDetails = address;
    this.showConfirmDialog = true;
  }
  confirmDeletion() {
    this.apiService
      .delete(`maintop/jic-attachment/${this.selectedDetails.id}/`)
      .subscribe({
        next: (data: any) => {
          this.showConfirmDialog = false;
          this.toastService.showSuccess('JIC Attachment deleted successfully');
          this.maintopJicAttachment = [
            ...this.filteredMaintopJic.filter(
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
        },
      });
  }
  resetFilters() {
    this.searchText = '';
    this.selectedDetails = {};

    this.newDetails = {
      jic_maintop: '',
      jic_ammendment_no: '',
      file: '',
      active: 1,
    };
    this.maintopJicAttachment = [];
    this.dt?.reset();
  }
  filterByField(fieldKey: string, id: any): void {
    //console.log(fieldKey, id);
    this.maintopJicAttachment = id
      ? this.filteredmaintopJicAttachment.filter(
          (item: any) => item[fieldKey]?.id === id
        )
      : [];
  }
  toggleForm(open: boolean) {
    this.isFormOpen = open;
  }
  handleEditSubmit(details: any) {
    if (!details.file) {
      this.toastService.showError('File is required for update');
      return;
    }

    const formData = new FormData();
    for (const key in details) {
      formData.append(key, details[key]);
    }
    formData.append('active', '1');

    this.apiService
      .put(`maintop/jic-attachment/${this.selectedDetails.id}/`, formData)
      .subscribe({
        next: (data: any) => {
          const maintop = this.filteredMaintopJic.find(
            (item) => item.value === data.jic_maintop
          );

          data.jic_maintop = {
            id: data.jic_maintop,
            brief_description: maintop ? maintop.label : 'Unknown',
          };

          const index = this.maintopJicAttachment.findIndex(
            (item) => item.id === data.id
          );
          if (index !== -1) {
            this.maintopJicAttachment[index] = data;
          }

          this.toastService.showSuccess('Successfully Updated JIC Attachment');
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Update failed');
        },
      });
  }

  cols = [
    { field: 'jic_maintop.brief_description', header: 'JIC Maintop' },
    { field: 'jic_amendment_no', header: 'JIC Ammendment No' },
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
  @ViewChild('dt') dt!: Table;
  value: number = 0;

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
      body: this.maintopJicAttachment.map((row: { [x: string]: any }) =>
        this.cols.map((col) => row[col.field] || '')
      ),
    });
    doc.save(`${this.tableName || 'table'}.pdf`); // ✅ Use backticks
  }
  @Input() tableName: string = '';
  exportExcel() {
    //console.log('Exporting as Excel...');
    // Your Excel export logic here
    this.exportCSVEvent.emit(); // Emit event instead of direct call
    const headers = this.cols.map((col) => col.header);
    const rows = this.maintopJicAttachment.map((row: { [x: string]: any }) =>
      this.cols.map((col) => row[col.field] || '')
    );
    const csv = [
      headers.join(','),
      ...rows.map((row: any[]) => row.join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.tableName || 'table'}.csv`; // ✅ Use backticks
    link.click();
    window.URL.revokeObjectURL(url);
  }
  // Search function
  filterDepartments() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.maintopJicAttachment = [...this.filteredAddresse]; // Reset to original list if search is empty
      return;
    }

    this.maintopJicAttachment = this.filteredAddresse.filter(
      (dept: { name: string; code: string }) =>
        dept.name.toLowerCase().includes(search) ||
        dept.code.toLowerCase().includes(search)
    );
  }
}
