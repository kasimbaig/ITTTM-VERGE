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
  selector: 'app-distribution-address',
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
  templateUrl: './distribution-address.component.html',
  styleUrl: './distribution-address.component.css',
})
export class DistributionAddressComponent {
  isFormOpen: boolean = false;
  searchAmmendment: string = '';
  title: string = 'Add new Distribution Address';
  isEditFormOpen: boolean = false;
  frequency = [];
  authority = [];
  ammendment = [];
  editTitle: string = 'Edit Distribution Address';
  searchText: string = '';
  maintopDeatils: any = [];
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  deletedisplayModal: boolean = false;
  maintopDistributionAddress: any[] = [];
  filteredAddresse: any[] = [];
  filteredDistAddresse: any[] = [];

  newDetails = {
    name: '',
    addresse: '',
    active: 1,
  };

  selectedActiveStatus: number = 1;

  selectedDetails: any = {
    active: 1,
  };
  filteredDetails: any = [];
  // departments: any = [];
  // filteredDepartments: any = [];
  viewDetialsTitle: string = 'Distribution Address';
  isViewDetailsOpen: boolean = false;
  showConfirmDialog: boolean = false;

  onConfirmDelete(confirmed: boolean): void {
    if (confirmed) this.confirmDeletion();
    else this.showConfirmDialog = false;
  }
  formConfigForNewDetails = [
    {
      label: 'Name',
      key: 'name',
      type: 'text',
    },
    {
      label: 'Addressee',
      key: 'addresse',
      type: 'select',
      options: this.filteredAddresse, // Will be populated on init
      required: true,
    },
  ];

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.getAddresseeDetails();
    // this.getDetails();
  }
  cards: Card[] = [
    {
      label: 'Addrressee',
      selectedOption: null,
      options: [],
    },
  ];

  applyFilter(card: any, value: any) {
    //console.log(card, value);
    switch (card) {
      case 'Addrressee':
        this.onAddresseChange(value);
        break;
    }
  }
  onAddresseChange(addresseeId: any) {
    //console.log('ekjdj00');
    this.apiService
      .get<any[]>(`maintop/distribution-address/?addresse=${addresseeId}`)
      .subscribe((headers) => {
        //console.log(headers);

        this.maintopDistributionAddress = headers.map((address: any) => {
          const matchingAddress = this.filteredAddresse.find(
            (filter: any) => filter.value === address.addresse
          );

          // Map `addresse` ID to the actual name from filteredAddresse
          return {
            ...address,
            addresse: matchingAddress
              ? matchingAddress.label
              : 'Unknown Address', // Fallback if no match
          };
        });
      });
  }

  resetFilters() {
    this.cards.forEach((card) => {
      card.selectedOption = null;
      if (card.label !== 'Addrressee') {
        card.options = [];
      }
    });
    this.maintopDistributionAddress = [];
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
          (field) => field.key === 'addresse'
        );

        if (maintopAddresseField) {
          maintopAddresseField.options = this.filteredAddresse;
        }

        const JICcommandCard = this.cards.find(
          (card) => card.label === 'Addrressee'
        );
        //console.log(JICcommandCard);
        if (JICcommandCard) {
          JICcommandCard.options = data.map((eq) => ({
            label: eq.name,
            value: eq.id,
          }));
        }
      },
      error: (error) => {
        console.error('Error fetching maintop details:', error);
      },
    });
  }
  getDetails(): void {
    this.apiService.get<any[]>('maintop/distribution-address/').subscribe({
      next: (data) => {
        //console.log(data);
        this.maintopDistributionAddress = data;

        this.filteredDistAddresse = [...this.maintopDistributionAddress];
      },
      error: (error) => {
        console.error('Error fetching maintop details:', error);
      },
    });
  }

  handleSubmit(details: any) {
    this.selectedDetails = { ...this.selectedDetails, ...details };

    this.apiService
      .post(`maintop/distribution-address/`, this.selectedDetails)
      .subscribe({
        next: (data: any) => {
          this.toastService.showSuccess('Successfully added new addressee');
          this.maintopDistributionAddress.unshift(data);
        },
        error: (error) => {
          console.error('Login failed:', error);
          alert('Invalid login credentials');
        },
      });
  }
  viewDetails(address: any, open: boolean) {
    this.selectedDetails = address;
    //console.log(this.selectedDetails);
    this.isViewDetailsOpen = open;
  }
  editDetails(address: any, open: boolean) {
    this.selectedDetails = { ...address };
    this.isEditFormOpen = open;
  }

  deleteDetails(address: any) {
    this.selectedDetails = address;
    this.showConfirmDialog = true;
  }
  confirmDeletion() {
    this.apiService
      .delete(`maintop/distribution-address/${this.selectedDetails.id}/`)
      .subscribe({
        next: (data: any) => {
          this.showConfirmDialog = false;
          this.toastService.showSuccess('Addressee deleted successfully');
          this.maintopDistributionAddress = [
            ...this.maintopDistributionAddress.filter(
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
  filterByField(fieldKey: string, id: any): void {
    this.maintopDeatils = id
      ? this.filteredDetails.filter((item: any) => item[fieldKey]?.id === id)
      : [];
  }

  toggleForm(open: boolean) {
    this.isFormOpen = open;
  }
  handleEditSubmit(details: any) {
    this.selectedDetails = { ...this.selectedDetails, ...details };
    this.apiService
      .put(
        `maintop/distribution-address/${this.selectedDetails.id}/`,
        this.selectedDetails
      )
      .subscribe({
        next: (data: any) => {
          this.toastService.showSuccess('Successfully Updated Addressee');
          const index = this.maintopDistributionAddress.findIndex(
            (item: any) => item.id === data.id
          );

          if (index !== -1) {
            // Merge updated data into the original entry
            this.maintopDistributionAddress[index] = {
              ...this.maintopDistributionAddress[index],
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
    { field: 'name', header: 'Name' },
    { field: 'addresse', header: 'Addrresse' },
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
      body: this.maintopDistributionAddress.map((row: { [x: string]: any }) =>
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
    const rows = this.maintopDistributionAddress.map(
      (row: { [x: string]: any }) =>
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
      this.maintopDistributionAddress = [...this.maintopDistributionAddress]; // Reset to original list if search is empty
      return;
    }

    this.maintopDistributionAddress = this.maintopDistributionAddress.filter(
      (dept: { name: string; code: string }) =>
        dept.name.toLowerCase().includes(search) ||
        dept.code.toLowerCase().includes(search)
    );
  }
}
