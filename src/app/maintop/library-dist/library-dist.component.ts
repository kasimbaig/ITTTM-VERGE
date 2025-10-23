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
import { CalendarModule } from 'primeng/calendar';
import { ListboxModule } from 'primeng/listbox';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SelectButton } from 'primeng/selectbutton';
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
  selector: 'app-library-dist',
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
  templateUrl: './library-dist.component.html',
  styleUrl: './library-dist.component.css',
})
export class LibraryDistComponent {
  maintopDetail: any;
  isFormOpen: boolean = false;
  searchAmmendment: string = '';
  title: string = 'Add new Library Dist';
  isEditFormOpen: boolean = false;
  frequency = [];
  authority = [];
  ammendment = [];
  editTitle: string = 'Edit Library Dist';
  searchText: string = '';
  maintopDeatils: any = [];
  libraryDist: any[] = [];
  filteredAddresse: any[] = [];
  flteredLibraryDist: any = [];
  selectedDetailId: any;
  selectedAddresse: any;

  newDetails = {
    name: '',
    active: 1,
  };

  selectedActiveStatus: number = 1;

  selectedDetails: any = {
    active: 1,
  };
  filteredDetails: any = [];
  // departments: any = [];
  // filteredDepartments: any = [];
  viewDetialsTitle: string = 'Library Dist';
  isViewDetailsOpen: boolean = false;
  showConfirmDialog: boolean = false;
  filteredMiantopHeaders: any[] = [];
  filteredDepartment: any[] = [];

  onConfirmDelete(confirmed: boolean): void {
    if (confirmed) this.confirmDeletion();
    else this.showConfirmDialog = false;
  }
  formConfigForNewDetails = [
    {
      label: 'Maintop Header',
      key: 'maintop_header',
      type: 'select',
      options: this.filteredMiantopHeaders,
      required: true,
    },

    {
      label: 'Maintop_detail',
      key: 'maintop_detail',
      type: 'select',
      options: [],
      required: true,
    },
    {
      label: 'Addressee',
      key: 'addressee',
      type: 'select',
      options: [], // Will be populated on init
      required: true,
    },
    {
      label: 'Department',
      key: 'department',
      type: 'select',
      options: [],
      required: true,
    },
  ];
  viewDetailsConfig = [
    {
      label: 'Maintop_detail',
      key: 'maintop_detail',
      type: 'select',
      options: [],
      required: true,
    },
    {
      label: 'Addressee',
      key: 'addressee',
      type: 'select',
      options: [], // Will be populated on init
      required: true,
    },
  ];
  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.getAddresseeDetails();
    this.getMaintopHeaders();
    this.getDepartment();
    // this.getDetails();
  }

  cards: Card[] = [
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
    {
      label: 'Addrressee',
      selectedOption: null,
      options: [],
    },
    {
      label: 'Department',
      selectedOption: null,
      options: [],
    },
  ];

  applyFilter(card: any, value: any) {
    //console.log(card, value);
    switch (card) {
      case 'Maintop Header':
        this.onMaintopHeaderChange(value);
        break;
      case 'Maintop Detail':
        this.onMaintopDetailChange(value);
        break;
      case 'Addrressee':
        this.onAddrresseChange(value);
        break;
      case 'Department':
        this.onDepartmentChange(value);
    }
  }
  onMaintopHeaderChange(headerId: any) {
    //console.log('ekjdj00');
    this.apiService
      .get<any[]>(`maintop/maintop-detail/?maintop_header=${headerId}`)
      .subscribe((headers) => {
        //console.log(headers);
        const SFDcommandCard = this.cards.find(
          (card) => card.label === 'Maintop Detail'
        );
        //console.log(SFDcommandCard);
        if (SFDcommandCard) {
          SFDcommandCard.options = headers.map((eq) => ({
            label: eq.no,
            value: eq.id,
          }));
        }
      });
  }
  onMaintopDetailChange(detailId: any) {
    this.selectedDetailId = detailId;
    //console.log('ekjdj00');
    this.apiService
      .get<any[]>(`maintop/addressee/?dropdown=${true}`)
      .subscribe((headers) => {
        //console.log(headers);
        // this.libraryDist = headers;
        const commandCard = this.cards.find(
          (card) => card.label === 'Addrressee'
        );
        //console.log(commandCard);
        if (commandCard) {
          commandCard.options = headers.map((eq) => ({
            label: eq.name,
            value: eq.id,
          }));
        }
      });
  }
  onAddrresseChange(addrresseId: any) {
    //console.log('ekjdj00');
    this.selectedAddresse = addrresseId;
    this.apiService
      .get<any[]>(`master/department/?dropdown=${true}`)
      .subscribe((headers) => {
        //console.log(headers);

        const commandCard = this.cards.find(
          (card) => card.label === 'Department'
        );
        //console.log(commandCard);
        if (commandCard) {
          commandCard.options = headers.map((eq) => ({
            label: eq.name,
            value: eq.id,
          }));
        }
      });
  }
  onDepartmentChange(departmentId: any) {
    this.apiService
      .get<any[]>(
        `maintop/maintop-library-dist/?maintop_detail=${this.selectedDetailId}&addressee=${this.selectedAddresse}&department=${departmentId}`
      )
      .subscribe((headers) => {
        //console.log(headers);
        this.libraryDist = headers;
      });
  }
  resetFilters() {
    this.cards.forEach((card) => {
      card.selectedOption = null;
      if (card.label !== 'Maintop Header') {
        card.options = [];
      }
    });
    this.libraryDist = [];
  }

  getMaintopHeaders(): void {
    this.apiService.get<any[]>('maintop/maintop-header/').subscribe({
      next: (data) => {
        this.filteredMiantopHeaders = data.map((dept: any) => ({
          label: dept.code,
          value: dept.id,
        }));

        //console.log('Filtered Maintop Headers:', this.filteredMiantopHeaders);

        const maintopHeaderField = this.formConfigForNewDetails.find(
          (field) => field.key === 'maintop_header'
        );

        if (maintopHeaderField) {
          maintopHeaderField.options = this.filteredMiantopHeaders;
        }
        const HeadercommandCard = this.cards.find(
          (card) => card.label === 'Maintop Header'
        );
        //console.log(HeadercommandCard);
        if (HeadercommandCard) {
          HeadercommandCard.options = data.map((eq) => ({
            label: eq.code,
            value: eq.id,
          }));
        }
      },
      error: (error) => {
        console.error('Error fetching maintop details:', error);
      },
    });
  }

  getAddresseeDetails(): void {
    this.apiService.get<any[]>('maintop/addressee/').subscribe({
      next: (data) => {
        //console.log(data);

        // this.filteredDetails = this.maintopDeatils;

        this.filteredAddresse = data.map((details: any) => ({
          label: details.name,
          value: details.id,
        }));

        const maintopAddresseField = this.formConfigForNewDetails.find(
          (field) => field.key === 'addressee'
        );

        if (maintopAddresseField) {
          maintopAddresseField.options = this.filteredAddresse;
        }
      },
      error: (error) => {
        console.error('Error fetching maintop details:', error);
      },
    });
  }
  getDepartment(): void {
    this.apiService.get<any[]>('master/department/').subscribe({
      next: (data) => {
        //console.log(data);

        // this.filteredDetails = this.maintopDeatils;

        this.filteredDepartment = data.map((details: any) => ({
          label: details.name,
          value: details.id,
        }));

        const departmentField = this.formConfigForNewDetails.find(
          (field) => field.key === 'department'
        );

        if (departmentField) {
          departmentField.options = this.filteredDepartment;
        }
      },
      error: (error) => {
        console.error('Error fetching maintop details:', error);
      },
    });
  }

  // getDetails(): void {
  //   this.apiService.get<any[]>('maintop/maintop-library-dist/').subscribe({
  //     next: (data) => {
  //       //console.log(data);
  //       this.libraryDist = []; // 🧹 Clear before populating
  //       this.libraryDist = data;
  //       this.filteredAddresse = [...this.libraryDist];
  //     },
  //     error: (error) => {
  //       console.error('Error fetching maintop details:', error);
  //     },
  //   });
  // }

  handleSubmit(event: any): void {
    this.newDetails = { ...event, active: 1 };

    this.apiService
      .post('maintop/maintop-library-dist/', this.newDetails)
      .subscribe({
        next: (data: any) => {
          const newSpec = { ...this.newDetails, id: data.id };

          this.libraryDist.unshift(newSpec);

          this.toastService.showSuccess('Library Dist added successfully');
        },
        error: (error) => {
          console.error('Error:', error);
          alert('Failed to add Generic Specification');
        },
      });

    this.isFormOpen = false;
  }
  viewDetails(address: any, open: boolean) {
    this.selectedDetails = address;
    this.isViewDetailsOpen = open;
  }
  editDetails(address: any, open: boolean) {
    this.selectedDetails = { ...address };
    this.selectedDetails = {
      ...address,
      maintop_header:
        address.maintop_detail?.maintop_header?.id ||
        address.maintop_header?.id,
      maintop_detail: address.maintop_detail?.id,
    };

    //console.log(this.selectedDetails);
    this.isEditFormOpen = open;
  }

  deleteDetails(address: any) {
    this.selectedDetails = address;
    this.showConfirmDialog = true;
  }
  confirmDeletion() {
    this.apiService
      .delete(`maintop/maintop-library-dist/${this.selectedDetails.id}/`)
      .subscribe({
        next: (data: any) => {
          this.showConfirmDialog = false;
          this.toastService.showSuccess('Addressee deleted successfully');
          this.libraryDist = [
            ...this.libraryDist.filter(
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
  // resetFilters() {
  //   this.searchText = '';
  //   this.selectedDetails = {};

  //   this.newDetails = {
  //     name: '',
  //     active: 1,
  //   };

  //   this.dt?.reset();
  // }
  toggleForm(open: boolean) {
    this.isFormOpen = open;
  }
  handleEditSubmit(details: any) {
    this.selectedDetails = { ...this.selectedDetails, ...details };
    this.apiService
      .put(
        `maintop/maintop-library-dist/${this.selectedDetails.id}/`,
        this.selectedDetails
      )
      .subscribe({
        next: (data: any) => {
          this.toastService.showSuccess('Successfully Updated Addressee');
          const index = this.libraryDist.findIndex(
            (item: any) => item.id === data.id
          );

          if (index !== -1) {
            // Merge updated data into the original entry
            this.libraryDist[index] = {
              ...this.libraryDist[index],
              ...data,
            };
          }
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
    //console.log(this.selectedDetails);
  }
  cols = [
    { field: 'maintop_detail.no', header: 'Maintop Detail' },
    { field: 'addressee.name', header: 'Addrressee' },
    { field: 'department.name', header: 'Department' },
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
  stateOptions: any[] = [
    { label: 'Equipment Specification', value: 'equipment' },
    { label: 'HID Equipment', value: 'hid' },
    { label: 'Generic Specification', value: 'generic' },
  ];
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
      body: this.libraryDist.map((row: { [x: string]: any }) =>
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
    const rows = this.libraryDist.map((row: { [x: string]: any }) =>
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
      this.libraryDist = [...this.filteredAddresse]; // Reset to original list if search is empty
      return;
    }

    this.libraryDist = this.filteredAddresse.filter(
      (dept: { name: string; code: string }) =>
        dept.name.toLowerCase().includes(search) ||
        dept.code.toLowerCase().includes(search)
    );
  }
}
