import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TieredMenuModule } from 'primeng/tieredmenu';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AddFormComponent } from '../../shared/components/add-form/add-form.component';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatedTableComponent } from '../../shared/components/paginated-table/paginated-table.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ViewDetailsComponent } from '../../shared/components/view-details/view-details.component';

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
  selector: 'app-transaction',
  imports: [
    TableModule,
    AddFormComponent,
    CommonModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    PaginatedTableComponent,
    TieredMenuModule,
    ToastComponent,
    ConfirmDialogComponent,
    DropdownModule,
    ViewDetailsComponent,
  ],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.css',
})
export class TransactionComponent {
  // Search and UI State
  searchText: string = '';
  isEditFormOpen: boolean = false;
  isFormOpen: boolean = false;
  showConfirmDialog: boolean = false;
  isViewDetailsOpen: boolean = false;
  // Data Variables
  transactions: any = [];
  filteredTransactions: any = [];
  filteredShips: any[] = [];
  filteredSFDHierarchy: any[] = [];
  filteredDetails: any[] = [];

  // Titles
  title: string = 'Add new HID Equipment';
  editTitle: string = 'Edit HID Equipment';
  viewDetialsTitle: string = 'HID Equipments';

  // Form Models
  newDetails = {
    equipment: null,
    sfd_hierarchy: null,
    active: 1,
  };

  selectedDetails: any = {
    equipment: null,
    sfd_hierarchy: null,
  };

  formConfigForNewDetails = [
    {
      label: 'Ship',
      key: 'ship',
      type: 'select',
      options: this.filteredShips,
      required: true,
    },
    {
      label: 'SFD Hierarchy',
      key: 'sfd_hierarchy',
      type: 'select',
      options: this.filteredSFDHierarchy,
      required: true,
    },
  ];

  // Table
  cols = [
    { field: 'equipment.name', header: 'Equipment Name' },
    { field: 'sfd_hierarchy.name', header: 'SFD Hierarchy' },
  ];
  @ViewChild('dt') dt!: Table;

  // Tabs
  stateOptions: any[] = [
    { label: 'Equipment Specification', value: 'equipment' },
    { label: 'HID Equipment', value: 'hid' },
    { label: 'Generic Specification', value: 'generic' },
  ];
  tabvalue: string = 'equipment';

  // Export
  @Input() tableName: string = '';
  @Output() exportCSVEvent = new EventEmitter<void>();
  @Output() exportPDFEvent = new EventEmitter<void>();

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
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  filterByField(fieldKey: string, id: any): void {
    if (id) {
      this.transactions = this.transactions.filter(
        (item: any) => item[fieldKey]?.id === id
      );
    } else {
      this.transactions = [];
    }
  }

  // Load data for dropdowns and table
  loadInitialData() {
    forkJoin({
      departments: this.apiService.get<any[]>('sfd/hid-equipment-details/'),
      ships: this.apiService.get<any[]>('master/ship/'),
      // details: this.apiService.get<any[]>(`maintop/maintop-detail/`),
      // transaction: this.apiService.get<any[]>('maintop/transactions/'),
    }).subscribe({
      next: (response) => {
        //console.log(response);
        // //console.log(response.transaction);
        this.filteredTransactions = response.departments;
        this.transactions = [];

        this.filteredShips = response.ships.map((item: any) => ({
          label: item.name,
          value: item.id,
        }));
        const equipmentField = this.formConfigForNewDetails.find(
          (field) => field.key === 'ship'
        );
        if (equipmentField) equipmentField.options = this.filteredShips;

        // this.filteredDetails = response.details.map((item: any) => ({
        //   label: item.name,
        //   value: item.id,
        // }));
        // const detailField = this.formConfigForNewDetails.find(
        //   (field) => field.key === 'maintop_detail'
        // );
        // if (equipmentField) equipmentField.options = this.filteredShips;

        // this.filteredSFDHierarchy = response.sfdHierarchy.map((item: any) => ({
        //   label: item.name,
        //   value: item.id,
        // }));
        const sfdHierarchyField = this.formConfigForNewDetails.find(
          (field) => field.key === 'sfd_hierarchy'
        );
        if (sfdHierarchyField)
          sfdHierarchyField.options = this.filteredSFDHierarchy;

        const shipCard = this.cards.find((card) => card.label === 'Ship');
        if (shipCard) {
          shipCard.options = response.ships.map((item: any) => ({
            label: item.name,
            value: item.id,
          }));
        }
      },
      error: (error) => console.error('Error loading data:', error),
    });
  }

  // Filtering Logic
  filterDepartments() {
    const search = this.searchText.toLowerCase().trim();
    if (!search) {
      this.transactions = [...this.filteredTransactions];
      return;
    }

    this.transactions = this.filteredTransactions.filter(
      (dept: { code: string; type: string }) =>
        dept.code.toLowerCase().includes(search) ||
        dept.type.toLowerCase().includes(search)
    );
  }

  // Form Handlers
  toggleForm(open: boolean) {
    this.isFormOpen = open;
  }
  cards: Card[] = [
    {
      label: 'Ship',
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

  handleSubmit(data: any) {
    const payload = { ...data, active: 1 };
    this.apiService.post('sfd/hid-equipment-details/', payload).subscribe({
      next: (response: any) => {
        const newRecord = {
          ...response,
          ship: {
            id: response.equipment,
            name:
              this.filteredShips.find((eq) => eq.value === response.equipment)
                ?.label || '',
          },

          sfd_hierarchy: {
            id: response.sfd_hierarchy,
            name:
              this.filteredSFDHierarchy.find(
                (sfd) => sfd.value === response.sfd_hierarchy
              )?.label || '',
          },
        };
        //console.log(newRecord);

        this.transactions.unshift(newRecord); // update your table data
        this.filteredTransactions = [...this.transactions];
        this.toastService.showSuccess('Successfully added new HID Equipment');
        this.toggleForm(false);
      },

      error: (error) => {
        console.error('Submission failed:', error);
        alert('Invalid submission');
      },
    });
  }

  applyFilter(card: any, value: any) {
    //console.log(card, value);
    switch (card) {
      case 'Ship':
        this.onShipChange(value);
        break;
      case 'Maintop Header':
        this.onMaintopHeaderChange(value);
        break;
      case 'Maintop Detail':
        this.onMaintopDetailChange(value);
    }
  }
  onShipChange(shipId: any) {
    this.apiService
      .get<any[]>(`maintop/maintop-header/?dropdown=${true}`)
      .subscribe((headers) => {
        const maintopHeaderCard = this.cards.find(
          (card) => card.label === 'Maintop Header'
        );
        if (maintopHeaderCard) {
          maintopHeaderCard.options = headers.map((item: any) => ({
            label: item.code,
            value: item.id,
          }));
        }
      });
  }
  onMaintopHeaderChange(headerId: any) {
    this.apiService
      .get<any[]>(
        `maintop/maintop-detail/?maintop_header=${headerId}&dropdown=${true}`
      )
      .subscribe((headers) => {
        //console.log(headers);
        const maintopDetailCard = this.cards.find(
          (card) => card.label === 'Maintop Detail'
        );
        if (maintopDetailCard) {
          maintopDetailCard.options = headers.map((header) => ({
            label: header.no,
            value: header.id,
          }));
        }
      });
  }

  onMaintopDetailChange(detailId: any) {
    this.apiService.get<any[]>(`maintop/transactions/`).subscribe((headers) => {
      //console.log(headers);
      this.transactions = headers;
    });
  }
  onEquipmentChange(equipmentId: any) {
    this.apiService
      .get<any[]>(`master/sfd-hierarchy/?dropdown=${true}`)
      .subscribe((headers) => {
        const sfdcommandCard = this.cards.find(
          (card) => card.label === 'SFD Hierarchy'
        );
        if (sfdcommandCard) {
          sfdcommandCard.options = headers.map((header) => ({
            label: header.name,
            value: header.id,
          }));
        }
      });
  }

  resetFilters() {
    this.cards.forEach((card) => {
      card.selectedOption = null;
      if (card.label !== 'Ship') {
        card.options = [];
      }
    });
    this.transactions = [];
  }

  handleEditSubmit(data: any) {
    const updated = { ...this.selectedDetails, ...data };

    const equipmentId =
      typeof updated.equipment === 'object'
        ? updated.equipment.id
        : updated.equipment;
    const sfdHierarchyId =
      typeof updated.sfd_hierarchy === 'object'
        ? updated.sfd_hierarchy.id
        : updated.sfd_hierarchy;

    this.apiService
      .put(`sfd/hid-equipment-details/${updated.id}/`, {
        ...data,
        equipment: equipmentId,
        sfd_hierarchy: sfdHierarchyId,
        modified_by: 1,
        modified_ip: '106.76.190.206',
      })
      .subscribe({
        next: (response: any) => {
          // 👇 just like handleSubmit - convert ID to object
          const updatedRecord = {
            ...response,
            ship: {
              id: response.equipment,
              name:
                this.filteredShips.find((eq) => eq.value === response.equipment)
                  ?.label || '',
            },
            sfd_hierarchy: {
              id: response.sfd_hierarchy,
              name:
                this.filteredSFDHierarchy.find(
                  (sfd) => sfd.value === response.sfd_hierarchy
                )?.label || '',
            },
          };

          // 👇 update the correct row in hidEquipments
          this.transactions = this.transactions.map((item: any) =>
            item.id === updated.id ? updatedRecord : item
          );

          this.filteredTransactions = [...this.transactions];
          this.toastService.showSuccess('Successfully updated HID Equipment');
          this.isEditFormOpen = false;
        },
        error: (error) => {
          console.error('Update failed:', error);
          alert('Invalid submission');
        },
      });
  }

  viewDetails(details: any, open: boolean) {
    this.isViewDetailsOpen = open;
    this.selectedDetails = details;
  }

  editDetails(details: any, open: boolean) {
    this.selectedDetails = { ...details };
    this.isEditFormOpen = open;
  }

  deleteDetails(details: any): void {
    this.selectedDetails = { ...details };
    this.showConfirmDialog = true;
  }

  onConfirmDelete(confirmed: boolean) {
    if (!confirmed) {
      this.showConfirmDialog = false;
      return;
    }

    this.apiService
      .delete(`sfd/hid-equipment-details/${this.selectedDetails.id}/`)
      .subscribe({
        next: () => {
          this.transactions = this.transactions.filter(
            (item: any) => item.id !== this.selectedDetails.id
          );
          this.toastService.showSuccess('HID Equipment deleted successfully');
          this.showConfirmDialog = false;
        },
        error: (error) => console.error('Deletion error:', error),
      });
  }

  // Export Features
  exportPDF() {
    this.exportPDFEvent.emit();
    const doc = new jsPDF();
    autoTable(doc, {
      head: [this.cols.map((col) => col.header)],
      body: this.transactions.map((row: any) =>
        this.cols.map((col) => row[col.field] || '')
      ),
    });
    doc.save(`${this.tableName || 'table'}.pdf`);
  }

  exportExcel() {
    this.exportCSVEvent.emit();
    const headers = this.cols.map((col) => col.header);
    const rows = this.transactions.map((row: any) =>
      this.cols.map((col) => row[col.field] || '')
    );
    const csv = [
      headers.join(','),
      ...rows.map((row: any) => row.join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.tableName || 'table'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
